import { useEffect, useRef, useState, useCallback } from "react";

/**
 * VersionChecker — detects new site deployments and forces a fresh page load.
 *
 * Cross-browser compatible (Chrome, Firefox, Safari, Edge).
 *
 * Strategy:
 *  1. Fetches /version.json with aggressive cache-busting (unique URL +
 *     no-cache headers) so we ALWAYS get the real latest hash from the server.
 *  2. Compares with the hash in localStorage ("appBuildHash").
 *  3. First visit → stores hash, nothing else.
 *  4. Stale on page load → navigates to a cache-busted URL (?_v=<ts>) which
 *     forces both the browser AND the CDN to fetch fresh HTML. The hash is
 *     stored ONLY via sessionStorage flag; if the page still loads old code
 *     after the navigate, a banner is shown instead of looping.
 *  5. Mid-session new version → shows a non-intrusive banner.
 *  6. Re-checks every 5 min + when the tab regains focus.
 *
 * IMPORTANT: Only "appBuildHash" in localStorage is written. All user data
 * (divorceFormData, simulationMode, calculationChoices, etc.) is untouched.
 */

const STORAGE_KEY = "appBuildHash";
const RELOAD_FLAG = "appVersionReloading"; // sessionStorage flag
const CHECK_INTERVAL_MS = 5 * 60 * 1000;

interface VersionInfo {
  buildHash: string;
}

/* ------------------------------------------------------------------ */
/*  Fetch version.json — maximum cache-busting for every browser      */
/* ------------------------------------------------------------------ */
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

/* ------------------------------------------------------------------ */
/*  Navigate to a cache-busted URL (forces fresh HTML from server)    */
/*  reload(true) is deprecated and silently ignored in most browsers  */
/*  so we use URL-based cache-busting instead.                        */
/* ------------------------------------------------------------------ */
function navigateFresh(): void {
  const url = new URL(window.location.href);
  url.searchParams.set("_v", Date.now().toString());
  window.location.replace(url.toString());
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
const VersionChecker: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);
  const isInitialCheck = useRef(true);
  const hasAttemptedReload = useRef(false);

  // On mount: clean up the ?_v= cache-busting param from the URL so it
  // doesn't look ugly, and clear the reload flag.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.has("_v")) {
      url.searchParams.delete("_v");
      const clean = url.pathname + (url.search || "") + (url.hash || "");
      window.history.replaceState({}, "", clean);
    }
  }, []);

  const checkVersion = useCallback(async () => {
    const data = await fetchVersionJson();
    if (!data) return;

    const newHash = data.buildHash;
    const storedHash = localStorage.getItem(STORAGE_KEY);

    // ── First visit ever ──
    if (!storedHash) {
      localStorage.setItem(STORAGE_KEY, newHash);
      sessionStorage.removeItem(RELOAD_FLAG);
      isInitialCheck.current = false;
      return;
    }

    // ── Same version ──
    if (storedHash === newHash) {
      sessionStorage.removeItem(RELOAD_FLAG);
      isInitialCheck.current = false;
      return;
    }

    // ── New version detected! ──

    // Did we already try a cache-busted navigate for this session?
    const alreadyTried = sessionStorage.getItem(RELOAD_FLAG) === "1";

    if (isInitialCheck.current && !hasAttemptedReload.current && !alreadyTried) {
      // First load & version is stale → navigate with cache-bust.
      // We do NOT update localStorage yet. After the navigate:
      //   - If the fresh HTML loads → new code runs, hashes match → OK
      //   - If CDN still serves old HTML → same old code runs, detects
      //     mismatch again, but sessionStorage flag prevents a loop →
      //     falls through to banner below.
      hasAttemptedReload.current = true;
      sessionStorage.setItem(RELOAD_FLAG, "1");
      navigateFresh();
      return;
    }

    // Either mid-session update, or the cache-busted reload still served
    // old HTML (CDN hasn't refreshed yet). Store the hash & show banner.
    localStorage.setItem(STORAGE_KEY, newHash);
    sessionStorage.removeItem(RELOAD_FLAG);
    setShowBanner(true);
  }, []);

  useEffect(() => {
    checkVersion();

    const interval = setInterval(() => {
      isInitialCheck.current = false;
      checkVersion();
    }, CHECK_INTERVAL_MS);

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        isInitialCheck.current = false;
        checkVersion();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
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
        onClick={() => navigateFresh()}
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
