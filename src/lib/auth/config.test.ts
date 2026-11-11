import { describe, expect, it } from "vitest";
import { authConfig, authErrorMessage, safeNext } from "./config";

describe("authConfig", () => {
  it("需要 URL 和 publishable key 都有", () => {
    expect(authConfig({ SUPABASE_URL: "https://x.supabase.co", SUPABASE_PUBLISHABLE_KEY: "sb_publishable_x" })).toEqual({
      url: "https://x.supabase.co",
      key: "sb_publishable_x",
    });
    expect(authConfig({ SUPABASE_URL: "https://x.supabase.co" })).toBeNull();
    // 不会拿 secret key 去做登录
    expect(authConfig({ SUPABASE_URL: "https://x.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "sb_secret_x" })).toBeNull();
  });
});

describe("safeNext", () => {
  it("只允许站内路径", () => {
    expect(safeNext("/account")).toBe("/account");
    expect(safeNext("/reset-password")).toBe("/reset-password");
    expect(safeNext("https://evil.example")).toBe("/account");
    expect(safeNext("//evil.example")).toBe("/account");
    expect(safeNext("/\\evil.example")).toBe("/account");
    expect(safeNext(null)).toBe("/account");
    expect(safeNext("", "/")).toBe("/");
  });
});

describe("authErrorMessage", () => {
  it("把常见错误换成易懂的话", () => {
    expect(authErrorMessage("Invalid login credentials")).toBe("Email or password is incorrect.");
    expect(authErrorMessage("Email not confirmed")).toMatch(/confirm your email/);
    expect(authErrorMessage("User already registered")).toMatch(/already exists/);
    expect(authErrorMessage("Password should be at least 8 characters.")).toMatch(/stronger password/);
    expect(authErrorMessage("email rate limit exceeded")).toMatch(/Too many attempts/);
    expect(authErrorMessage("For security purposes, you can only request this after 30 seconds.")).toMatch(/Too many/);
    expect(authErrorMessage("New password should be different from the old password.")).toMatch(/different/);
  });

  it("不认识的错误不把原文显示给用户", () => {
    expect(authErrorMessage("relation auth.users does not exist")).toBe("Something went wrong. Please try again.");
    expect(authErrorMessage(undefined)).toBe("Something went wrong. Please try again.");
  });
});
