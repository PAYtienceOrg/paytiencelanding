import Link from "next/link";
import type { ReactNode } from "react";

// 注册、登录、找回密码共用的版式：简单的顶部、居中卡片、底部说明。
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-ink">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight">
            Paytience
          </Link>
          <Link href="/" className="inline-flex min-h-11 items-center text-sm underline-offset-4 hover:underline">
            ← Back to home
          </Link>
        </div>
      </header>
      <main id="main" className="flex flex-1 items-start justify-center px-6 py-12 sm:items-center">
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="px-6 py-6 text-center text-xs text-ink/60">
        Paytience is opening in waves. Creating an account puts you on the waitlist.
      </footer>
    </div>
  );
}
