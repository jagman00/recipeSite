-- DropForeignKey
ALTER TABLE "Activity" DROP CONSTRAINT "Activity_recipeId_fkey";

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("recipeId") ON DELETE SET NULL ON UPDATE CASCADE;
