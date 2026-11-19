import { create } from 'zustand';

interface UIState {
  allRouteMetrics: any[];
  selectedRoute: string | null;
  isWidgetsCollapsed: boolean;
  spotlightFocus: boolean;
  tiltShift: boolean;
  dioramaContrast: boolean;
  setAllRouteMetrics: (metrics: any[]) => void;
  setSelectedRoute: (routeId: string | null) => void;
  toggleWidgets: () => void;
  toggleSpotlightFocus: () => void;
  toggleTiltShift: () => void;
  toggleDioramaContrast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  allRouteMetrics: [],
  selectedRoute: null,
  isWidgetsCollapsed: false,
  spotlightFocus: false,
  tiltShift: true,
  dioramaContrast: true,
  setAllRouteMetrics: (metrics) => set({ allRouteMetrics: metrics }),
  setSelectedRoute: (routeId) => set({ selectedRoute: routeId }),
  toggleWidgets: () => set((state) => ({ isWidgetsCollapsed: !state.isWidgetsCollapsed })),
  toggleSpotlightFocus: () => set((state) => ({ spotlightFocus: !state.spotlightFocus })),
  toggleTiltShift: () => set((state) => ({ tiltShift: !state.tiltShift })),
  toggleDioramaContrast: () => set((state) => ({ dioramaContrast: !state.dioramaContrast })),
}));
