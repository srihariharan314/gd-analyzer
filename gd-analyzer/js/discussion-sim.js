// ============================================
// FILE: js/discussion-sim.js - UPGRADED GLASS LAGOON
// PRESERVES ALL EXISTING SPEECH & CONVERSATION LOGIC
// ============================================

import { auth } from '../firebase-config.js';
import { getCurrentUser, aiPersonalities, saveDiscussionSession, generateAIResponse, analyzeDiscussionPerformance } from '../gd-service.js';

// Discussion State
let discussionState = {
    topic: '',
    aiParticipants: [],
    messages: [],
    startTime: null,
    timerInterval: null,
    durationTotal: 300,
    timeLeft: 300,
    isActive: true,
    userSpeakingTime: 0,
    userTurns: 0,
    aiResponses: 0,
    voiceEnabled: true,
    currentSpeaker: null,
    analysisResult: null
};

// DOM Elements
const topicTitle = document.getElementById('topicTitle');
const participantsGrid = document.getElementById('participantsGrid');
const messagesContainer = document.getElementById('messagesContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendMessageBtn');
const voiceBtn = document.getElementById('voiceBtn');
const muteBtn = document.getElementById('muteBtn');
const endBtn = document.getElementById('endSessionBtn');
const pauseBtn = document.getElementById('pauseBtn');
const timerDisplay = document.getElementById('sessionTimerDisplay');
const voiceStatusText = document.getElementById('voiceStatusText');
const userTurnsDisplay = document.getElementById('userTurnsCount');
const activeSpeakerDisplay = document.getElementById('activeSpeakerDisplay');

// Post GD Report Elements
const postGdModal = document.getElementById('postGdModal');

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', async () => {
    console.log('⚡ Initializing Glass Lagoon GD Session...');

    let user = null;
    try {
        user = await getCurrentUser();
    } catch (e) {
        console.warn("User auth note:", e);
    }
    if (!user) {
        user = { displayName: 'Candidate Alex', name: 'Candidate Alex', email: 'alex@gdpro.ai' };
    }

    const userName = user.displayName || user.name || (user.email ? user.email.split('@')[0] : 'You');

    // Load session parameters
    discussionState.topic = sessionStorage.getItem('currentTopic') || localStorage.getItem('currentTopic') || 'Will AI Replace Human Jobs or Create New Ones?';
    discussionState.durationTotal = parseInt(sessionStorage.getItem('discussionDuration') || localStorage.getItem('discussionDuration')) || 300;
    discussionState.timeLeft = discussionState.durationTotal;

    const aiCount = parseInt(sessionStorage.getItem('aiCount') || localStorage.getItem('aiCount')) || 5;
    let personalities = [];
    try {
        personalities = JSON.parse(sessionStorage.getItem('aiPersonalities') || localStorage.getItem('aiPersonalities') || '[]');
    } catch {}

    if (topicTitle) {
        topicTitle.textContent = discussionState.topic;
    }

    // Create Participants
    createParticipants(userName, aiCount, personalities);

    // Setup voice recognition handlers (Preserved!)
    setupVoiceControls();

    // Start timer countdown
    startTimer();

    // Welcome statement
    setTimeout(() => {
        addSystemMessage(`The session on "${discussionState.topic}" has officially commenced. Speak naturally or type your opening argument.`);
        
        // AI Opening prompt after 2.5s
        setTimeout(() => {
            triggerAIResponse(null, true);
        }, 2500);
    }, 800);
});

// Create Participants Roster
function createParticipants(userName, count, personalities) {
    // 1. User
    const userNode = {
        id: 'user_1',
        name: `${userName} (You)`,
        isUser: true,
        personality: 'user',
        color: '#06b6d4',
        messageCount: 0
    };

    // 2. AI Participants
    const colors = ['#10b981', '#f43f5e', '#8b5cf6', '#f59e0b', '#38bdf8', '#ea580c', '#c084fc', '#94a3b8'];
    const defaultPersonas = ['analytical', 'aggressive', 'supportive', 'disruptive', 'balanced', 'logical', 'contrarian', 'leader'];

    discussionState.aiParticipants = [];
    for (let i = 0; i < count; i++) {
        const pData = personalities[i] || { personality: defaultPersonas[i % defaultPersonas.length] };
        const personaKey = pData.personality || 'balanced';
        const personaDetails = aiPersonalities[personaKey] || aiPersonalities.balanced;

        discussionState.aiParticipants.push({
            id: `ai_${i + 1}`,
            name: `AI ${i + 1} (${personaDetails.name})`,
            shortName: personaDetails.name,
            personality: personaKey,
            details: personaDetails,
            color: colors[i % colors.length],
            messageCount: 0
        });
    }

    renderParticipantsRoster(userNode, discussionState.aiParticipants);
}

function renderParticipantsRoster(userNode, aiList) {
    if (!participantsGrid) return;

    let html = `
        <!-- User Node -->
        <div class="glass-panel participant-card" id="participant-user_1" style="padding: 1rem; border-radius: var(--radius-md); display: flex; align-items: center; gap: 0.85rem; border-left: 3px solid var(--lagoon-cyan);">
            <div class="speaking-indicator" id="halo-user_1">
                <div class="sim-avatar-circle" style="background: rgba(6, 182, 212, 0.2); border-color: var(--lagoon-cyan);">
                    👤
                </div>
                <div class="speaking-halo"></div>
            </div>
            <div style="flex: 1; min-width: 0;">
                <div style="font-size: 0.9rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${userNode.name}</div>
                <div style="font-size: 0.75rem; color: var(--lagoon-sky);">Active Candidate</div>
            </div>
            <div class="waveform-bars" id="wave-user_1" style="display: none;">
                <div class="waveform-bar"></div>
                <div class="waveform-bar"></div>
                <div class="waveform-bar"></div>
            </div>
        </div>
    `;

    aiList.forEach(ai => {
        html += `
            <div class="glass-panel participant-card" id="participant-${ai.id}" style="padding: 1rem; border-radius: var(--radius-md); display: flex; align-items: center; gap: 0.85rem; border-left: 3px solid ${ai.color};">
                <div class="speaking-indicator" id="halo-${ai.id}">
                    <div class="sim-avatar-circle" style="background: ${ai.color}22; border-color: ${ai.color};">
                        🤖
                    </div>
                    <div class="speaking-halo"></div>
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 0.9rem; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${ai.name}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${ai.details.traits.slice(0, 2).join(', ')}</div>
                </div>
                <div class="waveform-bars" id="wave-${ai.id}" style="display: none;">
                    <div class="waveform-bar"></div>
                    <div class="waveform-bar"></div>
                    <div class="waveform-bar"></div>
                </div>
            </div>
        `;
    });

    participantsGrid.innerHTML = html;
}

function setActiveSpeakerUI(speakerId, speakerName) {
    discussionState.currentSpeaker = speakerId;

    if (activeSpeakerDisplay) {
        activeSpeakerDisplay.textContent = speakerName || 'Idle / Waiting';
    }

    // Toggle halos and waveforms
    document.querySelectorAll('.speaking-indicator').forEach(el => el.classList.remove('speaking-active'));
    document.querySelectorAll('.waveform-bars').forEach(el => el.style.display = 'none');

    if (speakerId) {
        const halo = document.getElementById(`halo-${speakerId}`);
        const wave = document.getElementById(`wave-${speakerId}`);
        if (halo) halo.classList.add('speaking-active');
        if (wave) {
            wave.style.display = 'flex';
            wave.classList.add('active');
        }
    }
}

// ==================== VOICE RECOGNITION (PRESERVED) ====================

function setupVoiceControls() {
    if (!window.voiceManager) {
        console.warn('VoiceManager not yet globally initialized');
        return;
    }

    if (voiceBtn) {
        voiceBtn.addEventListener('click', toggleVoiceListening);
    }

    if (muteBtn) {
        muteBtn.addEventListener('click', toggleMute);
    }

    if (sendBtn) {
        sendBtn.addEventListener('click', () => sendUserMessage(false));
    }

    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendUserMessage(false);
            }
        });
    }

    if (endBtn) {
        endBtn.addEventListener('click', endSession);
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', togglePause);
    }
}

function toggleVoiceListening() {
    if (!window.voiceManager) return;

    if (window.voiceManager.isListening) {
        window.voiceManager.stopListening();
        setActiveSpeakerUI(null);
        if (voiceStatusText) voiceStatusText.innerHTML = '<span style="color: var(--text-muted);">Microphone standby. Click to speak.</span>';
    } else {
        const started = window.voiceManager.startListening(handleUserSpeech);
        if (started) {
            setActiveSpeakerUI('user_1', 'You (Speaking)');
            if (voiceStatusText) voiceStatusText.innerHTML = '<span style="color: var(--lagoon-cyan);"><i class="fas fa-microphone-lines"></i> Listening... Speak naturally</span>';
        }
    }
}

function handleUserSpeech(speechData) {
    if (speechData.interim && messageInput) {
        messageInput.placeholder = `Listening: ${speechData.interim}...`;
    }

    if (speechData.final) {
        if (messageInput) {
            messageInput.placeholder = 'Type your response or speak...';
            messageInput.value = speechData.final;
        }

        // Auto-transmit user speech after brief pause
        setTimeout(() => {
            sendUserMessage(true);
        }, 500);
    }
}

function toggleMute() {
    discussionState.voiceEnabled = !discussionState.voiceEnabled;
    if (muteBtn) {
        muteBtn.innerHTML = discussionState.voiceEnabled
            ? '<i class="fas fa-volume-up"></i> <span>Mute Audio</span>'
            : '<i class="fas fa-volume-mute"></i> <span>Unmute Audio</span>';
    }
    if (!discussionState.voiceEnabled && window.voiceManager) {
        window.voiceManager.stopSpeaking();
    }
}

// ==================== CONVERSATION & TRANSMISSION ====================

function sendUserMessage(fromVoice = false) {
    if (!discussionState.isActive) return;

    const message = messageInput ? messageInput.value.trim() : '';
    if (!message) return;

    addUserMessage(message, fromVoice);

    if (messageInput) {
        messageInput.value = '';
    }

    discussionState.userTurns++;
    if (userTurnsDisplay) {
        userTurnsDisplay.textContent = discussionState.userTurns;
    }

    // Stop listening while AI responds so AI speech is not recognized
    if (window.voiceManager && window.voiceManager.isListening) {
        window.voiceManager.stopListening();
    }
    setActiveSpeakerUI(null);

    // Trigger AI response turn
    setTimeout(() => {
        triggerAIResponse(message);
    }, 1200);
}

function addUserMessage(message, fromVoice = false) {
    const msgEl = document.createElement('div');
    msgEl.className = 'glass-card';
    msgEl.style.padding = '1.25rem';
    msgEl.style.marginBottom = '1rem';
    msgEl.style.borderLeft = '4px solid var(--lagoon-cyan)';
    msgEl.style.background = 'rgba(6, 182, 212, 0.08)';

    msgEl.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-weight: 700; color: var(--lagoon-cyan);">You</span>
                <span class="badge badge-cyan" style="font-size: 0.68rem; padding: 0.15rem 0.5rem;">
                    ${fromVoice ? '<i class="fas fa-microphone"></i> Voice' : '<i class="fas fa-keyboard"></i> Text'}
                </span>
            </div>
            <span style="font-size: 0.75rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;">
                ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
        </div>
        <p style="color: #f1f5f9; font-size: 0.92rem; line-height: 1.6;">${message}</p>
    `;

    if (messagesContainer) {
        messagesContainer.appendChild(msgEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    discussionState.messages.push({
        type: 'user',
        content: message,
        fromVoice: fromVoice,
        timestamp: new Date().toISOString()
    });
}

function addSystemMessage(text) {
    const msgEl = document.createElement('div');
    msgEl.style.padding = '0.75rem 1.25rem';
    msgEl.style.borderRadius = 'var(--radius-md)';
    msgEl.style.background = 'rgba(15, 23, 42, 0.6)';
    msgEl.style.border = '1px solid rgba(255, 255, 255, 0.06)';
    msgEl.style.color = 'var(--text-secondary)';
    msgEl.style.fontSize = '0.85rem';
    msgEl.style.textAlign = 'center';
    msgEl.style.marginBottom = '1rem';
    msgEl.innerHTML = `<span><i class="fas fa-info-circle" style="color: var(--lagoon-sky);"></i> ${text}</span>`;

    if (messagesContainer) {
        messagesContainer.appendChild(msgEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

// Trigger AI Response (Preserved Turn Engine)
async function triggerAIResponse(userMessage, isFirstMessage = false) {
    if (!discussionState.isActive) return;

    // Pick 1 or 2 AIs to respond in this turn
    const numResponses = isFirstMessage ? 1 : (Math.random() < 0.35 ? 2 : 1);

    for (let i = 0; i < numResponses; i++) {
        if (!discussionState.isActive) break;

        const availableAIs = discussionState.aiParticipants.filter(ai =>
            ai.messageCount < 12 && (!discussionState.messages.length || discussionState.messages[discussionState.messages.length - 1].aiId !== ai.id)
        );
        if (availableAIs.length === 0) break;

        const ai = availableAIs[Math.floor(Math.random() * availableAIs.length)];

        // Show typing
        showTypingIndicator(ai);

        let response = '';
        if (isFirstMessage && i === 0) {
            response = `I would like to initiate by stating that "${discussionState.topic}" presents critical questions about workforce readiness. What are the key foundational pillars we should evaluate first?`;
            await new Promise(r => setTimeout(r, 1600));
        } else {
            const userName = 'Candidate';
            response = await generateAIResponse(ai.personality, discussionState.topic, discussionState.messages, userName);
        }

        removeTypingIndicator(ai);
        if (!discussionState.isActive) break;

        // Render AI Message
        const msgEl = document.createElement('div');
        msgEl.className = 'glass-card';
        msgEl.style.padding = '1.25rem';
        msgEl.style.marginBottom = '1rem';
        msgEl.style.borderLeft = `4px solid ${ai.color}`;

        msgEl.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span style="font-weight: 700; color: ${ai.color};">🤖 ${ai.name}</span>
                    <span class="badge" style="background: ${ai.color}22; color: ${ai.color}; border: 1px solid ${ai.color}44; font-size: 0.65rem;">
                        ${ai.details.name}
                    </span>
                </div>
                <span style="font-size: 0.75rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;">
                    ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
            <p style="color: #cbd5e1; font-size: 0.92rem; line-height: 1.6;">${response}</p>
        `;

        if (messagesContainer) {
            messagesContainer.appendChild(msgEl);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        discussionState.messages.push({
            type: 'ai',
            aiId: ai.id,
            aiName: ai.name,
            personality: ai.personality,
            content: response,
            timestamp: new Date().toISOString()
        });

        discussionState.aiResponses++;
        ai.messageCount++;

        // Speech synthesis playback
        setActiveSpeakerUI(ai.id, ai.name);
        if (window.voiceManager && discussionState.voiceEnabled) {
            await window.voiceManager.speak(response, ai.details);
        }
        setActiveSpeakerUI(null);
    }

    // Re-activate microphone listening if session remains active
    if (discussionState.isActive && window.voiceManager && !window.voiceManager.isListening) {
        window.voiceManager.startListening(handleUserSpeech);
        setActiveSpeakerUI('user_1', 'You (Your turn)');
    }
}

function showTypingIndicator(ai) {
    if (!messagesContainer) return;
    const typingEl = document.createElement('div');
    typingEl.id = `typing-${ai.id}`;
    typingEl.style.padding = '0.75rem 1.25rem';
    typingEl.style.borderRadius = 'var(--radius-md)';
    typingEl.style.background = 'rgba(15, 23, 42, 0.4)';
    typingEl.style.color = ai.color;
    typingEl.style.fontSize = '0.85rem';
    typingEl.style.marginBottom = '1rem';
    typingEl.innerHTML = `<span><span class="spinner-lagoon" style="width: 14px; height: 14px; border-top-color: ${ai.color}; margin-right: 0.5rem;"></span> 🤖 ${ai.name} is formulating arguments...</span>`;
    messagesContainer.appendChild(typingEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator(ai) {
    const el = document.getElementById(`typing-${ai.id}`);
    if (el) el.remove();
}

// ==================== TIMER & CONTROLS ====================

function startTimer() {
    discussionState.startTime = Date.now();
    discussionState.timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    if (!discussionState.isActive) return;

    discussionState.timeLeft--;
    const m = Math.floor(discussionState.timeLeft / 60);
    const s = discussionState.timeLeft % 60;

    if (timerDisplay) {
        timerDisplay.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    if (discussionState.timeLeft <= 0) {
        endSession();
    }
}

function togglePause() {
    discussionState.isActive = !discussionState.isActive;
    if (pauseBtn) {
        pauseBtn.innerHTML = discussionState.isActive
            ? '<i class="fas fa-pause"></i> <span>Pause</span>'
            : '<i class="fas fa-play"></i> <span>Resume</span>';
    }

    if (!discussionState.isActive) {
        clearInterval(discussionState.timerInterval);
        if (window.voiceManager) {
            window.voiceManager.stopListening();
            window.voiceManager.stopSpeaking();
        }
        setActiveSpeakerUI(null);
    } else {
        startTimer();
        if (window.voiceManager) {
            window.voiceManager.startListening(handleUserSpeech);
            setActiveSpeakerUI('user_1', 'You');
        }
    }
}

// ==================== POST GD REPORT & EVALUATION ====================

async function endSession() {
    if (!discussionState.isActive) return;
    discussionState.isActive = false;
    clearInterval(discussionState.timerInterval);

    if (window.voiceManager) {
        window.voiceManager.stopListening();
        window.voiceManager.stopSpeaking();
    }
    setActiveSpeakerUI(null);

    // Run 8-Dimensional Analysis
    const durationSpent = discussionState.durationTotal - discussionState.timeLeft;
    const analysis = analyzeDiscussionPerformance(discussionState.messages, durationSpent, discussionState.topic);
    discussionState.analysisResult = analysis;

    // Save session
    await saveDiscussionSession({
        topic: discussionState.topic,
        aiCount: discussionState.aiParticipants.length,
        personalities: discussionState.aiParticipants.map(ai => ai.personality),
        duration: durationSpent,
        transcript: discussionState.messages,
        score: analysis.overallScore,
        analysis: analysis,
        speakingTime: discussionState.userTurns * 15
    });

    renderPostGdReport(analysis);
}

function renderPostGdReport(analysis) {
    if (!postGdModal) return;
    postGdModal.style.display = 'flex';

    // Set overall score
    const scoreVal = document.getElementById('reportOverallScore');
    if (scoreVal) scoreVal.textContent = analysis.overallScore;

    // Set Strengths
    const strList = document.getElementById('reportStrengthsList');
    if (strList) {
        strList.innerHTML = analysis.strengths.map(s => `
            <li style="margin-bottom: 0.5rem; display: flex; align-items: flex-start; gap: 0.5rem; color: #e2e8f0; font-size: 0.88rem;">
                <i class="fas fa-check-circle" style="color: var(--lagoon-emerald); margin-top: 0.25rem;"></i>
                <span>${s}</span>
            </li>
        `).join('');
    }

    // Set Areas to Improve
    const weakList = document.getElementById('reportWeaknessesList');
    if (weakList) {
        weakList.innerHTML = analysis.weaknesses.map(w => `
            <li style="margin-bottom: 0.5rem; display: flex; align-items: flex-start; gap: 0.5rem; color: #e2e8f0; font-size: 0.88rem;">
                <i class="fas fa-circle-exclamation" style="color: var(--lagoon-amber); margin-top: 0.25rem;"></i>
                <span>${w}</span>
            </li>
        `).join('');
    }

    // Best & Weakest Quotes
    const bestEl = document.getElementById('reportBestQuote');
    const weakQuoteEl = document.getElementById('reportWeakQuote');
    const betterEl = document.getElementById('reportBetterResponse');

    if (bestEl) bestEl.textContent = `"${analysis.bestContribution}"`;
    if (weakQuoteEl) weakQuoteEl.textContent = `"${analysis.weakestContribution}"`;
    if (betterEl) betterEl.textContent = analysis.betterResponse;

    // Strategy & Recommendation
    const stratEl = document.getElementById('reportStrategy');
    const recEl = document.getElementById('reportRecommendation');
    if (stratEl) stratEl.textContent = analysis.gdStrategy;
    if (recEl) recEl.textContent = analysis.recommendation;

    // Initialize Radar Chart in Modal
    initModalRadarChart(analysis.scores);
}

function initModalRadarChart(scores) {
    const ctx = document.getElementById('reportRadarChart');
    if (!ctx) return;

    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Communication', 'Content', 'Confidence', 'Relevance', 'Fluency', 'Leadership', 'Participation', 'Listening'],
            datasets: [{
                label: 'Candidate Score',
                data: [
                    scores.communication,
                    scores.contentQuality,
                    scores.confidence,
                    scores.relevance,
                    scores.fluency,
                    scores.leadership,
                    scores.participation,
                    scores.listening
                ],
                backgroundColor: 'rgba(6, 182, 212, 0.25)',
                borderColor: '#06b6d4',
                borderWidth: 2.5,
                pointBackgroundColor: '#38bdf8',
                pointBorderColor: '#fff',
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                    grid: { color: 'rgba(255, 255, 255, 0.08)' },
                    pointLabels: {
                        color: '#94a3b8',
                        font: { family: 'Plus Jakarta Sans', size: 10.5, weight: '600' }
                    },
                    ticks: { display: false, min: 40, max: 100 }
                }
            },
            plugins: { legend: { display: false } }
        }
    });
}