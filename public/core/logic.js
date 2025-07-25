import { getLLMResponse, getLLMRephrases } from "../utils/llm.js";

let faq = [];   // Static trigger loaded at runtime for immediate matching
const AI_INTENT = new Set(['course_advising', 'event_summary']);    // Fallback categories allowed to trigger LLM response if matched

async function loadFAQ() {
    const res = await fetch('../data/faq.json');
    faq = await res.json();
}

// Load offline rules from FAQ JSON for fast rule-based routing
await loadFAQ();

// Session memory to track intent and conversation flow across turns
let context = {
    lastIntent: null,
    memory: [],
    turnCount: 0
};

export async function route(input) {
    input = input.toLowerCase();
    context.turnCount += 1;
    context.memory.push(input)

    // Load static FAQ triggers for offline response before AI fallback
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

    const rephrase = await getLLMRephrases(input);

    // Retry match using LLM rephrasing of user input
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

    // If matched intent is AI, defer to LLM
    if (context.lastIntent && AI_INTENT.has(context.lastIntent)) {
        const aiResponse = await getLLMResponse(input);
        return aiResponse;
    }
    console.warn("[UNMATCHED INPUT]", {
        input,
        timestamp: new Date().toISOString(),
        memory: [...context.memory]
    });
    // Retry AI fallback again if new intent was discovered during rephrase
    if (context.lastIntent && AI_INTENT.has(context.lastIntent)) {
        const aiResponse = await getLLMResponse(input);
        return aiResponse;
    }
    const token = sessionStorage.getItem('accessToken');
    // Forward unmatched input to backend for future coverage expansion
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