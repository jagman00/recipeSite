const router = require("express").Router(); 
module.exports = router; 

router.use("/auth", require("./auth")); 
router.use("/users", require("./users"));
router.use("/recipes", require("./recipes"));
router.use("/comments", require("./comments"));
router.use("/categories", require("./categories"));
router.use("/reports", require("./reports"));
router.use("/activity-feed", require("./activity"));
router.use("/notifications", require("./notifications")); 
router.use("/contact", require("./contact"));
router.use("/activity", require("./activity"));

