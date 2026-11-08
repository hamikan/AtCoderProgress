-- 問題データにまだない問題への提出を、捨てずに問題データが入るまで取っておく
-- CreateTable
CREATE TABLE "pending_submissions" (
    "id" INTEGER NOT NULL,
    "epoch_second" INTEGER NOT NULL,
    "problem_id" TEXT NOT NULL,
    "contest_id" TEXT NOT NULL,
    "atcoder_account_id" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "point" DOUBLE PRECISION NOT NULL,
    "length" INTEGER NOT NULL,
    "result" TEXT NOT NULL,
    "execution_time" INTEGER,

    CONSTRAINT "pending_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "pending_submissions_atcoder_account_id_idx" ON "pending_submissions"("atcoder_account_id");

-- AddForeignKey
ALTER TABLE "pending_submissions" ADD CONSTRAINT "pending_submissions_atcoder_account_id_fkey" FOREIGN KEY ("atcoder_account_id") REFERENCES "atcoder_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

