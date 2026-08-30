import type { LeaderboardRow } from "@/lib/affiliates";
import { plural } from "@/lib/utils";

export function PortalLeaderboard({
  rows,
  currentUserId,
}: {
  rows: LeaderboardRow[];
  currentUserId?: string;
}) {
  return (
    <section>
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Rank</p>
      <h2 className="font-display text-3xl mt-2">Verified leaderboard</h2>
      <p className="mt-2 text-sm text-muted max-w-2xl">
        Ordered by likes on approved verified-affiliate reviews. Member notes never
        appear here.
      </p>

      {rows.length === 0 ? (
        <p className="mt-4 text-muted">No verified affiliates yet.</p>
      ) : (
        <ol className="mt-6 divide-y divide-line border border-line bg-panel">
          {rows.map((row) => {
            const mine = row.id === currentUserId;
            const owner = row.role === "OWNER";
            return (
              <li
                key={row.id}
                className={`flex flex-wrap items-baseline justify-between gap-3 px-4 py-4 sm:px-5 ${
                  mine ? "bg-gold/5" : ""
                }`}
              >
                <div className="flex items-baseline gap-3 min-w-0">
                  <span className="font-display text-2xl text-gold-bright w-10 shrink-0">
                    #{row.rank}
                  </span>
                  <div className="min-w-0">
                    <p className="font-display text-xl text-cream truncate">
                      {row.name}
                      {mine ? (
                        <span className="ml-2 text-xs uppercase tracking-[0.16em] text-gold">
                          You
                        </span>
                      ) : null}
                    </p>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted mt-1">
                      {owner ? "Owner" : "Verified affiliate"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted">
                  {row.likes} {plural(row.likes, "like")} · {row.approvedReviews}{" "}
                  {plural(row.approvedReviews, "approved review")}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

export function UnrankedLeaderboardNote({ trusted }: { trusted: boolean }) {
  if (trusted) return null;
  return (
    <p className="mt-3 text-sm text-muted">
      Your notes are excluded from this list until you are a verified affiliate and
      the owner approves a review.
    </p>
  );
}
