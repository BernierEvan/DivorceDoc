import React from "react";

interface AdUnitProps {
  type: "banner" | "native" | "rectangle";
  slotId?: string; // Generic placeholder for AdMob slot ID
  className?: string;
}

export const AdUnit: React.FC<AdUnitProps> = ({
  type,
  slotId,
  className = "",
}) => {
  // Mock Ad Rendering
  if (type === "banner") {
    // AD_01 Sticky Bottom
    return (
      <div
        className={`w-full h-[50px] bg-gray-900 border-t border-[var(--color-plasma-cyan)]/20 flex items-center justify-center relative overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
        <p className="text-[9px] uppercase tracking-widest text-gray-500 z-10">
          Publicité (320x50)
        </p>
      </div>
    );
  }

  if (type === "native") {
    // AD_02 / AD_04 Native
    return (
      <div
        className={`bg-white/5 border border-white/10 rounded-xl p-4 relative overflow-hidden ${className}`}
      >
        <div className="flex items-center space-x-2 mb-2">
          <span className="bg-yellow-500/20 text-yellow-500 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
            Ad
          </span>
          <span className="text-gray-400 text-xs">Partenaire recommandé</span>
        </div>
        <div className="flex space-x-3">
          <div className="w-12 h-12 bg-gray-700 rounded-lg shrink-0 animate-pulse" />
          <div>
            <p className="text-sm font-bold text-white leading-tight">
              Crédit Rachat de Soulte
            </p>
            <p className="text-xs text-gray-400 mt-1">
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
        className={`w-[300px] h-[250px] mx-auto bg-gray-800 flex items-center justify-center border border-white/5 rounded-xl relative ${className}`}
      >
        <span className="text-xs text-gray-500 uppercase tracking-widest">
          Publicité (300x250)
        </span>
      </div>
    );
  }

  return null;
};
