import express from 'express';
const router = express.Router();

const sessionMemory = new Map();

router.post('/chat', async (req, res) => {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { input } = req.body;
    if (!input) return res.status(400).json({ error: "Missing input" });

    // Initialize session messages
    let messages = [
        { role: 'system' },
        { content: 'You are an assistant for college campus queries.' }
    ];

    messages.push({ role: 'user', content: input });

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: messages,
            temperature: 0.3,
            max_tokens: 500
        });
        const reply = completion.choices[0].message.content;
        messages.push({ role: 'assistant', content: reply });
        res.json({ reply });
    } catch (err) {
        res.status(500).json({ error: 'Chat failed', detail: err.message });
    }
});

router.post('/rephrase', async (req, res) => {
    const OpenAI = (await import('openai')).default;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { input } = req.body;
    const prompt = [
        { role: 'system', content: '...' },
        { role: 'user', content: `Rephrase this question in 3 different ways "${input}"` }
    ];
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: prompt,
            temperature: 0.3,
            max_tokens: 100
        });
        const output = completion.choices[0].message.content || '';
        const variant = output
            .split('\n')
            .map(s => s.replace(/^\d+\.\s*/, '').trim().toLowerCase())
            .filter(Boolean);
        res.json({ rephrased: variant });
    } catch (err) {
        res.status(500).json({ error: "Rephrase error", detail: err.message });
    }
});
export default router;