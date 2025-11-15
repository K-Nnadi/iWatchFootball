import { useEffect, useRef, useState, useCallback } from 'react';

export type AnimationType = 'fadeUp' | 'fadeIn' | 'slideLeft' | 'slideRight' | 'scale';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  animationType?: AnimationType;
  delay?: number;
  triggerOnce?: boolean;
}

export function useScrollAnimation(options: UseScrollAnimationOptions = {}) {
  const {
    threshold = 0.1,
    rootMargin = '0px',
    animationType = 'fadeUp',
    delay = 0,
    triggerOnce = true,
  } = options;

  const elementRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Cleanup previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Only process if not already animated (for triggerOnce) or if triggerOnce is false
          if (entry.isIntersecting && (!triggerOnce || !hasAnimated)) {
            if (delay > 0) {
              timeoutRef.current = setTimeout(() => {
                setIsVisible(true);
                if (triggerOnce) {
                  setHasAnimated(true);
                  // Unobserve after animation triggers
                  if (observerRef.current && element) {
                    observerRef.current.unobserve(element);
                  }
                }
              }, delay);
            } else {
              setIsVisible(true);
              if (triggerOnce) {
                setHasAnimated(true);
                // Unobserve after animation triggers
                if (observerRef.current && element) {
                  observerRef.current.unobserve(element);
                }
              }
            }
          } else if (!triggerOnce && !entry.isIntersecting) {
            setIsVisible(false);
          }
        });
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current = observer;
    observer.observe(element);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin, delay, triggerOnce, hasAnimated]);

  const getAnimationClass = useCallback(() => {
    const baseClass = `scroll-animate-${animationType}`;
    if (isVisible || hasAnimated) {
      return `${baseClass} scroll-animate-visible`;
    }
    return baseClass;
  }, [animationType, isVisible, hasAnimated]);

  return {
    ref: elementRef,
    isVisible: isVisible || hasAnimated,
    className: getAnimationClass(),
  };
}

