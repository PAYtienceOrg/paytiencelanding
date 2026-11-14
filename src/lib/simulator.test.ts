import { describe, expect, it } from "vitest";
import { buildPath, COINS, dayOf, formatAmount, formatMoney, niceTicks, outcomeOf, POINTS, priceAt, reached, targetFor, type Strategy } from "./simulator";

describe("buildPath", () => {
  for (const strategy of ["buy", "sell"] as Strategy[]) {
    for (const coin of COINS) {
      for (const pct of [1, 4, 20]) {
        const target = targetFor(coin.price, pct, strategy);
        const name = `${strategy} ${coin.id} ${pct}%`;

        it(`${name}: "hit" reaches the target on day 2 and fills at the deadline`, () => {
          const { prices, touchIndex } = buildPath(coin.price, target, strategy, "hit");
          expect(prices).toHaveLength(POINTS);
          expect(prices[0]).toBe(coin.price);
          expect(touchIndex).not.toBeNull();
          expect(dayOf(touchIndex ?? 0, 3)).toBe(2);
          // Buy low turns back to the other side of the target before the deadline; sell high stays past it
          const turnsBack = prices.slice(touchIndex ?? 0).some((p) => !reached(p, target, strategy));
          expect(turnsBack).toBe(strategy === "buy");
          expect(reached(prices[POINTS - 1], target, strategy)).toBe(true);
          expect(outcomeOf(prices, target, strategy)).toBe("fill");
        });

        it(`${name}: "turn" touches the target mid-window but is refunded`, () => {
          const { prices, touchIndex } = buildPath(coin.price, target, strategy, "turn");
          expect(touchIndex).not.toBeNull();
          expect(touchIndex).toBeLessThan(POINTS - 1);
          expect(outcomeOf(prices, target, strategy)).toBe("refund");
        });

        it(`${name}: "away" never reaches the target and is refunded`, () => {
          const { prices, touchIndex } = buildPath(coin.price, target, strategy, "away");
          expect(touchIndex).toBeNull();
          expect(prices.every((p) => !reached(p, target, strategy))).toBe(true);
          expect(outcomeOf(prices, target, strategy)).toBe("refund");
        });
      }
    }
  }

  it("sell-high targets sit above today's price, buy-low targets below", () => {
    expect(targetFor(2500, 4, "buy")).toBe(2400);
    expect(targetFor(2500, 4, "sell")).toBe(2600);
  });

  it("is deterministic (server and browser render the same)", () => {
    expect(buildPath(2500, 2400, "buy", "hit")).toEqual(buildPath(2500, 2400, "buy", "hit"));
  });
});

describe("helpers", () => {
  it("targetFor computes the target price from a percentage", () => {
    expect(targetFor(2500, 4)).toBe(2400);
    expect(targetFor(65000, 4)).toBe(62400);
    expect(targetFor(150, 4)).toBe(144);
  });

  it("formatMoney: no decimals for large numbers, two for small ones", () => {
    expect(formatMoney(62400)).toBe("62,400 USDC");
    expect(formatMoney(144)).toBe("144 USDC");
    expect(formatMoney(12.5)).toBe("12.5 USDC");
  });

  it("formatAmount includes the coin", () => {
    expect(formatAmount(0.25, "BTC")).toBe("0.25 BTC");
  });

  it("niceTicks returns round ticks within the range", () => {
    const ticks = niceTicks(2310, 2620);
    expect(ticks.length).toBeGreaterThanOrEqual(3);
    expect(ticks.every((t) => t >= 2310 && t <= 2620 && t % 50 === 0)).toBe(true);
  });

  it("priceAt interpolates between two points", () => {
    expect(priceAt([100, 200, 300], 0)).toBe(100);
    expect(priceAt([100, 200, 300], 0.25)).toBe(150);
    expect(priceAt([100, 200, 300], 1)).toBe(300);
  });

  it("outcomeOf only looks at the price at the deadline", () => {
    expect(outcomeOf([100, 80, 95], 90, "buy")).toBe("refund"); // touched 80 mid-window, ended above
    expect(outcomeOf([100, 99, 90], 90, "buy")).toBe("fill"); // exactly at the target
    expect(outcomeOf([100, 120, 70], 90, "buy")).toBe("fill");
    expect(outcomeOf([100, 120, 105], 110, "sell")).toBe("refund"); // touched 120 mid-window, ended below
    expect(outcomeOf([100, 90, 110], 110, "sell")).toBe("fill");
  });

  it("dayOf derives the day from a position in the window", () => {
    expect(dayOf(1, 3)).toBe(1);
    expect(dayOf(Math.round((POINTS - 1) * 0.5), 3)).toBe(2);
    expect(dayOf(POINTS - 1, 7)).toBe(7);
  });
});
