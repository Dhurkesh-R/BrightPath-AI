import React, { useState, useEffect } from "react";
import { getGoals, createGoal, updateGoal, deleteGoal } from "../services/api";
import { Plus, Edit2, Trash2, X, Loader2 } from "lucide-react";
import { useTheme, getThemeClasses } from "../contexts/ThemeContext";

export default function Goals({ userId }) {
  const { theme, _, t } = useTheme();
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
        // Ensure array
        setGoals(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch goals", err);
        setError("Failed to load goals");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchGoals();
    return () => {
      mounted = false;
    };
  }, []);

  // Open modal for create or edit
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

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditGoal(null);
    setSaving(false);
    setError(null);
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save goal (create or update)
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editGoal) {
        const updated = await updateGoal(editGoal.id, formData);
        // API should return the updated goal object
        setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      } else {
        const newGoal = await createGoal({ ...formData, user_id: userId });
        // API should return the created goal object
        setGoals((prev) => [...prev, newGoal]);
      }
      closeModal();
    } catch (err) {
      console.error("Failed to save goal", err);
      setError(err.message || "Failed to save");
      setSaving(false);
    }
  };

  // Delete goal
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
    <div className={`${classes.text} w-full ml-14`}>
      <div className={`flex items-center justify-between mb-6 border-b p-4 ${classes.border}`}>
        <h2 className={`text-2xl font-semibold ${classes.text}`}>🎯 Goals</h2>
        <button
          onClick={() => openModal()}
          className={`flex items-center gap-2 px-4 py-2 ${classes.buttonPrimaryBg} ${classes.buttonPrimaryHoverBg} ${classes.textOnPrimary} rounded-xl shadow transition-all`}
        >
          <Plus size={18} /> Add Goal
        </button>
      </div>

      {loading ? (
        <div className={`flex items-center justify-center h-screen ${classes.bg} ${classes.textSecondary} w-full`}>
          <Loader2 className="animate-spin mr-2 w-6 h-6 text-blue-500" /> 
          <span className="text-lg">Loading Goals data...</span>
      </div>
      ) : error ? (
        <div className="col-span-full flex justify-center items-center h-[50vh]">
          <p className={`${classes.textSecondary}`}>{error}</p>
        </div>
      ) : goals.length === 0 ? (
        <div className="col-span-full flex justify-center items-center h-[50vh]">
          <p className={`${classes.textSecondary}`}>No goals yet. Add your first goal!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 px-6">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className={`${classes.cardBg} p-5 rounded-2xl shadow hover:shadow-lg transition-all`}
            >
              <div className="flex justify-between items-start">
                <h3 className={`text-lg font-semibold ${classes.text}`}>{goal.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(goal)}
                    className={`p-1 rounded ${classes.hoverBg} ${classes.buttonSecondaryBg}`}
                    title="Edit"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(goal.id)}
                    className={`p-1 rounded ${classes.hoverBg} text-red-400`}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <p className={`${classes.textSecondary} text-sm mt-2`}>{goal.description}</p>

              {goal.deadline && (
                <p className={`text-xs ${classes.textSecondary} mt-1`}>
                  ⏰ Deadline: {new Date(goal.deadline).toLocaleDateString()}
                </p>
              )}

              <div className={`mt-3 w-full ${classes.barBg} rounded-full h-2`}>
                <div
                  className={`h-2 rounded-full transition-all ${
                    goal.progress >= 100 ? "bg-green-500" : "bg-indigo-500"
                  }`}
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>

              <div className="mt-2 text-sm">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    goal.status === "completed"
                      ? "bg-green-600/30 text-green-400"
                      : "bg-yellow-600/30 text-yellow-400"
                  }`}
                >
                  {goal.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className={`${classes.cardBg} p-6 rounded-2xl w-full max-w-md relative`}>
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
            >
              <X size={20} />
            </button>

            <h3 className={`text-xl font-semibold mb-4 ${classes.text}`}>
              {editGoal ? "Edit Goal" : "Add Goal"}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className={`block text-sm mb-1 ${classes.text}`}>Title</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 ${classes.inputBg} ${classes.border} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm mb-1 ${classes.text}`}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className={`w-full px-3 py-2 ${classes.inputBg} ${classes.border} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`}
                />
              </div>

              <div>
                <label className={`block text-sm mb-1 ${classes.text}`}>Deadline</label>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 ${classes.inputBg} ${classes.border} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`}
                />
              </div>

              <div>
                <label className={`block text-sm mb-1 ${classes.text}`}>Progress (%)</label>
                <input
                  type="number"
                  name="progress"
                  value={formData.progress}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  className={`w-full px-3 py-2 ${classes.inputBg} ${classes.border} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`}
                />
              </div>

              <div>
                <label className={`block text-sm mb-1 ${classes.text}`}>Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 ${classes.inputBg} ${classes.border} rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none`}
                >
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={saving}
                className={`w-full mt-4 ${classes.buttonPrimaryBg} ${classes.buttonPrimaryHoverBg} ${classes.textOnPrimary} py-2 rounded-lg font-medium ${saving ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {saving ? (editGoal ? "Updating..." : "Adding...") : editGoal ? "Update Goal" : "Add Goal"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
