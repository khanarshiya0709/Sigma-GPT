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
                            parts: [
                                { text: message }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;

    } catch (err) {
        console.log(err);
        throw err;
    }
}

export default getGeminiAPIResponse;