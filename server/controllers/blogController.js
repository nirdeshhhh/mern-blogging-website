import Blog from "../models/Blog.js";
import User from "../models/User.js";
import { nanoid } from "nanoid";
import Notification from "../models/Notification.js";



export const searchBlogs = async (req, res) => {

  let { tag, query, page = 1, limit, eliminate_blog, author } = req.body;

  let findQuery = { draft: false };

  if (tag) {
    findQuery.tags = { $in: [tag] };
  }

  if (query) {
    findQuery.$or = [
      { title: new RegExp(query, 'i') },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ];
  }

  if (author) {
    findQuery.author = author;
  }

  if (eliminate_blog) {
    findQuery.blog_id = { $ne: eliminate_blog };
  }

  let maxLimit = limit ? parseInt(limit) : 2;

  try {

    const blogs = await Blog.find(findQuery)
      .skip((page - 1) * maxLimit)
      .limit(maxLimit)
      .populate(
        "author",
        "personal_info.profile_img personal_info.username personal_info.fullname -_id"
      )
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt -_id");

    const totalCount = await Blog.countDocuments(findQuery);

    return res.status(200).json({ blogs, totalCount });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }

};



export const searchBlogsCount = (req, res) => {

  let { tag, query, author } = req.body;

  let findQuery;
  
  if(tag){
      findQuery = { tags: tag, draft: false };
  } 
  else if(query){
      findQuery = { draft: false, title: new RegExp(query, 'i') };
  } 
  else if(author){
      findQuery = { author, draft: false };
  }

  Blog.countDocuments(findQuery)
    .then(count => res.status(200).json({ totalDocs: count }))
    .catch(err => res.status(500).json({ error: err.message }));

};



export const latestBlogs = (req, res) => {

  let { page } = req.body;

  let maxLimit = 10;

  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({ publishedAt: -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page - 1) * maxLimit)
    .limit(maxLimit)
    .then(blogs => {
      return res.status(200).json({ blogs });
    })
    .catch(err => {
      return res.status(500).json({ error: err.message });
    });

};



export const trendingBlogs = (req, res) => {

  Blog.find({ draft: false })
    .populate(
      "author",
      "personal_info.profile_img personal_info.username personal_info.fullname -_id"
    )
    .sort({ "activity.total_read": -1, "activity.total_likes": -1, "publishedAt": -1 })
    .select("blog_id title publishedAt -_id")
    .limit(5)
    .then(blogs => {
      return res.status(200).json({ blogs });
    })
    .catch(err => {
      return res.status(500).json({ error: err.message });
    });

};


export const allLatestBlogsCount = async (req, res) => {
  try {

    const count = await Blog.countDocuments({ draft: false });

    res.status(200).json({ totalDocs: count });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }
};




export const createBlog = (req, res) => {

  let authorId = req.user;

  let { title, des, banner, tags, content, draft, id } = req.body;

  if (!title.length) {
    return res.status(403).json({ error: "You must provide a title" });
  }

  if (!draft) {

    if (!des.length || des.length > 200) {
      return res.status(403).json({
        error: "You must provide blog description under 200 characters"
      });
    }

    if (!banner.length) {
      return res.status(403).json({
        error: "You must provide blog banner to publish it"
      });
    }

    if (!content.blocks.length) {
      return res.status(403).json({
        error: "There must be some blog content to publish it"
      });
    }

    if (!tags.length || tags.length > 10) {
      return res.status(403).json({
        error: "Provide tags in order to publish the blog, Maximum 10"
      });
    }

  }

  tags = tags.map(tag => tag.toLowerCase());

  let blog_id =
    id ||
    title.replace(/[^a-zA-Z0-9]/g, ' ')
         .replace(/\s+/g, "-")
         .trim() + nanoid();

  if (id) {

    Blog.findOneAndUpdate(
      { blog_id },
      { title, des, banner, content, tags, draft: draft ? draft : false }
    )
      .then(blog => {
        return res.status(200).json({ id: blog_id });
      })
      .catch(err => {
        return res.status(500).json({ error: "Failed to update blog" });
      });

  } else {

    let blog = new Blog({
      title,
      des,
      banner,
      content,
      tags,
      author: authorId,
      blog_id,
      draft: Boolean(draft)
    });

    blog.save()
      .then(blog => {

        let incrementedVal = draft ? 0 : 1;

        User.findOneAndUpdate(
          { _id: authorId },
          {
            $inc: { "account_info.total_posts": incrementedVal },
            $push: { blogs: blog._id }
          }
        )
          .then(user => {
            return res.status(200).json({ id: blog.blog_id });
          })
          .catch(err => {
            return res.status(500).json({
              error: "Failed to update total posts number"
            });
          });

      })
      .catch(err => {
        return res.status(500).json({ error: "Failed to save blog" });
      });

  }

};



export const getBlog = (req, res) => {

  let { blog_id, mode, draft } = req.body;

  let incrementedVal = mode !== 'edit' ? 1 : 0;

  Blog.findOneAndUpdate(
    { blog_id },
    { $inc: { "activity.total_reads": incrementedVal } }
  )
    .populate(
      "author",
      "personal_info.fullname personal_info.username personal_info.profile_img"
    )
    .select("title des content banner activity publishedAt blog_id tags")

    .then(blog => {

      if (!blog) {
        return res.status(404).json({ error: "Blog not found" });
      }

      if (blog.draft && !draft) {
        return res.status(403).json({ error: "You cannot access draft blogs" });
      }

      User.findOneAndUpdate(
        { "personal_info.username": blog.author.personal_info.username },
        { $inc: { "account_info.total_reads": incrementedVal } }
      ).catch(err => {
        console.error("User update error:", err);
      });

      return res.status(200).json({ blog });

    })
    .catch(err => {
      console.error("Get blog error:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    });

};


export const likeBlog = (req, res) => {

  const user_id = req.user;

  const { _id, isLikedByUser } = req.body;

  const incrementVal = isLikedByUser ? -1 : 1;

  Blog.findOneAndUpdate(
    { _id },
    {
      $inc: { "activity.total_likes": incrementVal },
      [isLikedByUser ? "$pull" : "$addToSet"]: { likedBy: user_id }
    },
    { new: true }
  )

  .then(blog => {

    if (!blog) return res.status(404).json({ error: "Blog not found" });

    if (!isLikedByUser) {

      const like = new Notification({
        type: "like",
        blog: _id,
        notification_for: blog.author,
        user: user_id
      });

      return like.save()
        .then(() =>
          res.status(200).json({
            likedByUser: true,
            total_likes: blog.activity.total_likes
          })
        );

    } else {

      return Notification.findOneAndDelete({
        user: user_id,
        blog: _id,
        type: "like"
      })

      .then(() =>
        res.status(200).json({
          likedByUser: false,
          total_likes: blog.activity.total_likes
        })
      );

    }

  })

  .catch(err => {
    console.error("Error in like-blog:", err);
    res.status(500).json({ error: err.message });
  });

};


export const isLikedByUser = (req, res) => {

  let user_id = req.user;

  let { _id } = req.body;

  Notification.exists({
    user: user_id,
    type: "like",
    blog: _id
  })

  .then(result => {
    return res.status(200).json({ result });
  })

  .catch(err => {
    return res.status(500).json({ error: err.message });
  });

};