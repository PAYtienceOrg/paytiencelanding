"use client";

import { useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildPath, coinById, formatAmount, formatMoney, POINTS, priceAt, targetFor, type Scenario } from "../../lib/simulator";
import { useNarrow, usePlayback } from "./hooks";
import { SimulatorChart } from "./SimulatorChart";

// 头图示例：5 ETH，目标 $2,400，等 3 天
const COIN = coinById("ETH");
const AMOUNT = 5;
const TARGET = targetFor(COIN.price, 4);
const DAYS = 3;
const TOTAL = AMOUNT * TARGET;
const PAUSE_MS = 2500;
const AUTO_SWITCHES = 3; // 自动切换几次后停下，不一直闪

const scenarios: { id: Scenario; label: string; arrow: string }[] = [
  { id: "drop", label: "If it drops", arrow: "↘" },
  { id: "rise", label: "If it rises", arrow: "↗" },
];

// 头图右侧：自动演示“跌了就成交 / 涨了就退款”，也可以点击切换。
export function HeroChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const narrow = useNarrow();

  const [scenario, setScenario] = useState<Scenario>("drop");
  const [switches, setSwitches] = useState(0);
  const [touched, setTouched] = useState(false);
  const [replay, setReplay] = useState(0);

  const path = useMemo(() => buildPath(COIN.price, TARGET, scenario), [scenario]);
  const progress = usePlayback(`${scenario}|${replay}`, inView);
  const done = progress >= 1;
  const filled = scenario === "drop" && path.hitIndex !== null && progress * (POINTS - 1) >= path.hitIndex;

  // 播完停一会儿，自动换到另一种情况；用户点过就不再自动切换
  useEffect(() => {
    if (!done || touched || switches >= AUTO_SWITCHES) return;
    const t = window.setTimeout(() => {
      setScenario((s) => (s === "drop" ? "rise" : "drop"));
      setSwitches((n) => n + 1);
    }, PAUSE_MS);
    return () => window.clearTimeout(t);
  }, [done, touched, switches]);

  const pick = (s: Scenario) => {
    setTouched(true);
    if (s === scenario) setReplay((n) => n + 1);
    else setScenario(s);
  };

  const result =
    scenario === "drop"
      ? filled
        ? { tone: "fill", text: `Filled at ${formatMoney(TARGET)} — you get ${formatAmount(AMOUNT, COIN.id)}.` }
        : null
      : done
        ? { tone: "refund", text: `Not reached by day ${DAYS} — ${formatMoney(TOTAL)} refunded.` }
        : null;

  return (
    <div ref={ref}>
      <div className="flex items-end justify-between gap-4">
        <p className="font-serif text-2xl font-bold">ETH / USD</p>
        <div className="text-right">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">Example price</p>
          <p className="font-serif text-3xl font-bold tabular-nums text-accent">{formatMoney(COIN.price)}</p>
        </div>
      </div>

      <div className="mt-4 inline-flex border border-ink/40" role="group" aria-label="Example outcome">
        {scenarios.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={scenario === s.id}
            onClick={() => pick(s.id)}
            className={`min-h-11 px-4 text-sm font-semibold transition-colors ${scenario === s.id ? "bg-ink text-paper" : "hover:bg-mint"}`}
          >
            <span aria-hidden className="mr-1">
              {s.arrow}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <SimulatorChart coin={COIN.id} path={path} target={TARGET} scenario={scenario} days={DAYS} progress={progress} narrow={narrow} />
      </div>

      <p
        aria-live="polite"
        className={`mt-2 min-h-12 border-l-4 px-3 py-2 text-sm font-semibold transition-colors ${
          result?.tone === "fill" ? "border-accent bg-mint" : result ? "border-ink bg-white/50" : "border-transparent text-ink/60"
        }`}
      >
        {result ? result.text : <span aria-hidden>Watching ETH at {formatMoney(priceAt(path.prices, progress))}…</span>}
      </p>

      <p className="mt-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-t border-rule pt-3 text-xs text-ink/70">
        <span>
          Example: {formatAmount(AMOUNT, COIN.id)}, {formatMoney(TARGET)} target, {DAYS}-day window.
        </span>
        <a href="#simulator" className="inline-flex min-h-11 items-center font-semibold text-accent underline-offset-4 hover:underline">
          Try your own numbers ↓
        </a>
      </p>
    </div>
  );
}
