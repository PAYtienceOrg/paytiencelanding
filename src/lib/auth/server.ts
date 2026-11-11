import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { authConfig } from "./config";

// 每个请求新建一个服务端 Supabase 客户端，登录状态存在 cookie 里。
// 没配置 SUPABASE_PUBLISHABLE_KEY 时返回 null。
export async function createAuthClient() {
  // 先读 cookie：让用到登录状态的页面始终按请求渲染，即使构建时还没配置 key
  const store = await cookies();
  const config = authConfig();
  if (!config) return null;
  return createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // 页面渲染时不能写 cookie；会话由 proxy.ts 负责刷新。
        }
      },
    },
  });
}

export async function getCurrentUser() {
  const supabase = await createAuthClient();
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user;
}
