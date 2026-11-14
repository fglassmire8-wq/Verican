import Link from "next/link";
import { getSession } from "@/lib/session";
import { SignOutButton } from "@/components/SignOutButton";
import { HeaderMenu } from "@/components/HeaderMenu";

export async function Header() {
  const session = await getSession();
  const user = session?.user;
  const isOwner = user?.role === "OWNER";
  const signedIn = Boolean(user);

  return (
    <header className="border-b border-line bg-ink/90 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-3 min-h-[76px]">
        <HeaderMenu className="md:hidden">
          <NavLinks isOwner={isOwner} signedIn={signedIn} />
        </HeaderMenu>
        <Link href="/" className="font-display text-2xl sm:text-3xl leading-none">
          Green Vault, NJ
        </Link>
        <nav
          className="ml-auto hidden md:flex items-center gap-5 text-sm"
          aria-label="Main"
        >
          <NavLinks isOwner={isOwner} signedIn={signedIn} />
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
      <Link href="/" className="bubble-nav">
        Home
      </Link>
      {signedIn ? (
        <Link href="/portal" className="bubble-nav">
          My portal
        </Link>
      ) : (
        <Link href="/affiliate" className="bubble-nav">
          Sign up
        </Link>
      )}
      <Link href="/reviews" className="bubble-nav">
        Reviews
      </Link>
      <Link href="/portal/submit" className="bubble-nav">
        Add a review
      </Link>
      {isOwner ? (
        <>
          <Link href="/moderation" className="bubble-nav">
            Moderation
          </Link>
          <Link href="/portal/admin" className="bubble-nav">
            Admin
          </Link>
        </>
      ) : null}
      {signedIn ? (
        <SignOutButton className="bubble-nav bg-transparent p-0 text-left" />
      ) : (
        <Link href="/login" className="bubble-nav">
          Sign in
        </Link>
      )}
    </>
  );
}
