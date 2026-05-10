from datetime import datetime, timedelta
import json
from collections import defaultdict
from .quiz_analysis import analyze_quiz

def academic_weekly_delta(quiz_results):
    """
    Returns:
        previous_week_avg, current_week_avg
    """

    now = datetime.utcnow()
    start_current = now - timedelta(days=7)
    start_previous = now - timedelta(days=14)

    current_scores = []
    previous_scores = []

    for q in quiz_results:
        # 1. Parse the data
        if isinstance(q.summary_data, dict):
            summary = q.summary_data
        elif isinstance(q.summary_data, str):
            summary = json.loads(q.summary_data)
        else:
            summary = q.summary_data
            
        quiz_values = summary.values() if isinstance(summary, dict) else summary

        try:
            analysis = analyze_quiz(quiz_values)
            accuracy = analysis.get("overall_accuracy", 0)
        except Exception as e:
            print(f"Error analyzing quiz {q.id}: {e}")
            continue
            
        if q.taken_at >= start_current:
            current_scores.append(accuracy)
        elif start_previous <= q.taken_at < start_current:
            previous_scores.append(accuracy)

    prev_avg = (
        round(sum(previous_scores) / len(previous_scores), 2)
        if previous_scores else None
    )

    curr_avg = (
        round(sum(current_scores) / len(current_scores), 2)
        if current_scores else None
    )

    return prev_avg, curr_avg
