// ============================================
// FILE: js/voice-manager.js - WORKING VERSION
// ============================================

class VoiceManager {
    constructor() {
        console.log('🎤 VoiceManager initializing...');

        this.isListening = false;
        this.isSpeaking = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.onUserSpeechCallback = null;
        this.currentUtterance = null;
        this.isInitialized = false;

        // Check browser support
        this.checkBrowserSupport();

        // Initialize immediately
        this.initialize();
    }

    checkBrowserSupport() {
        console.log('Checking browser support...');

        const support = {
            speechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
            speechSynthesis: 'speechSynthesis' in window
        };

        console.log('Browser support:', support);

        if (!support.speechRecognition) {
            this.showWarning('Speech recognition not supported. Please use Chrome.');
        }

        if (!support.speechSynthesis) {
            this.showWarning('Speech synthesis not supported.');
        }

        return support;
    }

    initialize() {
        console.log('Initializing VoiceManager...');

        // Initialize speech recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';
            this.recognition.maxAlternatives = 1;

            // Set up event handlers
            this.recognition.onstart = () => {
                console.log('✅ Recognition started');
                this.isListening = true;
                this.updateUI('listening');
            };

            this.recognition.onend = () => {
                console.log('🛑 Recognition ended');
                this.isListening = false;
                this.updateUI('inactive');

                // Restart if we should still be listening
                if (this.isListening) {
                    console.log('Restarting recognition...');
                    try {
                        this.recognition.start();
                    } catch (e) {
                        console.error('Failed to restart recognition:', e);
                    }
                }
            };

            this.recognition.onerror = (event) => {
                console.error('❌ Recognition error:', event.error);

                if (event.error === 'not-allowed') {
                    this.updateUI('error', 'Please allow microphone access');
                    this.showWarning('Microphone access denied. Please allow and refresh.');
                } else if (event.error === 'no-speech') {
                    // Ignore - just means user isn't speaking
                } else {
                    this.updateUI('error', event.error);
                }
            };

            this.recognition.onresult = (event) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Log for debugging
                if (finalTranscript) {
                    console.log('🎤 Final:', finalTranscript);
                }

                // Call callback with results
                if (this.onUserSpeechCallback) {
                    this.onUserSpeechCallback({
                        final: finalTranscript.trim(),
                        interim: interimTranscript.trim(),
                        isFinal: finalTranscript.length > 0
                    });
                }
            };

            this.isInitialized = true;
            console.log('✅ VoiceManager initialized successfully');
        } else {
            console.error('❌ Speech recognition not supported');
        }
    }

    startListening(callback) {
        console.log('🎤 Starting voice recognition...');

        if (!this.recognition) {
            console.error('Recognition not initialized');
            alert('Speech recognition not available. Please use Chrome browser.');
            return false;
        }

        this.onUserSpeechCallback = callback;

        try {
            this.recognition.start();
            this.isListening = true;
            this.updateUI('listening');
            return true;
        } catch (error) {
            console.error('Failed to start recognition:', error);

            // If already started, stop and restart
            if (error.message.includes('already started')) {
                try {
                    this.recognition.stop();
                    setTimeout(() => {
                        this.recognition.start();
                    }, 100);
                } catch (e) {
                    console.error('Recovery failed:', e);
                }
            }

            this.updateUI('error');
            return false;
        }
    }

    stopListening() {
        console.log('🛑 Stopping voice recognition...');

        if (this.recognition && this.isListening) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.error('Error stopping recognition:', error);
            }
            this.isListening = false;
            this.updateUI('inactive');
        }
    }

    speak(text, personality = null) {
        return new Promise((resolve) => {
            console.log('🔊 Speaking:', text.substring(0, 50) + '...');

            if (!this.synthesis) {
                console.error('Speech synthesis not supported');
                resolve();
                return;
            }

            // Cancel any current speech
            if (this.currentUtterance) {
                this.synthesis.cancel();
            }

            const utterance = new SpeechSynthesisUtterance(text);
            this.currentUtterance = utterance;

            // Default voice settings
            utterance.rate = 1.0;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Apply personality if provided
            if (personality) {
                this.applyPersonalityVoice(utterance, personality);
            }

            utterance.onstart = () => {
                console.log('🔊 Started speaking');
                this.isSpeaking = true;
                this.updateUI('speaking', personality?.name);
            };

            utterance.onend = () => {
                console.log('🔊 Finished speaking');
                this.isSpeaking = false;
                this.currentUtterance = null;
                this.updateUI('inactive');
                resolve();
            };

            utterance.onerror = (error) => {
                console.error('Speech error:', error);
                this.isSpeaking = false;
                this.currentUtterance = null;
                this.updateUI('error');
                resolve();
            };

            this.synthesis.speak(utterance);
        });
    }

    applyPersonalityVoice(utterance, personality) {
        // Simple personality-based voice adjustments
        switch (personality.debateStyle) {
            case 'aggressive':
                utterance.rate = 1.2;
                utterance.pitch = 0.8;
                this.setVoice(utterance, 'male');
                break;
            case 'analytical':
            case 'data_driven':
            case 'logical':
                utterance.rate = 1.0;
                utterance.pitch = 1.0;
                this.setVoice(utterance, 'female');
                break;
            case 'supportive':
            case 'balanced':
                utterance.rate = 1.0;
                utterance.pitch = 1.1;
                this.setVoice(utterance, 'female');
                break;
            case 'disruptive':
            case 'contrarian':
                utterance.rate = 1.25;
                utterance.pitch = 1.15;
                this.setVoice(utterance, 'male');
                break;
            case 'quiet':
                utterance.rate = 0.85;
                utterance.pitch = 0.95;
                this.setVoice(utterance, 'female');
                break;
            case 'leader':
            case 'dominant':
                utterance.rate = 1.05;
                utterance.pitch = 0.9;
                this.setVoice(utterance, 'male');
                break;
            default:
                this.setVoice(utterance, Math.random() > 0.5 ? 'male' : 'female');
        }
    }

    setVoice(utterance, gender) {
        if (!this.synthesis) return;
        const voices = this.synthesis.getVoices();
        if (voices.length === 0) return;

        // Try to find a voice matching the gender and language
        const preferredVoices = voices.filter(v => v.lang.startsWith('en'));

        let selectedVoice = null;
        if (gender === 'male') {
            selectedVoice = preferredVoices.find(v => v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('male')) || preferredVoices[0];
        } else {
            selectedVoice = preferredVoices.find(v => v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google us english')) || preferredVoices[1] || preferredVoices[0];
        }

        if (selectedVoice) {
            utterance.voice = selectedVoice;
        }
    }

    updateUI(status, speakerName = '') {
        const statusEl = document.getElementById('voiceStatus');
        const voiceBtn = document.getElementById('voiceBtn');
        const muteBtn = document.getElementById('muteBtn');
        const helpText = document.getElementById('voiceHelpText');

        if (!statusEl) return;

        switch (status) {
            case 'listening':
                statusEl.innerHTML = '<span>🎤 Listening... Speak now</span>';
                if (voiceBtn) {
                    voiceBtn.innerHTML = '<span>🔴</span> Stop Voice';
                    voiceBtn.classList.remove('btn-primary');
                    voiceBtn.classList.add('btn-danger');
                }
                if (helpText) helpText.textContent = '🎤 I\'m listening - speak naturally';
                break;

            case 'speaking':
                statusEl.innerHTML = `<span>🔊 ${speakerName || 'AI'} is speaking...</span>`;
                if (voiceBtn) {
                    voiceBtn.innerHTML = '<span>🎤</span> Start Voice';
                    voiceBtn.classList.remove('btn-danger');
                    voiceBtn.classList.add('btn-primary');
                }
                if (helpText) helpText.textContent = '🔊 AI is responding - wait for your turn';
                break;

            case 'inactive':
                statusEl.innerHTML = '<span>🎤 Click "Start Voice" to speak</span>';
                if (voiceBtn) {
                    voiceBtn.innerHTML = '<span>🎤</span> Start Voice';
                    voiceBtn.classList.remove('btn-danger');
                    voiceBtn.classList.add('btn-primary');
                }
                if (helpText) helpText.textContent = '💡 Click "Start Voice" and speak naturally';
                break;

            case 'error':
                statusEl.innerHTML = '<span>⚠️ Voice error - check microphone</span>';
                if (voiceBtn) {
                    voiceBtn.innerHTML = '<span>🎤</span> Retry Voice';
                    voiceBtn.classList.remove('btn-danger');
                    voiceBtn.classList.add('btn-warning');
                }
                break;
        }

        // Enable/disable mute button based on listening state
        if (muteBtn) {
            muteBtn.disabled = !this.isListening;
        }
    }

    showWarning(message) {
        const warning = document.createElement('div');
        warning.className = 'alert alert-warning';
        warning.style.position = 'fixed';
        warning.style.top = '10px';
        warning.style.left = '50%';
        warning.style.transform = 'translateX(-50%)';
        warning.style.zIndex = '9999';
        warning.innerHTML = `
            <strong>⚠️ Warning:</strong> ${message}
        `;
        document.body.appendChild(warning);

        setTimeout(() => warning.remove(), 5000);
    }

    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
            this.isSpeaking = false;
        }
    }
}

// Create global instance
console.log('Creating global VoiceManager instance...');
window.voiceManager = new VoiceManager();