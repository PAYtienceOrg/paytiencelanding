"use client";

import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useState, type RefObject } from "react";

const DURATION = 3.2;
const DELAY_MS = 300;

// Animation progress 0..1. Restarts whenever runKey changes; progress is tied to runKey, so stale progress is discarded (reads as 0).
// Stays at 0 while enabled is false (not scrolled into view yet); with the system's reduced-motion setting it is 1 right away.
export function usePlayback(runKey: string, enabled: boolean, duration = DURATION) {
  const reduce = useReducedMotion();
  const [run, setRun] = useState({ key: "", p: 0 });

  useEffect(() => {
    if (!enabled || reduce) return;
    let controls: { stop: () => void } | undefined;
    // Wait a moment before starting so dragging the slider does not replay on every step
    const t = window.setTimeout(() => {
      controls = animate(0, 1, { duration, ease: "linear", onUpdate: (p) => setRun({ key: runKey, p }) });
    }, DELAY_MS);
    return () => {
      window.clearTimeout(t);
      controls?.stop();
    };
  }, [runKey, enabled, reduce, duration]);

  if (reduce) return 1;
  return run.key === runKey ? run.p : 0;
}

// Whether the chart's container is too narrow for the wide canvas. Measured on the
// container, not the viewport: in the two-column hero on tablets the chart is only
// ~320px wide even though the screen is not, and the wide canvas would shrink its
// labels to an unreadable size. Renders wide until measured (and on the server).
const NARROW_BELOW = 460;

export function useNarrow(ref: RefObject<HTMLElement | null>) {
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver !== "function") return;
    const observer = new ResizeObserver(([entry]) => setNarrow(entry.contentRect.width < NARROW_BELOW));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return narrow;
}
