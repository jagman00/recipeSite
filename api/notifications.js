const express = require('express');
const router = express.Router();
const prisma = require('../prisma');
const authenticateUser = require('../middleware/authenticateUser')

// Get all notifications for logged-in user
// GET /api/notifications
router.get('/', authenticateUser, async (req, res) => {
    const userId = req.user.userId;
    const { limit = 10, offset = 0 } = req.query; // Default to 10 and 0 if not provided

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId: parseInt(userId) },
            include: {
                fromUser: {
                    select: { userId: true, name: true }, // Include commenter/liker details
                },
                recipe: {
                    select: { recipeId: true, title: true }, // Include recipe details
                },
            },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit), // Fetch `limit` number of notifications
            skip: parseInt(offset), // Skip `offset` number of notifications
        });

        // Check if there are more notifications beyond the current batch
        const totalNotifications = await prisma.notification.count({ 
            where: { userId: parseInt(userId) } 
        });
        const unreadCount = await prisma.notification.count({
            where: { userId: parseInt(userId), read: false },
        });
        const hasMore = parseInt(offset) + notifications.length < totalNotifications;

        res.status(200).json({ notifications, unreadCount, hasMore });

        // Emit an event to notify the client
        req.io.to(`user-${userId}`).emit('newNotification' , notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        res.status(500).json({ message: 'Failed to fetch notifications.' });
    }
});

// Mark notifications as read
// PUT /api/notifications/mark-read
router.put('/mark-read', authenticateUser, async (req, res) => {
    const userId = req.user.userId;
    try {
        await prisma.notification.updateMany({
            where: { userId: parseInt(userId), read: false },
            data: { read: true },
        });
        res.status(204).end();
    } catch (error) {
        console.error('Error marking notifications as read:', error.message);
        res.status(500).json({ message: 'Failed to mark notifications as read.' });
    }
});

module.exports = router;