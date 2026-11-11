import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ResetPasswordForm } from "../../../components/auth/AuthForms";
import { getCurrentUser } from "../../../lib/auth/server";

export const metadata: Metadata = { title: "Set a new password · Paytience" };

// 只能从重置邮件里的链接进来（链接会先让用户登录）
export default async function ResetPasswordPage() {
  if (!(await getCurrentUser())) redirect("/login?notice=reset-expired");
  return <ResetPasswordForm />;
}
