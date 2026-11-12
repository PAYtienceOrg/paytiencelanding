"use client";

import { useState, type FormEvent } from "react";
import { CopyLink } from "./CopyLink";
import { JOIN_ID } from "./JoinLink";

const REF = /^[a-zA-Z0-9]{8}$/;

type Entry = { position: number; referralCode: string; total: number };
type State =
  | { status: "idle" | "sending" }
  | { status: "error"; message: string }
  | { status: "joined"; entry: Entry; isNew: boolean };

const isEntry = (data: unknown): data is Entry => {
  const d = data as Partial<Entry> | null;
  return typeof d?.position === "number" && typeof d.referralCode === "string" && typeof d.total === "number";
};

// Invite code from the address (?ref=xxxxxxxx). Left out unless well-formed: the API rejects a malformed one.
function inviteCode() {
  const ref = new URLSearchParams(window.location.search).get("ref") ?? "";
  return REF.test(ref) ? ref : undefined;
}

// The only way onto the waitlist: an email address, no account or password.
// Submitting an email that is already on the list just shows its current place again.
export function WaitlistForm() {
  const [state, setState] = useState<State>({ status: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!email) return setState({ status: "error", message: "Please enter your email address." });

    setState({ status: "sending" });
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ref: inviteCode() }),
      });
      const data: unknown = await response.json().catch(() => null);
      if (response.ok && isEntry(data)) {
        return setState({ status: "joined", entry: data, isNew: response.status === 201 });
      }
      setState({
        status: "error",
        message:
          response.status === 400
            ? "Please enter a valid email address."
            : response.status === 429
              ? "Too many attempts. Please wait a minute and try again."
              : "We couldn't add you right now. Please try again in a moment.",
      });
    } catch {
      setState({ status: "error", message: "We couldn't reach the server. Please check your connection and try again." });
    }
  }

  if (state.status === "joined") {
    const { entry, isNew } = state;
    return (
      <div id={JOIN_ID} className="scroll-mt-24 border border-paper/30 p-5 sm:p-6" role="status">
        <p className="text-sm font-semibold">{isNew ? "You're on the waitlist." : "You're already on the waitlist."}</p>
        <p className="mt-2 font-serif text-4xl font-bold tabular-nums sm:text-6xl">#{entry.position.toLocaleString("en-US")}</p>
        <p className="mt-1 text-sm text-paper/80">of {entry.total.toLocaleString("en-US")} in line. We&apos;ll email you when it&apos;s your turn.</p>
        <p className="mt-6 text-sm font-semibold">Move up the line</p>
        <p className="mt-1 text-sm text-paper/80">Every friend who joins with your link moves you up five places.</p>
        <div className="mt-3 max-w-xl text-ink">
          <CopyLink link={`${window.location.origin}/?ref=${entry.referralCode}`} />
        </div>
      </div>
    );
  }

  const sending = state.status === "sending";
  return (
    <form id={JOIN_ID} onSubmit={submit} noValidate className="scroll-mt-24">
      <label htmlFor="waitlist-email" className="text-sm font-semibold">
        Email address
      </label>
      <div className="mt-2 flex max-w-xl flex-col gap-2 sm:flex-row">
        <input
          id="waitlist-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          aria-describedby={state.status === "error" ? "waitlist-error" : undefined}
          aria-invalid={state.status === "error"}
          className="min-h-12 min-w-0 flex-1 border border-paper/40 bg-paper px-3 text-base text-ink placeholder:text-ink/40"
        />
        <button
          type="submit"
          disabled={sending}
          className="min-h-12 shrink-0 bg-paper px-6 text-sm font-semibold text-accent transition-colors hover:bg-white disabled:opacity-60"
        >
          {sending ? "Joining…" : "Join the waitlist"}
        </button>
      </div>
      {state.status === "error" && (
        <p id="waitlist-error" role="alert" className="mt-3 max-w-xl border-l-4 border-paper bg-paper/10 px-3 py-2 text-sm">
          {state.message}
        </p>
      )}
      <p className="mt-3 text-xs text-paper/70">No account or password needed. Already joined? Enter the same email to see your place.</p>
    </form>
  );
}
