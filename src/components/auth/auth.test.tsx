import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

// 服务端 action 在这里用空函数代替，只测界面
vi.mock("../../lib/auth/actions", () => {
  const noop = async () => ({ status: "idle" });
  return {
    signUpAction: noop,
    logInAction: noop,
    resendConfirmationAction: noop,
    requestPasswordResetAction: noop,
    updatePasswordAction: noop,
  };
});

import { LogInForm, ResetPasswordForm, SignUpForm } from "./AuthForms";

afterEach(cleanup);

describe("SignUpForm", () => {
  it("有邮箱、密码和提交按钮，并带上邀请码", () => {
    const { container } = render(<SignUpForm referral="abcd1234" />);
    expect(screen.getByLabelText("Email")).toBeTruthy();
    expect(screen.getByLabelText("Password").getAttribute("autocomplete")).toBe("new-password");
    expect(screen.getByRole("button", { name: "Create account" })).toBeTruthy();
    expect((container.querySelector('input[name="ref"]') as HTMLInputElement).value).toBe("abcd1234");
    expect(screen.getByText(/invited by a friend/)).toBeTruthy();
  });

  it("密码可以显示和隐藏", () => {
    render(<SignUpForm />);
    const field = screen.getByLabelText("Password") as HTMLInputElement;
    expect(field.type).toBe("password");
    const toggle = screen.getByRole("button", { name: /show/i });
    expect(toggle.textContent).toBe("Show password");
    fireEvent.click(toggle);
    expect(field.type).toBe("text");
    expect(toggle.textContent).toBe("Hide password");
  });
});

describe("LogInForm", () => {
  it("有忘记密码和注册入口", () => {
    render(<LogInForm />);
    expect(screen.getByRole("link", { name: "Forgot password?" }).getAttribute("href")).toBe("/forgot-password");
    expect(screen.getByRole("link", { name: "Create an account" }).getAttribute("href")).toBe("/signup");
  });

  it("从邮件链接回来时显示提示", () => {
    render(<LogInForm notice="confirmed" />);
    expect(screen.getByText(/Your email is confirmed/)).toBeTruthy();
  });

  it("把登录后要去的页面带上", () => {
    const { container } = render(<LogInForm next="/account" />);
    expect((container.querySelector('input[name="next"]') as HTMLInputElement).value).toBe("/account");
  });
});

describe("ResetPasswordForm", () => {
  it("要求输入两次新密码", () => {
    render(<ResetPasswordForm />);
    expect(screen.getByLabelText("New password")).toBeTruthy();
    expect(screen.getByLabelText("Confirm new password")).toBeTruthy();
  });
});
