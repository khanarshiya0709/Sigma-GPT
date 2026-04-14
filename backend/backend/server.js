import express from 'express';
import 'dotenv/config';
import cors from "cors";

console.log(process.env.GEMINI_API_KEY);

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(cors());

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`);
});

app.post("/test", async (req, res) => {
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
                                { text: req.body.message }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();
        console.log(data.candidates[0].content.parts[0].text);
        res.send(data.candidates[0].content.parts[0].text);

    } catch (err) {
        console.log(err);
        res.send("Error");
    }
});