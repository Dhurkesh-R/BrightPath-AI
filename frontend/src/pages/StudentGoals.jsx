import React, { useState, useEffect } from "react";
import { getGoals, createGoal, updateGoal, deleteGoal } from "../services/api";
import { Plus, Edit2, Trash2, X, Loader2 } from "lucide-react";
import { useTheme, getThemeClasses } from "../contexts/ThemeContext";

export default function Goals({ userId }) {
  const { theme } = useTheme();
  const classes = getThemeClasses(theme);

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState(null);
  const [saving, setSaving] = useState(false);
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
        const data = await getGoals();
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

  const openModal = (goal = null) => {
    setEditGoal(goal);
    if (goal) {
      setFormData({
        title: goal.title || "",
        description: goal.description || "",
        deadline: goal.deadline ? goal.deadline.split("T")[0] : "",
        progress: goal.progress ?? 0,
        status: goal.status || "in-progress",
      });
    } else {
      setFormData({
        title: "",
        description: "",
        deadline: "",
        progress: 0,
        status: "in-progress",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditGoal(null);
    setSaving(false);
    setError(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editGoal) {
        const updated = await updateGoal(editGoal.id, formData);
        setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      } else {
        const newGoal = await createGoal({ ...formData, user_id: userId });
        setGoals((prev) => [...prev, newGoal]);
      }
      closeModal();
    } catch (err) {
      console.error("Failed to save goal", err);
      setError(err.message || "Failed to save");
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this goal?")) return;
    try {
      await deleteGoal(id);
      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error("Failed to delete goal", err);
      setError("Failed to delete goal");
    }
  };

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
          <button
            onClick={() => openModal()}
            className={`flex items-center gap-2 px-3 md:px-4 py-2 ${classes.buttonPrimaryBg} ${classes.buttonPrimaryHoverBg} ${classes.textOnPrimary} rounded-xl shadow transition-all text-sm md:text-base`}
          >
            <Plus size={18} /> <span className="hidden sm:inline">Add Goal</span>
          </button>
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
                  <div className="flex justify-between items-start">
                    <h3 className={`text-lg font-semibold pr-16 truncate ${classes.text}`}>{goal.title}</h3>
                    <div className="flex gap-2 absolute top-5 right-5 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openModal(goal)}
                        className={`p-1.5 rounded-lg ${classes.hoverBg} ${classes.buttonSecondaryBg} border ${classes.border}`}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className={`p-1.5 rounded-lg ${classes.hoverBg} text-red-400 border ${classes.border}`}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200">
          <div className={`${classes.cardBg} p-6 rounded-2xl w-full max-w-md relative shadow-2xl border ${classes.border}`}>
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>

            <h3 className={`text-xl font-bold mb-6 ${classes.text}`}>
              {editGoal ? "Edit Goal" : "Add New Goal"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 opacity-60 ${classes.text}`}>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="What's your goal?"
                  className={`w-full px-3 py-2.5 ${classes.inputBg} border ${classes.border} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                  required
                />
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 opacity-60 ${classes.text}`}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Add some details..."
                  className={`w-full px-3 py-2.5 ${classes.inputBg} border ${classes.border} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1 opacity-60 ${classes.text}`}>Deadline</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className={`w-full px-3 py-2.5 ${classes.inputBg} border ${classes.border} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                  />
                </div>
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1 opacity-60 ${classes.text}`}>Progress (%)</label>
                  <input
                    type="number"
                    name="progress"
                    value={formData.progress}
                    onChange={handleChange}
                    min="0"
                    max="100"
                    className={`w-full px-3 py-2.5 ${classes.inputBg} border ${classes.border} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-1 opacity-60 ${classes.text}`}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full px-3 py-2.5 ${classes.inputBg} border ${classes.border} rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none`}
                >
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className={`w-full mt-6 ${classes.buttonPrimaryBg} ${classes.buttonPrimaryHoverBg} ${classes.textOnPrimary} py-3 rounded-xl font-bold shadow-lg transition-all ${saving ? "opacity-60 cursor-not-allowed" : "hover:scale-[1.02] active:scale-95"}`}
              >
                {saving ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    <span>{editGoal ? "Updating..." : "Adding..."}</span>
                  </div>
                ) : editGoal ? "Update Goal" : "Create Goal"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
