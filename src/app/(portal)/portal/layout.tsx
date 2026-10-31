import { PortalShell } from "@/components/PortalShell";
import { getSession } from "@/lib/session";

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  return (
    <PortalShell signedIn={Boolean(session?.user)} isOwner={session?.user?.role === "OWNER"}>
      {children}
    </PortalShell>
  );
}
