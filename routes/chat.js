import express from 'express';
const router = express.Router();

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
        res.send({ reply });
    } catch (err) {
        res.status(500).send({ err: "AI fails" });
    }
});

export default router;