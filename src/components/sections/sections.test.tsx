import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

import { Simulator } from "../simulator/Simulator";
import { Faq } from "./Faq";
import { GoodToKnow } from "./GoodToKnow";
import { HowItWorks } from "./HowItWorks";
import { MobileNav } from "./MobileNav";

afterEach(cleanup);

const banned = /risk-free|guaranteed|zero risk/i;

describe("HowItWorks", () => {
  it("显示标题和三个步骤", () => {
    render(<HowItWorks />);
    expect(screen.getByRole("heading", { name: "How it works" })).toBeTruthy();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("Choose your crypto")).toBeTruthy();
    expect(screen.getByText("Set your price & deadline")).toBeTruthy();
    expect(screen.getByText("Get crypto or a refund")).toBeTruthy();
  });

  it("文案不含禁用词", () => {
    const { container } = render(<HowItWorks />);
    expect(container.textContent).not.toMatch(banned);
  });
});

// 这个文件里动画是关闭的（减少动画），模拟器直接显示最终结果。
describe("Simulator", () => {
  const commit = () => screen.getByText("You commit").nextElementSibling?.textContent;

  it("默认：5 ETH，目标 $2,400，下跌情景直接成交", () => {
    render(<Simulator />);
    expect(commit()).toBe("$12,000");
    expect(screen.getByText("You get 5 ETH at $2,400")).toBeTruthy();
    expect(screen.getByText("Target reached on day 2")).toBeTruthy();
  });

  it("切到上涨情景：全额退款", async () => {
    render(<Simulator />);
    fireEvent.click(screen.getByRole("button", { name: /Price rises/ }));
    // 旧结果卡片先淡出，新的才出现
    expect(await screen.findByText("$12,000 refunded in full")).toBeTruthy();
    expect(screen.getByText(/above your \$2,400 target/)).toBeTruthy();
  });

  it("换币种时数量重置为该币的默认值", () => {
    render(<Simulator />);
    fireEvent.click(screen.getByRole("button", { name: /BTC/ }));
    expect((screen.getByLabelText("How much") as HTMLSelectElement).value).toBe("0.1");
    // 65,000 × 96% = 62,400；× 0.1 = 6,240
    expect(commit()).toBe("$6,240");
    expect(screen.getByText("You get 0.1 BTC at $62,400")).toBeTruthy();
  });

  it("拖价格、改数量和天数后结果跟着变", () => {
    render(<Simulator />);
    // 滑块值是负的折扣：-10 = 比现价低 10%
    fireEvent.change(screen.getByLabelText("Your price"), { target: { value: "-10" } });
    fireEvent.change(screen.getByLabelText("How much"), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: "7 days" }));
    expect(commit()).toBe("$4,500");
    expect(screen.getByText("You get 2 ETH at $2,250")).toBeTruthy();
    expect(screen.getByText("Target reached on day 5")).toBeTruthy();
  });

  it("价格滑块往右是更高的价格，两端显示价格", () => {
    render(<Simulator />);
    const slider = screen.getByLabelText("Your price") as HTMLInputElement;
    expect(screen.getByText("$2,000")).toBeTruthy(); // 左端：低 20%
    expect(screen.getByText("$2,475")).toBeTruthy(); // 右端：低 1%
    fireEvent.change(slider, { target: { value: slider.max } });
    expect(commit()).toBe("$12,375"); // 5 × $2,475
  });

  it("同时列出两种结果", () => {
    render(<Simulator />);
    expect(screen.getByText("If ETH hits $2,400 within 3 days")).toBeTruthy();
    expect(screen.getByText("You get 5 ETH")).toBeTruthy();
    expect(screen.getByText("$12,000 back")).toBeTruthy();
  });

  it("按钮都够大，手机上好点", () => {
    render(<Simulator />);
    for (const b of screen.getAllByRole("button")) expect(b.className).toMatch(/min-h-11/);
  });

  it("文案不含禁用词", () => {
    const { container } = render(<Simulator />);
    fireEvent.click(screen.getByRole("button", { name: /Price rises/ }));
    expect(container.textContent).not.toMatch(banned);
  });
});

describe("GoodToKnow", () => {
  it("四条规则，带锚点", () => {
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

  it("点按钮展开，点链接后收起", () => {
    render(<MobileNav links={links} />);
    const button = screen.getByRole("button", { name: "Open menu" });
    expect(button.getAttribute("aria-expanded")).toBe("false");
    fireEvent.click(button);
    expect(screen.getByRole("button", { name: "Close menu" }).getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(screen.getByRole("link", { name: "A" }));
    expect(screen.queryByRole("link", { name: "A" })).toBeNull();
  });

  it("按 Esc 收起", () => {
    render(<MobileNav links={links} />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("link", { name: "B" })).toBeNull();
  });
});

describe("Faq", () => {
  it("六个问题，第一个默认展开", () => {
    const { container } = render(<Faq />);
    const items = container.querySelectorAll("details");
    expect(items).toHaveLength(6);
    expect(items[0].open).toBe(true);
    expect(items[1].open).toBe(false);
    expect(container.textContent).not.toMatch(banned);
  });
});
