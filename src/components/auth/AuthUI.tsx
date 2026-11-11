"use client";

import { useState, type InputHTMLAttributes, type ReactNode, type Ref } from "react";
import { useFormStatus } from "react-dom";
import type { FormState } from "../../lib/auth/actions";

const label = "text-[11px] font-semibold uppercase tracking-[0.2em]";
const input = "w-full border border-ink/40 bg-white/60 px-3 py-2.5 text-base placeholder:text-ink/40 focus:border-accent";

export function Field({
  label: text,
  hint,
  ref,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: ReactNode; ref?: Ref<HTMLInputElement> }) {
  const id = props.id ?? props.name;
  return (
    <div>
      <label htmlFor={id} className={label}>
        {text}
      </label>
      <input ref={ref} id={id} {...props} className={`mt-2 ${input}`} />
      {hint && <p className="mt-1.5 text-xs text-ink/70">{hint}</p>}
    </div>
  );
}

// 密码框，带“显示/隐藏”按钮
export function PasswordField({ label: text, hint, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: ReactNode }) {
  const [shown, setShown] = useState(false);
  const id = props.id ?? props.name;
  return (
    <div>
      <label htmlFor={id} className={label}>
        {text}
      </label>
      <div className="relative mt-2">
        <input id={id} type={shown ? "text" : "password"} {...props} className={`${input} pr-16`} />
        <button
          type="button"
          onClick={() => setShown((v) => !v)}
          aria-controls={id}
          aria-pressed={shown}
          className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-accent hover:underline"
        >
          {shown ? "Hide" : "Show"}
          <span className="sr-only"> password</span>
        </button>
      </div>
      {hint && <p className="mt-1.5 text-xs text-ink/70">{hint}</p>}
    </div>
  );
}

export function SubmitButton({ children, pending }: { children: ReactNode; pending: string }) {
  const { pending: busy } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full bg-accent px-5 py-3 text-sm font-semibold text-paper transition-colors hover:bg-ink disabled:opacity-60"
    >
      {busy ? pending : children}
    </button>
  );
}

export function FormMessage({ state }: { state: FormState }) {
  if (state.status === "error") {
    return (
      <p role="alert" className="border-l-4 border-red-800 bg-red-50 px-3 py-2 text-sm text-red-900">
        {state.message}
      </p>
    );
  }
  if (state.status === "sent") {
    return (
      <p role="status" className="border-l-4 border-accent bg-mint px-3 py-2 text-sm">
        {state.message}
      </p>
    );
  }
  return null;
}

export function Notice({ tone = "info", children }: { tone?: "info" | "warn"; children: ReactNode }) {
  return (
    <p
      role="status"
      className={`border-l-4 px-3 py-2 text-sm ${tone === "warn" ? "border-amber-700 bg-amber-50" : "border-accent bg-mint"}`}
    >
      {children}
    </p>
  );
}
