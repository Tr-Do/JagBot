import { route, getContext } from './core/logic.js';
import { addHumanMessage, addBotMessage } from './components/chat.js';

let cooldown = false;
const userCooldown = new Map();
const userMessageCount = new Map();
const cooldown_time = 3000;
const abuse_window = 30000;
const abuse_limit = 10;

// Message rate limiting
function handleMessage(userId, message, now = Date.now()) {
    if (userCooldown.has(userId) && now - userCooldown.get(userId) < cooldown_time){
        return {blocked:true, reason: 'cooldown'}
    }
}

// Track abuse
if (!userMessageCount.has(userId)) {
    userMessageCount.set(userId, []);
}
const allTimestamp = userMessageCount.get(userId);
// filter out old timestamp
const lastTImestamp = allTimestamp.filter(timestamp => (now - timestamp) < abuse_window);
lastTimestamp.push(now);
userMessageCount.set(userId, lastTImestamp);

function logInteraction(userInput, botReply) {
    const context = getContext();
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        userInput,
        botReply,
        contextSnapshot: context
    }, null, 2))
}

// Remove block after validation
userCooldown.set(userId, now);
return {block:false};

// Add event to send button
document.getElementById('sendbtn').addEventListener('click', function () {
    const inputt = document.getElementById('prompt')
    const content = inputt.value.replace(/\s+/g, ' ').trim();           // Remove empty space, sanitize input

    if (!content) return;                             // Return if input has empty space

    if (cooldown) {
       
        return;
    }

    cooldown = true;

// Delay user sending message
    setTimeout(() => {
        cooldown = false;
    }, 3000);

    addHumanMessage(content);
    inputt.value = ''

// Delay bot response
    setTimeout(() => {
        const reply =  route(content);
        addBotMessage(reply);
        logInteraction(content, reply);

        const log = document.querySelector('.log');
        log.scrollTop = log.scrollHeight;
    }, 1000)               // Make chat log stay at the bottom
})

// Add event to Enter key
document.getElementById('prompt').addEventListener('keydown', function (e) {
    if (e.key == 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('sendbtn').click();
    }
})