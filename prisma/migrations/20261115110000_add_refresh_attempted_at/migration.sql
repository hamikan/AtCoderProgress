-- 取り直しに失敗したあと、開くたびに取りに行かないよう、最後に試した時刻を持つ
-- AlterTable
ALTER TABLE "atcoder_accounts" ADD COLUMN     "refresh_attempted_at" TIMESTAMP(3);

