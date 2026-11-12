import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { publicUrl } from "@/lib/public-origin";
import { getSession } from "@/lib/session";
import { startOfZonedDay } from "@/lib/track";

export const metadata = { title: "Stats" };
export const dynamic = "force-dynamic";

type RangeKey = "today" | "days7" | "days30" | "all";

const RANGE_LABELS: Record<RangeKey, string> = {
  today: "Today",
  days7: "Last 7 days",
  days30: "Last 30 days",
  all: "All time",
};

async function rangeCounts(since: Date | null) {
  const where = since ? { createdAt: { gte: since } } : {};
  const [visits, uniqueRows] = await Promise.all([
    prisma.pageView.count({ where }),
    prisma.pageView.groupBy({ by: ["visitorHash"], where }),
  ]);
  return { visits, uniques: uniqueRows.length };
}

function formatCount(n: number) {
  return n.toLocaleString("en-US");
}

export default async function PortalStatsPage() {
  const session = await getSession();
  const originRequest = { headers: await headers() };
  if (!session?.user?.id) {
    redirect(publicUrl("/login?callbackUrl=/portal/stats", originRequest).toString());
  }
  if (session.user.role !== "OWNER") {
    redirect(publicUrl("/portal", originRequest).toString());
  }

  const now = new Date();
  const today = startOfZonedDay("America/New_York", now);
  const days7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const days30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [todayCounts, weekCounts, monthCounts, allCounts, topPages, topReferrers] =
    await Promise.all([
      rangeCounts(today),
      rangeCounts(days7),
      rangeCounts(days30),
      rangeCounts(null),
      prisma.pageView.groupBy({
        by: ["path"],
        where: { createdAt: { gte: days30 } },
        _count: { _all: true },
        orderBy: { _count: { path: "desc" } },
        take: 20,
      }),
      prisma.pageView.groupBy({
        by: ["referrerHost"],
        where: { createdAt: { gte: days30 }, referrerHost: { not: null } },
        _count: { _all: true },
        orderBy: { _count: { referrerHost: "desc" } },
        take: 20,
      }),
    ]);

  const ranges: { key: RangeKey; visits: number; uniques: number }[] = [
    { key: "today", ...todayCounts },
    { key: "days7", ...weekCounts },
    { key: "days30", ...monthCounts },
    { key: "all", ...allCounts },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:py-14">
      <p className="text-[11px] uppercase tracking-[0.12em] text-gold">Founder only</p>
      <h1 className="font-display text-4xl mt-2">Stats</h1>
      <p className="mt-3 text-sm text-muted max-w-2xl leading-relaxed">
        Basic, anonymous page-visit counts for this site. These numbers are only
        visible here — they are not shown on public pages.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {ranges.map((range) => (
          <div key={range.key} className="border border-line bg-panel p-5">
            <p className="text-[11px] uppercase tracking-[0.12em] text-gold">
              {RANGE_LABELS[range.key]}
            </p>
            <p className="font-display text-3xl mt-2 tabular-nums">{formatCount(range.visits)}</p>
            <p className="mt-2 text-sm text-muted">
              {formatCount(range.uniques)} unique {range.uniques === 1 ? "visitor" : "visitors"}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="font-display text-2xl">Top pages</h2>
          <p className="mt-1 text-sm text-muted">Last 30 days</p>
          {topPages.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No visits recorded yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line border border-line">
              {topPages.map((row) => (
                <li
                  key={row.path}
                  className="flex items-baseline justify-between gap-3 px-4 py-3 bg-panel-2"
                >
                  <span className="text-sm text-cream break-all">{row.path}</span>
                  <span className="text-sm tabular-nums text-muted shrink-0">
                    {formatCount(row._count._all)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="font-display text-2xl">Top referrers</h2>
          <p className="mt-1 text-sm text-muted">Last 30 days, external hosts only</p>
          {topReferrers.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No external referrers yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-line border border-line">
              {topReferrers.map((row) => (
                <li
                  key={row.referrerHost ?? "unknown"}
                  className="flex items-baseline justify-between gap-3 px-4 py-3 bg-panel-2"
                >
                  <span className="text-sm text-cream break-all">{row.referrerHost}</span>
                  <span className="text-sm tabular-nums text-muted shrink-0">
                    {formatCount(row._count._all)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
