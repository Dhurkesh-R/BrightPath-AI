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
  const { theme, _, t } = useTheme();
  const {
    bg,
    text,
    cardBg,
    border,
    inputBg,
    inputBorder,
    textSecondary,
    buttonPrimary,
    buttonDestructive,
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
    const payload = {
      ...form,
      timeSpent: Number(form.timeSpent),
    };

    try {
      if (editMode && selected) {
        await updateActivity(selected.id, payload);
      } else {
        await addActivity(payload);
      }
      setModalOpen(false);
      loadActivities();
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const removeActivity = async (id) => {
    try {
      await deleteActivity(id);
      loadActivities();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  /* -------------------- ICONS -------------------- */

  const activityIcons = {
    sports: <Dumbbell className="w-5 h-5 text-blue-400" />,
    academics: <Book className="w-5 h-5 text-green-400" />,
    music: <Music className="w-5 h-5 text-purple-400" />,
    art: <Palette className="w-5 h-5 text-pink-400" />,
    general: <Activity className="w-5 h-5 text-yellow-400" />,
  };

  /* -------------------- RENDER -------------------- */

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${bg} w-full`}>
        <p className={`${textSecondary} animate-pulse`}>Loading activities…</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${text} p-6 w-full ml-14`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <PersonStanding className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-extrabold">Activity Log</h1>
        </div>
        <Button className={buttonPrimary} onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setShowStats(!showStats)}
        >
          <h2 className="font-bold text-lg">Quick Stats</h2>
          {showStats ? <ChevronUp /> : <ChevronDown />}
        </div>

        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4"
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
      {activities.length === 0 ? (
        <p className={`${textSecondary} text-center mt-20`}>
          No activities yet. Start logging.
        </p>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((a) => (
            <Card key={a.id} className={`${cardBg} ${border} relative group`} theme={theme}>
              <CardHeader className="flex">
                <CardTitle>{a.title}</CardTitle>
                <div className="ml-2 mt-1">
                    {activityIcons[a.category]}
                </div>
              </CardHeader>

              <CardContent theme={theme}>
                <p className={`${textSecondary} text-sm mb-4`}>
                  {a.description || "No description"}
                </p>

                <div className="flex justify-between text-xs">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {a.timeSpent}m
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(a.date).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>

              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => openEdit(a)}>
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => removeActivity(a.id)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen} theme={theme}>
        <DialogContent className={`${cardBg} ${border}`} theme={theme}>
          <DialogHeader>
            <DialogTitle>
              {editMode ? "Edit Activity" : "Add Activity"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={saveActivity} className="space-y-4">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              theme={theme}
            />

            <Select 
              value={form.category || ""} // Ensures value is never undefined
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

            <Input
              type="number"
              placeholder="Time spent (minutes)"
              value={form.timeSpent}
              onChange={(e) => setForm({ ...form, timeSpent: e.target.value })}
              required
              theme={theme}
            />

            <Input
              placeholder="Description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              theme={theme}
            />

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className={buttonPrimary}>
                Save
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------------------- STATS CARD -------------------- */

function Stat({ title, value, theme }) {
  return (
    <Card className="p-4" theme={theme}>
      <p className="text-xs uppercase opacity-60">{title}</p>
      <p className="text-lg font-bold truncate">{value}</p>
    </Card>
  );
}
