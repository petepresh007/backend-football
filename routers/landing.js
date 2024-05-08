const express = require("express");
const router = express.Router();
const auth = require("../middleware/AUT");
const { createLanding, getAllWriteUp } = require("../controllers/landing");
const upload = require("../multer")


router.post("/create", auth, upload.single("file"), createLanding);
router.get("/all", getAllWriteUp);

module.exports = router