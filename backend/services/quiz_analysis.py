from collections import defaultdict

def analyze_quiz(quiz_data):
    """
    Input: raw question logs
    Output: subject-level accuracy + weak subjects
    """

    if not quiz_data:
        return {
            "overall_accuracy": 0,
            "topic_analysis": [],
            "weak_topics": [],
            "message": "No quizzes available for analysis."
        }

    topic_stats = defaultdict(lambda: {"correct": 0, "total": 0})

    # Aggregate raw answers
    for q in quiz_data:
        subject = q.get("subject", "Unknown")
        topic_stats[subject]["total"] += 1
        if q.get("isCorrect"):
            topic_stats[subject]["correct"] += 1

    topic_analysis = []
    weak_topics = []

    total_correct = 0
    total_questions = 0

    # Analyze per-subject
    for topic, stats in topic_stats.items():
        if stats["total"] == 0:
            accuracy = 0
        else:
            accuracy = round((stats["correct"] / stats["total"]) * 100, 2)

        topic_analysis.append({
            "topic": topic,
            "accuracy": accuracy
        })

        total_correct += stats["correct"]
        total_questions += stats["total"]

        if accuracy < 60:
            weak_topics.append(topic)

    overall_accuracy = round((total_correct / total_questions) * 100, 2) if total_questions else 0

    return {
        "overall_accuracy": overall_accuracy,
        "topic_analysis": topic_analysis,
        "weak_topics": weak_topics
    }
