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

let service: WaitlistService | undefined;

export function getWaitlistService(): WaitlistService {
  if (!service) {
    const url = process.env.SUPABASE_URL?.trim();
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
    const store = process.env.NODE_ENV !== "test" && url && key
      ? new SupabaseWaitlistStore(url, key)
      : new MemoryWaitlistStore();
    service = new WaitlistService(store);
  }
  return service;
}
