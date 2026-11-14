import type { ReactNode } from "react";

// Every "Join the waitlist" button on the page points at the sign-up form in the early-access section.
export const JOIN_ID = "join";

export function JoinLink({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <a href={`#${JOIN_ID}`} className={className}>
      {children}
    </a>
  );
}
