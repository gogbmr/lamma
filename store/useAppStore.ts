// store/useAppStore.ts
import { create } from "zustand";

type Segment = "Equity" | "FNO" | "Commodity";

interface AppState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  activeSegment: Segment;
  setActiveSegment: (segment: Segment) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isSidebarOpen: true, // Default to open on desktop
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  
  activeSegment: "Equity", // Default trading segment
  setActiveSegment: (segment) => set({ activeSegment: segment }),
}));