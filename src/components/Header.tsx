import Link from "next/link";
import { getSession } from "@/lib/session";
import { SignOutButton } from "@/components/SignOutButton";
import { HeaderMenu } from "@/components/HeaderMenu";

export async function Header() {
  const session = await getSession();
  const user = session?.user;
  const isOwner = user?.role === "OWNER";

  return (
    <header className="border-b border-line bg-ink/90 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 py-4 flex items-center gap-3 min-h-[76px]">
        <HeaderMenu>
          <NavLinks isOwner={isOwner} signedIn={Boolean(user)} />
        </HeaderMenu>
        <Link href="/" className="font-display text-2xl sm:text-3xl leading-none">
          Green Vault, NJ
        </Link>
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
      <Link href="/reviews" className="bubble-nav">
        Reviews
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
