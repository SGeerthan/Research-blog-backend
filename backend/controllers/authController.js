const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// @desc Register Admin
exports.register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    // Validate required fields
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET environment variable is missing");
      return res.status(500).json({ message: "Server configuration error" });
    }

    // Check if SERVER_URL is configured
    if (!process.env.SERVER_URL) {
      console.error("❌ SERVER_URL environment variable is missing");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashed });

    // Create verification token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    const verifyUrl = `${process.env.SERVER_URL}/api/auth/verify/${token}`;
    console.log("🔗 Verification URL:", verifyUrl);

    try {
      await sendEmail(
        email,
        "Verify your account",
        `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h3 style="color: #444;">Email Verification</h3>
            <p>Please click the button below to verify your email address:</p>
            <a href="${verifyUrl}" target="_blank"
              style="
                display: inline-block;
                padding: 10px 20px;
                margin-top: 10px;
                background-color: #4CAF50;
                color: white;
                text-decoration: none;
                font-weight: bold;
                border-radius: 5px;
              ">
              Verify Email
            </a>
            <p style="margin-top:20px; font-size: 12px; color: #777;">
              If the button above doesn't work, copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; color: #555;">
              ${verifyUrl}
            </p>
          </div>
        `
      );
      
      res.json({ message: "Registration successful, check email to verify" });
    } catch (emailError) {
      console.error("❌ Email sending failed:", emailError.message);
      // Still return success but mention email issue
      res.json({ 
        message: "Registration successful, but email verification failed. Please contact support.",
        verificationUrl: verifyUrl // Include the URL for manual verification
      });
    }
  } catch (error) {
    console.error("❌ Registration error:", error.message);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

// @desc Verify Email
exports.verifyEmail = async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: "Invalid token" });

    user.isVerified = true;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

// @desc Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  if (!user.isVerified) {
    return res.status(400).json({ message: "Please verify your email first" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid password" });

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ token });
};

// @desc Forgot Password (send reset link)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "User not found" });

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
 await sendEmail(
  email,
  "Password Reset",
  `
    <div style="font-family: Arial, sans-serif; color: #333;">
      <h3 style="color: #444;">Password Reset Request</h3>
      <p>We received a request to reset your password. Click the button below to proceed:</p>
      
      <a href="${resetUrl}" target="_blank"
        style="
          display: inline-block;
          padding: 10px 20px;
          margin-top: 10px;
          background-color: #007BFF;
          color: white;
          text-decoration: none;
          font-weight: bold;
          border-radius: 5px;
        ">
        Reset Password
      </a>

      <p style="margin-top:20px; font-size: 12px; color: #777;">
        If you did not request a password reset, you can safely ignore this email.
      </p>

      <p style="margin-top:20px; font-size: 12px; color: #777;">
        If the button above doesn't work, copy and paste this link into your browser:
      </p>
      <p style="word-break: break-all; color: #555;">
        ${resetUrl}
      </p>
    </div>
  `
);

  res.json({ message: "Password reset email sent" });
};

// @desc Reset Password
exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword)
    return res.status(400).json({ message: "Passwords do not match" });

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user)
    return res.status(400).json({ message: "Invalid or expired token" });

  user.password = await bcrypt.hash(password, 10);
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
};
