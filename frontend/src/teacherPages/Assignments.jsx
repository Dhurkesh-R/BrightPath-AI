import React, { useEffect, useMemo, useState } from "react";
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
  const userRole = JSON.parse(localStorage.getItem("user"))?.role
  const { theme } = useTheme();
  const {
    bg,
    text,
    cardBg,
    border,
    textSecondary,
    buttonPrimary,
  } = getThemeClasses(theme);

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loading1, setLoading1] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState(null);
  const [showStats, setShowStats] = useState(true);
  const [studentStatus, setStudentStatus] = useState("not_completed");
  const [selectedStudent, setSelectedStudent] = useState(null);
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

  /* -------------------- DATA -------------------- */

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const data = await fetchAssignments();
      const sorted = data.sort(
        (a, b) => new Date(a.due_date) - new Date(b.due_date)
      );
      setAssignments(sorted);
    } catch (err) {
      console.error("Failed to load assignments", err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  /* -------------------- STATS -------------------- */

  const stats = useMemo(() => {
    if (!assignments.length) {
      return { total: 0, upcoming: 0, grades: 0 };
    }

    const upcoming = assignments.filter(
      (a) => new Date(a.due_date) >= new Date()
    ).length;

    const grades = new Set(assignments.map((a) => a.grade)).size;

    return {
      total: assignments.length,
      upcoming,
      grades,
    };
  }, [assignments]);

const openStudentsPanel = async (assignment) => {
  setSelectedAssignment(assignment);
  setStudentsOpen(true);
  setLoading1(true)
  
  try {
    const studentList = await fetchStudents({
          grade: assignment.grade,
          section: assignment.section,
    });
    setStudents(studentList);
    
    // Fetch all statuses in parallel (much faster!)
    const statusPromises = studentList.map(s => 
      loadStatus(assignment.id, s.id).then(res => ({ id: s.id, status: res.status }))
    );
    
    const results = await Promise.all(statusPromises);
    
    // Convert array of results back into a mapping object
    const statusObj = {};
    results.forEach(item => {
      statusObj[item.id] = item.status;
    });
    
    setStatusMap(statusObj);
  } catch (err) {
    console.error("Failed to load student statuses", err);
  } finally {
    setLoading1(false)
  }
};


  /* -------------------- ACTIONS -------------------- */

  const openAdd = () => {
    setForm({
      title: "",
      description: "",
      grade: "",
      section: "",
      due_date: "",
    });
    setEditMode(false);
    setSelected(null);
    setModalOpen(true);
  };

  const openEdit = (assignment) => {
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

  const saveAssignment = async (e) => {
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
      console.error("Assignment save failed", err);
    }
  };

  const removeAssignment = async (id) => {
    try {
      await deleteAssignment(id);
      loadAssignments();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  /* -------------------- RENDER -------------------- */

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${bg} w-full`}>
        <p className={`${textSecondary} animate-pulse`}>
          Loading assignments…
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${text} p-6 w-full ml-14`}>
      {/* Header */}
      {userRole === "teacher" && (
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-extrabold">Assignments</h1>
          </div>
          <Button className={buttonPrimary} onClick={openAdd}>
            <Plus className="w-4 h-4 mr-2" />
            New Assignment
          </Button>
        </div>
      )}
      {userRole === "student" && (
        <div className="flex mb-6">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-indigo-400" />
            <h1 className="text-3xl font-extrabold">Assignments</h1>
          </div>
      </div>
      )}

      {/* Stats */}
      <div className="mb-8">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setShowStats(!showStats)}
        >
          <h2 className="font-bold text-lg">Overview</h2>
          {showStats ? <ChevronUp /> : <ChevronDown />}
        </div>

        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4"
            >
              <Stat title="Total" value={stats.total} theme={theme}/>
              <Stat title="Upcoming" value={stats.upcoming} theme={theme}/>
              <Stat title="Grades" value={stats.grades} theme={theme}/>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Grid */}
      {assignments.length === 0 ? (
        <p className={`${textSecondary} text-center mt-20`}>
          No assignments created yet.
        </p>
      ) : (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {assignments.map((a) => (
            <Card key={a.id} className={`${cardBg} ${border} relative group`} theme={theme}>
              <CardHeader>
                <CardTitle>{a.title}</CardTitle>
              </CardHeader>

              <CardContent theme={theme}>
                <p className={`${textSecondary} text-sm mb-3`}>
                  {a.description || "No description"}
                </p>

                <div className="flex flex-col gap-2 text-xs">
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4" /> Grade {a.grade} – {a.section}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(a.due_date).toLocaleDateString()}
                  </span>
                </div>

                <button
                    onClick={() => openStudentsPanel(a)}
                    className="flex items-center gap-1 text-xs opacity-80 hover:opacity-100"
                  >
                    <Users className="w-4 h-4" />
                    View Students
                </button>

              </CardContent>

              <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100">
                <button onClick={() => openEdit(a)}>
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => removeAssignment(a.id)}>
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
              {editMode ? "Edit Assignment" : "Create Assignment"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={saveAssignment} className="space-y-4">
            <Input
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              theme={theme}
            />

            <Input
              placeholder="Grade (e.g. 8)"
              value={form.grade}
              onChange={(e) => setForm({ ...form, grade: e.target.value })}
              required
              theme={theme}
            />

            <Input
              placeholder="Section (e.g. A)"
              value={form.section}
              onChange={(e) => setForm({ ...form, section: e.target.value })}
              required
              theme={theme}
            />

            <Input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              required
              theme={theme}
            />

            <Input
              placeholder="Description (optional)"
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

      <AnimatePresence>
        {studentsOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className={`fixed top-0 right-0 h-full w-full sm:w-[420px] z-50 ${cardBg} ${border} shadow-xl`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-bold text-lg">
                {selectedAssignment?.title}
              </h2>
              <Button variant="ghost" onClick={() => setStudentsOpen(false)}>
                ✕
              </Button>
            </div>
      
            {/* Student list */}
            <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-64px)]">
              {students.map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${border}`}
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 opacity-70" />
                    <span className="font-medium">{s.name}</span>
                  </div>
      
                  <select
                    value={statusMap[s.id] || "not_completed"}
                    onChange={async (e) => {
                      const value = e.target.value;
      
                      setStatusMap((prev) => ({
                        ...prev,
                        [s.id]: value,
                      }));
      
                      await updateStatus(
                        selectedAssignment.id,
                        s.id,
                        value
                      );
                    }}
                    className={`${bg} border rounded px-2 py-1 text-sm`}
                  >
                    <option value="not_completed">Not completed</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              ))}
      
              {students.length === 0 && (
                <p className="text-center opacity-60 text-sm">
                  No students found for this class.
                </p>
              )}
              {loading1 === true && (
                <p className={`${textSecondary} animate-pulse`}>
                  Loading assignments…
                /p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

/* -------------------- STAT CARD -------------------- */

function Stat({ title, value, theme }) {
  return (
    <Card className="p-4" theme={theme}>
      <p className="text-xs uppercase opacity-60">{title}</p>
      <p className="text-lg font-bold">{value}</p>
    </Card>
  );
}
