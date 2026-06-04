-- AlterTable
ALTER TABLE "courses" ADD COLUMN     "image" TEXT;

-- AlterTable
ALTER TABLE "lessons" ADD COLUMN     "description" TEXT,
ADD COLUMN     "icon" TEXT,
ADD COLUMN     "quizCountToShow" INTEGER NOT NULL DEFAULT 5,
ADD COLUMN     "quizGroupId" TEXT,
ADD COLUMN     "quizXpReward" INTEGER NOT NULL DEFAULT 20,
ADD COLUMN     "videoContext" JSONB,
ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "quizzes" ALTER COLUMN "lessonId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "user_progresses" ADD COLUMN     "lessonCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "quizCompleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "quiz_groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_QuizToGroup" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_QuizToGroup_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "quiz_groups_name_key" ON "quiz_groups"("name");

-- CreateIndex
CREATE INDEX "_QuizToGroup_B_index" ON "_QuizToGroup"("B");

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_quizGroupId_fkey" FOREIGN KEY ("quizGroupId") REFERENCES "quiz_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuizToGroup" ADD CONSTRAINT "_QuizToGroup_A_fkey" FOREIGN KEY ("A") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuizToGroup" ADD CONSTRAINT "_QuizToGroup_B_fkey" FOREIGN KEY ("B") REFERENCES "quiz_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
