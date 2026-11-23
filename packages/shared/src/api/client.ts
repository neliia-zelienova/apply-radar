import type { Application, Interview } from "../types/application";
import type { AvatarSettings } from "../types/avatar";

/**
 * Framework-free client for the Apply Radar API, shared by the extension and
 * the web app. Each app decides where the access token lives (`TokenStore`).
 *
 * - Sends cookies (`credentials: "include"`) so the HttpOnly refresh cookie works.
 * - On a 401 it refreshes the access token once (single flight) and retries.
 * - Always sends `x-ar-ext: 1`, which the API requires on /auth/refresh (CSRF).
 */

export interface TokenStore {
  get(): string | null | Promise<string | null>;
  set(token: string | null): void | Promise<void>;
}

export interface ApiClientOptions {
  baseUrl: string;
  tokens: TokenStore;
  /** Called when the session can't be refreshed (user must sign in again). */
  onSessionExpired?: () => void;
  fetch?: typeof fetch;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown, message?: string) {
    super(message ?? ApiError.messageFrom(status, body));
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }

  private static messageFrom(status: number, body: unknown): string {
    if (body && typeof body === "object" && "message" in body) {
      const { message } = body as { message: unknown };
      if (Array.isArray(message)) return message.join(", ");
      if (typeof message === "string") return message;
    }
    return status === 0 ? "Can't reach the server" : `Request failed (${status})`;
  }
}

/** An interview as sent to the API; without `id` the API assigns one. */
export type InterviewInput = Omit<Interview, "id"> & { id?: string };

/** Fields the API accepts for an application (create/update). */
export type ApplicationInput = Partial<
  Pick<
    Application,
    | "id"
    | "name"
    | "position"
    | "description"
    | "status"
    | "url"
    | "notes"
    | "favorite"
    | "archived"
    | "createdAt"
  >
> & { interviews?: InterviewInput[] };

const PAGE_SIZE = 100; // API maximum

export const createApiClient = (options: ApiClientOptions) => {
  const baseUrl = options.baseUrl.replace(/\/+$/, "");
  const doFetch = options.fetch ?? globalThis.fetch.bind(globalThis);
  let refreshing: Promise<string> | null = null;

  const send = async (
    path: string,
    init: { method?: string; body?: unknown } = {},
    token?: string | null,
  ): Promise<Response> => {
    try {
      return await doFetch(`${baseUrl}${path}`, {
        method: init.method ?? "GET",
        credentials: "include",
        headers: {
          "x-ar-ext": "1",
          ...(init.body !== undefined && { "Content-Type": "application/json" }),
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      });
    } catch (error) {
      // Network failure / CORS / server down
      throw new ApiError(0, error, "Can't reach the server");
    }
  };

  const parse = async (response: Response): Promise<unknown> => {
    const text = await response.text();
    if (!text) return undefined;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  };

  /**
   * Gets a new access token from the refresh cookie (shared by the extension and
   * the web app in the same browser). Concurrent callers share one request.
   * If it fails, the token is cleared; `onSessionExpired` fires only if there was
   * a session to lose (not when merely checking while signed out).
   */
  const refresh = (): Promise<string> => {
    refreshing ??= (async () => {
      const response = await send("/auth/refresh", { method: "POST" });
      const body = (await parse(response)) as { access_token?: string } | undefined;
      if (!response.ok || !body?.access_token) {
        const hadSession = !!(await options.tokens.get());
        await options.tokens.set(null);
        if (hadSession) options.onSessionExpired?.();
        throw new ApiError(response.status, body);
      }
      await options.tokens.set(body.access_token);
      return body.access_token;
    })().finally(() => {
      refreshing = null;
    });
    return refreshing;
  };

  /** Authenticated JSON request with one refresh-and-retry on 401. */
  const request = async <T>(
    path: string,
    init: { method?: string; body?: unknown } = {},
  ): Promise<T> => {
    let response = await send(path, init, await options.tokens.get());

    if (response.status === 401) {
      let token: string;
      try {
        token = await refresh();
      } catch {
        throw new ApiError(401, await parse(response));
      }
      response = await send(path, init, token);
    }

    const body = await parse(response);
    if (!response.ok) throw new ApiError(response.status, body);
    return body as T;
  };

  type ListPage = {
    data: Array<{ application: unknown }>;
    meta: { hasNext: boolean };
  };

  const listPages = async (archived: boolean): Promise<Application[]> => {
    const result: Application[] = [];
    for (let page = 1; ; page++) {
      const { data, meta } = await request<ListPage>(
        `/application?include=interviews&archived=${archived}&limit=${PAGE_SIZE}&page=${page}`,
      );
      result.push(...data.map((row) => fromApiApplication(row.application)));
      if (!meta?.hasNext) return result;
    }
  };

  return {
    /** Exchanges a Google ID token for an access token (and refresh cookie). */
    async googleSignIn(idToken: string): Promise<string> {
      const response = await send("/auth/google", {
        method: "POST",
        body: { idToken },
      });
      const body = (await parse(response)) as { access_token?: string } | undefined;
      if (!response.ok || !body?.access_token) {
        throw new ApiError(response.status, body);
      }
      await options.tokens.set(body.access_token);
      return body.access_token;
    },

    refresh,

    /** Forgets the access token and asks the API to clear the refresh cookie. */
    async logout(): Promise<void> {
      await options.tokens.set(null);
      try {
        await send("/auth/logout", { method: "POST" });
      } catch {
        // Offline: the token is gone locally; the cookie just expires on its own.
      }
    },

    applications: {
      /** All of the user's applications (active and archived), with interviews. */
      async list(): Promise<Application[]> {
        const [active, archived] = await Promise.all([
          listPages(false),
          listPages(true),
        ]);
        return [...active, ...archived];
      },
      async create(input: ApplicationInput): Promise<Application> {
        return fromApiApplication(
          await request("/application", { method: "POST", body: toApiInput(input) }),
        );
      },
      async update(id: string, input: ApplicationInput): Promise<Application> {
        const { id: _ignored, ...rest } = input;
        void _ignored;
        return fromApiApplication(
          await request(`/application/${id}`, {
            method: "PATCH",
            body: toApiInput(rest),
          }),
        );
      },
      async remove(id: string): Promise<void> {
        await request(`/application/${id}`, { method: "DELETE" });
      },
    },

    async deleteAccount(): Promise<void> {
      await request("/users/me", { method: "DELETE" });
    },

    users: {
      /** Saved avatar settings, or null if the user hasn't picked one yet. */
      async getAvatar(): Promise<AvatarSettings | null> {
        const body = await request<{ avatar: AvatarSettings | null }>("/users/me");
        return body?.avatar ?? null;
      },
      async setAvatar(avatar: AvatarSettings): Promise<AvatarSettings> {
        const body = await request<{ avatar: AvatarSettings }>("/users/me/avatar", {
          method: "PUT",
          body: {
            source: avatar.source,
            icon: avatar.icon,
            color: avatar.color,
            background: avatar.background,
          },
        });
        return body.avatar;
      },
    },
  };
};

export type ApiClient = ReturnType<typeof createApiClient>;

// ---------------------------------------------------------------------------
// Wire format <-> shared model
// ---------------------------------------------------------------------------

type Raw = Record<string, unknown>;

const str = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const isoString = (value: unknown): string =>
  typeof value === "string" ? value : new Date(value as string).toISOString();

/** Drops undefined/null values so optional fields stay absent. */
const compact = <T extends object>(value: T): T =>
  Object.fromEntries(
    Object.entries(value).filter(([, v]) => v !== undefined && v !== null),
  ) as T;

export const fromApiInterview = (raw: unknown): Interview => {
  const r = raw as Raw;
  return compact({
    id: String(r.id),
    scheduledAt: isoString(r.scheduledAt),
    notes: str(r.notes),
    name: str(r.name),
    locationLink: str(r.locationLink),
    createdAt: r.createdAt ? isoString(r.createdAt) : undefined,
    updatedAt: r.updatedAt ? isoString(r.updatedAt) : undefined,
  });
};

export const fromApiApplication = (raw: unknown): Application => {
  const r = raw as Raw;
  return compact({
    id: String(r.id),
    name: String(r.name ?? ""),
    position: str(r.position),
    description: str(r.description),
    url: String(r.url ?? ""),
    notes: str(r.notes),
    status: r.status as Application["status"],
    archived: r.archived === true,
    favorite: r.favorite === true,
    createdAt: isoString(r.createdAt),
    updatedAt: isoString(r.updatedAt),
    interviewCount: typeof r.interviewCount === "number" ? r.interviewCount : undefined,
    interviews: Array.isArray(r.interviews)
      ? r.interviews.map(fromApiInterview)
      : undefined,
  });
};

/** Only the fields the API's DTO declares; client-only extras are dropped. */
const toApiInput = (input: ApplicationInput): Raw =>
  compact({
    id: input.id,
    name: input.name,
    position: input.position,
    description: input.description,
    status: input.status,
    url: input.url,
    notes: input.notes,
    favorite: input.favorite,
    archived: input.archived,
    createdAt: input.createdAt,
    interviews: input.interviews?.map((iv) =>
      compact({
        id: iv.id,
        scheduledAt: iv.scheduledAt,
        notes: iv.notes,
        name: iv.name,
        locationLink: iv.locationLink,
      }),
    ),
  });
