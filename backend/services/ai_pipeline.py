# backend/services/ai_pipeline.py
from .quiz_analysis import analyze_quiz
from .chat_analysis import analyze_chat
from .student_profile import build_dashboard_profile

def build_student_profile(quiz_data, chat_data, student_info=None, activities=None):
    """
    Builds a dashboard-ready student profile.
    """
    quiz_insights = analyze_quiz(quiz_data)
    chat_insights = analyze_chat(chat_data)
    final_profile = build_dashboard_profile(quiz_insights, chat_insights, student_info, activities)
    return final_profile
