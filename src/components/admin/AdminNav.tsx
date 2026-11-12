import Link from "next/link";

const LINKS = [
  { href: "/portal/admin", label: "Overview", exact: true },
  { href: "/portal/admin/reviews", label: "Reviews" },
  { href: "/portal/admin/users", label: "Users" },
  { href: "/portal/admin/catalog", label: "Catalog" },
];

export function AdminNav({ path }: { path: string }) {
  return (
    <nav className="mt-6 flex flex-wrap gap-2 text-sm" aria-label="Founder admin">
      {LINKS.map((link) => {
        const active = link.exact ? path === link.href : path === link.href || path.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`border px-3 py-1.5 ${
              active ? "border-gold bg-gold text-ink" : "border-line hover:border-gold"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
