import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SignUpForm } from "../../../components/auth/AuthForms";
import { getCurrentUser } from "../../../lib/auth/server";

export const metadata: Metadata = { title: "Join the waitlist · Paytience" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  if (await getCurrentUser()) redirect("/account");
  const { ref } = await searchParams;
  return <SignUpForm referral={ref && /^[a-zA-Z0-9]{8}$/.test(ref) ? ref : undefined} />;
}
