import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface UseCountUpOptions {
  duration?: number;
  delay?: number;
  ease?: string;
}

export function useCountUp(
  endValue: number,
  options: UseCountUpOptions = {}
) {
  const { duration = 0.8, delay = 0, ease = 'power2.out' } = options;
  const [displayValue, setDisplayValue] = useState(0);
  const valueRef = useRef({ value: 0 });
  const hasAnimated = useRef(false);

  useEffect(() => {
    // Only animate once on mount or when endValue changes significantly
    if (hasAnimated.current && Math.abs(valueRef.current.value - endValue) < 1) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.to(valueRef.current, {
        value: endValue,
        duration,
        delay,
        ease,
        onUpdate: () => {
          setDisplayValue(Math.round(valueRef.current.value));
        },
        onComplete: () => {
          hasAnimated.current = true;
        }
      });
    });

    return () => ctx.revert();
  }, [endValue, duration, delay, ease]);

  return displayValue;
}
