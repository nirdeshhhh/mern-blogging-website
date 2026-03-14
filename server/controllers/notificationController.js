import Notification from "../models/Notification.js";
import User from "../models/User.js";

export const getNotifications = async (req, res) => {
  try {

    const userId = req.user;

    const notifications = await Notification.find({
      notification_for: userId
    })
      .populate("user", "personal_info.username personal_info.profile_img")
      .populate("blog", "blog_id title")
      .sort({ createdAt: -1 });

    res.status(200).json({ notifications });

  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
};