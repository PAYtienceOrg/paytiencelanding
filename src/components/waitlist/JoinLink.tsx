import type { ReactNode } from "react";

// Every "Join the waitlist" button on the page points at the one sign-up form.
// A plain in-page link, so an invite code (?ref=xxxxxxxx) in the address stays where the form reads it.
export const JOIN_ID = "join";

export function JoinLink({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <a href={`#${JOIN_ID}`} className={className}>
      {children}
    </a>
  );
}
