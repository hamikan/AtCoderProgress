-- 「AC」は新しい記録に最初から付いていた値で、自分で選んだものと区別できないため「未設定」に変える
-- 追加した値は同じトランザクションで使えないので、型を作り直して置き換える

ALTER TYPE "SolutionStatus" RENAME TO "SolutionStatus_old";

CREATE TYPE "SolutionStatus" AS ENUM ('UNSET', 'TRYING', 'EXPLANATION_AC', 'SELF_AC', 'REVIEW_AC', 'UNSOLVED');

ALTER TABLE "solutions" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "solutions" ALTER COLUMN "status" TYPE "SolutionStatus"
USING (
  CASE WHEN "status"::text = 'AC' THEN 'UNSET' ELSE "status"::text END
)::"SolutionStatus";

ALTER TABLE "solutions" ALTER COLUMN "status" SET DEFAULT 'UNSET';

DROP TYPE "SolutionStatus_old";
