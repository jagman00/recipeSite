const router = require("express").Router();
module.exports = router;
const prisma = require("../prisma");

// const authenticateUser = require("../middleware/authenticateUser");
const authenticateAdmin = require("../middleware/authenticateAdmin");

// Get all reported recipes (Admin only)
// GET /api/reports/recipes
router.get("/recipes", authenticateAdmin, async (req, res) => {
  try {
    const reports = await prisma.recipeReport.findMany({
      include: {
        reporter: {
          select: { userId: true, name: true, email: true },
        },
        recipe: {
          select: {
            recipeId: true,
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Order by latest report first
      },
    });

    // Count the total number of reports
    const recipeReportCount = await prisma.recipeReport.count();

    res.status(200).json({ recipeReportCount, reports });
  } catch (error) {
    console.error("Error fetching recipe reports:", error);
    res.status(500).json({ error: "Failed to fetch the recipe reports." });
  }
});



// Get all reported comments (Admin only)
// GET /api/reports/comments
router.get("/comments", authenticateAdmin, async (req, res) => {
  try {
    const reports = await prisma.commentReport.findMany({
      include: {
        reporter: {
          select: { userId: true, name: true, email: true },
        },
        comment: {
          select: {
            id: true,
            recipeId: true,
            text: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Order by latest report first
      },
    });

    // Count the total number of reports
    const commentReportCount = await prisma.commentReport.count();

    res.status(200).json({ commentReportCount, reports });
  } catch (error) {
    console.error("Error fetching comment reports:", error);
    res.status(500).json({ error: "Failed to fetch the comment reports." });
  }
});

// Dismiss a reported recipe (Admin only)
router.delete("/recipes/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const deletedReport = await prisma.recipeReport.delete({
      where: { reportId: parseInt(id) },
    });
    res.status(200).json({ message: "Recipe report dismissed successfully.", deletedReport });
  } catch (error) {
    console.error("Error dismissing recipe report:", error);
    res.status(500).json({ error: "Failed to dismiss the recipe report." });
  }
});

// Dismiss a reported comment (Admin only)
router.delete("/comments/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const deletedReport = await prisma.commentReport.delete({
      where: { reportId: parseInt(id) },
    });
    res.status(200).json({ message: "Comment report dismissed successfully.", deletedReport });
  } catch (error) {
    console.error("Error dismissing comment report:", error);
    res.status(500).json({ error: "Failed to dismiss the comment report." });
  }
});