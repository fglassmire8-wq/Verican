-- Backfill every existing product to Flower when category is missing or outside the official set.
-- Does not touch reviews or any other tables.
UPDATE "Product"
SET "category" = 'FLOWER'
WHERE "category" IS NULL
   OR TRIM("category") = ''
   OR "category" NOT IN ('FLOWER', 'PREROLL', 'VAPE', 'CONCENTRATE', 'EDIBLE', 'OTHER');
