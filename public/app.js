import { route, getContext } from './core/logic.js';
import { addHumanMessage, addBotMessage } from './components/chat.js';
import { handleMessage } from './utils/rateLimiter.js';

// Validate token on load to unlock chat UI
(async () => {
    const token = sessionStorage.getItem('access_token');
    if (!token) return;

    const res = await fetch('/api/token/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    });
    const data = await res.json();
    if (res.ok && data.valid) {
        document.getElementById('token-gate').style.display = 'none';
    }
})();

// Log input/output with snapshot for debugging/analysis
function logInteraction(userInput, botReply) {
    const context = getContext();
    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        userInput,
        botReply,
        contextSnapshot: context
    }, null, 2))
}

// Disable chat UI if token is missing or expired
document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('access_token');
    const issueAt = parseInt(sessionStorage.getItem('tokenTimestamp'), 10);
    const isValid = token && Date.now() - issueAt <= 30 * 60 * 1000;

    if (!isValid) {
        console.warn("Token missing or expired. Block all chat");
        document.getElementById('prompt').disabled = true;
        document.getElementById('sendbtn').disabled = true;
        return;
    }
    const input = document.getElementById('prompt');
    input.focus();

    if (isValid) {
        document.getElementById('sendbtn').addEventListener('click', handleSend);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
            }
        });
    }
});

function isTokenValid() {
    const issuedAt = parseInt(sessionStorage.getItem('tokenTimestamp'), 10);
    return Date.now() - issuedAt <= 30 * 60 * 1000;
}

async function validateToken() {
    const token = sessionStorage.getItem('access_token');
    if (!token) return false;

    const res = await fetch('/api/token/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
    });
    const data = await res.json();
    return res.ok && data.valid;
}

async function handleSend() {
    if (!isTokenValid()) return;

    const inputt = document.getElementById('prompt');

    const content = inputt.value.replace(/\s+/g, ' ').trim();
    if (!content)
        return;

    // Block input if user is rate limited
    const result = handleMessage('default-user');
    if (result.blocked) {
        const warning =
            result.reason === 'cooldown' ? 'Please wait before sending another message'
                : result.reason === 'abuse' ? 'Please wait before sending another message'
                    : 'Access blocked';
        addBotMessage(warning);
        return;
    }
    addHumanMessage(content);
    inputt.value = '';
    inputt.disabled = true;
    inputt.placeholder = 'Waiting for response...';

    const log = document.querySelector('.log');
    const typingBubble = document.createElement('div');
    typingBubble.className = 'bot typing-bubble';
    typingBubble.innerHTML = '<span class="dot"></span><span class="dot"></span><span class="dot"></span>';
    log.appendChild(typingBubble);
    log.scrollTop = log.scrollHeight;

    const token = sessionStorage.getItem('access_token');
    const routed = await route(content);

    let reply;
    if (routed) {
        reply = routed;
    } else {
        const response = await fetch('/llm/chat', {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ input: content, token })
        });
        const data = await response.json();
        reply = data.reply || '[Error]'
    }
    typingBubble.remove();
    addBotMessage(reply);
    logInteraction(content, reply);
    log.scrollTop = log.scrollHeight;
    inputt.disabled = false;
    inputt.focus();
}

document.getElementById('submit-token').addEventListener('click', async () => {
    const token = document.getElementById('token-input').value.trim().toUpperCase();
    const errorBox = document.getElementById('token-error');

    const res = await fetch('/api/token/validate', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
    });
    const data = await res.json();

    if (res.ok && data.valid) {
        sessionStorage.setItem('access_token', token);
        sessionStorage.setItem('tokenTimestamp', Date.now().toString());
        document.getElementById('token-gate').style.display = 'none';
    } else {
        errorBox.textContent = 'Invalid or expired token';
    }
});