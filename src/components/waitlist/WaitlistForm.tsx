"use client";

import { useId, useState, type FormEvent } from "react";
import { JOIN_ID } from "./JoinLink";

type Entry = { position: number; total: number };
type State =
  | { status: "idle" | "sending" }
  | { status: "error"; message: string }
  | { status: "joined"; entry: Entry; isNew: boolean };

const isEntry = (data: unknown): data is Entry => {
  const d = data as Partial<Entry> | null;
  return typeof d?.position === "number" && typeof d.total === "number";
};

// "section" sits on the green early-access band and is the target of every Join link;
// "hero" is the compact copy on the light background at the top of the page.
const styles = {
  section: {
    joined: "border-paper/30",
    joinedNote: "text-paper/80",
    input: "border-paper/40 bg-paper",
    button: "bg-paper text-accent hover:bg-white",
    error: "border-paper bg-paper/10",
  },
  hero: {
    joined: "border-rule",
    joinedNote: "text-ink/70",
    input: "border-ink/40 bg-white",
    button: "bg-accent text-paper hover:bg-ink",
    error: "border-accent bg-mint",
  },
};

// The only way onto the waitlist: an email address, no account or password.
// Submitting an email that is already on the list just shows its current place again.
export function WaitlistForm({ variant = "section" }: { variant?: keyof typeof styles }) {
  const [state, setState] = useState<State>({ status: "idle" });
  const uid = useId();
  const style = styles[variant];
  const hero = variant === "hero";
  const anchor = hero ? undefined : JOIN_ID;
  const inputId = `${uid}-email`;
  const errorId = `${uid}-error`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!email) return setState({ status: "error", message: "Please enter your email address." });

    setState({ status: "sending" });
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
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
      <div id={anchor} className={`scroll-mt-24 border p-5 sm:p-6 ${style.joined}`} role="status">
        <p className="text-sm font-semibold">{isNew ? "You're on the waitlist." : "You're already on the waitlist."}</p>
        <p className="mt-2 font-serif text-4xl font-bold tabular-nums sm:text-6xl">#{entry.position.toLocaleString("en-US")}</p>
        <p className={`mt-1 text-sm ${style.joinedNote}`}>of {entry.total.toLocaleString("en-US")} in line. We&apos;ll email you when it&apos;s your turn.</p>
      </div>
    );
  }

  const sending = state.status === "sending";
  return (
    <form id={anchor} onSubmit={submit} noValidate className="scroll-mt-24">
      <label htmlFor={inputId} className={hero ? "sr-only" : "text-sm font-semibold"}>
        Email address
      </label>
      <div className={`${hero ? "" : "mt-2 "}flex max-w-xl flex-col gap-2 sm:flex-row`}>
        <input
          id={inputId}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          aria-describedby={state.status === "error" ? errorId : undefined}
          aria-invalid={state.status === "error"}
          className={`min-h-12 min-w-0 flex-1 border px-3 text-base text-ink placeholder:text-ink/40 ${style.input}`}
        />
        <button
          type="submit"
          disabled={sending}
          className={`min-h-12 shrink-0 px-6 text-sm font-semibold transition-colors disabled:opacity-60 ${style.button}`}
        >
          {sending ? "Joining…" : "Join the waitlist"}
        </button>
      </div>
      {state.status === "error" && (
        <p id={errorId} role="alert" className={`mt-3 max-w-xl border-l-4 px-3 py-2 text-sm ${style.error}`}>
          {state.message}
        </p>
      )}
      {!hero && (
        <p className="mt-3 text-xs text-paper/70">No account or password needed. Already joined? Enter the same email to see your place.</p>
      )}
    </form>
  );
}
