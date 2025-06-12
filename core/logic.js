export function route(input) {
    input = input.toLowerCase();
    if (input.includes('schedule')) return 'Check your schedule here';
    if (input.includes('tuition')) return 'Check your balance here';
    return "I only answer questions relating to academic, clubs, and activities"
}

