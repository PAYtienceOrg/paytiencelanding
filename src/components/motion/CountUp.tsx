"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type CountUpProps = {
  value: number;
  prefix?: string;
  duration?: number;
  className?: string;
};

const format = (n: number, prefix: string) => `${prefix}${Math.round(n).toLocaleString("en-US")}`;

const noop = () => () => {};

// 进入视口后数字从 0 滚动到目标值；减少动画时直接显示最终值。
// 服务端渲染直接输出最终值，没跑 JS（爬虫、加载慢）时不会显示 $0。
export function CountUp({ value, prefix = "", duration = 0.8, className }: CountUpProps) {
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
      {format(shown, prefix)}
    </span>
  );
}
