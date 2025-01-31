
const router = require("express").Router();
const aythCtrl  = require("./auth.controller");
const authMiddleware = require("../middleware/authMiddleware");
router.post('/signup', aythCtrl.signup);
router.post('/login',aythCtrl.login);
router.get('/verify-email/:token',authMiddleware, aythCtrl.verifyEmail);

module.exports = router;