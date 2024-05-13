const express = require("express");
const router = express.Router();
const { createBet, getAllBet } = require("../controllers/bettips");
const upload = require("../multer");
const auth = require("../middleware/AUT");

router.post("/create", upload.single("file"), auth, createBet);
router.get("/get", getAllBet);

module.exports = router;