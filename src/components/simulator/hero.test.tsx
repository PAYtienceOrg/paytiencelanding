import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// 关掉动画：直接显示每种情况的最终结果
vi.mock("framer-motion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: () => true,
}));

vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

import { HeroChart } from "./HeroChart";

afterEach(cleanup);

describe("HeroChart", () => {
  it("默认演示下跌成交", () => {
    render(<HeroChart />);
    expect(screen.getByRole("button", { name: /If it drops/ }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Filled at $2,400 — you get 5 ETH.")).toBeTruthy();
  });

  it("点“上涨”显示全额退款", () => {
    render(<HeroChart />);
    fireEvent.click(screen.getByRole("button", { name: /If it rises/ }));
    expect(screen.getByText("Not reached by day 3 — $12,000 refunded.")).toBeTruthy();
  });

  it("有去模拟器的入口", () => {
    render(<HeroChart />);
    expect(screen.getByRole("link", { name: /Try your own numbers/ }).getAttribute("href")).toBe("#simulator");
  });
});
