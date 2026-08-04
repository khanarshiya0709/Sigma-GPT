import Memory from "../models/Memory.js";

const saveMemory = async (message) => {

    const lowerMessage = message.toLowerCase();


    const nameMatch = lowerMessage.match(/my name( is|'s)? (.+)/i);

    if (nameMatch) {
        const extractedName = nameMatch[2].trim();

        await Memory.findOneAndUpdate(
            { content: { $regex: /^User name is/i } },
            { content: `User name is ${extractedName}` },
            { upsert: true, new: true }
        );
    }


    const buildingMatch = lowerMessage.match(/i( am|'m)? building (.+)/i);

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