const router = require("express").Router();
const prisma = require("../prisma");

// Endpoint to handle contact form submission
router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    const newMessage = await prisma.contactMessage.create({
      data: { name, email, message },
    });
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error saving contact message:", error);
    res.status(500).json({ error: "Failed to save message." });
  }
});

// Get all contact messages (Admin only)
router.get("/", async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages." });
  }
});

// DELETE /api/contact/:id
router.delete("/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const deletedMessage = await prisma.contactMessage.delete({
            where: { id: parseInt(id) },
        });

        res.status(200).json({ message: "Message deleted successfully.", deletedMessage });
    } catch (error) {
        console.error("Error deleting message:", error);
        res.status(500).json({ message: "Failed to delete message." });
    }
});

module.exports = router;
