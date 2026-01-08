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
    # 1. Define constants (assuming time_spent is in minutes)
    MINUTES_IN_DAY = 24 * 60
    
    # Buckets will store { (year, period_index): time_spent }
    # This ensures correct chronological sorting
    buckets = defaultdict(int)

    for a in activities:
        if a.category != category:
            continue
            
        # Use a tuple as a sortable key
        if period == "weekly":
            # (Year, WeekNumber)
            time_key = (a.created_at.year, int(a.created_at.strftime("%U")))
        else:
            # (Year, MonthNumber)
            time_key = (a.created_at.year, a.created_at.month)
            
        buckets[time_key] += a.time_spent

    trend = []
    # Sort keys to ensure trend is chronological
    for time_key in sorted(buckets.keys()):
        year, index = time_key
        
        # 2. Calculate available time (the denominator)
        if period == "weekly":
            total_available = 7 * MINUTES_IN_DAY
            label = f"Week {index}"
        else:
            # Get actual days in that specific month
            days_in_month = calendar.monthrange(year, index)[1]
            total_available = days_in_month * MINUTES_IN_DAY
            label = datetime(year, index, 1).strftime("%b %Y")

        # 3. Calculate percentage (capped at 100)
        raw_val = buckets[time_key]
        progress_score = min(round((raw_val / total_available) * 100, 1), 100)

        trend.append({
            "label": label,
            key_name: progress_score,
            "raw_minutes": raw_val # Helpful for tooltips
        })

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
