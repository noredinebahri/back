// controllers/authController.js

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { User, Driver, Vehicle } = require('../../booking/booking.model');
const nodemailer = require('nodemailer');
require('dotenv').config();

/**
 * Generate JWT token
 * @param {Object} user - User data for token payload
 * @returns {String} JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      user_id: user.user_id,
      email: user.email,
      user_type: user.user_type
    },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
};

/**
 * Sign up new user with email verification
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.signup = async (req, res) => {
  try {
    const { first_name, last_name, email, password, currency, language } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email et mot de passe requis." });
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé." });
    }

    // Générer un identifiant unique
    const user_id = uuidv4();
    // crypt the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création de l'utilisateur
    const newUser = await User.create({
      user_id,
      first_name,
      last_name,
      email,
      password_hash: hashedPassword,
      currency,
      language,
      user_type: 'CUSTOMER'
    });
    
    const verificationToken = jwt.sign(
      { user_id: newUser.user_id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }  // Expire dans 1 jour
    );
    
    const verificationUrl = `http://localhost:4200/verify/${verificationToken}`;

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: `${process.env.PASSGMAIL}`
      }
    });
    
    let mailOptions = {
      from: process.env.EMAIL,
      to: newUser.email,
      subject: 'Verify Your Email',
      text: `Please click on the following link to verify your email: ${verificationUrl}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) console.log(error);
      else console.log('Email sent: ' + info.response);
    });
    
    res.status(201).json({ message: "Utilisateur créé avec succès." });
  } catch (error) {
    console.error('Error signing up user:', error);
    res.status(500).json({ message: "Erreur serveur: " + error.message, error });
  }
};

/**
 * Login user
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Identifiants invalides." });

    // Vérifier le mot de passe
    const isMatch = await user.validPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Identifiants invalides." });

    // Générer un JWT sécurisé
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, user_type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    
    // Créer une copie de l'utilisateur sans le mot de passe
    const userResponse = { ...user.get() };
    delete userResponse.password_hash;
    
    res.status(200).json({ token, user: userResponse });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: "Erreur serveur: " + error.message, error });
  }
};

/**
 * Verify email with token
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const userWasVerified = await User.findOne({ 
      where: { user_id: decoded.user_id } 
    });
    
    if (!userWasVerified) {
      return res.status(404).json({ verify: false, already: false, message: "Utilisateur non trouvé." });
    }
    
    if (userWasVerified.is_verified === true) {
      return res.status(400).json({ verify: false, already: true, message: "Email déjà vérifié." });
    }
    
    const updatedUser = await User.update(
      { is_verified: true }, 
      { where: { user_id: decoded.user_id } }
    );
    
    if (updatedUser[0] > 0) {
      res.status(200).json({ verify: true, already: false, message: "Email vérifié avec succès." });
    } else {
      res.status(404).json({ verify: false, already: false, message: "Mise à jour échouée." });
    }
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Verification failed: ' + error.message });
  }
};

/**
 * Register a new driver
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.registerDriver = async (req, res) => {
  try {
    const { 
      first_name, 
      last_name, 
      email, 
      phone_number, 
      password, 
      license_number,
      id_number
    } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email déjà utilisé." });
    }

    // Vérifier si le numéro de téléphone existe déjà
    const existingPhone = await User.findOne({ where: { phone_number } });
    if (existingPhone) {
      return res.status(400).json({ message: "Numéro de téléphone déjà utilisé." });
    }

    // Créer un nouvel utilisateur avec le type DRIVER
    const user_id = uuidv4();

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      user_id,
      first_name,
      last_name,
      email,
      phone_number,
      password_hash: hashedPassword,
      user_type: 'DRIVER'
    });

    // Créer une entrée dans la table Driver
    const driver_id = user_id;  // Utiliser le même ID que l'utilisateur
    
    await Driver.create({
      driver_id,
      full_name: `${first_name} ${last_name}`,
      email,
      phone_number,
      is_available: true,
      // Ajouter d'autres informations du chauffeur si nécessaire
    });

    res.status(201).json({
      success: true,
      message: "Chauffeur enregistré avec succès",
      data: {
        driver_id,
        first_name,
        last_name,
        email,
        phone_number
      }
    });
  } catch (error) {
    console.error('Error registering driver:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de l'enregistrement du chauffeur",
      error: error.message
    });
  }
};

/**
 * Get current user profile
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.user_id;
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    
    // Si l'utilisateur est un chauffeur, récupérer les informations supplémentaires
    if (user.user_type === 'DRIVER') {
      const driver = await Driver.findByPk(userId);
      const vehicles = await Vehicle.findAll({ where: { driver_id: userId } });
      
      return res.status(200).json({
        success: true,
        data: {
          user,
          driver,
          vehicles
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la récupération du profil utilisateur",
      error: error.message
    });
  }
};

/**
 * Update user profile
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const { 
      first_name, 
      last_name, 
      phone_number,
      profile_image_url,
      currency,
      language
    } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    
    // Mettre à jour l'utilisateur
    const updatedFields = {};
    
    if (first_name) updatedFields.first_name = first_name;
    if (last_name) updatedFields.last_name = last_name;
    if (phone_number) updatedFields.phone_number = phone_number;
    if (profile_image_url) updatedFields.profile_image_url = profile_image_url;
    if (currency) updatedFields.currency = currency;
    if (language) updatedFields.language = language;
    
    await User.update(updatedFields, { where: { user_id: userId } });
    
    // Si l'utilisateur est un chauffeur, mettre à jour également la table Driver
    if (user.user_type === 'DRIVER' && (first_name || last_name || phone_number)) {
      const driverFields = {};
      
      if (first_name || last_name) {
        driverFields.full_name = `${first_name || user.first_name} ${last_name || user.last_name}`;
      }
      
      if (phone_number) driverFields.phone_number = phone_number;
      
      await Driver.update(driverFields, { where: { driver_id: userId } });
    }
    
    // Récupérer l'utilisateur mis à jour
    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password_hash'] }
    });
    
    res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès",
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la mise à jour du profil",
      error: error.message
    });
  }
};

/**
 * Request password reset
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Ne pas révéler que l'utilisateur n'existe pas pour des raisons de sécurité
      return res.status(200).json({ message: "Si votre email existe dans notre base de données, vous recevrez un lien de réinitialisation." });
    }
    
    // Générer un token de réinitialisation
    const resetToken = jwt.sign(
      { user_id: user.user_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }  // Expire dans 1 heure
    );
    
    const resetUrl = `http://localhost:4200/reset-password/${resetToken}`;
    
    // Envoyer l'email de réinitialisation
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSGMAIL
      }
    });
    
    let mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: 'Réinitialisation de mot de passe',
      text: `Veuillez cliquer sur le lien suivant pour réinitialiser votre mot de passe: ${resetUrl}`
    };
    
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) console.log(error);
      else console.log('Email sent: ' + info.response);
    });
    
    res.status(200).json({ message: "Si votre email existe dans notre base de données, vous recevrez un lien de réinitialisation." });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la demande de réinitialisation du mot de passe",
      error: error.message
    });
  }
};

/**
 * Reset password with token
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    
    if (!token || !password) {
      return res.status(400).json({ message: "Token et nouveau mot de passe requis." });
    }
    
    // Vérifier le token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(400).json({ message: "Token invalide ou expiré." });
    }
    
    // Vérifier si l'utilisateur existe
    const user = await User.findByPk(decoded.user_id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    
    // Mettre à jour le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);
    
    await User.update(
      { password_hash: hashedPassword },
      { where: { user_id: decoded.user_id } }
    );
    
    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors de la réinitialisation du mot de passe",
      error: error.message
    });
  }
};

/**
 * Refresh JWT token
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 */
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token requis." });
    }
    
    // Vérifier le refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      return res.status(400).json({ message: "Refresh token invalide ou expiré." });
    }
    
    // Vérifier si l'utilisateur existe
    const user = await User.findByPk(decoded.user_id);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    
    // Générer un nouveau token d'accès
    const newAccessToken = generateToken(user);
    
    res.status(200).json({ token: newAccessToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({
      success: false,
      message: "Erreur lors du rafraîchissement du token",
      error: error.message
    });
  }
};