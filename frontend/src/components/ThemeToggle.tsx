import React, { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
      root.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      localStorage.setItem("theme", "light");
    }

    // Update PWA theme-color meta tag
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", isDark ? "#020617" : "#f8fafc");
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="fixed bottom-4 right-4 z-[9999] p-3 rounded-xl bg-(--bg-secondary) border border-(--border-color) shadow-lg hover:shadow-xl transition-all duration-300 btn-compact"
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)",
        right: "calc(env(safe-area-inset-right, 0px) + 1rem)",
      }}
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-(--accent-primary)" />
      ) : (
        <Moon className="w-5 h-5 text-(--accent-primary)" />
      )}
    </button>
  );
};

export default ThemeToggle;
