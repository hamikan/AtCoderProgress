-- 新しい AtCoder ID の全件取得を裏で続けるため、取得中と失敗を持つ (#157)

-- AlterTable
ALTER TABLE "atcoder_accounts" ADD COLUMN     "fetch_failed_at" TIMESTAMP(3),
ADD COLUMN     "fetch_started_at" TIMESTAMP(3);

