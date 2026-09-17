import openai
from serpapi import GoogleSearch
import json
from datetime import datetime

class AntiGravityAssistant:
    def __init__(self, openai_key, serpapi_key=None):
        self.client = openai.OpenAI(api_key=openai_key)
        self.serpapi_key = serpapi_key
        self.training_log_path = "antigravity_training_pool.jsonl"

    def fetch_realtime_data(self, query):
        """Fetches structured data from Google via SerpApi"""
        if not self.serpapi_key:
            return "No real-time API key provided. Using general knowledge."
            
        params = {
            "engine": "google",
            "q": query,
            "api_key": self.serpapi_key,
            "num": 3
        }
        try:
            search = GoogleSearch(params)
            results = search.get_dict()
            
            snippets = [res.get('snippet') for res in results.get("organic_results", [])[:2]]
            news = [n.get('title') for n in results.get("news_results", [])[:1]]
            
            context = " | ".join(snippets + news)
            return context if context else "No specific recent data found."
        except Exception as e:
            print(f"Search Error: {e}")
            return "Search unavailable. Proceeding with general knowledge."

    def log_for_training(self, user_msg, context, response):
        """Saves data for the continuous training pipeline (JSONL format)"""
        data = {
            "instruction": "Respond to a person in a live GD session with sharp, grounded points.",
            "input": user_msg,
            "realtime_context": context,
            "output": response,
            "timestamp": datetime.now().isoformat()
        }
        with open(self.training_log_path, "a") as f:
            f.write(json.dumps(data) + "\n")

    def get_response(self, user_message, topic="General"):
        # 1. Fetch search context
        realtime_data = self.fetch_realtime_data(user_message + " " + topic)

        # 2. System Prompt (Your requested Anti-Gravity Identity)
        system_prompt = (
            "You are a voice-based AI assistant named Anti-Gravity that participates in live group discussions. "
            "Your unique capability is accessing REAL-TIME data from Google Search. "
            "CORE BEHAVIOR: "
            "1. Identify the SPECIFIC nuance in the user's message. "
            "2. Respond directly using real-time search context if provided. "
            "3. Never give generic summaries. Use 2-4 sentences max. Tone: Natural."
        )

        user_prompt = f"""
        DISCUSSION TOPIC: {topic}
        USER MESSAGE: "{user_message}"

        [REAL-TIME DATA FOUND]:
        {realtime_data}

        RESPONSE TASK: 
        Respond directly to the user's specific point. Ground your answer in the data above.
        """

        # 3. Model Inference
        response = self.client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7
        )
        ai_msg = response.choices[0].message.content

        # 4. Log for LoRA Fine-tuning
        self.log_for_training(user_message, realtime_data, ai_msg)

        return ai_msg
