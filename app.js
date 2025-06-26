    import { route, getContext } from './core/logic.js';
    import { addHumanMessage, addBotMessage } from './components/chat.js';
    import {handleMessage} from '../utils/rateLimiter.js';

    function logInteraction(userInput, botReply) {
        const context = getContext();
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            userInput,
            botReply,
            contextSnapshot: context
        }, null, 2))
    }

    // Add event to send button
    document.getElementById('sendbtn').addEventListener('click', function () {
        const inputt = document.getElementById('prompt')
        const content = inputt.value.replace(/\s+/g, ' ').trim();           // Remove empty space, sanitize input

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