import mongoose from "mongoose";

const memorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        type: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

// 🚀 Make sure mongoose.model create karke export default ho
const Memory = mongoose.model("Memory", memorySchema);

export default Memory;