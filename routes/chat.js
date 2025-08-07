import express from 'express';
const router = express.Router();
import { fetch } from 'undici';

router.post('/chat', async (req, res) => {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { input } = req.body;
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: input }],
        });
        const reply = completion.choices[0].message.content;

        const isFallback = reply.toLowerCase().includes("i don't have that information");

        if (isFallback) {
            await fetch('http://localhost:3000/log-unmatched', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: input,
                    answer: reply
                })
            });
        }
        res.send({ reply });
    } catch (err) {
        res.status(500).send({ err: "AI fails" });
    }
});

export default router;