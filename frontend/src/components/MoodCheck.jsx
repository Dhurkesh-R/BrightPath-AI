import React, { useState, useEffect } from "react";
import "./MoodCheck.css"; // for styling

const moods = [
  { name: "Happy", emoji: "😊" },
  { name: "Sad", emoji: "😢" },
  { name: "Excited", emoji: "🤩" },
  { name: "Angry", emoji: "😡" },
  { name: "Tired", emoji: "😴" },
];

export default function MoodCheck({ onComplete }) {
  const [index, setIndex] = useState(0);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const today = new Date().toDateString();
    const saved = localStorage.getItem("lastMoodDate");

    if (saved !== today) {
      setShowModal(true);
    }
  }, []);

  const handleConfirm = () => {
    const today = new Date().toDateString();
    localStorage.setItem("lastMoodDate", today);

    // Save to backend here
    console.log("Mood saved:", moods[index]);

    setShowModal(false);
    if (onComplete) onComplete(moods[index]);
  };

  if (!showModal) return null;

  return (
    <div className="mood-overlay">
      <div className="mood-modal">
        <h2>How are you feeling today?</h2>

        <div className="mood-display">
          <button onClick={() => setIndex((index - 1 + moods.length) % moods.length)}>
            ◀
          </button>
          <div className="mood-emoji">
            <span className="emoji">{moods[index].emoji}</span>
            <p>{moods[index].name}</p>
          </div>
          <button onClick={() => setIndex((index + 1) % moods.length)}>
            ▶
          </button>
        </div>

        <button className="confirm-btn" onClick={handleConfirm}>
          Confirm
        </button>
      </div>
    </div>
  );
}
