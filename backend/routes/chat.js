import express from "express";
import Thread from "../models/Thread.js";
import getGeminiAPIResponse from "../utils/giminiai.js";
import { v4 as uuidv4 } from "uuid"; // 🔥 ADD THIS

const router = express.Router();




// ✅ Test route (fixed - no hardcoded id)
router.post("/test", async (req, res) => {
    try {
        const thread = new Thread({
            threadId: uuidv4(),   // 🔥 FIXED
            title: "test"
        });

        const response = await thread.save();
        res.json(response);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to save in DB" });
    }
});

// ✅ Get all threads
router.get("/thread", async (req, res) => {
    try {
        const threads = await Thread.find({}).sort({ updatedAt: -1 });
        //descending order of updatedAT..most recent data on top
        res.json(threads);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "failed to fetch threads" });
    }
});

// ✅ Get specific thread
router.get("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;

    try {
        const thread = await Thread.findOne({ threadId });

        if (!thread) {
            return res.status(404).json({ error: "chat not found" });
        }

        res.json(thread.messages);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "failed to fetch chats" });
    }
});

// ✅ Delete thread
router.delete("/thread/:threadId", async (req, res) => {
    const { threadId } = req.params;

    try {
        const deletedThread = await Thread.findOneAndDelete({ threadId });

        if (!deletedThread) {
            return res.status(404).json({ error: "thread not found" });
        }

        res.status(200).json({ success: "thread deleted successfully" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "failed to delete that chat" });
    }
});

//update
router.patch("/thread/:threadId", async (req, res) => {

    const { threadId } = req.params;

    try {
        const updatedThread =
            await Thread.findOneAndUpdate(
                { threadId },
                req.body,

                { new: true }
            );
        res.json(updatedThread);

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "failed to updae thread"
        });

    }
});

// ✅ Chat route (FIXED 🔥)
router.post("/chat", async (req, res) => {
    let { threadId, message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "missing message" });
    }

    if (message.length > 2000) {
        return res.status(400).json({
            error: "Character limit exceeded"
        });

    }

    // 🔥 IMPORTANT FIX
    if (!threadId) {
        threadId = uuidv4();  // auto-generate id
    }

    try {
        let thread = await Thread.findOne({ threadId });

        if (!thread) {
            thread = new Thread({
                threadId,
                title: message,
                messages: [{ role: "user", content: message }]
            });
        } else {
            thread.messages.push({ role: "user", content: message });
        }

        const assistantReply = await getGeminiAPIResponse(message);

        thread.messages.push({
            role: "assistant",
            content: assistantReply
        });

        thread.updatedAt = new Date();

        await thread.save();

        res.json({ reply: assistantReply, threadId }); // 🔥 send back id

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "something went wrong" });
    }
});

export default router;