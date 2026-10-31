import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { publicUrl } from "@/lib/public-origin";
import { requireOwner } from "@/lib/session";

export const metadata = { title: "Change password" };
export const dynamic = "force-dynamic";

export default async function ChangePasswordPage() {
  const owner = await requireOwner();
  if (!owner) {
    redirect(
      publicUrl("/login?callbackUrl=/account/password", { headers: await headers() }).toString(),
    );
  }
  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:py-16">
      <h1 className="font-display text-3xl">Change password</h1>
      <p className="mt-2 text-sm text-muted">Owner account: {owner.email}</p>
      <ChangePasswordForm />
    </div>
  );
}
