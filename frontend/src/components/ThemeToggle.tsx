import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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

  return createPortal(
    <button
      onClick={() => setIsDark(!isDark)}
      className="fixed bottom-[7rem] right-3 z-[9998] w-7 h-7 flex items-center justify-center sm:bottom-4 sm:right-4 sm:w-auto sm:h-auto sm:p-3 rounded-xl bg-(--bg-secondary) border border-(--border-color) shadow-lg hover:shadow-xl transition-all duration-300 btn-compact"
      aria-label={isDark ? "Passer en mode clair" : "Passer en mode sombre"}
    >
      {isDark ? (
        <Sun className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-(--accent-primary)" />
      ) : (
        <Moon className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-(--accent-primary)" />
      )}
    </button>,
    document.body,
  );
};

export default ThemeToggle;
