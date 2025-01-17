const prisma = require("../prisma");
const fs = require("fs");

const generateUserItemMatrix = async () => {
  try {
    // Query to fetch the User-Item Interaction Matrix
    const userItemMatrix = await prisma.activity.groupBy({
      by: ["userId", "recipeId"],
      _sum: {
        weight: true,
      },
    });

    // Formatting
    const formattedMatrix = userItemMatrix.map((entry) => ({
      userId: entry.userId,
      recipeId: entry.recipeId,
      interactionWeight: entry._sum.weight,
    }));

    // Save to a JSON file
    const outputFilePath = "scripts/user_item_matrix.json";
    fs.writeFileSync(outputFilePath, JSON.stringify(formattedMatrix, null, 2));
    console.log(`User-Item Matrix saved to ${outputFilePath}`);
  } catch (error) {
    console.error("Error generating User-Item Matrix:", error.message);
  } finally {
    await prisma.$disconnect();
  }
};


generateUserItemMatrix();
