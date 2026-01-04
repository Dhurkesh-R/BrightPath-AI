from collections import defaultdict
from .quiz_analysis import analyze_quiz
import json
import logging

ACADEMIC_RISK_THRESHOLD = 40

POSITIVE_MOODS = {"Happy", "Focused", "Calm", "Neutral"}

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
    positive_students = 0
    high_risk_students = 0

    emotional_counts = defaultdict(int)
    behavior_counts = {"low": 0, "medium": 0, "high": 0}

    # ---------- Weekly Trend ----------
    weekly_buckets = defaultdict(list)
    logging.info(quizzes)
    for q in quizzes:
        logging.info(q)
        if not q.summary_data:
            continue

        quiz_data = json.loads(q.summary_data)
        analysis = analyze_quiz(quiz_data)

        week = q.taken_at.strftime("Week %U")
        weekly_buckets[week].append(analysis["overall_accuracy"])

    weekly_trend = [
        {
            "week": week,
            "averageScore": round(sum(scores) / len(scores), 2)
        }
        for week, scores in sorted(weekly_buckets.items())
        if scores
    ]
    # logging.info(weekly_trend)
    # ---------- Per Student Aggregation ----------
    for p in profiles:
        # -------- Academic --------
        scores = [
            s["score"]
            for s in p.get("skills", [])
            if isinstance(s.get("score"), (int, float))
        ]

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
        is_positive = False

        if mood:
            emotional_counts[mood] += 1
            for m in POSITIVE_MOODS:
                if m in mood:
                    is_positive = True

        if is_positive:
            positive_students += 1

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
        (positive_students / total_students) * 100, 2
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

def compute_quiz_accuracy(quiz_data):
    correct = sum(q["correct"] for q in quiz_data)
    total = sum(q["total"] for q in quiz_data)
    return round((correct / total) * 100, 2) if total else 0



from collections import defaultdict

def subject_wise_performance(all_quiz_summaries):
    """
    all_quiz_summaries: list of quiz summaries
    [
        [
            {"topic": "Math", "correct": 3, "total": 5},
            {"topic": "Science", "correct": 4, "total": 5}
        ],
        ...
    ]
    """

    subject_totals = defaultdict(lambda: {"correct": 0, "total": 0})

    for quiz in all_quiz_summaries:
        for entry in quiz:
            subject = entry["topic"]
            subject_totals[subject]["correct"] += entry["correct"]
            subject_totals[subject]["total"] += entry["total"]

    return [
        {
            "subject": subject,
            "average_score": round(
                (data["correct"] / data["total"]) * 100, 2
            ) if data["total"] else 0
        }
        for subject, data in subject_totals.items()
    ]

def weekly_quiz_trend(quiz_results):
    buckets = defaultdict(list)

    for qr in quiz_results:
        week = qr.taken_at.strftime("Week %U")
        accuracy = compute_quiz_accuracy(json.loads(qr.summary_data))
        buckets[week].append(accuracy)

    return [
        {
            "week": week,
            "averageScore": round(sum(scores) / len(scores), 2)
        }
        for week, scores in sorted(buckets.items())
    ]

NEGATIVE_MOODS = {"Sad", "Angry", "Anxious", "Stressed"}

def compute_student_risk(quiz_results, emotion_logs):
    if not quiz_results:
        return "high"

    avg_score = sum(
        compute_quiz_accuracy(json.loads(q.summary_data))
        for q in quiz_results
    ) / len(quiz_results)

    negative_emotions = sum(
        1 for e in emotion_logs
        if e.mood in NEGATIVE_MOODS
    )

    # Base risk from academics
    if avg_score < 40:
        risk = "high"
    elif avg_score < 60:
        risk = "medium"
    else:
        risk = "low"

    # Escalate based on emotions
    if negative_emotions >= 3 and risk != "high":
        risk = "medium" if risk == "low" else "high"

    return risk

def risk_distribution(students):
    counts = {"low": 0, "medium": 0, "high": 0}

    for s in students:
        risk = compute_student_risk(
            s.quiz_results,
            s.emotion_logs
        )
        counts[risk] += 1

    return [
        {"type": k.capitalize(), "value": v}
        for k, v in counts.items()
    ]