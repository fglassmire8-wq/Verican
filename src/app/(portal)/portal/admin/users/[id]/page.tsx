import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { UserEditForm } from "@/components/admin/UserEditForm";
import { requireFounderPage } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const metadata = { title: "Edit user · Founder admin" };
export const dynamic = "force-dynamic";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const founder = await requireFounderPage("/portal/admin/users");
  const session = await getSession();
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: { _count: { select: { reviews: true, likes: true } } },
  });
  if (!user) notFound();
  const isSelf = session?.user?.id === user.id || founder.id === user.id;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
      <p className="text-[11px] uppercase tracking-[0.12em] text-gold">Founder only</p>
      <h1 className="font-display text-4xl mt-2">{user.name}</h1>
      <p className="mt-2 text-sm text-muted">{user.email}</p>
      <AdminNav path="/portal/admin/users" />
      <div className="mt-8">
        <UserEditForm
          user={{
            id: user.id,
            name: user.name,
            role: user.role,
            affiliateStatus: user.affiliateStatus,
            disabled: user.disabled,
          }}
          isSelf={isSelf}
        />
      </div>
      <p className="mt-6 text-sm text-muted">
        {user._count.reviews} reviews · {user._count.likes} likes
      </p>
      {isSelf ? (
        <p className="mt-6 text-sm text-muted">You cannot delete or disable your own account.</p>
      ) : (
        <div className="mt-8 space-y-3">
          <ConfirmButton
            url={`/api/admin/users/${user.id}`}
            confirmText={`Delete ${user.name}'s account? If they have reviews or likes, this will be refused unless you also remove their content.`}
            label="Delete account (keep content)"
            redirectTo="/portal/admin/users"
          />
          <div>
            <ConfirmButton
              url={`/api/admin/users/${user.id}`}
              confirmText={`Delete ${user.name} and ALL of their reviews, photos, and likes? This cannot be undone.`}
              label="Delete account and content"
              body={{ removeContent: true }}
              redirectTo="/portal/admin/users"
            />
          </div>
        </div>
      )}
      <p className="mt-10 text-sm">
        <Link href="/portal/admin/users" className="text-gold hover:text-gold-bright underline">
          ← All users
        </Link>
      </p>
    </div>
  );
}
