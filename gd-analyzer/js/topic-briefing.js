// ============================================
// FILE: js/topic-briefing.js - UPGRADED GLASS LAGOON
// ============================================

import { getGroundedTopicBriefing, aiPersonalities, getCurrentUser, topicDatabase } from '../gd-service.js';

// State
let currentTopicData = null;
let selectedMode = 'ai'; // 'ai' | 'human' | 'hybrid'
let selectedDuration = 300; // 5 min default

document.addEventListener('DOMContentLoaded', async () => {
    // Authenticate or allow guest seamlessly without blocking
    let user = null;
    try {
        user = await getCurrentUser();
    } catch (e) {
        console.warn("Auth check note:", e);
    }
    if (!user) {
        user = { displayName: 'Candidate Alex', name: 'Candidate Alex', email: 'alex@gdpro.ai' };
    }

    setupTopicSearchAndCategoryFilters();
    setupConfigurationControls();
    setupRulesCheckbox();

    // Check if topic was passed via URL or sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    const passedTopic = urlParams.get('topic') || sessionStorage.getItem('currentTopic');
    if (passedTopic) {
        const input = document.getElementById('topicSearchInput');
        if (input) input.value = passedTopic;
        loadTopicBriefing(passedTopic);
    } else {
        // Load default first topic
        loadTopicBriefing("Will AI Replace Human Jobs or Create New Ones?");
    }
});

// Setup Category Pill Filters & Search
function setupTopicSearchAndCategoryFilters() {
    const input = document.getElementById('topicSearchInput');
    const searchBtn = document.getElementById('searchTopicBtn');
    const pills = document.querySelectorAll('.category-pill');

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const topic = input.value.trim();
            if (topic) loadTopicBriefing(topic);
        });
    }

    if (input) {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const topic = input.value.trim();
                if (topic) loadTopicBriefing(topic);
            }
        });
    }

    pills.forEach(pill => {
        pill.addEventListener('click', () => {
            pills.forEach(p => {
                p.classList.remove('active');
                p.style.background = 'rgba(30, 41, 59, 0.55)';
                p.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                p.style.color = 'var(--text-secondary)';
            });
            pill.classList.add('active');
            pill.style.background = 'rgba(6, 182, 212, 0.18)';
            pill.style.borderColor = 'rgba(6, 182, 212, 0.4)';
            pill.style.color = '#fff';

            const cat = pill.dataset.category;
            filterTopicCardsByCategory(cat);
        });
    });
}

function filterTopicCardsByCategory(category) {
    const cards = document.querySelectorAll('.topic-discovery-card');
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category.toLowerCase() === category.toLowerCase()) {
            card.style.display = 'flex';
        } else {
            card.style.display = 'none';
        }
    });
}

// Load and Render Grounded Topic Briefing
export async function loadTopicBriefing(topicName) {
    const briefingContainer = document.getElementById('briefingContent');
    const loadingEl = document.getElementById('briefingLoading');
    const headerTitle = document.getElementById('selectedTopicTitle');

    if (loadingEl) loadingEl.style.display = 'block';
    if (briefingContainer) briefingContainer.style.opacity = '0.3';

    const result = await getGroundedTopicBriefing(topicName);
    const t = result.topic;
    currentTopicData = t;

    sessionStorage.setItem('currentTopic', t.name);

    if (headerTitle) headerTitle.textContent = t.name;

    renderBriefingSections(t);

    if (loadingEl) loadingEl.style.display = 'none';
    if (briefingContainer) {
        briefingContainer.style.opacity = '1';
        briefingContainer.style.display = 'block';
    }

    // Initialize AI participant configuration panel
    renderAIPersonalitySelectors(parseInt(document.getElementById('aiAgentCountSlider')?.value || 5));
}

function renderBriefingSections(t) {
    const c = document.getElementById('briefingContent');
    if (!c) return;

    const formatList = (items) => (items || []).map(i => `
        <li style="margin-bottom: 0.5rem; display: flex; align-items: flex-start; gap: 0.6rem;">
            <i class="fas fa-circle" style="font-size: 0.35rem; color: var(--lagoon-cyan); margin-top: 0.5rem;"></i>
            <span>${i}</span>
        </li>
    `).join('');

    c.innerHTML = `
        <!-- Overview -->
        <div class="glass-card" style="padding: 1.75rem; margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                <span class="badge badge-cyan">${t.category || 'Discussion'}</span>
                <span style="font-size: 0.8rem; color: var(--text-muted);"><i class="fas fa-signal"></i> ${t.difficulty || 'Intermediate'}</span>
            </div>
            <h3 style="font-size: 1.35rem; margin-bottom: 0.75rem;">Topic Overview</h3>
            <p style="color: var(--text-secondary); line-height: 1.7; font-size: 0.95rem;">${t.summary}</p>
        </div>

        <!-- 5-8 Key Points -->
        <div class="glass-card" style="padding: 1.75rem; margin-bottom: 1.5rem;">
            <h3 style="font-size: 1.25rem; margin-bottom: 1rem; color: var(--lagoon-sky);">
                <i class="fas fa-list-check" style="margin-right: 0.5rem;"></i> Essential Discussion Anchors (Key Points)
            </h3>
            <ul style="list-style: none; color: var(--text-secondary); font-size: 0.92rem; padding: 0;">
                ${formatList(t.keyPoints)}
            </ul>
        </div>

        <!-- Arguments FOR vs AGAINST -->
        <div class="grid-cols-2" style="margin-bottom: 1.5rem;">
            <div class="glass-card" style="padding: 1.75rem; border-left: 4px solid var(--lagoon-emerald);">
                <h3 style="font-size: 1.15rem; margin-bottom: 1rem; color: var(--lagoon-emerald);">
                    <i class="fas fa-thumbs-up" style="margin-right: 0.5rem;"></i> Arguments FOR
                </h3>
                <ul style="list-style: none; color: var(--text-secondary); font-size: 0.9rem; padding: 0;">
                    ${formatList(t.pros)}
                </ul>
            </div>

            <div class="glass-card" style="padding: 1.75rem; border-left: 4px solid var(--lagoon-rose);">
                <h3 style="font-size: 1.15rem; margin-bottom: 1rem; color: var(--lagoon-rose);">
                    <i class="fas fa-thumbs-down" style="margin-right: 0.5rem;"></i> Arguments AGAINST
                </h3>
                <ul style="list-style: none; color: var(--text-secondary); font-size: 0.9rem; padding: 0;">
                    ${formatList(t.cons)}
                </ul>
            </div>
        </div>

        <!-- Facts, Statistics & Examples -->
        <div class="grid-cols-2" style="margin-bottom: 1.5rem;">
            <div class="glass-card" style="padding: 1.75rem;">
                <h3 style="font-size: 1.15rem; margin-bottom: 1rem; color: var(--lagoon-cyan);">
                    <i class="fas fa-chart-pie" style="margin-right: 0.5rem;"></i> Verified Facts & Statistics
                </h3>
                <ul style="list-style: none; color: var(--text-secondary); font-size: 0.9rem; padding: 0;">
                    ${formatList(t.statistics)}
                </ul>
            </div>

            <div class="glass-card" style="padding: 1.75rem;">
                <h3 style="font-size: 1.15rem; margin-bottom: 1rem; color: var(--lagoon-violet);">
                    <i class="fas fa-briefcase" style="margin-right: 0.5rem;"></i> Real-World Case Studies & Examples
                </h3>
                <ul style="list-style: none; color: var(--text-secondary); font-size: 0.9rem; padding: 0;">
                    ${formatList(t.examples)}
                </ul>
            </div>
        </div>

        <!-- Possible Counterarguments & Balanced Conclusion -->
        <div class="glass-card" style="padding: 1.75rem; margin-bottom: 1.5rem;">
            <h3 style="font-size: 1.15rem; margin-bottom: 0.75rem; color: var(--lagoon-amber);">
                <i class="fas fa-scale-balanced" style="margin-right: 0.5rem;"></i> Possible Counterarguments to Anticipate
            </h3>
            <ul style="list-style: none; color: var(--text-secondary); font-size: 0.9rem; padding: 0; margin-bottom: 1.25rem;">
                ${formatList(t.counterarguments)}
            </ul>

            <div style="border-top: 1px solid rgba(255, 255, 255, 0.08); padding-top: 1rem;">
                <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--lagoon-cyan); font-weight: 700; margin-bottom: 0.35rem;">Balanced Neutral Conclusion</div>
                <p style="color: #fff; font-size: 0.92rem; font-weight: 500; line-height: 1.6;">${t.conclusion}</p>
            </div>
        </div>

        <!-- How to Approach This Topic (Interview Advice) -->
        <div class="glass-card" style="padding: 1.75rem; background: linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(14, 23, 42, 0.9) 100%); border-color: rgba(6, 182, 212, 0.35);">
            <div style="display: flex; gap: 1rem; align-items: flex-start;">
                <div style="width: 40px; height: 40px; border-radius: var(--radius-md); background: rgba(6, 182, 212, 0.2); display: flex; align-items: center; justify-content: center; color: var(--lagoon-sky); font-size: 1.2rem; flex-shrink: 0;">
                    <i class="fas fa-user-graduate"></i>
                </div>
                <div>
                    <h3 style="font-size: 1.2rem; margin-bottom: 0.4rem;">How to Approach This Topic in an Interview GD</h3>
                    <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.7;">
                        ${t.interviewApproach || "Define the terminology clearly, anchor with 1 empirical statistic, bridge opposing stakeholder viewpoints, and conclude with a forward-looking recommendation."}
                    </p>
                </div>
            </div>
        </div>
    `;
}

// Setup Discussion Configuration (Mode, Count, Personalities, Duration)
function setupConfigurationControls() {
    // Mode selection buttons
    const modeBtns = document.querySelectorAll('.mode-select-btn');
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => {
                b.classList.remove('active');
                b.style.borderColor = 'rgba(56, 189, 248, 0.16)';
                b.style.background = 'rgba(14, 23, 42, 0.72)';
            });
            btn.classList.add('active');
            btn.style.borderColor = 'var(--lagoon-cyan)';
            btn.style.background = 'rgba(6, 182, 212, 0.14)';
            selectedMode = btn.dataset.mode;

            // Adjust visibility
            const aiConfigSection = document.getElementById('aiConfigSection');
            if (selectedMode === 'human') {
                if (aiConfigSection) aiConfigSection.style.display = 'none';
            } else {
                if (aiConfigSection) aiConfigSection.style.display = 'block';
            }
        });
    });

    // Duration buttons
    const durBtns = document.querySelectorAll('.duration-btn');
    durBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            durBtns.forEach(b => {
                b.classList.remove('active');
                b.style.borderColor = 'rgba(56, 189, 248, 0.16)';
                b.style.background = 'transparent';
                b.style.color = 'var(--text-secondary)';
            });
            btn.classList.add('active');
            btn.style.borderColor = 'var(--lagoon-cyan)';
            btn.style.background = 'rgba(6, 182, 212, 0.18)';
            btn.style.color = '#fff';
            selectedDuration = parseInt(btn.dataset.duration);
        });
    });

    // AI Count Slider
    const slider = document.getElementById('aiAgentCountSlider');
    const countDisplay = document.getElementById('aiAgentCountDisplay');
    if (slider) {
        slider.addEventListener('input', (e) => {
            const count = parseInt(e.target.value);
            if (countDisplay) countDisplay.textContent = count;
            renderAIPersonalitySelectors(count);
        });
    }
}

// Render dynamic AI participant personality dropdowns
function renderAIPersonalitySelectors(count) {
    const container = document.getElementById('aiPersonalitiesGrid');
    if (!container) return;

    const personalityKeys = Object.keys(aiPersonalities);
    const defaults = ['analytical', 'aggressive', 'supportive', 'disruptive', 'balanced', 'logical', 'contrarian', 'leader'];

    let html = '';
    for (let i = 0; i < count; i++) {
        const defaultChoice = defaults[i % defaults.length];
        const persona = aiPersonalities[defaultChoice];

        html += `
            <div class="glass-panel" style="padding: 1rem; border-radius: var(--radius-md);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.1rem;">🤖</span>
                        <span style="font-size: 0.88rem; font-weight: 700; color: #fff;">AI Participant ${i + 1}</span>
                    </div>
                    <span class="badge" style="background: ${persona.color}22; color: ${persona.color}; border: 1px solid ${persona.color}55;">
                        ${persona.name}
                    </span>
                </div>
                <select class="lagoon-input ai-persona-select" data-index="${i}" style="padding: 0.5rem 0.75rem; font-size: 0.85rem;">
                    ${personalityKeys.map(k => `
                        <option value="${k}" ${k === defaultChoice ? 'selected' : ''}>
                            ${aiPersonalities[k].name} (${k.charAt(0).toUpperCase() + k.slice(1)})
                        </option>
                    `).join('')}
                </select>
            </div>
        `;
    }
    container.innerHTML = html;
}

// Setup Rules Checkbox & Disabled Button Enforcer
function setupRulesCheckbox() {
    const checkbox = document.getElementById('agreeRulesCheckbox');
    const startBtn = document.getElementById('startDiscussionActionBtn');

    if (checkbox && startBtn) {
        startBtn.disabled = true;

        checkbox.addEventListener('change', () => {
            startBtn.disabled = !checkbox.checked;
        });

        startBtn.addEventListener('click', () => {
            if (!checkbox.checked) return;

            // Collect selected personalities
            const selects = document.querySelectorAll('.ai-persona-select');
            const chosenPersonalities = [];
            selects.forEach(s => {
                const pKey = s.value;
                chosenPersonalities.push({
                    personality: pKey,
                    details: aiPersonalities[pKey]
                });
            });

            // Save to sessionStorage
            sessionStorage.setItem('currentTopic', currentTopicData?.name || 'General Discussion');
            sessionStorage.setItem('discussionMode', selectedMode);
            sessionStorage.setItem('discussionDuration', selectedDuration);
            sessionStorage.setItem('aiCount', chosenPersonalities.length);
            sessionStorage.setItem('aiPersonalities', JSON.stringify(chosenPersonalities));

            if (selectedMode === 'human') {
                window.location.href = `rooms.html?topic=${encodeURIComponent(currentTopicData?.name || '')}&create=true`;
            } else {
                window.location.href = 'simulate.html';
            }
        });
    }
}