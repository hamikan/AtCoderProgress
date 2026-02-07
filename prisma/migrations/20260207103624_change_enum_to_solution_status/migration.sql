/*
  Warnings:

  - You are about to drop the column `is_public` on the `solutions` table. All the data in the column will be lost.
  - The `status` column on the `solutions` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `first_contest_id` on table `problems` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "public"."SolutionStatus" AS ENUM ('SELF_AC', 'EXPLANATION_AC', 'REVIEW_AC', 'AC', 'TRYING', 'UNSOLVED');

-- AlterTable
ALTER TABLE "public"."problems" ALTER COLUMN "first_contest_id" SET NOT NULL,
ALTER COLUMN "first_contest_id" SET DEFAULT 'unknown';

-- AlterTable
ALTER TABLE "public"."solutions" DROP COLUMN "is_public",
DROP COLUMN "status",
ADD COLUMN     "status" "public"."SolutionStatus" NOT NULL DEFAULT 'UNSOLVED';
