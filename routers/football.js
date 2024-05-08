const express = require("express");
const router = express.Router();
const auth = require("../middleware/AUT");
const upload = require("../multer");

const {
    createFootball,
    getAllFootball,
    getSingleFootball,
    adminDeleteFootball,
    adminUpdateFootball,
    getAllFootballNews,
    getAllFootballEPL,
    getAllFootballLaliga,
    getAllFootballUCL,
    getAllFootballBundesliga,
    NPFL,
    ItalianSirieA,
    generalSearch
} = require("../controllers/football");

router.post("/create", auth, upload.array("file"), createFootball);
router.get("/allfootball", getAllFootball);
router.get("/allfootball/:footballID", getSingleFootball);
router.delete("/allfootball/:footballID", auth, adminDeleteFootball);
router.patch("/allfootball/:footballID", upload.array("file"), auth, adminUpdateFootball);

router.get("/news", getAllFootballNews);
router.get('/epl', getAllFootballEPL);
router.get('/laliga', getAllFootballLaliga);
router.get("/ucl", getAllFootballUCL);
router.get('/bundesliga', getAllFootballBundesliga);
router.get('/npfl', NPFL);
router.get("/seriea", ItalianSirieA);
router.get('/search', generalSearch);

module.exports = router