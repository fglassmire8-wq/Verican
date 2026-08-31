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

## Environment

| Variable | Local | Railway (volume + SQLite) | Railway (Postgres) |
| --- | --- | --- | --- |
| `DATABASE_URL` | `file:./dev.db` | `file:/data/prod.db` | the Postgres URL Railway gives you |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://<service>.up.railway.app` | same, your public https origin |
| `NEXTAUTH_SECRET` | long random string | a new long random string (not the local one) | same |
| `SEED_OWNER_PASSWORD` | owner login on this computer | owner login on the public site | same |
| `UPLOAD_DIR` | unset → `data/uploads/` | `/data/uploads` | `/data/uploads` (volume still required for photos) |

`NEXTAUTH_URL` must be the public https origin browsers use. After a custom domain (vericann.com if we get it), change it to `https://vericann.com` and redeploy.

If `NEXTAUTH_URL` is unset on Railway, the container sets it from `RAILWAY_PUBLIC_DOMAIN`. Set it yourself once you attach a custom domain.

## Owner login

Email: `frankg2152@icloud.com`

The password is the `SEED_OWNER_PASSWORD` value in `.env` on this computer (or the Railway variable on the public site). It is not stored in this README.

Seed also creates the approved MAX A/C review (Illicit Gardens, Cottonmouth, 28g, $150+tax, BUY) with the six photos in `public/uploads/max-ac/`.

## Product rules

- 21+ age gate
- Catalog is only what people actually reviewed (MAX A/C today)
- No fake scores or SKUs
- No hardcoded dollar rewards
- VERICAN does not sell cannabis

## Photos (v1 filesystem)

Committed seed photos live in `public/uploads/max-ac/` and ship with the repo, so they survive deploys.

New review photos are written to `UPLOAD_DIR` (default `data/uploads/`, gitignored) and served at `/media/...` by the existing media route. That is ordinary disk, not a CDN. The MAX A/C seed stays at `/uploads/max-ac/` in git.

**Limit:** a new deploy or a new machine does not keep those files unless the disk is persistent.

- **This computer / a VPS with a real disk:** files stay until you delete them.
- **Railway / Fly:** attach a volume and set `UPLOAD_DIR` to the mount path (for example `/data/uploads`).
- **Vercel:** the filesystem is ephemeral. Uploads and a SQLite file are lost on the next deploy. Do not host v1 on Vercel.

The MAX A/C seed photos are not affected by that limit.

## Database

Local stays SQLite via `DATABASE_URL="file:./dev.db"`. You do not need a paid database to run or develop VERICAN.

`prisma/schema.prisma` stays `provider = "sqlite"`. Do not edit it when you deploy.

- **SQLite** (`file:…`): `prisma migrate deploy` uses `prisma/migrations/`.
- **Postgres** (`postgres://` or `postgresql://`): `scripts/prisma-provider.mjs` writes `prisma-postgres/schema.prisma` and `prisma migrate deploy` uses `prisma-postgres/migrations/`. Never apply the SQLite SQL in `prisma/migrations/` to Postgres.

The Docker start script runs `prisma migrate deploy`, then `prisma generate`, then seeds only if the User table is empty (Francis + approved MAX A/C), then `next start`. It does not seed again when data already exists.

## Deploy on Railway (public URL)

Vercel serverless disk is ephemeral, so this repo ships a **Dockerfile** for Railway (or Fly) with a volume. Railway first.

1. Push this repo to GitHub (`fglassmire8-wq/Verican` on `main`).
2. In [Railway](https://railway.app), **New Project** → **GitHub Repo** → `fglassmire8-wq/Verican`.
3. Railway should detect the Dockerfile. If it does not, set the builder to Dockerfile (`railway.toml` already says `DOCKERFILE`).
4. **Add a volume** on the service. Mount path: `/data`. Without this, SQLite and new photos disappear on every deploy.
5. Set variables on the service:

   ```
   DATABASE_URL=file:/data/prod.db
   NEXTAUTH_URL=https://<your-service>.up.railway.app
   NEXTAUTH_SECRET=<long random string>
   SEED_OWNER_PASSWORD=<owner password for the public site>
   UPLOAD_DIR=/data/uploads
   ```

   Generate `NEXTAUTH_SECRET` with `openssl rand -base64 32`.

6. Generate a public domain: service → **Settings** → **Networking** → **Generate Domain**. Put that https origin in `NEXTAUTH_URL` and redeploy if you set the variable before the domain existed.
7. Wait for the deploy. The container runs migrate, generate, then `next start`. Health check is `/age`.
8. First boot seeds automatically when the User table is empty: Francis (`frankg2152@icloud.com`) and the approved MAX A/C review with the six photos in `public/uploads/max-ac/`. Later restarts skip seed if any user exists. You can still run `npm run db:seed` yourself (needs the same `SEED_OWNER_PASSWORD`).
9. Open the Railway URL, confirm 21+, sign in as Francis, and check `/portal`.

Optional Postgres instead of SQLite on the volume: add Railway Postgres, set `DATABASE_URL` to that URL, keep the `/data` volume for `UPLOAD_DIR=/data/uploads`, and deploy. First boot seeds the same way when User is empty.

### Custom domain later

When you have **vericann.com** (or another domain):

1. Railway → service → **Settings** → **Networking** → **Custom Domain**.
2. Point DNS where Railway tells you.
3. Set `NEXTAUTH_URL=https://vericann.com` and redeploy.

Build command (local / CI): `npm run build`.  
Start command (image): `./scripts/docker-start.sh` (`prisma migrate deploy`, `prisma generate`, seed if User is empty, `next start`).
