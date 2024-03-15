const socket = io.connect();
let currentPath = '/';

socket.on('connect', handleConnect);
socket.on('disconnect', handleDisconnect);
socket.on('terminal_output', appendToTerminal);
socket.on('current_directory', updatePrompt);
socket.on('command_response', updatePrompt);

document.getElementById('commandInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendCommand();
    }
});

function handleConnect() {
    appendToTerminal('Connected to server', 'system');
    updatePrompt();
}

function handleDisconnect() {
    appendToTerminal('Disconnected from server', 'system');
}

function sendCommand() {
    const commandInput = document.getElementById('commandInput');
    const command = commandInput.value.trim();
    if (command !== '') {
        socket.emit('terminal_input', command);
        appendToTerminal(`> ${command}`, 'input');
        commandInput.value = '';
    }
}

function updatePrompt(directory) {
    currentPath = directory ? directory.trim() : currentPath;
    document.getElementById('prompt').textContent = `${currentPath} >`;
}

function appendToTerminal(text) {
    const terminal = document.getElementById('terminal');
    const span = document.createElement('span');
    span.textContent = text;
    terminal.appendChild(span);
    terminal.appendChild(document.createElement('br'));
    terminal.scrollTop = terminal.scrollHeight;
}

function limitPasteLength(event) {
    const pastedText = (event.clipboardData || window.clipboardData).getData('text');
    const maxLength = 100; // Ajustez si nécessaire
    if (pastedText.length > maxLength) {
        event.preventDefault();
        console.log('Pasting is not allowed. Maximum length exceeded.');
    }
}

function limitCharactersPerLine(event) {
    const textarea = event.target;
    const maxCharactersPerLine = 90;
    const lines = textarea.value.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].length > maxCharactersPerLine) {
            lines[i] = lines[i].substring(0, maxCharactersPerLine);
        }
    }
    textarea.value = lines.join('\n');
}

