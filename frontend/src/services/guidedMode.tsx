import React, { createContext, useContext, useState, useCallback } from "react";

type SimulationMode = "guided" | "unguided" | null;

interface GuidedModeContextType {
  mode: SimulationMode;
  isGuided: boolean;
  setMode: (mode: SimulationMode) => void;
  disableGuide: () => void;
}

const GuidedModeContext = createContext<GuidedModeContextType>({
  mode: null,
  isGuided: false,
  setMode: () => {},
  disableGuide: () => {},
});

export const GuidedModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setModeState] = useState<SimulationMode>(() => {
    const saved = localStorage.getItem("simulationMode");
    if (saved === "guided" || saved === "unguided") return saved;
    return null;
  });

  const setMode = useCallback((m: SimulationMode) => {
    setModeState(m);
    if (m) {
      localStorage.setItem("simulationMode", m);
    } else {
      localStorage.removeItem("simulationMode");
    }
  }, []);

  const disableGuide = useCallback(() => {
    setModeState("unguided");
    localStorage.setItem("simulationMode", "unguided");
  }, []);

  return (
    <GuidedModeContext.Provider
      value={{ mode, isGuided: mode === "guided", setMode, disableGuide }}
    >
      {children}
    </GuidedModeContext.Provider>
  );
};

export const useGuidedMode = () => useContext(GuidedModeContext);
