// ============================================
// FILE: js/antigravity-ui.js
// Logic for the high-fidelity Anti-Gravity interface
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('Anti-Gravity UI initialized');
    
    // DOM Elements
    const micBtn = document.getElementById('mainMicBtn');
    const statusIndicator = document.getElementById('statusIndicator');
    const statusText = statusIndicator.querySelector('span:not(.dot)');
    const chatHistory = document.getElementById('chatHistory');
    const aiStatusText = document.getElementById('aiStatusText');
    const insightsContainer = document.getElementById('realtimeInsights');
    const groundingPanel = document.getElementById('groundingPanel');
    const dataStream = document.getElementById('dataStream');
    const avatar = document.getElementById('aiAvatar');
    
    // App State
    let isListening = false;
    let currentTopic = localStorage.getItem('currentTopic') || 'AI & Future of Humanity';

    // 1. Initialize UI with starting message
    setTimeout(() => {
        addMessage('ai', 'Systems initialized. I am ready to monitor the discussion and provide grounded evidence.');
    }, 1000);

    // 2. Microphone Interaction
    micBtn.addEventListener('click', toggleListening);

    function toggleListening() {
        if (!window.voiceManager) {
            alert('Voice Manager not found. Please ensure microphone permissions are active.');
            return;
        }

        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }

    function startListening() {
        isListening = true;
        micBtn.classList.add('active');
        updateStatus('listening');
        aiStatusText.textContent = "I'm listening to your point...";
        
        // Use existing voiceManager
        window.voiceManager.startListening((speechData) => {
            if (speechData.final) {
                handleUserPoint(speechData.final);
            }
        });
    }

    function stopListening() {
        isListening = false;
        micBtn.classList.remove('active');
        updateStatus('idle');
        window.voiceManager.stopListening();
    }

    // 3. Main Data Flow: User Point -> Python Server -> UI
    async function handleUserPoint(text) {
        stopListening();
        addMessage('user', text);
        
        // Change to 'Thinking' state
        updateStatus('thinking');
        groundingPanel.classList.add('data-fetching');
        createDataParticles();
        
        aiStatusText.textContent = "Analysing Google data streams...";
        avatar.style.filter = "drop-shadow(0 0 30px #00f2ff)"; // Change glow to cyan

        try {
            // CALL YOUR LOCAL Python SERVER (server.py)
            const response = await fetch('http://localhost:8000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: text,
                    topic: currentTopic
                })
            });

            if (response.ok) {
                const data = await localResponse.json();
                
                // Stop animation
                groundingPanel.classList.remove('data-fetching');
                
                // Add to Insights Panel (Simulation of real-time grounding)
                addInsight(data.response.substring(0, 100) + "...");
                
                // AI Responds
                respondAsAI(data.response);
            } else {
                throw new Error("Local server error");
            }

        } catch (e) {
            console.error("Local server failed, falling back to pattern responses.", e);
            respondAsAI("I'm having trouble accessing my real-time data port, but based on my core training, that's a valid perspective to explore.");
        }
    }

    function respondAsAI(text) {
        updateStatus('speaking');
        aiStatusText.textContent = "Delivering response...";
        avatar.style.filter = "drop-shadow(0 0 40px #bc13fe)"; // Back to purple glow
        
        addMessage('ai', text);
        
        // Speak using voiceManager
        window.voiceManager.speak(text, { name: "Anti-Gravity", rate: 0.9, pitch: 0.85 });
        
        // Reset to idle after a while (or when speaking ends)
        setTimeout(() => {
            updateStatus('idle');
            aiStatusText.textContent = "Attending to discussion...";
        }, 5000);
    }

    // UI Helpers
    function updateStatus(state) {
        statusIndicator.className = `status-badge ${state}`;
        statusText.textContent = state.toUpperCase();
    }

    function addMessage(type, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${type} fading-in`;
        msgDiv.innerHTML = `<div class="msg-content">${text}</div>`;
        chatHistory.appendChild(msgDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function addInsight(snippet) {
        // Clear empty state if needed
        if (insightsContainer.querySelector('.empty-state')) {
            insightsContainer.innerHTML = '';
        }

        const card = document.createElement('div');
        card.className = 'insight-card';
        card.innerHTML = `
            <i class="fas fa-search-plus"></i>
            <strong>Source Grounding:</strong>
            <p>${snippet}</p>
        `;
        insightsContainer.prepend(card);
    }

    function createDataParticles() {
        dataStream.innerHTML = '';
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('div');
            p.className = 'data-particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = (Math.random() * 1 + 0.5) + 's';
            p.style.animationDelay = Math.random() * 2 + 's';
            dataStream.appendChild(p);
        }
    }
});
