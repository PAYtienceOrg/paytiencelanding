import { z } from "zod";
import { ReferralCodeConflictError } from "./store";
import type { JoinWaitlistInput, JoinWaitlistResult, WaitlistStore } from "./store";

const joinResultSchema = z.object({
  created: z.boolean(),
  position: z.number().int().positive(),
  referralCode: z.string().regex(/^[a-z0-9]{8}$/),
  total: z.number().int().positive(),
}).refine((result) => result.position <= result.total);

export class SupabaseWaitlistStore implements WaitlistStore {
  private readonly baseUrl: string;

  constructor(url: string, private readonly serviceRoleKey: string) {
    this.baseUrl = `${url.replace(/\/+$/, "")}/rest/v1`;
  }

  private request(path: string, init: RequestInit): Promise<Response> {
    return fetch(`${this.baseUrl}/${path}`, {
      ...init,
      headers: {
        apikey: this.serviceRoleKey,
        Authorization: `Bearer ${this.serviceRoleKey}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  }

  async join(input: JoinWaitlistInput): Promise<JoinWaitlistResult> {
    const response = await this.request("rpc/join_waitlist", {
      method: "POST",
      body: JSON.stringify({
        p_email: input.email,
        p_referral_code: input.referralCode,
        p_ref: input.ref ?? null,
      }),
    });
    if (!response.ok) {
      if (response.status === 409) {
        const error: unknown = await response.json();
        if (z.object({ code: z.literal("23505") }).safeParse(error).success) {
          throw new ReferralCodeConflictError();
        }
      }
      throw new Error(`Waitlist storage request failed (join, HTTP ${response.status}).`);
    }
    return joinResultSchema.parse(await response.json());
  }

  async count(): Promise<number> {
    const response = await this.request("waitlist_entries?select=email", {
      method: "HEAD",
      headers: { Prefer: "count=exact" },
    });
    if (!response.ok) throw new Error(`Waitlist storage request failed (count, HTTP ${response.status}).`);
    const match = /^(?:\d+-\d+|\*)\/(\d+)$/.exec(response.headers.get("content-range") ?? "");
    const total = match ? Number(match[1]) : NaN;
    if (!Number.isSafeInteger(total)) throw new Error("Invalid waitlist count response.");
    return total;
  }
}
