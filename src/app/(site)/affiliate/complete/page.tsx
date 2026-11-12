import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { applyAffiliate } from "@/lib/affiliate-apply";
import { publicUrl } from "@/lib/public-origin";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const metadata = { title: "Affiliate application" };

export default async function AffiliateCompletePage() {
  const originRequest = { headers: await headers() };
  const session = await getSession();
  if (!session?.user?.id) {
    redirect(publicUrl("/login?callbackUrl=/affiliate/complete", originRequest).toString());
  }

  await applyAffiliate(session.user.id);
  redirect(publicUrl("/portal", originRequest).toString());
}
