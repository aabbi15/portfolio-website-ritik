import { useCallback } from "react";

type SmoothScrollOptions = {
  offset?: number; // Additional offset from the top
  duration?: number; // Duration of the scroll animation in milliseconds
  behavior?: ScrollBehavior; // 'auto' | 'smooth'
};

/**
 * Hook for smooth scrolling to elements or specific positions on the page
 */
export function useSmoothScroll() {
  /**
   * Smoothly scrolls to the element with the given ID
   */
  const scrollToElement = useCallback(
    (elementId: string, options: SmoothScrollOptions = {}) => {
      const {
        offset = 80, // Default offset to account for fixed headers
        behavior = "smooth",
      } = options;

      const element = document.getElementById(elementId);
      if (!element) {
        console.warn(`Element with ID "${elementId}" not found.`);
        return;
      }

      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior,
      });
    },
    []
  );

  /**
   * Scrolls to the top of the page
   */
  const scrollToTop = useCallback((options: SmoothScrollOptions = {}) => {
    const { behavior = "smooth" } = options;
    window.scrollTo({
      top: 0,
      behavior,
    });
  }, []);

  /**
   * Scrolls to a specific Y position on the page
   */
  const scrollToPosition = useCallback(
    (position: number, options: SmoothScrollOptions = {}) => {
      const { behavior = "smooth" } = options;
      window.scrollTo({
        top: position,
        behavior,
      });
    },
    []
  );

  return {
    scrollToElement,
    scrollToTop,
    scrollToPosition,
  };
}