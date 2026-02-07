/*
  Warnings:

  - The primary key for the `problem_tags` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `tags` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "public"."problem_tags" DROP CONSTRAINT "problem_tags_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_tags" DROP CONSTRAINT "user_tags_tag_id_fkey";

-- AlterTable
ALTER TABLE "public"."problem_tags" DROP CONSTRAINT "problem_tags_pkey",
ALTER COLUMN "tag_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "problem_tags_pkey" PRIMARY KEY ("problem_id", "tag_id");

-- AlterTable
ALTER TABLE "public"."tags" DROP CONSTRAINT "tags_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "tags_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "tags_id_seq";

-- AlterTable
ALTER TABLE "public"."user_tags" ALTER COLUMN "tag_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "public"."user_tags" ADD CONSTRAINT "user_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_tags" ADD CONSTRAINT "problem_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
