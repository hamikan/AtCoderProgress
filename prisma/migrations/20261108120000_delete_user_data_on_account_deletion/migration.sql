-- 退会したら解法記録は一緒に消し、★はおすすめの問題に使う全員の平均に入るため、誰のものかを外して残す
-- DropForeignKey
ALTER TABLE "problem_reviews" DROP CONSTRAINT "problem_reviews_user_id_fkey";

-- DropForeignKey
ALTER TABLE "solutions" DROP CONSTRAINT "solutions_user_id_fkey";

-- AlterTable
ALTER TABLE "problem_reviews" ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "solutions" ADD CONSTRAINT "solutions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "problem_reviews" ADD CONSTRAINT "problem_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

