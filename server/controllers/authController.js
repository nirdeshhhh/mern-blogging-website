import bcrypt from "bcryptjs";
import User from "../models/User.js";
import { formatDataToSend, generateUsername } from "../utils/authUtils.js";



export const signup = async (req, res) => {
  try {
    let { fullname, email, password } = req.body;

    if (!fullname || fullname.length < 3)
      return res.status(400).json({ error: "Fullname must be at least 3 characters long" });

    if (!email || !email.match(/^[\w.-]+@[\w.-]+\.\w+$/))
      return res.status(400).json({ error: "Please enter a valid email address" });

    if (!password || !password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/))
      return res.status(400).json({ error: "Password must be 6-20 characters with uppercase, lowercase, and number" });

    const hashed_password = await bcrypt.hash(password, 10);
    const username = await generateUsername(email);

    const user = new User({
      personal_info: { fullname, email, password: hashed_password, username }
    });

    const savedUser = await user.save();

    return res.status(201).json(formatDataToSend(savedUser));

  } catch (err) {

    if (err.code === 11000) {
      return res.status(400).json({ error: "Email already exists" });
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};



export const signin = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ "personal_info.email": email });

    if (!user) {
      return res.status(403).json({ error: "Email not found" });
    }

    const isMatch = await bcrypt.compare(password, user.personal_info.password);

    if (!isMatch) {
      return res.status(403).json({ error: "Incorrect password" });
    }

    return res.status(200).json(formatDataToSend(user));

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};