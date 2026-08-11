import Memory from "../models/Memory.js";

const saveMemory = async (message) => {
    // 💡 1. Guard Clause: Prevents crash if message is missing/undefined/null
    if (!message || typeof message !== "string" || !message.trim()) return;

    // 💡 2. Match regex directly on original message (case-insensitive flag 'i')
    const nameMatch = message.match(/my name( is|'s)? (.+)/i);

    if (nameMatch) {
        // Keeps original capital letters (e.g., "Arshiya" instead of "arshiya")
        const extractedName = nameMatch[2].trim();

        await Memory.findOneAndUpdate(
            { content: { $regex: /^User name is/i } },
            { content: `User name is ${extractedName}` },
            { upsert: true, new: true }
        );
    }

    const buildingMatch = message.match(/i( am|'m)? building (.+)/i);

    if (buildingMatch) {
        const projectName = buildingMatch[2].trim();

        await Memory.findOneAndUpdate(
            { content: { $regex: /^User is building/i } },
            { content: `User is building ${projectName}` },
            { upsert: true, new: true }
        );
    }
};

export default saveMemory;