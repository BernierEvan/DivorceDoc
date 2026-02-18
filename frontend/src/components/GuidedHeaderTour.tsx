import React, { useState, useEffect, useCallback } from "react";
import { useGuidedMode } from "../services/guidedMode";

interface TourStop {
  /** CSS selector or fixed position target */
  target: "back" | "home" | "guide-toggle" | "theme-toggle" | "validate-btn";
  /** Label text */
  label: string;
  /** Tooltip description */
  description: string;
}

const TOUR_STOPS: TourStop[] = [
  {
    target: "back",
    label: "Retour",
    description: "Retournez à l'étape précédente à tout moment.",
  },
  {
    target: "home",
    label: "Accueil",
    description: "Revenez à la page d'accueil du simulateur.",
  },
  {
    target: "guide-toggle",
    label: "Guide",
    description:
      "Activez ou désactivez le mode guidé. Les explications pas-à-pas s'afficheront ou se masqueront.",
  },
  {
    target: "theme-toggle",
    label: "Thème",
    description:
      "Basculez entre le mode clair et le mode sombre selon votre préférence.",
  },
  {
    target: "validate-btn",
    label: "Valider",
    description:
      "Une fois tous les champs remplis, appuyez ici pour valider et passer à l'étape suivante.",
  },
];

/** Session key to track if the tour has already been shown */
const TOUR_SHOWN_KEY = "guidedHeaderTourShown";

/**
 * A one-time guided tour that highlights
 * the header buttons, guide toggle, theme toggle and validate button
 * with tooltip annotations and pulse animations.
 * Only shown the first time in guided mode.
 */
export const GuidedHeaderTour: React.FC = () => {
  const { isGuided } = useGuidedMode();
  const [currentStop, setCurrentStop] = useState(-1);
  const [positions, setPositions] = useState<
    Record<string, { top: number; left: number; width: number; height: number }>
  >({});

  // Check if tour was already shown
  useEffect(() => {
    if (!isGuided) return;
    const shown = sessionStorage.getItem(TOUR_SHOWN_KEY);
    if (!shown) {
      // Small delay to let the page mount
      const timer = setTimeout(() => setCurrentStop(0), 800);
      return () => clearTimeout(timer);
    }
  }, [isGuided]);

  // Measure positions of all targets
  useEffect(() => {
    if (currentStop < 0) return;

    const measure = () => {
      const newPositions: typeof positions = {};

      // Back button: first button in the sticky header
      const header = document.querySelector(
        "[class*='sticky'][class*='top-0']",
      );
      if (header) {
        const buttons = header.querySelectorAll("button");
        if (buttons[0]) {
          const rect = buttons[0].getBoundingClientRect();
          newPositions.back = {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          };
        }
        if (buttons[1]) {
          const rect = buttons[1].getBoundingClientRect();
          newPositions.home = {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          };
        }
      }

      // Guide toggle: fixed button with BookOpen or EyeOff
      const guideBtn = document.querySelector(
        "button[title*='guide'], button[title*='Guide']",
      );
      if (guideBtn) {
        const rect = guideBtn.getBoundingClientRect();
        newPositions["guide-toggle"] = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };
      }

      // Theme toggle: fixed button with aria-label containing "mode"
      const themeBtn = document.querySelector('button[aria-label*="mode"]');
      if (themeBtn) {
        const rect = themeBtn.getBoundingClientRect();
        newPositions["theme-toggle"] = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };
      }

      // Validate button: the full-width button in the fixed footer
      const footerDiv = document.querySelector(".fixed.bottom-0 button");
      if (footerDiv) {
        const rect = footerDiv.getBoundingClientRect();
        newPositions["validate-btn"] = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };
      }

      setPositions(newPositions);
    };

    measure();
    // Re-measure on scroll/resize
    window.addEventListener("scroll", measure, true);
    window.addEventListener("resize", measure);
    return () => {
      window.removeEventListener("scroll", measure, true);
      window.removeEventListener("resize", measure);
    };
  }, [currentStop]);

  // Remove blur/opacity from the validate button while the tour is active
  useEffect(() => {
    const btn = document.querySelector(
      ".fixed.bottom-0 button",
    ) as HTMLElement | null;
    if (!btn) return;

    if (currentStop >= 0) {
      // Tour is active: remove blur so button is visible
      btn.style.opacity = "1";
      btn.style.filter = "none";
      btn.style.pointerEvents = "none"; // still non-clickable during tour
    }

    return () => {
      // Restore — let React classes take back control
      btn.style.opacity = "";
      btn.style.filter = "";
      btn.style.pointerEvents = "";
    };
  }, [currentStop]);

  const advance = useCallback(() => {
    if (currentStop >= TOUR_STOPS.length - 1) {
      // Done — mark as shown
      setCurrentStop(-1);
      sessionStorage.setItem(TOUR_SHOWN_KEY, "true");
    } else {
      setCurrentStop((s) => s + 1);
    }
  }, [currentStop]);

  const dismiss = useCallback(() => {
    setCurrentStop(-1);
    sessionStorage.setItem(TOUR_SHOWN_KEY, "true");
  }, []);

  if (!isGuided || currentStop < 0 || currentStop >= TOUR_STOPS.length) {
    return null;
  }

  const stop = TOUR_STOPS[currentStop];
  const pos = positions[stop.target];

  // Compute tooltip position relative to the target
  const getTooltipStyle = (): React.CSSProperties => {
    if (!pos)
      return { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };

    const centerX = pos.left + pos.width / 2;
    const centerY = pos.top + pos.height / 2;
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;

    // If target is in top half, show tooltip below. Otherwise above.
    if (centerY < viewportH / 2) {
      // Below the target
      return {
        top: pos.top + pos.height + 12,
        left: Math.max(16, Math.min(centerX - 140, viewportW - 296)),
        maxWidth: 280,
      };
    } else {
      // Above the target
      return {
        bottom: viewportH - pos.top + 12,
        left: Math.max(16, Math.min(centerX - 140, viewportW - 296)),
        maxWidth: 280,
      };
    }
  };

  // Compute arrow position
  const getArrowStyle = (): {
    style: React.CSSProperties;
    direction: "up" | "down";
  } => {
    if (!pos) return { style: {}, direction: "down" };

    const centerX = pos.left + pos.width / 2;
    const centerY = pos.top + pos.height / 2;
    const viewportH = window.innerHeight;
    const tooltipLeft = getTooltipStyle().left as number;

    if (centerY < viewportH / 2) {
      // Arrow points up (tooltip is below target)
      return {
        style: { left: Math.max(16, centerX - (tooltipLeft || 0) - 6) },
        direction: "up",
      };
    } else {
      // Arrow points down (tooltip is above target)
      return {
        style: { left: Math.max(16, centerX - (tooltipLeft || 0) - 6) },
        direction: "down",
      };
    }
  };

  const tooltipStyle = getTooltipStyle();
  const { style: arrowStyle, direction: arrowDirection } = getArrowStyle();

  return (
    <>
      {/* Backdrop with cutout around the active target */}
      <svg
        className="fixed inset-0 z-[9990] guided-tour-backdrop"
        style={{ width: "100vw", height: "100vh" }}
        onClick={dismiss}
      >
        <defs>
          <mask id="tour-mask">
            {/* White = visible overlay */}
            <rect width="100%" height="100%" fill="white" />
            {/* Black cutout = transparent hole around target */}
            {pos && (
              <rect
                x={pos.left - 8}
                y={pos.top - 8}
                width={pos.width + 16}
                height={pos.height + 16}
                rx={pos.width > 100 ? 16 : (pos.width + 16) / 2}
                fill="black"
              />
            )}
          </mask>
          <filter id="tour-blur">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.55)"
          mask="url(#tour-mask)"
          filter="url(#tour-blur)"
        />
      </svg>

      {/* Highlight ring around the target */}
      {pos && (
        <div
          className="fixed z-[9999] rounded-full pointer-events-none guided-tour-ring"
          style={{
            top: pos.top - 6,
            left: pos.left - 6,
            width: pos.width + 12,
            height: pos.height + 12,
          }}
        />
      )}

      {/* Tooltip */}
      <div className="fixed z-[10000] guided-tour-tooltip" style={tooltipStyle}>
        <div className="bg-[var(--accent-primary)] text-white rounded-xl shadow-2xl shadow-[var(--accent-primary)]/30 p-4 relative">
          {/* Arrow */}
          <div
            className={`absolute w-3 h-3 bg-[var(--accent-primary)] rotate-45 ${
              arrowDirection === "up" ? "-top-1.5" : "-bottom-1.5"
            }`}
            style={arrowStyle}
          />

          <div className="relative z-10">
            <span className="text-[10px] uppercase tracking-widest font-bold opacity-70 block mb-1">
              {stop.label} — {currentStop + 1}/{TOUR_STOPS.length}
            </span>
            <p className="text-sm leading-relaxed">{stop.description}</p>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/20">
              <button
                onClick={dismiss}
                className="text-xs opacity-70 hover:opacity-100 transition px-3 py-1.5 rounded-lg hover:bg-white/10"
              >
                Ignorer les explications
              </button>
              <button
                onClick={advance}
                className="flex items-center space-x-1.5 text-xs font-medium bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg transition active:scale-95"
              >
                <span>
                  {currentStop >= TOUR_STOPS.length - 1
                    ? "Compris !"
                    : "Suivant"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
