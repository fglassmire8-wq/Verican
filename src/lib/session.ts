import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export function getSession() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireOwner() {
  const user = await requireUser();
  if (!user || user.role !== "OWNER") return null;
  return user;
}
