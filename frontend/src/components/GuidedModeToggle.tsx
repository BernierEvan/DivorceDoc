import React, { useState } from "react";
import { createPortal } from "react-dom";
import { BookOpen, X, EyeOff } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useGuidedMode } from "../services/guidedMode";

/**
 * Floating toggle button that lets the user turn guided mode off (or back on)
 * at any time during the simulation. Only renders if a mode has been chosen.
 */
export const GuidedModeToggle: React.FC = () => {
  const { mode, isGuided, setMode } = useGuidedMode();
  const [showConfirm, setShowConfirm] = useState(false);
  const { pathname } = useLocation();

  // Don't render if user hasn't chosen a mode yet
  if (!mode) return null;

  // Hide on landing page and calculation choice page
  const hiddenPages = ["/"];
  if (hiddenPages.includes(pathname)) return null;

  // Hide on disclaimer page for desktop only
  const isDisclaimerPage = pathname === "/disclaimer";

  const handleToggle = () => {
    if (isGuided) {
      setShowConfirm(true);
    } else {
      // Re-enable guided mode
      setMode("guided");
      // Clear all session dismissals so tooltips re-appear
      Object.keys(sessionStorage).forEach((key) => {
        if (key.startsWith("guidedDismissed_")) sessionStorage.removeItem(key);
      });
    }
  };

  const confirmDisable = () => {
    setMode("unguided");
    setShowConfirm(false);
  };

  return createPortal(
    <>
      {/* Floating button */}
      <button
        onClick={handleToggle}
        className={`fixed bottom-[9rem] right-3 z-[9997] w-7 h-7 sm:bottom-24 sm:right-4 sm:w-12 sm:h-12 rounded-xl shadow-lg flex items-center justify-center transition-all active:scale-90 btn-compact ${isDisclaimerPage ? "sm:hidden" : ""} ${
          isGuided
            ? "bg-[var(--accent-primary)] text-white shadow-[var(--accent-primary)]/30 border border-white/20"
            : "bg-white/10 backdrop-blur-md text-gray-400 border border-white/20 hover:bg-white/15"
        }`}
        title={isGuided ? "Désactiver le guide" : "Activer le guide"}
      >
        {isGuided ? (
          <BookOpen className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
        ) : (
          <EyeOff className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
        )}
      </button>

      {/* Confirm disable modal */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowConfirm(false)}
        >
          <div
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl w-full max-w-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <EyeOff className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="font-bold text-[var(--text-primary)]">
                  Désactiver le guide ?
                </h3>
              </div>
              <button
                onClick={() => setShowConfirm(false)}
                className="p-1.5 rounded-full hover:bg-[var(--bg-tertiary)] text-[var(--text-muted)]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                Les explications pas-à-pas ne s'afficheront plus. Vous pourrez
                toujours consulter les informations en cliquant sur les icônes{" "}
                <span className="inline-flex items-center text-[var(--accent-primary)]">
                  ℹ
                </span>{" "}
                à côté de chaque champ.
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Vous pourrez réactiver le guide à tout moment via le bouton
                flottant.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-xl border border-[var(--border-color)] text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition"
                >
                  Annuler
                </button>
                <button
                  onClick={confirmDisable}
                  className="flex-1 py-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-sm font-medium text-amber-400 hover:bg-amber-500/20 transition"
                >
                  Désactiver
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body,
  );
};
