"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { formatMoney, formatPrice, niceTicks, outcomeOf, POINTS, reached, type CoinId, type Path, type Strategy } from "../../lib/simulator";

const H = 300;
const TOP = 26;
const BOTTOM = 244;

type Props = {
  coin: CoinId;
  strategy: Strategy;
  path: Path;
  target: number;
  days: number;
  progress: number; // 0..1, animation progress
  narrow?: boolean; // narrower canvas for small containers so the text is not scaled down too far
};

// Drawing only: reveals the price line by progress. Nothing is settled along the way:
// the fill or refund marker appears only at the deadline, from the price at that moment.
export function SimulatorChart({ coin, strategy, path, target, days, progress, narrow = false }: Props) {
  const W = narrow ? 360 : 560;
  const LEFT = narrow ? 60 : 72;
  const RIGHT = W - (narrow ? 12 : 20);
  const clipId = `sim-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const { prices, touchIndex } = path;
  const buy = strategy === "buy";

  // Labels sit on the far side of the target line (below it to buy low, above it to sell high), so leave room there
  const lo0 = Math.min(target, ...prices);
  const hi0 = Math.max(target, ...prices);
  const range = hi0 - lo0 || hi0 * 0.05;
  const lo = lo0 - range * (buy ? 0.55 : 0.3);
  const hi = hi0 + range * (buy ? 0.18 : 0.55);

  const x = (i: number) => LEFT + (i / (POINTS - 1)) * (RIGHT - LEFT);
  const y = (p: number) => TOP + ((hi - p) / (hi - lo)) * (BOTTOM - TOP);

  const line = prices.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p).toFixed(1)}`).join(" ");
  const area = `${line} L${x(POINTS - 1).toFixed(1)} ${BOTTOM} L${LEFT} ${BOTTOM} Z`;

  // Position of the line's head (interpolated between two points)
  const f = progress * (POINTS - 1);
  const i0 = Math.floor(f);
  const i1 = Math.min(POINTS - 1, i0 + 1);
  const headPrice = prices[i0] + (prices[i1] - prices[i0]) * (f - i0);
  const headX = LEFT + progress * (RIGHT - LEFT);
  const headY = y(headPrice);

  const done = progress >= 1;
  const outcome = outcomeOf(prices, target, strategy);
  const filled = done && outcome === "fill";
  const refunded = done && outcome === "refund";
  // Past the target before the deadline: worth saying out loud that this does not fill the order
  // Past the target before the deadline: worth saying out loud that this does not fill the order
  const early = !done && touchIndex !== null && f >= touchIndex && reached(headPrice, target, strategy);
  const endY = y(prices[POINTS - 1]);
  const ty = y(target);

  // Vertical positions on the label side of the target line
  const targetLabelY = buy ? ty + 20 : ty - 10;
  const boxY = buy ? ty + 34 : ty - 64;
  const nowLabelY = y(prices[0]) + (buy ? -10 : 22);

  const pop = { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.35 } };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full font-sans text-ink" role="img" aria-label={label(coin, strategy, target, path)}>
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={headX} height={H} />
        </clipPath>
      </defs>

      {niceTicks(lo, hi).map((t) => (
        <g key={t}>
          <line x1={LEFT} x2={RIGHT} y1={y(t)} y2={y(t)} className="stroke-rule" strokeWidth={1} />
          <text x={LEFT - 10} y={y(t) + 5} textAnchor="end" className="fill-ink/70 text-[13px] tabular-nums">
            {formatPrice(t)}
          </text>
        </g>
      ))}
      <text x={LEFT - 10} y={TOP - 10} textAnchor="end" className="fill-ink/60 text-[12px] font-semibold">
        USDC
      </text>

      {/* Dashed target line and its label */}
      <line x1={LEFT} x2={RIGHT} y1={ty} y2={ty} className="stroke-accent" strokeWidth={1.5} strokeDasharray="6 5" />
      <text x={LEFT + 6} y={targetLabelY} className="fill-accent text-[14px] font-semibold tabular-nums">
        Your target {formatMoney(target)}
      </text>

      {/* Price line and the light area under it, revealed left to right by progress */}
      <g clipPath={`url(#${clipId})`}>
        <path d={area} className="fill-accent" opacity={0.07} />
        <path d={line} fill="none" className="stroke-ink" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* The deadline: the only moment that decides the outcome */}
      <line x1={RIGHT} x2={RIGHT} y1={TOP} y2={BOTTOM} className="stroke-ink/30" strokeWidth={1} strokeDasharray="3 4" />

      {/* Start: current price */}
      <circle cx={x(0)} cy={y(prices[0])} r={4} className="fill-ink" />
      <text x={x(0) + 8} y={nowLabelY} className="fill-ink text-[14px] font-semibold tabular-nums">
        Now {formatMoney(prices[0])}
      </text>

      {/* Head of the line: the live price as it moves */}
      {!done && progress > 0 && (
        <g>
          <circle cx={headX} cy={headY} r={5} className="fill-paper stroke-ink" strokeWidth={2} />
          {/* Hide the price at the very start so it does not overlap the "Now" label */}
          {headX > LEFT + 110 && (
            <text
              x={Math.min(headX, RIGHT - 4)}
              y={headY - 12}
              textAnchor={headX > RIGHT - 60 ? "end" : "middle"}
              className="fill-ink text-[13px] font-semibold tabular-nums"
            >
              {formatMoney(headPrice)}
            </text>
          )}
        </g>
      )}

      {early && (
        <text x={RIGHT - 6} y={boxY + 20} textAnchor="end" className="fill-ink/70 text-[13px] font-semibold">
          Past your target, but not the deadline yet
        </text>
      )}

      {/* Deadline, target reached: filled at the target price */}
      {filled && (
        <motion.g {...pop} style={{ originX: `${RIGHT}px`, originY: `${ty}px` }}>
          <line x1={RIGHT} x2={RIGHT} y1={TOP} y2={BOTTOM} className="stroke-accent" strokeWidth={1.5} strokeDasharray="3 4" />
          <circle cx={RIGHT} cy={endY} r={6} className="fill-accent" />
          <rect x={RIGHT - 186} y={boxY} width={180} height={30} className="fill-accent" />
          <text x={RIGHT - 96} y={boxY + 20} textAnchor="middle" className="fill-paper text-[14px] font-semibold tabular-nums">
            {buy ? "Bought" : "Sold"} at {formatMoney(target)}
          </text>
        </motion.g>
      )}

      {/* Deadline, target not reached: refund */}
      {refunded && (
        <motion.g {...pop} style={{ originX: `${RIGHT}px`, originY: `${ty}px` }}>
          <line x1={RIGHT} x2={RIGHT} y1={TOP} y2={BOTTOM} className="stroke-ink" strokeWidth={1.5} strokeDasharray="3 4" />
          <circle cx={RIGHT} cy={endY} r={5} className="fill-paper stroke-ink" strokeWidth={2} />
          <rect x={RIGHT - 186} y={boxY} width={180} height={30} className="fill-paper stroke-ink" strokeWidth={1.25} />
          <text x={RIGHT - 96} y={boxY + 20} textAnchor="middle" className="fill-ink text-[14px] font-semibold">
            {buy ? "Money" : "Asset"} back at deadline
          </text>
        </motion.g>
      )}

      {/* Time axis */}
      <line x1={LEFT} x2={RIGHT} y1={BOTTOM} y2={BOTTOM} className="stroke-ink/40" strokeWidth={1} />
      <line x1={LEFT} x2={headX} y1={BOTTOM} y2={BOTTOM} className="stroke-accent" strokeWidth={2} />
      <text x={LEFT} y={BOTTOM + 24} className="fill-ink text-[13px]">
        Today
      </text>
      {Array.from({ length: days }, (_, d) => d + 1).map((d) => (
        <text
          key={d}
          x={LEFT + (d / days) * (RIGHT - LEFT)}
          y={BOTTOM + 24}
          textAnchor={d === days ? "end" : "middle"}
          className={`text-[13px] ${progress * days >= d ? "fill-ink font-semibold" : "fill-ink/50"}`}
        >
          {days > 3 ? d : `Day ${d}`}
        </text>
      ))}
      <text x={RIGHT} y={BOTTOM + 44} textAnchor="end" className="fill-ink/70 text-[13px]">
        Deadline: only this price counts ▲
      </text>
    </svg>
  );
}

function label(coin: CoinId, strategy: Strategy, target: number, { prices, touchIndex }: Path) {
  const start = formatMoney(prices[0]);
  const end = formatMoney(prices[prices.length - 1]);
  const goal = formatMoney(target);
  const side = strategy === "buy" ? "below" : "above";
  if (outcomeOf(prices, target, strategy) === "fill") {
    return `Example: ${coin} starts at ${start} and is at ${end} at the deadline, ${side} your ${goal} target, so the order fills at ${goal}.`;
  }
  return touchIndex === null
    ? `Example: ${coin} moves from ${start} to ${end} at the deadline without reaching your ${goal} target, so you get your money back.`
    : `Example: ${coin} goes ${side} your ${goal} target during the window but is back at ${end} at the deadline, so you get your money back.`;
}
