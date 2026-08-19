import express from 'express';
import multer from "multer";
import 'dotenv/config';
import cors from "cors";
import mongoose from 'mongoose';
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";
import Memory from "./models/Memory.js";

const app = express();

app.use("/uploads", express.static("uploads"));

const PORT = 8080;

app.use(express.json());
app.use(cors());

app.use("/api", chatRoutes);
app.use("/api/auth", authRoutes);

// ✅ DB connect FIRST, then server start
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ connected with database!");

        // 👈 deleteMany ko comment kar diya taaki memory bachi rahe
        // await Memory.deleteMany({}); 

        app.listen(PORT, () => {
            console.log(`🚀 server running on ${PORT}`);
        });

    } catch (err) {
        console.log("❌ failed to connect with database", err);
    }
};

connectDB();