import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import cors from 'cors';
// import admin from 'firebase-admin';
// import { getAuth } from 'firebase-admin/auth';
import aws from "aws-sdk";
import { createRequire } from 'module';
import User from './Schema/User.js';
import Blog from './Schema/Blog.js';
import Notification from "./Schema/Notification.js";
import { blob } from 'stream/consumers';
import Comment from "./Schema/Comment.js"

const require = createRequire(import.meta.url);
// const serviceAccountKey = require('./mern-bloggingwebsite-firebase-adminsdk-fbsvc-433b07efa8.json');

dotenv.config();

const server = express();  
const PORT = process.env.PORT || 3000;

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccountKey)
// });

// Middlewares

server.use(cors({
  origin: "https://mern-blogging-website-production-10f9.up.railway.app",
  credentials: true
}));

// MongoDB Connection + Start Server ONLY after DB connects
mongoose.connect(process.env.DB_LOCATION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  autoIndex: true,
})
.then(() => {
  console.log("MongoDB connected successfully");

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on ${PORT}`);
  });
})
.catch(err => {
  console.error("MongoDB connection error:", err.message);
});



//setting  up s3 bucket
const s3 = new aws.S3({
  region: "ap-south-1",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});


const generateUploadUrl = async () => {
  const date = new Date();
  const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

  return await s3.getSignedUrlPromise('putObject', {
    Bucket: 'mern-blogging-website-fullstack',
    Key: imageName,
    Expires: 1000,
    ContentType: "image/jpeg",
  })
}

const verifyJWT = (req, res, next) => {

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(" ")[1];

  if(token == null){
    return res.status(401).json({ error: "No accesss token"})
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if(err){
      return res.status(403).json({ error: "Access token is invalid" })
    }

    req.user = user.id
    next()

  })

}

// JWT Formatter
const formatDataToSend = (user) => {
  const access_token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname
  };
};

// Username Generator
const generateUsername = async (email) => {
  let username = email.split("@")[0];
  let isUsernameNotUnique = await User.exists({ "personal_info.username": username });
  return isUsernameNotUnique ? username + nanoid().substring(0, 5) : username;
};

//upload image url Route
server.get('/get-upload-url', async (req, res) => {
  generateUploadUrl().then(url => res.status(200).json({ uploadUrl: url}))
  .catch (err => {
    console.error("Error generating upload URL:", err.message);
    return res.status(500).json({ error: err.message });
  })
})


// Signup Route
server.post('/signup', async (req, res) => {
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
});

// Signin Route
server.post("/signin", async (req, res) => {
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
});

// Google Auth Route
// server.post("/google-auth", async (req, res) => {
//   let { access_token } = req.body;

//   getAuth().verifyIdToken(access_token)
//     .then(async (decodedUser) => {
//       let { email, name, picture } = decodedUser;
//       picture = picture.replace("s96-c", "s384-c");

//       let user = await User.findOne({ "personal_info.email": email })
//         .select("personal_info.fullname personal_info.username personal_info.profile_img google_auth")
//         .catch(err => res.status(500).json({ error: err.message }));

//       if (user) {
//         if (!user.google_auth)
//           return res.status(403).json({ error: "This email was signed up without Google. Use password." });
//       } else {
//         let username = await generateUsername(email);

//         user = new User({
//           personal_info: { fullname: name, email, username, profile_img: picture },
//           google_auth: true
//         });

//         await user.save().catch(err => res.status(500).json({ error: err.message }));
//       }

//       return res.status(200).json(formatDataToSend(user));
//     })
//     .catch(err => res.status(500).json({ error: "Failed to authenticate with Google." }));
// });




// Search Blogs
server.post("/search-blogs", async (req, res) => {
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
      .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
      .sort({ publishedAt: -1 })
      .select("blog_id title des banner activity tags publishedAt -_id");

    const totalCount = await Blog.countDocuments(findQuery);

    return res.status(200).json({ blogs, totalCount });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});




// Search Blogs Count
server.post("/search-blogs-count", (req, res) => {
  let { tag, query, author } = req.body;

  let findQuery;
  
  if(tag){
      findQuery = { tags: tag, draft: false };
  } else if(query){
      findQuery = { draft: false, title: new RegExp(query, 'i') };
  } else if(author){
      findQuery = { author, draft: false };
  }

  Blog.countDocuments(findQuery)
    .then(count => res.status(200).json({ totalDocs: count }))
    .catch(err => res.status(500).json({ error: err.message }));
});



server.post("/search-users", (req, res) => {
  let { query } = req.body;

  User.find({ "personal_info.username": new RegExp(query, 'i') })
      .limit(50)
      .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
      .then(users => {
          return res.status(200).json({ users })
      })
      .catch(err => {
          return res.status(500).json({ error: err.message })
      })
})

// Get Profile
server.post("/get-profile", (req, res) => {
  let { username } = req.body;

  User.findOne({ "personal_info.username": username })
    .select("-personal_info.password -google_auth -updatedAt -blogs")
    .then(user => {
      console.log("User found:", user); // helpful for debugging
      res.status(200).json(user)})
    .catch(err => res.status(500).json({ error: err.message }));
});



server.post('/latest-blogs', (req, res) => {

  let { page } = req.body; 

  let maxLimit = 10;

  Blog.find({ draft: false })
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({ "publishedAt": -1 })
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page -1) * maxLimit )
    .limit(maxLimit)
    .then(blogs => {
      return res.status(200).json({ blogs });
    })
    .catch(err => {
      return res.status(500).json({ error: err.message });
    });

});

server.get("/trending-blogs", (req, res) => {

  Blog.find({ draft: false })
  .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
  .sort({ "activity.total_read": -1, "activity.total_likes": -1, "publishedAt": -1 })
  .select("blog_id title publishedAt -_id")
  .limit(5)
  .then(blogs => {
    return res.status(200).json({ blogs })
  })
  .catch(err => {
    return res.status(500).json({ error: err.message })
  })
})


server.post('/all-latest-blogs-count', async (req, res) => {
  try {
    const count = await Blog.countDocuments({ draft: false });
    res.status(200).json({ totalDocs: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



server.post('/create-blog', verifyJWT, (req, res) => {
  let authorId = req.user;
  let { title, des, banner, tags, content, draft, id } = req.body;

  if (!title.length) {
    return res.status(403).json({ error: "You must provide a title" });
  }

  if (!draft) {
    if (!des.length || des.length > 200) {
      return res.status(403).json({ error: "You must provide blog description under 200 characters" });
    }

    if (!banner.length) {
      return res.status(403).json({ error: "You must provide blog banner to publish it" });
    }

    if (!content.blocks.length) {
      return res.status(403).json({ error: "There must be some blog content to publish it" });
    }

    if (!tags.length || tags.length > 10) {
      return res.status(403).json({ error: "Provide tags in order to publish the blog, Maximum 10" });
    }
  }

  tags = tags.map(tag => tag.toLowerCase());

  let blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim() + nanoid();

  if (id) {
    Blog.findOneAndUpdate({ blog_id }, { title, des, banner, content, tags, draft: draft ? draft : false })
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
            return res.status(500).json({ error: "Failed to update total posts number" });
          });
      })
      .catch(err => {
        return res.status(500).json({ error: "Failed to save blog" });
      });
  }
});


  

// Get Blog
server.post("/get-blog", (req, res) => {
  let { blog_id, mode, draft } = req.body;
  let incrementedVal = mode !== 'edit' ? 1 : 0;

  Blog.findOneAndUpdate({ blog_id }, { $inc: { "activity.total_reads": incrementedVal } })
    .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
    .select("title des content banner activity publishedAt blog_id tags") // ✅ fixed here
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
});

server.post("/like-blog", verifyJWT, (req, res) => {
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
        .then(() => res.status(200).json({ likedByUser: true, total_likes: blog.activity.total_likes }));
    } else {
      return Notification.findOneAndDelete({ user: user_id, blog: _id, type: "like" })
        .then(() => res.status(200).json({ likedByUser: false, total_likes: blog.activity.total_likes }));
    }
  })
  .catch(err => {
    console.error("Error in like-blog:", err);
    res.status(500).json({ error: err.message });
  });
});


  server.post("/isliked-by-user", verifyJWT, (req, res) => {

    let user_id = req.user;
  
    let { _id } = req.body;
  
    Notification.exists({ user: user_id, type: "like", blog: _id })
      .then(result => {
        return res.status(200).json({ result })
      })
      .catch(err => {
        return res.status(500).json({ error: err.message })
      })
  
  })
  
  server.post("/add-comment", verifyJWT, async (req, res) => {
    try {
      let user_id = req.user;
      let { _id, comment, blog_author } = req.body;
  
      if (!comment.length) {
        return res.status(403).json({ err: 'Write something to leave a comment' });
      }
  
      // Create comment document
      const commentObj = new Comment({
        blog_id: _id,
        blog_author,
        comment,
        commented_by: user_id,
      });
  
      const commentFile = await commentObj.save();
      const { commentedAt, children } = commentFile;
  
      // Update blog with new comment
      await Blog.findOneAndUpdate(
        { _id },
        {
          $push: { comments: commentFile._id },
          $inc: { "activity.total_comments": 1, "activity.total_parent_comments": 1 },
        }
      );
  
      console.log('New comment created');
  
      // Create notification only if user is not the blog author
      if (String(user_id) !== String(blog_author)) {
        const notificationObj = {
          type: "comment",
          blog: _id,
          notification_for: blog_author,
          user: user_id,
          comment: commentFile._id,
        };
  
        await new Notification(notificationObj).save();
        console.log('New notification created');
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
      return res.status(500).json({ err: 'Something went wrong while adding comment' });
    }
  });


  server.post("/get-blog-comments", async (req, res) => {
    try {
        console.log("Inside /get-blog-comments");
        console.log("req.body:", req.body);

        const { blog_id, skip = 0 } = req.body;

        if (!blog_id) {
            console.error("Missing blog_id");
            return res.status(400).json({ error: "Blog ID is required" });
        }

        const maxLimit = 5;
        console.log("Fetching comments for blog_id:", blog_id);

        // No need to convert to ObjectId since blog_id is a string in the schema
        const comments = await Comment.find({ blog_id: blog_id, isReply: false })
            .populate("commented_by", "personal_info.username personal_info.fullname personal_info.profile_img")
            .skip(skip)
            .limit(maxLimit)
            .sort({ commentedAt: -1 });

        console.log("Fetched comments:", comments);

        return res.status(200).json(comments);
        
    } catch (err) {
        console.error("Error fetching comments:", err.message);
        return res.status(500).json({ error: "Failed to fetch comments" });
    }
});





  
  
// Test Route
server.get("/", (req, res) => {
  res.send("Welcome to the Backend API!");
});
