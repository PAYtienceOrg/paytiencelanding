"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

// 示意数据（写死）：ETH 从现价 $2,500 一路下跌，最后碰到目标价 $2,400。
const PRICES = [2500, 2508, 2498, 2515, 2522, 2510, 2490, 2470, 2475, 2455, 2450, 2452, 2440, 2445, 2425, 2430, 2415, 2420, 2400];
const TARGET = 2400;
const NOW = 2500;

const DRAW_SECONDS = 2.5;
const PAUSE_MS = 2000;
const MAX_PLAYS = 2;

const LEFT = 20;
const RIGHT = 500;
const AXIS_Y = 270;
const x = (i: number) => LEFT + (i / (PRICES.length - 1)) * (RIGHT - LEFT);
const y = (p: number) => 40 + (2600 - p) * 0.84;

const LINE = PRICES.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p).toFixed(1)}`).join(" ");
const DOT = { cx: x(PRICES.length - 1), cy: y(TARGET) };
const LABEL = "Filled at $2,400 · 5 ETH";

// 价格线自己画出来，碰到目标价虚线时出现成交点；播完停 2 秒后再播一次，最后停在成交状态。
export function PriceChart() {
  const reduce = useReducedMotion();
  const [play, setPlay] = useState(1);
  const [drawn, setDrawn] = useState(false);
  const filled = reduce || drawn;

  useEffect(() => {
    if (reduce || !drawn || play >= MAX_PLAYS) return;
    const id = setTimeout(() => {
      setDrawn(false);
      setPlay((n) => n + 1);
    }, PAUSE_MS);
    return () => clearTimeout(id);
  }, [reduce, drawn, play]);

  const fade = (delay = 0) => ({
    initial: reduce ? false : { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4, delay },
  });

  return (
    <svg
      viewBox="0 0 520 320"
      className="h-auto w-full font-sans text-ink"
      role="img"
      aria-label="ETH price falling from $2,500 to the $2,400 target, where the order fills for 5 ETH, over a 3-day window"
    >
      <line x1={LEFT} x2={RIGHT} y1={y(TARGET)} y2={y(TARGET)} className="stroke-accent" strokeWidth={1.25} strokeDasharray="6 5" />
      <text x={LEFT + 4} y={y(TARGET) - 8} className="fill-accent text-[15px] font-semibold tabular-nums">
        Target $2,400
      </text>
      <text x={RIGHT} y={y(NOW) - 52} textAnchor="end" className="fill-ink text-[15px] font-semibold tabular-nums">
        Now $2,500
      </text>

      <motion.path
        key={play}
        d={LINE}
        fill="none"
        className="stroke-ink"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={reduce ? false : { pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: DRAW_SECONDS, ease: "easeInOut" }}
        onAnimationComplete={() => setDrawn(true)}
      />

      {filled && (
        <g key={`fill-${play}`}>
          <motion.circle
            {...DOT}
            r={5}
            fill="none"
            className="stroke-accent"
            strokeWidth={1.25}
            initial={{ r: 5, opacity: 0.7 }}
            animate={reduce ? { r: 14, opacity: 0.25 } : { r: 18, opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 1.4, repeat: Infinity, ease: "easeOut" }}
          />
          <motion.circle {...DOT} r={5} className="fill-accent" {...fade()} />
          <motion.g {...fade(0.15)}>
            <rect x={DOT.cx - 200} y={DOT.cy - 66} width={200} height={30} className="fill-paper stroke-ink" strokeWidth={1} />
            <text x={DOT.cx - 100} y={DOT.cy - 46} textAnchor="middle" className="fill-ink text-[14px] font-semibold tabular-nums">
              {LABEL}
            </text>
            <line x1={DOT.cx - 24} y1={DOT.cy - 36} x2={DOT.cx - 7} y2={DOT.cy - 8} className="stroke-ink" strokeWidth={1} />
          </motion.g>
        </g>
      )}

      <line x1={LEFT} x2={RIGHT} y1={AXIS_Y} y2={AXIS_Y} className="stroke-rule" strokeWidth={1} />
      <motion.line
        key={`progress-${play}`}
        x1={LEFT}
        x2={RIGHT}
        y1={AXIS_Y}
        y2={AXIS_Y}
        className="stroke-accent"
        strokeWidth={1.5}
        initial={{ pathLength: reduce ? 1 : 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: DRAW_SECONDS, ease: "linear" }}
      />
      <text x={LEFT} y={298} className="fill-ink text-[14px]">
        Today
      </text>
      <text x={(LEFT + RIGHT) / 2} y={298} textAnchor="middle" className="fill-ink text-[14px] font-semibold">
        3-day window
      </text>
      <text x={RIGHT} y={298} textAnchor="end" className="fill-ink text-[14px]">
        Day 3
      </text>
    </svg>
  );
}

// 预览页：/preview/price-chart
export function PriceChartPreview() {
  return (
    <main className="mx-auto max-w-3xl bg-paper px-4 py-10 text-ink sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-[0.2em]">ETH / USD</p>
      <PriceChart />
    </main>
  );
}
