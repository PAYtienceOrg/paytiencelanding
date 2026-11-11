import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CopyLink } from "../../components/auth/CopyLink";
import { logOutAction } from "../../lib/auth/actions";
import { getCurrentUser } from "../../lib/auth/server";
import { siteOrigin } from "../../lib/site";
import { getWaitlistService } from "../../lib/waitlist/service";

export const metadata: Metadata = { title: "My account · Paytience" };

const eyebrow = "text-sm font-semibold";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ updated?: string }> }) {
  const user = await getCurrentUser();
  if (!user?.email) redirect("/login?next=/account");

  const { updated } = await searchParams;
  // 第一次进来时正式加入候补名单；之后再进来只是读取当前名次（同一邮箱不会重复加入）
  const ref = typeof user.user_metadata?.ref === "string" ? user.user_metadata.ref : undefined;
  const result = user.email_confirmed_at ? await getWaitlistService().joinMember(user.email, ref) : null;
  const entry = result && (result.status === 200 || result.status === 201) ? result.body : null;
  const invite = entry ? `${await siteOrigin()}/?ref=${entry.referralCode}` : "";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-ink">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <Link href="/" className="font-serif text-2xl font-bold tracking-tight">
            Paytience
          </Link>
          <form action={logOutAction}>
            <button type="submit" className="border border-ink px-3 py-1.5 text-sm font-semibold hover:bg-ink hover:text-paper">
              Log out
            </button>
          </form>
        </div>
      </header>

      <main id="main" className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
        <p className={`${eyebrow} text-accent`}>My account</p>
        <h1 className="mt-2 font-serif text-4xl font-bold leading-tight">
          {entry ? (result?.status === 201 ? "Welcome to the waitlist." : "Welcome back.") : "Almost there."}
        </h1>
        <p className="mt-2 text-sm text-ink/80">Signed in as {user.email}</p>

        {updated === "password" && (
          <p role="status" className="mt-6 border-l-4 border-accent bg-mint px-3 py-2 text-sm">
            Your password has been updated.
          </p>
        )}

        {!user.email_confirmed_at && (
          <p className="mt-8 border-l-4 border-amber-700 bg-amber-50 px-4 py-3 text-sm">
            Please confirm your email using the link we sent you. Your place in line is saved once your email is confirmed.
          </p>
        )}

        {result && !entry && (
          <p role="alert" className="mt-8 border-l-4 border-red-800 bg-red-50 px-4 py-3 text-sm text-red-900">
            We couldn&apos;t load your place in line right now. Please refresh in a moment.
          </p>
        )}

        {entry && (
          <>
            <section aria-labelledby="place-title" className="mt-8 grid border border-ink/40 sm:grid-cols-2">
              <div className="bg-accent px-6 py-6 text-paper">
                <h2 id="place-title" className={eyebrow}>
                  Your place in line
                </h2>
                <p className="mt-2 font-serif text-6xl font-bold tabular-nums">#{entry.position.toLocaleString("en-US")}</p>
                <p className="mt-1 text-sm text-paper/80">of {entry.total.toLocaleString("en-US")} people on the waitlist</p>
              </div>
              <div className="px-6 py-6">
                <h2 className={eyebrow}>What happens next</h2>
                <ul className="mt-3 space-y-2 text-sm leading-relaxed">
                  <li>We open access in waves, in waitlist order.</li>
                  <li>When it&apos;s your turn, we switch on your account and email {user.email}.</li>
                  <li>Invite friends to get there sooner.</li>
                </ul>
              </div>
            </section>

            <section aria-labelledby="invite-title" className="mt-8">
              <h2 id="invite-title" className="font-serif text-2xl font-bold">
                Move up the line
              </h2>
              <p className="mt-1 text-sm text-ink/80">Every friend who signs up with your link moves you up five places.</p>
              <div className="mt-4">
                <CopyLink link={invite} />
              </div>
            </section>
          </>
        )}

        <section className="mt-12 border-t border-rule pt-6 text-sm">
          <h2 className={eyebrow}>Account</h2>
          <p className="mt-3">
            <Link href="/forgot-password" className="font-semibold text-accent underline-offset-4 hover:underline">
              Change password
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
