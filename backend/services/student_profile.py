# backend/services/student_profile.py
from backend.services.progress import activity_progress

def build_dashboard_profile(quiz_insights, chat_insights, student_info, activities):
    """
    Generates a logical, explainable dashboard profile.
    """

    name = student_info["name"]
    age = student_info["age"]
    grade = student_info["grade"]
    profile_pic_url = student_info["profilePicUrl"]

    # 1️⃣ Skills from quiz data
    skills = []
    for topic in quiz_insights["topic_analysis"]:
        acc = topic["accuracy"]
        if acc >= 85:
            level = "Advanced"
        elif acc >= 60:
            level = "Proficient"
        else:
            level = "Needs Improvement"

        skills.append({
            "name": topic["topic"],
            "level": level,
            "score": acc
        })

    # 2️⃣ Learning Style — determined by curiosity level
    c = chat_insights["curiosity_level"]
    if c >= 5:
        learning_type = "Active Explorer"
        desc = "Shows strong curiosity and learns best through exploration and experiments."
    elif c >= 2:
        learning_type = "Visual Learner"
        desc = "Learns effectively with visual examples and structured explanations."
    else:
        learning_type = "Passive Learner"
        desc = "Prefers clear, direct instruction and repetition."

    # 3️⃣ Emotional tone
    s = chat_insights["sentiment_score"]
    if s >= 0.3:
        mood = "Positive & Engaged"
    elif s >= 0:
        mood = "Neutral & Calm"
    else:
        mood = "Frustrated or Tired"

    emotions = {
        "mood": mood,
        "trendDescription": f"Average sentiment score: {s}",
        "risk_score": max(0, int((1 - (s + 1) / 2) * 100))
    }

    # 4️⃣ Behavior insights
    behavior = {
        "traits": [
            "Curious about new concepts" if c > 2 else "Needs motivation to ask questions",
            "Seeks help often" if chat_insights["help_requests"] > 2 else "Tries to solve independently"
        ],
        "risk_score": 30 if chat_insights["help_requests"] > 2 else 10
    }

    # 5️⃣ Success Path (based on weaknesses)
    weak_topics = quiz_insights["weak_topics"]
    success_steps = []

    if weak_topics:
        success_steps.append(f"Review {', '.join(weak_topics)} with guided examples.")
    if behavior["risk_score"] > 20:
        success_steps.append("Encourage self-reflection after each mistake.")
    success_steps.append("Set weekly goals and track progress visually.")
 
    sports, _ = activity_progress(activities, "sports", "monthly", "sports")
    if sports >= 90 :
        physical = "Highly Active & Sportive"
    elif sports >= 70:
        physical = "Excellent & Appreciative"
    elif sports <= 40:
        physical = "Bad & Concerning"
    else:
        physical = "Good & Normal"


    # Final structured data
    return {
        "profile": {
            "name": name,
            "age": age,
            "grade": grade,
            "profilePicUrl": profile_pic_url,
        },
        "skills": skills,
        "learningStyle": {
            "type": learning_type,
            "description": desc,
        },
        "emotions": emotions,
        "behavior": behavior,
        "health": {"physical":physical, "score":sports},
        "successPath": {"steps": success_steps},
    }
