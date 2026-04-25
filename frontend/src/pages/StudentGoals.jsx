import React, { useState, useEffect } from "react";
import { getStudentGoals } from "../services/api";
import { Plus, Edit2, Trash2, X, Loader2 } from "lucide-react";
import { useTheme, getThemeClasses } from "../contexts/ThemeContext";
import { useParams } from "react-router-dom";

export default function Goals() {
  const { userId } = useParams();
  const { theme } = useTheme();
  const classes = getThemeClasses(theme);

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    deadline: "",
    progress: 0,
    status: "in-progress",
  });

  useEffect(() => {
    let mounted = true;
    const fetchGoals = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getStudentGoals(userId);
        if (!mounted) return;
        setGoals(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch goals", err);
        setError("Failed to load goals");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchGoals();
    return () => { mounted = false; };
  }, []);

  return (
    /* FIX: Added flex parent, overflow-hidden, and removed ml-14 */
    <div className={`flex min-h-screen ${classes.bg} ${classes.text} overflow-hidden`}>
      
      {/* 1. Desktop Sidebar Spacer */}
      <div className="hidden md:block w-16 flex-shrink-0" />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        
        {/* Header - Added Mobile Suitability */}
        <div className={`flex items-center justify-between mb-6 border-b p-4 md:px-8 h-[73px] flex-shrink-0 ${classes.border}`}>
          <div className="flex items-center gap-3">
            {/* 3. Hamburger Spacer for Mobile */}
            <div className="w-10 h-10 md:hidden flex-shrink-0" />
            <h2 className="text-xl md:text-2xl font-semibold truncate">🎯 Goals</h2>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pb-10">
          {loading ? (
            <div className={`flex items-center justify-center h-[60vh] ${classes.textSecondary}`}>
              <Loader2 className="animate-spin mr-2 w-6 h-6 text-blue-500" /> 
              <span className="text-lg">Loading Goals data...</span>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-[50vh]">
              <p className={`${classes.textSecondary}`}>{error}</p>
            </div>
          ) : goals.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[50vh] opacity-50">
              <p className="text-4xl mb-4">🏜️</p>
              <p className={`${classes.textSecondary}`}>No goals yet. Add your first goal!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4 md:px-8 mt-4">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`${classes.cardBg} p-5 rounded-2xl border ${classes.border} shadow-sm hover:shadow-md transition-all relative group`}
                >
                  <div className="flex items-start">
                    <h3 className={`text-lg font-semibold pr-16 truncate ${classes.text}`}>{goal.title}</h3>
                  </div>

                  <p className={`${classes.textSecondary} text-sm mt-2 line-clamp-2 h-10`}>{goal.description}</p>

                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    {goal.deadline && (
                      <p className={`text-[11px] font-medium px-2 py-1 rounded bg-black/10 ${classes.textSecondary}`}>
                        ⏰ {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                    )}
                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        goal.status === "completed"
                          ? "bg-green-600/20 text-green-400"
                          : "bg-yellow-600/20 text-yellow-400"
                      }`}
                    >
                      {goal.status}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-[10px] mb-1 opacity-70">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                    </div>
                    <div className={`w-full ${classes.barBg} rounded-full h-1.5`}>
                        <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${
                            goal.progress >= 100 ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-indigo-500"
                        }`}
                        style={{ width: `${goal.progress}%` }}
                        />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
