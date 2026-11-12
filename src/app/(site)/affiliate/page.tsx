import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AffiliateTiers } from "@/components/AffiliateTiers";
import { JoinForm } from "@/components/JoinForm";
import { publicUrl } from "@/lib/public-origin";
import { getSession } from "@/lib/session";
import { isGoogleAuthEnabled } from "@/lib/google-auth";
import { CONTACT_EMAIL } from "@/lib/site";

export const metadata = { title: "Affiliate Program" };
export const dynamic = "force-dynamic";

export default async function AffiliatePage() {
  const session = await getSession();
  if (session?.user?.id) {
    redirect(publicUrl("/portal", { headers: await headers() }).toString());
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-4xl mt-2">Affiliate Program</h1>
      <p className="mt-5 text-muted leading-relaxed">Become an affiliate. Sign up here.</p>
      <AffiliateTiers />
      <a
        href="#apply"
        className="mt-6 inline-block border border-gold bg-gold text-ink px-5 py-2.5 text-sm tracking-[0.12em] uppercase"
      >
        Sign up as an affiliate
      </a>

      <div className="mt-10 border border-line bg-panel p-6">
        <h2 className="font-display text-2xl">Join as a member</h2>
        <p className="mt-2 text-sm text-muted">
          Members can read reviews and post notes after a purchase. You can apply as an
          affiliate later from the portal.
        </p>
        <Link
          href="/join"
          className="mt-5 inline-block border border-line px-5 py-2.5 text-sm tracking-[0.12em] uppercase hover:border-gold"
        >
          Create a member account
        </Link>
      </div>

      <div id="apply" className="mt-10 border border-line bg-panel p-6">
        <h2 className="font-display text-2xl">Apply as a new affiliate</h2>
        <div className="mt-6">
          <JoinForm affiliate googleEnabled={isGoogleAuthEnabled()} />
        </div>
        <p className="mt-6 text-sm text-muted">
          Already a member?{" "}
          <Link href="/login?callbackUrl=/portal" className="text-gold hover:text-gold-bright">
            Sign in
          </Link>{" "}
          and apply from the portal.
        </p>
      </div>

      <div className="mt-10 border border-line bg-panel-2 p-5">
        <h2 className="font-display text-xl">Advertise with Green Vault</h2>
        <p className="mt-2 text-sm text-muted">
          Brands and dispensaries interested in advertising can{" "}
          <a className="text-gold hover:text-gold-bright" href={`mailto:${CONTACT_EMAIL}`}>
            contact us
          </a>
          .
        </p>
      </div>
    </div>
  );
}
