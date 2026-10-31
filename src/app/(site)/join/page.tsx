import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { JoinForm } from "@/components/JoinForm";
import { publicUrl } from "@/lib/public-origin";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Join" };

export default async function JoinPage() {
  const session = await getSession();
  if (session?.user?.id) {
    redirect(publicUrl("/portal", { headers: await headers() }).toString());
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <p className="text-[11px] uppercase tracking-[0.12em] text-gold">Everyone welcome</p>
      <h1 className="font-display text-4xl mt-2">Join Green Vault</h1>
      <p className="mt-3 text-muted text-sm leading-relaxed">
        Open to all adults 21+. Member reviews are unverified and unrewarded. They never count
        toward trusted rank. If you want likes and rank, apply as an affiliate
        separately. After you join, the portal is your desk.
      </p>
      <div className="mt-8">
        <JoinForm />
      </div>
      <p className="mt-6 text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login?callbackUrl=/portal" className="text-gold hover:text-gold-bright">
          Sign in
        </Link>
        . Want to be a verified affiliate?{" "}
        <Link href="/affiliate" className="text-gold hover:text-gold-bright">
          Apply here
        </Link>
        .
      </p>
    </div>
  );
}
