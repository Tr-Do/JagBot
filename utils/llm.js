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
    try {
        console.log("INPUT >>>", input);
        const res = await fetch('http://localhost:3000/rephrase', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ input })
        });
        const data = await res.json()
        return data.rephrased || [];
    } catch (err) {
        console.error("Rephrase error: ", err.message);
        return [];
    }
}
