import { useEffect, useRef, useState } from 'react';

interface UseCountUpOptions {
  duration?: number;
  delay?: number;
}

/**
 * Animates a number counting up from 0 to endValue.
 * Uses requestAnimationFrame instead of GSAP for zero-dependency performance.
 */
export function useCountUp(
  endValue: number,
  options: UseCountUpOptions = {}
) {
  const { duration = 0.8, delay = 0 } = options;
  const [displayValue, setDisplayValue] = useState(0);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (hasAnimated.current && displayValue === endValue) {
      return;
    }

    let animationFrameId: number;
    let startTime: number | null = null;
    const startValue = 0;

    const delayMs = delay * 1000;
    const durationMs = duration * 1000;

    const timeoutId = setTimeout(() => {
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;
        const progress = Math.min(elapsed / durationMs, 1);

        // Ease-out quadratic: decelerating to zero velocity
        const easedProgress = 1 - (1 - progress) * (1 - progress);
        const current = Math.round(startValue + (endValue - startValue) * easedProgress);
        
        setDisplayValue(current);

        if (progress < 1) {
          animationFrameId = requestAnimationFrame(animate);
        } else {
          hasAnimated.current = true;
        }
      };

      animationFrameId = requestAnimationFrame(animate);
    }, delayMs);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [endValue, duration, delay]);

  return displayValue;
}
