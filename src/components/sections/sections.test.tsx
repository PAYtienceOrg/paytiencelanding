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
import { GoodToKnow } from "./GoodToKnow";
import { HowItWorks } from "./HowItWorks";
import { MobileNav } from "./MobileNav";

afterEach(cleanup);

const banned = /risk-free|guaranteed|zero risk/i;

describe("HowItWorks", () => {
  it("shows the title and three steps", () => {
    render(<HowItWorks />);
    expect(screen.getByRole("heading", { name: "How it works" })).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("Choose your crypto")).toBeTruthy();
    expect(screen.getByText("Set your price & deadline")).toBeTruthy();
    expect(screen.getByText("Get crypto or a refund")).toBeTruthy();
  });

  it("copy contains no banned words", () => {
    const { container } = render(<HowItWorks />);
    expect(container.textContent).not.toMatch(banned);
  });
});

// Motion is off in this file (reduced motion), so the simulator shows the final result right away.
describe("Simulator", () => {
  const commit = () => screen.getByText("You commit").nextElementSibling?.textContent;

  it("default: 5 ETH, $2,400 target, the drop scenario fills", () => {
    render(<Simulator />);
    expect(commit()).toBe("$12,000");
    expect(screen.getByText("You get 5 ETH at $2,400")).toBeTruthy();
    expect(screen.getByText("Target reached on day 2")).toBeTruthy();
  });

  it("switching to the rise scenario: full refund", async () => {
    render(<Simulator />);
    fireEvent.click(screen.getByRole("button", { name: /Price rises/ }));
    // The old result card fades out before the new one appears
    expect(await screen.findByText("$12,000 refunded in full")).toBeTruthy();
    expect(screen.getByText(/above your \$2,400 target/)).toBeTruthy();
  });

  it("changing the coin resets the amount to that coin's default", () => {
    render(<Simulator />);
    fireEvent.click(screen.getByRole("button", { name: /BTC/ }));
    expect((screen.getByLabelText("How much") as HTMLSelectElement).value).toBe("0.1");
    // 65,000 × 96% = 62,400; × 0.1 = 6,240
    expect(commit()).toBe("$6,240");
    expect(screen.getByText("You get 0.1 BTC at $62,400")).toBeTruthy();
  });

  it("the result follows changes to price, amount and days", () => {
    render(<Simulator />);
    // The slider value is the negative discount: -10 = 10% below the current price
    fireEvent.change(screen.getByLabelText("Your price"), { target: { value: "-10" } });
    fireEvent.change(screen.getByLabelText("How much"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "7 days" }));
    expect(commit()).toBe("$4,500");
    expect(screen.getByText("You get 2 ETH at $2,250")).toBeTruthy();
    expect(screen.getByText("Target reached on day 5")).toBeTruthy();
  });

  it("the price slider goes up to the right, with prices shown at both ends", () => {
    render(<Simulator />);
    const slider = screen.getByLabelText("Your price") as HTMLInputElement;
    expect(screen.getByText("$2,000")).toBeTruthy(); // left end: 20% lower
    expect(screen.getByText("$2,475")).toBeTruthy(); // right end: 1% lower
    fireEvent.change(slider, { target: { value: slider.max } });
    expect(commit()).toBe("$12,375"); // 5 × $2,475
  });

  it("lists both outcomes together", () => {
    render(<Simulator />);
    expect(screen.getByText("If ETH hits $2,400 within 3 days")).toBeTruthy();
    expect(screen.getByText("You get 5 ETH")).toBeTruthy();
    expect(screen.getByText("$12,000 back")).toBeTruthy();
  });

  it("buttons are large enough to tap on a phone", () => {
    render(<Simulator />);
    for (const b of screen.getAllByRole("button")) expect(b.className).toMatch(/min-h-11/);
  });

  it("copy contains no banned words", () => {
    const { container } = render(<Simulator />);
    fireEvent.click(screen.getByRole("button", { name: /Price rises/ }));
    expect(container.textContent).not.toMatch(banned);
  });
});

describe("GoodToKnow", () => {
  it("four rules, with an anchor", () => {
    const { container } = render(<GoodToKnow />);
    expect(container.querySelector("#good-to-know")).toBeTruthy();
    expect(container.querySelectorAll("dt")).toHaveLength(4);
    expect(screen.getByText("Orders fill at your target")).toBeTruthy();
    expect(container.textContent).not.toMatch(banned);
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
  it("six questions, the first open by default", () => {
    const { container } = render(<Faq />);
    const items = container.querySelectorAll("details");
    expect(items).toHaveLength(6);
    expect(items[0].open).toBe(true);
    expect(items[1].open).toBe(false);
    expect(container.textContent).not.toMatch(banned);
  });
});
