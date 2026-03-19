import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  ClipboardList,
  Plus,
  Calendar,
  Users,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  User,
  X,
  CheckCircle,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

import {
  fetchAssignments,
  addAssignment,
  updateAssignment,
  deleteAssignment,
  fetchStudents,
  loadStatus,
  updateStatus
} from "../services/api";

import { useTheme, getThemeClasses } from "../contexts/ThemeContext.jsx";

export default function TeacherAssignments() {
  const user = JSON.parse(localStorage.getItem("user"));
  const userRole = user?.role;
  
  const { theme } = useTheme();
  const {
    bg,
    text,
    cardBg,
    border,
    textSecondary,
    buttonPrimary,
    barBg
  } = getThemeClasses(theme);

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panelLoading, setPanelLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [studentsOpen, setStudentsOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [students, setStudents] = useState([]);
  const [statusMap, setStatusMap] = useState({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    grade: "",
    section: "",
    due_date: "",
  });

  /* -------------------- DATA LOADING -------------------- */

  const loadAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAssignments();
      const sorted = data.sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
      setAssignments(sorted);
    } catch (err) {
      console.error("Failed to load assignments", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  /* -------------------- ANALYTICS -------------------- */

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: assignments.length,
      upcoming: assignments.filter(a => new Date(a.due_date) >= now).length,
      grades: [...new Set(assignments.map(a => a.grade))].length,
    };
  }, [assignments]);

  /* -------------------- STUDENT PANEL LOGIC -------------------- */

  const openStudentsPanel = async (assignment) => {
    setSelectedAssignment(assignment);
    setStudentsOpen(true);
    setPanelLoading(true);
    
    try {
      const studentList = await fetchStudents({
        grade: assignment.grade,
        section: assignment.section,
      });
      setStudents(studentList);
      
      const statusPromises = studentList.map(s => 
        loadStatus(assignment.id, s.id).then(res => ({ id: s.id, status: res.status }))
      );
      
      const results = await Promise.all(statusPromises);
      const statusObj = {};
      results.forEach(item => { statusObj[item.id] = item.status; });
      setStatusMap(statusObj);
    } catch (err) {
      console.error("Failed to load student statuses", err);
    } finally {
      setPanelLoading(false);
    }
  };

  /* -------------------- CRUD ACTIONS -------------------- */

  const handleOpenAdd = () => {
    setForm({ title: "", description: "", grade: "", section: "", due_date: "" });
    setEditMode(false);
    setModalOpen(true);
  };

  const handleOpenEdit = (e, assignment) => {
    e.stopPropagation(); // Prevent opening student panel
    setSelected(assignment);
    setForm({
      title: assignment.title,
      description: assignment.description || "",
      grade: assignment.grade,
      section: assignment.section,
      due_date: assignment.due_date?.slice(0, 10),
    });
    setEditMode(true);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editMode && selected) {
        await updateAssignment(selected.id, form);
      } else {
        await addAssignment(form);
      }
      setModalOpen(false);
      loadAssignments();
    } catch (err) {
      alert("Error saving assignment. Please check your inputs.");
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this assignment?")) return;
    try {
      await deleteAssignment(id);
      loadAssignments();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center h-screen ${bg} w-full gap-4`}>
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className={`${textSecondary} font-medium`}>Fetching assignments...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${text} overflow-x-hidden flex`}>
      {/* Desktop Sidebar Spacer */}
      <div className="hidden md:block w-16 flex-shrink-0" />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Consistent with Daily Quiz/Goals */}
        <header className={`flex items-center justify-between w-full border-b p-4 md:px-8 h-[73px] flex-shrink-0 ${border} ${barBg}`}>
            <div className="flex items-center gap-3 truncate">
                <div className="w-10 h-10 md:hidden flex-shrink-0" />
                <ClipboardList className="w-6 h-6 text-indigo-500" />
                <h1 className="text-xl md:text-2xl font-bold truncate">Assignments</h1>
            </div>
            {userRole === "teacher" && (
                <Button size="sm" className={`${buttonPrimary} shadow-lg shadow-indigo-500/20`} onClick={handleOpenAdd}>
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">New Assignment</span>
                </Button>
            )}
        </header>

        <main className="p-4 md:p-8 max-w-7xl w-full mx-auto">
          {/* Stats Section */}
          <section className="mb-10">
            <button 
              onClick={() => setShowStats(!showStats)}
              className="flex items-center gap-2 mb-4 hover:opacity-80 transition-opacity"
            >
              <h2 className="font-bold text-lg tracking-tight">Overview</h2>
              {showStats ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>

            <AnimatePresence>
              {showStats && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 overflow-hidden"
                >
                  <StatCard title="Total Assigned" value={stats.total} icon={<ClipboardList className="text-indigo-500"/>} theme={theme} />
                  <StatCard title="Upcoming Deadlines" value={stats.upcoming} icon={<Clock className="text-amber-500"/>} theme={theme} />
                  <StatCard title="Active Classes" value={stats.grades} icon={<Users className="text-emerald-500"/>} theme={theme} />
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Grid Section */}
          {assignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center mt-20 opacity-40">
                <ClipboardList size={64} className="mb-4" />
                <p className="text-lg font-medium">No assignments found</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {assignments.map((a) => (
                <motion.div key={a.id} layout>
                  <Card 
                    className={`${cardBg} ${border} relative group cursor-pointer hover:border-indigo-500/50 transition-all duration-300 rounded-2xl overflow-hidden`}
                    onClick={() => openStudentsPanel(a)}
                    theme={theme}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500 bg-indigo-500/10 px-2 py-1 rounded-md mb-2">
                            Grade {a.grade}-{a.section}
                        </span>
                      </div>
                      <CardTitle className="text-lg line-clamp-1">{a.title}</CardTitle>
                    </CardHeader>

                    <CardContent theme={theme}>
                      <p className={`${textSecondary} text-sm mb-6 line-clamp-2 h-10`}>
                        {a.description || "No additional instructions provided."}
                      </p>

                      <div className="flex items-center justify-between text-xs font-medium">
                        <div className="flex items-center gap-1.5 opacity-70">
                          <Calendar size={14} />
                          {new Date(a.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center gap-1 text-indigo-500">
                           View Students <ChevronDown size={14} className="-rotate-90" />
                        </div>
                      </div>

                      {userRole === "teacher" && (
                        <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                            onClick={(e) => handleOpenEdit(e, a)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-red-500 transition-colors"
                            onClick={(e) => handleDelete(e, a.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Assignment Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen} theme={theme}>
        <DialogContent className={`${cardBg} ${border} rounded-3xl max-w-md`} theme={theme}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editMode ? "Edit Assignment" : "New Assignment"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 mt-4">
            <div className="space-y-1">
                <label className="text-xs font-semibold ml-1 opacity-60">Assignment Title</label>
                <Input placeholder="e.g. Physics Lab Report" value={form.title} required theme={theme}
                    onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="text-xs font-semibold ml-1 opacity-60">Grade</label>
                    <Input placeholder="8" value={form.grade} required theme={theme}
                        onChange={(e) => setForm({ ...form, grade: e.target.value })} />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-semibold ml-1 opacity-60">Section</label>
                    <Input placeholder="A" value={form.section} required theme={theme}
                        onChange={(e) => setForm({ ...form, section: e.target.value })} />
                </div>
            </div>

            <div className="space-y-1">
                <label className="text-xs font-semibold ml-1 opacity-60">Due Date</label>
                <Input type="date" value={form.due_date} required theme={theme}
                    onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            </div>

            <div className="space-y-1">
                <label className="text-xs font-semibold ml-1 opacity-60">Instructions (Optional)</label>
                <Input placeholder="Provide details..." value={form.description} theme={theme}
                    onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" className={`${buttonPrimary} px-8`}>
                {editMode ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Right Student Side Panel */}
      <AnimatePresence>
        {studentsOpen && (
          <>
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setStudentsOpen(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className={`fixed top-0 right-0 h-full w-full sm:w-[450px] z-50 ${cardBg} border-l ${border} shadow-2xl flex flex-col`}
            >
                <div className="p-6 border-b flex items-center justify-between bg-white/5 backdrop-blur-md">
                <div>
                    <h2 className="font-bold text-xl line-clamp-1">
                        {selectedAssignment?.title}
                    </h2>
                    <p className="text-xs opacity-50 uppercase tracking-widest font-bold">Student Progress</p>
                </div>
                <button onClick={() => setStudentsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full">
                    <X size={20} />
                </button>
                </div>
        
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {panelLoading ? (
                    <div className="space-y-4">
                        {[1,2,3,4].map(i => (
                            <div key={i} className="h-16 w-full animate-pulse bg-gray-100 dark:bg-gray-800 rounded-2xl" />
                        ))}
                    </div>
                ) : (
                    students.map((s) => (
                    <div key={s.id} className={`flex items-center justify-between p-4 rounded-2xl border ${border} hover:shadow-md transition-shadow`}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                <User size={20} />
                            </div>
                            <span className="font-bold text-sm">{s.name}</span>
                        </div>
            
                        <select
                            value={statusMap[s.id] || "not_completed"}
                            onChange={async (e) => {
                                const val = e.target.value;
                                setStatusMap(prev => ({ ...prev, [s.id]: val }));
                                await updateStatus(selectedAssignment.id, s.id, val);
                            }}
                            className={`bg-transparent text-xs font-bold border-none focus:ring-0 cursor-pointer ${
                                statusMap[s.id] === 'completed' ? 'text-green-500' : 'text-amber-500'
                            }`}
                        >
                            <option value="not_completed">Pending</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                    ))
                )}
        
                {students.length === 0 && !panelLoading && (
                    <div className="text-center py-20 opacity-40">
                    <Users size={48} className="mx-auto mb-4" />
                    <p className="font-medium">No students enrolled in this class.</p>
                    </div>
                )}
                </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------- REUSABLE SUB-COMPONENTS -------------------- */

function StatCard({ title, value, icon, theme }) {
  return (
    <Card className="p-5 flex items-center gap-4 rounded-2xl border-none shadow-sm bg-white/5" theme={theme}>
      <div className="p-3 bg-white/10 rounded-xl">
        {icon}
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">{title}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </Card>
  );
}
