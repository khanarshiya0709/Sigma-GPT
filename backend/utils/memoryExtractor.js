import Memory from "../models/Memory.js";

const saveMemory = async (
    message
) => {

    const lowerMessage =
        message.toLowerCase();


    const nameMatch =
        lowerMessage.match(
            /my name( is|'s)? (.+)/i
        );

    if (nameMatch) {

        await Memory.create({

            content:
                `User name is ${nameMatch[2]}`
        });
    }


    const buildingMatch =
        lowerMessage.match(
            /i( am|'m)? building (.+)/i
        );

    if (buildingMatch) {

        await Memory.create({

            content:
                `User is building ${buildingMatch[2]}`
        });
    }

};

export default saveMemory;