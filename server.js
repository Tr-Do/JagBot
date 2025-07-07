import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, './.env') });

import express from 'express';
import OpenAI from 'openai';
import cors from 'cors';

const app = express();
const port = 3000;

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

app.post('/ask', async (req, res) => {
    const { message } = req.body;

    // AI Directives
    const prompt = [
        {
            role: 'system',
            content: "Only respond using direct content from tamusa.edu. Do not assume page structure, UI layout, or behaviors. Do not paraphrase. If the exact answer is not available in public TAMUSA content, respond with: 'Please check the official TAMUSA website for accurate info.'"
        },
        {
            role: 'user',
            content: message
        }
    ];

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: prompt,
            temperature: 0,
            max_tokens: 256
        });

        // log AI fallback
        console.log('AI fallback initiated', {
            timestamp: new Date().toISOString(),
            input: message
        });

        const result = completion.choices[0].message.content;

        // Filter speculations
        if (/i\s+(think|guess|might|not sure|possibly|believe|may|assume|likely|probably)/i.test(result)) {
            return res.json({ reply: "Response blocked due to speculation" });
        }
        res.json({ reply: result });
    } catch (err) {
        res.status(500).json({ error: 'LLM failed', detail: err.message });
    }
});

app.listen(port, () => console.log(`Server is running on port:${port}`));
console.log("API Key:", process.env.OPENAI_API_KEY);