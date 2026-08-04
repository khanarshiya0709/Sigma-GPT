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

//this file store specific fact related to you;
//what details should the ai remember about the user it store;