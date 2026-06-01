import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for scroll-driven animation based on element position (offset Y)
 *
 * Instead of time-based transitions, this hook calculates opacity and transform
 * based on how far the element has scrolled into the viewport.
 *
 * Usage:
 * 1. Call useScrollReveal(isReady) in your component (isReady = true when content is loaded)
 * 2. Add 'scroll-reveal' or 'scroll-reveal-scale' class to elements you want to animate
 *
 * @param isReady - Boolean indicating when the hook should start observing
 */
export function useScrollReveal(isReady: boolean = true): void {
  const elementsRef = useRef<Element[]>([]);
  const rafRef = useRef<number | null>(null);

  const updateElements = useCallback(() => {
    const windowHeight = window.innerHeight;

    elementsRef.current.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const htmlEl = el as HTMLElement;

      // Calculate how far the element is into the viewport
      // Start animation when element is 100px below viewport bottom
      // Complete animation when element center reaches viewport center
      const startPoint = windowHeight + 100; // Start 100px below viewport
      const endPoint = windowHeight * 0.4; // Complete at 40% from top

      // Element's top position relative to animation range
      const elementTop = rect.top;

      // Calculate progress (0 = not started, 1 = complete)
      let progress = 0;

      if (elementTop >= startPoint) {
        // Element is below viewport - not started
        progress = 0;
      } else if (elementTop <= endPoint) {
        // Element has passed the end point - fully visible
        progress = 1;
      } else {
        // Element is in the animation range
        progress = (startPoint - elementTop) / (startPoint - endPoint);
      }

      // Clamp progress between 0 and 1
      progress = Math.max(0, Math.min(1, progress));

      // Apply easing for smoother animation
      const easedProgress = easeOutCubic(progress);

      // Check if this is a scale animation or translate animation
      const isScale = el.classList.contains('scroll-reveal-scale');

      if (isScale) {
        // Scale animation: 0.9 -> 1
        const scale = 0.9 + (0.1 * easedProgress);
        htmlEl.style.opacity = `${easedProgress}`;
        htmlEl.style.transform = `scale(${scale})`;
      } else {
        // Translate Y animation: 80px -> 0
        const translateY = 80 * (1 - easedProgress);
        htmlEl.style.opacity = `${easedProgress}`;
        htmlEl.style.transform = `translateY(${translateY}px)`;
      }
    });
  }, []);

  useEffect(() => {
    if (!isReady) return;

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
      // Get all scroll-reveal elements
      elementsRef.current = Array.from(
        document.querySelectorAll('.scroll-reveal, .scroll-reveal-scale')
      );

      // Initial update
      updateElements();

      // Scroll handler with requestAnimationFrame for smooth updates
      const handleScroll = () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
        rafRef.current = requestAnimationFrame(updateElements);
      };

      window.addEventListener('scroll', handleScroll, { passive: true });
      window.addEventListener('resize', updateElements, { passive: true });

      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', updateElements);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      };
    }, 100);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [isReady, updateElements]);
}

// Easing function for smoother animation
function easeOutCubic(x: number): number {
  return 1 - Math.pow(1 - x, 3);
}

export default useScrollReveal;
