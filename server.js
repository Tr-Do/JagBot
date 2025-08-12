import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';
import OpenAI from 'openai';
import cors from 'cors';
import llmRouter from './routes/llm.js';
import chatRoutes from './routes/chat.js';
import adminRoutes from './routes/admin.js';
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env file
dotenv.config({ path: path.join(__dirname, './.env') });

// Initiate Express, AI
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/api', chatRoutes);
app.use('/llm', llmRouter)
app.use(adminRoutes);

const pool = new Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: process.env.PGPORT,
});

app.post('/log-unmatched', async (req, res) => {
    const { question, answer } = req.body;

    if (!question || !answer) {
        return res.status(400).json({ error: 'Missing question or answer' });
    }
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXIST fallback_log (
                id BIGSERIAL PRIMARY KEY,
                question TEXT NOT NULL,
                answer TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now())
        );
    `);
        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Fail to insert fallback:', err);
        res.status(500).json({ error: 'Database insertion failed' });
    }
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

app.listen(port, () => console.log(`Server is running on port:${port}`));