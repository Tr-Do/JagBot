import { getLLMResponse } from "../utils/llm.js";
import fs from 'fs';
const logPath = '/logs/unmatched_input.log'

function logUnmatched(input, memory) {
    const line = JSON.stringify({
        timestamp: new Date().toISOString(),
        input,
        memory
    }) + '\n';
    fs.appendFile(logPath, line, err => {
        if (err) console.error('Log write failed:', err);
    });
}

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

    logUnmatched(input, [...context.memory]);
    return "I don't have that information";
}

export function getContext() {
    return Object.assign({}, context)
}