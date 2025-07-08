import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import express from 'express';
import OpenAI from 'openai';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env file
dotenv.config({ path: path.join(__dirname, './.env') });


// Initiate Express, AI
const app = express();
const port = 3000;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Middleware
app.use(cors());
app.use(express.json());

const logFilePath = path.join(__dirname, 'logs', 'unmatched_input.log');

// Log unmatched input
app.post('/log-unmatched', (req, res) => {
    const logData = JSON.stringify(req.body) + '\n';
    fs.mkdir(path.dirname(logFilePath), { recursive: true }, (err) => {
        if (err) return res.status(500).send('Fail to create log directory');

        fs.appendFile(logFilePath, logData, (err) => {
            if (err) return res.status(500).send('Failed to write log');
            res.status(200).send('Logged');
        });
    });
});

app.post('/rephrase', async (req, res) => {
    const { input } = req.body;

    const prompt = [
        {
            role: 'system',
            content: "You are a query rewriter. Given a student's question, generate 2 alternate phrasings that use simpler and more common wording. Do not answer the question. Only return rephrased queries."
        },
        {
            role: 'user',
            content: `Rephrase this student question in 3 different ways: "${input}"`
        }
    ];
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: prompt,
            temperature: 0.3,
            max_tokens: 100
        })
        const output = completion.choices[0].message.content || 'AI Error';
        const variant = output
            .split('\n')
            .map(s => s.replace(/^\d+\.\s*/, '').trim().toLowerCase())
            .filter(Boolean);
        res.json({ rephrased: variant });
    } catch (err) {
        res.status(500).json({ error: "Rephrase error: ", detail: err.message });
    }
});

// AI Directives
app.post('/ask', async (req, res) => {
    const { message } = req.body;
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