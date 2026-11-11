import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const reduced = vi.hoisted(() => ({ value: true }));

vi.mock("framer-motion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: () => reduced.value,
}));

import { PriceChart, PriceChartCard } from "./PriceChart";

afterEach(() => {
  cleanup();
  reduced.value = true;
});

describe("PriceChart", () => {
  it("减少动画时一开始就显示成交标签", () => {
    render(<PriceChart />);
    expect(screen.getByText("Filled at $2,400")).toBeTruthy();
  });

  it("始终显示目标价、刻度和时间轴", () => {
    render(<PriceChart />);
    expect(screen.getByText("Target $2,400")).toBeTruthy();
    expect(screen.getByText("$2,600")).toBeTruthy();
    expect(screen.getByText("Today")).toBeTruthy();
    expect(screen.getByText("Day 3")).toBeTruthy();
  });

  it("卡片显示币对和现价", () => {
    render(<PriceChartCard />);
    expect(screen.getByText("ETH / USD")).toBeTruthy();
    expect(screen.getByText("Current price").nextElementSibling?.textContent).toBe("$2,500");
  });

  it("有图片角色和文字说明", () => {
    render(<PriceChart />);
    expect(screen.getByRole("img", { name: /ETH/ })).toBeTruthy();
  });

  it("开启动画时线还没画完，成交标签先不出现", () => {
    reduced.value = false;
    render(<PriceChart />);
    expect(screen.queryByText("Filled at $2,400")).toBeNull();
  });
});
