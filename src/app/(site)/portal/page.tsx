import Link from "next/link";
import type { ReactNode } from "react";
import { AffiliateApplyButton } from "@/components/AffiliateApplyButton";
import { HowItWorks } from "@/components/HowItWorks";
import { JoinForm } from "@/components/JoinForm";
import { OwnerDesk } from "@/components/OwnerDesk";
import { PortalLeaderboard, UnrankedLeaderboardNote } from "@/components/PortalLeaderboard";
import { PortalReviewsTable } from "@/components/PortalReviewsTable";
import { RefreshAccountStatusButton } from "@/components/RefreshAccountStatusButton";
import { RewardPanel } from "@/components/RewardPanel";
import { StatusChip } from "@/components/StatusChip";
import {
  countReviewsByStatus,
  getVerifiedAffiliateLeaderboard,
  leaderboardEntryFor,
  trustedLikesReceived,
} from "@/lib/affiliates";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { isTrustedAffiliate, plural } from "@/lib/utils";

export const metadata = { title: "Portal" };
export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const session = await getSession();

  if (!session?.user?.id) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <PortalHeader
          kicker="Affiliate HQ"
          title="Your portal"
          chip={null}
          subtitle="Sign in to open your desk, or apply as a new affiliate. After login you land here — not on a marketing page."
        />
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          <div className="border border-line bg-panel p-6">
            <h2 className="font-display text-2xl">Sign in</h2>
            <p className="mt-2 text-sm text-muted">
              Members and verified affiliates use the same login. The portal updates
              when the owner verifies you.
            </p>
            <Link
              href="/login?callbackUrl=/portal"
              className="mt-6 inline-block border border-gold bg-gold text-ink px-5 py-3 text-sm tracking-[0.16em] uppercase"
            >
              Sign in
            </Link>
          </div>
          <div className="border border-line bg-panel p-6">
            <h2 className="font-display text-2xl">Already a member?</h2>
            <p className="mt-2 text-sm text-muted">
              Sign in first, then apply from this portal. Member notes stay unverified
              until you are a verified affiliate.
            </p>
            <Link
              href="/join"
              className="mt-6 inline-block border border-line px-5 py-3 text-sm tracking-[0.16em] uppercase hover:border-gold"
            >
              Create a member account
            </Link>
          </div>
        </div>
        <div className="mt-6 border border-line bg-panel p-6">
          <h2 className="font-display text-2xl">Apply as a new affiliate</h2>
          <p className="mt-2 text-sm text-muted">
            Creates an account and submits an application in one step. The owner still
            has to verify you.
          </p>
          <div className="mt-6">
            <JoinForm affiliate />
          </div>
        </div>
        <div className="mt-12">
          <HowItWorks />
        </div>
        <p className="mt-10 text-sm text-muted">
          Want the longer program copy first?{" "}
          <Link href="/affiliate" className="text-gold hover:text-gold-bright">
            Read about affiliates
          </Link>
          .
        </p>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      reviews: {
        include: {
          product: { include: { brand: true } },
          store: true,
          likes: true,
          photos: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-muted">Account not found. Sign in again.</p>
      </div>
    );
  }

  const [leaderboard, rewardRules] = await Promise.all([
    getVerifiedAffiliateLeaderboard(),
    prisma.rewardRule.findMany({ orderBy: { key: "asc" } }),
  ]);

  const trusted = isTrustedAffiliate(user);
  const counts = countReviewsByStatus(user.reviews);
  const likes = trustedLikesReceived(user.reviews, user);
  const entry = leaderboardEntryFor(leaderboard, user.id, user);
  const rank = entry?.rank ?? null;
  const isOwner = user.role === "OWNER";

  const ownerBundle = isOwner
    ? await Promise.all([
        prisma.user.findMany({
          where: { affiliateStatus: "PENDING" },
          orderBy: { createdAt: "asc" },
        }),
        prisma.review.findMany({
          where: { status: "PENDING" },
          include: {
            user: true,
            product: { include: { brand: true } },
            store: true,
            photos: true,
          },
          orderBy: { createdAt: "asc" },
        }),
      ])
    : null;

  const reviewsForTable = user.reviews.map((review) => ({
    ...review,
    user: { role: user.role, affiliateStatus: user.affiliateStatus },
  }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:py-16">
      <PortalHeader
        kicker="Affiliate HQ"
        title={user.name}
        chip={<StatusChip role={user.role} affiliateStatus={user.affiliateStatus} />}
        subtitle={user.email}
      />

      <div className="mt-8">
        {trusted ? (
          <VerifiedBanner owner={isOwner} />
        ) : user.affiliateStatus === "PENDING" ? (
          <PendingBanner />
        ) : user.affiliateStatus === "REJECTED" ? (
          <RejectedBanner />
        ) : (
          <MemberBanner />
        )}
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          label="Rank"
          value={trusted && rank ? `#${rank}` : "—"}
          hint={
            trusted
              ? `of ${leaderboard.length} ${plural(leaderboard.length, "verified affiliate")}`
              : "Verified affiliates only"
          }
        />
        <StatCard
          label="Likes"
          value={likes}
          hint="On approved trusted reviews"
        />
        <StatCard label="Pending" value={counts.pending} hint="Waiting on the owner" />
        <StatCard label="Approved" value={counts.approved} hint="Published" />
        <StatCard
          label="Rejected"
          value={counts.rejected}
          hint="Not published as trusted"
        />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/submit"
          className="border border-gold bg-gold text-ink px-5 py-3 text-sm tracking-[0.16em] uppercase"
        >
          Submit a photo review
        </Link>
        {isOwner ? (
          <Link
            href="/moderation"
            className="border border-line px-5 py-3 text-sm tracking-[0.16em] uppercase hover:border-gold"
          >
            Moderation
          </Link>
        ) : null}
      </div>

      <div className="mt-14 space-y-14">
        {isOwner && ownerBundle ? (
          <OwnerDesk
            pendingAffiliates={ownerBundle[0]}
            pendingReviews={ownerBundle[1]}
            verified={leaderboard}
          />
        ) : null}

        <div>
          <PortalLeaderboard rows={leaderboard} currentUserId={user.id} />
          <UnrankedLeaderboardNote trusted={trusted} />
        </div>

        <PortalReviewsTable reviews={reviewsForTable} />
        <RewardPanel rules={rewardRules} />
        <HowItWorks />
      </div>
    </div>
  );
}

function PortalHeader({
  kicker,
  title,
  chip,
  subtitle,
}: {
  kicker: string;
  title: string;
  chip: ReactNode;
  subtitle: string;
}) {
  return (
    <header>
      <p className="text-[11px] uppercase tracking-[0.3em] text-gold">{kicker}</p>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-4xl sm:text-5xl">{title}</h1>
        {chip}
      </div>
      <p className="mt-3 text-sm text-muted max-w-2xl leading-relaxed">{subtitle}</p>
      <div className="editorial-rule mt-8" />
    </header>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="border border-line bg-panel p-4 sm:p-5">
      <p className="text-[11px] uppercase tracking-[0.2em] text-gold">{label}</p>
      <p className="font-display text-3xl mt-2 tabular-nums">{value}</p>
      <p className="mt-2 text-xs sm:text-sm text-muted leading-snug">{hint}</p>
    </div>
  );
}

function VerifiedBanner({ owner }: { owner: boolean }) {
  return (
    <div className="border border-gold/40 bg-panel p-5 sm:p-6">
      <h2 className="font-display text-2xl">
        {owner ? "Owner desk" : "Verified affiliate"}
      </h2>
      <p className="mt-2 text-sm text-muted leading-relaxed max-w-2xl">
        New photo reviews stay pending until the owner approves them
        {owner ? " — except owner reviews, which publish as trusted immediately" : ""}.
        Approved likes count toward rank. Honest DON&apos;T BUY is a feature.
      </p>
    </div>
  );
}

function PendingBanner() {
  return (
    <div className="border border-gold/40 bg-panel p-5 sm:p-6">
      <h2 className="font-display text-2xl">Application pending</h2>
      <p className="mt-2 text-sm text-muted leading-relaxed max-w-2xl">
        Francis has not verified you yet. You can still read reviews and post member
        notes — they stay unverified and unrewarded, and they do not drive rank while
        you are pending. You do not need to sign out. After the owner verifies you,
        check status here; this page updates on the next request.
      </p>
      <RefreshAccountStatusButton />
    </div>
  );
}

function RejectedBanner() {
  return (
    <div className="border border-line bg-panel p-5 sm:p-6">
      <h2 className="font-display text-2xl">Application not verified</h2>
      <p className="mt-2 text-sm text-muted leading-relaxed max-w-2xl">
        This account is still a member. You can read reviews and post unverified
        notes. Those notes stay unrewarded and out of trusted rank.
      </p>
    </div>
  );
}

function MemberBanner() {
  return (
    <div className="border border-line bg-panel p-5 sm:p-6">
      <h2 className="font-display text-2xl">Member notes vs verified reviews</h2>
      <p className="mt-2 text-sm text-muted leading-relaxed max-w-2xl">
        As a member you can post notes after a purchase. They publish unverified,
        cannot be liked, and never drive rank. Verified affiliates apply separately.
        Only approved reviews from verified affiliates get likes and may later receive
        brand-funded discounts — no dollar amount is promised.
      </p>
      <div className="mt-6">
        <AffiliateApplyButton />
      </div>
    </div>
  );
}
