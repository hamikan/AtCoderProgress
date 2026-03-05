/*
  Warnings:

  - You are about to drop the `user_tag_aliases` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[created_by_id,tag_id]` on the table `user_tags` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."user_tag_aliases" DROP CONSTRAINT "user_tag_aliases_tag_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_tag_aliases" DROP CONSTRAINT "user_tag_aliases_user_id_fkey";

-- DropTable
DROP TABLE "public"."user_tag_aliases";

-- CreateIndex
CREATE UNIQUE INDEX "user_tags_created_by_id_tag_id_key" ON "public"."user_tags"("created_by_id", "tag_id");
