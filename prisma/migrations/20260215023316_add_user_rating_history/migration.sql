-- CreateTable
CREATE TABLE "public"."user_rating_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_rated" BOOLEAN NOT NULL,
    "place" INTEGER NOT NULL,
    "old_rating" INTEGER NOT NULL,
    "new_rating" INTEGER NOT NULL,
    "performance" INTEGER NOT NULL,
    "inner_performance" INTEGER NOT NULL,
    "contest_screen_name" TEXT NOT NULL,
    "contest_name" TEXT NOT NULL,
    "contest_name_en" TEXT NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_rating_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_rating_history_user_id_idx" ON "public"."user_rating_history"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_rating_history_user_id_contest_screen_name_key" ON "public"."user_rating_history"("user_id", "contest_screen_name");

-- AddForeignKey
ALTER TABLE "public"."user_rating_history" ADD CONSTRAINT "user_rating_history_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
