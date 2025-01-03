const router = require("express").Router();
module.exports = router;
const prisma = require("../prisma");

const authenticateUser = require('../middleware/authenticateUser');
const authenticateAdmin = require('../middleware/authenticateAdmin');