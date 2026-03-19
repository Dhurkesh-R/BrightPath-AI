import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Loader2, Puzzle } from "lucide-react";
import { useTheme, getThemeClasses } from "../contexts/ThemeContext";
import { sendQuizResults, getDailyQuiz } from "../services/api";

const Quizzes = () => {
  const { theme } = useTheme();
  const { bg, text, border, barBg, textSecondary } = getThemeClasses(theme);

  const [quizzes, setQuizzes] = useState({});
  const [currentSubject, setCurrentSubject] = useState("English");
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [answers, setAnswers] = useState({});
  const [finished, setFinished] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    async function loadQuiz() {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500)); 
        const data = await getDailyQuiz(); 
        setQuizzes(data);
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
    if (selectedAnswer || !currentQuestion) return;

    setSelectedAnswer(option);
    const isCorrect = option === currentQuestion.answer;
    const answeredQuestionData = {
      ...currentQuestion,
      selected: option,
      isCorrect: isCorrect,
    };

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answeredQuestionData,
    }));

    setTimeout(async () => {
      setSelectedAnswer(null);

      if (currentIndex < currentQuestions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
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
    if (subjects.length > 0) setCurrentSubject(subjects[0]);
    setCurrentIndex(0);
    setFinished(false);
  };

  const getOptionClass = (option) => {
    const isAnswered = selectedAnswer !== null;
    if (!currentQuestion) return "";
    const isCorrectOption = option === currentQuestion.answer; 
    const isSelectedByUser = option === selectedAnswer;

    let classes = "px-4 py-3 text-left rounded-xl transition-all duration-200 shadow-sm border text-sm md:text-base ";

    if (!isAnswered) {
      return `${classes} border-gray-200 dark:border-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600`;
    }

    if (isCorrectOption) {
      return `${classes} bg-green-600 border-green-600 text-white`;
    } 
    
    if (isSelectedByUser) {
      return `${classes} bg-red-600 border-red-600 text-white`;
    } 
    
    return `${classes} border-gray-200 dark:border-gray-800 opacity-40 text-gray-400 cursor-default`;
  };

  return (
    /* FIX: Added flex container and removed ml-14 */
    <div className={`flex min-h-screen ${bg} ${text} overflow-hidden`}>
      
      {/* 1. Desktop Sidebar Spacer */}
      <div className="hidden md:block w-16 flex-shrink-0" />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col items-center min-w-0 transition-all duration-300">
        
        {/* Header - Fixed Height & Mobile Spacer */}
        <header className={`flex items-center justify-start w-full border-b p-4 md:px-8 h-[73px] flex-shrink-0 ${border}`}>
            {/* 3. Hamburger Spacer for Mobile */}
            <div className="w-10 h-10 md:hidden flex-shrink-0" />
            <h1 className="text-xl md:text-2xl font-bold truncate">Daily Quiz</h1>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 w-full overflow-y-auto p-4 md:p-8 flex flex-col items-center">
          {!finished ? (
            <div className="w-full max-w-2xl">
              {/* Subject Tabs - Better Mobile Scrolling */}
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar justify-start md:justify-center">
                {subjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => {
                      if (selectedAnswer) return;
                      setCurrentSubject(subject);
                      setCurrentIndex(0);
                    }}
                    disabled={selectedAnswer !== null}
                    className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold whitespace-nowrap transition-all ${
                      subject === currentSubject 
                        ? "bg-blue-600 text-white shadow-md scale-105" 
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>

              {loading || !currentQuestion ? (
                <div className={`flex flex-col items-center justify-center h-64 ${textSecondary}`}>
                  <Loader2 className="animate-spin w-10 h-10 text-blue-500" /> 
                  <span className="text-lg mt-4 font-medium">Preparing your challenges...</span>
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`w-full p-6 md:p-8 rounded-3xl shadow-xl border ${border} ${barBg}`}
                  >
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 bg-blue-500/10 px-3 py-1 rounded-full">
                            {currentSubject}
                        </span>
                        <span className="text-xs font-medium opacity-60">
                            {currentIndex + 1} / {currentQuestions.length}
                        </span>
                    </div>

                    <h2 className="text-lg md:text-xl font-bold mb-8 leading-tight">
                      {currentQuestion.question}
                    </h2>

                    <div className="grid grid-cols-1 gap-3">
                      {currentQuestion.options.map((option) => (
                        <motion.button
                          whileHover={selectedAnswer === null ? { x: 5 } : {}}
                          whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                          key={option}
                          onClick={() => handleAnswer(option)}
                          disabled={selectedAnswer !== null}
                          className={getOptionClass(option)}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>

                    {selectedAnswer && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`mt-8 p-4 rounded-2xl text-center text-sm font-bold border ${
                          selectedAnswer === currentQuestion.answer 
                            ? 'bg-green-500/10 border-green-500/20 text-green-500' 
                            : 'bg-red-500/10 border-red-500/20 text-red-500'
                        }`}
                      >
                        {selectedAnswer === currentQuestion.answer 
                          ? "✨ Excellent! That's correct." 
                          : "💡 Keep learning! The correct answer is highlighted."}
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          ) : (
            /* Results State */
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`w-full max-w-md text-center p-10 rounded-3xl shadow-2xl border ${border} ${barBg} mt-10`}
            >
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="text-green-500" size={40} />
              </div>
              <h2 className="text-2xl font-black mb-2">Quiz Complete!</h2>
              <p className={`${textSecondary} mb-8 text-sm`}>
                {submitting
                  ? "Saving your progress..."
                  : "Fantastic work! Your daily streak continues and your profile has been updated."}
              </p>
              
              <button
                onClick={restartQuiz}
                disabled={submitting}
                className="w-full px-6 py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl text-white font-bold transition-all shadow-lg hover:shadow-blue-500/25 active:scale-95 flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={20} /> : "Review & Retake"}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quizzes;
