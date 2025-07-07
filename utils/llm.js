import OpenAI from 'openai';
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function getLLMResponse(input) {
    const res = await fetch('http://localhost:3000/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
    });
    const data = await res.json();
    return data.reply || 'AI error';
}

export async function getLLMRephrases(input) {
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
        const res = await fetch('http://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.Stringify({
                model: 'gpt-4',
                message: prompt,
                temperature: 0.3,
                max_tokens: 100
            })
        });
        const data = await res.json()
        let output = '';
        if (data && Array.isArray(data.choices) && data.choices.length > 0 && data.choices[0].message && typeof data.choices[0].message.content === 'string') {
            output = data.choices[0].message.content;
        }
        return output
            .split('\n')
            .map(s => s.replace(/^\d+\.\s*/, '').trim().toLowerCase())
            .filter(Boolean);
    } catch (err) {
        console.error("Rephrase error: ", err.message);
        return [];
    }
}
