import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "../../../lib/auth/config";
import { createAuthClient } from "../../../lib/auth/server";

// 邮件里的链接（验证邮箱、重置密码）回到这里，换成登录状态后跳转。
export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const next = safeNext(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  const supabase = await createAuthClient();
  if (supabase) {
    const { error } = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : tokenHash && type
        ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
        : { error: new Error("missing code") };
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }

  // 换登录状态失败：通常是在另一个浏览器/设备上打开了链接。
  // 验证邮箱这一步 Supabase 已经完成，让用户直接登录即可；重置密码则需要重新申请。
  const notice = next === "/reset-password" ? "reset-expired" : url.searchParams.has("error") ? "link-expired" : "confirmed";
  return NextResponse.redirect(new URL(`/login?notice=${notice}`, url.origin));
}
