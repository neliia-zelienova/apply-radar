import { Plus } from "lucide-react";
import { useApplicationContext } from "../../context/applications-context";
import type { ApplicationData } from "../../types/applications";
import { ApplicationForm } from "../list/application-form";
import { useAuthContext } from "../../context/auth-context";
import { SettingsDropdown } from "./settings-dropdown";

export const Header = () => {
  const { createApplication } = useApplicationContext();
  const { authType } = useAuthContext();

  const createNewApp = (application: ApplicationData) => {
    createApplication(application);
  };

  return (
    <div
      className="w-full relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #050b1a 0%, #071328 55%, #0c1a32 100%)",
        paddingBottom: "28px",
      }}
    >
      {/* Scanline texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.025) 2px, rgba(255,255,255,0.025) 3px)",
        }}
      />

      {/* Teal radial glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-20px",
          left: "20px",
          width: "200px",
          height: "120px",
          background:
            "radial-gradient(ellipse, rgba(20,184,166,0.18) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 px-[18px] pt-[18px] flex flex-col gap-3.5">
        {/* Top row: logo + settings */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Radar logo */}
            <div
              className="flex-shrink-0 flex items-center justify-center"
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle at 40% 40%, rgba(20,184,166,0.4), rgba(20,184,166,0.1))",
                border: "1.5px solid rgba(20,184,166,0.4)",
                boxShadow: "0 0 16px rgba(20,184,166,0.25)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="2" fill="rgba(20,184,166,0.9)" />
                <circle
                  cx="12"
                  cy="12"
                  r="6"
                  stroke="rgba(20,184,166,0.5)"
                  strokeWidth="1.5"
                  fill="none"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="rgba(20,184,166,0.25)"
                  strokeWidth="1"
                  fill="none"
                />
                <g
                  style={{
                    transformOrigin: "12px 12px",
                    animation: "spin-slow 4s linear infinite",
                  }}
                >
                  <line
                    x1="12"
                    y1="12"
                    x2="20"
                    y2="4"
                    stroke="rgba(20,184,166,0.7)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </g>
              </svg>
            </div>

            {/* Brand text */}
            <div>
              <div
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#f0fdf9",
                  letterSpacing: "-0.02em",
                  lineHeight: 1.2,
                  fontFamily: "Roboto, sans-serif",
                }}
              >
                Apply Radar
              </div>
              <div
                style={{
                  fontSize: "12px",
                  color: "rgba(94,234,212,0.75)",
                  letterSpacing: "0.03em",
                  fontWeight: 400,
                  fontFamily: "Roboto, sans-serif",
                }}
              >
                Every application. Always on radar.
              </div>
            </div>
          </div>

          {/* Settings button */}
          <div className="flex-shrink-0">
            <SettingsDropdown />
          </div>
        </div>

        {/* CTA button */}
        {authType !== null && (
          <ApplicationForm
            triggerComponent={
              <button
                className="self-start flex items-center gap-1.5 cursor-pointer"
                style={{
                  padding: "9px 18px",
                  borderRadius: "9999px",
                  background: "transparent",
                  border: "1.5px solid rgba(20,184,166,0.55)",
                  color: "#5eead4",
                  fontSize: "12px",
                  fontWeight: 600,
                  letterSpacing: "0.02em",
                  boxShadow:
                    "0 0 12px rgba(20,184,166,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
                  transition: "all 0.2s ease",
                  fontFamily: "Roboto, sans-serif",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(20,184,166,0.12)";
                  el.style.boxShadow =
                    "0 0 20px rgba(20,184,166,0.35), inset 0 1px 0 rgba(255,255,255,0.05)";
                  el.style.borderColor = "rgba(20,184,166,0.8)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "transparent";
                  el.style.boxShadow =
                    "0 0 12px rgba(20,184,166,0.15), inset 0 1px 0 rgba(255,255,255,0.05)";
                  el.style.borderColor = "rgba(20,184,166,0.55)";
                }}
              >
                <Plus className="h-3.5 w-3.5" />
                Add application
              </button>
            }
            onSave={createNewApp}
          />
        )}
      </div>
    </div>
  );
};
