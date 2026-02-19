import { useEffect, useRef, useState, useCallback } from "react";

/**
 * VersionChecker — detects new site deployments and reloads the page.
 *
 * How it works:
 *  1. On mount, fetches /version.json?_t=<timestamp> (cache-busted).
 *  2. Compares the buildHash with the one stored in localStorage ("appBuildHash").
 *  3. First visit   → stores the hash, does nothing.
 *  4. Hash changed   → auto-reloads the page so the browser fetches the new
 *                       index.html (which references the new hashed assets).
 *  5. While the tab stays open, re-checks every 5 minutes.
 *     If a new version is found mid-session, shows a non-intrusive banner
 *     instead of auto-reloading (to avoid data-loss if the user is typing).
 *
 * IMPORTANT: Only the key "appBuildHash" is touched. All user data stored in
 * localStorage (divorceFormData, simulationMode, calculationChoices, etc.) is
 * left completely untouched.
 */

const STORAGE_KEY = "appBuildHash";
const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

interface VersionInfo {
  buildHash: string;
}

const VersionChecker: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  // Tracks whether this is the initial check (on page load) vs a periodic one
  const isInitialCheck = useRef(true);
  // Guard against double-reload
  const hasReloaded = useRef(false);

  const checkVersion = useCallback(async () => {
    try {
      const res = await fetch(`/version.json?_t=${Date.now()}`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data: VersionInfo = await res.json();
      const newHash = data.buildHash;
      const storedHash = localStorage.getItem(STORAGE_KEY);

      if (!storedHash) {
        // First visit ever — just store the hash.
        localStorage.setItem(STORAGE_KEY, newHash);
        isInitialCheck.current = false;
        return;
      }

      if (storedHash === newHash) {
        // Same version — nothing to do.
        isInitialCheck.current = false;
        return;
      }

      // New version detected!
      localStorage.setItem(STORAGE_KEY, newHash);

      if (isInitialCheck.current && !hasReloaded.current) {
        // Page just loaded and the version is stale → auto-reload silently.
        // After reload, the stored hash will match, so no loop.
        hasReloaded.current = true;
        window.location.reload();
        return;
      }

      // Mid-session update → show a banner rather than disrupting the user.
      setShowBanner(true);
    } catch {
      // Network error — silently ignore (offline, etc.)
    }
  }, []);

  useEffect(() => {
    // Check immediately on mount
    checkVersion();

    // Then periodically while the tab is open
    const interval = setInterval(() => {
      isInitialCheck.current = false;
      checkVersion();
    }, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [checkVersion]);

  if (!showBanner) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999]
        flex items-center gap-3 rounded-xl px-5 py-3 shadow-2xl
        bg-blue-600 text-white text-sm font-medium
        animate-in slide-in-from-bottom-4 duration-300"
    >
      <span>🔄 Une nouvelle version est disponible.</span>
      <button
        onClick={() => window.location.reload()}
        className="rounded-lg bg-white/20 hover:bg-white/30 px-3 py-1
          text-white font-semibold transition-colors"
      >
        Actualiser
      </button>
      <button
        onClick={() => setShowBanner(false)}
        aria-label="Fermer"
        className="ml-1 opacity-70 hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
    </div>
  );
};

export default VersionChecker;
