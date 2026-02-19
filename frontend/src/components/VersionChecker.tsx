import { useEffect, useRef, useState, useCallback } from "react";

/**
 * VersionChecker — detects new site deployments and reloads the page.
 *
 * Cross-browser compatible (Chrome, Firefox, Safari, Edge):
 *
 *  1. On mount, fetches /version.json with aggressive cache-busting:
 *     - URL query param `?_t=<timestamp>` (defeats CDN / proxy caches)
 *     - `cache: "no-store"` (Chrome/Edge)
 *     - `pragma: no-cache` + `cache-control: no-cache` headers (Firefox/Safari)
 *  2. Compares the buildHash with the one stored in localStorage ("appBuildHash").
 *  3. First visit   → stores the hash, does nothing.
 *  4. Hash changed   → hard-reloads the page (bypasses browser cache).
 *  5. While the tab stays open, re-checks every 5 minutes + on tab focus.
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

/**
 * Fetch version.json with maximum cache-busting for all browsers.
 * Firefox ignores `cache: "no-store"` in some cases, so we also set
 * explicit no-cache headers and use a unique URL each time.
 */
async function fetchVersionJson(): Promise<VersionInfo | null> {
  try {
    const url = `/version.json?_t=${Date.now()}&_r=${Math.random().toString(36).slice(2)}`;
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Pragma: "no-cache",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as VersionInfo;
  } catch {
    return null;
  }
}

/**
 * Force a hard reload that bypasses the browser cache.
 * - `location.reload(true)` is deprecated but still works in Firefox/Safari
 *   to force a server fetch (bypassing BFCache and HTTP cache).
 * - For browsers that ignore it, we navigate to a cache-busted URL which
 *   forces the server to deliver fresh index.html.
 */
function hardReload(): void {
  try {
    // Try the deprecated forceReload flag — Firefox and Safari still honor it
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window.location as any).reload(true);
  } catch {
    // Fallback: navigate to a cache-busted version of the current URL
    const url = new URL(window.location.href);
    url.searchParams.set("_refresh", Date.now().toString());
    window.location.replace(url.toString());
  }
}

const VersionChecker: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const isInitialCheck = useRef(true);
  const hasReloaded = useRef(false);

  const checkVersion = useCallback(async () => {
    const data = await fetchVersionJson();
    if (!data) return;

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
      // Page just loaded and the version is stale → hard-reload silently.
      hasReloaded.current = true;
      hardReload();
      return;
    }

    // Mid-session update → show a banner rather than disrupting the user.
    setShowBanner(true);
  }, []);

  useEffect(() => {
    // Check immediately on mount
    checkVersion();

    // Then periodically while the tab is open
    const interval = setInterval(() => {
      isInitialCheck.current = false;
      checkVersion();
    }, CHECK_INTERVAL_MS);

    // Also check when the user returns to this tab (covers mobile browsers
    // that aggressively cache pages in BFCache / back-forward cache).
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        isInitialCheck.current = false;
        checkVersion();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
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
        onClick={() => hardReload()}
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
