// ============================================
// FILE: js/history.js - UPGRADED GLASS LAGOON VERSION
// ============================================

import { getUserSessions, getCurrentUser, logoutUser } from '../gd-service.js';

let allSessions = [];
let performanceChart = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Authenticate user
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    // Set greeting
    const userName = user.displayName || user.name || (user.email ? user.email.split('@')[0] : 'Candidate');
    const welcomeEl = document.getElementById('welcomeUserTitle');
    if (welcomeEl) welcomeEl.textContent = `Welcome back, ${userName}`;

    // Setup Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await logoutUser();
            window.location.href = '../index.html';
        });
    }

    // Load sessions
    await loadDashboardData();

    // Setup Chart Filter Listeners
    setupFilterListeners();
});

async function loadDashboardData() {
    const res = await getUserSessions(25);
    allSessions = res.sessions || [];

    updateSummaryCards(allSessions);
    initPerformanceChart(allSessions.slice(0, 7).reverse());
    renderRecentSessions(allSessions);
}

function updateSummaryCards(sessions) {
    if (!sessions || sessions.length === 0) return;

    const scores = sessions.map(s => s.userScore || 0);
    const bestScore = Math.max(...scores);
    const avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const totalGDs = sessions.length;

    // Calculate improvement comparing first half vs second half
    let improvement = "+12%";
    if (scores.length >= 2) {
        const firstScore = scores[scores.length - 1];
        const latestScore = scores[0];
        const diff = latestScore - firstScore;
        improvement = (diff >= 0 ? `+${diff}%` : `${diff}%`);
    }

    const bestEl = document.getElementById('statBestScore');
    const avgEl = document.getElementById('statAvgScore');
    const totalEl = document.getElementById('statTotalSessions');
    const impEl = document.getElementById('statImprovement');

    if (bestEl) bestEl.textContent = `${bestScore}/100`;
    if (avgEl) avgEl.textContent = `${avgScore}/100`;
    if (totalEl) totalEl.textContent = `${totalGDs}`;
    if (impEl) impEl.textContent = improvement;
}

function initPerformanceChart(sessionsData) {
    const ctx = document.getElementById('performanceProgressionChart');
    if (!ctx) return;

    const labels = sessionsData.map((s, idx) => `Session ${idx + 1}`);
    const dataPoints = sessionsData.map(s => s.userScore || 70);

    if (performanceChart) {
        performanceChart.destroy();
    }

    performanceChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'GD Score',
                data: dataPoints,
                borderColor: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.12)',
                fill: true,
                tension: 0.38,
                borderWidth: 3,
                pointBackgroundColor: '#38bdf8',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderColor: 'rgba(56, 189, 248, 0.3)',
                    borderWidth: 1,
                    titleFont: { family: 'Plus Jakarta Sans', weight: 'bold' },
                    bodyFont: { family: 'Plus Jakarta Sans' },
                    padding: 12,
                    callbacks: {
                        label: (context) => `Score: ${context.parsed.y}/100`
                    }
                }
            },
            scales: {
                y: {
                    min: 40,
                    max: 100,
                    grid: { color: 'rgba(255, 255, 255, 0.06)' },
                    ticks: {
                        color: '#94a3b8',
                        font: { family: 'JetBrains Mono', size: 11 }
                    }
                },
                x: {
                    grid: { display: false },
                    ticks: {
                        color: '#94a3b8',
                        font: { family: 'Plus Jakarta Sans', size: 11 }
                    }
                }
            }
        }
    });
}

function setupFilterListeners() {
    const filterBtns = document.querySelectorAll('.chart-filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.style.background = 'transparent';
                b.style.borderColor = 'transparent';
                b.style.color = 'var(--text-secondary)';
            });
            btn.classList.add('active');
            btn.style.background = 'rgba(6, 182, 212, 0.15)';
            btn.style.borderColor = 'rgba(6, 182, 212, 0.35)';
            btn.style.color = '#fff';

            const filter = btn.dataset.filter;
            applyChartFilter(filter);
        });
    });
}

function applyChartFilter(filter) {
    if (!allSessions || allSessions.length === 0) return;

    let filtered = [...allSessions];
    if (filter === '7') {
        filtered = filtered.slice(0, 7);
    } else if (filter === '30') {
        filtered = filtered.slice(0, 15);
    } else if (filter === '90') {
        filtered = filtered.slice(0, 25);
    }

    initPerformanceChart(filtered.reverse());
}

function renderRecentSessions(sessions) {
    const listEl = document.getElementById('recentSessionsList');
    if (!listEl) return;

    if (!sessions || sessions.length === 0) {
        listEl.innerHTML = `
            <div class="glass-panel" style="padding: 2.5rem; text-align: center;">
                <p style="color: var(--text-muted); margin-bottom: 1rem;">No discussion sessions recorded yet.</p>
                <a href="prepare.html" class="btn-lagoon btn-lagoon-primary">Start Your First GD</a>
            </div>
        `;
        return;
    }

    listEl.innerHTML = sessions.map(s => {
        const dateStr = s.timestamp ? new Date(s.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent';
        const scoreColor = (s.userScore >= 80) ? 'var(--lagoon-emerald)' : (s.userScore >= 70) ? 'var(--lagoon-cyan)' : 'var(--lagoon-amber)';
        return `
            <div class="glass-card" style="padding: 1.25rem 1.5rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: all var(--transition-fast);" onclick="selectTopicAndStart('${(s.topic || "").replace(/'/g, "\\'")}')">
                <div style="display: flex; align-items: center; gap: 1.25rem;">
                    <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: rgba(6, 182, 212, 0.12); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; color: var(--lagoon-sky);">
                        <i class="fas fa-comments"></i>
                    </div>
                    <div>
                        <h4 style="font-size: 1.05rem; margin-bottom: 0.25rem;">${s.topic || 'General Discussion'}</h4>
                        <div style="font-size: 0.82rem; color: var(--text-muted); display: flex; gap: 1rem;">
                            <span><i class="fas fa-users"></i> ${s.aiParticipants || 4} participants</span>
                            <span><i class="fas fa-clock"></i> ${Math.floor((s.duration || 180)/60)} min</span>
                            <span><i class="fas fa-calendar-alt"></i> ${dateStr}</span>
                        </div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.4rem; font-weight: 800; font-family: 'Outfit', sans-serif; color: ${scoreColor};">
                        ${s.userScore || 0}<span style="font-size: 0.85rem; color: var(--text-muted);">/100</span>
                    </div>
                    <span style="font-size: 0.75rem; color: var(--lagoon-sky); font-weight: 600;">Practice Again <i class="fas fa-chevron-right" style="font-size: 0.65rem;"></i></span>
                </div>
            </div>
        `;
    }).join('');
}

window.selectTopicAndStart = function(topicName) {
    sessionStorage.setItem('currentTopic', topicName);
    window.location.href = `prepare.html?topic=${encodeURIComponent(topicName)}`;
};