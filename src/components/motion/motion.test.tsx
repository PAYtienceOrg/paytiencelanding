import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const reduced = vi.hoisted(() => ({ value: true }));

vi.mock("framer-motion", async (importOriginal) => ({
  ...(await importOriginal<typeof import("framer-motion")>()),
  useReducedMotion: () => reduced.value,
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

import { CountUp } from "./CountUp";
import { Reveal } from "./Reveal";
import { SplitHeadline } from "./SplitHeadline";
import { Stagger, StaggerItem } from "./Stagger";

afterEach(() => {
  cleanup();
  reduced.value = true;
});

describe("减少动画时直接显示最终状态", () => {
  it("CountUp 直接显示最终值，带 $ 前缀和千分位", () => {
    render(<CountUp value={12000} prefix="$" />);
    expect(screen.getByText("$12,000")).toBeTruthy();
  });

  it("CountUp 没有前缀时只加千分位", () => {
    render(<CountUp value={1284} />);
    expect(screen.getByText("1,284")).toBeTruthy();
  });

  it("Reveal 直接可见，不带隐藏样式", () => {
    render(<Reveal>正文</Reveal>);
    const el = screen.getByText("正文");
    expect(el.style.opacity).not.toBe("0");
  });

  it("Stagger 的子元素直接可见", () => {
    render(
      <Stagger>
        <StaggerItem>一</StaggerItem>
        <StaggerItem>二</StaggerItem>
      </Stagger>,
    );
    expect(screen.getByText("一").style.opacity).not.toBe("0");
    expect(screen.getByText("二").style.opacity).not.toBe("0");
  });

  it("SplitHeadline 直接可见", () => {
    render(<SplitHeadline text="Name your price." />);
    expect(screen.getByRole("heading", { name: "Name your price." })).toBeTruthy();
    expect(screen.getByText("price.").style.opacity).not.toBe("0");
  });
});

describe("开启动画时的初始状态", () => {
  it("CountUp 从 0 开始", () => {
    reduced.value = false;
    render(<CountUp value={12000} prefix="$" />);
    expect(screen.getByText("$0")).toBeTruthy();
  });

  it("Reveal 初始是隐藏的", () => {
    reduced.value = false;
    render(<Reveal>正文</Reveal>);
    expect(screen.getByText("正文").style.opacity).toBe("0");
  });
});
