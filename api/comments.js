const router = require("express").Router();
module.exports = router;
const prisma = require("../prisma"); 

const authenticateUser = require("../middleware/authenticateUser");
const authenticateAdmin = require("../middleware/authenticateAdmin"); 

// Get all comments
// GET /api/comments
router.get("/", authenticateUser, async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      include: {
        recipe: true, 
        user: {
          select: {
            id: true,
            name: true,
            userTitle: true,
            bio: true,
            profileUrl: true,
          },
        },
      },
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments." });
  }
});

// Get a specific comment
// GET /api/comments/:id
router.get("/:id", authenticateUser, async (req, res) => {
  const { id } = req.params; 
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
      include: {
        recipe: true, 
        user: {
          select: {
            id: true,
            name: true,
            userTitle: true,
            bio: true,
            profileUrl: true,
          },
        },
      },
    });
    if (comment) {
      res.json(comment);
    } else {
      res.status(404).json({ error: "Comment not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comment." });
  }
});

// Delete a specific comment
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
    res.status(500).json({ error: "Failed to delete comment." });
  }
});
