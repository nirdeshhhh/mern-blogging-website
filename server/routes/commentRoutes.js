import express from "express";

import {
  addComment,
  getBlogComments
} from "../controllers/commentController.js";

import { verifyJWT } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add-comment", verifyJWT, addComment);

router.post("/get-blog-comments", getBlogComments);

export default router;