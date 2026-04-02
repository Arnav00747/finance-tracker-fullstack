const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");


// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({ msg: "All fields required ❌" });
    }

    // check existing user
    const exist = await User.findOne({ email });
    if (exist) {
      return res.status(400).json({ msg: "User already exists ❌" });
    }

    // hash password 🔐
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = new User({
      email,
      password: hashedPassword,
      role: role || "viewer" // default role
    });

    await user.save();

    res.json({ msg: "Registered successfully ✅" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error ❌" });
  }
};



// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // validation
    if (!email || !password) {
      return res.status(400).json({ msg: "All fields required ❌" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ msg: "User not found ❌" });
    }

    // compare password 🔐
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ msg: "Wrong password ❌" });
    }

    // create token (🔥 ROLE INCLUDED)
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error ❌" });
  }
};