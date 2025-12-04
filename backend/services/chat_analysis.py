# backend/services/chat_analysis.py
import textblob

def analyze_chat(chat_data):
    """
    Input: list of messages (dicts or strings)
    Output: sentiment score, curiosity, help patterns
    """
    from textblob import TextBlob

    help_requests = 0
    curiosity_level = 0
    sentiment_scores = []

    for chat in chat_data:
        msg = chat["message"] if isinstance(chat, dict) else chat
        msg_lower = msg.lower()

        # Detect curiosity
        if "why" in msg_lower or "how" in msg_lower or "can you explain" in msg_lower:
            curiosity_level += 1

        # Detect help-seeking
        if "i don’t understand" in msg_lower or "help" in msg_lower or "confused" in msg_lower:
            help_requests += 1

        sentiment_scores.append(TextBlob(msg).sentiment.polarity)

    avg_sentiment = round(sum(sentiment_scores) / len(sentiment_scores), 2) if sentiment_scores else 0

    return {
        "sentiment_score": avg_sentiment,
        "curiosity_level": curiosity_level,
        "help_requests": help_requests
    }
