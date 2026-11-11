"use client";

import { animate, useReducedMotion } from "framer-motion";
import { useEffect, useState, useSyncExternalStore } from "react";

const DURATION = 3.2;
const DELAY_MS = 300;

// 动画进度 0..1。runKey 一变就从头播放；进度和 runKey 绑定，旧进度自动作废（显示为 0）。
// enabled 为 false（还没滚到）时停在 0；系统开了“减少动画”时直接是 1。
export function usePlayback(runKey: string, enabled: boolean, duration = DURATION) {
  const reduce = useReducedMotion();
  const [run, setRun] = useState({ key: "", p: 0 });

  useEffect(() => {
    if (!enabled || reduce) return;
    let controls: { stop: () => void } | undefined;
    // 稍等一下再开始，拖滑块时不会每一格都重播
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

// 屏幕是否窄于 640px（服务端默认按宽屏渲染）
const NARROW = "(max-width: 639px)";
const isNarrow = () => typeof window.matchMedia === "function" && window.matchMedia(NARROW).matches;
const subscribeNarrow = (cb: () => void) => {
  if (typeof window.matchMedia !== "function") return () => {};
  const mq = window.matchMedia(NARROW);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function useNarrow() {
  return useSyncExternalStore(subscribeNarrow, isNarrow, () => false);
}
