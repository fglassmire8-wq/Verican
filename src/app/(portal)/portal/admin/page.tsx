import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireFounderPage } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Founder admin" };
export const dynamic = "force-dynamic";

export default async function AdminOverviewPage() {
  await requireFounderPage("/portal/admin");
  const [reviews, pending, hidden, users, disabledUsers, products, brands, stores] = await Promise.all([
    prisma.review.count(),
    prisma.review.count({ where: { status: "PENDING" } }),
    prisma.review.count({ where: { status: "HIDDEN" } }),
    prisma.user.count(),
    prisma.user.count({ where: { disabled: true } }),
    prisma.product.count(),
    prisma.brand.count(),
    prisma.store.count(),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <p className="text-[11px] uppercase tracking-[0.12em] text-gold">Founder only</p>
      <h1 className="font-display text-4xl mt-2">Admin</h1>
      <p className="mt-3 text-sm text-muted max-w-2xl leading-relaxed">
        View, edit, hide, or delete any content submitted to Green Vault. This area is
        not linked from public pages.
      </p>
      <AdminNav path="/portal/admin" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link href="/portal/admin/reviews" className="border border-line bg-panel p-5 hover:border-gold">
          <p className="text-[11px] uppercase tracking-[0.12em] text-gold">Reviews</p>
          <p className="font-display text-3xl mt-2 tabular-nums">{reviews}</p>
          <p className="mt-2 text-sm text-muted">{pending} pending · {hidden} hidden</p>
        </Link>
        <Link href="/portal/admin/users" className="border border-line bg-panel p-5 hover:border-gold">
          <p className="text-[11px] uppercase tracking-[0.12em] text-gold">Users</p>
          <p className="font-display text-3xl mt-2 tabular-nums">{users}</p>
          <p className="mt-2 text-sm text-muted">{disabledUsers} disabled</p>
        </Link>
        <Link href="/portal/admin/catalog" className="border border-line bg-panel p-5 hover:border-gold sm:col-span-2">
          <p className="text-[11px] uppercase tracking-[0.12em] text-gold">Catalog</p>
          <p className="font-display text-3xl mt-2 tabular-nums">
            {products} <span className="text-xl text-muted">products</span>
          </p>
          <p className="mt-2 text-sm text-muted">{brands} brands · {stores} stores</p>
        </Link>
      </div>
    </div>
  );
}
