// Pure functions for the simulator: coins, example prices, path generation, formatting. No React dependency, so they are easy to test.

export type CoinId = "ETH" | "BTC" | "SOL";

// buy: "buy low" — commit USDC, set a target below today's price.
// sell: "sell high" — commit the asset, set a target above today's price.
export type Strategy = "buy" | "sell";

// Example markets, described relative to the target:
// hit: reaches the target mid-window and is past it at the deadline (fills). Buy low turns back in between; sell high stays past it.
// turn: touches the target mid-window but has turned back by the deadline (refund).
// away: moves away and never reaches the target (refund).
export type Scenario = "hit" | "turn" | "away";

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

// How far the target can be from today's price, in percent
export const DISCOUNT_MIN = 1;
export const DISCOUNT_MAX = 20;
export const WINDOWS = [1, 3, 7];

// Number of points in a price path
export const POINTS = 48;

const cents = (n: number) => Math.round(n * 100) / 100;

// Target price: pct below today's price to buy low, pct above it to sell high
export const targetFor = (price: number, pct: number, strategy: Strategy = "buy") =>
  cents(price * (1 + (strategy === "buy" ? -pct : pct) / 100));

// A price as a bare number (chart axis ticks, where the unit is shown once)
export function formatPrice(n: number) {
  return n.toLocaleString("en-US", { maximumFractionDigits: Math.abs(n) < 100 ? 2 : 0 });
}

// A price in USDC: prices are quoted in USDC, the currency orders are paid and settled in
export function formatMoney(n: number) {
  return `${formatPrice(n)} USDC`;
}

// Amounts of money are in USDC, the currency orders are paid and settled in
export function formatUsdc(n: number) {
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 2 })} USDC`;
}

export function formatAmount(n: number, coin: CoinId) {
  return `${n.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${coin}`;
}

// Deterministic "noise": the same result every time (server and client render alike). Range is roughly -1..1.
const wiggle = (i: number) => Math.sin(i * 1.9) * 0.55 + Math.sin(i * 0.7 + 0.8) * 0.45;

// touchIndex: the first point after the start at or past the target, or null if the price never gets there.
export type Path = { prices: number[]; touchIndex: number | null };

export type Outcome = "fill" | "refund";

// Whether a price has reached the target: at or below it to buy low, at or above it to sell high
export const reached = (price: number, target: number, strategy: Strategy) => (strategy === "buy" ? price <= target : price >= target);

// An order is settled once, at the deadline, like a European option: only the last price counts.
// If it has reached the target, the order fills at the target price; otherwise it is refunded.
// Touching the target earlier in the window changes nothing.
export const outcomeOf = (prices: number[], target: number, strategy: Strategy): Outcome =>
  reached(prices[prices.length - 1], target, strategy) ? "fill" : "refund";

// Each scenario as [time 0..1, distance travelled towards the target], where 1 is exactly at the target
// and more than 1 is past it. Times are picked so a 3-day window reads "touches on day 2, settles on day 3".
const SHAPES: Record<Scenario, [number, number][]> = {
  hit: [
    [0, 0],
    [0.56, 1.14],
    [0.8, 0.72],
    [1, 1.2],
  ],
  turn: [
    [0, 0],
    [0.58, 1.15],
    [1, 0.4],
  ],
  away: [
    [0, 0],
    [0.22, 0.3],
    [1, -0.9],
  ],
};

// The sell-high "hit": once past the target it stays there until the deadline
const HIT_AND_STAY: [number, number][] = [
  [0, 0],
  [0.56, 1.14],
  [0.8, 1.1],
  [1, 1.2],
];

// Builds an example price path between today's price and the deadline.
// Sell-high paths are the buy-low shapes mirrored around today's price, except for "hit" (see above).
export function buildPath(price: number, target: number, strategy: Strategy, scenario: Scenario): Path {
  const gap = Math.max(Math.abs(price - target), price * 0.005);
  const direction = strategy === "buy" ? -1 : 1;
  const stay = strategy === "sell" && scenario === "hit";
  const shape = stay ? HIT_AND_STAY : SHAPES[scenario];
  let crossed = false;
  const last = POINTS - 1;
  const prices: number[] = [price];

  for (let i = 1; i < POINTS; i++) {
    const t = i / last;
    const k = Math.max(1, shape.findIndex(([time]) => time >= t));
    const [t0, d0] = shape[k - 1];
    const [t1, d1] = shape[k];
    const u = (t - t0) / (t1 - t0);
    // Ease between the two key points; the wobble fades to nothing at each of them
    const eased = d0 + (d1 - d0) * (1 - Math.cos(Math.PI * u)) / 2;
    let travelled = eased + wiggle(i) * 0.07 * Math.sin(Math.PI * u);
    // Early on, never move away from the target past the start: keeps the "Now" label clear
    if (t < 0.3) travelled = Math.max(travelled, 0);
    // Once past the target, never wobble back across it
    if (stay && crossed) travelled = Math.max(travelled, 1.03);
    if (travelled >= 1) crossed = true;
    prices.push(cents(price + direction * gap * travelled));
  }

  const touch = prices.findIndex((p, i) => i > 0 && reached(p, target, strategy));
  return { prices, touchIndex: touch === -1 ? null : touch };
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

// Day on which a point of the path falls (1-based)
export const dayOf = (index: number, days: number) => Math.min(days, Math.max(1, Math.ceil((index / (POINTS - 1)) * days)));
