import {getLLMResponse} from "../utils/llm.js";
import {getTuitionData} from "../core/scraper/tuition.js"
import faq from '../data/faq.json' assert {type: "json"};

let context = {
    lastIntent: null,
    memory: [],
    turnCount: 0
};

export async function route(input) {
    input = input.toLowerCase();
    context.turnCount += 1;
    context.memory.push(input);

    for (const [key, response] of Object.entries(faq)){
        if (input.includes(key)){
            context.lastIntent = key;
            return response;
        }
    }
    
    const gptResponse = await getLLMResponse(input);
    return gptResponse;
}

export function getContext() {
    return Object.assign({}, context)
}
