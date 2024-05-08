const express = require("express");
const router = express.Router();
const { createAdmin, loginAdmin, persistLogin, logoutAdmin } = require("../controllers/admin");


router.post('/registeradm', createAdmin);
router.post('/loginadmin', loginAdmin);
router.get('/persistlogin', persistLogin);
router.post('/logoutadmin', logoutAdmin);


module.exports = router