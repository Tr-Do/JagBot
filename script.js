// Add event to send button
document.getElementById('sendbtn').addEventListener('click', function() {
    const inputt = document.getElementById('prompt')
    const msg = document.createElement('div');
    
    msg.className = 'msg-sent';
    msg.textContent = inputt.value;
    
    // Append sent message
    document.querySelector('.log').appendChild(msg);

    // Clear input
    inputt.value = ''  
})

// Add event to Enter key
document.getElementById('prompt').addEventListener('keydown', function(e) {
    if (e.key == 'Enter' && !e.shiftKey) {
        e.preventDefault();
        document.getElementById('sendbtn').click();
    }
})