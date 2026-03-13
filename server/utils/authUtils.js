import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import User from "../models/User.js";

export const formatDataToSend = (user) => {
  const access_token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname
  };
};

export const generateUsername = async (email) => {
  let username = email.split("@")[0];

  let isUsernameNotUnique = await User.exists({
    "personal_info.username": username
  });

  return isUsernameNotUnique
    ? username + nanoid().substring(0, 5)
    : username;
};