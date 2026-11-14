# Waitlist backend

People join the waitlist with an email address. There are no accounts, passwords or
sign-in pages.

## How a signup is stored

1. The sign-up form (`src/components/waitlist/WaitlistForm.tsx`) appears twice on the
   homepage: a compact copy in the hero and the main one in the Early access section.
   Both post to `POST /api/waitlist`. The header's "Join" button scrolls to the main form.
2. The route (`src/app/api/waitlist/route.ts`) passes the body and the caller's IP to
   `WaitlistService.signup()` in `src/lib/waitlist/service.ts`, which rate-limits,
   validates and normalizes the input.
3. The service calls the configured store. With MongoDB configured that is
   `src/lib/waitlist/mongoStore.ts`, which runs the signup as one MongoDB transaction.
4. The transaction inserts into the `waitlist_entries` collection and returns
   `{ created, position, referralCode, total }`. The form then shows the place in line.

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

An email can only be on the list once: it is the document's `_id`, and it is trimmed
and lowercased before it is stored. Submitting an email that is already on the list
changes nothing and returns its current position, which is also how someone checks
their place later.

## Invite codes and ranking

The website does not use invites: the form sends only the email and shows no invite link.
The API and storage still support them, as described below, in case they are wanted later.

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

Copy `.env.example` to `.env.local`. With `MONGODB_URI` set, the server stores signups
in MongoDB (database `MONGODB_DB`, default `paytience`). Without it, development uses an
in-memory store, while production (`NODE_ENV=production`) returns `503` for both
endpoints and logs a configuration error, so signups are never silently lost. Tests
always default to memory, even when `MONGODB_URI` exists. Environment changes require
a server restart.

### Going live checklist (MongoDB Atlas free tier)

1. Create a free **M0** cluster in [MongoDB Atlas](https://cloud.mongodb.com).
2. Database Access: add a database user with a generated password and the
   "Read and write to any database" role (or `readWrite` on the `paytience` database).
3. Network Access: allow the host's outbound addresses. Vercel and most serverless hosts
   have no fixed IPs, so this usually means `0.0.0.0/0` (the password is then the only
   protection: keep it long and random).
4. Connect → Drivers: copy the `mongodb+srv://` string, insert the password, and set it
   as `MONGODB_URI` on the host (and in `.env.local` to test locally).
5. Make sure the host's proxy sets `x-forwarded-for` or `x-real-ip`.
6. Join once on the deployed page and check the document in Atlas → Browse Collections →
   `paytience.waitlist_entries`.

There is no setup script. On its first request the server creates the unique index on
`referralCode`, an index on `position`, and a single lock document in `waitlist_meta`.

### How signups stay consistent

Each signup is one transaction (Atlas clusters, including M0, are replica sets, which
transactions need). Every transaction first updates the same lock document in
`waitlist_meta`, so concurrent signups, even from different server instances, conflict
and the driver retries them one after another. Inside the transaction the store counts
entries, deduplicates by email, inserts the new entry and applies the invite reward.
Referral-code collisions (unique index) abort the transaction and are retried with a new
generated code (up to three attempts).

Keep `MONGODB_URI` server-only. The count uses `countDocuments` and never downloads the
email list. Server selection, connection and socket timeouts are ten seconds, and the
connection pool is capped at five per instance (M0 allows 500 connections in total).
Storage failures are logged on the server with the operation, error type and MongoDB
error code only; emails, credentials and database responses are never returned or logged.

In-memory data is process-local and resets on restart.

The unit tests run the same signup behaviour against memory and against a local MongoDB
replica set started by `mongodb-memory-server` (it downloads a MongoDB binary, about
800 MB, on the first run and caches it).

Reference: [MongoDB transactions](https://www.mongodb.com/docs/manual/core/transactions/)
and [Atlas M0 limits](https://www.mongodb.com/docs/atlas/reference/free-shared-limitations/).
