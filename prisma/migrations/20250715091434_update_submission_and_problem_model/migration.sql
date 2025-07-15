/*
  Warnings:

  - A unique constraint covering the columns `[atcoder_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "atcoder_id" TEXT;

-- CreateTable
CREATE TABLE "submissions" (
    "id" INTEGER NOT NULL,
    "epoch_second" INTEGER NOT NULL,
    "problem_id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "point" DOUBLE PRECISION NOT NULL,
    "length" INTEGER NOT NULL,
    "result" TEXT NOT NULL,
    "execution_time" INTEGER,
    "userId" TEXT NOT NULL,

    CONSTRAINT "submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "problems" (
    "id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "problem_index" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "difficulty" INTEGER,

    CONSTRAINT "problems_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "problems_contest_id_idx" ON "problems"("contest_id");

-- CreateIndex
CREATE UNIQUE INDEX "problems_contest_id_problem_index_key" ON "problems"("contest_id", "problem_index");

-- CreateIndex
CREATE UNIQUE INDEX "users_atcoder_id_key" ON "users"("atcoder_id");

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "problems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
