const express = require("express");
const router = express.Router();
const {
    registerUser,
    loginUser,
    blockUser,
    approveUser,
    stayLoggedIn,
    getSingleUser,
    logoutUser,
    updateProfilePics,
    getSingUserID,
    updateUsernamePassword,
    getActivatedUsers,
    getNotActivatedUsers,
    getAllUsers,
    deleteSingleUser
} = require("../controllers/user");

const { AUTHTWOUSER } = require("../middleware/AUT");
const AUTHTWO = require("../middleware/AUT");
const upload = require("../multer");


router.post("/registerUser", upload.single("file"), registerUser);
router.post("/loginUser", loginUser);
router.patch("/approve/:userID", AUTHTWO, approveUser);
router.patch("/blockUser/:userID", AUTHTWO, blockUser);
router.get("/stay_logged", stayLoggedIn);
router.get("/single_user/:userID", getSingleUser);
router.post("/logoutuser", logoutUser);
router.patch("/updateprofilepics", upload.single("file"), AUTHTWOUSER, updateProfilePics);
router.get("/singleuser", AUTHTWOUSER, getSingUserID)
router.patch("/password", AUTHTWOUSER, updateUsernamePassword);
router.get("/approveduser", AUTHTWO, getActivatedUsers)
router.get("/notapproved", AUTHTWO, getNotActivatedUsers)
router.get("/allusers", AUTHTWO, getAllUsers);
router.delete('/deleteuser/:userID', AUTHTWO, deleteSingleUser)

module.exports = router