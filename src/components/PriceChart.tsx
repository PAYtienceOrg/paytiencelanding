"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

// 示意数据（写死）：ETH 从现价 $2,500 一路下跌，最后碰到目标价 $2,400。
const PRICES = [2500, 2508, 2498, 2515, 2522, 2510, 2490, 2470, 2475, 2455, 2450, 2452, 2440, 2445, 2425, 2430, 2415, 2420, 2400];
const TARGET = 2400;
const TICKS = [2600, 2550, 2500, 2450, 2400, 2350];
const DRAW_SECONDS = 2.5;
const PAUSE_MS = 2000;
const MAX_PLAYS = 2;

const LEFT = 70;
const RIGHT = 505;
const TOP = 16;
const BOTTOM = 236;
const MAX = 2600;
const MIN = 2350;

const x = (i: number) => LEFT + (i / (PRICES.length - 1)) * (RIGHT - LEFT);
const y = (p: number) => TOP + ((MAX - p) / (MAX - MIN)) * (BOTTOM - TOP);
const LINE = PRICES.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p).toFixed(1)}`).join(" ");
const DOT = { cx: x(PRICES.length - 1), cy: y(TARGET) };
const LABEL = "Filled at $2,400";
const money = (n: number) => `$${n.toLocaleString("en-US")}`;

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
      viewBox="0 0 520 272"
      className="h-auto w-full font-sans text-ink"
      role="img"
      aria-label="Example: ETH price falling from $2,500 to a $2,400 target, where the order fills for 5 ETH within 3 days"
    >
      {/* 纵轴刻度和网格线 */}
      {TICKS.map((t) => (
        <g key={t}>
          <line x1={LEFT} x2={RIGHT} y1={y(t)} y2={y(t)} className="stroke-rule" strokeWidth={1} />
          <text x={LEFT - 10} y={y(t) + 5} textAnchor="end" className="fill-ink text-[15px] tabular-nums">
            {money(t)}
          </text>
        </g>
      ))}

      <line x1={LEFT} x2={RIGHT} y1={y(TARGET)} y2={y(TARGET)} className="stroke-accent" strokeWidth={1.5} strokeDasharray="6 5" />
      <rect x={LEFT + 4} y={y(TARGET) - 26} width={118} height={22} className="fill-paper" />
      <text x={LEFT + 8} y={y(TARGET) - 9} className="fill-ink text-[16px] font-semibold tabular-nums">
        Target $2,400
      </text>

      <motion.path
        key={play}
        d={LINE}
        fill="none"
        className="stroke-accent"
        strokeWidth={2.25}
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
            animate={reduce ? { r: 12, opacity: 0.25 } : { r: 18, opacity: 0 }}
            transition={reduce ? { duration: 0 } : { duration: 1.4, repeat: 2, ease: "easeOut" }}
          />
          <motion.circle {...DOT} r={5.5} className="fill-accent" {...fade()} />
          <motion.g {...fade(0.15)}>
            {/* 标签框在价格线上方，引线连到成交点 */}
            <rect x={DOT.cx - 150} y={DOT.cy - 82} width={140} height={32} className="fill-paper stroke-ink" strokeWidth={1.25} />
            <text x={DOT.cx - 80} y={DOT.cy - 60} textAnchor="middle" className="fill-ink text-[16px] font-semibold tabular-nums">
              {LABEL}
            </text>
            <line x1={DOT.cx - 22} y1={DOT.cy - 50} x2={DOT.cx - 4} y2={DOT.cy - 8} className="stroke-ink" strokeWidth={1} />
          </motion.g>
        </g>
      )}

      <text x={LEFT} y={262} className="fill-ink text-[15px]">
        Today
      </text>
      <text x={RIGHT} y={262} textAnchor="end" className="fill-ink text-[15px]">
        Day 3
      </text>
    </svg>
  );
}

// 头图右侧的图表卡片：标题、现价和图。
export function PriceChartCard() {
  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <p className="font-serif text-2xl font-bold">ETH / USD</p>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">Current price</p>
          <p className="font-serif text-3xl font-bold tabular-nums text-accent">$2,500</p>
        </div>
      </div>
      <div className="mt-4">
        <PriceChart />
      </div>
    </div>
  );
}

// 预览页：/preview/price-chart
export function PriceChartPreview() {
  return (
    <main className="mx-auto max-w-xl bg-paper px-4 py-10 text-ink sm:px-6">
      <PriceChartCard />
    </main>
  );
}
