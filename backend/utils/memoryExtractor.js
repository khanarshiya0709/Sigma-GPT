import Memory from "../models/Memory.js";

const saveMemory = async (message, userId) => {
    if (!message || typeof message !== "string" || !message.trim()) return;

    // 1. Name Match Regex
    const nameMatch = message.match(/my name( is|'s)? (.+)/i);

    if (nameMatch) {
        const extractedName = nameMatch[2].trim();

        // Query filter me type aur userId use karo (Zero Duplicates)
        const filter = userId ? { type: "name", userId } : { type: "name" };

        await Memory.findOneAndUpdate(
            filter,
            {
                $set: {
                    type: "name",
                    content: `User name is ${extractedName}`,
                    ...(userId && { userId })
                }
            },
            { upsert: true, new: true }
        );
    }

    // 2. Project Match Regex
    const buildingMatch = message.match(/i( am|'m)? building (.+)/i);

    if (buildingMatch) {
        const projectName = buildingMatch[2].trim();

        const filter = userId ? { type: "project", userId } : { type: "project" };

        await Memory.findOneAndUpdate(
            filter,
            {
                $set: {
                    type: "project",
                    content: `User is building ${projectName}`,
                    ...(userId && { userId })
                }
            },
            { upsert: true, new: true }
        );
    }
};

export default saveMemory;