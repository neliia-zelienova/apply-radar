import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { google } from 'googleapis';
import { UsersService } from 'src/users/users.service';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { StringValue } from 'ms';

@Injectable()
export class AuthService {
  private client: InstanceType<typeof google.auth.OAuth2>;
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    // Fail fast so misconfiguration is obvious at startup, not at first login.
    this.client = new google.auth.OAuth2(this.getGoogleClientId());
  }

  private getGoogleClientId() {
    // Prefer ConfigService (keeps behavior consistent across env sources).
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (!clientId) {
      throw new Error('Missing GOOGLE_CLIENT_ID env var');
    }
    return clientId;
  }

  private get cookieName() {
    return this.configService.get<string>('REFRESH_COOKIE_NAME') ?? 'ar_rt';
  }

  private get csrfHeaderName() {
    return (
      this.configService.get<string>('REFRESH_CSRF_HEADER_NAME') ?? 'x-ar-ext'
    ).toLowerCase();
  }

  private get csrfHeaderValue() {
    return this.configService.get<string>('REFRESH_CSRF_HEADER_VALUE') ?? '1';
  }

  private getRefreshSecret() {
    const secret =
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('Missing JWT_SECRET (or JWT_REFRESH_SECRET) env var');
    }
    return secret;
  }

  private getAccessExpiresIn() {
    return (this.configService.get<string>('JWT_EXPIRES_IN') ??
      '1h') as StringValue;
  }

  private getRefreshExpiresIn() {
    return (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ??
      '30d') as StringValue;
  }

  private buildRefreshCookie(token: string) {
    // Extension + API are different origins, so we need SameSite=None.
    const maxAgeSeconds = this.parseDurationToSeconds(
      this.getRefreshExpiresIn(),
    );

    const parts = [
      `${this.cookieName}=${encodeURIComponent(token)}`,
      'HttpOnly',
      'Path=/',
      'SameSite=None',
      // Browsers require Secure when SameSite=None.
      // This means refresh cookies won't be set over plain HTTP in dev.
      // Use HTTPS locally (see README) or a reverse proxy.
      'Secure',
      `Max-Age=${maxAgeSeconds}`,
    ];

    return parts.join('; ');
  }

  private parseDurationToSeconds(input: string): number {
    // Supports typical ms formats like: 15m, 1h, 7d as well as raw seconds.
    const trimmed = input.trim();
    const asNumber = Number(trimmed);
    if (Number.isFinite(asNumber)) return Math.max(0, Math.floor(asNumber));

    const m = /^([0-9]+)\s*(s|m|h|d)$/i.exec(trimmed);
    if (!m) return 60 * 60 * 24 * 30; // default 30d
    const value = Number(m[1]);
    const unit = m[2].toLowerCase();
    const mult =
      unit === 's' ? 1 : unit === 'm' ? 60 : unit === 'h' ? 3600 : 86400;
    return value * mult;
  }

  private getCookie(req: Request, name: string): string | null {
    const header = req.headers?.cookie;
    if (!header) return null;
    const cookies = header.split(';').map((c) => c.trim());
    for (const c of cookies) {
      if (!c) continue;
      const idx = c.indexOf('=');
      if (idx === -1) continue;
      const key = c.slice(0, idx).trim();
      if (key !== name) continue;
      return decodeURIComponent(c.slice(idx + 1));
    }
    return null;
  }

  async validateGoogleToken(idToken: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: idToken,
        audience: this.getGoogleClientId(),
      });
      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid token');
      }
      return {
        userId: payload['sub'],
        email: payload['email'],
        name: payload['name'],
        picture: payload['picture'],
      };
    } catch (error) {
      console.error('Error validating Google token:', error);
      return null;
    }
  }

  async googleLogin(idToken: string) {
    const userData = await this.validateGoogleToken(idToken);
    if (!userData) {
      throw new UnauthorizedException('Invalid token');
    }

    const user = await this.usersService.createUser(userData.userId);

    const payload = {
      sub: user.id,
      // Keep backward compatibility with the extension's current decoding logic.
      userId: user.id,
      email: userData.email,
      name: userData.name,
      picture: userData.picture,
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: this.getAccessExpiresIn(),
    });

    const refresh_token = this.jwtService.sign(
      { sub: user.oauthId, type: 'refresh' },
      {
        secret: this.getRefreshSecret(),
        expiresIn: this.getRefreshExpiresIn(),
      },
    );

    return {
      access_token,
      refresh_cookie: this.buildRefreshCookie(refresh_token),
    };
  }

  async refresh(req: Request) {
    // CSRF hardening: require a header that browsers can't attach via plain HTML forms.
    // The extension will always send it from XHR/fetch.
    const headerValue =
      (req.headers as any)?.[this.csrfHeaderName] ??
      (req.headers as any)?.[this.csrfHeaderName.toLowerCase()];
    if (headerValue !== this.csrfHeaderValue) {
      throw new UnauthorizedException('Missing refresh CSRF header');
    }

    const token = this.getCookie(req, this.cookieName);
    if (!token) {
      throw new UnauthorizedException('Missing refresh token');
    }

    let decoded: any;
    try {
      decoded = await this.jwtService.verifyAsync(token, {
        secret: this.getRefreshSecret(),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!decoded?.sub || decoded?.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Optional: ensure user still exists.
    // (Not storing refresh tokens in DB means we can't revoke a single device,
    // but we can still reject unknown/deleted users.)
    const user = await this.usersService
      .findUserByOauthId(decoded.sub)
      .catch(() => null);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = {
      sub: user.id,
      userId: user.id,
      // These fields may be nullable depending on your schema; include them if present.
      email: (user as any).email,
      name: (user as any).name,
      picture: (user as any).picture,
    };

    const access_token = this.jwtService.sign(payload, {
      expiresIn: this.getAccessExpiresIn(),
    });

    // Stateless refresh-token rotation (best effort). Without DB storage we can't detect reuse,
    // but rotating still reduces the window if an attacker steals an older token.
    const refresh_token = this.jwtService.sign(
      { sub: user.oauthId, type: 'refresh' },
      {
        secret: this.getRefreshSecret(),
        expiresIn: this.getRefreshExpiresIn(),
      },
    );

    return {
      access_token,
      refresh_cookie: this.buildRefreshCookie(refresh_token),
    };
  }
}
