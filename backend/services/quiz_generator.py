# backend/services/quiz_generator.py

import json
from datetime import date

import os
from dotenv import load_dotenv
import requests
load_dotenv()

OLLAMA_HOST = os.getenv("OLLAMA_HOST")

DAILY_CACHE = {}

# Default fallback questions if Ollama fails or during development
FALLBACK_QUESTIONS = {
    "Math": [
        {"id": "Math-1", "subject": "Math", "question": "What is 12 × 8?", "options": ["80", "88", "96", "108"], "answer": "96"},
        {"id": "Math-2", "subject": "Math", "question": "Simplify: 2x + 3x", "options": ["5x", "6x", "9x", "10x"], "answer": "5x"},
    ],
    "Science": [
        {"id": "Science-1", "subject": "Science", "question": "What planet is known as the Red Planet?", "options": ["Earth", "Mars", "Venus", "Jupiter"], "answer": "Mars"},
        {"id": "Science-2", "subject": "Science", "question": "What gas do plants release during photosynthesis?", "options": ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], "answer": "Oxygen"},
    ],
}

# 🔹 Generate AI-powered quizzes using Ollama
def generate_quiz_with_ai(subject, difficulty="medium", count=5):
    """
    Generate quiz questions dynamically using Ollama.
    """
    prompt = f"""
    You are a professional educational content creator. 
    Create {count} multiple-choice questions in JSON format for the subject "{subject}".
    Difficulty: {difficulty}.
    Each question should have:
      - "id": unique identifier,
      - "subject": subject name,
      - "question": clear text,
      - "options": 4 unique options,
      - "answer": correct option.
    Return ONLY JSON, not markdown or explanations.
    Example output:
    [
      {{
        "id": "Math-1",
        "subject": "Math",
        "question": "What is 5 + 7?",
        "options": ["10", "11", "12", "13"],
        "answer": "12"
      }}
    ]
    [
        {{
            'id': 'English-5',
            'subject': 'English',
            'question': 'Which part of speech is a word that functions as both a noun and a verb?',
            'options': ['Adverb', 'Preposition', 'Interjection', 'Verb/Adjective'],
            'answer': 'Interjection'
        }}
    ]
    """

    try:
        response = requests.post(
            f"{OLLAMA_HOST}/api/generate",
            json={"model": "llama3", "prompt": prompt},
            stream=True,
            timeout=120
        )

        response.raise_for_status()

        full_text = ""

        # collect ALL chunks from streaming API
        for line in response.iter_lines():
            if not line:
                continue

            try:
                chunk = json.loads(line)
            except:
                continue

            if "response" in chunk:
                full_text += chunk["response"]

        # Now parse final JSON text
        return json.loads(full_text)  # This will now work

    except Exception as e:
        print(f"[⚠️ Ollama Error] {e}")
        return FALLBACK_QUESTIONS.get(subject, [])

# 🔹 Main function to generate the daily quiz
def generate_daily_quiz():
    today = str(date.today())

    if today in DAILY_CACHE:
        return DAILY_CACHE[today]

    subjects = ["Math", "Science", "English", "History"]

    # Optional: use student profile to adjust difficulty
    # profile = get_student_profile(user_id) if user_id else {}
    # difficulty = profile.get("difficulty", "medium") if profile else "medium"

    quiz_data = {}

    for subject in subjects:
        ai_quiz = generate_quiz_with_ai(subject=subject, count=5)
        quiz_data[subject] = ai_quiz

    DAILY_CACHE[today] = quiz_data
    return quiz_data

# 🔹 Generate a custom quiz on demand
def generate_custom_quiz(topic, difficulty="medium", count=5):
    """
    Generate a quiz based on a custom topic (e.g., 'Photosynthesis', 'Python Loops').
    """
    prompt = f"""
    Create {count} educational multiple-choice questions about "{topic}".
    Difficulty: {difficulty}.
    Return JSON array only, formatted as:
    [
      {{
        "id": "Custom-1",
        "subject": "{topic}",
        "question": "...",
        "options": ["A", "B", "C", "D"],
        "answer": "..."
      }}
    ]
    """

    try:
        response = requests.post(
                f"{OLLAMA_HOST}/api/generate",
                json={"model": "llama3", "prompt": prompt},
                stream=True,
                timeout=120
            )
        response.raise_for_status()
        content = response.json()["response"]
        quiz_json = json.loads(content)
        return quiz_json

    except Exception as e:
        print(f"[⚠️ Ollama Custom Quiz Error] {e}")
        return []

