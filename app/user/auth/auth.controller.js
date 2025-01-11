const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator"); // Use express-validator for input validation
const User = require("./auth.model");
const nodemailer = require('nodemailer');
// generate a secret code
const SECRET_KEY3 = 'ljksqdsdfgklsdjgkljskdfg2sdfg@df45fd4g'
require("dotenv").config();
const roles = {
  USER: "user",
  ADMIN: "admin",
};

exports.updateInfoTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstname, lastname, email, phone, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const updatedUser = await User.update(
      { firstname, lastname, email, phone, password: hashedPassword },
      { where: { id } }
    );

    res.json({ message: 'Profile updated successfully!', data: updatedUser });
  } catch (error) {
    res.status(500).send(error.message);
  }
}
exports.getTeacher = async (req, res) => {
  try {
    const data = await User.findOne({ where: { id: +req.params.userId } })
    res.status(200).json({ Teacher: data })
  } catch (error) {
    res.status(404).json({ error: error.message })
  }
}
// Sign-up
exports.signUp = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstname, lastname, email, password } = req.body;
    // Check if email is already registered
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user
    req.body.password = hashedPassword
    const newUser = await User.create(req.body);
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: error });
  }
}

exports.login = async (req, res) => {
  try {
    const { emailsec, password } = req.body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (!emailsec && !password) {
      return res.status(404).json({ errors: { message: 'email or password is required' } });
    } else {
      // Find the user by email
      const user = await User.findOne({ where: { emailsec } });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (user.rejected === 1) {
        return res.status(401).json({ message: "NOT AUTHORIZED" });
      }


      // Compare passwords
      const passwordMatch = await bcrypt.compare(password, user.password);
      console.log(passwordMatch);
      if (!passwordMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      if (user.actif === 0 || user.rejected === 1) {
        return res.status(401).json({ message: "you are rejected in our system" });
      }

      // Create a new object excluding the password field
      const userWithoutPassword = Object.assign({}, user.get(), {
        password: undefined,
      });

      // Generate JWT token with user data


      const token = jwt.sign({ user: userWithoutPassword }, SECRET_KEY3, {
        expiresIn: "1296000s",
      });
      res.status(200).json({ token });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}
async function sendEmail(userEmail, newPassword) {
  // const emailDomain = userEmail.split('@')[1].toLowerCase();
  let transporter;
    transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: 'baritof@gmail.com', // your email
        pass: "chqk rdyv bbgu ggul" // your email password
      }
    });


  let mailOptions = {
    from: 'baritof@gmail.com', // Adjust based on the email domain
    to: userEmail,
    subject: 'New Password',
    html: `<html>
    <body style="font-family: Arial, sans-serif; color: #333; background-color: #f4f4f4; padding: 20px;">
      <table style="max-width: 600px; margin: auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <tr>
          <td style="text-align: center; padding-bottom: 20px;">
            <h2 style="color: #4CAF50;">Password Reset</h2>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px;">
            <p style="font-size: 16px;">Hello,</p>
            <p style="font-size: 16px;">You requested to reset your password. Your new password is:</p>
            <p style="font-size: 18px; font-weight: bold; color: #4CAF50; padding: 2%; background: #F4F4F4; border: 1px solid #ececec; text-align: center">${newPassword}</p>
            <p style="font-size: 14px; text-align: center; color: #999;">Select the password above to copy it to your clipboard.</p>

            <p style="font-size: 16px;">Please keep this password secure and change it after logging in.</p>
            <p style="font-size: 16px;">If you didn't request a password reset, please contact our support immediately.</p>
            <p style="font-size: 16px;">Thank you,</p>
            <p style="font-size: 16px; font-weight: bold;">The Support Team</p>
          </td>
        </tr>
        <tr>
          <td style="text-align: center; padding-top: 20px;">
            <p style="font-size: 12px; color: #999;">&copy; 2024 Center Oxygen. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </body>
  </html>`
  };

  try {
    let info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Problem sending email: ' + error);
    throw error;
  }
}
exports.forgetPassword = async (req, res) => {
  try {
    const { emailsec, tel } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    if (!emailsec && !tel) {
      return res.status(404).json({ errors: { message: 'email is required' } });
    } else {
      // Find the user by email
      const user = await User.findOne({ where: { emailsec,  phone: tel } });
      if (!user) {
        return res.status(401).json({ message: "Invalid Email or Phone not valid" });
      }
      if (user.rejected === 1) {
        return res.status(401).json({ message: "NOT AUTHORIZED" });
      }
      const password = Math.random().toString(36).slice(-12);
      console.log(emailsec, password);
      sendEmail(emailsec, password);
      const hashedPassword = await bcrypt.hash(password, 10);
      console.log(hashedPassword);
      await User.update({ password: hashedPassword }, { where: { emailsec } })
      res.status(200).json({ message: 'password updated successfully' })
    }
  } catch (e) {
    console.error(e);
  }
}
exports.refreshToken = async (req, res) => {
  try {
    const oldToken = req.body.token;
 

    // Verify the old token
    jwt.verify(oldToken, SECRET_KEY3, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token" });
      }

      const userId = decoded.user.id; // Extract user ID from the old token
      // Check if the user still exists in the database
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      const userWithoutPassword = { ...decoded.user };
      delete userWithoutPassword.password;

      const newToken = jwt.sign({ user: userWithoutPassword }, SECRET_KEY3, {
        expiresIn: "1800s",
      });
      res.status(200).json({ token: newToken });
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
}
