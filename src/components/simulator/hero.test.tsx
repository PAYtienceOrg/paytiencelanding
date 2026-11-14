import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// Motion off: show the final result of each outcome right away
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
  it("shows the ETH / USDC pair and demos buy low by default", () => {
    render(<HeroChart />);
    expect(screen.getByText("ETH / USDC")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Buy low/ }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Day 3 deadline: ETH is below 2,400 USDC — you buy 5 ETH at 2,400 USDC.")).toBeTruthy();
  });

  it("clicking sell high shows the sale at the higher target", () => {
    render(<HeroChart />);
    fireEvent.click(screen.getByRole("button", { name: /Sell high/ }));
    expect(screen.getByText("Day 3 deadline: ETH is above 2,600 USDC — you sell 5 ETH at 2,600 USDC.")).toBeTruthy();
  });
});
