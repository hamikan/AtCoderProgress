-- 提出とレート履歴を、ユーザーごとではなく AtCoder ID ごとに持つ (#161)
-- AtCoder ID は大文字小文字を区別しないので、小文字にそろえたものをキーにする

-- CreateTable
CREATE TABLE "atcoder_accounts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "submissions_last_fetched_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atcoder_accounts_pkey" PRIMARY KEY ("id")
);

-- 連携済みの ID から作る。大文字小文字違いの重複は、最後に取得した方を残す
INSERT INTO "atcoder_accounts" ("id", "name", "submissions_last_fetched_at")
SELECT DISTINCT ON (lower("atcoder_id")) lower("atcoder_id"), "atcoder_id", "submissions_last_fetched_at"
FROM "users"
WHERE "atcoder_id" IS NOT NULL
ORDER BY lower("atcoder_id"), "submissions_last_fetched_at" DESC NULLS LAST;

-- submissions: user_id を atcoder_account_id に付け替える
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_user_id_fkey";
ALTER TABLE "submissions" ADD COLUMN "atcoder_account_id" TEXT;
UPDATE "submissions" AS s
SET "atcoder_account_id" = lower(u."atcoder_id")
FROM "users" AS u
WHERE u."id" = s."user_id";
DELETE FROM "submissions" WHERE "atcoder_account_id" IS NULL;
ALTER TABLE "submissions" DROP COLUMN "user_id";
ALTER TABLE "submissions" ALTER COLUMN "atcoder_account_id" SET NOT NULL;
CREATE INDEX "submissions_atcoder_account_id_epoch_second_idx" ON "submissions"("atcoder_account_id", "epoch_second");
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_atcoder_account_id_fkey" FOREIGN KEY ("atcoder_account_id") REFERENCES "atcoder_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- user_rating_history: user_id を atcoder_account_id に付け替える
ALTER TABLE "user_rating_history" DROP CONSTRAINT "user_rating_history_user_id_fkey";
DROP INDEX "user_rating_history_user_id_idx";
DROP INDEX "user_rating_history_user_id_contest_screen_name_key";
ALTER TABLE "user_rating_history" ADD COLUMN "atcoder_account_id" TEXT;
UPDATE "user_rating_history" AS h
SET "atcoder_account_id" = lower(u."atcoder_id")
FROM "users" AS u
WHERE u."id" = h."user_id";
DELETE FROM "user_rating_history" WHERE "atcoder_account_id" IS NULL;
-- 同じ ID を大文字小文字違いで連携していた場合の重複を除く
DELETE FROM "user_rating_history" AS a
USING "user_rating_history" AS b
WHERE a."atcoder_account_id" = b."atcoder_account_id"
  AND a."contest_screen_name" = b."contest_screen_name"
  AND a."id" > b."id";
ALTER TABLE "user_rating_history" DROP COLUMN "user_id";
ALTER TABLE "user_rating_history" ALTER COLUMN "atcoder_account_id" SET NOT NULL;
CREATE UNIQUE INDEX "user_rating_history_atcoder_account_id_contest_screen_name_key" ON "user_rating_history"("atcoder_account_id", "contest_screen_name");
ALTER TABLE "user_rating_history" ADD CONSTRAINT "user_rating_history_atcoder_account_id_fkey" FOREIGN KEY ("atcoder_account_id") REFERENCES "atcoder_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- users: 同じ AtCoder ID を複数のアカウントで連携できるようにする (#114)
DROP INDEX "users_atcoder_id_key";
ALTER TABLE "users" DROP COLUMN "submissions_last_fetched_at";
