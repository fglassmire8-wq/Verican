import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireFounderPage } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { roleLabel } from "@/lib/utils";

export const metadata = { title: "Users · Founder admin" };
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  await requireFounderPage("/portal/admin/users");
  const users = await prisma.user.findMany({
    include: { _count: { select: { reviews: true, likes: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <p className="text-[11px] uppercase tracking-[0.12em] text-gold">Founder only</p>
      <h1 className="font-display text-4xl mt-2">Users</h1>
      <AdminNav path="/portal/admin/users" />
      <ul className="mt-8 divide-y divide-line border border-line">
        {users.map((user) => (
          <li key={user.id} className="bg-panel-2 px-4 py-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-display text-xl">{user.name}</p>
              <p className="text-xs uppercase tracking-[0.16em] text-gold">
                {roleLabel(user.role, user.affiliateStatus)}
                {user.disabled ? " · Disabled" : ""}
              </p>
            </div>
            <p className="mt-1 text-sm text-muted">
              {user.email} · {user._count.reviews} reviews · {user._count.likes} likes
            </p>
            <Link
              href={`/portal/admin/users/${user.id}`}
              className="mt-2 inline-block text-sm text-gold hover:text-gold-bright underline"
            >
              Edit
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
