import { getLLMResponse } from "../utils/llm.js";

let faq = [];
const GPT_INTENT = new Set(['course_advising', 'event_summary']);

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

    if (context.lastIntent && GPT_INTENT.has(context.lastIntent)) {
        const gptResponse = await getLLMResponse(input);
        return gptResponse;
    }
    // Quantify frequent queries
    console.warn("[UNMATCHED INPUT]", {
        input,
        timestamp: new Date().toISOString(),
        memory: [...context.memory]
    });
    return "I don't have that information"
}

export function getContext() {
    return Object.assign({}, context)
}