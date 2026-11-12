import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { JoinLink } from "./JoinLink";
import { WaitlistCount } from "./WaitlistCount";
import { WaitlistForm } from "./WaitlistForm";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", "/");
});

const json = (status: number, body: unknown) =>
  Promise.resolve(new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } }));

const submit = (email: string) => {
  fireEvent.change(screen.getByLabelText("Email address"), { target: { value: email } });
  fireEvent.click(screen.getByRole("button", { name: "Join the waitlist" }));
};

const mockFetch = (status: number, body: unknown) =>
  vi.fn<(url: string, init?: RequestInit) => Promise<Response>>(() => json(status, body));

const sentBody = (fetchMock: ReturnType<typeof mockFetch>) => JSON.parse(String(fetchMock.mock.calls[0][1]?.body));

describe("JoinLink", () => {
  it("points at the sign-up form on the page", () => {
    render(<JoinLink>Join the waitlist</JoinLink>);
    expect(screen.getByRole("link", { name: "Join the waitlist" }).getAttribute("href")).toBe("#join");
  });
});

describe("WaitlistForm", () => {
  it("joins with just an email and shows the place and invite link", async () => {
    const fetchMock = mockFetch(201, { position: 1284, referralCode: "abcd1234", total: 1284 });
    vi.stubGlobal("fetch", fetchMock);
    render(<WaitlistForm />);
    submit(" you@example.com ");
    expect(await screen.findByText("#1,284")).toBeTruthy();
    expect(screen.getByText("You're on the waitlist.")).toBeTruthy();
    expect((screen.getByLabelText("Your invite link") as HTMLInputElement).value).toBe(`${window.location.origin}/?ref=abcd1234`);
    expect(fetchMock.mock.calls[0][0]).toBe("/api/waitlist");
    expect(sentBody(fetchMock)).toEqual({ email: "you@example.com" });
    expect(screen.queryByLabelText(/password/i)).toBeNull();
  });

  it("shows the existing place when the email is already on the list", async () => {
    vi.stubGlobal("fetch", vi.fn(() => json(200, { position: 3, referralCode: "abcd1234", total: 9 })));
    render(<WaitlistForm />);
    submit("you@example.com");
    expect(await screen.findByText("You're already on the waitlist.")).toBeTruthy();
    expect(screen.getByText("#3")).toBeTruthy();
  });

  it("sends a well-formed invite code from the address and drops a malformed one", async () => {
    const fetchMock = mockFetch(201, { position: 2, referralCode: "abcd1234", total: 2 });
    vi.stubGlobal("fetch", fetchMock);
    window.history.replaceState(null, "", "/?ref=code0001");
    render(<WaitlistForm />);
    submit("you@example.com");
    await screen.findByText("#2");
    expect(sentBody(fetchMock)).toEqual({ email: "you@example.com", ref: "code0001" });

    cleanup();
    fetchMock.mockClear();
    window.history.replaceState(null, "", "/?ref=bad");
    render(<WaitlistForm />);
    submit("you@example.com");
    await screen.findByText("#2");
    expect(sentBody(fetchMock)).toEqual({ email: "you@example.com" });
  });

  it.each([
    [400, /valid email/],
    [429, /Too many attempts/],
    [503, /couldn't add you/],
  ])("explains a %i response and keeps the form", async (status, message) => {
    vi.stubGlobal("fetch", vi.fn(() => json(status, { error: "internal detail" })));
    render(<WaitlistForm />);
    submit("you@example.com");
    expect((await screen.findByRole("alert")).textContent).toMatch(message);
    expect(screen.queryByText(/internal detail/)).toBeNull();
    expect(screen.getByRole("button", { name: "Join the waitlist" })).toBeTruthy();
  });

  it("does not call the server for an empty email", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<WaitlistForm />);
    submit("  ");
    expect(screen.getByRole("alert").textContent).toMatch(/enter your email/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("WaitlistCount", () => {
  it("shows the count with thousands separators", async () => {
    vi.stubGlobal("fetch", vi.fn(() => json(200, { total: 1284 })));
    render(<WaitlistCount />);
    expect(await screen.findByText("1,284")).toBeTruthy();
  });

  it("is hidden when the count is 0", async () => {
    const fetchMock = vi.fn(() => json(200, { total: 0 }));
    vi.stubGlobal("fetch", fetchMock);
    const { container } = render(<WaitlistCount />);
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(container.textContent).toBe("");
  });
});
