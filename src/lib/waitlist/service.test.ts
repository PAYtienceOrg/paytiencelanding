// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryWaitlistStore } from "./memoryStore";
import { createWaitlistStore, WaitlistService } from "./service";
import { ReferralCodeConflictError } from "./store";
import { SupabaseWaitlistStore } from "./supabaseStore";

describe("storage selection from environment", () => {
  afterEach(() => vi.restoreAllMocks());

  const supabase = { SUPABASE_URL: "https://x.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "key" };

  it("uses Supabase when both values are set outside tests", () => {
    expect(createWaitlistStore({ NODE_ENV: "production", ...supabase })).toBeInstanceOf(SupabaseWaitlistStore);
    expect(createWaitlistStore({ NODE_ENV: "development", ...supabase })).toBeInstanceOf(SupabaseWaitlistStore);
  });

  it("uses memory in development and tests when Supabase is not configured", () => {
    expect(createWaitlistStore({ NODE_ENV: "development" })).toBeInstanceOf(MemoryWaitlistStore);
    expect(createWaitlistStore({ NODE_ENV: "test", ...supabase })).toBeInstanceOf(MemoryWaitlistStore);
  });

  it("refuses signups in production without Supabase instead of losing them in memory", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const store = createWaitlistStore({ NODE_ENV: "production", SUPABASE_URL: "https://x.supabase.co" });
    expect(store).not.toBeInstanceOf(MemoryWaitlistStore);
    expect(log).toHaveBeenCalledWith(expect.stringContaining("SUPABASE_SERVICE_ROLE_KEY"));

    const service = new WaitlistService(store);
    expect((await service.signup({ email: "a@example.com" }, "ip")).status).toBe(503);
    expect((await service.count()).status).toBe(503);
  });
});

describe("waitlist service with memory storage", () => {
  let store: MemoryWaitlistStore;
  let service: WaitlistService;

  beforeEach(() => {
    store = new MemoryWaitlistStore();
    service = new WaitlistService(store);
  });

  afterEach(() => vi.useRealTimers());

  it("assigns sequential positions and unique eight-character referral codes", async () => {
    const first = await service.signup({ email: " First@Example.com " }, "ip-1");
    const second = await service.signup({ email: "second@example.com" }, "ip-2");
    expect(first).toEqual({ status: 201, body: {
      position: 1, referralCode: expect.stringMatching(/^[a-z0-9]{8}$/), total: 1,
    } });
    expect(second).toEqual({ status: 201, body: {
      position: 2, referralCode: expect.stringMatching(/^[a-z0-9]{8}$/), total: 2,
    } });
    expect(second.body).not.toHaveProperty("referralCode", Reflect.get(first.body, "referralCode"));
    expect(await service.count()).toEqual({ status: 200, body: { total: 2 } });
  });

  it("normalizes email before deduplication and preserves the original code", async () => {
    const first = await service.signup({ email: " First@Example.com " }, "ip-1");
    expect(await service.signup({ email: "first@example.com" }, "ip-2"))
      .toEqual({ status: 200, body: first.body });
    expect(await store.count()).toBe(1);
  });

  it.each([
    null, [], {}, { email: "" }, { email: "bad" }, { email: "a@" },
    { email: 123 }, { email: "a@example.com", ref: 123 },
    { email: "a@example.com", ref: "x".repeat(9) },
  ])("rejects invalid input with 400 and no insertion: %j", async (body) => {
    expect(await service.signup(body, "ip-1")).toEqual({
      status: 400, body: { error: expect.any(String) },
    });
    expect(await store.count()).toBe(0);
  });

  it("limits all POST attempts, including invalid ones, to five per IP", async () => {
    for (let i = 0; i < 5; i++) {
      expect((await service.signup({}, "ip-1")).status).toBe(400);
    }
    expect(await service.signup({ email: "sixth@example.com" }, "ip-1"))
      .toEqual({ status: 429, body: { error: expect.any(String) } });
    expect((await service.signup({ email: "other@example.com" }, "ip-2")).status).toBe(201);
    expect(await store.count()).toBe(1);
  });

  it("uses a rolling minute and permits requests exactly after expiry", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
    for (let i = 0; i < 5; i++) await service.signup({}, "ip-1");
    vi.advanceTimersByTime(59_999);
    expect((await service.signup({}, "ip-1")).status).toBe(429);
    vi.advanceTimersByTime(1);
    expect((await service.signup({ email: "fresh@example.com" }, "ip-1")).status).toBe(201);
  });

  it("moves the inviter from eighth to third while keeping positions unique", async () => {
    for (let i = 1; i <= 8; i++) {
      await store.join({ email: `person${i}@example.com`, referralCode: `code000${i}` });
    }
    expect(await service.signup({ email: "friend@example.com", ref: "code0008" }, "ip-1"))
      .toMatchObject({ status: 201, body: { position: 9, total: 9 } });
    const positions = [];
    for (let i = 1; i <= 8; i++) {
      const result = await service.signup({ email: `person${i}@example.com` }, `lookup-${i}`);
      positions.push(Reflect.get(result.body, "position"));
    }
    expect(positions).toEqual([1, 2, 4, 5, 6, 7, 8, 3]);
  });

  it("clamps rewards to first place and never rewards duplicate signups", async () => {
    for (let i = 1; i <= 8; i++) {
      await store.join({ email: `person${i}@example.com`, referralCode: `code000${i}` });
    }
    await service.signup({ email: "friend@example.com", ref: "code0008" }, "ip-1");
    await service.signup({ email: " FRIEND@example.com ", ref: "code0008" }, "ip-2");
    expect(await service.signup({ email: "person8@example.com" }, "ip-3"))
      .toMatchObject({ status: 200, body: { position: 3, total: 9 } });
    await service.signup({ email: "another@example.com", ref: "code0008" }, "ip-4");
    expect(await service.signup({ email: "person8@example.com", ref: "code0008" }, "ip-5"))
      .toMatchObject({ status: 200, body: { position: 1, total: 10 } });
  });

  it("ignores unknown referral codes", async () => {
    await store.join({ email: "first@example.com", referralCode: "code0001" });
    expect(await service.signup({ email: "next@example.com", ref: "unknown1" }, "ip-1"))
      .toMatchObject({ status: 201, body: { position: 2, total: 2 } });
  });

  it("deduplicates simultaneous signups and awards their referral once", async () => {
    for (let i = 1; i <= 8; i++) {
      await store.join({ email: `person${i}@example.com`, referralCode: `code000${i}` });
    }
    const results = await Promise.all(Array.from({ length: 5 }, (_, i) =>
      service.signup({ email: "same@example.com", ref: "code0008" }, `ip-${i}`)));
    expect(results.map((result) => result.status).sort()).toEqual([200, 200, 200, 200, 201]);
    expect(await store.count()).toBe(9);
    expect(await service.signup({ email: "person8@example.com" }, "lookup"))
      .toMatchObject({ body: { position: 3 } });
  });

  it("rejects a referral-code collision without changing stored data", async () => {
    await store.join({ email: "first@example.com", referralCode: "samecode" });
    await expect(store.join({ email: "other@example.com", referralCode: "samecode" }))
      .rejects.toBeInstanceOf(ReferralCodeConflictError);
    expect(await store.count()).toBe(1);
  });

  it("retries generated-code collisions", async () => {
    class CollisionStore extends MemoryWaitlistStore {
      attempts = 0;
      override async join(input: Parameters<MemoryWaitlistStore["join"]>[0]) {
        if (this.attempts++ === 0) throw new ReferralCodeConflictError();
        return super.join(input);
      }
    }
    expect(await new WaitlistService(new CollisionStore()).signup({ email: "new@example.com" }, "ip"))
      .toMatchObject({ status: 201, body: { position: 1, total: 1 } });
  });

  it("returns a safe 503 on storage failure without leaking internal details", async () => {
    class UnavailableStore extends MemoryWaitlistStore {
      override async join(): Promise<never> { throw new Error("private credentials"); }
      override async count(): Promise<never> { throw new Error("private credentials"); }
    }
    const unavailable = new WaitlistService(new UnavailableStore());
    expect(await unavailable.signup({ email: "new@example.com" }, "ip"))
      .toEqual({ status: 503, body: { error: "Waitlist is temporarily unavailable. Please try again." } });
    expect(await unavailable.count())
      .toEqual({ status: 503, body: { error: "Waitlist is temporarily unavailable. Please try again." } });
  });
});

describe("Supabase REST adapter (network stubbed)", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("posts a single atomic signup RPC with server credentials", async () => {
    const fetchStub = vi.fn().mockResolvedValue(Response.json({
      created: true, position: 2, referralCode: "code0002", total: 2,
    }));
    vi.stubGlobal("fetch", fetchStub);
    const store = new SupabaseWaitlistStore("https://example.supabase.co/", "test-secret");
    expect(await store.join({ email: "new@example.com", referralCode: "code0002", ref: "code0001" }))
      .toEqual({ created: true, position: 2, referralCode: "code0002", total: 2 });
    const [url, init] = fetchStub.mock.calls[0];
    expect(url).toBe("https://example.supabase.co/rest/v1/rpc/join_waitlist");
    expect(init).toMatchObject({ method: "POST", cache: "no-store", headers: {
      apikey: "test-secret", Authorization: "Bearer test-secret", "Content-Type": "application/json",
    } });
    expect(JSON.parse(init.body)).toEqual({
      p_email: "new@example.com", p_referral_code: "code0002", p_ref: "code0001",
    });
  });

  it("reads an exact count without downloading emails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, {
      headers: { "content-range": "*/12" },
    })));
    expect(await new SupabaseWaitlistStore("https://example.supabase.co", "test-secret").count()).toBe(12);
  });

  it.each([
    () => new Response("private details", { status: 500 }),
    () => Response.json({ unexpected: true }),
  ])("rejects failed or malformed RPC responses", async (response) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(response()));
    await expect(new SupabaseWaitlistStore("https://example.supabase.co", "test-secret")
      .join({ email: "new@example.com", referralCode: "code0001" })).rejects.toThrow();
  });

  it("maps uniqueness conflicts to a retryable referral collision", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ code: "23505" }, { status: 409 })));
    await expect(new SupabaseWaitlistStore("https://example.supabase.co", "test-secret")
      .join({ email: "new@example.com", referralCode: "code0001" }))
      .rejects.toBeInstanceOf(ReferralCodeConflictError);
  });

  it("rejects missing count metadata rather than reporting zero", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null)));
    await expect(new SupabaseWaitlistStore("https://example.supabase.co", "test-secret").count())
      .rejects.toThrow();
  });
});

describe("waitlist HTTP routes", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("SUPABASE_URL", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    delete (globalThis as { __waitlistService?: unknown }).__waitlistService;
  });
  afterEach(() => vi.unstubAllEnvs());

  it("shares the signup store with the count route and returns JSON statuses", async () => {
    const { POST } = await import("../../app/api/waitlist/route");
    const { GET } = await import("../../app/api/waitlist/count/route");
    expect(await (await GET()).json()).toEqual({ total: 0 });
    const request = () => new Request("http://localhost/api/waitlist", {
      method: "POST", body: JSON.stringify({ email: "api@example.com" }),
      headers: { "x-forwarded-for": "192.0.2.1, 10.0.0.1" },
    });
    const created = await POST(request());
    expect(created.status).toBe(201);
    expect(await created.json()).toMatchObject({ position: 1, total: 1 });
    expect((await POST(request())).status).toBe(200);
    const count = await GET();
    expect(count.headers.get("cache-control")).toContain("no-store");
    expect(await count.json()).toEqual({ total: 1 });
  });

  it("counts malformed JSON attempts and returns 429 on the sixth", async () => {
    const { POST } = await import("../../app/api/waitlist/route");
    const request = () => new Request("http://localhost/api/waitlist", {
      method: "POST", body: "{", headers: { "x-real-ip": "192.0.2.2" },
    });
    for (let i = 0; i < 5; i++) {
      const response = await POST(request());
      expect(response.status).toBe(400);
      expect(await response.json()).toHaveProperty("error");
    }
    expect((await POST(request())).status).toBe(429);
  });
});
