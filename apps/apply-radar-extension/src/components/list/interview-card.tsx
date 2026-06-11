import type { Interview } from "../../types/applications";
import { useThemeContext } from "../../context/theme-context";

interface InterviewCardProps {
  interview: Interview;
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
}

const formatRelative = (dateStr: string) => {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = target - now;
  const abs = Math.abs(diff);
  const minutes = Math.round(abs / 60000);
  const hours = Math.round(abs / 3600000);
  const days = Math.round(abs / 86400000);
  if (minutes < 60) return diff >= 0 ? `in ${minutes}m` : `${minutes}m ago`;
  if (hours < 24) return diff >= 0 ? `in ${hours}h` : `${hours}h ago`;
  return diff >= 0 ? `in ${days}d` : `${days}d ago`;
};

const isProbablyUrl = (value: string) => {
  const v = value.trim();
  if (!v) return false;
  return /^(https?:\/\/)/.test(v) || /\.[a-z]{2,}$/i.test(v) || /\//.test(v);
};

const ensureHref = (value: string) => {
  const v = value.trim();
  if (/^(https?:\/\/)/.test(v)) return v;
  return isProbablyUrl(v) ? `https://${v}` : v;
};

export const InterviewCard = ({
  interview,
  handleEdit,
  handleDelete,
}: InterviewCardProps) => {
  const { theme } = useThemeContext();
  const dark = theme === "dark";

  const isUpcoming = new Date(interview.date).getTime() >= Date.now();
  const cfg = isUpcoming
    ? {
        label: "UPCOMING",
        color: "#14b8a6",
        border: "rgba(20,184,166,0.4)",
        bg: "rgba(20,184,166,0.06)",
      }
    : {
        label: "PAST",
        color: "#64748b",
        border: "rgba(100,116,139,0.3)",
        bg: "rgba(100,116,139,0.04)",
      };

  return (
    <li
      style={{
        position: "relative",
        borderRadius: "8px",
        overflow: "hidden",
        border: `1px solid ${dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)"}`,
        background: dark ? "rgba(255,255,255,0.02)" : "#fff",
        padding: "10px 12px 10px 16px",
        animation: "fade-in 0.2s ease",
        listStyle: "none",
      }}
    >
      {/* Left accent bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "3px",
          height: "100%",
          background: cfg.color,
          opacity: isUpcoming ? 0.8 : 0.3,
        }}
      />

      {/* Header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "6px",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: dark ? "#e2e8f0" : "#0f172a",
          }}
        >
          {interview.name || "Interview"}
        </span>
        <span
          style={{
            fontSize: "10px",
            fontWeight: 700,
            letterSpacing: "0.06em",
            padding: "1px 6px",
            borderRadius: "4px",
            border: `1px solid ${cfg.border}`,
            color: cfg.color,
            background: cfg.bg,
          }}
        >
          {cfg.label}
        </span>
        <div style={{ marginLeft: "auto", display: "flex", gap: "8px" }}>
          <button
            onClick={() => handleEdit(interview.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "11px",
              color: dark ? "#475569" : "#94a3b8",
              padding: "0",
              fontFamily: "Roboto, sans-serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#14b8a6";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = dark
                ? "#475569"
                : "#94a3b8";
            }}
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(interview.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "11px",
              color: dark ? "#475569" : "#94a3b8",
              padding: "0",
              fontFamily: "Roboto, sans-serif",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#ef4444";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = dark
                ? "#475569"
                : "#94a3b8";
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Date + relative time */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "11px",
          color: "#64748b",
          marginBottom: "4px",
        }}
      >
        <span>
          📅{" "}
          {new Date(interview.date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span
          style={{
            color: isUpcoming ? "#14b8a6" : "#64748b",
            fontWeight: 500,
          }}
        >
          · {formatRelative(interview.date)}
        </span>
      </div>

      {/* Location / link */}
      {interview.locationLink && (
        <div style={{ fontSize: "11px", marginBottom: "4px" }}>
          {isProbablyUrl(interview.locationLink) ? (
            <a
              href={ensureHref(interview.locationLink)}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#14b8a6", textDecoration: "none" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.textDecoration =
                  "underline";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.textDecoration = "none";
              }}
            >
              🔗 {interview.locationLink}
            </a>
          ) : (
            <span style={{ color: dark ? "#64748b" : "#475569" }}>
              📍 {interview.locationLink}
            </span>
          )}
        </div>
      )}

      {/* Notes */}
      {interview.notes && (
        <div
          style={{
            fontSize: "11px",
            color: dark ? "#475569" : "#94a3b8",
            lineHeight: 1.5,
            marginTop: "4px",
          }}
        >
          {interview.notes}
        </div>
      )}
    </li>
  );
};
