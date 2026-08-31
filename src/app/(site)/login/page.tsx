import Link from "next/link";
import { Suspense } from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { publicUrl } from "@/lib/public-origin";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in" };

export default async function LoginPage() {
  const session = await getSession();
  if (session?.user?.id) {
    redirect(publicUrl("/portal", { headers: await headers() }).toString());
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Account</p>
      <h1 className="font-display text-4xl mt-2">Sign in</h1>
      <p className="mt-3 text-muted text-sm">
        Members and verified affiliates use the same login. After you sign in, the
        affiliate portal is your desk.
      </p>
      <div className="mt-8">
        <Suspense fallback={<p className="text-muted text-sm">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </div>
      <p className="mt-6 text-sm text-muted">
        New here?{" "}
        <Link href="/join" className="text-gold hover:text-gold-bright">
          Create a member account
        </Link>{" "}
        or{" "}
        <Link href="/portal" className="text-gold hover:text-gold-bright">
          apply as an affiliate
        </Link>
        .
      </p>
    </div>
  );
}
