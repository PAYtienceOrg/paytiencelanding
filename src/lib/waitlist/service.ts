import { randomBytes } from "node:crypto";
import { z } from "zod";
import { MemoryWaitlistStore } from "./memoryStore";
import { ReferralCodeConflictError } from "./store";
import type { WaitlistData, WaitlistStore } from "./store";
import { SupabaseWaitlistStore } from "./supabaseStore";

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email(),
  ref: z.string().regex(/^[a-zA-Z0-9]{8}$/).optional(),
}).strict();

type ErrorResult = { status: 400 | 429 | 503; body: { error: string } };
type SignupResult = { status: 200 | 201; body: WaitlistData } | ErrorResult;
const unavailable: ErrorResult = {
  status: 503,
  body: { error: "Waitlist is temporarily unavailable. Please try again." },
};

export class WaitlistService {
  // shortcut: process-local limits, use shared storage when scaling across instances.
  private readonly attempts = new Map<string, number[]>();
  private lastCleanup = 0;

  constructor(private readonly store: WaitlistStore) {}

  private allowPost(ip: string): boolean {
    const now = Date.now();
    const cutoff = now - 60_000;
    if (now - this.lastCleanup >= 60_000) {
      for (const [key, timestamps] of this.attempts) {
        if (timestamps[timestamps.length - 1] <= cutoff) this.attempts.delete(key);
      }
      this.lastCleanup = now;
    }
    const timestamps = (this.attempts.get(ip) ?? []).filter((time) => time > cutoff);
    if (timestamps.length >= 5) return false;
    timestamps.push(now);
    this.attempts.set(ip, timestamps);
    return true;
  }

  async signup(input: unknown, ip: string): Promise<SignupResult> {
    if (!this.allowPost(ip)) {
      return { status: 429, body: { error: "Too many requests. Please try again in a minute." } };
    }
    return this.join(input);
  }

  // 已验证邮箱的登录用户加入候补名单。不走 IP 限流：只有登录后才能调用，同一邮箱重复调用只返回原名次。
  async joinMember(email: string, ref?: string): Promise<SignupResult> {
    const validRef = ref && /^[a-zA-Z0-9]{8}$/.test(ref) ? ref : undefined;
    return this.join(validRef ? { email, ref: validRef } : { email });
  }

  private async join(input: unknown): Promise<SignupResult> {
    const parsed = signupSchema.safeParse(input);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      return { status: 400, body: { error: `${issue.path.join(".") || "body"}: ${issue.message}` } };
    }

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const { created, ...body } = await this.store.join({
          ...parsed.data,
          referralCode: randomBytes(4).toString("hex"),
        });
        return { status: created ? 201 : 200, body };
      } catch (error) {
        if (!(error instanceof ReferralCodeConflictError)) return unavailable;
      }
    }
    return unavailable;
  }

  async count(): Promise<{ status: 200; body: { total: number } } | ErrorResult> {
    try {
      return { status: 200, body: { total: await this.store.count() } };
    } catch {
      return unavailable;
    }
  }
}

// Production without Supabase: refuse signups (503) instead of silently
// keeping them in memory, where they would be lost on restart.
class UnconfiguredWaitlistStore implements WaitlistStore {
  async join(): Promise<never> {
    throw new Error("Waitlist storage is not configured.");
  }

  async count(): Promise<never> {
    throw new Error("Waitlist storage is not configured.");
  }
}

type Env = Record<string, string | undefined>;

export function createWaitlistStore(env: Env = process.env): WaitlistStore {
  const url = env.SUPABASE_URL?.trim();
  const key = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (env.NODE_ENV !== "test" && url && key) return new SupabaseWaitlistStore(url, key);
  if (env.NODE_ENV === "production") {
    console.error(
      "[waitlist] SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are not set. Signups are disabled until they are configured.",
    );
    return new UnconfiguredWaitlistStore();
  }
  return new MemoryWaitlistStore();
}

// Kept on globalThis: Next.js bundles each route separately, so a module-level
// variable would give the signup and count routes different memory stores.
const shared = globalThis as typeof globalThis & { __waitlistService?: WaitlistService };

export function getWaitlistService(): WaitlistService {
  shared.__waitlistService ??= new WaitlistService(createWaitlistStore());
  return shared.__waitlistService;
}
