// ============================================
// FILE: js/topic-images.js
// Topic-based image and theme manager
// ============================================

export const topicThemes = {
    "artificial intelligence": {
        name: "Artificial Intelligence",
        heroImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=400&fit=crop",
        backgroundGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        icon: "🤖",
        color: "#764ba2",
        relatedImages: [
            "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1507146153580-69a1fe6d8aa1?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=400&h=300&fit=crop"
        ],
        stats: {
            marketSize: "$190B by 2025",
            adoption: "70% companies by 2030",
            indiaRank: "3rd largest AI talent pool"
        }
    },
    "remote work": {
        name: "Remote Work",
        heroImage: "https://images.unsplash.com/photo-1587614295999-6c6e3e0b9a8f?w=1200&h=400&fit=crop",
        backgroundGradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        icon: "🏠",
        color: "#f5576c",
        relatedImages: [
            "https://images.unsplash.com/photo-1593642532842-1e12c2f3ea1a?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=400&h=300&fit=crop"
        ],
        stats: {
            employeePreference: "74% want remote work",
            savings: "$11,000 saved per employee",
            productivity: "47% increase reported"
        }
    },
    "climate change": {
        name: "Climate Change",
        heroImage: "https://images.unsplash.com/photo-1611048267451-9034d3c9b9f4?w=1200&h=400&fit=crop",
        backgroundGradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        icon: "🌍",
        color: "#00f2fe",
        relatedImages: [
            "https://images.unsplash.com/photo-1569163139599-0371a4c6d7a3?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1470071459604-3b5ec770a58a?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=400&h=300&fit=crop"
        ],
        stats: {
            temperatureRise: "1.2°C since pre-industrial",
            renewableCost: "Cheaper than coal",
            indiaTarget: "500GW renewable by 2030"
        }
    },
    "default": {
        name: "Group Discussion",
        heroImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&h=400&fit=crop",
        backgroundGradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        icon: "💬",
        color: "#667eea",
        relatedImages: [],
        stats: {}
    }
};

// AI Avatars mapping with images
export const aiAvatars = {
    aggressive: {
        emoji: "⚡",
        imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=aggressive&backgroundColor=ff6b6b",
        color: "#ff6b6b"
    },
    analytical: {
        emoji: "📊",
        imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=analytical&backgroundColor=20bf6b",
        color: "#20bf6b"
    },
    supportive: {
        emoji: "🤝",
        imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=supportive&backgroundColor=4a69bd",
        color: "#4a69bd"
    },
    disruptive: {
        emoji: "💥",
        imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=disruptive&backgroundColor=f5cd79",
        color: "#f5cd79"
    },
    quiet: {
        emoji: "🤔",
        imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=quiet&backgroundColor=a4b0be",
        color: "#a4b0be"
    },
    dominant: {
        emoji: "👑",
        imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=dominant&backgroundColor=e056fd",
        color: "#e056fd"
    }
};

// Function to get theme for a topic
export function getTopicTheme(topicName) {
    const normalizedTopic = topicName.toLowerCase();
    return topicThemes[normalizedTopic] || topicThemes.default;
}

// Function to create a visual topic card
export function createTopicCard(topicName, theme, onClickCallback) {
    const card = document.createElement('div');
    card.className = 'topic-card';
    card.setAttribute('data-topic', topicName.toLowerCase());
    
    card.innerHTML = `
        <div class="topic-card-image" style="background-image: url('${theme.heroImage}')"></div>
        <div class="topic-card-content">
            <div style="font-size: 2rem; margin-bottom: 0.5rem;">${theme.icon}</div>
            <h3>${theme.name}</h3>
            <p>Click to start discussion on ${theme.name}</p>
            <div style="margin-top: 1rem; font-size: 0.85rem; color: ${theme.color};">
                🔥 Trending Topic
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => onClickCallback(topicName));
    return card;
}

// Function to update UI with topic theme
export function applyTopicTheme(topicName) {
    const theme = getTopicTheme(topicName);
    
    // Update hero section if exists
    const heroSection = document.querySelector('.topic-hero');
    if (heroSection) {
        heroSection.style.backgroundImage = `url('${theme.heroImage}')`;
        heroSection.style.backgroundSize = 'cover';
        heroSection.style.backgroundPosition = 'center';
        
        const heroContent = heroSection.querySelector('.topic-hero-content');
        if (heroContent) {
            heroContent.innerHTML = `
                <div style="font-size: 3rem; margin-bottom: 1rem;">${theme.icon}</div>
                <h2>Discussing: ${theme.name}</h2>
                <p>Engage in a dynamic group discussion with AI participants</p>
            `;
        }
    }
    
    // Update body background gradient
    document.body.style.background = `${theme.backgroundGradient}, #f0f2f5`;
    
    return theme;
}

// Function to create AI avatar element
export function createAIAvatar(personality, isSpeaking = false, size = 'medium') {
    const avatarData = aiAvatars[personality] || aiAvatars.aggressive;
    const sizeClass = size === 'large' ? 'large' : '';
    
    const avatar = document.createElement('div');
    avatar.className = `ai-avatar ${personality} ${sizeClass} ${isSpeaking ? 'speaking' : ''}`;
    avatar.innerHTML = avatarData.emoji;
    avatar.title = `${personality} personality`;
    
    return avatar;
}

// Function to create a visual stats widget
export function createStatsWidget(stats) {
    const widget = document.createElement('div');
    widget.className = 'stats-dashboard';
    
    const statItems = Object.entries(stats).map(([key, value]) => `
        <div class="stat-card">
            <div class="stat-icon">📈</div>
            <div class="stat-value">${value}</div>
            <div class="stat-label">${key.replace(/([A-Z])/g, ' $1').trim()}</div>
        </div>
    `).join('');
    
    widget.innerHTML = statItems;
    return widget;
}

// Function to add floating images related to topic
export function addRelatedImages(topicName, containerId) {
    const theme = getTopicTheme(topicName);
    const container = document.getElementById(containerId);
    
    if (!container || !theme.relatedImages.length) return;
    
    const imagesGrid = document.createElement('div');
    imagesGrid.className = 'related-images';
    imagesGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1rem;
        margin: 2rem 0;
    `;
    
    theme.relatedImages.forEach(imageUrl => {
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = `${topicName} related image`;
        img.style.cssText = `
            width: 100%;
            height: 150px;
            object-fit: cover;
            border-radius: 12px;
            cursor: pointer;
            transition: transform 0.3s ease;
        `;
        img.addEventListener('click', () => {
            // Open modal with full-size image
            showImageModal(imageUrl);
        });
        imagesGrid.appendChild(img);
    });
    
    container.appendChild(imagesGrid);
}

// Image modal for full-size viewing
function showImageModal(imageUrl) {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        cursor: pointer;
    `;
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    
    modal.appendChild(img);
    modal.addEventListener('click', () => modal.remove());
    document.body.appendChild(modal);
}

// Function to add animated background particles
export function addBackgroundParticles() {
    if (document.querySelector('.particles-container')) return;
    
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    particlesContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 0;
    `;
    
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(255,255,255,0.3);
            border-radius: 50%;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: float ${Math.random() * 10 + 5}s infinite linear;
        `;
        particlesContainer.appendChild(particle);
    }
    
    document.body.insertBefore(particlesContainer, document.body.firstChild);
    
    // Add float animation if not exists
    if (!document.querySelector('#particle-animation-style')) {
        const style = document.createElement('style');
        style.id = 'particle-animation-style';
        style.textContent = `
            @keyframes float {
                from {
                    transform: translateY(100vh) rotate(0deg);
                    opacity: 0;
                }
                to {
                    transform: translateY(-100vh) rotate(360deg);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }
}