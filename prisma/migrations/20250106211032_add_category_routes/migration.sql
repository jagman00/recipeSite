/*
  Warnings:

  - Made the column `recipeUrl` on table `Recipe` required. This step will fail if there are existing NULL values in that column.
  - Made the column `profileUrl` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Bookmark" DROP CONSTRAINT "Bookmark_userId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Ingredient" DROP CONSTRAINT "Ingredient_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_recipeId_fkey";

-- DropForeignKey
ALTER TABLE "Like" DROP CONSTRAINT "Like_userId_fkey";

-- DropForeignKey
ALTER TABLE "Recipe" DROP CONSTRAINT "Recipe_userId_fkey";

-- DropForeignKey
ALTER TABLE "UserFollower" DROP CONSTRAINT "UserFollower_followFromUserId_fkey";

-- DropForeignKey
ALTER TABLE "UserFollower" DROP CONSTRAINT "UserFollower_followToUserId_fkey";

-- AlterTable
ALTER TABLE "Ingredient" ALTER COLUMN "quantityAmount" DROP NOT NULL,
ALTER COLUMN "quantityUnit" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Recipe" ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "servingSize" DROP NOT NULL,
ALTER COLUMN "recipeUrl" SET NOT NULL,
ALTER COLUMN "recipeUrl" SET DEFAULT 'https://i.ytimg.com/vi/CPbKkb1hn7I/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBCWAzNKtwroNf1JzxKUvJEM5H4Wg';

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "profileUrl" SET NOT NULL,
ALTER COLUMN "profileUrl" SET DEFAULT 'https://img.freepik.com/premium-vector/knight-minimalist-line-art-icon-logo-symbol_925376-269058.jpg?w=1060';

-- AddForeignKey
ALTER TABLE "UserFollower" ADD CONSTRAINT "UserFollower_followFromUserId_fkey" FOREIGN KEY ("followFromUserId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFollower" ADD CONSTRAINT "UserFollower_followToUserId_fkey" FOREIGN KEY ("followToUserId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recipe" ADD CONSTRAINT "Recipe_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ingredient" ADD CONSTRAINT "Ingredient_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("recipeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bookmark" ADD CONSTRAINT "Bookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("recipeId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("recipeId") ON DELETE CASCADE ON UPDATE CASCADE;
