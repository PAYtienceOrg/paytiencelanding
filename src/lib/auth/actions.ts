"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { siteOrigin } from "../site";
import { authErrorMessage, safeNext } from "./config";
import { createAuthClient } from "./server";

export type FormState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "sent"; email: string; message: string };

const NOT_CONFIGURED: FormState = { status: "error", message: "Accounts aren't available yet. Please try again later." };

const email = z.string().trim().toLowerCase().max(254).email("Please enter a valid email address.");
const password = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(72, "Password must be 72 characters or fewer.");

const field = (form: FormData, name: string) => String(form.get(name) ?? "");

const callback = (origin: string, next: string) => `${origin}/auth/callback?next=${encodeURIComponent(next)}`;

// 注册：建账号，邀请码存进账号资料；验证邮箱后在“我的账户”里正式加入候补名单。
export async function signUpAction(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = z
    .object({ email, password, ref: z.string().regex(/^[a-zA-Z0-9]{8}$/).optional().catch(undefined) })
    .safeParse({ email: field(form, "email"), password: field(form, "password"), ref: field(form, "ref") || undefined });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };

  const supabase = await createAuthClient();
  if (!supabase) return NOT_CONFIGURED;

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: callback(await siteOrigin(), "/account"),
      data: parsed.data.ref ? { ref: parsed.data.ref } : {},
    },
  });
  if (error) return { status: "error", message: authErrorMessage(error.message) };

  // 邮箱已注册时 Supabase 不报错，而是返回一个没有身份信息的用户
  if (data.user && data.user.identities?.length === 0) {
    return { status: "error", message: authErrorMessage("already registered") };
  }
  // 项目关闭了邮箱验证时会直接登录
  if (data.session) redirect("/account");

  return {
    status: "sent",
    email: parsed.data.email,
    message: "We sent a confirmation link to your email. Open it to finish joining the waitlist.",
  };
}

export async function resendConfirmationAction(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = email.safeParse(field(form, "email"));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };
  const supabase = await createAuthClient();
  if (!supabase) return NOT_CONFIGURED;
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data,
    options: { emailRedirectTo: callback(await siteOrigin(), "/account") },
  });
  if (error) return { status: "error", message: authErrorMessage(error.message) };
  return { status: "sent", email: parsed.data, message: "A new confirmation link is on its way." };
}

export async function logInAction(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = z
    .object({ email, password: z.string().min(1, "Please enter your password.") })
    .safeParse({ email: field(form, "email"), password: field(form, "password") });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };

  const supabase = await createAuthClient();
  if (!supabase) return NOT_CONFIGURED;

  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { status: "error", message: authErrorMessage(error.message) };
  redirect(safeNext(field(form, "next")));
}

export async function logOutAction() {
  const supabase = await createAuthClient();
  await supabase?.auth.signOut();
  redirect("/");
}

// 忘记密码：无论邮箱是否存在都返回同样的提示，不暴露谁注册过。
export async function requestPasswordResetAction(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = email.safeParse(field(form, "email"));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };
  const supabase = await createAuthClient();
  if (!supabase) return NOT_CONFIGURED;
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
    redirectTo: callback(await siteOrigin(), "/reset-password"),
  });
  if (error && authErrorMessage(error.message).startsWith("Too many")) {
    return { status: "error", message: authErrorMessage(error.message) };
  }
  return {
    status: "sent",
    email: parsed.data,
    message: "If an account exists for this email, a reset link is on its way.",
  };
}

export async function updatePasswordAction(_prev: FormState, form: FormData): Promise<FormState> {
  const parsed = password.safeParse(field(form, "password"));
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };
  if (field(form, "password") !== field(form, "confirm")) return { status: "error", message: "The two passwords don't match." };

  const supabase = await createAuthClient();
  if (!supabase) return NOT_CONFIGURED;
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { status: "error", message: "This reset link has expired. Please request a new one." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) return { status: "error", message: authErrorMessage(error.message) };
  redirect("/account?updated=password");
}
