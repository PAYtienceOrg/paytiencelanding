// Supabase Auth 用的是 publishable key（可公开的那把），和存候补名单用的 secret key 分开。
export function authConfig(env: Record<string, string | undefined> = process.env) {
  const url = env.SUPABASE_URL?.trim();
  const key = env.SUPABASE_PUBLISHABLE_KEY?.trim();
  return url && key ? { url, key } : null;
}

// 登录后跳转的地址只允许站内路径，防止被拿来跳到外部网站。
export function safeNext(next: unknown, fallback = "/account") {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  return next;
}

// 把 Supabase 的英文错误换成用户看得懂的话。
export function authErrorMessage(message: string | undefined) {
  const m = (message ?? "").toLowerCase();
  if (m.includes("invalid login credentials")) return "Email or password is incorrect.";
  if (m.includes("email not confirmed")) return "Please confirm your email first. Check your inbox for the link.";
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "An account with this email already exists. Log in instead.";
  }
  if (m.includes("password") && (m.includes("weak") || m.includes("at least") || m.includes("characters"))) {
    return "Please choose a stronger password (at least 8 characters).";
  }
  if (m.includes("rate limit") || m.includes("too many") || m.includes("security purposes")) {
    return "Too many attempts. Please wait a minute and try again.";
  }
  if (m.includes("same password") || m.includes("different from the old")) {
    return "Your new password must be different from the old one.";
  }
  return "Something went wrong. Please try again.";
}
