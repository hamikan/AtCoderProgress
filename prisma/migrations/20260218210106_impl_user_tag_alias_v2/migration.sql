-- CreateTable
CREATE TABLE "public"."problem_reviews" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "problem_id" TEXT NOT NULL,
    "stars" INTEGER NOT NULL DEFAULT 3,
    "review_priority" INTEGER NOT NULL DEFAULT 3,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "problem_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_tag_aliases" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tag_id" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_tag_aliases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "problem_reviews_user_id_idx" ON "public"."problem_reviews"("user_id");

-- CreateIndex
CREATE INDEX "problem_reviews_problem_id_idx" ON "public"."problem_reviews"("problem_id");

-- CreateIndex
CREATE UNIQUE INDEX "problem_reviews_user_id_problem_id_key" ON "public"."problem_reviews"("user_id", "problem_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_tag_aliases_user_id_tag_id_key" ON "public"."user_tag_aliases"("user_id", "tag_id");

-- AddForeignKey
ALTER TABLE "public"."problem_reviews" ADD CONSTRAINT "problem_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."problem_reviews" ADD CONSTRAINT "problem_reviews_problem_id_fkey" FOREIGN KEY ("problem_id") REFERENCES "public"."problems"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_tag_aliases" ADD CONSTRAINT "user_tag_aliases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_tag_aliases" ADD CONSTRAINT "user_tag_aliases_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
