const router = require("express").Router();
module.exports = router;
const prisma = require("../prisma"); 

const authenticateUser = require("../middleware/authenticateUser");
const authenticateAdmin = require("../middleware/authenticateAdmin"); 

// Get all comments
// GET /api/comments
router.get("/", authenticateAdmin, async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        recipe: {
          select: {
            recipeId: true,
            title: true,
          },
        },
        user: {
          select: {
            userId: true,
            name: true,
            userTitle: true,
            profileUrl: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc", // Order by newest updated comment first
      },
    });

    // Count the total number of comments
    const commentCount = await prisma.comment.count();

    res.status(200).json({comments, commentCount});
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).json({ error: "Failed to fetch the comments." });
  }
});

// Delete a specific comment regardless of ownership (only by admin)
// DELETE /api/comments/:id
router.delete("/:id", authenticateAdmin, async (req, res) => {
  const { id } = req.params; 
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });
    if (!comment) {
      return res.status(404).json({ error: "Comment not found." });
    }

    await prisma.comment.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).end(); // No content response
  } catch (error) {
    console.error("Error deleting a comment:", error);
    res.status(500).json({ error: "Failed to delete comment." });
  }
});


// // Get a specific comment
// // GET /api/comments/:id
// router.get("/:id", authenticateUser, async (req, res) => {
//   const { id } = req.params; 
//   try {
//     const comment = await prisma.comment.findUnique({
//       where: { id: parseInt(id) },
//       include: {
//         recipe: true, 
//         user: {
//           select: {
//             id: true,
//             name: true,
//             userTitle: true,
//             bio: true,
//             profileUrl: true,
//           },
//         },
//       },
//     });
//     if (comment) {
//       res.json(comment);
//     } else {
//       res.status(404).json({ error: "Comment not found." });
//     }
//   } catch (error) {
//     console.error("Error fetching a comment:", error);
//     res.status(500).json({ error: "Failed to fetch comment." });
//   }
// });