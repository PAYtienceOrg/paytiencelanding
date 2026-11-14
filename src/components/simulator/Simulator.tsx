"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useId, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import {
  buildPath,
  coinById,
  COINS,
  DISCOUNT_MAX,
  DISCOUNT_MIN,
  dayOf,
  formatAmount,
  formatMoney,
  formatUsdc,
  outcomeOf,
  priceAt,
  reached,
  targetFor,
  WINDOWS,
  type CoinId,
  type Scenario,
  type Strategy,
} from "../../lib/simulator";
import { eyebrow, SectionHeading } from "../sections/SectionHeading";
import { useNarrow, usePlayback } from "./hooks";
import { SimulatorChart } from "./SimulatorChart";

function Field({ label, htmlFor, aside, children }: { label: string; htmlFor?: string; aside?: ReactNode; children: ReactNode }) {
  const Label = htmlFor ? "label" : "p";
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={htmlFor} className={eyebrow}>
          {label}
        </Label>
        {aside}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

const choice = (on: boolean) =>
  `min-h-11 border px-3 py-2 text-left transition-colors ${on ? "border-accent bg-accent text-paper" : "border-ink/30 bg-paper hover:border-ink"}`;

const strategies: { id: Strategy; name: string; hint: string }[] = [
  { id: "buy", name: "Buy low", hint: "Set a price below today's" },
  { id: "sell", name: "Sell high", hint: "Set a price above today's" },
];

// Example markets, named relative to the target so they read the same for both strategies
const scenarios: { id: Scenario; text: string }[] = [
  { id: "hit", text: "Ends past target" },
  { id: "turn", text: "Touches, turns back" },
  { id: "away", text: "Never reaches it" },
];

// Try it yourself: pick a strategy, asset, amount, target price and deadline, then replay how the order settles at the deadline in different markets.
// The page's focal section: a full light-green background sets it apart from the paper-coloured sections around it.
export function Simulator() {
  const id = useId();
  // Watch the chart itself, not the whole section: stacked on a phone the section is far
  // taller than the screen, so 40% of it is never visible at once and playback never started.
  const chartRef = useRef<HTMLDivElement>(null);
  const inView = useInView(chartRef, { once: true, amount: 0.5 });
  const narrow = useNarrow(chartRef);

  const [strategy, setStrategy] = useState<Strategy>("buy");
  const [coinId, setCoinId] = useState<CoinId>("ETH");
  const [amount, setAmount] = useState(5);
  const [pct, setPct] = useState(4); // distance of the target from today's price, in percent
  const [days, setDays] = useState(3);
  const [scenario, setScenario] = useState<Scenario>("hit");
  const [replay, setReplay] = useState(0);

  const buy = strategy === "buy";
  const coin = coinById(coinId);
  const target = targetFor(coin.price, pct, strategy);
  const total = Math.round(amount * target * 100) / 100;
  const path = useMemo(() => buildPath(coin.price, target, strategy, scenario), [coin.price, target, strategy, scenario]);

  // Replay whenever any input changes
  const progress = usePlayback(`${strategy}|${coinId}|${amount}|${pct}|${days}|${scenario}|${replay}`, inView);
  const done = progress >= 1;
  // Settled once, at the deadline, by the price at that moment
  const outcome = outcomeOf(path.prices, target, strategy);
  const filled = done && outcome === "fill";
  const refunded = done && outcome === "refund";
  const live = priceAt(path.prices, progress);
  const endPrice = path.prices[path.prices.length - 1];
  const day = Math.min(days, Math.floor(progress * days) + 1);
  const touchDay = path.touchIndex === null ? null : dayOf(path.touchIndex, days);

  const pickCoin = (next: CoinId) => {
    setCoinId(next);
    setAmount(coinById(next).defaultAmount);
  };

  // Wording that differs between the two strategies
  const money = formatUsdc(total);
  const windowEnd = days === 1 ? "day ends" : `${days} days end`; // e.g. "ETH price when the 3 days end"
  const assets = formatAmount(amount, coinId);
  const goal = formatMoney(target);
  const side = buy ? "below" : "above"; // where the price has to be for the order to fill
  const otherSide = buy ? "above" : "below";
  const committed = buy ? money : assets;
  const fillTitle = buy ? `You get ${assets} at ${goal}` : `You sell ${assets} at ${goal}`;
  const refundTitle = `You get your ${committed} back`;

  const final =
    outcome === "fill"
      ? `At the deadline ${coinId} is at or ${side} your target. Filled: ${fillTitle}.`
      : `At the deadline ${coinId} is ${otherSide} your target. Not filled: ${refundTitle}.`;

  // The slider always runs from the lower price on the left to the higher price on the right
  const sliderMin = buy ? -DISCOUNT_MAX : DISCOUNT_MIN;
  const sliderMax = buy ? -DISCOUNT_MIN : DISCOUNT_MAX;
  const sliderValue = buy ? -pct : pct;
  const sliderFill = ((sliderValue - sliderMin) / (sliderMax - sliderMin)) * 100;

  return (
    <section id="simulator" aria-labelledby="simulator-title" className="scroll-mt-16 bg-mint py-14">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          id="simulator-title"
          title="See how your order plays out."
          intro="Pick a strategy, an asset and your price. Your order is settled once, at your deadline — replay how different markets end."
        />

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)] lg:gap-10">
          {/* Left: options */}
          <div className="space-y-6">
            <Field label="Strategy">
              <div className="grid grid-cols-2 gap-2" role="group" aria-label="Strategy">
                {strategies.map((s) => (
                  <button key={s.id} type="button" aria-pressed={s.id === strategy} onClick={() => setStrategy(s.id)} className={choice(s.id === strategy)}>
                    <span className="block font-serif text-lg font-bold leading-tight">{s.name}</span>
                    <span className="block text-xs opacity-80">{s.hint}</span>
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Asset">
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Asset">
                {COINS.map((c) => (
                  <button key={c.id} type="button" aria-pressed={c.id === coinId} onClick={() => pickCoin(c.id)} className={choice(c.id === coinId)}>
                    <span className="block font-serif text-lg font-bold leading-tight">{c.id}</span>
                    <span className="block text-xs opacity-80">{c.name}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-xs text-ink/70">Example price today: {formatMoney(coin.price)}</p>
            </Field>

            <Field label="How much" htmlFor={`${id}-amount`}>
              <select
                id={`${id}-amount`}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="min-h-11 w-full border border-ink/30 bg-paper px-3 py-2.5 text-sm"
              >
                {coin.amounts.map((a) => (
                  <option key={a} value={a}>
                    {formatAmount(a, coinId)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Deadline: check the price after">
              <div className="grid grid-cols-3 gap-2" role="group" aria-label="Deadline">
                {WINDOWS.map((w) => (
                  <button key={w} type="button" aria-pressed={w === days} onClick={() => setDays(w)} className={`${choice(w === days)} text-center text-sm font-semibold`}>
                    {w} day{w === 1 ? "" : "s"}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Your target price" htmlFor={`${id}-price`} aside={<span className="font-serif text-2xl font-bold tabular-nums">{goal}</span>}>
              <input
                id={`${id}-price`}
                type="range"
                min={sliderMin}
                max={sliderMax}
                step={1}
                value={sliderValue}
                aria-valuetext={`${goal}, ${pct}% ${side} today's example price`}
                onChange={(e) => setPct(Math.abs(Number(e.target.value)))}
                className="range h-11 w-full"
                style={{ "--fill": `${sliderFill}%` } as CSSProperties}
              />
              <div className="flex justify-between text-xs tabular-nums text-ink/70">
                <span>{formatMoney(targetFor(coin.price, buy ? DISCOUNT_MAX : DISCOUNT_MIN, strategy))}</span>
                <span>{formatMoney(targetFor(coin.price, buy ? DISCOUNT_MIN : DISCOUNT_MAX, strategy))}</span>
              </div>
              <p className="mt-1 text-xs font-medium text-accent">
                {pct}% {side} today&apos;s example price
              </p>
            </Field>
          </div>

          {/* Right: market switch + chart + result */}
          <div className="border border-ink/40 bg-paper">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/30 px-4 py-3">
              <div className="flex flex-wrap border border-ink/40" role="group" aria-label="Market scenario">
                {scenarios.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    aria-pressed={scenario === s.id}
                    onClick={() => (scenario === s.id ? setReplay((n) => n + 1) : setScenario(s.id))}
                    className={`min-h-11 px-3 text-sm font-semibold transition-colors ${scenario === s.id ? "bg-ink text-paper" : "hover:bg-mint"}`}
                  >
                    {s.text}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setReplay((n) => n + 1)}
                className="flex min-h-11 items-center gap-1.5 px-1 text-sm font-semibold underline-offset-4 hover:underline"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                  <path d="M3 8a5 5 0 1 0 1.5-3.5" strokeLinecap="round" />
                  <path d="M3 2.5V5h2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Replay
              </button>
            </div>

            <div ref={chartRef} className="px-2 pt-3 sm:px-4">
              <SimulatorChart coin={coinId} strategy={strategy} path={path} target={target} days={days} progress={progress} narrow={narrow} />
            </div>

            <div className="min-h-[7.5rem] border-t border-ink/30 p-4">
              <AnimatePresence mode="wait" initial={false}>
                {filled ? (
                  <motion.div key="filled" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="border-l-4 border-accent bg-mint px-4 py-3">
                    <p className={`${eyebrow} text-accent`}>
                      Deadline reached: {coinId} is at or {side} your target
                    </p>
                    <p className="mt-1 font-serif text-2xl font-bold">{fillTitle}</p>
                    <p className="mt-1 text-sm text-ink/80">
                      {touchDay !== null && touchDay < days ? `${coinId} first touched ${goal} on day ${touchDay}, but nothing happened until the deadline. ` : ""}
                      {coinId} ended the window at {formatMoney(endPrice)}. You {buy ? "pay" : "receive"} {money} — the price you set, not the market price at the
                      deadline. You keep your upfront yield.
                    </p>
                  </motion.div>
                ) : refunded ? (
                  <motion.div key="refund" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="border-l-4 border-ink bg-rule/40 px-4 py-3">
                    <p className={eyebrow}>
                      Deadline reached: {coinId} is {otherSide} your target
                    </p>
                    <p className="mt-1 font-serif text-2xl font-bold">{refundTitle}</p>
                    <p className="mt-1 text-sm text-ink/80">
                      {touchDay === null
                        ? `${coinId} ended the window at ${formatMoney(endPrice)}, ${otherSide} your ${goal} target.`
                        : `${coinId} went ${side} ${goal} on day ${touchDay}, but ended the window at ${formatMoney(endPrice)}. Only the price at the deadline counts.`}{" "}
                      You keep your upfront yield.
                    </p>
                  </motion.div>
                ) : (
                  <motion.div key="watching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="border-l-4 border-dashed border-ink/30 px-4 py-3" aria-hidden>
                    <p className={eyebrow}>
                      Day {day} of {days}
                    </p>
                    <p className="mt-1 font-serif text-2xl font-bold tabular-nums">
                      {coinId} at {formatMoney(live)}
                    </p>
                    <p className="mt-1 text-sm text-ink/80">
                      {reached(live, target, strategy) ? `Past your ${goal} target, but nothing happens yet. ` : ""}Only the price at the deadline counts.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <p className="sr-only" aria-live="polite">
                {done ? final : ""}
              </p>
            </div>
            <p className="border-t border-ink/30 px-4 py-2 text-xs text-ink/60">
              Simulated example with illustrative prices — not live market data or a prediction. Crypto prices can move in either direction.
            </p>
          </div>
        </div>

        {/* Full width under both columns: the order at a glance. Commit → yield now, then the deadline price picks one of two outcomes. */}
        <div className="mt-8 border border-accent bg-paper">
          {/* Step 1: what goes in, what you get straight away */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 bg-accent px-4 py-3 text-paper sm:px-6">
            <p className="flex items-baseline gap-2">
              <span className={eyebrow}>You commit</span>
              <span className="font-serif text-2xl font-bold tabular-nums">{committed}</span>
            </p>
            <span aria-hidden className="text-xl">
              →
            </span>
            <p className="flex items-baseline gap-2">
              <span className="font-serif text-2xl font-bold">+ Upfront yield</span>
              <span className="text-xs opacity-80">paid now, yours to keep</span>
            </p>
          </div>

          {/* Step 2: a price scale split at the target. The deadline price lands on one side. */}
          <div className="px-4 pb-4 pt-5 sm:px-6">
            <p className={eyebrow}>{coinId} price when the {windowEnd}</p>
            <div className="relative mt-8">
              <p className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap bg-accent px-2 py-0.5 text-xs font-semibold tabular-nums text-paper">
                Target {goal}
              </p>
              <div aria-hidden className="absolute -top-1 bottom-0 left-1/2 border-l-2 border-dashed border-accent" />
              <ul className="grid grid-cols-2" aria-label={`Outcomes at the deadline, split at ${goal}`}>
                {[buy ? "fill" : "refund", buy ? "refund" : "fill"].map((kind, i) => {
                  const fill = kind === "fill";
                  const range = i === 0 ? (buy ? `At or below ${goal}` : `Below ${goal}`) : buy ? `Above ${goal}` : `At or above ${goal}`;
                  return (
                    <li key={kind} className={`${fill ? "bg-mint" : "bg-rule/40"} ${i === 0 ? "pr-4 sm:pr-6" : "pl-4 text-right sm:pl-6"} py-4 ${i === 0 ? "pl-3" : "pr-3"}`}>
                      <p className="text-xs tabular-nums text-ink/70">
                        {i === 0 ? "← " : ""}
                        {range}
                        {i === 1 ? " →" : ""}
                      </p>
                      <p className={`mt-1 font-serif text-lg font-bold leading-snug sm:text-xl ${fill ? "text-accent" : ""}`}>
                        <span aria-hidden>{fill ? "✓ " : "↺ "}</span>
                        {fill ? (buy ? `You get ${assets}` : `You get ${money}`) : refundTitle}
                      </p>
                      <p className="mt-0.5 text-xs text-ink/70">{fill ? "Filled at your price" : "Not filled"}</p>
                    </li>
                  );
                })}
              </ul>
            </div>
            <p className="mt-3 text-xs text-ink/70">Only the deadline price counts — touching {goal} earlier doesn&apos;t fill.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
