window.addEventListener('DOMContentLoaded', function() {
    const log = this.document.querySelector('.log');
    log.scrollTop = log.scrollHeight;
})

// Add event to send button
document.getElementById('sendbtn').addEventListener('click', function() {
    const inputt = document.getElementById('prompt')
    const blank = inputt.value.trim();              // Remove empty space

    if (!blank) {
        return;                       // Return if input has empty space
    }

    // Get current time to display
    function getTime() {
        const now = new Date();
        return now.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit'});
    }
    const msg = document.createElement('div');
    const msg_r = document.createElement('div');

    const time = document.createElement('span');
    time.className = 'timestamp';
    time.textContent = getTime()
    
    msg.className = 'msg-sent'; 
    msg.textContent = inputt.value;
    msg_r.className = 'msg-received';
    msg_r.textContent = "I'm at your disposal!"
    
    // Append sent message
    document.querySelector('.log').appendChild(msg);
    document.querySelector('.log').appendChild(time);

    const time_r = document.createElement('span');
    time_r.className = 'timerep';
    time_r.textContent = getTime()

    // Append reply
    setTimeout(() => {
    document.querySelector('.log').appendChild(msg_r);
    document.querySelector('.log').appendChild(time_r)},
    1000)

    // Clear input
    inputt.value = ''  
    const log = document.querySelector('.log');
    log.scrollTop = log.scrollHeight;               // Make chat log stay at the bottom
})

// Add event to Enter key
document.getElementById('prompt').addEventListener('keydown', function(e) {
    if (e.key == 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('sendbtn').click();
    }
})
