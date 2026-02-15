import React, { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

const OfflineIndicator: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[10000] flex justify-center"
      style={{ top: "env(safe-area-inset-top, 0px)" }}
    >
      <div className="bg-amber-600 text-white px-4 py-1.5 rounded-b-xl flex items-center gap-2 shadow-lg text-xs font-medium">
        <WifiOff className="w-3.5 h-3.5" />
        <span>Hors ligne — les données locales restent accessibles</span>
      </div>
    </div>
  );
};

export default OfflineIndicator;
