-- CreateTable
CREATE TABLE "Submission" (
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

    CONSTRAINT "Submission_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
