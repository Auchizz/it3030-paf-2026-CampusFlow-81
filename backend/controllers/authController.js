const User = require("../models/User");
const { createToken } = require("../utils/token");

const sendAuthResponse = (res, status, message, user) =>
  res.status(status).json({
    success: true,
    message,
    data: {
      token: createToken(user),
      user: user.toSafeObject(),
    },
  });

const validateAuthInput = ({ fullName, email, password }, requireName = false) => {
  const errors = [];

  if (requireName && (!fullName || !fullName.trim())) {
    errors.push("Full name is required");
  }

  if (!email || !email.trim()) {
    errors.push("Email is required");
  }

  if (!password || password.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  return errors;
};

const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const errors = validateAuthInput(req.body, true);

    if (errors.length) {
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email is already registered" });
    }

    const user = new User({
      fullName,
      email,
      role: "USER",
    });
    user.setPassword(password);
    await user.save();

    return sendAuthResponse(res, 201, "Account created successfully", user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const errors = validateAuthInput(req.body);

    if (errors.length) {
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select("+passwordHash +passwordSalt");

    if (!user || !user.comparePassword(password)) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    return sendAuthResponse(res, 200, "Login successful", user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const me = async (req, res) =>
  res.status(200).json({
    success: true,
    data: req.user.toSafeObject(),
  });

const createAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const errors = validateAuthInput(req.body, true);

    if (errors.length) {
      return res.status(400).json({ success: false, message: "Validation failed", errors });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email is already registered" });
    }

    const admin = new User({
      fullName,
      email,
      role: "ADMIN",
    });
    admin.setPassword(password);
    await admin.save();

    return res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      data: admin.toSafeObject(),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  register,
  login,
  me,
  createAdmin,
};
