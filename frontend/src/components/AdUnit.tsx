import React from "react";

interface AdUnitProps {
  type?: "banner" | "rectangle" | "native";
  className?: string;
}

/**
 * Placeholder ad unit component.
 * Replace the inner div with a real Google AdSense <ins> tag once approved.
 */
export const AdUnit: React.FC<AdUnitProps> = ({
  type = "rectangle",
  className = "",
}) => {
  const sizeClass =
    type === "banner"
      ? "h-[90px] w-full max-w-[728px]"
      : type === "native"
        ? "min-h-[250px] w-full"
        : "h-[250px] w-full max-w-[336px]";

  return (
    <div
      className={`flex items-center justify-center mx-auto rounded-xl border border-white/5 bg-white/[0.02] ${sizeClass} ${className}`}
      aria-hidden="true"
    >
      {/* Replace with <ins class="adsbygoogle" ...> when AdSense is live */}
      <span className="text-[10px] uppercase tracking-widest text-gray-600 select-none">
        Espace publicitaire
      </span>
    </div>
  );
};

export default AdUnit;
