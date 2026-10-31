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
          <span className="bubble text-3xl tracking-[0.06em]" style={{ WebkitTextStroke: "0.5px #1b6e2c" }}>
            GREEN VAULT
          </span>
          <span className="bubble block text-xl leading-none tracking-[0.06em] mt-0.5" style={{ WebkitTextStroke: "0.5px #1b6e2c" }}>
            NJ
          </span>
        </Link>

        <details className="relative md:hidden">
          <summary className="list-none cursor-pointer bubble-nav">
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
      <Link href="/categories" className="bubble-nav">
        Categories
      </Link>
      {signedIn ? (
        <>
          <Link href="/submit" className="bubble-nav">
            Submit
          </Link>
          <Link href="/portal" className="bubble-nav">
            Portal
          </Link>
          {isOwner ? (
            <Link href="/moderation" className="bubble-nav">
              Moderate
            </Link>
          ) : null}
          <SignOutButton />
        </>
      ) : (
        <>
          <Link href="/join" className="bubble-nav">
            Join
          </Link>
          <Link href="/affiliate" className="bubble-nav">
            Affiliates
          </Link>
          <Link href="/login" className="bubble-nav">
            Sign in
          </Link>
        </>
      )}
    </>
  );
}
