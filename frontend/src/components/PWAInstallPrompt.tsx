import React, { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    if (standalone) return;

    // Check if user previously dismissed
    const dismissed = sessionStorage.getItem("pwa-install-dismissed");
    if (dismissed) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showBanner || isStandalone) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-[9998] animate-fade-in"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 1rem)" }}
    >
      <div className="glass-panel p-4 rounded-2xl border border-[var(--accent-primary)]/30 shadow-[0_0_30px_rgba(13,148,136,0.2)] flex items-center gap-4 max-w-md mx-auto">
        <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-[var(--accent-primary)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
            Installer DivorceDoc
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">
            Accès rapide depuis votre écran d'accueil
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="shrink-0 px-4 py-2 bg-[var(--accent-primary)] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[var(--accent-hover)] transition-all active:scale-95"
        >
          Installer
        </button>
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1.5 rounded-full hover:bg-[var(--bg-tertiary)] transition btn-compact"
          aria-label="Fermer"
        >
          <X className="w-4 h-4 text-[var(--text-muted)]" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
