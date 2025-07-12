const express = require('express');
const router = express.Router();
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/rephrase', async (req, res) => {
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
        const variant = output
            .split('\n')
            .map(s => s.replace(/^\d+\.\s*/, '').trim().toLowerCase())
            .filter(Boolean);
        res.json({ rephrased: variant });
    } catch (err) {
        res.status(500).json({ error: "Rephrase error", detail: err.message });
    }
});
module.exports = router;