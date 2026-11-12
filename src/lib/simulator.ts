// Pure functions for the simulator: coins, example prices, path generation, formatting. No React dependency, so they are easy to test.

export type CoinId = "ETH" | "BTC" | "SOL";
export type Scenario = "drop" | "rise";

export type Coin = {
  id: CoinId;
  name: string;
  price: number; // example price, not live market data
  amounts: number[];
  defaultAmount: number;
};

export const COINS: Coin[] = [
  { id: "ETH", name: "Ethereum", price: 2500, amounts: [1, 2, 5, 10], defaultAmount: 5 },
  { id: "BTC", name: "Bitcoin", price: 65000, amounts: [0.05, 0.1, 0.25, 0.5], defaultAmount: 0.1 },
  { id: "SOL", name: "Solana", price: 150, amounts: [10, 25, 50, 100], defaultAmount: 50 },
];

export const coinById = (id: CoinId) => COINS.find((c) => c.id === id) ?? COINS[0];

export const DISCOUNT_MIN = 1;
export const DISCOUNT_MAX = 20;
export const WINDOWS = [1, 3, 7];

// Number of points in a price path
export const POINTS = 48;
// Index of the point where the drop scenario hits the target
export const HIT_INDEX = Math.round((POINTS - 1) * 0.62);

const cents = (n: number) => Math.round(n * 100) / 100;

export const targetFor = (price: number, discountPct: number) => cents(price * (1 - discountPct / 100));

export function formatMoney(n: number) {
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: Math.abs(n) < 100 ? 2 : 0 })}`;
}

export function formatAmount(n: number, coin: CoinId) {
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${coin}`;
}

// Deterministic "noise": the same result every time (server and client render alike). Range is roughly -1..1.
const wiggle = (i: number) => Math.sin(i * 1.9) * 0.55 + Math.sin(i * 0.7 + 0.8) * 0.45;

export type Path = { prices: number[]; hitIndex: number | null };

// Builds an example price path.
// drop: the price falls, first touches the target at HIT_INDEX, then rebounds slightly.
// rise: the price trends up, always above the target, and the order is not filled by the deadline.
export function buildPath(price: number, target: number, scenario: Scenario): Path {
  const gap = Math.max(price - target, price * 0.005);
  const prices: number[] = [];

  if (scenario === "drop") {
    const amp = gap * 0.18;
    for (let i = 0; i < POINTS; i++) {
      if (i === 0) {
        prices.push(price);
      } else if (i < HIT_INDEX) {
        const t = i / HIT_INDEX;
        const p = price - gap * Math.pow(t, 1.35) + wiggle(i) * amp * Math.sqrt(1 - t);
        // Must stay above the target until the hit, and never above the start so it does not cover the "Now" label
        prices.push(cents(Math.min(Math.max(p, target + gap * 0.03), price)));
      } else if (i === HIT_INDEX) {
        prices.push(target);
      } else {
        const t = (i - HIT_INDEX) / (POINTS - 1 - HIT_INDEX);
        const p = target + gap * 0.35 * t + Math.abs(wiggle(i)) * amp * 0.5 * t;
        prices.push(cents(p));
      }
    }
    return { prices, hitIndex: HIT_INDEX };
  }

  const climb = price * 0.06;
  const amp = price * 0.008 + gap * 0.1;
  for (let i = 0; i < POINTS; i++) {
    if (i === 0) {
      prices.push(price);
      continue;
    }
    const t = i / (POINTS - 1);
    // A small dip early on, then a steady climb
    const p = price + climb * Math.pow(t, 1.2) - gap * 0.35 * Math.sin(Math.PI * Math.min(t * 2, 1)) + wiggle(i) * amp;
    const floor = Math.max(p, target + gap * 0.45);
    // Never above the start in the first 30%, leaving room for the "Now" label
    prices.push(cents(t < 0.3 ? Math.min(floor, price) : floor));
  }
  return { prices, hitIndex: null };
}

// Y-axis ticks: three to five round numbers
export function niceTicks(lo: number, hi: number, count = 4) {
  const raw = (hi - lo) / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const ticks: number[] = [];
  for (let v = Math.ceil(lo / step) * step; v <= hi + 1e-9; v += step) ticks.push(cents(v));
  return ticks;
}

// Price at the given progress (0..1), interpolated between neighbouring points
export function priceAt(prices: number[], progress: number) {
  const f = Math.min(Math.max(progress, 0), 1) * (prices.length - 1);
  const i0 = Math.floor(f);
  const i1 = Math.min(prices.length - 1, i0 + 1);
  return prices[i0] + (prices[i1] - prices[i0]) * (f - i0);
}

// Day of the fill (1-based)
export const fillDay = (hitIndex: number, days: number) => Math.max(1, Math.ceil((hitIndex / (POINTS - 1)) * days));
