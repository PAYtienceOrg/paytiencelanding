"use client";

import { animate, AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import {
  buildPath,
  coinById,
  COINS,
  DISCOUNT_MAX,
  DISCOUNT_MIN,
  fillDay,
  formatAmount,
  formatMoney,
  POINTS,
  priceAt,
  targetFor,
  WINDOWS,
  type CoinId,
  type Scenario,
} from "../../lib/simulator";
import { eyebrow, SectionHeading } from "../sections/SectionHeading";
import { SimulatorChart } from "./SimulatorChart";

const DURATION = 3.2;
const DELAY_MS = 300;

// 屏幕是否窄于 640px（服务端默认按宽屏渲染）
const NARROW = "(max-width: 639px)";
const isNarrow = () => typeof window.matchMedia === "function" && window.matchMedia(NARROW).matches;
const subscribeNarrow = (cb: () => void) => {
  if (typeof window.matchMedia !== "function") return () => {};
  const mq = window.matchMedia(NARROW);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

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
  `border px-3 py-2 text-left transition-colors ${on ? "border-accent bg-accent text-paper" : "border-ink/30 bg-white/40 hover:border-ink"}`;

// 上手试一试：选币、数量、目标价、等待天数，然后看“跌”和“涨”两种走势的动画和结果。
export function Simulator() {
  const id = useId();
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });

  const narrow = useSyncExternalStore(subscribeNarrow, isNarrow, () => false);
  const [coinId, setCoinId] = useState<CoinId>("ETH");
  const [amount, setAmount] = useState(5);
  const [discount, setDiscount] = useState(4);
  const [days, setDays] = useState(3);
  const [scenario, setScenario] = useState<Scenario>("drop");
  const [replay, setReplay] = useState(0);

  const coin = coinById(coinId);
  const target = targetFor(coin.price, discount);
  const total = Math.round(amount * target * 100) / 100;
  const path = useMemo(() => buildPath(coin.price, target, scenario), [coin.price, target, scenario]);

  // 任何输入变了都重新播放。进度和这组输入绑定，输入一变旧进度自动作废（显示为 0）。
  const runKey = `${coinId}|${amount}|${discount}|${days}|${scenario}|${replay}`;
  const [run, setRun] = useState({ key: "", p: 0 });

  // 进入视口后播放；稍等一下再开始，拖滑块时不会每一格都重播
  useEffect(() => {
    if (!inView || reduce) return;
    let controls: { stop: () => void } | undefined;
    const t = window.setTimeout(() => {
      controls = animate(0, 1, { duration: DURATION, ease: "linear", onUpdate: (p) => setRun({ key: runKey, p }) });
    }, DELAY_MS);
    return () => {
      window.clearTimeout(t);
      controls?.stop();
    };
  }, [runKey, inView, reduce]);

  const progress = reduce ? 1 : run.key === runKey ? run.p : 0;
  const done = progress >= 1;
  const filled = scenario === "drop" && path.hitIndex !== null && progress * (POINTS - 1) >= path.hitIndex;
  const live = priceAt(path.prices, progress);
  const endPrice = path.prices[path.prices.length - 1];
  const day = Math.min(days, Math.floor(progress * days) + 1);

  const pickCoin = (next: CoinId) => {
    setCoinId(next);
    setAmount(coinById(next).defaultAmount);
  };

  const final =
    scenario === "drop"
      ? `Filled: you get ${formatAmount(amount, coinId)} at ${formatMoney(target)}.`
      : `Not filled: ${formatMoney(total)} refunded in full.`;

  return (
    <section id="simulator" aria-labelledby="simulator-title" className="scroll-mt-20 py-12">
      <SectionHeading
        id="simulator-title"
        label="Try it"
        title="See how your order plays out."
        intro="Pick a coin, an amount and your price. Then watch what happens if the market drops — or rises."
      />

      <div ref={ref} className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)] lg:gap-10">
        {/* 左：选项 */}
        <div className="space-y-6">
          <Field label="Coin">
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="Coin">
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
              className="w-full border border-ink/30 bg-white/60 px-3 py-2.5 text-sm"
            >
              {coin.amounts.map((a) => (
                <option key={a} value={a}>
                  {formatAmount(a, coinId)}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Your price"
            htmlFor={`${id}-price`}
            aside={<span className="font-serif text-2xl font-bold tabular-nums">{formatMoney(target)}</span>}
          >
            <input
              id={`${id}-price`}
              type="range"
              min={DISCOUNT_MIN}
              max={DISCOUNT_MAX}
              step={1}
              // 往右拖 = 价格更低
              value={discount}
              aria-valuetext={`${formatMoney(target)}, ${discount}% below today's example price`}
              onChange={(e) => setDiscount(Number(e.target.value))}
              className="range w-full"
              style={{ "--fill": `${((discount - DISCOUNT_MIN) / (DISCOUNT_MAX - DISCOUNT_MIN)) * 100}%` } as CSSProperties}
            />
            <div className="flex justify-between text-xs text-ink/70">
              <span>{DISCOUNT_MIN}% below</span>
              <span>{DISCOUNT_MAX}% below</span>
            </div>
            <p className="mt-1 text-xs font-medium text-accent">{discount}% below today&apos;s example price</p>
          </Field>

          <Field label="Wait up to">
            <div className="grid grid-cols-3 gap-2" role="group" aria-label="Wait up to">
              {WINDOWS.map((w) => (
                <button key={w} type="button" aria-pressed={w === days} onClick={() => setDays(w)} className={`${choice(w === days)} text-center text-sm font-semibold`}>
                  {w} day{w === 1 ? "" : "s"}
                </button>
              ))}
            </div>
          </Field>

          <div className="flex items-baseline justify-between gap-4 bg-accent px-4 py-3 text-paper">
            <span className={eyebrow}>You commit</span>
            <span className="font-serif text-2xl font-bold tabular-nums">{formatMoney(total)}</span>
          </div>
        </div>

        {/* 右：情景切换 + 图 + 结果 */}
        <div className="border border-ink/40 bg-white/30">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/30 px-4 py-3">
            <div className="flex border border-ink/40" role="group" aria-label="Market scenario">
              {(
                [
                  ["drop", "Price drops", "↘"],
                  ["rise", "Price rises", "↗"],
                ] as const
              ).map(([s, text, arrow]) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={scenario === s}
                  onClick={() => (scenario === s ? setReplay((n) => n + 1) : setScenario(s))}
                  className={`px-3 py-1.5 text-sm font-semibold transition-colors ${scenario === s ? "bg-ink text-paper" : "hover:bg-mint"}`}
                >
                  <span aria-hidden className="mr-1">
                    {arrow}
                  </span>
                  {text}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setReplay((n) => n + 1)} className="flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline">
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
                <path d="M3 8a5 5 0 1 0 1.5-3.5" strokeLinecap="round" />
                <path d="M3 2.5V5h2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Replay
            </button>
          </div>

          <div className="px-2 pt-3 sm:px-4">
            <SimulatorChart coin={coinId} path={path} target={target} scenario={scenario} days={days} progress={progress} narrow={narrow} />
          </div>

          <div className="min-h-[7.5rem] border-t border-ink/30 p-4">
            <AnimatePresence mode="wait" initial={false}>
              {filled ? (
                <motion.div key="filled" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="border-l-4 border-accent bg-mint px-4 py-3">
                  <p className={`${eyebrow} text-accent`}>Target reached on day {fillDay(path.hitIndex ?? 0, days)}</p>
                  <p className="mt-1 font-serif text-2xl font-bold">
                    You get {formatAmount(amount, coinId)} at {formatMoney(target)}
                  </p>
                  <p className="mt-1 text-sm text-ink/80">You pay {formatMoney(total)} — exactly the price you set.</p>
                </motion.div>
              ) : scenario === "rise" && done ? (
                <motion.div key="refund" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="border-l-4 border-ink bg-paper px-4 py-3">
                  <p className={eyebrow}>Deadline reached · target not hit</p>
                  <p className="mt-1 font-serif text-2xl font-bold">{formatMoney(total)} refunded in full</p>
                  <p className="mt-1 text-sm text-ink/80">
                    {coinId} ended the window at {formatMoney(endPrice)}, above your {formatMoney(target)} target.
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
                  <p className="mt-1 text-sm text-ink/80">Waiting for your {formatMoney(target)} target…</p>
                </motion.div>
              )}
            </AnimatePresence>
            <p className="sr-only" aria-live="polite">
              {done ? final : ""}
            </p>
          </div>
          <p className="border-t border-ink/30 px-4 py-2 text-[11px] text-ink/60">
            Simulated example with illustrative prices — not live market data or a prediction.
          </p>
        </div>
      </div>
    </section>
  );
}
