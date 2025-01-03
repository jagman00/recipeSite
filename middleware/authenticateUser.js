require('dotenv').config();
const jwt = require('jsonwebtoken');

// Middleware to authenticate User
module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized user, token missing" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid user token" });
    }
  };

  
