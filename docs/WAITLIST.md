# Waitlist backend

People join the waitlist with an email address. There are no accounts, passwords or
sign-in pages.

## How a signup is stored

1. The one form on the homepage (`src/components/waitlist/WaitlistForm.tsx`, in the
   Early access section) posts to `POST /api/waitlist`. Every "Join the waitlist"
   button on the page scrolls to that form.
2. The route (`src/app/api/waitlist/route.ts`) passes the body and the caller's IP to
   `WaitlistService.signup()` in `src/lib/waitlist/service.ts`, which rate-limits,
   validates and normalizes the input.
3. The service calls the configured store. With Supabase configured that is
   `src/lib/waitlist/supabaseStore.ts`, which sends one request to the `join_waitlist`
   database function (`POST {SUPABASE_URL}/rest/v1/rpc/join_waitlist`) using the
   service-role key.
4. The function, defined in [waitlist.sql](./waitlist.sql), inserts into the
   `public.waitlist_entries` table and returns `{ created, position, referralCode, total }`.
   The form then shows the place in line and the invite link.

## API

`POST /api/waitlist` accepts JSON `{ "email": "you@example.com", "ref": "a1b2c3d4" }`.
`ref` is optional; it must be eight alphanumeric characters when supplied.
Emails are trimmed, lowercased, and validated with Zod. Extra fields are rejected.

| Status | Response |
| --- | --- |
| 201 | New signup: `{ position, referralCode, total }` |
| 200 | Email already on the list: same referral code, current position and total |
| 400 | Invalid JSON, email, or body: `{ error }` (includes the invalid field) |
| 429 | More than five POST attempts from one IP within a rolling minute: `{ error }` |
| 503 | Storage unavailable or invalid storage response: `{ error }` |

`GET /api/waitlist/count` returns `200 { "total": 0 }` or `503 { error }` and powers the
counter on the homepage. Both endpoints return `Cache-Control: no-store`. No response
includes an email.

## No duplicates

An email can only be on the list once: it is the table's primary key, and it is trimmed
and lowercased before it is stored. Submitting an email that is already on the list
changes nothing and returns its current position, which is also how someone checks
their place later.

## Invite codes and ranking

Each new signup receives a unique eight-character lowercase hexadecimal code.
A new signup with an existing code moves its inviter up five places, capped at
first place. Intervening entries move down one place, keeping the queue contiguous.
Unknown codes are ignored. Repeat submissions never apply an invitation reward,
including when a different referral code is supplied on a retry.

## Things to know before launch

- Emails are not verified. Anyone can add any address, and made-up addresses can be
  used to collect the five-place invite reward. Add email confirmation or a CAPTCHA if
  that matters.
- Entering an email shows that email's place in line to whoever typed it.
- The rate limit lives in the server process's memory. Multiple instances (or
  serverless functions) do not share it; use a shared limiter before relying on a
  deployment-wide limit.
- Configure the trusted ingress proxy to overwrite `x-forwarded-for` (first address) or
  `x-real-ip`; client-controlled forwarded headers are not a trustworthy source of IP
  identity. Requests without a valid IP header share the `unknown` bucket, so without
  those headers all visitors share one limit of five attempts per minute. Invalid and
  duplicate POSTs also count toward the limit.

## Storage and deployment

Copy `.env.example` to `.env.local`. With both `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` set, the server uses Supabase REST via `fetch`.
With either missing, development uses an in-memory store, while production
(`NODE_ENV=production`) returns `503` for both endpoints and logs a configuration
error, so signups are never silently lost. Tests always default to memory, even when
Supabase variables exist. Environment changes require a server restart.

### Going live checklist

1. Create a Supabase project and run [waitlist.sql](./waitlist.sql) in its SQL editor.
2. Copy the project URL and the `service_role` key (Project Settings → API).
3. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` on the host (and in `.env.local` to test locally).
4. Make sure the host's proxy sets `x-forwarded-for` or `x-real-ip`.
5. Join once on the deployed page and check the row in Supabase → Table Editor → `waitlist_entries`.

[waitlist.sql](./waitlist.sql) creates the table, enables RLS, denies public access, and
grants only the service role access. The `join_waitlist` function performs insertion,
deduplication, and ranking updates in one database transaction; its table lock
serializes concurrent signups across instances. Referral-code collisions roll
back and are retried with a new generated code (up to three attempts).

The SQL setup uses a security-invoker function; no elevated public RPC is exposed.
Keep the service-role key server-only. The count query uses an exact HEAD count
and never downloads the email list. Network requests time out after ten seconds.
Storage failures are logged on the server with the operation and HTTP status only;
emails, credentials and database responses are never returned or logged.

In-memory data is process-local and resets on restart.

Reference: [PostgREST RPC](https://docs.postgrest.org/en/stable/references/api/functions.html)
and [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api).
