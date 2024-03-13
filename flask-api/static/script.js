// Establish connection with the server
const socket = io.connect();

// Initialize currentPath to root
let currentPath = "/";

// Event listener for successful connection
socket.on("connect", function () {
    // Append message to terminal indicating successful connection
    appendToTerminal("Connected to server", "system");
    // Update terminal prompt
    updatePrompt();
});

// Event listener for disconnection
socket.on("disconnect", function () {
    // Append message to terminal indicating disconnection
    appendToTerminal("Disconnected from server", "system");
});

// Event listener for receiving terminal output from server
socket.on("terminal_output", function (data) {
    // Append received data to terminal
    appendToTerminal(data);
});

// Function to send command to the server
function sendCommand() {
    // Get the input element
    const commandInput = document.getElementById("commandInput");
    // Get the trimmed value of the input
    let command = commandInput.value.trim();

    // If the command is not empty
    if (command !== "") {
        // Remove whitespace characters at positions that are multiples of 51
        command = removeWhiteSpaceAndNewlineAtMultipleOf51(command);

        // Emit the command to the server
        socket.emit("terminal_input", command);
        // Append the command to the terminal as input
        appendToTerminal("> " + command, "input");
        // Clear the input field
        commandInput.value = "";
    }
}

// Function to remove whitespace and newline characters at positions that are multiples of 51
function removeWhiteSpaceAndNewlineAtMultipleOf51(command) {
    let modifiedCommand = "";
    for (let i = 0; i < command.length; i++) {
        // Check if the character is a whitespace or newline and its position is a multiple of 51
        if ((command[i] === ' ' || command[i] === '\n') && (i + 1) % 51 === 0) {
            // Skip adding whitespace or newline at this position
            continue;
        }
        // Add the character to the modified command
        modifiedCommand += command[i];
    }
    return modifiedCommand;
}



// Event listener for Enter key press in the input field
document.getElementById("commandInput").addEventListener("keypress", function (e) {
    // If Enter key is pressed, send the command
    if (e.key === "Enter") {
        sendCommand();
    }
});

// Function to update the terminal prompt
function updatePrompt() {
    // Send a command to the server to get current directory
    socket.emit("terminal_input", "pwd");
}

// Function to append text to the terminal
function appendToTerminal(text) {
    // Get the terminal element
    const terminal = document.getElementById("terminal");
    // Create a span element
    const span = document.createElement("span");
    // Set the text content of the span
    span.textContent = text;
    // Append the span and line break to the terminal
    terminal.appendChild(span);
    terminal.appendChild(document.createElement("br"));
    // Scroll to the bottom of the terminal
    terminal.scrollTop = terminal.scrollHeight;
}

// Event listener for receiving current directory from server
socket.on("current_directory", function (directory) {
    // Update currentPath with the received directory
    currentPath = directory.trim();
    // Update the prompt in the UI
    document.getElementById("prompt").textContent = currentPath + " >";
});

// Event listener for receiving command response from server
socket.on("command_response", function () {
    // Update the terminal prompt
    updatePrompt();
});

// Function to limit the length of pasted text in an input field
function limitPasteLength(event) {
    // Get the pasted text
    const pastedText = (event.clipboardData || window.clipboardData).getData("text");

    // Set the maximum allowed length
    const maxLength = 110;

    // Prevent pasting if the length exceeds maxLength
    if (pastedText.length > maxLength) {
        event.preventDefault();
        // Show popup message
        showPopup("Maximum length for pasting text exceeded.");
    }
}

function showPopup(message) {
    // Create a div element for the popup message
    const popup = document.createElement("div");
    popup.className = "popup";
    popup.textContent = message;

    // Append the popup to the body
    document.body.appendChild(popup);

    // Hide the popup after 3 seconds
    setTimeout(function () {
        popup.style.display = "none";
        // Remove the popup element from the DOM
        document.body.removeChild(popup);
    }, 3000); // Adjust the time as needed (in milliseconds)
}

// Function to limit the number of characters per line in a textarea
function limitCharactersPerLine(event) {
    const textarea = event.target;
    const maxCharactersPerLine = 50;
    
    // Split the value of the textarea by newline characters
    let lines = textarea.value.split('\n');
    
    // Loop through each line and truncate if necessary
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].length > maxCharactersPerLine) {
            // Split the line into chunks of maxCharactersPerLine length
            const chunks = [];
            while (lines[i].length > maxCharactersPerLine) {
                chunks.push(lines[i].substring(0, maxCharactersPerLine));
                lines[i] = lines[i].substring(maxCharactersPerLine);
            }
            // Push the remaining part of the line as a new chunk
            chunks.push(lines[i]);
            // Join the chunks with newline characters
            lines = lines.slice(0, i).concat(chunks).concat(lines.slice(i + 1));
        }
    }
    
    // Join the lines back together and update the value of the textarea
    textarea.value = lines.join('\n');
}


