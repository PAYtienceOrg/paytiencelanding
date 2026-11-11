# Waitlist API

`POST /api/waitlist` accepts JSON `{ "email": "you@example.com", "ref": "a1b2c3d4" }`.
`ref` is optional; it must be eight alphanumeric characters when supplied.
Emails are trimmed, lowercased, and validated with Zod. Extra fields are rejected.

| Status | Response |
| --- | --- |
| 201 | New signup: `{ position, referralCode, total }` |
| 200 | Existing signup: same referral code, current position and total |
| 400 | Invalid JSON, email, or body: `{ error }` (includes the invalid field) |
| 429 | More than five POST attempts from one IP within a rolling minute: `{ error }` |
| 503 | Storage unavailable or invalid storage response: `{ error }` |

`GET /api/waitlist/count` returns `200 { "total": 0 }` or `503 { error }`.
Both endpoints return `Cache-Control: no-store`. No response includes an email.

Each new signup receives a unique eight-character lowercase hexadecimal code.
A new signup with an existing code moves its inviter up five places, capped at
first place. Intervening entries move down one place, keeping the queue contiguous.
Unknown codes are ignored. Duplicate signups never apply an invitation reward,
including when a different referral code is supplied on a retry.

## Storage and deployment

Copy `.env.example` to `.env.local`. With both `SUPABASE_URL` and
`SUPABASE_SERVICE_ROLE_KEY` set, the server uses Supabase REST via `fetch`.
With either missing, development uses memory, while production (`NODE_ENV=production`)
returns `503` for both endpoints and logs a configuration error, so signups are never
silently lost. Tests always default to memory, even when Supabase variables exist.
Environment changes require a server restart.

### Going live checklist

1. Create a Supabase project and run [waitlist.sql](./waitlist.sql) in its SQL editor.
2. Copy the project URL and the `service_role` key (Project Settings → API).
3. Set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` on the host (and in `.env.local` to test locally).
4. Make sure the host's proxy sets `x-forwarded-for` or `x-real-ip`; otherwise all
   visitors share one rate-limit bucket of five signups per minute.
5. Sign up once on the deployed page and check the row in Supabase → Table Editor → `waitlist_entries`.

Before enabling Supabase, run [waitlist.sql](./waitlist.sql) once in the Supabase
SQL editor. It creates the table, enables RLS, denies public access, and grants
only the service role access. The `join_waitlist` RPC performs insertion,
deduplication, and ranking updates in one database transaction; its table lock
serializes concurrent signups across instances. Referral-code collisions roll
back and are retried with a new generated code (up to three attempts).

The SQL setup uses a security-invoker function; no elevated public RPC is exposed.
Keep the service-role key server-only. The count query uses an exact HEAD count
and never downloads the email list. Network requests time out after ten seconds;
internal database errors and credentials are never returned or logged.

Memory data and rate limits are process-local and reset on restart. Multiple
instances do not share rate limits; upgrade to a shared limiter before relying
on a deployment-wide limit. Configure the trusted ingress proxy to overwrite
`x-forwarded-for` (first address) or `x-real-ip`; client-controlled forwarded
headers are not a trustworthy source of IP identity. Requests without a valid
IP header share the `unknown` bucket. Invalid and duplicate POSTs also count
toward the limit. Expired IP buckets are periodically removed on incoming requests.

Reference: [PostgREST RPC](https://docs.postgrest.org/en/stable/references/api/functions.html)
and [Supabase API security](https://supabase.com/docs/guides/api/securing-your-api).
