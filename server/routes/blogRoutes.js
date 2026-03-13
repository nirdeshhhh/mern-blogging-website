import express from "express";

import {
  searchBlogs,
  searchBlogsCount,
  latestBlogs,
  trendingBlogs,
  allLatestBlogsCount,
  createBlog,
  getBlog,
  likeBlog,
  isLikedByUser
} from "../controllers/blogController.js";

import { verifyJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

// search blogs
router.post("/search-blogs", searchBlogs);

// search blogs count
router.post("/search-blogs-count", searchBlogsCount);

// latest blogs
router.post("/latest-blogs", latestBlogs);

// trending blogs
router.get("/trending-blogs", trendingBlogs);

// latest blogs count
router.post("/all-latest-blogs-count", allLatestBlogsCount);

// create blog
router.post("/create-blog", verifyJWT, createBlog);

// get blog
router.post("/get-blog", getBlog);

// like blog
router.post("/like-blog", verifyJWT, likeBlog);

// check if blog liked by user
router.post("/isliked-by-user", verifyJWT, isLikedByUser);

export default router;