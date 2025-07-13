import { route, getContext } from './core/logic.js';
import { addHumanMessage, addBotMessage } from './components/chat.js';
import { handleMessage } from './utils/rateLimiter.js';

function logInteraction(userInput, botReply) {
    const context = getContext();
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        userInput,
        botReply,
        contextSnapshot: context
    }, null, 2))
}

document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('prompt');
    if (!input) return;

    // Focus cursor on input upon loading
    input.focus();

    // Refocus when clicking outside input
    document.addEventListener('click', (e) => {
        if (e.target !== input && !input.contains(e.target)) {
            input.focus();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (document.activeElement !== input && e.key.length === 1) {
            input.focus();
        }
    });
});

// validate token
function isTokenValid() {
    const issuedAt = parseInt(sessionStorage.getItem('tokenTimestamp'), 10);
    return Date.now() - issuedAt <= 30 * 60 * 1000;
}

// Add event to send button
document.getElementById('sendbtn').addEventListener('click', function () {
    const inputt = document.getElementById('prompt')
    const content = inputt.value.replace(/\s+/g, ' ').trim();           // Remove empty space, sanitize input

    if (!content) {
        return;
    }
    const result = handleMessage('default-user');
    if (result.blocked) {
        let warning = '';

        if (result.reason === 'cooldown') {
            warning = 'Please wait before sending another message'
        } else if (result.reason === 'abuse') {
            warning = 'Too many message. Calm down';
        } else {
            warning = 'Access blocked';
        }
        addBotMessage(warning);
        return;
    }

    addHumanMessage(content);
    inputt.value = ''

    // Disable textarea while waiting for bot reply
    const input = document.getElementById('prompt');
    input.disabled = true;
    input.placeholder = 'Waiting for response...';

    setTimeout(async () => {
        const reply = await route(content);
        addBotMessage(reply);
        logInteraction(content, reply);

        const log = document.querySelector('.log');
        log.scrollTop = log.scrollHeight;

        input.disabled = false;
        input.placeholder = 'Type in your question...';
        input.focus();
    }, 1000);
})

// Add event to Enter key
document.getElementById('prompt').addEventListener('keydown', function (e) {
    if (e.key == 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('sendbtn').click();
    }
})

// Generate token
async function fetchTokenFromServer() {
    const res = await fetch('http://localhost:3000/api/token/generate-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: 'guest' })
    });
    const data = await res.json();
    return data.token;
}

