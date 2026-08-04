import 'dotenv/config';
import fs from "fs";

const getGeminiAPIResponse = async (message, filePath, mimeType) => {
    try {
        let fileData = null;
        if (filePath) {
            fileData = fs.readFileSync(filePath).toString("base64");
        }

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [{ text: message },
                            ...(fileData ? [{
                                inlineData: {
                                    mimeType: mimeType,         //"application/pdf", //mimeType means file ka type like now pdf so application,
                                    data: fileData
                                }
                            }] : [])

                            ]
                        }
                    ]
                })
            }
        );


        const data = await response.json();
        console.log("API RESPONSE:", data);

        // ❌ API error handle
        if (data.error) {
            console.log("Gemini API Error:", data.error.message);
            return "⚠️ API limit reached, try again later";
        }

        // ❌ Safe access (no crash)
        const text =
            data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "no response";



        return text;

    } catch (err) {
        console.log("SERVER ERROR:", err);
        return "⚠️ Something went wrong on server";
    }
};

export default getGeminiAPIResponse;