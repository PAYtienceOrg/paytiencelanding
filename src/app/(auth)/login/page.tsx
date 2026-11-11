import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogInForm } from "../../../components/auth/AuthForms";
import { safeNext } from "../../../lib/auth/config";
import { getCurrentUser } from "../../../lib/auth/server";

export const metadata: Metadata = { title: "Log in · Paytience" };

export default async function LogInPage({ searchParams }: { searchParams: Promise<{ next?: string; notice?: string }> }) {
  const { next, notice } = await searchParams;
  if (await getCurrentUser()) redirect(safeNext(next));
  return <LogInForm next={next ? safeNext(next) : undefined} notice={notice} />;
}
