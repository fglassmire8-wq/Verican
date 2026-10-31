import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { publicUrl } from "@/lib/public-origin";

export const dynamic = "force-dynamic";

// Submitting now lives inside the affiliate portal.
export default async function SubmitPage() {
  redirect(publicUrl("/portal/submit", { headers: await headers() }).toString());
}
