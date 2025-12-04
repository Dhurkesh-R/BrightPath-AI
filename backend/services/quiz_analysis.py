def analyze_quiz(quiz_data):
    """
    Input: list of dicts -> [{"topic": "Math", "correct": 8, "total": 10}, ...]
    Output: quiz insights including topic-level accuracy and weak areas.
    """

    # If no quizzes / no quiz today
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

    for quiz in quiz_data:

        # Prevent division by zero for a bad quiz entry
        if quiz["total"] == 0:
            accuracy = 0
        else:
            accuracy = round((quiz["correct"] / quiz["total"]) * 100, 2)

        topic_analysis.append({
            "topic": quiz["topic"],
            "accuracy": accuracy
        })

        total_correct += quiz.get("correct", 0)
        total_questions += quiz.get("total", 0)

        if accuracy < 60:
            weak_topics.append(quiz["topic"])

    # Prevent division by zero across entire dataset
    if total_questions == 0:
        overall_accuracy = 0
    else:
        overall_accuracy = round((total_correct / total_questions) * 100, 2)

    return {
        "overall_accuracy": overall_accuracy,
        "topic_analysis": topic_analysis,
        "weak_topics": weak_topics
    }
