import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authConfig } from "./lib/auth/config";

// 在登录相关页面上刷新 Supabase 会话（access token 过期时换新的并写回 cookie）。
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  const config = authConfig();
  if (!config) return response;

  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list, headers) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
        for (const [key, value] of Object.entries(headers ?? {})) response.headers.set(key, value);
      },
    },
  });
  await supabase.auth.getUser();
  return response;
}

// 首页不需要登录状态，只在账户和登录相关页面上运行，不拖慢落地页。
export const config = {
  matcher: ["/account/:path*", "/login", "/signup", "/reset-password", "/auth/:path*"],
};
