import express from "express";
import Thread from "../models/Thread.js";
import getGeminiAPIResponse from "../utils/giminiai.js";
import { v4 as uuidv4 } from "uuid";
import Memory from "../models/Memory.js";
import upload from "../middleware/upload.js";
import saveMemory from "../utils/memoryExtractor.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// ✅ Test route
router.post("/test", async (req, res) => {
    try {
        const thread = new Thread({
            threadId: uuidv4(),
            title: "test"
        });

        const response = await thread.save();
        res.json(response);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "Failed to save in DB" });
    }
});


// ✅ 1. Get ALL threads (FIXED: Sirf Logged-in User ki threads aayengi)
router.get("/thread", authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const threads = await Thread.find({ userId }).sort({ isPinned: -1, updatedAt: -1 });
        res.json(threads);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "failed to fetch threads" });
    }
});

// ✅ 2. Get specific thread (FIXED: Sirf apni thread access kar sake)
router.get("/thread/:threadId", authMiddleware, async (req, res) => {
    const { threadId } = req.params;
    const userId = req.user.userId || req.user.id;

    try {
        const thread = await Thread.findOne({ threadId, userId });

        if (!thread) {
            // New thread ke case me 404 de kar screen blank hone ke bajaye empty messages array do
            return res.status(200).json([]);
        }

        res.json(thread.messages);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "failed to fetch chats" });
    }
});

// ✅ 3. Delete thread (FIXED: Sirf apni thread delete kar sake)
router.delete("/thread/:threadId", authMiddleware, async (req, res) => {
    const { threadId } = req.params;
    const userId = req.user.userId || req.user.id;

    try {
        const deletedThread = await Thread.findOneAndDelete({ threadId, userId });

        if (!deletedThread) {
            return res.status(404).json({ error: "thread not found" });
        }

        res.status(200).json({ success: "thread deleted successfully" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "failed to delete that chat" });
    }
});

// ✅ 4. Update thread title (FIXED)
router.patch("/thread/:threadId", authMiddleware, async (req, res) => {
    const { threadId } = req.params;
    const userId = req.user.userId || req.user.id;

    try {
        const updatedThread = await Thread.findOneAndUpdate(
            { threadId, userId },
            req.body,
            { new: true }
        );
        res.json(updatedThread);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "failed to update thread" });
    }
});

// ✅ 5. Chat route (Already Working)
router.post("/chat", authMiddleware, upload.single("file"), async (req, res) => {
    const userId = req.user.userId || req.user.id;

    let { threadId, message } = req.body;

    if (!message?.trim() && !req.file) {
        return res.status(400).json({ error: "missing message" });
    }

    if (message.length > 2000) {
        return res.status(400).json({ error: "Character limit exceeded" });
    }

    if (!threadId) {
        threadId = uuidv4();
    }

    try {
        let thread = await Thread.findOne({ threadId, userId });

        if (!thread) {
            thread = new Thread({
                threadId,
                userId,
                title: message.trim()
                    ? message
                    : req.file
                        ? req.file.originalname.split(".")[0]
                        : "New Chat",
                messages: [{
                    role: "user",
                    content: message,
                    attachment: req.file ? {
                        type: req.file.mimetype,
                        fileName: req.file.originalname,
                        filePath: req.file.filename
                    } : null
                }]
            });
        } else {
            thread.messages.push({
                role: "user",
                content: message,
                attachment: req.file ? {
                    type: req.file.mimetype,
                    fileName: req.file.originalname,
                    filePath: req.file.filename
                } : null
            });
        }

        const memories = await Memory.find();
        const globalMemory = memories.map((memory) => memory.content);

        const converstionHistory = thread.messages.slice(-20).map((chat) => chat.content).join("\n");
        const finalPrompt = `${globalMemory.join("\n")} ${converstionHistory} user: ${message}`;

        await saveMemory(message);
        const assistantReply = await getGeminiAPIResponse(finalPrompt, req.file?.path, req.file?.mimetype);

        thread.messages.push({
            role: "assistant",
            content: assistantReply
        });

        thread.updatedAt = new Date();

        await thread.save();

        res.json({
            reply: assistantReply,
            threadId,
            attachment: req.file ? {
                fileName: req.file.originalname,
                type: req.file.mimetype,
                filePath: req.file.filename
            } : null
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "something went wrong" });
    }
});

export default router;