import { getTime } from '../utils/time.js';

window.addEventListener('DOMContentLoaded', function () {
    const log = this.document.querySelector('.log');
    log.scrollTop = log.scrollHeight;
})


export function addHumanMessage(text) {
    const log = document.querySelector('.log');
    console.log(log);
    const msg = document.createElement('div');
    const time = document.createElement('span');

    msg.className = 'human'
    time.className = 'timestamp';

    msg.textContent = text;
    time.textContent = getTime();

    console.log('msg', msg);
    console.log('time', getTime());

    log.appendChild(msg);
    log.appendChild(time);
}

export function addBotMessage() {
    const log = document.querySelector('.log');
    const msg = document.createElement('div');
    const time = document.createElement('span');

    msg.className = 'bot'
    time.className = 'timerep';

    msg.textContent = "WHERE IS JOHN CONNOR???";
    time.textContent = getTime();

    log.appendChild(msg);
    log.appendChild(time);
}