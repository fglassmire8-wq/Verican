import { AdminNav } from "@/components/admin/AdminNav";
import { requireFounderPage } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { GeneticsEditForm } from "@/components/admin/GeneticsEditForm";

export const metadata = { title: "Strain genetics · Founder admin" };
export const dynamic = "force-dynamic";

export default async function GeneticsAdminPage() {
  await requireFounderPage("/portal/admin/genetics");
  const rows = await prisma.strainGenetics.findMany({
    include: {
      updatedBy: { select: { name: true, email: true } },
      history: { orderBy: { addedAt: "desc" }, take: 8 },
    },
    orderBy: { displayName: "asc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <p className="text-[11px] uppercase tracking-[0.12em] text-gold">Founder only</p>
      <h1 className="font-display text-4xl mt-2">Strain genetics archive</h1>
      <p className="mt-3 text-sm text-muted max-w-2xl">
        Lineage saved on a product is archived here by strain name and reused when a matching
        strain has no genetics yet. Earlier values stay in the history list.
      </p>
      <AdminNav path="/portal/admin/genetics" />
      <div className="mt-10 space-y-8">
        {rows.length === 0 ? <p className="text-muted">No archived genetics yet.</p> : null}
        {rows.map((row) => (
          <section key={row.id} className="border border-line bg-panel p-4">
            <h2 className="font-display text-2xl">{row.displayName}</h2>
            <p className="text-xs text-muted mt-1">
              Key: {row.key}
              {row.updatedBy ? ` · last saved by ${row.updatedBy.name}` : ""}
              {row.updatedAt ? ` · ${formatDate(row.updatedAt)}` : ""}
            </p>
            <div className="mt-3">
              <GeneticsEditForm id={row.id} lineage={row.lineage} displayName={row.displayName} />
            </div>
            {row.history.length ? (
              <div className="mt-4">
                <p className="text-[11px] uppercase tracking-[0.12em] text-gold">Prior values</p>
                <ul className="mt-2 text-sm text-muted space-y-1">
                  {row.history.map((item) => (
                    <li key={item.id}>
                      {item.lineage} · {formatDate(item.addedAt)}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
