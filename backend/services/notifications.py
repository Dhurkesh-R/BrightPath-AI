import datetime
from datetime import timedelta

def academic_drop_notification(prev, curr):
    if prev >= 70 and curr < prev - 15:
        return {
            "type": "academic",
            "title": "Academic performance dropped",
            "message": (
                f"Weekly quiz performance dropped from {prev}% to {curr}%."
            ),
            "severity": "warning"
        }
    return None



def missed_goal_notification(goals):
    overdue = [g for g in goals if g.status != "completed" and g.due_date < datetime.utcnow()]
    if overdue:
        return {
            "type": "goals",
            "title": "Missed learning goals",
            "message": f"{len(overdue)} goals were missed this week.",
            "severity": "critical"
        }
    return None


def inactivity_notification(activities, category, days=7):
    recent = [
        a for a in activities
        if a.category == category and a.created_at > datetime.utcnow() - timedelta(days=days)
    ]

    if not recent:
        return {
            "type": "wellbeing",
            "title": f"Low {category} activity",
            "message": f"No {category} activity logged in the past {days} days.",
            "severity": "info"
        }
    return None
