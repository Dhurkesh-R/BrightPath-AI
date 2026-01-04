"""
Memory system for Student Companion Chatbot (Ollama-powered).
------------------------------------------------------------

Provides:
1. ConversationBufferMemory - keeps short rolling history.
2. SummarizedMemory - keeps a compressed conversation state.
3. VectorMemory - stores embeddings for semantic recall.
4. HybridMemory - combines all three.
"""

import json
import requests
from typing import List, Dict, Optional


class ConversationBufferMemory:
    """Simple rolling chat history memory."""

    def __init__(self, max_turns: int = 20):
        self.history: List[Dict[str, str]] = []
        self.max_turns = max_turns

    def add(self, role: str, content: str):
        self.history.append({"role": role, "content": content})
        if len(self.history) > self.max_turns * 2:  # user + bot = 2 turns
            self.history = self.history[-self.max_turns * 2 :]

    def get_context(self) -> str:
        """Return recent conversation context as a string."""
        return "\n".join([f"{h['role']}: {h['content']}" for h in self.history])


class SummarizedMemory:
    """Keeps a short summary instead of full history."""

    def __init__(self, model: str = "llama3", api_url: str = "http://localhost:11434/api/generate"):
        self.summary = "The conversation just started."
        self.model = model
        self.api_url = api_url
        self.turn_count = 0

    def _summarize(self, history: str) -> str:
        """Use Ollama to summarize conversation internally."""
        payload = {
            "model": self.model,
            "prompt": f"Summarize this conversation briefly:\n{history}"
        }
        response = requests.post(self.api_url, json=payload, stream=True)
        result = ""
        for line in response.iter_lines():
            if line:
                data = json.loads(line)
                result += data.get("response", "")
        return result.strip()

    def update(self, history: str):
        self.turn_count += 1
        if self.turn_count % 10 == 0:  # summarize every 10 turns
            self.summary = self._summarize(history)

    def get_context(self) -> str:
        """Return summary for LLM prompt (not shown to user)."""
        return f"Conversation summary: {self.summary}"


class VectorMemory:
    """Long-term semantic memory using embeddings."""

    def __init__(self, embed_fn):
        """
        embed_fn: function(text) -> List[float]
        Example: sentence-transformers or OpenAI embeddings.
        """
        self.embed_fn = embed_fn
        self.vectors: List[Dict] = []

    def add(self, text: str, metadata: Optional[dict] = None):
        embedding = self.embed_fn(text)
        self.vectors.append({"embedding": embedding, "text": text, "metadata": metadata or {}})

    def search(self, query: str, top_k: int = 3) -> List[str]:
        """Return top-k relevant memories by cosine similarity."""
        import numpy as np

        def cosine(a, b):
            return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

        query_vec = self.embed_fn(query)
        scored = [(cosine(query_vec, v["embedding"]), v["text"]) for v in self.vectors]
        scored.sort(reverse=True, key=lambda x: x[0])
        return [t for _, t in scored[:top_k]]


class HybridMemory:
    """Combine buffer + summary + vector memory."""

    def __init__(self, buffer: ConversationBufferMemory, summary: SummarizedMemory, vector: VectorMemory):
        self.buffer = buffer
        self.summary = summary
        self.vector = vector

    def update(self, role: str, content: str):
        """Update all memories with new conversation turn."""
        self.buffer.add(role, content)
        history_str = self.buffer.get_context()
        self.summary.update(history_str)
        if role == "user":  # store only user queries in vector DB
            self.vector.add(content)

    def get_context(self, query: str = "") -> str:
        """Return combined memory context for LLM prompts (not shown to user)."""
        context = [
            self.summary.get_context(),
            "--- Recent Conversation ---",
            self.buffer.get_context(),
        ]
        if query:
            relevant = self.vector.search(query)
            if relevant:
                context.append("--- Relevant Memory ---")
                context.extend(relevant)
        return "\n".join(context)
