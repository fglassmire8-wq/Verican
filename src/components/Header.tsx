import Link from "next/link";
import { getSession } from "@/lib/session";
import { SignOutButton } from "@/components/SignOutButton";

export async function Header() {
  const session = await getSession();
  const user = session?.user;
  const isOwner = user?.role === "OWNER";

  return (
    <header className="border-b border-line bg-ink/90 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <span className="font-display text-2xl tracking-[0.28em] text-gold-bright">
            VERICAN
          </span>
          <span className="block text-[10px] uppercase tracking-[0.32em] text-muted mt-0.5">
            Independent reviews · NJ
          </span>
        </Link>

        <details className="relative md:hidden">
          <summary className="list-none cursor-pointer text-sm tracking-widest uppercase text-gold">
            Menu
          </summary>
          <nav className="absolute right-0 mt-3 w-56 border border-line bg-panel p-4 flex flex-col gap-3 text-sm">
            <NavLinks isOwner={isOwner} signedIn={Boolean(user)} />
          </nav>
        </details>

        <nav className="hidden md:flex items-center gap-6 text-sm text-cream/80">
          <NavLinks isOwner={isOwner} signedIn={Boolean(user)} />
        </nav>
      </div>
    </header>
  );
}

function NavLinks({
  isOwner,
  signedIn,
}: {
  isOwner: boolean;
  signedIn: boolean;
}) {
  return (
    <>
      <Link href="/markets" className="hover:text-gold-bright">
        Markets
      </Link>
      <Link href="/brands" className="hover:text-gold-bright">
        Brands
      </Link>
      {signedIn ? (
        <>
          <Link href="/submit" className="hover:text-gold-bright">
            Submit
          </Link>
          <Link href="/portal" className="text-gold hover:text-gold-bright">
            Portal
          </Link>
          {isOwner ? (
            <Link href="/moderation" className="hover:text-gold-bright">
              Moderate
            </Link>
          ) : null}
          <SignOutButton />
        </>
      ) : (
        <>
          <Link href="/join" className="hover:text-gold-bright">
            Join
          </Link>
          <Link href="/affiliate" className="hover:text-gold-bright">
            Affiliates
          </Link>
          <Link href="/login" className="text-gold hover:text-gold-bright">
            Sign in
          </Link>
        </>
      )}
    </>
  );
}
