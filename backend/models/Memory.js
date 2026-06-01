import mongoose from "mongoose";

const memorySchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});
export default mongoose.model(
    "Memory",
    memorySchema
);