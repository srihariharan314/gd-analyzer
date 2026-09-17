# Test script for the Enhanced Discussion logic
import sys
import os

# 1. Ensure the logic file is accessible
# (Assuming you've copied enhanced_discussion.py to this folder)
# For this demo, I'll include the core logic here so it's standalone.

import openai
from collections import deque

class DiscussionManager:
    def __init__(self, api_key):
        self.client = openai.OpenAI(api_key=api_key)
        self.history = deque(maxlen=6) 
        
    def get_discussion_response(self, user_text):
        system_instructions = (
            "You are a participant in a live group discussion. "
            "CRITICAL: Do not start with generic phrases like 'I understand' or 'That's interesting'. "
            "Address the specific point mentioned by the user immediately. "
            "Respond directly like a human would. 2-4 sentences max."
        )
        
        history_str = "\n".join([f"{m['role'].capitalize()}: {m['content']}" for m in self.history])
        
        discussion_prompt = f"Context:\n{history_str}\n\nLast speaker said: \"{user_text}\"\n\nIdentify the point and respond directly:"

        try:
            response = self.client.chat.completions.create(
                model="gpt-4o", 
                messages=[
                    {"role": "system", "content": system_instructions},
                    {"role": "user", "content": discussion_prompt}
                ],
                temperature=0.7,
                max_tokens=150
            )
            ai_response = response.choices[0].message.content.strip()
            self.history.append({"role": "user", "content": user_text})
            self.history.append({"role": "assistant", "content": ai_response})
            return ai_response
        except Exception as e:
            return f"Error: {str(e)}"

# --- RUNNING THE TEST ---
if __name__ == "__main__":
    print("--- AI Discussion Test ---")
    api_key = input("Enter your OpenAI API Key: ").strip()
    
    if not api_key:
        print("API Key required.")
        sys.exit(1)
        
    manager = DiscussionManager(api_key=api_key)
    
    print("\nAI is listening... (Type 'exit' to stop)")
    
    while True:
        user_input = input("\nYou: ")
        if user_input.lower() in ['exit', 'quit']:
            break
            
        print("AI is thinking...")
        response = manager.get_discussion_response(user_input)
        print(f"\nAI: {response}")
