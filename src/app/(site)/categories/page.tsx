import { redirect } from "next/navigation";
import { parseCategory } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function CategoriesRedirect({
  searchParams,
}: {
  searchParams: Promise<{ c?: string }>;
}) {
  const { c = "" } = await searchParams;
  const category = parseCategory(c);
  redirect(category ? `/reviews?category=${category.slug}` : "/reviews");
}
