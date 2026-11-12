"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";

const TABS = [
  { href: "/portal", label: "Overview" },
  { href: "/portal/submit", label: "Add a review" },
  { href: "/portal/reviews", label: "My reviews" },
  { href: "/portal/account", label: "Account" },
];

export function PortalShell({
  children,
  signedIn,
  isOwner,
}: {
  children: React.ReactNode;
  signedIn: boolean;
  isOwner: boolean;
}) {
  const pathname = usePathname();
  const tabs = isOwner ? [...TABS, { href: "/portal/stats", label: "Stats" }, { href: "/moderation", label: "Moderate" }] : TABS;
  const active = (href: string) =>
    href === "/portal" ? pathname === "/portal" : pathname.startsWith(href);

  return (
    <div className="portal-shell min-h-screen bg-[#f4f7f5] md:flex">
      <aside className="md:w-64 md:shrink-0 md:min-h-screen bg-[#0f2418] text-white md:sticky md:top-0 md:h-screen flex flex-col">
        <div className="px-5 py-4 md:py-6 flex items-center justify-between md:block">
          <Link href="/portal" className="block">
            <span className="block text-lg font-extrabold tracking-tight text-white">Green Vault</span>
            <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-[#6fdc8c]">
              Affiliates
            </span>
          </Link>
          <Link href="/" className="md:hidden text-xs text-white/70 hover:text-white">
            ← Back to Green Vault
          </Link>
        </div>
        {signedIn ? (
          <nav
            aria-label="Portal"
            className="flex md:flex-col gap-1 overflow-x-auto px-3 pb-3 md:pb-0 md:px-3 text-sm"
          >
            {tabs.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                aria-current={active(t.href) ? "page" : undefined}
                className={`whitespace-nowrap rounded-lg px-3 py-2 font-semibold transition-colors ${
                  active(t.href)
                    ? "bg-[#2f9e44] text-white"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {t.label}
              </Link>
            ))}
          </nav>
        ) : null}
        <div className="hidden md:flex mt-auto flex-col gap-3 px-5 py-6 text-sm border-t border-white/10">
          {signedIn ? (
            <span className="[&_button]:text-white/70 [&_button:hover]:text-white">
              <SignOutButton />
            </span>
          ) : (
            <Link href="/login?callbackUrl=/portal" className="text-white/80 hover:text-white">
              Sign in
            </Link>
          )}
          <Link href="/" className="text-white/70 hover:text-white">
            ← Back to Green Vault
          </Link>
        </div>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
