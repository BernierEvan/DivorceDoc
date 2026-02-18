import React from "react";

interface AdUnitProps {
  type: "banner" | "native" | "rectangle";
  slotId?: string; // Generic placeholder for AdMob slot ID
  className?: string;
}

export const AdUnit: React.FC<AdUnitProps> = ({
  type,
  slotId: _slotId,
  className = "",
}) => {
  // Mock Ad Rendering
  if (type === "banner") {
    // AD_01 Sticky Bottom
    return (
      <div
        className={`w-full h-[50px] bg-[var(--bg-tertiary)] border-t border-[var(--border-color)] flex items-center justify-center relative overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
        <p className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] z-10">
          Publicité (320x50)
        </p>
      </div>
    );
  }

  if (type === "native") {
    // AD_02 / AD_04 Native
    return (
      <div
        className={`bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 relative overflow-hidden ${className}`}
      >
        <div className="flex items-center space-x-2 mb-2">
          <span className="bg-yellow-500/20 text-yellow-500 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
            Ad
          </span>
          <span className="text-[var(--text-muted)] text-xs">
            Partenaire recommandé
          </span>
        </div>
        <div className="flex space-x-3">
          <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-lg shrink-0 animate-pulse" />
          <div>
            <p className="text-sm font-bold text-[var(--text-primary)] leading-tight">
              Crédit Rachat de Soulte
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Calculez vos mensualités dès maintenant.
            </p>
          </div>
        </div>
        <div className="mt-3">
          <button className="w-full py-2 bg-[var(--color-plasma-cyan)]/10 hover:bg-[var(--color-plasma-cyan)]/20 text-[var(--color-plasma-cyan)] text-xs font-bold rounded uppercase tracking-wider transition">
            Voir l'offre
          </button>
        </div>
      </div>
    );
  }

  if (type === "rectangle") {
    // AD_04 MPU
    return (
      <div
        className={`w-[300px] h-[250px] mx-auto bg-[var(--bg-tertiary)] flex items-center justify-center border border-[var(--border-color)] rounded-xl relative ${className}`}
      >
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest">
          Publicité (300x250)
        </span>
      </div>
    );
  }

  return null;
};
