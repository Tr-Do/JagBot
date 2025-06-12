import { route } from './core/logic.js';
import { addHumanMessage, addBotMessage } from './components/chat.js';

// Add event to send button
document.getElementById('sendbtn').addEventListener('click', function () {
    const inputt = document.getElementById('prompt')
    const content = inputt.value.trim();              // Remove empty space

    if (!content) {
        return;                                       // Return if input has empty space
    }

    addHumanMessage(content);
    addBotMessage();

    // Clear input
    inputt.value = ''
    const log = document.querySelector('.log');
    log.scrollTop = log.scrollHeight;                 // Make chat log stay at the bottom
})

// Add event to Enter key
document.getElementById('prompt').addEventListener('keydown', function (e) {
    if (e.key == 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('sendbtn').click();
    }
})
