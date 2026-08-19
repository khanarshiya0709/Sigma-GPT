import express from "express";
import Thread from "../models/Thread.js";
import getGeminiAPIResponse from "../utils/giminiai.js";
import { v4 as uuidv4 } from "uuid";
import Memory from "../models/Memory.js";
import upload from "../middleware/upload.js";
import saveMemory from "../utils/memoryExtractor.js";
import authMiddleware from "../middleware/auth.js";

const router = express.Router();

// 🚀 Helper: Fallback Title (Taaki ReferenceError kabhi na aaye)
const createShortTitle = (message) => {
    if (!message) return "New Chat";
    const words = message.trim().split(/\s+/);
    return words.slice(0, 4).join(" ") + (words.length > 4 ? "..." : "");
};

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

// ✅ 1. Get ALL threads
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

// ✅ 2. Get specific thread
router.get("/thread/:threadId", authMiddleware, async (req, res) => {
    const { threadId } = req.params;
    const userId = req.user.userId || req.user.id;

    try {
        const thread = await Thread.findOne({ threadId, userId });

        if (!thread) {
            return res.status(200).json([]);
        }

        res.json(thread.messages);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: "failed to fetch chats" });
    }
});

// ✅ 3. Delete thread
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

// ✅ 4. Update thread title
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

// ✅ 5. Edit Prompt & Regenerate Gemini Response
router.post("/chat/edit", authMiddleware, async (req, res) => {
    try {
        const { threadId, messageIndex, newPrompt } = req.body;
        const userId = req.user?._id || req.user?.id || req.user?.userId;
        const idx = Number(messageIndex);

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized user" });
        }

        const thread = await Thread.findOne({ threadId, userId });

        if (!thread) {
            return res.status(404).json({ error: "Thread not found" });
        }

        if (isNaN(idx) || !thread.messages[idx]) {
            return res.status(400).json({ error: "Invalid message index" });
        }

        // 1. Memory Extraction & Gemini Call
        await saveMemory(newPrompt, userId); // 👈 Fixed: userId pass kiya
        const memories = await Memory.find({ userId }); // 👈 Fixed: { userId } object pass kiya
        const globalMemory = memories.map((m) => m.content);
        const converstionHistory = thread.messages.slice(0, idx).map((chat) => chat.content).join("\n");
        const finalPrompt = `${globalMemory.join("\n")} ${converstionHistory} user: ${newPrompt}`;

        const newAiResponse = await getGeminiAPIResponse(finalPrompt);

        // 2. Updated Messages Array
        const updatedMessages = thread.messages.map((item) => {
            return item.toObject ? item.toObject() : item;
        });

        updatedMessages[idx].content = newPrompt;

        if (updatedMessages[idx + 1] && updatedMessages[idx + 1].role === "assistant") {
            updatedMessages[idx + 1].content = newAiResponse;
        } else {
            updatedMessages[idx + 1] = { role: "assistant", content: newAiResponse };
        }

        // 3. Build Update Object
        const updateData = {
            messages: updatedMessages,
            updatedAt: new Date()
        };

        // 🚀 SMART TITLE RE-GENERATION (Agar Pehla Message Edit Hua Ho)
        if (idx === 0 && newPrompt.trim()) {
            try {
                const titlePrompt = `Summarize this user message into a short, concise chat title (maximum 3 to 4 words, plain text only, no quotes, no markdown, no punctuation): "${newPrompt}"`;
                const aiTitle = await getGeminiAPIResponse(titlePrompt);

                if (aiTitle) {
                    updateData.title = aiTitle.trim().replace(/^["']|["']$/g, '').replace(/\n/g, '');
                } else {
                    updateData.title = createShortTitle(newPrompt);
                }
            } catch (titleErr) {
                updateData.title = createShortTitle(newPrompt);
            }
        }

        // 4. Atomic Database Update
        const updatedThread = await Thread.findOneAndUpdate(
            { threadId, userId },
            { $set: updateData },
            { new: true }
        );

        res.json({
            success: true,
            updatedMessages: updatedThread.messages,
            updatedThread: updatedThread
        });

    } catch (error) {
        console.error("Edit and Regenerate Error:", error);
        res.status(500).json({ error: "Failed to regenerate response" });
    }
});

// ✅ Main Chat Route (/chat)
router.post("/chat", authMiddleware, upload.single("file"), async (req, res) => {
    const userId = req.user?.userId || req.user?.id || req.user?._id;
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

        // 🚀 NAYA THREAD: Title Generate Karo
        if (!thread) {
            let generatedTitle = "New Chat";

            if (message?.trim()) {
                try {
                    const titlePrompt = `Summarize this user message into a short, concise chat title (maximum 3 to 4 words, plain text only, no quotes, no markdown, no punctuation): "${message}"`;
                    const aiTitle = await getGeminiAPIResponse(titlePrompt);

                    if (aiTitle) {
                        generatedTitle = aiTitle.trim().replace(/^["']|["']$/g, '').replace(/\n/g, '');
                    } else {
                        generatedTitle = createShortTitle(message);
                    }
                } catch (titleErr) {
                    console.log("Title Generation Failed, using fallback:", titleErr);
                    generatedTitle = createShortTitle(message);
                }
            } else if (req.file) {
                generatedTitle = req.file.originalname.split(".")[0];
            }

            thread = new Thread({
                threadId,
                userId,
                title: generatedTitle,
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

        // Memory save aur fetch
        await saveMemory(message, userId);
        const memories = await Memory.find({ userId });
        const globalMemory = memories.map((memory) => memory.content);
        const converstionHistory = thread.messages.slice(-20).map((chat) => chat.content).join("\n");
        const finalPrompt = `${globalMemory.join("\n")} ${converstionHistory} user: ${message}`;

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
            thread: thread,
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