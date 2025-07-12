import { getLLMResponse, getLLMRephrases } from "../utils/llm.js";


let faq = [];
const AI_INTENT = new Set(['course_advising', 'event_summary']);

async function loadFAQ() {
    const res = await fetch('../data/faq.json');
    faq = await res.json();
}

await loadFAQ();

let context = {
    lastIntent: null,
    memory: [],
    turnCount: 0
};

export async function route(input) {
    input = input.toLowerCase();
    context.turnCount += 1;
    context.memory.push(input)

    for (const [key, value] of Object.entries(faq)) {
        if (typeof value === 'object' && value.trigger) {
            if (value.trigger.some(a => input.includes(a))) {
                context.lastIntent = key;
                return value.response;
            }
        } else if (typeof value === 'string' && input.includes(key)) {
            context.lastIntent = key;
            return value;
        }
    }

    // Rephrase user query to to match faq content
    const rephrase = await getLLMRephrases(input);

    for (const phrase of rephrase) {
        for (const [key, value] of Object.entries(faq)) {
            if (typeof value === 'object' && value.trigger) {
                if (value.trigger.some(t => phrase.includes(t))) {
                    context.lastIntent = key;
                    return value.response;
                }
            }
        }
    }

    // Initiate AI to response content outside faq and based on tamusa.edu
    if (context.lastIntent && AI_INTENT.has(context.lastIntent)) {
        const aiResponse = await getLLMResponse(input);
        return aiResponse;
    }
    // Quantify frequent queries
    console.warn("[UNMATCHED INPUT]", {
        input,
        timestamp: new Date().toISOString(),
        memory: [...context.memory]
    });
    if (context.lastIntent && AI_INTENT.has(context.lastIntent)) {
        const aiResponse = await getLLMResponse(input);
        return aiResponse;
    }
    const token = sessionStorage.getItem('accessToken');
    fetch(`http://localhost:3000/log-unmatched?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            timestamp: new Date().toISOString(),
            input,
            memory: [...context.memory]
        })
    });
    return "I don't have that information";
}

export function getContext() {
    return Object.assign({}, context)
}