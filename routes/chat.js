import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Abort AI request when it takes too long
const OPENAI_TIMEOUT_MS = 10000;

const FALLBACK_PHRASE = "i don't have that information";

router.post('/chat', async (req, res) => {
    const { input } = req.body;

    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), OPENAI_TIMEOUT_MS);

    try {
        const completion = await openai.chat.completions.create(
            {
                model: "gpt-4o",
                messages: [{ role: "user", content: input }],
            },
            { signal: ac.signal }
        );
        let reply = "";
        if (
            completion && completion.choices &&
            completion.choices[0] &&
            completion.choices[0].message
        ) {
            reply = completion.choices[0].message.content;
        }

        const replyLowerCase = reply.toLowerCase();
        const isFallback = replyLowerCase.includes(FALLBACK_PHRASE);

        if (isFallback) {
            fetch('/log-unmatched', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question: input,
                    answer: reply
                })
            }).catch(() => { });
        }
        res.send({ reply });
    } catch (err) {
        if (err && err.name === 'AbortError') {
            res.status(504).send({ err: 'AI timeout' });
        } else {
            res.status(500).send({ err: "AI fails" });
        }
    } finally {
        clearTimeout(t);
    }
});

export default router;