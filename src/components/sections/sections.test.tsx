import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("framer-motion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: () => true,
}));

// jsdom has no IntersectionObserver; the stub never fires, so components stay in their initial state.
vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

import { Simulator } from "../simulator/Simulator";
import { Faq } from "./Faq";
import { HowItWorks } from "./HowItWorks";
import { MobileNav } from "./MobileNav";

afterEach(cleanup);

const banned = /risk-free|guaranteed|zero risk/i;

describe("HowItWorks", () => {
  it("shows the title and five steps", () => {
    render(<HowItWorks />);
    expect(screen.getByRole("heading", { name: "How it works" })).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    for (const title of ["Choose your assets", "Set a deadline", "Set a target price", "Execute and get paid", "Get the asset or your money back"]) {
      expect(screen.getByText(title)).toBeTruthy();
    }
    expect(screen.getByText("Pick an asset.")).toBeTruthy();
    expect(screen.getByText(/You keep your upfront yield/)).toBeTruthy();
  });

  it("copy contains no banned words", () => {
    const { container } = render(<HowItWorks />);
    expect(container.textContent).not.toMatch(banned);
  });
});

// Motion is off in this file (reduced motion), so the simulator shows the final result right away.
describe("Simulator", () => {
  const commit = () => screen.getByText("You commit").nextElementSibling?.textContent;

  it("default: buy low, 5 ETH at 2,400 USDC, touched on day 2 but filled only at the deadline", () => {
    render(<Simulator />);
    expect(screen.getByRole("button", { name: /Buy low/ }).getAttribute("aria-pressed")).toBe("true");
    expect(commit()).toBe("12,000 USDC");
    expect(screen.getByText("You get 5 ETH at 2,400 USDC")).toBeTruthy(); // result card
    expect(screen.getByText("You get 5 ETH")).toBeTruthy(); // outcome scale
    expect(screen.getByText("Deadline reached: ETH is at or below your target")).toBeTruthy();
    expect(screen.getByText(/first touched 2,400 USDC on day 2, but nothing happened until the deadline/)).toBeTruthy();
  });

  it("touching the target and turning back does not fill: money back", async () => {
    render(<Simulator />);
    fireEvent.click(screen.getByRole("button", { name: "Touches, turns back" }));
    // The old result card fades out before the new one appears
    expect(await screen.findByText("Deadline reached: ETH is above your target")).toBeTruthy();
    expect(screen.getAllByText("You get your 12,000 USDC back")).toHaveLength(2); // summary and result card
    expect(screen.getByText(/went below 2,400 USDC on day 2, but ended the window at .* Only the price at the deadline counts\./)).toBeTruthy();
  });

  it("never reaching the target: money back", async () => {
    render(<Simulator />);
    fireEvent.click(screen.getByRole("button", { name: "Never reaches it" }));
    expect(await screen.findByText("Deadline reached: ETH is above your target")).toBeTruthy();
    expect(screen.getAllByText("You get your 12,000 USDC back")).toHaveLength(2); // summary and result card
    expect(screen.getByText(/above your 2,400 USDC target/)).toBeTruthy();
  });

  it("sell high: commits the asset, sells at a target above today's price", async () => {
    render(<Simulator />);
    fireEvent.click(screen.getByRole("button", { name: /Sell high/ }));
    expect(commit()).toBe("5 ETH");
    expect(screen.getByText("You sell 5 ETH at 2,600 USDC")).toBeTruthy();
    expect(screen.getByText(/At or above 2,600 USDC/)).toBeTruthy();
    expect(screen.getByText("You get 13,000 USDC")).toBeTruthy();
    expect(screen.getByText("You get your 5 ETH back")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Touches, turns back" }));
    expect(await screen.findByText("Deadline reached: ETH is below your target")).toBeTruthy();
    expect(screen.getAllByText("You get your 5 ETH back")).toHaveLength(2);
  });

  it("changing the asset resets the amount to that asset's default", () => {
    render(<Simulator />);
    fireEvent.click(screen.getByRole("button", { name: /BTC/ }));
    expect((screen.getByLabelText("How much") as HTMLSelectElement).value).toBe("0.1");
    // 65,000 × 96% = 62,400; × 0.1 = 6,240
    expect(commit()).toBe("6,240 USDC");
    expect(screen.getByText("You get 0.1 BTC at 62,400 USDC")).toBeTruthy();
  });

  it("the result follows changes to price, amount and days", () => {
    render(<Simulator />);
    // To buy low the slider value is the negative distance: -10 = 10% below the current price
    fireEvent.change(screen.getByLabelText("Your target price"), { target: { value: "-10" } });
    fireEvent.change(screen.getByLabelText("How much"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "7 days" }));
    expect(commit()).toBe("4,500 USDC");
    expect(screen.getByText("You get 2 ETH at 2,250 USDC")).toBeTruthy();
    expect(screen.getByText("ETH price when the 7 days end")).toBeTruthy();
  });

  it("the price slider goes up to the right, with prices shown at both ends", () => {
    render(<Simulator />);
    const slider = screen.getByLabelText("Your target price") as HTMLInputElement;
    expect(screen.getByText("2,000 USDC")).toBeTruthy(); // left end: 20% lower
    expect(screen.getByText("2,475 USDC")).toBeTruthy(); // right end: 1% lower
    fireEvent.change(slider, { target: { value: slider.max } });
    expect(commit()).toBe("12,375 USDC"); // 5 × 2,475

    fireEvent.click(screen.getByRole("button", { name: /Sell high/ }));
    expect(screen.getAllByText(/2,525 USDC/).length).toBeGreaterThan(0); // left end: 1% higher (also the current target)
    expect(screen.getByText("3,000 USDC")).toBeTruthy(); // right end: 20% higher
  });

  it("shows the order at a glance: yield now, then two outcomes split at the target", () => {
    render(<Simulator />);
    expect(screen.getByText("+ Upfront yield")).toBeTruthy();
    expect(screen.getByText("Target 2,400 USDC")).toBeTruthy();
    expect(screen.getByText(/At or below 2,400 USDC/)).toBeTruthy();
    expect(screen.getByText(/Above 2,400 USDC/)).toBeTruthy();
    expect(screen.getByText("You get your 12,000 USDC back")).toBeTruthy();
    expect(screen.getByText(/touching 2,400 USDC earlier doesn't fill/)).toBeTruthy();
  });

  it("buttons are large enough to tap on a phone", () => {
    render(<Simulator />);
    for (const b of screen.getAllByRole("button")) expect(b.className).toMatch(/min-h-11/);
  });

  it("uses only theme colours and no banned words", async () => {
    const { container } = render(<Simulator />);
    fireEvent.click(screen.getByRole("button", { name: "Never reaches it" }));
    await screen.findByText("Deadline reached: ETH is above your target");
    expect(container.innerHTML).not.toMatch(/refund-tint|text-refund|border-refund|fill-refund|stroke-refund/);
    expect(container.textContent).not.toMatch(banned);
    expect(container.textContent).not.toMatch(/refund/i);
  });
});

describe("MobileNav", () => {
  const links = [
    { href: "#a", label: "A" },
    { href: "#b", label: "B" },
  ];

  it("opens on button click, closes after picking a link", () => {
    render(<MobileNav links={links} />);
    const button = screen.getByRole("button", { name: "Open menu" });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(button);
    expect(screen.getByRole("button", { name: "Close menu" }).getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(screen.getByRole("link", { name: "A" }));
    expect(screen.queryByRole("link", { name: "A" })).toBeNull();
  });

  it("closes on Esc", () => {
    render(<MobileNav links={links} />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("link", { name: "B" })).toBeNull();
  });
});

describe("Faq", () => {
  it("eight questions, the first open by default", () => {
    const { container } = render(<Faq />);
    const items = container.querySelectorAll("details");
    expect(items).toHaveLength(8);
    expect(container.textContent).toMatch(/Only at your deadline/);
    expect(container.textContent).not.toMatch(/as soon as/i);
    expect(items[0].open).toBe(true);
    expect(items[1].open).toBe(false);
    expect(container.textContent).not.toMatch(banned);
  });
});

describe("Assets", () => {
  it("lists stocks and ETFs, and marks only pre-stocks as coming soon", async () => {
    const { Assets } = await import("./Assets");
    const { container } = render(<Assets />);
    for (const title of ["Stocks", "ETFs", "Pre-stocks"]) expect(screen.getByRole("heading", { name: title })).toBeTruthy();
    for (const name of ["NVDA", "TSLA", "SPY", "QQQ", "OpenAI", "SpaceX"]) expect(screen.getByText(name)).toBeTruthy();
    expect(screen.getAllByText("Coming soon")).toHaveLength(1);
    expect(container.querySelectorAll("img")).toHaveLength(14);
    expect(container.textContent).not.toMatch(banned);
  });
});
