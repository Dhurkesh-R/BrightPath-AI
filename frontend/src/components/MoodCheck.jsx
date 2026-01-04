import React, { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

const moods = [
  { name: "Happy", emoji: "😊" },
  { name: "Sad", emoji: "😢" },
  { name: "Excited", emoji: "🤩" },
  { name: "Angry", emoji: "😡" },
  { name: "Tired", emoji: "😴" },
];

export default function MoodCheck({ onComplete }) {
  // 1. Consume your ThemeContext
  const { theme, getThemeClasses } = useTheme();
  
  // 2. Get the dynamic classes based on current theme
  const themeClasses = getThemeClasses(theme);

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

    // Logic to save mood
    console.log("Mood saved:", moods[index]);

    setShowModal(false);
    if (onComplete) onComplete(moods[index]);
  };

  if (!showModal) return null;

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className={`w-full max-w-sm p-8 rounded-3xl shadow-2xl border transition-colors duration-300 
              ${themeClasses.cardBg} ${themeClasses.border} ${themeClasses.text}`}
          >
            <h2 className="text-2xl font-bold text-center mb-8">
              How are you feeling today?
            </h2>

            <div className="flex items-center justify-between gap-4">
              {/* Secondary Styled Button for Navigation */}
              <button 
                onClick={() => setIndex((index - 1 + moods.length) % moods.length)}
                className={`p-3 rounded-full transition-all 
                  ${themeClasses.buttonSecondaryBg} ${themeClasses.buttonSecondaryHoverBg} ${themeClasses.textOnSecondary}`}
                aria-label="Previous mood"
              >
                <ChevronLeft size={24} />
              </button>

              <div className="flex flex-col items-center flex-1">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={index}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -10, opacity: 0 }}
                    className="flex flex-col items-center"
                  >
                    <span className="text-7xl mb-4 drop-shadow-lg leading-none">
                      {moods[index].emoji}
                    </span>
                    <p className={`text-xl font-bold tracking-wide ${moods[index].color}`}>
                      {moods[index].name}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Secondary Styled Button for Navigation */}
              <button 
                onClick={() => setIndex((index + 1) % moods.length)}
                className={`p-3 rounded-full transition-all 
                  ${themeClasses.buttonSecondaryBg} ${themeClasses.buttonSecondaryHoverBg} ${themeClasses.textOnSecondary}`}
                aria-label="Next mood"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Primary Styled Button for Confirmation */}
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full py-4 mt-8 rounded-2xl font-bold shadow-lg transition-all flex items-center justify-center gap-2
                ${themeClasses.buttonPrimaryBg} ${themeClasses.buttonPrimaryHoverBg} ${themeClasses.textOnPrimary}`} 
              onClick={handleConfirm}
            >
              <Check size={20} />
              Confirm
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}