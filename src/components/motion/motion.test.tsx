import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const reduced = vi.hoisted(() => ({ value: true }));

vi.mock("framer-motion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: () => reduced.value,
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

import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";
import { SplitHeadline } from "./SplitHeadline";
import { Stagger, StaggerItem } from "./Stagger";

afterEach(() => {
  cleanup();
  reduced.value = true;
});

describe("shows the final state right away with reduced motion", () => {
  it("CountUp shows the final value with a $ prefix and thousands separators", () => {
    render(<CountUp value={12000} prefix="$" />);
    expect(screen.getByText("$12,000")).toBeTruthy();
  });

  it("CountUp without a prefix only adds thousands separators", () => {
    render(<CountUp value={1284} />);
    expect(screen.getByText("1,284")).toBeTruthy();
  });

  it("Reveal is visible right away, with no hiding styles", () => {
    render(<Reveal>Body text</Reveal>);
    const el = screen.getByText("Body text");
    expect(el.style.opacity).not.toBe("0");
  });

  it("Stagger children are visible right away", () => {
    render(
      <Stagger>
        <StaggerItem>One</StaggerItem>
        <StaggerItem>Two</StaggerItem>
      </Stagger>,
    );
    expect(screen.getByText("One").style.opacity).not.toBe("0");
    expect(screen.getByText("Two").style.opacity).not.toBe("0");
  });

  it("SplitHeadline is visible right away", () => {
    render(<SplitHeadline text="Name your price." />);
    expect(screen.getByRole("heading", { name: "Name your price." })).toBeTruthy();
    expect(screen.getByText("price.").style.opacity).not.toBe("0");
  });
});

describe("initial state with motion enabled", () => {
  it("CountUp starts from 0", () => {
    reduced.value = false;
    render(<CountUp value={12000} prefix="$" />);
    expect(screen.getByText("$0")).toBeTruthy();
  });

  it("Reveal starts hidden", () => {
    reduced.value = false;
    render(<Reveal>Body text</Reveal>);
    expect(screen.getByText("Body text").style.opacity).toBe("0");
  });
});
