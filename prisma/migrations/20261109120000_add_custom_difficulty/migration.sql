-- 独自推定を AtCoder Problems の値と分けて持ち、どのコンテストを推定したかを残す
-- AlterTable
ALTER TABLE "contests" ADD COLUMN     "custom_difficulty_estimated_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "custom_difficulty" INTEGER;

