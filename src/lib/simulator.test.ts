import { describe, expect, it } from "vitest";
import { buildPath, COINS, fillDay, formatAmount, formatMoney, HIT_INDEX, niceTicks, POINTS, priceAt, targetFor } from "./simulator";

describe("buildPath", () => {
  for (const coin of COINS) {
    for (const pct of [1, 4, 20]) {
      const target = targetFor(coin.price, pct);

      it(`${coin.id} ${pct}%: the drop scenario first touches the target at HIT_INDEX`, () => {
        const { prices, hitIndex } = buildPath(coin.price, target, "drop");
        expect(prices).toHaveLength(POINTS);
        expect(prices[0]).toBe(coin.price);
        expect(hitIndex).toBe(HIT_INDEX);
        expect(prices[HIT_INDEX]).toBe(target);
        expect(prices.slice(0, HIT_INDEX).every((p) => p > target)).toBe(true);
        // After the fill the price never drops below the target, keeping the chart's label area clear
        expect(prices.slice(HIT_INDEX).every((p) => p >= target)).toBe(true);
      });

      it(`${coin.id} ${pct}%: the rise scenario stays above the target and ends above the starting price`, () => {
        const { prices, hitIndex } = buildPath(coin.price, target, "rise");
        expect(hitIndex).toBeNull();
        expect(prices[0]).toBe(coin.price);
        expect(prices.every((p) => p > target)).toBe(true);
        expect(prices[prices.length - 1]).toBeGreaterThan(coin.price);
      });
    }
  }

  it("is deterministic (server and browser render the same)", () => {
    expect(buildPath(2500, 2400, "drop")).toEqual(buildPath(2500, 2400, "drop"));
  });
});

describe("helpers", () => {
  it("targetFor computes the target price from a percentage", () => {
    expect(targetFor(2500, 4)).toBe(2400);
    expect(targetFor(65000, 4)).toBe(62400);
    expect(targetFor(150, 4)).toBe(144);
  });

  it("formatMoney: no decimals for large numbers, two for small ones", () => {
    expect(formatMoney(62400)).toBe("$62,400");
    expect(formatMoney(144)).toBe("$144");
    expect(formatMoney(12.5)).toBe("$12.5");
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

  it("fillDay derives the day from the fill position", () => {
    expect(fillDay(HIT_INDEX, 3)).toBe(2);
    expect(fillDay(HIT_INDEX, 1)).toBe(1);
    expect(fillDay(HIT_INDEX, 7)).toBe(5);
  });
});
