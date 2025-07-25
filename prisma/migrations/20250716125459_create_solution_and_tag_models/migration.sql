-- CreateEnum
CREATE TYPE "SolutionStatus" AS ENUM ('SELF_AC', 'EXPLANATION_AC', 'REVIEW_AC', 'TRYING');

-- AlterTable
ALTER TABLE "problems" ADD COLUMN     "totalSolutionsCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "solutions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "problem_id" TEXT NOT NULL,
    "content" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "status" "SolutionStatus" NOT NULL,
    "solved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "is_official" BOOLEAN NOT NULL DEFAULT false,
    "created_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "solution_tags" (
    "solution_id" TEXT NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "solution_tags_pkey" PRIMARY KEY ("solution_id","tag_id")
);

-- CreateIndex
CREATE INDEX "solutions_user_id_idx" ON "solutions"("user_id");

-- CreateIndex
CREATE INDEX "solutions_problem_id_idx" ON "solutions"("problem_id");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- AddForeignKey
ALTER TABLE "solutions" ADD CONSTRAINT "solutions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solutions" ADD CONSTRAINT "solutions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tags" ADD CONSTRAINT "tags_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_tags" ADD CONSTRAINT "solution_tags_solution_id_fkey" FOREIGN KEY ("solution_id") REFERENCES "solutions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solution_tags" ADD CONSTRAINT "solution_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
