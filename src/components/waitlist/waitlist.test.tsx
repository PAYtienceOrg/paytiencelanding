import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import { JoinLink, signupHref } from "./JoinLink";
import { WaitlistCount } from "./WaitlistCount";

beforeEach(() => push.mockReset());

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", "/");
});

const json = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

describe("JoinLink", () => {
  it("跳到注册页并带上网址里的邀请码", () => {
    window.history.replaceState(null, "", "/?ref=abcd1234");
    render(<JoinLink>Join the waitlist</JoinLink>);
    fireEvent.click(screen.getByRole("link", { name: "Join the waitlist" }));
    expect(push).toHaveBeenCalledWith("/signup?ref=abcd1234");
  });

  it("格式不对的邀请码不带过去", () => {
    window.history.replaceState(null, "", "/?ref=bad");
    expect(signupHref()).toBe("/signup");
  });

  it("没有 JS 时也是普通的注册链接", () => {
    render(<JoinLink>Join the waitlist</JoinLink>);
    expect(screen.getByRole("link", { name: "Join the waitlist" }).getAttribute("href")).toBe("/signup");
  });
});

describe("WaitlistCount", () => {
  it("显示带千分位的人数", async () => {
    vi.stubGlobal("fetch", vi.fn(() => json(200, { total: 1284 })));
    render(<WaitlistCount />);
    expect(await screen.findByText("1,284")).toBeTruthy();
  });

  it("人数为 0 时不显示", async () => {
    const fetchMock = vi.fn(() => json(200, { total: 0 }));
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(<WaitlistCount />);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(container.textContent).toBe("");
  });
});
