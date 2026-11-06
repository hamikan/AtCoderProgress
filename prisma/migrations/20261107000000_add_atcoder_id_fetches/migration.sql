-- AtCoder ID の変更制限を、7日間から「新しい ID の全件取得を24時間に何回まで」に変える (#159)

-- CreateTable
CREATE TABLE "atcoder_id_fetches" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "atcoder_account_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atcoder_id_fetches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "atcoder_id_fetches_user_id_created_at_idx" ON "atcoder_id_fetches"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "atcoder_id_fetches" ADD CONSTRAINT "atcoder_id_fetches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

