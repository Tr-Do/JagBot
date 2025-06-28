import {getLLMResponse} from "../utils/llm.js";
import {getTuitionData} from "../core/scraper/tuition.js"
let context = {
    lastIntent: null,
    memory: [],
    turnCount: 0
};

export async function route(input) {
    input = input.toLowerCase();
    context.turnCount += 1;
    context.memory.push(input);

    if (input.includes('schedule')) {
        context.lastIntent = 'schedule';
        return 'You can check your schedule here';
    }
    if (input.includes('tuition')) {
        const tuition = await getTuitionData();
        if (Ojbject.keys(tuition).length === 0) return 'No tution data found.';

        let output = '2025-2026 Tuition costs:\n';
        for (cost [k, v] of Object.entries(tuition)) {
            output += `-${k}: ${v}\n`;
        }
        return output.trim();
    }

    if (context.lastIntent === 'tuition' && input.includes('deadline')) {
        return 'The tuition payment deadline is today'
    }
    if (context.lastIntent === 'schedule' && input.includes('change')) {
        return 'To change your schedule, click here'
    }
    
    const gptResponse = await getLLMResponse(input);
    return gptResponse;
}

export function getContext() {
    return Object.assign({}, context)
}
