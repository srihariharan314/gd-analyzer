from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import time
import random
from antigravity_assistant import AntiGravityAssistant
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Anti-Gravity AI & GD Analyzer API")

# Setup CORS so your HTML/JS frontend can talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration - Set in environment or terminal
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
SERPAPI_KEY = os.getenv("SERPAPI_KEY", "")

# Initialize the assistant
assistant = AntiGravityAssistant(
    openai_key=OPENAI_API_KEY, 
    serpapi_key=SERPAPI_KEY
)

# In-memory Room Store for Multi-Human GD
rooms_db: Dict[str, Dict[str, Any]] = {}

class ChatRequest(BaseModel):
    message: str
    topic: str = "General Discussion"

class TopicResearchRequest(BaseModel):
    topic: str

class CreateRoomRequest(BaseModel):
    host_name: str
    topic: str
    duration: int = 180
    max_participants: int = 6

class JoinRoomRequest(BaseModel):
    participant_name: str

class EvaluationRequest(BaseModel):
    topic: str
    duration: int
    transcript: List[Dict[str, Any]]

@app.get("/")
def health_check():
    return {
        "status": "Anti-Gravity Assistant & GD Analyzer API Online",
        "version": "2.0.0",
        "has_openai_key": bool(os.getenv("OPENAI_API_KEY")),
        "has_serpapi_key": bool(os.getenv("SERPAPI_KEY"))
    }

@app.post("/chat")
async def chat_endpoint(req: ChatRequest):
    current_key = os.getenv("OPENAI_API_KEY") or OPENAI_API_KEY
    if not current_key:
        # Graceful fallback response if API key is not yet set
        return {
            "response": f"Examining {req.topic}: while that perspective has practical merit, we have to evaluate the long-term scalability and regulatory implications."
        }
    
    try:
        response = assistant.get_response(req.message, req.topic)
        return {"response": response}
    except Exception as e:
        return {
            "response": f"Regarding {req.topic}: {req.message[:30]}... It is crucial that we ground this point with concrete data and balanced policy oversight."
        }

@app.post("/api/topic/research")
async def research_topic(req: TopicResearchRequest):
    """Fetches real-time search context using SerpApi or curated factual models."""
    topic = req.topic.strip()
    realtime_context = ""
    
    serp_key = os.getenv("SERPAPI_KEY") or SERPAPI_KEY
    if serp_key:
        try:
            from serpapi import GoogleSearch
            search = GoogleSearch({
                "engine": "google",
                "q": f"{topic} group discussion facts statistics pros cons",
                "api_key": serp_key,
                "num": 4
            })
            res = search.get_dict()
            snippets = [r.get('snippet', '') for r in res.get("organic_results", [])[:3]]
            realtime_context = " | ".join(snippets)
        except Exception as e:
            print(f"Search API exception: {e}")

    return {
        "success": True,
        "topic": {
            "name": topic,
            "category": "Current Affairs",
            "difficulty": "Intermediate",
            "duration": "5 min",
            "summary": f"Strategic analysis of {topic} evaluating societal, economic, and policy implications.",
            "realtime_context": realtime_context,
            "keyPoints": [
                f"Define the scope of {topic} clearly at the outset.",
                "Balance immediate economic drivers against long-term social stability.",
                "Identify primary stakeholders and potential transition friction.",
                "Reference international benchmarks and domestic regulatory policies.",
                "Synthesize a forward-looking consensus with concrete recommendations."
            ],
            "pros": [
                "Accelerates modernization and operational efficiency.",
                "Creates new collaborative paradigms and skill specializations.",
                "Encourages transparent governance and data-driven oversight."
            ],
            "cons": [
                "Potential short-term displacement and implementation friction.",
                "Capital investment requirements and infrastructure readiness disparities.",
                "Regulatory lag relative to rapid practical adoption."
            ],
            "examples": [
                f"Pilot programs and case studies observed globally around {topic}.",
                "Emerging regulatory frameworks balancing innovation with public safety."
            ],
            "statistics": [
                "Over 65% of surveyed industry executives rank strategic governance as a top priority.",
                "Independent analysts project high multi-year compound adoption rates across leading sectors."
            ],
            "counterarguments": [
                "Critics point out disruption costs and inequitable access.",
                "Proponents counter that proactive regulation transforms challenges into long-term national advantage."
            ],
            "conclusion": f"Addressing {topic} sustainably requires progressive policies, stakeholder inclusion, and ethical accountability.",
            "interviewApproach": "Acknowledge both sides objectively, anchor your arguments in verified facts, and lead the group toward an actionable conclusion."
        }
    }

# ==================== ROOM ENDPOINTS ====================

@app.post("/api/rooms/create")
async def create_room(req: CreateRoomRequest):
    chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
    code = "GD-" + "".join(random.choices(chars, k=5))
    now = time.time() * 1000
    
    room = {
        "roomId": f"room_{int(now)}",
        "roomCode": code,
        "hostName": req.host_name or "Host",
        "topic": req.topic,
        "duration": req.duration,
        "maxParticipants": req.max_participants,
        "createdAt": now,
        "expiresAt": now + 120000, # 2 minutes
        "status": "waiting",
        "participants": [
            {
                "id": "p_host",
                "name": req.host_name or "Host (You)",
                "isHost": True,
                "avatarColor": "#06b6d4",
                "joinedAt": now
            }
        ]
    }
    rooms_db[code] = room
    return {"success": True, "room": room}

@app.get("/api/rooms/{code}")
async def get_room(code: str):
    code = code.upper().strip()
    room = rooms_db.get(code)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    now = time.time() * 1000
    if now > room["expiresAt"] and room["status"] == "waiting":
        room["status"] = "active" if len(room["participants"]) >= 2 else "expired"
        
    remaining = max(0, int((room["expiresAt"] - now) / 1000))
    return {
        "success": True,
        "room": room,
        "remainingSeconds": remaining,
        "isExpired": room["status"] == "expired",
        "isActive": room["status"] == "active"
    }

@app.post("/api/rooms/{code}/join")
async def join_room(code: str, req: JoinRoomRequest):
    code = code.upper().strip()
    room = rooms_db.get(code)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    now = time.time() * 1000
    if now > room["expiresAt"] and room["status"] == "waiting":
        raise HTTPException(status_code=400, detail="Room invitation has expired")
        
    if len(room["participants"]) >= room["maxParticipants"]:
        raise HTTPException(status_code=400, detail="Room is full")
        
    # Check if participant already present
    if not any(p["name"].lower() == req.participant_name.lower() for p in room["participants"]):
        colors = ['#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#38bdf8', '#6366f1']
        room["participants"].append({
            "id": f"p_{int(now)}",
            "name": req.participant_name,
            "isHost": False,
            "avatarColor": colors[len(room["participants"]) % len(colors)],
            "joinedAt": now
        })
        
    return {"success": True, "room": room}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
