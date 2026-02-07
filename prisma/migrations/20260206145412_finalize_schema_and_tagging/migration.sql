/*
  Warnings:

  - You are about to drop the column `totalSolutionCount` on the `problems` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `submissions` table. All the data in the column will be lost.
  - You are about to drop the column `created_by_id` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the column `is_official` on the `tags` table. All the data in the column will be lost.
  - You are about to drop the `solution_tags` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_tag_aliases` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `user_id` to the `submissions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."solution_tags" DROP CONSTRAINT "solution_tags_solution_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."solution_tags" DROP CONSTRAINT "solution_tags_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."submissions" DROP CONSTRAINT "submissions_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."tags" DROP CONSTRAINT "tags_created_by_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_tag_aliases" DROP CONSTRAINT "user_tag_aliases_canonical_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_tag_aliases" DROP CONSTRAINT "user_tag_aliases_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_tag_aliases" DROP CONSTRAINT "user_tag_aliases_user_id_fkey";

-- AlterTable
ALTER TABLE "public"."contests" ALTER COLUMN "duration_second" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "public"."problems" DROP COLUMN "totalSolutionCount",
ADD COLUMN     "total_solution_count" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "public"."submissions" DROP COLUMN "userId",
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "public"."tags" DROP COLUMN "created_by_id",
DROP COLUMN "is_official";

-- DropTable
DROP TABLE "public"."solution_tags";

-- DropTable
DROP TABLE "public"."user_tag_aliases";

-- CreateTable
CREATE TABLE "public"."user_tags" (
    "id" TEXT NOT NULL,
    "created_by_id" TEXT NOT NULL,
    "tag_id" INTEGER,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."solution_user_tags" (
    "solution_id" TEXT NOT NULL,
    "user_tag_id" TEXT NOT NULL,

    CONSTRAINT "solution_user_tags_pkey" PRIMARY KEY ("solution_id","user_tag_id")
);

-- CreateTable
CREATE TABLE "public"."problem_tags" (
    "problem_id" TEXT NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "problem_tags_pkey" PRIMARY KEY ("problem_id","tag_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_tags_created_by_id_name_key" ON "public"."user_tags"("created_by_id", "name");

-- AddForeignKey
ALTER TABLE "public"."submissions" ADD CONSTRAINT "submissions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_tags" ADD CONSTRAINT "user_tags_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_tags" ADD CONSTRAINT "user_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solution_user_tags" ADD CONSTRAINT "solution_user_tags_solution_id_fkey" FOREIGN KEY ("solution_id") REFERENCES "public"."solutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."solution_user_tags" ADD CONSTRAINT "solution_user_tags_user_tag_id_fkey" FOREIGN KEY ("user_tag_id") REFERENCES "public"."user_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_tags" ADD CONSTRAINT "problem_tags_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_tags" ADD CONSTRAINT "problem_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
