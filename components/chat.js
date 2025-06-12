import { getTime } from '../utils/time.js';
import { route } from '../core/logic.js';

window.addEventListener('DOMContentLoaded', function () {
    const log = this.document.querySelector('.log');
    log.scrollTop = log.scrollHeight;
})

export function addHumanMessage(text) {
    const log = document.querySelector('.log');
    const msg = document.createElement('div');
    const time = document.createElement('span');

    msg.className = 'human'
    time.className = 'timestamp';

    msg.textContent = text;
    time.textContent = getTime();

    log.appendChild(msg);
    log.appendChild(time);
    log.scrollTop = log.scrollHeight;
}

export function addBotMessage(text) {
    const log = document.querySelector('.log');
    const msg = document.createElement('div');
    const time = document.createElement('span');

    msg.className = 'bot'
    time.className = 'timerep';

    msg.textContent = route(text)
    time.textContent = getTime();

    log.appendChild(msg);
    log.appendChild(time);
}