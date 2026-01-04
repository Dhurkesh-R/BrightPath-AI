import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Puzzle } from "lucide-react";
import { useTheme, getThemeClasses } from "../contexts/ThemeContext";
import { sendQuizResults, getDailyQuiz } from "../services/api";

const Quizzes = () => {
  // Apply theme hook
  const { theme, _, t } = useTheme();
  const { bg, text, border, barBg, textSecondary } = getThemeClasses(theme);

  const [quizzes, setQuizzes] = useState({});
  const [currentSubject, setCurrentSubject] = useState("English");
  // FIX: Removed space in set function name for correct destructuring
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Stores the option selected by the user to trigger visual feedback
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // Fetch daily quiz
  useEffect(() => {
      async function loadQuiz() {
          try {
              setLoading(true);
              // Simulate API delay
              await new Promise(resolve => setTimeout(resolve, 500)); 
              const data = await getDailyQuiz(); 
              setQuizzes(data);
              
              // Initialize current subject to the first one available
              if (Object.keys(data).length > 0) {
                   setCurrentSubject(Object.keys(data)[0]);
              }
          } catch (err) {
              console.error("Failed to fetch quiz:", err);
          } finally {
              setLoading(false);
          }
      }
      loadQuiz();
  }, []);

  // Reset quiz at midnight (logic preserved)
  useEffect(() => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const msUntilMidnight = midnight - now;
      const timer = setTimeout(() => {
          localStorage.clear();
          window.location.reload();
      }, msUntilMidnight);
      return () => clearTimeout(timer);
  }, []);

  const subjects = Object.keys(quizzes);
  const currentQuestions = quizzes[currentSubject] || [];
  const currentQuestion = currentQuestions[currentIndex];

  const handleAnswer = async (option) => {
      // Prevent double clicking while feedback is visible
      if (selectedAnswer || !currentQuestion) return;

      // 1. Trigger visual feedback immediately
      setSelectedAnswer(option);

      // Comparing the selected option string to the 'answer' string
      const isCorrect = option === currentQuestion.answer;
      const answeredQuestionData = {
          ...currentQuestion,
          selected: option,
          isCorrect: isCorrect,
      };

      // Store the answer
      setAnswers((prev) => ({
          ...prev,
          [currentQuestion.id]: answeredQuestionData,
      }));

      // 2. Pause for 1.5 seconds to show feedback
      setTimeout(async () => {
          // 3. Clear feedback state for the next question
          setSelectedAnswer(null);

          // 4. Move to the next question/subject
          if (currentIndex < currentQuestions.length - 1) {
              setCurrentIndex(currentIndex + 1);
          } else {
              // Next subject or finish
              const currentIdx = subjects.indexOf(currentSubject);
              if (currentIdx < subjects.length - 1) {
                  setCurrentSubject(subjects[currentIdx + 1]);
                  setCurrentIndex(0);
              } else {
                    setFinished(true);
                    setSubmitting(true);

                    try {
                      const finalAnswers = {
                        ...answers,
                        [currentQuestion.id]: answeredQuestionData
                      };
                  
                      await sendQuizResults({ summary_data: finalAnswers });
                  
                      localStorage.setItem("studentProfile", JSON.stringify(finalAnswers));
                      const xp = Object.keys(finalAnswers).length * 10;
                      localStorage.setItem("xpPoints", xp);
                  
                    } catch (err) {
                      console.error("Error sending results:", err);
                    } finally {
                      setSubmitting(false);
                    }

              }
          }
      }, 1500); 
  };

  const restartQuiz = () => {
      setAnswers({});
      setCurrentSubject("English");
      setCurrentIndex(0);
      setFinished(false);
  };

  /**
   * Determines the Tailwind CSS classes for an option button based on the quiz state.
   */
  const getOptionClass = (option) => {
      const isAnswered = selectedAnswer !== null;
      if (!currentQuestion) return "";
      
      // Checking against currentQuestion.answer
      const isCorrectOption = option === currentQuestion.answer; 
      const isSelectedByUser = option === selectedAnswer;

      // Base class for styling and shape
      let classes = "px-4 py-3 text-left rounded-xl transition-all duration-200 shadow-md border ";

      if (!isAnswered) {
          // State: Before the user clicks (interactive)
          return `${classes} border-gray-600 dark:border-gray-500 hover:bg-blue-600 hover:text-white`;
      }

      // --- State: Feedback is active (isAnswered = true) ---

      // 1. Correct answer always shows green (Highest priority for teaching the user)
      if (isCorrectOption) {
          return `${classes} bg-green-600 border-green-600 text-white`;
      } 
      
      // 2. Selected answer shows red (This only runs if it wasn't the correct answer)
      if (isSelectedByUser) {
          return `${classes} bg-red-600 border-red-600 text-white`;
      } 
      
      // 3. All other unselected wrong answers are dimmed
      return `${classes} border-gray-600 opacity-50 text-gray-400 dark:text-gray-500 cursor-default`;
  };


  return (
      <div className={`flex flex-col items-center justify-start min-h-screen ${bg} ${text} p-6 w-full transition-colors duration-500 ml-14`}>
          
          {/* Simplified Header */}
          <header className="flex justify-start w-full max-w-lg mb-6">
              <h1 className="text-2xl font-bold">Daily Quiz</h1>
          </header>

          {!finished ? (
              <>
                  {/* Subject Tabs */}
                  <div className="flex gap-3 mb-6 flex-wrap justify-center">
                      {subjects.map((subject) => (
                          <button
                              key={subject}
                              onClick={() => {
                                  if (selectedAnswer) return; // Prevent changing subject mid-feedback
                                  setCurrentSubject(subject);
                                  setCurrentIndex(0);
                              }}
                              disabled={selectedAnswer !== null}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                                  subject === currentSubject 
                                      ? "bg-blue-600 text-white shadow-lg" 
                                      : "bg-gray-700 dark:bg-gray-600 text-gray-300 hover:bg-gray-500"
                              }`}
                          >
                              {subject}
                          </button>
                      ))}
                  </div>

                  {loading || !currentQuestion ? (
                      <div className={`flex flex-col items-center justify-center h-64 ${textSecondary} w-full`}>
                          <Loader2 className="animate-spin mr-2 w-8 h-8 text-blue-500" /> 
                          <span className="text-lg mt-3">Loading today's challenges...</span>
                      </div>
                  ) : (
                  <AnimatePresence mode="wait">
                      {currentQuestion && (
                          <motion.div
                              key={currentQuestion.id}
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -30 }}
                              transition={{ duration: 0.4 }}
                              className={`w-full max-w-lg p-6 rounded-2xl shadow-xl border ${border} ${barBg}`}
                          >
                              <h2 className="text-xl font-semibold mb-6">
                                  {currentQuestion.question}
                              </h2>

                              <div className="grid grid-cols-1 gap-3">
                                  {currentQuestion.options.map((option) => (
                                      <motion.button
                                          whileHover={selectedAnswer === null ? { scale: 1.03 } : {}}
                                          whileTap={selectedAnswer === null ? { scale: 0.97 } : {}}
                                          key={option}
                                          onClick={() => handleAnswer(option)}
                                          disabled={selectedAnswer !== null} // Disabled during feedback
                                          className={getOptionClass(option)}
                                      >
                                          {option}
                                      </motion.button>
                                  ))}
                              </div>

                              <div className="text-sm mt-6 text-center">
                                  <div className="font-semibold">
                                      Question {currentIndex + 1} of {currentQuestions.length} ({currentSubject})
                                  </div>
                                  {selectedAnswer && (
                                      <motion.p 
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          className={`mt-2 font-bold ${
                                              selectedAnswer === currentQuestion.answer ? 'text-green-500' : 'text-red-500'
                                          }`}
                                      >
                                          {selectedAnswer === currentQuestion.answer 
                                              ? "Correct! Moving to next question..." 
                                              : "Wrong Answer. The correct answer is highlighted in green."}
                                      </motion.p>
                                  )}
                              </div>

                          </motion.div>
                      )}
                  </AnimatePresence>)}
              </>
          ) : (
              <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`max-w-md text-center p-8 rounded-2xl shadow-xl border ${border} ${barBg}`}
              >
                  <CheckCircle2 className="text-green-500 mx-auto mb-4" size={48} />
                  <h2 className="text-2xl font-semibold mb-3">Great job!</h2>
                  <p className="text-gray-400 mb-6">
                      {submitting
                          ? <Loader2 className="animate-spin inline mr-2" size={20} />
                          : "You’ve completed today’s quiz! Your profile has been updated."}
                  </p>
                  <button
                      onClick={restartQuiz}
                      disabled={submitting}
                      className="px-5 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium transition-colors"
                  >
                      Review/Retake Quiz
                  </button>
              </motion.div>
          )}
      </div>
  );
};

export default Quizzes;