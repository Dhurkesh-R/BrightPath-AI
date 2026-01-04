def recommend_academics(academic_score):
    if academic_score < 50:
        return {
            "type": "academic",
            "priority": "high",
            "title": "Academic support recommended",
            "reason": "Recent academic performance is below average.",
            "action": "Schedule daily 20-minute revision sessions or consult the class teacher.",
            "confidence": 0.9
        }
    return None


def recommend_sports(sports_score):
    if sports_score < 40:
        return {
            "type": "sports",
            "priority": "medium",
            "title": "Increase physical activity",
            "reason": "Low sports engagement detected in recent weeks.",
            "action": "Encourage morning walks or enroll in a sports activity.",
            "confidence": 0.8
        }
    return None


def recommend_creative(creative_score):
    if creative_score > 70:
        return {
            "type": "creative",
            "priority": "low",
            "title": "Nurture creative strengths",
            "reason": "Strong creative engagement observed.",
            "action": "Consider enrolling in art, music, or creative workshops.",
            "confidence": 0.7
        }
    return None


def recommend_balance(academic, creative, sports):
    if academic > 70 and sports < 30:
        return {
            "type": "wellbeing",
            "priority": "medium",
            "title": "Encourage better balance",
            "reason": "Strong academics but limited physical activity.",
            "action": "Introduce short play or outdoor time after study sessions.",
            "confidence": 0.75
        }
    return None
