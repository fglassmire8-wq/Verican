import { AdminNav } from "@/components/admin/AdminNav";
import { BrandForm, ProductForm, StoreForm } from "@/components/admin/CatalogForms";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { requireFounderPage } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Catalog · Founder admin" };
export const dynamic = "force-dynamic";

export default async function AdminCatalogPage() {
  await requireFounderPage("/portal/admin/catalog");
  const [products, brands, stores] = await Promise.all([
    prisma.product.findMany({
      include: { brand: true, _count: { select: { reviews: true } } },
      orderBy: { strain: "asc" },
    }),
    prisma.brand.findMany({
      include: { products: { include: { _count: { select: { reviews: true } } } } },
      orderBy: { name: "asc" },
    }),
    prisma.store.findMany({
      include: { _count: { select: { reviews: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <p className="text-[11px] uppercase tracking-[0.12em] text-gold">Founder only</p>
      <h1 className="font-display text-4xl mt-2">Catalog</h1>
      <p className="mt-3 text-sm text-muted max-w-2xl">
        Products, brands, and stores created with reviews. Deleting a row that still has
        reviews requires a second confirmation to delete those reviews too.
      </p>
      <AdminNav path="/portal/admin/catalog" />

      <section className="mt-10">
        <h2 className="font-display text-2xl">Products</h2>
        <ul className="mt-4 space-y-6">
          {products.map((product) => (
            <li key={product.id} className="border border-line bg-panel p-4">
              <p className="text-sm text-muted mb-3">
                {product.brand.name} · {product._count.reviews} reviews · /product/{product.slug}
              </p>
              <ProductForm
                product={{
                  id: product.id,
                  strain: product.strain,
                  slug: product.slug,
                  category: product.category,
                  brandId: product.brandId,
                }}
              />
              <div className="mt-3 flex flex-wrap gap-3">
                <ConfirmButton
                  url={`/api/admin/products/${product.id}`}
                  confirmText={`Delete product ${product.strain}? If it has reviews, this will be refused until you confirm a cascade.`}
                  label="Delete"
                />
                {product._count.reviews > 0 ? (
                  <ConfirmButton
                    url={`/api/admin/products/${product.id}`}
                    confirmText={`Delete ${product.strain} AND its ${product._count.reviews} reviews? This cannot be undone.`}
                    label="Delete with reviews"
                    body={{ cascade: true }}
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Brands</h2>
        <ul className="mt-4 space-y-6">
          {brands.map((brand) => {
            const reviewCount = brand.products.reduce((sum, product) => sum + product._count.reviews, 0);
            return (
              <li key={brand.id} className="border border-line bg-panel p-4">
                <p className="text-sm text-muted mb-3">
                  {brand.products.length} products · {reviewCount} reviews
                </p>
                <BrandForm brand={brand} />
                <div className="mt-3 flex flex-wrap gap-3">
                  <ConfirmButton
                    url={`/api/admin/brands/${brand.id}`}
                    confirmText={`Delete brand ${brand.name}? If it has products or reviews, this will be refused until you confirm a cascade.`}
                    label="Delete"
                  />
                  {brand.products.length || reviewCount ? (
                    <ConfirmButton
                      url={`/api/admin/brands/${brand.id}`}
                      confirmText={`Delete ${brand.name} AND its products and reviews? This cannot be undone.`}
                      label="Delete with products and reviews"
                      body={{ cascade: true }}
                    />
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl">Stores</h2>
        <ul className="mt-4 space-y-6">
          {stores.map((store) => (
            <li key={store.id} className="border border-line bg-panel p-4">
              <p className="text-sm text-muted mb-3">{store._count.reviews} reviews</p>
              <StoreForm store={store} />
              <div className="mt-3 flex flex-wrap gap-3">
                <ConfirmButton
                  url={`/api/admin/stores/${store.id}`}
                  confirmText={`Delete store ${store.name}? If it has reviews, this will be refused until you confirm a cascade.`}
                  label="Delete"
                />
                {store._count.reviews > 0 ? (
                  <ConfirmButton
                    url={`/api/admin/stores/${store.id}`}
                    confirmText={`Delete ${store.name} AND its ${store._count.reviews} reviews? This cannot be undone.`}
                    label="Delete with reviews"
                    body={{ cascade: true }}
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
