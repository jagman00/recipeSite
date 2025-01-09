/*
  Warnings:

  - The `steps` column on the `Recipe` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[categoryName]` on the table `Category` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId,recipeId]` on the table `Like` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Recipe" DROP COLUMN "steps",
ADD COLUMN     "steps" JSONB NOT NULL DEFAULT '[]';

-- CreateTable
CREATE TABLE "RecipeReport" (
    "reportId" SERIAL NOT NULL,
    "reason" TEXT,
    "reporterId" INTEGER NOT NULL,
    "recipeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecipeReport_pkey" PRIMARY KEY ("reportId")
);

-- CreateTable
CREATE TABLE "CommentReport" (
    "reportId" SERIAL NOT NULL,
    "reason" TEXT,
    "reporterId" INTEGER NOT NULL,
    "commentId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentReport_pkey" PRIMARY KEY ("reportId")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecipeReport_reporterId_recipeId_key" ON "RecipeReport"("reporterId", "recipeId");

-- CreateIndex
CREATE UNIQUE INDEX "CommentReport_reporterId_commentId_key" ON "CommentReport"("reporterId", "commentId");

-- CreateIndex
CREATE UNIQUE INDEX "Category_categoryName_key" ON "Category"("categoryName");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_recipeId_key" ON "Like"("userId", "recipeId");

-- AddForeignKey
ALTER TABLE "RecipeReport" ADD CONSTRAINT "RecipeReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeReport" ADD CONSTRAINT "RecipeReport_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("recipeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReport" ADD CONSTRAINT "CommentReport_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentReport" ADD CONSTRAINT "CommentReport_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
