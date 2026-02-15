import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Info, X } from "lucide-react";

interface InfoTooltipProps {
  content: string;
  label?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, label }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  const modal = isOpen
    ? createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          style={{
            textTransform: "none",
            fontSize: "16px",
            letterSpacing: "normal",
            fontWeight: "normal",
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl shadow-2xl w-full max-w-lg relative flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5 text-[var(--accent-primary)]" />
                </div>
                <h3 className="text-lg font-bold text-[var(--text-primary)]">
                  Information
                </h3>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition p-2 rounded-full hover:bg-[var(--bg-tertiary)] cursor-pointer"
                aria-label="Fermer"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content - Scrollable area */}
            <div className="p-6 overflow-y-auto flex-1 min-h-0">
              <p className="text-base text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap break-words normal-case">
                {content}
              </p>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(true);
        }}
        className="inline-flex items-center space-x-1 text-[var(--accent-primary)] hover:opacity-80 transition shrink-0"
        aria-label="Plus d'informations"
        type="button"
      >
        <Info className="w-4 h-4" />
        {label && (
          <span className="text-xs underline decoration-dotted">{label}</span>
        )}
      </button>

      {modal}
    </>
  );
};
