const express = require("express");
const router = express.Router();
const { User, Data } = require("./model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const { authSchema } = require("./validate");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. Token is missing." });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Check if the token is expired
    const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
    if (decoded.exp < now) {
      return res.status(401).json({ message: "Token has expired." });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token." });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired." });
    }
    return res.status(500).json({ message: "Token validation failed." });
  }
};


router.get("/read", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
    console.log("read");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/auser", async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    if (!req.body) {
      return res.status(400).json({ message: "Missing request body" });
    }

    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Username or email already exists" });
    }

    const { school, classs, type, fullname } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const savedUser = await User.create({
      username,
      school,
      email,
      password: hashedPassword,
      classs,
      type,
      fullname,
    });

    res.status(201).json(savedUser);
  } catch (err) {
    console.log(err.message);
    res.status(400).json({ message: err.message });
  }
});

const checkAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

router.delete("/delete/:id", authenticate, checkAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

const transporter = nodemailer.createTransport({
  host: "mail.openjavascript.info",
  port: 465,
  secure: true,
  service: "gmail",
  auth: {
    user: "connecteddotcom1@gmail.com",
    pass: process.env.EMAIL_PASSWORD,
  },
});

let otpMap = {};

router.post("/send-otp", async (req, res) => {
  try {
    const email = req.body.email;
    const otp = generateOTP();
    otpMap[email] = otp;
    console.log(otpMap);
    await sendEmail(otp, email);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Failed to send OTP" });
  }
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000); // Generates 6-digit OTP
};

router.post("/verify-otp", async (req, res) => {
  try {
    const { token, enteredOTP } = req.body;
    
    // Ensure token and OTP are present
    if (!token || !enteredOTP) {
      return res
        .status(400)
        .json({ success: false, message: "Missing token or OTP." });
    }

    const storedOTP = otpMap[token];

    // Handle case where OTP is not found or doesn't match
    if (!storedOTP) {
      return res
        .status(400)
        .json({ success: false, message: "OTP not found or expired." });
    }

    if (enteredOTP !== storedOTP) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect OTP." });
    }

    // OTP verification success - proceed and clean up
    delete otpMap[token];

    res.json({ success: true, message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Failed to verify OTP." });
  }
});

const sendEmail = async (otp, email) => {
  const html = `
    <h1>OTP Verification</h1>
    <p>${otp}</p>
  `;

  try {
    await transporter.sendMail({
      from: "support@connecteddotcom1@gmail.com",
      to: email,
      subject: "OTP for Login",
      html: html,
    });
    console.log("Email sent:", email);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // Generate token and include user details in the response
    const token = jwt.sign({ username: user.username }, process.env.SECRET_KEY, {
      expiresIn: "1h",
    });

    res.status(200).json({ message: "Login Successful", token, user: { username: user.username, email: user.email } });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post("/upload", async (req, res) => {
  try {
    const { user, classs, message, imglink, school } = req.body;
    const savedData = await Data.create({
      user,
      message,
      imglink,
      school,
      classs,
    });

    res.status(201).json(savedData);
  } catch (err) {
    console.error(err.message);
    res.status(400).json({ message: err.message });
  }
});

router.get("/display", async (req, res) => {
  try {
    const datas = await Data.find();
    res.json(datas);
    console.log("data sent");
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/post/:id", authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;
  try {
    const updatedPost = await Data.findByIdAndUpdate(id, { title, content }, { new: true });
    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found." });
    }
    res.status(200).json({ message: "Post updated successfully.", updatedPost });
  } catch (error) {
    res.status(500).json({ message: "Error updating post." });
  }
});

module.exports = router;
