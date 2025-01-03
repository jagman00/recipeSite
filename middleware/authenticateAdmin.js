require('dotenv').config();
const jwt = require('jsonwebtoken');

// Middleware to authenticate Admin
module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized admin, token missing" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded.isAdmin) {
        return res.status(403).json({ message: "Admin access denied." });
      }

      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid admin token" });
    }
};
