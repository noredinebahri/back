
const router = require("express").Router();
const {login, signUp, updateInfoTeacher,getTeacher, refreshToken, forgetPassword} = require("./auth.controller");
const middleware2 = require("../../../shared/check-jwt.middlware");
const middleware = require('./auth.middlware')
router.post('/signup', signUp);

// Route for login
router.post('/login',middleware.withDatabaseConnection ,login);
router.post('/signup', signUp);
router.put('/updateInfosTeacher/:id',middleware2.checkJwtAndExpired,  updateInfoTeacher);
router.get('/getTeacher/:userId',middleware2.checkJwtAndExpired, getTeacher);
router.post('/forgetPassword',middleware.withDatabaseConnection, forgetPassword);
router.post('/refresh-token', refreshToken)
module.exports = router;
