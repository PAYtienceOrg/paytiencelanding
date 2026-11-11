"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

const REF = /^[a-zA-Z0-9]{8}$/;

// 注册页地址；当前网址里有邀请码（?ref=xxxxxxxx）就带上
export function signupHref() {
  if (typeof window === "undefined") return "/signup";
  const ref = new URLSearchParams(window.location.search).get("ref") ?? "";
  return REF.test(ref) ? `/signup?ref=${ref}` : "/signup";
}

// 全站唯一的“加入候补名单”入口：跳到注册页
export function JoinLink({ className, children }: { className?: string; children: ReactNode }) {
  const router = useRouter();
  return (
    <Link
      href="/signup"
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return; // 新标签页打开时保持默认行为
        e.preventDefault();
        router.push(signupHref());
      }}
    >
      {children}
    </Link>
  );
}
