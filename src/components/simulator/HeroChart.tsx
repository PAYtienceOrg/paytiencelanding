"use client";

import { useInView } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { buildPath, coinById, formatAmount, formatMoney, priceAt, targetFor, type Strategy } from "../../lib/simulator";
import { useNarrow, usePlayback } from "./hooks";
import { SimulatorChart } from "./SimulatorChart";

// Hero example: 5 ETH, a target 4% away from today's price, settled once at the 3-day deadline
const COIN = coinById("ETH");
const AMOUNT = 5;
const DAYS = 3;
const PAUSE_MS = 2500;
const PLAY_SECONDS = 5; // slower than the simulator, so the notes on the chart can be read
const AUTO_SWITCHES = 3; // stop after this many automatic switches instead of flipping forever

const strategies: { id: Strategy; label: string; arrow: string }[] = [
  { id: "buy", label: "Buy low", arrow: "↘" },
  { id: "sell", label: "Sell high", arrow: "↗" },
];

// Right side of the hero: auto-plays the two strategies, buy low and sell high; can also be switched by clicking.
// Both examples reach the target on day 2 and are only settled by the price at the day-3 deadline:
// buy low turns back above the target in between, sell high stays above it.
export function HeroChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  const chartRef = useRef<HTMLDivElement>(null);
  const narrow = useNarrow(chartRef);

  const [strategy, setStrategy] = useState<Strategy>("buy");
  const [switches, setSwitches] = useState(0);
  const [touched, setTouched] = useState(false);
  const [replay, setReplay] = useState(0);

  const target = targetFor(COIN.price, 4, strategy);
  const path = useMemo(() => buildPath(COIN.price, target, strategy, "hit"), [target, strategy]);
  const progress = usePlayback(`${strategy}|${replay}`, inView, PLAY_SECONDS);
  const done = progress >= 1;
  const buy = strategy === "buy";

  // Pause after playback, then switch to the other strategy; once the user has clicked, stop switching automatically
  useEffect(() => {
    if (!done || touched || switches >= AUTO_SWITCHES) return;
    const t = window.setTimeout(() => {
      setStrategy((s) => (s === "buy" ? "sell" : "buy"));
      setSwitches((n) => n + 1);
    }, PAUSE_MS);
    return () => window.clearTimeout(t);
  }, [done, touched, switches]);

  const pick = (s: Strategy) => {
    setTouched(true);
    if (s === strategy) setReplay((n) => n + 1);
    else setStrategy(s);
  };

  // Nothing happens before the deadline: the order fills once, at the price you set, on day 3
  const result = buy
    ? `Day ${DAYS} deadline: ETH is below ${formatMoney(target)} — you buy ${formatAmount(AMOUNT, COIN.id)} at ${formatMoney(target)}.`
    : `Day ${DAYS} deadline: ETH is above ${formatMoney(target)} — you sell ${formatAmount(AMOUNT, COIN.id)} at ${formatMoney(target)}.`;

  return (
    <div ref={ref}>
      <div className="flex items-end justify-between gap-4">
        <p className="font-serif text-2xl font-bold">ETH / USDC</p>
        <div className="text-right">
          <p className="text-sm font-semibold">Example price</p>
          <p className="font-serif text-3xl font-bold tabular-nums text-accent">{formatMoney(COIN.price)}</p>
        </div>
      </div>

      <div className="mt-4 inline-flex border border-ink/40" role="group" aria-label="Strategy">
        {strategies.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={strategy === s.id}
            onClick={() => pick(s.id)}
            className={`min-h-11 px-4 text-sm font-semibold transition-colors ${strategy === s.id ? "bg-ink text-paper" : "hover:bg-mint"}`}
          >
            <span aria-hidden className="mr-1">
              {s.arrow}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      <div ref={chartRef} className="mt-3">
        <SimulatorChart coin={COIN.id} strategy={strategy} path={path} target={target} days={DAYS} progress={progress} narrow={narrow} />
      </div>

      <p
        aria-live="polite"
        className={`mt-2 min-h-12 border-l-4 px-3 py-2 text-sm font-semibold transition-colors ${
          done ? "border-accent bg-mint" : "border-transparent text-ink/60"
        }`}
      >
        {done ? result : <span aria-hidden>ETH at {formatMoney(priceAt(path.prices, progress))} — decided at the day-{DAYS} deadline…</span>}
      </p>
    </div>
  );
}
