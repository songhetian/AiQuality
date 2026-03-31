import { useEffect, useRef, useState } from 'react';

interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
}

export function CountUp({ to, from = 0, duration = 2 }: CountUpProps) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<number | null>(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    if (!nodeRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(nodeRef.current);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!hasStarted || !nodeRef.current) {
      return;
    }

    const startValue = from;
    const delta = to - startValue;
    const durationMs = Math.max(duration, 0.3) * 1000;
    const startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startTime) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + delta * eased;

      if (nodeRef.current) {
        nodeRef.current.textContent = Intl.NumberFormat().format(Math.floor(current));
      }

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      }
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [duration, from, hasStarted, to]);

  return <span ref={nodeRef}>{Intl.NumberFormat().format(from)}</span>;
}
