import User from "../models/User.js";
import Hospital from "../models/Hospital.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* ================= SIGNUP ================= */

export const signup = async (req, res) => {
  try {

    const {
      name,
      email,
      password,
      role,
      phone,

      hospitalName,
      licenseNumber,
      location,
      contact
    } = req.body;

    /* VALIDATION */
    if (!name || !email || !password || !role || !phone) {
      return res.status(400).json({ msg: "All fields are required" });
    }

    if (phone.length !== 10) {
      return res.status(400).json({ msg: "Invalid phone number" });
    }

    if (role === "hospital" && (!hospitalName || !licenseNumber)) {
      return res.status(400).json({
        msg: "Hospital name and license required"
      });
    }

    /* CHECK USER */
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "User already exists" });
    }

    /* CHECK LICENSE */
    if (role === "hospital") {
      const existingHospital = await Hospital.findOne({ licenseNumber });
      if (existingHospital) {
        return res.status(400).json({
          msg: "Hospital with this license already exists"
        });
      }
    }

    /* HASH PASSWORD */
    const hashedPassword = await bcrypt.hash(password, 10);

    /* CREATE USER */
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone
    });

    /* 🏥 CREATE BASIC HOSPITAL */
    let hospital = null;

    if (role === "hospital") {
      hospital = await Hospital.create({
        userId: user._id,
        name: hospitalName,
        licenseNumber,
        location: location || "",
        contact: contact || "",
        isVerified: false,
        profileCompleted: false
      });
    }

    /* 🔥 GENERATE TOKEN (IMPORTANT ADD) */
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(201).json({
      msg: "Signup successful",
      token, // 🔥 VERY IMPORTANT
      user,
      hospital
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};


/* ================= LOGIN ================= */

export const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ msg: "All fields required" });
    }

    /* FIND USER */
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: "User not found" });
    }

    /* CHECK PASSWORD */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    /* 🔥 TOKEN */
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      msg: "Login successful",
      token,
      user
    });

  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
};