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
  it("demos the drop-and-fill outcome by default", () => {
    render(<HeroChart />);
    expect(screen.getByRole("button", { name: /If it drops/ }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("Filled at $2,400 — you get 5 ETH.")).toBeTruthy();
  });

  it("clicking the rise option shows a full refund", () => {
    render(<HeroChart />);
    fireEvent.click(screen.getByRole("button", { name: /If it rises/ }));
    expect(screen.getByText("Not reached by day 3 — $12,000 refunded.")).toBeTruthy();
  });

  it("links to the simulator", () => {
    render(<HeroChart />);
    expect(screen.getByRole("link", { name: /Try your own numbers/ }).getAttribute("href")).toBe("#simulator");
  });
});
