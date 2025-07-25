import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import express from 'express';
import OpenAI from 'openai';
import cors from 'cors';
import llmRouter from './routes/llm.js';
import chatRoutes from './routes/chat.js';
import tokenRoutes from './routes/token.js';
import adminRoutes from './routes/admin.js';

// In ESM __dirname and __filename are undefined. The next 2 lines reconstruct them for path resolution
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables at startup to configure AI fallback, admin auth and other behaviors
dotenv.config({ path: path.join(__dirname, './.env') });

//
const app = express();
console.log('Serving static at port:', path.join(__dirname, 'public'));

// Serve static file from /public directory
app.use(express.static(path.join(__dirname, 'public')));

// Initialize OpenAI client using API key for fall back response
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const port = 3000;

app.use(cors());
app.use(express.json());        // Parse incoming JSON request bodies
app.use('/api', chatRoutes);
app.use('/api', tokenRoutes);
app.use('/llm', llmRouter)      // Route AI fallback
app.use('/api', adminRoutes);

const logFilePath = path.join(__dirname, 'logs', 'unmatched_input.log');

// Log unmatched user inputs for further rule and fallback integration
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