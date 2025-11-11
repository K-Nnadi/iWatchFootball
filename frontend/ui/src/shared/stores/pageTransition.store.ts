import { create } from 'zustand';

interface PageTransitionState {
  isTransitioning: boolean;
  transitionType: 'fade' | 'slide' | 'scale' | 'loading';
  duration: number;
  setTransitioning: (isTransitioning: boolean) => void;
  setTransitionType: (type: 'fade' | 'slide' | 'scale' | 'loading') => void;
  setDuration: (duration: number) => void;
  startTransition: (type?: 'fade' | 'slide' | 'scale' | 'loading', duration?: number) => void;
  endTransition: () => void;
}

export const usePageTransitionStore = create<PageTransitionState>((set) => ({
  isTransitioning: false,
  transitionType: 'fade',
  duration: 30000,
  setTransitioning: (isTransitioning) => set({ isTransitioning }),
  setTransitionType: (transitionType) => set({ transitionType }),
  setDuration: (duration) => set({ duration }),
  startTransition: (type = 'fade', duration = 300) => 
    set({ isTransitioning: true, transitionType: type, duration }),
  endTransition: () => set({ isTransitioning: false }),
}));
