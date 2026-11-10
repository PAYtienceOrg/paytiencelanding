import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("framer-motion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: () => true,
}));

// jsdom 没有 IntersectionObserver；桩永远不触发，组件停在初始状态。
vi.stubGlobal(
  "IntersectionObserver",
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
  },
);

import { HowItWorks } from "./HowItWorks";
import { TwoOutcomes } from "./TwoOutcomes";

afterEach(cleanup);

const banned = /risk-free|guaranteed|zero risk/i;

describe("HowItWorks", () => {
  it("显示栏目标号和三个步骤", () => {
    render(<HowItWorks />);
    expect(screen.getByText("No. 01")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "How it works" })).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText(/Pick a coin & amount/)).toBeTruthy();
    expect(screen.getByText(/Set your price & window/)).toBeTruthy();
    expect(screen.getByText(/Get it — or get it back/)).toBeTruthy();
  });

  it("文案不含禁用词", () => {
    const { container } = render(<HowItWorks />);
    expect(container.textContent).not.toMatch(banned);
  });
});

describe("TwoOutcomes", () => {
  it("并排显示两种结果和金额", () => {
    render(<TwoOutcomes />);
    expect(screen.getByText("No. 02")).toBeTruthy();
    expect(screen.getByText(/Price dips to \$2,400/)).toBeTruthy();
    expect(screen.getByText(/Price stays above/)).toBeTruthy();
    expect(screen.getByText("$12,000")).toBeTruthy();
    expect(screen.getByText(/5 ETH at/)).toBeTruthy();
  });

  it("文案不含禁用词", () => {
    const { container } = render(<TwoOutcomes />);
    expect(container.textContent).not.toMatch(banned);
  });
});
