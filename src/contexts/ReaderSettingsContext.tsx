import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type FlowMode = "paginated" | "scrolled";

type ReaderSettingsContextType = {
  flowMode: FlowMode;
  setFlowMode: (mode: FlowMode) => void;
};

const ReaderSettingsContext = createContext<ReaderSettingsContextType | null>(null);

const FLOW_MODE_KEY = "epub-flow-mode";

export function ReaderSettingsProvider({ children }: { children: ReactNode }) {
  const [flowMode, setFlowModeState] = useState<FlowMode>(() => {
    if (typeof window === "undefined") return "paginated";
    return (localStorage.getItem(FLOW_MODE_KEY) as FlowMode) || "paginated";
  });

  const setFlowMode = useCallback((mode: FlowMode) => {
    setFlowModeState(mode);
    localStorage.setItem(FLOW_MODE_KEY, mode);
  }, []);

  return (
    <ReaderSettingsContext.Provider value={{ flowMode, setFlowMode }}>
      {children}
    </ReaderSettingsContext.Provider>
  );
}

export function useReaderSettings() {
  const context = useContext(ReaderSettingsContext);
  if (!context) {
    throw new Error("useReaderSettings must be used within a ReaderSettingsProvider");
  }
  return context;
}
