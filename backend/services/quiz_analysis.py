from collections import defaultdict

def analyze_quiz(quiz_data):
    """
    Input: subject-aggregated quiz summary
    [
        {"topic": "Math", "correct": 8, "total": 10}
    ]
    """

    if not quiz_data:
        return {
            "overall_accuracy": 0,
            "topic_analysis": [],
            "weak_topics": [],
            "message": "No quizzes available for analysis."
        }

    topic_analysis = []
    weak_topics = []

    total_correct = 0
    total_questions = 0

    for entry in quiz_data:
        topic = entry.get("topic", "Unknown")
        correct = entry.get("correct", 0)
        total = entry.get("total", 0)

        accuracy = round((correct / total) * 100, 2) if total else 0

        topic_analysis.append({
            "topic": topic,
            "accuracy": accuracy
        })

        if accuracy < 60:
            weak_topics.append(topic)

        total_correct += correct
        total_questions += total

    overall_accuracy = round(
        (total_correct / total_questions) * 100, 2
    ) if total_questions else 0

    return {
        "overall_accuracy": overall_accuracy,
        "topic_analysis": topic_analysis,
        "weak_topics": weak_topics
    }
