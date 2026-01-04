from collections import defaultdict
from datetime import datetime
import json

def normalize(value, max_value):
    if max_value == 0:
        return 0
    return round(min((value / max_value) * 100, 100), 2)


def academic_progress(quiz_results, period):
    """
    Uses QuizResult.summary_data
    """
    buckets = defaultdict(list)

    for q in quiz_results:
        data = json.loads(q.summary_data)

        correct = sum(item["correct"] for item in data)
        total = sum(item["total"] for item in data)

        accuracy = normalize(correct, total)

        label = (
            q.taken_at.strftime("Week %U")
            if period == "weekly"
            else q.taken_at.strftime("%b %Y")
        )

        buckets[label].append(accuracy)

    trend = [
        {"label": k, "academic": round(sum(v) / len(v), 2)}
        for k, v in sorted(buckets.items())
    ]

    latest = trend[-1]["academic"] if trend else 0
    return latest, trend


def activity_progress(activities, category, period, key_name):
    buckets = defaultdict(int)

    for a in activities:
        if a.category != category:
            continue

        label = (
            a.created_at.strftime("Week %U")
            if period == "weekly"
            else a.created_at.strftime("%b %Y")
        )
        buckets[label] += a.time_spent

    max_time = max(buckets.values(), default=0)

    trend = [
        {"label": k, key_name: normalize(v, max_time)}
        for k, v in sorted(buckets.items())
    ]

    latest = trend[-1][key_name] if trend else 0
    return latest, trend

def generate_progress_insight(academic, creative, sports):
    if academic > creative and academic > sports:
        return "Academic growth is strongest. Encourage creative or physical balance."
    if sports < 40:
        return "Physical activity appears low. Consider encouraging regular sports."
    if creative > 70:
        return "Strong creative engagement detected. Great for emotional development."
    return "Balanced progress across all areas."
