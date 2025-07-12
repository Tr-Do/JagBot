const userCooldown = new Map();
const userMessageCount = new Map();
const cooldown_time = 5000;
const abuse_window = 5000;
const abuse_limit = 10;

// Message rate limiting
export function handleMessage(userId, message, now = Date.now()) {
    if (userCooldown.has(userId) && now - userCooldown.get(userId) < cooldown_time){
        return {blocked:true, reason: 'cooldown'};
    }


    // Track abuse
    if (!userMessageCount.has(userId)) {
        userMessageCount.set(userId, []);
    }
    const allTimestamp = userMessageCount.get(userId);

    // filter out old timestamp
    const lastTimestamp = allTimestamp.filter(timestamp => (now - timestamp) < abuse_window);
    lastTimestamp.push(now);
    userMessageCount.set(userId, lastTimestamp);

    // Block abuse
    if (lastTimestamp.length > abuse_limit) {
        return {blocked: true, reason: 'abuse'};
    }

    // Remove block after validation
    userCooldown.set(userId, now);
    return {blocked: false};
}