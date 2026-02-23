import React from "react";

/**
 * Format a raw numeric string with space thousand separators.
 *   "100000"   → "100 000"
 *   "2500.5"   → "2 500.5"
 *   ""         → ""
 */
const formatWithSpaces = (raw: string): string => {
  if (!raw) return "";
  const str = String(raw);
  const [intPart, decPart] = str.split(".");
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0"); // non-breaking space
  return decPart !== undefined ? `${formatted}.${decPart}` : formatted;
};

/** Strip formatting spaces to get a raw numeric string */
const stripSpaces = (formatted: string): string => {
  return formatted.replace(/[\s\u00A0]/g, "").replace(",", ".");
};

interface CurrencyInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "type" | "onChange" | "value"
  > {
  value: string;
  onValueChange: (rawValue: string) => void;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onValueChange,
  ...props
}) => {
  return (
    <input
      {...props}
      type="text"
      inputMode="decimal"
      value={formatWithSpaces(value)}
      onChange={(e) => {
        const raw = stripSpaces(e.target.value);
        // Allow empty, or valid numeric input (digits with optional single decimal)
        if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
          onValueChange(raw);
        }
      }}
    />
  );
};
