-- CreateTable
CREATE TABLE "public"."user_tag_aliases" (
    "user_id" TEXT NOT NULL,
    "tag_id" INTEGER NOT NULL,
    "canonical_tag_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_tag_aliases_pkey" PRIMARY KEY ("user_id","tag_id")
);

-- CreateIndex
CREATE INDEX "user_tag_aliases_canonical_tag_id_idx" ON "public"."user_tag_aliases"("canonical_tag_id");

-- AddForeignKey
ALTER TABLE "public"."user_tag_aliases" ADD CONSTRAINT "user_tag_aliases_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_tag_aliases" ADD CONSTRAINT "user_tag_aliases_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "public"."tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_tag_aliases" ADD CONSTRAINT "user_tag_aliases_canonical_tag_id_fkey" FOREIGN KEY ("canonical_tag_id") REFERENCES "public"."tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
