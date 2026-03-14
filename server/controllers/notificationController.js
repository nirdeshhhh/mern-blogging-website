import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {

    const userId = req.user; // from verifyJWT middleware

    const notifications = await Notification.find({
      notification_for: userId
    })
      .populate("user", "personal_info.username personal_info.profile_img")
      .populate("blog", "blog_id title")
      .populate("comment")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      notifications
    });

  } catch (error) {
    console.error("Error fetching notifications:", error);

    return res.status(500).json({
      error: "Failed to fetch notifications"
    });
  }
};