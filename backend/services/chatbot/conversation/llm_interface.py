import requests
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# The host is now loaded from the .env file
OLLAMA_HOST = os.getenv("OLLAMA_HOST")

class LLMInterface:
    def __init__(self, ollama_model="llama3", host=OLLAMA_HOST):
        # We use the host loaded from the environment
        self.model = ollama_model
        self.host = host

    def get_reply(self, prompt: str) -> str:
        """Send prompt to Ollama via the ngrok tunnel and stream response."""
        
        if not self.host:
            print("❌ OLLAMA_HOST not set in .env file. Cannot connect.")
            return "Connection error."
        
        try:
            api_endpoint = f"{self.host}/api/generate"
            print(f"Connecting to: {api_endpoint}")
            
            # --- FIX: Explicitly include "stream": true in the JSON payload ---
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": True  # Crucial for chunked responses
            }
            
            response = requests.post(
                api_endpoint,
                json=payload,
                stream=True,
                timeout=300
            )
            response.raise_for_status() # Raises an HTTPError for bad responses (4xx or 5xx)
            
            full_reply = ""
            print("AI Response:")
            
            # Stream the response chunk by chunk
            for line in response.iter_lines():
                if not line:
                    continue
                
                # Check for line content before decoding
                try:
                    data = json.loads(line.decode("utf-8"))
                except json.JSONDecodeError:
                    print(f"\n❌ JSON Decode Error on line: {line.decode('utf-8')}")
                    continue

                # Check for an explicit error message from Ollama itself
                if data.get("error"):
                    raise Exception(data["error"])
                    
                if "response" in data:
                    # Print the response chunk to see the stream in real-time
                    print(data["response"], end="", flush=True) 
                    full_reply += data["response"]
                
                if data.get("done"):
                    break

            return full_reply.strip()
            
        except requests.exceptions.HTTPError as e:
            print(f"\n❌ HTTP Error {response.status_code}: Could not reach or process request at the Ollama server.")
            print(f"Server response details: {response.text}")
            return None
        except Exception as e:
            print(f"\n❌ Ollama failed: {e}")
            return None

if __name__ == "__main__":
    # --- Test Execution ---
    
    # NOTE: Ensure you have the 'llama3' model pulled in Ollama. 
    # If not, change the model name below or run 'ollama pull llama3'
    
    llm = LLMInterface(ollama_model="llama3")
    
    print("\n" + "="*50)
    print("🚀 Starting LLM Query via ngrok Tunnel...")
    print("="*50)
    
    test_prompt = "Give me a single, short, one-sentence fun fact about the number 7."
    print(f"Prompt: {test_prompt}\n")
    
    reply = llm.get_reply(test_prompt)
    
    print("\n\n" + "="*50)
    print("✅ Full Reply Received.")
    print("="*50)
