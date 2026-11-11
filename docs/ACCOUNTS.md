# Accounts and the waitlist

People join the waitlist by creating an account (email + password) with Supabase Auth.

## Flow

1. Every "Join the waitlist" button on the homepage (header, hero, Early access section)
   opens `/signup`; an invite code `?ref=xxxxxxxx` in the address is carried along.
2. `/signup` creates the Supabase user. The invite code is saved in the user's metadata.
3. Supabase emails a confirmation link → `/auth/callback` signs the user in → `/account`.
4. The first visit to `/account` with a confirmed email adds the email to
   `waitlist_entries` (and applies the invite code). Later visits only read the position.
5. `/login`, `/forgot-password` → email link → `/reset-password`, and "Log out" on `/account`.

The old password-less `POST /api/waitlist` endpoint was removed so the only way to join
is through an account. `GET /api/waitlist/count` still powers the homepage counter.

## Pages and files

| Path | File |
| --- | --- |
| `/signup`, `/login`, `/forgot-password`, `/reset-password` | `src/app/(auth)/…` |
| `/account` | `src/app/account/page.tsx` |
| Email link landing | `src/app/auth/callback/route.ts` |
| Server actions | `src/lib/auth/actions.ts` |
| Session refresh | `src/proxy.ts` (runs only on account/auth pages) |

## Supabase setup

1. `.env.local`: set `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   (see `.env.example`). Restart the dev server after changes.
2. Authentication → URL Configuration:
   - Site URL: `http://localhost:3000` locally, your real domain in production.
   - Redirect URLs: add `http://localhost:3000/auth/callback` and `https://<your-domain>/auth/callback`.
3. Authentication → Sign In / Providers → Email: keep **Confirm email** on so only real
   inboxes join the waitlist.
4. Supabase's built-in email sender only allows a few emails per hour and is meant for
   testing. Before launch, set up custom SMTP (Authentication → Emails → SMTP Settings),
   for example with Resend, Postmark or SendGrid.

### Optional: links that work on any device

By default the confirmation link must be opened in the same browser that signed up;
otherwise the email is still confirmed and the user is asked to log in. To sign people in
from any device, change the "Confirm signup" email template link to:

```
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=email&next=/account
```

and the "Reset password" template link to:

```
{{ .SiteURL }}/auth/callback?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password
```
