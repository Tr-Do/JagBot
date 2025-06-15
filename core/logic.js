let context = {
    lastIntent: null,
    memory: [],
    turnCount: 0
};

export function route(input) {
    input = input.toLowerCase();
    context.turnCount += 1;
    context.memory.push(input);

    if (input.includes('schedule')) {
        context.lastIntent = 'schedule';
        return 'You can check your schedule here';
    }
    if (input.includes('tuition')) {
        context.lastIntent = 'tuition';
        return 'Tuition is due today';
    }
    if (context.lastIntent === 'tuition' && input.includes('deadline')) {
        return 'The tuition payment deadline is today'
    }
    if (context.lastIntent === 'schedule' && input.includes('change')) {
        return 'To change your schedule, click here'
    }
    return 'I failed you, Master!'
}

export function getContext() {
    return Object.assign({}, context)
}
