import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// routes
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();


// const require = createRequire(import.meta.url);
// const serviceAccountKey = require('./mern-bloggingwebsite-firebase-adminsdk-fbsvc-433b07efa8.json');



const server = express();
const PORT = process.env.PORT || 3000;

// middlewares
server.use(cors());
server.use(express.json());

// routes
server.use("/", authRoutes);
server.use("/", uploadRoutes);
server.use("/", blogRoutes);
server.use("/", commentRoutes);
server.use("/", userRoutes);

// MongoDB connection
mongoose
  .connect(process.env.DB_LOCATION, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: true
  })
  .then(() => {
    console.log("MongoDB connected successfully");

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running on ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });

// test route
server.get("/", (req, res) => {
  res.send("Welcome to the Backend API!");
});