const express = require("express");
const router = express.Router();
const { User, Data } = require("./model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const { authSchema } = require("./validate");

const authenticate = (req, res, next) => {
  const token = req.headers.authorization;

  // Check if token is present or not
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. Token is missing." });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    req.user = decoded; // Store decoded user information in the request object
    next(); // Proceed to the next middleware
  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
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

router.delete("/delete/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

const transporter = nodemailer.createTransport({
  host: "mail.openjavascript.info",
  port: 465,
  secure: true,
  service: "gmail",
  auth: {
    user: "connecteddotcom1@gmail.com",
    pass: "hzkawdxhmyfdbble",
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
  return Math.floor(Math.random() * 9000) + 1000;
};

router.post("/verify-otp", async (req, res) => {
  console.log("mugilan");
  try {
    const { token, enteredOTP } = req.body;
    console.log("emaisl", token, "otp", enteredOTP);
    if (!token || !enteredOTP) {
      console.log("erra");
      return res
        .status(400)
        .json({ success: false, message: "Invalid request" });
    }

    const storedOTP = otpMap[token];
    console.log("otpo", otpMap);
    console.log("stored", storedOTP);
    if (enteredOTP != storedOTP) {
      console.log(true);
      return res
        .status(400)
        .json({
          success: false,
          message: "Incorrect OTP Please enter the valid OTP",
        });
    }

    delete otpMap[token];

    res.json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ success: false, message: "Failed to verify OTP" });
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
    console.log("hi");
    const { username, password } = req.body;
    const result = await authSchema.validateAsync(req.body);
    console.log(result);
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }
    const token = jwt.sign(
      { username: user.username },
      process.env.SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    res.status(200).json({ message: "Login Successful" });
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

module.exports = router;
