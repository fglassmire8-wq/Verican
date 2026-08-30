# VERICAN

Independent 21+ cannabis reviews. New Jersey first.

VERICAN is not a store. There is no cart and no SKU catalog. The point is a photo and an honest BUY or DON'T BUY note before you buy a sealed jar at a dispensary. VERICAN does not sell cannabis.

Users are the affiliates. Members can read reviews and leave unverified, unrewarded notes that never count toward trusted rank. A separate affiliate application is pending, then verified or rejected. Only approved reviews from verified affiliates get likes, drive rank, and may later receive brand-funded discounts. Rank is likes, not a dollar amount.

Honest DON'T BUY reviews are a feature.

This code is owned by Francis Glassmire.

## Run locally

```bash
cp .env.example .env
```

Edit `.env` and set `NEXTAUTH_SECRET` and `SEED_OWNER_PASSWORD`. `.env` is gitignored.

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

Seed also creates the approved MAX A/C review (Illicit Gardens, Cottonmouth, $150/oz, BUY) with the six photos in `public/uploads/max-ac/`.

## Product rules

- 21+ age gate
- Catalog is only what people actually reviewed (MAX A/C today)
- No fake scores or SKUs
- No hardcoded dollar rewards
- VERICAN does not sell cannabis

## Deploy later

A cheap custom domain on Vercel, Fly, or Railway is fine. Set the same env vars there (`DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `SEED_OWNER_PASSWORD`) and run migrate plus seed against that database.

