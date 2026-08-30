# VERICAN

Independent 21+ cannabis reviews. New Jersey first.

This GitHub repository is the source of truth for the site — not Base44 or any other builder.

VERICAN is not a store. There is no cart and no SKU catalog. The point is a photo and an honest BUY or DON'T BUY note before you buy a sealed jar at a dispensary. VERICAN does not sell cannabis.

Users are the affiliates. Members can read reviews and leave unverified, unrewarded notes that never count toward trusted rank. A separate affiliate application is pending, then verified or rejected. Only approved reviews from verified affiliates get likes, drive rank, and may later receive brand-funded discounts. Rank is likes, not a dollar amount.

Honest DON'T BUY reviews are a feature.

Owner: Francis Glassmire.

## Run locally (Francis)

You need Node.js 20+ and npm.

```bash
cp .env.example .env
```

Edit `.env` and set:

- `NEXTAUTH_SECRET` — a long random string (not a password you reuse)
- `SEED_OWNER_PASSWORD` — the owner login password for this computer

Leave `DATABASE_URL="file:./dev.db"` for local SQLite. `.env` is gitignored; never commit it.

```bash
npm install
npx prisma migrate dev
npm run db:seed
npm run dev
```

Open http://localhost:3000. Confirm you are 21+.

If the database already exists and you only need the owner account and MAX A/C review again:

```bash
npm run db:seed
```

## Owner login

Email: `frankg2152@icloud.com`

The password is the `SEED_OWNER_PASSWORD` value in `.env` on this computer. It is not stored in this README.

Seed also creates the approved MAX A/C review (Illicit Gardens, Cottonmouth, 28g, $150+tax, BUY) with the six photos in `public/uploads/max-ac/`.

## Product rules

- 21+ age gate
- Catalog is only what people actually reviewed (MAX A/C today)
- No fake scores or SKUs
- No hardcoded dollar rewards
- VERICAN does not sell cannabis

## Photos (v1 filesystem)

Committed seed photos live in `public/uploads/max-ac/` and ship with the repo, so they survive deploys.

New review photos are written to `UPLOAD_DIR` (default `data/uploads/`, gitignored) and served at `/media/...`. That is ordinary disk, not a CDN. The MAX A/C seed stays at `/uploads/max-ac/` in git.

**Limit:** a new deploy or a new machine does not keep those files unless the disk is persistent.

- **This computer / a VPS with a real disk:** files stay until you delete them.
- **Fly / Railway:** attach a volume and set `UPLOAD_DIR` to the mount path (for example `/data/uploads`).
- **Vercel:** the filesystem is ephemeral. Uploads are lost on the next deploy. Use Fly/Railway with a volume for v1, or add object storage later.

The MAX A/C seed photos are not affected by that limit.

## Database

Local stays SQLite via `DATABASE_URL="file:./dev.db"`. You do not need a paid database to run or develop VERICAN.

When a host gives you Postgres, swap is:

1. In `prisma/schema.prisma`, change `provider = "sqlite"` to `provider = "postgresql"`.
2. Set `DATABASE_URL` to the Postgres URL (example is commented in `.env.example`).
3. Run `npx prisma db push` then `npm run db:seed` against that database.

Do not run the existing SQLite files in `prisma/migrations/` against Postgres — those SQL statements are SQLite-only.

## Deploy later (cheap custom domain)

A cheap custom domain on Vercel, Fly, or Railway is fine. Point DNS at the host when you are ready. Set the same env vars there (`DATABASE_URL`, `NEXTAUTH_URL` as the public https origin, `NEXTAUTH_SECRET`, `SEED_OWNER_PASSWORD`, and `UPLOAD_DIR` if you use a volume) and run migrate/push plus seed against that database.

Build command: `npm run build`. Start command: `npm run start`.
