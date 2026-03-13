import Comment from "../models/Comment.js";
import Blog from "../models/Blog.js";
import Notification from "../models/Notification.js";



export const addComment = async (req, res) => {

  try {

    let user_id = req.user;

    let { _id, comment, blog_author } = req.body;

    if (!comment.length) {
      return res.status(403).json({ err: 'Write something to leave a comment' });
    }

    const commentObj = new Comment({
      blog_id: _id,
      blog_author,
      comment,
      commented_by: user_id
    });

    const commentFile = await commentObj.save();

    const { commentedAt, children } = commentFile;

    await Blog.findOneAndUpdate(
      { _id },
      {
        $push: { comments: commentFile._id },
        $inc: {
          "activity.total_comments": 1,
          "activity.total_parent_comments": 1
        }
      }
    );

    if (String(user_id) !== String(blog_author)) {

      const notificationObj = {
        type: "comment",
        blog: _id,
        notification_for: blog_author,
        user: user_id,
        comment: commentFile._id
      };

      await new Notification(notificationObj).save();

    }

    return res.status(200).json({
      comment: commentFile.comment,
      commentedAt,
      _id: commentFile._id,
      user_id,
      children
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      err: 'Something went wrong while adding comment'
    });

  }

};




export const getBlogComments = async (req, res) => {

  try {

    const { blog_id, skip = 0 } = req.body;

    if (!blog_id) {
      return res.status(400).json({ error: "Blog ID is required" });
    }

    const maxLimit = 5;

    const comments = await Comment.find({
      blog_id: blog_id,
      isReply: false
    })
      .populate(
        "commented_by",
        "personal_info.username personal_info.fullname personal_info.profile_img"
      )
      .skip(skip)
      .limit(maxLimit)
      .sort({ commentedAt: -1 });

    return res.status(200).json(comments);

  } catch (err) {

    console.error("Error fetching comments:", err.message);

    return res.status(500).json({
      error: "Failed to fetch comments"
    });

  }

};