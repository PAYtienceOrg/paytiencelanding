"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type CountUpProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
};

const format = (n: number, prefix: string, suffix: string) => `${prefix}${Math.round(n).toLocaleString("en-US")}${suffix}`;

const noop = () => () => {};

// Counts up from 0 to the target once in view; with reduced motion it shows the final value right away.
// Server rendering outputs the final value, so without JS (crawlers, slow loads) it never shows 0.
export function CountUp({ value, prefix = "", suffix = "", duration = 0.8, className }: CountUpProps) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [current, setCurrent] = useState(0);
  const hydrated = useSyncExternalStore(noop, () => true, () => false);

  useEffect(() => {
    if (reduce || !inView) return;
    const controls = animate(0, value, { duration, ease: "easeOut", onUpdate: setCurrent });
    return () => controls.stop();
  }, [reduce, inView, value, duration]);

  const shown = reduce || !hydrated ? value : current;

  return (
    <span ref={ref} className={`tabular-nums ${className ?? ""}`.trim()}>
      {format(shown, prefix, suffix)}
    </span>
  );
}
