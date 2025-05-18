// Initialize voice commands
function setupVoiceCommands() {
    if (!annyang) {
        console.error("Annyang not loaded");
        return;
    }

    // Add our commands
    const commands = {
        'hello': function() {
            alert('Hello there!');
        },
        'change the color to *color': function(color) {
            try {
                document.body.style.backgroundColor = color.toLowerCase();
            } catch (e) {
                console.error("Error changing color:", e);
            }
        },
        'navigate to *page': function(page) {
            const normalizedPage = page.toLowerCase().trim();
            if (normalizedPage === 'home') {
                window.location.href = 'home.html';
            } else if (normalizedPage === 'stocks') {
                window.location.href = 'stocks.html';
            } else if (normalizedPage === 'dogs') {
                window.location.href = 'dogs.html';
            }
        }
    };

    // Add commands and start (but paused)
    annyang.addCommands(commands);
    
    // Set language to English explicitly
    annyang.setLanguage('en-US');
    
    // Debugging
    annyang.addCallback('error', function(err) {
        console.error('Voice command error:', err);
    });
    
    annyang.addCallback('errorPermissionBlocked', function() {
        alert('Microphone access was blocked. Please enable it in your browser settings.');
    });
    
    annyang.addCallback('errorPermissionDenied', function() {
        alert('Microphone access was denied. Please enable it to use voice commands.');
    });
}

// Audio control buttons functionality
document.addEventListener('DOMContentLoaded', function() {
    const audioOnBtn = document.getElementById('audio-on');
    const audioOffBtn = document.getElementById('audio-off');
    
    if (!annyang) {
        console.error("Annyang not available");
        audioOnBtn.disabled = true;
        audioOffBtn.disabled = true;
        return;
    }
    
    audioOnBtn.addEventListener('click', function() {
        // First request microphone permission
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                // Permission granted - start voice recognition
                annyang.start({ autoRestart: true, continuous: false });
                alert("Voice commands activated! Try saying 'Hello'");
                console.log("Voice recognition started");
            })
            .catch(function(err) {
                console.error("Microphone access error:", err);
                alert("Could not access microphone. Please check permissions.");
            });
    });
    
    audioOffBtn.addEventListener('click', function() {
        annyang.abort();
        alert("Voice commands deactivated");
        console.log("Voice recognition stopped");
    });
    
    // Initialize commands (but don't start listening yet)
    setupVoiceCommands();
});