import express from 'express';
import OpenAI from 'openai';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const port = 3000;

const openai = new OpenAI({apiKey:process.env.OPENAI_API_KEY});

app.use(cors());
app.use(express.json());

app.post('/ask', async(req,res) => {
    const {message} = req.body;

    const prompt = [
    {
        role: 'system',
        content: 'Only answer using official university data. Never guess.'},
    {
        role: 'user', 
        content: message}
    ];

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: prompt,
            temperature: 0,
            max_tokens: 256
        });
        
        const result = completion.choices[0].message.content;
        
        // Filter speculations
        if (/i\s+(think|guess|might|not sure|possibly)/i.test(result)){
            return res.json({reply:"Response blocked due to speculation"});
        }
            res.json({reply:result});
    } catch(err) {
        res.status(500).json({error: 'LLM failed', detail:err.message});
    }
});

app.listen(port, () => console.log(`Server is running on port:${port}`));