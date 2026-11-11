"use client";

import { motion } from "framer-motion";
import { useId } from "react";
import { formatMoney, niceTicks, POINTS, type CoinId, type Path, type Scenario } from "../../lib/simulator";

const H = 300;
const TOP = 26;
const BOTTOM = 244;

type Props = {
  coin: CoinId;
  path: Path;
  target: number;
  scenario: Scenario;
  days: number;
  progress: number; // 0..1，动画进度
  narrow?: boolean; // 手机上用更窄的画布，文字不会被缩得太小
};

// 只负责画：根据 progress 揭开价格线，碰到目标价时出现成交点，到期时出现退款标记。
export function SimulatorChart({ coin, path, target, scenario, days, progress, narrow = false }: Props) {
  const W = narrow ? 360 : 560;
  const LEFT = narrow ? 60 : 72;
  const RIGHT = W - (narrow ? 12 : 20);
  const clipId = `sim-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const { prices, hitIndex } = path;

  const lo0 = Math.min(target, ...prices);
  const hi0 = Math.max(target, ...prices);
  const range = hi0 - lo0 || hi0 * 0.05;
  const lo = lo0 - range * 0.55; // 目标价下方留出放标签的空间
  const hi = hi0 + range * 0.18;

  const x = (i: number) => LEFT + (i / (POINTS - 1)) * (RIGHT - LEFT);
  const y = (p: number) => TOP + ((hi - p) / (hi - lo)) * (BOTTOM - TOP);

  const line = prices.map((p, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)} ${y(p).toFixed(1)}`).join(" ");
  const area = `${line} L${x(POINTS - 1).toFixed(1)} ${BOTTOM} L${LEFT} ${BOTTOM} Z`;

  // 线头位置（在两个点之间插值）
  const f = progress * (POINTS - 1);
  const i0 = Math.floor(f);
  const i1 = Math.min(POINTS - 1, i0 + 1);
  const headPrice = prices[i0] + (prices[i1] - prices[i0]) * (f - i0);
  const headX = LEFT + progress * (RIGHT - LEFT);
  const headY = y(headPrice);

  const filled = scenario === "drop" && hitIndex !== null && f >= hitIndex;
  const done = progress >= 1;
  const refunded = scenario === "rise" && done;
  const ty = y(target);

  const pop = { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.35 } };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full font-sans text-ink" role="img" aria-label={label(coin, scenario, target, prices)}>
      <defs>
        <clipPath id={clipId}>
          <rect x={0} y={0} width={headX} height={H} />
        </clipPath>
      </defs>

      {niceTicks(lo, hi).map((t) => (
        <g key={t}>
          <line x1={LEFT} x2={RIGHT} y1={y(t)} y2={y(t)} className="stroke-rule" strokeWidth={1} />
          <text x={LEFT - 10} y={y(t) + 5} textAnchor="end" className="fill-ink/70 text-[13px] tabular-nums">
            {formatMoney(t)}
          </text>
        </g>
      ))}

      {/* 目标价虚线和标签（放在线下方左侧，两种情景下这里都不会被价格线挡住） */}
      <line x1={LEFT} x2={RIGHT} y1={ty} y2={ty} className="stroke-accent" strokeWidth={1.5} strokeDasharray="6 5" />
      <text x={LEFT + 6} y={ty + 20} className="fill-accent text-[14px] font-semibold tabular-nums">
        Your target {formatMoney(target)}
      </text>

      {/* 价格线和下方浅色面积，按进度从左往右揭开 */}
      <g clipPath={`url(#${clipId})`}>
        <path d={area} className="fill-accent" opacity={0.07} />
        <path d={line} fill="none" className="stroke-ink" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* 起点：现价 */}
      <circle cx={x(0)} cy={y(prices[0])} r={4} className="fill-ink" />
      <text x={x(0) + 8} y={y(prices[0]) - 10} className="fill-ink text-[14px] font-semibold tabular-nums">
        Now {formatMoney(prices[0])}
      </text>

      {/* 线头：跑动中的实时价格 */}
      {!done && progress > 0 && (
        <g>
          <circle cx={headX} cy={headY} r={5} className="fill-paper stroke-ink" strokeWidth={2} />
          {/* 刚起步时不显示价格，免得和 “Now” 标签重叠 */}
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

      {/* 成交 */}
      {filled && hitIndex !== null && (
        <g>
          <motion.circle
            cx={x(hitIndex)}
            cy={ty}
            fill="none"
            className="stroke-accent"
            strokeWidth={1.5}
            initial={{ r: 6, opacity: 0.8 }}
            animate={{ r: 22, opacity: 0 }}
            transition={{ duration: 1.2, repeat: 2, ease: "easeOut" }}
          />
          <circle cx={x(hitIndex)} cy={ty} r={6} className="fill-accent" />
          <motion.g {...pop} style={{ originX: `${x(hitIndex)}px`, originY: `${ty}px` }}>
            <rect x={x(hitIndex) - 78} y={ty + 30} width={156} height={30} className="fill-accent" />
            <text x={x(hitIndex)} y={ty + 50} textAnchor="middle" className="fill-paper text-[14px] font-semibold tabular-nums">
              Filled at {formatMoney(target)}
            </text>
            <line x1={x(hitIndex)} x2={x(hitIndex)} y1={ty + 7} y2={ty + 30} className="stroke-accent" strokeWidth={1.25} />
          </motion.g>
        </g>
      )}

      {/* 到期没碰到：退款 */}
      {refunded && (
        <motion.g {...pop} style={{ originX: `${RIGHT}px`, originY: `${ty}px` }}>
          <line x1={RIGHT} x2={RIGHT} y1={TOP} y2={BOTTOM} className="stroke-ink" strokeWidth={1} strokeDasharray="3 4" />
          <circle cx={RIGHT} cy={y(prices[POINTS - 1])} r={5} className="fill-ink" />
          <rect x={RIGHT - 168} y={ty + 30} width={162} height={30} className="fill-paper stroke-ink" strokeWidth={1.25} />
          <text x={RIGHT - 87} y={ty + 50} textAnchor="middle" className="fill-ink text-[14px] font-semibold">
            Deadline · refunded
          </text>
        </motion.g>
      )}

      {/* 时间轴 */}
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
    </svg>
  );
}

function label(coin: CoinId, scenario: Scenario, target: number, prices: number[]) {
  const start = formatMoney(prices[0]);
  return scenario === "drop"
    ? `Example: ${coin} falls from ${start} and reaches your ${formatMoney(target)} target, so the order fills.`
    : `Example: ${coin} rises from ${start} to ${formatMoney(prices[prices.length - 1])} without reaching your ${formatMoney(target)} target, so the order is refunded.`;
}
