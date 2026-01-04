import logging
from backend.services.chatbot.chatbot import ChatBot


def build_intervention_context(student, quiz_analysis, profile):
    return {
        "student_name": student.name,
        "overall_accuracy": quiz_analysis["overall_accuracy"],
        "weak_topics": quiz_analysis["weak_topics"],
        "behavior_risk": profile.get("behavior", {}).get("risk_score", 0),
        "emotion": profile.get("emotions", {}).get("mood", "Unknown"),
        "academic_risk": quiz_analysis["overall_accuracy"] < 40
    }

def generate_intervention_text(context, chatbot: ChatBot):
    prompt = f"""
You are an AI assistant helping a teacher support a student.

Student Name: {context['student_name']}
Overall Accuracy: {context['overall_accuracy']}%
Weak Topics: {context['weak_topics']}
Behavior Risk Score: {context['behavior_risk']}
Current Emotion: {context['emotion']}

Task:
- Suggest 2–3 concrete, practical interventions a teacher can apply.
- Be supportive, professional, and realistic.
- Do NOT diagnose medical or psychological conditions.
- Keep the response concise.
"""

    try:
        return chatbot.llm.get_reply(prompt)
    except Exception as e:
        logging.error(f"LLM intervention failed: {e}")
        return None

def fallback_intervention(context):
    suggestions = []

    if context["academic_risk"]:
        suggestions.append(
            "Provide additional remedial practice and review fundamentals."
        )

    if context["weak_topics"]:
        suggestions.append(
            f"Focus revision sessions on: {', '.join(context['weak_topics'])}."
        )

    if context["behavior_risk"] >= 60:
        suggestions.append(
            "Monitor behavior closely and consider a counseling referral."
        )

    if context["emotion"] in {"Anxious", "Stressed", "Sad"}:
        suggestions.append(
            "Offer emotional support and reduce academic pressure temporarily."
        )

    return " ".join(suggestions) or "Student is progressing normally. Continue regular monitoring."
