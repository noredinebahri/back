const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./auth.model");
const nodemailer = require('nodemailer');

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

    // Création de l'utilisateur
    const newUser = await User.create({
      first_name,
      last_name,
      email,
      password_hash: password,
      currency,
      language,
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
      console.log('Email sent: ' + info.response);
    });
    res.status(201).json({ message: "Utilisateur créé avec succès." });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" + error, error });
  }
}
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
      { expiresIn: "1h" }
    );
    delete user['password_hash'];
    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" + error, error });
  }
}
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userWasVerified = await User.findOne({ where: { user_id: decoded.user_id } }
    );
    console.log(userWasVerified.is_verified);
    if (userWasVerified.is_verified === true) {
      return res.status(400).json({ verify: false, already: true, message: "Email déjà vérifié." });
    } else {
      const user = await User.update({ is_verified: 1 }, {
        where: {
          user_id: decoded.user_id
        }
      });
      if (user) {
        res.status(200).json({ verify: true,already: true, message: "Email vérifié avec succès." });
      } else {
        res.status(404).json({ verify: false, already: false, message: "Utilisateur non trouvé." });
      }
    }

  } catch (error) {
    res.status(500).json('Verification failed : ' + error);
  }
}