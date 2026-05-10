import datetime
from datetime import timedelta
from backend.models import *
from .academic_metrics import academic_weekly_delta

def academic_drop_notification(prev, curr):
    if prev is None or curr is None:
        return None
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
    overdue = [g for g in goals if g.status != "completed" and g.deadline < datetime.utcnow()]
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


def generate_parent_notifications():
    parents = User.query.filter_by(role="parent").all()

    for parent in parents:
        student = User.query.filter_by(email=parent.parent_profile.child_email).first()
        
        if not student:
            print(f"Skipping parent {parent.id}: No student found with email {parent.parent_profile.child_email}")
            continue
        student_id = student.id
        
        quizzes = QuizResult.query.filter_by(user_id=student_id).all()
        activities = Activity.query.filter_by(user_id=student_id).all()
        goals = Goal.query.filter_by(user_id=student_id).all()

        prev, curr = academic_weekly_delta(quizzes)

        detectors = [
            academic_drop_notification(prev, curr),
            missed_goal_notification(goals),
            inactivity_notification(activities, "sports"),
            inactivity_notification(activities, "art"),
        ]

        for d in detectors:
            if d:
                db.session.add(Notification(
                    user_id=parent.id,
                    student_id=student_id,
                    **d
                ))

    db.session.commit()
