-- AlterTable
ALTER TABLE "public"."problems" ALTER COLUMN "first_contest_id" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "public"."problems" ADD CONSTRAINT "problems_first_contest_id_fkey" FOREIGN KEY ("first_contest_id") REFERENCES "public"."contests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
