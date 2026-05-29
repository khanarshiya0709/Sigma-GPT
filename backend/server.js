import express from 'express';
import multer from "multer";
import 'dotenv/config';
import cors from "cors";
import mongoose from 'mongoose';
import chatRoutes from "./routes/chat.js";

const app = express();
app.use(
    "/uploads",
    express.static("uploads")
);
const PORT = 8080;



app.use(express.json());
app.use(cors());

app.use("/api", chatRoutes);

// ✅ DB connect FIRST, then server start
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ connected with database!");

        app.listen(PORT, () => {
            console.log(`🚀 server running on ${PORT}`);
        });

    } catch (err) {
        console.log("❌ failed to connect with database", err);
    }
};

connectDB();



