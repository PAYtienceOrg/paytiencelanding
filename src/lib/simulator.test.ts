import { describe, expect, it } from "vitest";
import { buildPath, COINS, fillDay, formatAmount, formatMoney, HIT_INDEX, niceTicks, POINTS, priceAt, targetFor } from "./simulator";

describe("buildPath", () => {
  for (const coin of COINS) {
    for (const pct of [1, 4, 20]) {
      const target = targetFor(coin.price, pct);

      it(`${coin.id} ${pct}%：下跌情景在 HIT_INDEX 第一次碰到目标价`, () => {
        const { prices, hitIndex } = buildPath(coin.price, target, "drop");
        expect(prices).toHaveLength(POINTS);
        expect(prices[0]).toBe(coin.price);
        expect(hitIndex).toBe(HIT_INDEX);
        expect(prices[HIT_INDEX]).toBe(target);
        expect(prices.slice(0, HIT_INDEX).every((p) => p > target)).toBe(true);
        // 成交后不再跌破目标价，图上的标签区域保持干净
        expect(prices.slice(HIT_INDEX).every((p) => p >= target)).toBe(true);
      });

      it(`${coin.id} ${pct}%：上涨情景始终在目标价之上，并以高于现价收尾`, () => {
        const { prices, hitIndex } = buildPath(coin.price, target, "rise");
        expect(hitIndex).toBeNull();
        expect(prices[0]).toBe(coin.price);
        expect(prices.every((p) => p > target)).toBe(true);
        expect(prices[prices.length - 1]).toBeGreaterThan(coin.price);
      });
    }
  }

  it("结果是固定的（服务端和浏览器渲染一致）", () => {
    expect(buildPath(2500, 2400, "drop")).toEqual(buildPath(2500, 2400, "drop"));
  });
});

describe("工具函数", () => {
  it("targetFor 按百分比算目标价", () => {
    expect(targetFor(2500, 4)).toBe(2400);
    expect(targetFor(65000, 4)).toBe(62400);
    expect(targetFor(150, 4)).toBe(144);
  });

  it("formatMoney：大数不带小数，小数保留两位", () => {
    expect(formatMoney(62400)).toBe("$62,400");
    expect(formatMoney(144)).toBe("$144");
    expect(formatMoney(12.5)).toBe("$12.5");
  });

  it("formatAmount 带币种", () => {
    expect(formatAmount(0.25, "BTC")).toBe("0.25 BTC");
  });

  it("niceTicks 返回整齐刻度并落在范围内", () => {
    const ticks = niceTicks(2310, 2620);
    expect(ticks.length).toBeGreaterThanOrEqual(3);
    expect(ticks.every((t) => t >= 2310 && t <= 2620 && t % 50 === 0)).toBe(true);
  });

  it("priceAt 在两点之间插值", () => {
    expect(priceAt([100, 200, 300], 0)).toBe(100);
    expect(priceAt([100, 200, 300], 0.25)).toBe(150);
    expect(priceAt([100, 200, 300], 1)).toBe(300);
  });

  it("fillDay 按成交位置算第几天", () => {
    expect(fillDay(HIT_INDEX, 3)).toBe(2);
    expect(fillDay(HIT_INDEX, 1)).toBe(1);
    expect(fillDay(HIT_INDEX, 7)).toBe(5);
  });
});
