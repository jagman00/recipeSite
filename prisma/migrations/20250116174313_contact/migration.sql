-- AlterTable
ALTER TABLE "Activity" ADD COLUMN     "bookmarkId" INTEGER,
ADD COLUMN     "followId" INTEGER;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_followId_fkey" FOREIGN KEY ("followId") REFERENCES "UserFollower"("followId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_bookmarkId_fkey" FOREIGN KEY ("bookmarkId") REFERENCES "Bookmark"("bookmarkId") ON DELETE SET NULL ON UPDATE CASCADE;
