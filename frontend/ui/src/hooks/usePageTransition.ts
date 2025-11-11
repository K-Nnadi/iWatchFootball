import { useNavigate } from 'react-router-dom';
import { usePageTransitionStore } from '../shared/stores/pageTransition.store';

type TransitionType = 'fade' | 'slide' | 'scale' | 'loading';

interface UsePageTransitionOptions {
  transitionType?: TransitionType;
  duration?: number;
  delay?: number;
  state?: any;
}

export function usePageTransition() {
  const navigate = useNavigate();
  const { startTransition, endTransition } = usePageTransitionStore();

  const navigateWithTransition = (
    to: string, 
    options?: UsePageTransitionOptions
  ) => {
    const { 
      transitionType = 'loading', 
      duration = 2000, 
      delay = 0,
      state
    } = options || {};

    // Start the transition
    startTransition(transitionType, duration);

    // Navigate after a small delay to allow transition to start
    setTimeout(() => {
      navigate(to, { state });
    }, delay);
  };

  const navigateWithLoading = (to: string, loadingDuration = 2000) => {
    startTransition('loading', loadingDuration);
    
    setTimeout(() => {
      navigate(to);
    }, 100);
  };

  return {
    navigateWithTransition,
    navigateWithLoading,
    endTransition,
  };
}
