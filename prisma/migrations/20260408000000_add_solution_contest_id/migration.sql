ALTER TABLE "solutions"
ADD COLUMN "contest_id" TEXT;

UPDATE "solutions" AS s
SET "contest_id" = p."first_contest_id"
FROM "problems" AS p
WHERE s."problem_id" = p."id"
  AND s."contest_id" IS NULL;

ALTER TABLE "solutions"
ALTER COLUMN "contest_id" SET NOT NULL;

ALTER TABLE "solutions"
ADD CONSTRAINT "solutions_contest_id_fkey"
FOREIGN KEY ("contest_id") REFERENCES "contests"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

CREATE INDEX "solutions_contest_id_idx" ON "solutions"("contest_id");
CREATE INDEX "solutions_user_id_contest_id_problem_id_idx"
ON "solutions"("user_id", "contest_id", "problem_id");
