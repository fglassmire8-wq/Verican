import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

// Submitting now lives inside the affiliate portal.
export default function SubmitPage() {
  redirect("/portal/submit");
}
