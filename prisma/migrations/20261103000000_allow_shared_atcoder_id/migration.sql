-- DropIndex
DROP INDEX "users_atcoder_id_key";

-- AlterTable
ALTER TABLE "submissions" DROP CONSTRAINT "submissions_pkey",
ADD CONSTRAINT "submissions_pkey" PRIMARY KEY ("user_id", "id");

