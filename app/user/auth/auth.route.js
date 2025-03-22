
const router = require("express").Router();
const authCtrl = require('./auth.controller'); // Ensure this path is correct
const authMiddleware = require("../middleware/authMiddleware");

/**
 * @route   POST /api/auth/signup
 * @desc    Register a new user with email verification
 * @access  Public
 */
router.post('/signup', authCtrl.signup);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get token
 * @access  Public
 */
router.post('/login', authCtrl.login);

/**
 * @route   GET /api/auth/verify-email/:token
 * @desc    Verify user email with token
 * @access  Public
 */
router.get('/verify-email/:token', authCtrl.verifyEmail);

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Legacy)
 * @access  Public
 */
router.post('/register', authCtrl.signup);

/**
 * @route   POST /api/auth/register-driver
 * @desc    Register as a driver
 * @access  Public
 */
router.post('/register-driver', authCtrl.registerDriver);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authCtrl.getCurrentUser);

/**
 * @route   PUT /api/auth/update-profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/update-profile', authCtrl.updateProfile);

/**
 * @route   POST /api/auth/reset-password-request
 * @desc    Request password reset
 * @access  Public
 */
router.post('/reset-password', authCtrl.resetPassword);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh JWT token
 * @access  Public
 */
router.post('/refresh-token', authCtrl.refreshToken);


module.exports = router;