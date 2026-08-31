import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { publicUrl } from "@/lib/public-origin";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  redirect(publicUrl("/portal", { headers: await headers() }).toString());
}
