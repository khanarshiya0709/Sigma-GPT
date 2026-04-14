import express from 'express';
import 'dotenv/config';
import cors from "cors";
import mongoose from 'mongoose';
import chatRoutes from "./routes/chat.js";

const app = express();
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



// app.post("/test", async (req, res) => {
//     try {
//         const response = await fetch(
//             `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
//             {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json"
//                 },
//                 body: JSON.stringify({
//                     contents: [
//                         {
//                             parts: [
//                                 { text: req.body.message }
//                             ]
//                         }
//                     ]
//                 })
//             }
//         );

//         const data = await response.json();
//         // console.log(data.candidates[0].content.parts[0].text);
//         res.send(data.candidates[0].content.parts[0].text);

//     } catch (err) {
//         console.log(err);
//         res.send("Error");
//     }
// });