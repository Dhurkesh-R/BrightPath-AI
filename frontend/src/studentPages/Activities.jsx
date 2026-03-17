import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Book,
  Dumbbell,
  Music,
  Palette,
  Plus,
  PersonStanding,
  ChevronDown,
  ChevronUp,
  Clock,
  Calendar,
  Trash2,
  Edit2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";
import { Input } from "../ui/input.jsx";
import { Label } from "../ui/label.jsx";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog.jsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select.jsx";

import {
  fetchActivities,
  addActivity,
  updateActivity,
  deleteActivity,
} from "../services/api.js";

import { useTheme, getThemeClasses } from "../contexts/ThemeContext.jsx";

export default function Activities() {
  const { theme } = useTheme();
  const {
    bg,
    text,
    cardBg,
    border,
    textSecondary,
    buttonPrimary,
  } = getThemeClasses(theme);

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showStats, setShowStats] = useState(true);

  const [form, setForm] = useState({
    title: "",
    category: "general",
    timeSpent: "",
    description: "",
  });

  /* -------------------- DATA -------------------- */

  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await fetchActivities();
      const normalized = data
        .map((a) => ({
          ...a,
          timeSpent: a.timeSpent ?? a.time_spent ?? 0,
          date: a.date || a.created_at,
        }))
        .sort((a, b) => new Date(b.date) - new Date(a.date));

      setActivities(normalized);
    } catch (err) {
      console.error("Failed to load activities", err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  /* -------------------- STATS -------------------- */

  const stats = useMemo(() => {
    if (!activities.length) {
      return { totalTime: 0, count: 0, longest: null, recent: null };
    }
    const totalTime = activities.reduce((s, a) => s + a.timeSpent, 0);
    const longest = [...activities].sort((a, b) => b.timeSpent - a.timeSpent)[0];
    const recent = activities[0];
    return { totalTime, count: activities.length, longest, recent };
  }, [activities]);

  /* -------------------- ACTIONS -------------------- */

  const openAdd = () => {
    setForm({ title: "", category: "general", timeSpent: "", description: "" });
    setEditMode(false);
    setSelected(null);
    setModalOpen(true);
  };

  const openEdit = (activity) => {
    setSelected(activity);
    setForm({
      title: activity.title,
      category: activity.category,
      timeSpent: String(activity.timeSpent),
      description: activity.description || "",
    });
    setEditMode(true);
    setModalOpen(true);
  };

  const saveActivity = async (e) => {
    e.preventDefault();
    const payload = { ...form, timeSpent: Number(form.timeSpent) };
    try {
      if (editMode && selected) {
        await updateActivity(selected.id, payload);
      } else {
        await addActivity(payload);
      }
      setModalOpen(false);
      loadActivities();
    } catch (err) { console.error("Save failed", err); }
  };

  const removeActivity = async (id) => {
    try {
      await deleteActivity(id);
      loadActivities();
    } catch (err) { console.error("Delete failed", err); }
  };

  const activityIcons = {
    sports: <Dumbbell className="w-5 h-5 text-blue-400" />,
    academics: <Book className="w-5 h-5 text-green-400" />,
    music: <Music className="w-5 h-5 text-purple-400" />,
    art: <Palette className="w-5 h-5 text-pink-400" />,
    general: <Activity className="w-5 h-5 text-yellow-400" />,
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${bg} w-full md:ml-16`}>
        <p className={`${textSecondary} animate-pulse`}>Loading activities…</p>
      </div>
    );
  }

  return (
    /* FIX: Added flex and overflow-hidden to parent. Removed ml-14 */
    <div className={`flex min-h-screen ${bg} ${text} overflow-hidden`}>
      
      {/* 1. Desktop Sidebar Spacer */}
      <div className="hidden md:block w-16 flex-shrink-0" />

      {/* 2. Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 p-6 md:p-10 transition-all duration-300">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            {/* 3. Hamburger Spacer for Mobile */}
            <div className="w-10 h-10 md:hidden flex-shrink-0" />
            <PersonStanding className="w-8 h-8 text-indigo-400" />
            <h1 className="text-2xl md:text-3xl font-extrabold truncate">Activity Log</h1>
          </div>
          <Button className={`${buttonPrimary} w-full sm:w-auto shadow-lg`} onClick={openAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Activity
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <div
            className="flex items-center gap-2 cursor-pointer w-fit hover:opacity-80 transition-opacity"
            onClick={() => setShowStats(!showStats)}
          >
            <h2 className="font-bold text-lg">Quick Stats</h2>
            {showStats ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
          </div>

          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 overflow-hidden"
              >
                <Stat title="Recent" value={stats.recent?.title || "—"} theme={theme}/>
                <Stat title="Longest" value={stats.longest?.title || "—"} theme={theme}/>
                <Stat title="Count" value={stats.count} theme={theme}/>
                <Stat title="Total Time" value={`${stats.totalTime} mins`} theme={theme}/>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Grid */}
        <div className="flex-1">
          {activities.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-20 opacity-40">
                <Activity size={48} />
                <p className="mt-4">No activities yet. Start logging.</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
              {activities.map((a) => (
                <Card key={a.id} className={`${cardBg} ${border} relative group hover:shadow-md transition-all`} theme={theme}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-bold truncate pr-8">{a.title}</CardTitle>
                    <div className="flex-shrink-0">
                        {activityIcons[a.category]}
                    </div>
                  </CardHeader>

                  <CardContent theme={theme}>
                    <p className={`${textSecondary} text-sm mb-4 line-clamp-2 min-h-[40px]`}>
                      {a.description || "No description provided."}
                    </p>

                    <div className="flex justify-between text-xs font-medium opacity-70">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" /> {a.timeSpent}m
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        {new Date(a.date).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>

                  {/* Actions - Visible on hover (Desktop) or always (Mobile) */}
                  <div className="absolute top-3 right-3 flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEdit(a)} className="p-1 hover:bg-white/10 rounded">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeActivity(a.id)} className="p-1 hover:bg-red-500/10 rounded">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal - Keeping your Dialog structure */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen} theme={theme}>
        <DialogContent className={`${cardBg} ${border} sm:max-w-[425px]`} theme={theme}>
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Activity" : "Add Activity"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={saveActivity} className="space-y-4 mt-4">
            <div className="space-y-2">
                <Label>Activity Title</Label>
                <Input
                  placeholder="e.g., Morning Jog"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  theme={theme}
                />
            </div>

            <div className="space-y-2">
                <Label>Category</Label>
                <Select 
                  value={form.category || ""} 
                  onValueChange={(v) => setForm(prev => ({ ...prev, category: v }))}
                >
                  <SelectTrigger theme={theme} className="w-full">
                    <SelectValue placeholder="Choose Category" />
                  </SelectTrigger>
                  <SelectContent theme={theme}>
                    <SelectItem value="sports" theme={theme}>Sports</SelectItem>
                    <SelectItem value="academics" theme={theme}>Academics</SelectItem>
                    <SelectItem value="music" theme={theme}>Music</SelectItem>
                    <SelectItem value="art" theme={theme}>Art</SelectItem>
                    <SelectItem value="general" theme={theme}>General</SelectItem>
                  </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Duration (Minutes)</Label>
                <Input
                  type="number"
                  placeholder="45"
                  value={form.timeSpent}
                  onChange={(e) => setForm({ ...form, timeSpent: e.target.value })}
                  required
                  theme={theme}
                />
            </div>

            <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="What did you achieve?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  theme={theme}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className={buttonPrimary}>
                {editMode ? "Update" : "Save Activity"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Stat({ title, value, theme }) {
  return (
    <Card className="p-4 shadow-sm" theme={theme}>
      <p className="text-[10px] uppercase opacity-50 font-bold tracking-wider">{title}</p>
      <p className="text-base md:text-lg font-bold truncate mt-1 text-indigo-400">{value}</p>
    </Card>
  );
}
