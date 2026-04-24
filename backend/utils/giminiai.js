import 'dotenv/config';

const getGeminiAPIResponse = async (message) => {
    try {
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
                            parts: [{ text: message }]
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
            data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            console.log("Invalid structure:", data);
            return "⚠️ No response from AI";
        }

        return text;

    } catch (err) {
        console.log("SERVER ERROR:", err);
        return "⚠️ Something went wrong on server";
    }
};

export default getGeminiAPIResponse;