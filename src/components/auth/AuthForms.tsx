"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  logInAction,
  requestPasswordResetAction,
  resendConfirmationAction,
  signUpAction,
  updatePasswordAction,
  type FormState,
} from "../../lib/auth/actions";
import { Field, FormMessage, PasswordField, SubmitButton } from "./AuthUI";

const idle: FormState = { status: "idle" };

const Title = ({ children, sub }: { children: string; sub?: string }) => (
  <div className="mb-6">
    <h1 className="font-serif text-4xl font-bold leading-tight">{children}</h1>
    {sub && <p className="mt-2 text-sm leading-relaxed text-ink/80">{sub}</p>}
  </div>
);

export function SignUpForm({ referral }: { referral?: string }) {
  const [state, action] = useActionState(signUpAction, idle);

  if (state.status === "sent") return <CheckEmail email={state.email} />;

  return (
    <>
      <Title sub="We're letting people in gradually. Create an account to get your place in line — you'll see it, with your invite link, right after confirming your email.">
        Join the waitlist
      </Title>
      {referral && (
        <p className="mb-5 border-l-4 border-accent bg-mint px-3 py-2 text-sm">You were invited by a friend — signing up moves them up the line.</p>
      )}
      <form action={action} className="space-y-5" noValidate>
        <input type="hidden" name="ref" value={referral ?? ""} />
        <Field label="Email" name="email" type="email" autoComplete="email" required autoFocus placeholder="you@example.com" />
        <PasswordField label="Password" name="password" autoComplete="new-password" required minLength={8} hint="At least 8 characters." />
        <FormMessage state={state} />
        <SubmitButton pending="Creating account…">Create account</SubmitButton>
      </form>
      <p className="mt-6 text-sm">
        Already have an account?{" "}
        <Link href="/login" className="inline-flex min-h-11 items-center font-semibold text-accent underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}

function CheckEmail({ email }: { email: string }) {
  const [state, action] = useActionState(resendConfirmationAction, idle);
  return (
    <div>
      <Title sub={`We sent a confirmation link to ${email}. Open it to finish joining the waitlist.`}>Check your email</Title>
      <ul className="mb-6 list-disc space-y-1 pl-5 text-sm text-ink/80">
        <li>The email can take a minute to arrive.</li>
        <li>Check your spam or promotions folder.</li>
      </ul>
      <form action={action} className="space-y-3">
        <input type="hidden" name="email" value={email} />
        <FormMessage state={state} />
        <button type="submit" className="text-sm font-semibold text-accent underline underline-offset-4">
          Send the link again
        </button>
      </form>
    </div>
  );
}

const notices: Record<string, string> = {
  confirmed: "Your email is confirmed. Log in to see your place on the waitlist.",
  "reset-expired": "That reset link has expired or was opened in a different browser. Please request a new one.",
  "link-expired": "That link has expired or was already used. Log in, or sign up again to get a new one.",
};

export function LogInForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, action] = useActionState(logInAction, idle);
  const message = notice ? notices[notice] : undefined;
  return (
    <>
      <Title sub="See your place on the waitlist and your invite link.">Log in</Title>
      {message && <p className="mb-5 border-l-4 border-accent bg-mint px-3 py-2 text-sm">{message}</p>}
      <form action={action} className="space-y-5" noValidate>
        <input type="hidden" name="next" value={next ?? ""} />
        <Field label="Email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          required
          hint={
            <Link href="/forgot-password" className="font-semibold text-accent underline-offset-4 hover:underline">
              Forgot password?
            </Link>
          }
        />
        <FormMessage state={state} />
        <SubmitButton pending="Logging in…">Log in</SubmitButton>
      </form>
      <p className="mt-6 text-sm">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-accent underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </>
  );
}

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordResetAction, idle);
  return (
    <>
      <Title sub="Enter your account email and we'll send you a link to set a new password.">Reset your password</Title>
      <form action={action} className="space-y-5" noValidate>
        <Field label="Email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
        <FormMessage state={state} />
        {state.status !== "sent" && <SubmitButton pending="Sending…">Send reset link</SubmitButton>}
      </form>
      <p className="mt-6 text-sm">
        <Link href="/login" className="inline-flex min-h-11 items-center font-semibold text-accent underline-offset-4 hover:underline">
          Back to log in
        </Link>
      </p>
    </>
  );
}

export function ResetPasswordForm() {
  const [state, action] = useActionState(updatePasswordAction, idle);
  return (
    <>
      <Title sub="Choose a new password for your account.">Set a new password</Title>
      <form action={action} className="space-y-5" noValidate>
        <PasswordField label="New password" name="password" autoComplete="new-password" required minLength={8} hint="At least 8 characters." />
        <PasswordField label="Confirm new password" name="confirm" autoComplete="new-password" required minLength={8} />
        <FormMessage state={state} />
        <SubmitButton pending="Saving…">Save new password</SubmitButton>
      </form>
    </>
  );
}
