import Link from "next/link";
import { getSession } from "@/lib/session";
import { SignOutButton } from "@/components/SignOutButton";
import { Chewy } from "next/font/google";

const bubble = Chewy({ subsets: ["latin"], weight: "400", display: "swap" });

export async function Header() {
  const session = await getSession();
  const user = session?.user;
  const isOwner = user?.role === "OWNER";

  return (
    <header className="border-b border-line bg-ink/90 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
        <Link href="/" className="shrink-0">
          <span
            className={`${bubble.className} text-3xl tracking-[0.06em]`}
            style={{
              color: "#2f9e44",
              textShadow: "0 2px 0 #1b6e2c, 0 0 1px #1b6e2c",
              WebkitTextStroke: "0.5px #1b6e2c",
            }}
          >
            GREEN VAULT
          </span>
          <span className="block text-[10px] uppercase tracking-[0.12em] text-muted mt-0.5">
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
      <Link href="/categories" className="hover:text-gold-bright">
        Categories
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
