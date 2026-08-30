import Link from "next/link";
import { redirect } from "next/navigation";
import { SubmitForm } from "@/components/SubmitForm";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isTrustedAffiliate } from "@/lib/utils";

export const metadata = { title: "Submit a review" };
export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/submit");
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) redirect("/login");

  const trusted = isTrustedAffiliate(user);
  const owner = user.role === "OWNER";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold">After you buy</p>
      <h1 className="font-display text-4xl mt-2">Submit a review</h1>
      <p className="mt-3 text-muted leading-relaxed">
        {owner
          ? "Owner reviews publish immediately as trusted."
          : trusted
            ? "Verified-affiliate reviews stay pending until the owner approves them. They do not get likes or rank until then."
            : "Member reviews publish as unverified notes. They are unrewarded and never count toward trusted rank."}
      </p>
      {!trusted && !owner ? (
        <p className="mt-3 text-sm text-muted">
          Want likes and rank?{" "}
          <Link href="/affiliate" className="text-gold hover:text-gold-bright">
            Apply as an affiliate
          </Link>
          .
        </p>
      ) : null}
      <div className="mt-8">
        <SubmitForm />
      </div>
    </div>
  );
}
