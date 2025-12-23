from collections import defaultdict
from .quiz_analysis import analyze_quiz
import json

ACADEMIC_RISK_THRESHOLD = 40

POSITIVE_MOODS = {"Happy", "Focused", "Calm", "Neutral"}
NEGATIVE_MOODS = {"Anxious", "Stressed", "Angry", "Sad", "Tired"}

def aggregate_profiles(profiles, quizzes):
    total_students = len(profiles)
    if total_students == 0:
        return {
            "averageScore": 0,
            "positiveEmotionRatio": 0,
            "highRiskPercentage": 0,
            "emotionalDistribution": [],
            "behaviorRisks": [],
            "weeklyTrend": []
        }

    # ---------- Accumulators ----------
    class_scores = []
    positive_emotion_count = 0
    high_risk_students = 0

    emotional_counts = defaultdict(int)
    behavior_counts = {"low": 0, "medium": 0, "high": 0}

    # ---------- Weekly Trend ----------
    weekly_buckets = defaultdict(list)
    for q in quizzes:
        week = q.taken_at.strftime("Week %U")
        if isinstance(q.summary_data, dict):
                score = analyze_quiz(q.summary_data.values())["overall_accuracy"]
        else:
            score = analyze_quiz(json.loads(q.summary_data).values())["overall_accuracy"]
        weekly_buckets[week].append(score)

    weekly_trend = [
        {
            "week": week,
            "averageScore": round(sum(scores) / len(scores), 2)
        }
        for week, scores in sorted(weekly_buckets.items())
        if scores
    ]

    # ---------- Per Student Aggregation ----------
    for p in profiles:
        # -------- Academic --------
        scores = [s["score"] for s in p.get("skills", []) if "score" in s]
        avg_student_score = None

        if scores:
            avg_student_score = sum(scores) / len(scores)
            class_scores.append(avg_student_score)

        academically_at_risk = (
            avg_student_score is not None and
            avg_student_score < ACADEMIC_RISK_THRESHOLD
        )

        # -------- Emotions --------
        mood = p.get("emotions", {}).get("mood")
        if mood:
            emotional_counts[mood] += 1
            for m in POSITIVE_MOODS:
                if m in mood:
                    positive_emotion_count += 1

        # -------- Behavior --------
        risk_score = p.get("behavior", {}).get("risk_score", 0)

        if risk_score < 30:
            behavior_counts["low"] += 1
            behavior_risk = False
        elif risk_score < 60:
            behavior_counts["medium"] += 1
            behavior_risk = False
        else:
            behavior_counts["high"] += 1
            behavior_risk = True

        # -------- Composite High Risk --------
        if academically_at_risk or behavior_risk:
            high_risk_students += 1

    # ---------- Final Metrics ----------
    average_score = (
        round(sum(class_scores) / len(class_scores), 2)
        if class_scores else 0
    )

    positive_emotion_ratio = round(
        (positive_emotion_count / total_students) * 100, 2
    )

    high_risk_percentage = round(
        (high_risk_students / total_students) * 100, 2
    )

    return {
        "averageScore": average_score,
        "positiveEmotionRatio": positive_emotion_ratio,
        "highRiskPercentage": high_risk_percentage,
        "emotionalDistribution": [
            {"mood": k, "value": v}
            for k, v in emotional_counts.items()
        ],
        "behaviorRisks": [
            {"type": k.capitalize(), "value": v}
            for k, v in behavior_counts.items()
        ],
        "weeklyTrend": weekly_trend
    }
