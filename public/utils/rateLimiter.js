const userCooldown = new Map();     // Track user cooldown timestamp to enforce delay between messages
const userMessageCount = new Map();     // Track recent message timestamp for abuse detection
const cooldown_time = 5000;
const abuse_window = 5000;
const abuse_limit = 10;

export function handleMessage(userId, message, now = Date.now()) {
    if (userCooldown.has(userId) && now - userCooldown.get(userId) < cooldown_time) {
        return { blocked: true, reason: 'cooldown' };
    }

    if (!userMessageCount.has(userId)) {
        userMessageCount.set(userId, []);
    }
    const allTimestamp = userMessageCount.get(userId);

    // Keep timestamp within abuse window
    const lastTimestamp = allTimestamp.filter(timestamp => (now - timestamp) < abuse_window);
    lastTimestamp.push(now);
    userMessageCount.set(userId, lastTimestamp);

    if (lastTimestamp.length > abuse_limit) {
        return { blocked: true, reason: 'abuse' };
    }

    userCooldown.set(userId, now);
    return { blocked: false };
}