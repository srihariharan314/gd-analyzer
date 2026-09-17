# GD Analyzer 🎯

> **AI-Powered Group Discussion Simulator & Performance Analytics Platform**

GD Analyzer is an intelligent platform designed to help students and job seekers master group discussions (GD) for placement drives and competitive interviews. It simulates realistic multi-participant discussions with AI avatars, supports live multi-human rooms, and provides real-time feedback and speech analytics.

---

## ✨ Features

- **🤖 AI Discussion Simulation**: Practice realistic group discussions with distinct AI personalities powered by OpenAI.
- **🌐 Real-Time Web Context**: Integrated SerpAPI real-time search context to ground discussions in current events and facts.
- **🎙️ Voice & Speech Interaction**: Voice-driven discussion support with speech synthesis and recognition.
- **👥 Multi-Participant Rooms**: Host and join simulated or multi-human GD rooms with custom topics, timers, and rules.
- **📊 Performance Analytics**: Track speaking time, sentiment, argument quality, topic relevance, and body language/interaction metrics.
- **🔒 Firebase Integration**: User authentication, cloud session history, and personalized profile dashboards.
- **💎 Modern Glassmorphic UI**: Sleek, responsive, and intuitive interface with the custom *Glass Lagoon* design system.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS3 (Glassmorphism), JavaScript (ES6+), Chart.js, FontAwesome
- **Backend**: Python (FastAPI, Pydantic, Uvicorn)
- **AI & Data**: OpenAI API (`gpt-4o`), SerpApi (Google Search Engine)
- **Cloud & Auth**: Firebase Authentication & Cloud Firestore
- **Tooling**: `live-server` for local frontend development

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+) & npm
- Python (3.9+) & pip
- OpenAI API Key (optional, for full AI capabilities)
- SerpAPI Key (optional, for real-time web search)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/srihariharan314/gd-analyzer.git
   cd gd-analyzer
   ```

2. **Frontend Setup**:
   ```bash
   cd gd-analyzer
   npm install
   npm start
   ```

3. **Backend API Setup**:
   ```bash
   # In the gd-analyzer folder
   pip install fastapi uvicorn openai google-search-results pydantic
   
   # Set environment variables (Optional)
   export OPENAI_API_KEY="your-openai-api-key"
   export SERPAPI_KEY="your-serpapi-key"
   
   # Run the server
   python server.py
   # or
   uvicorn server:app --reload --port 8000
   ```

---

## 📂 Project Structure

```
gd-analyzer/
├── index.html                  # Landing page
├── hero.png                    # Assets
├── collab.png                  # Assets
├── .gitignore                  # Git ignore rules
└── gd-analyzer/
    ├── index.html              # Main application portal
    ├── server.py               # FastAPI backend server
    ├── antigravity_assistant.py# AI Assistant & real-time search logic
    ├── firebase-config.js      # Firebase client configuration
    ├── package.json            # Node dependencies and scripts
    ├── css/                    # Stylesheets (glass-lagoon, themes)
    ├── js/                     # Client logic (discussion-sim, auth, history, voice)
    └── pages/                  # Subpages (dashboard, rooms, profile, simulate, etc.)
```

---

## 📄 License

This project is licensed under the ISC License.
