import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ["user", "assistant"],
        required: true
    },
    content: {
        type: String,
        required: true
    },

    attachment: {
        type: {
            type: String,
            default: null
        },
        fileName: {
            type: String,
            default: null
        },
        filePath: {
            type: String,
            default: null
        }
    },

    timestamp: {
        type: Date,
        default: Date.now
    }
});

const ThreadSchema = new mongoose.Schema({
    threadId: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        default: "new chat"
    },
    messages: [MessageSchema],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },

    isPinned: {
        type: Boolean,
        default: false
    }
});

export default mongoose.model("Thread", ThreadSchema);