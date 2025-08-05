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

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

app.listen(port, () => console.log(`Server is running on port:${port}`));