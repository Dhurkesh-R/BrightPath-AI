import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Users, GraduationCap, ArrowLeft, Trash2, Edit3, Loader2, Save, X } from "lucide-react";
import { getThemeClasses, useTheme } from "../contexts/ThemeContext";
import { fetchClass, deleteClass, updateClass } from "../services/api"; // Assuming your api service has fetch/put/delete

export default function ClassDetails() {
  const { Id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { bg, text, border, inputBg, textSecondary } = getThemeClasses(theme);

  const [cls, setCls] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [ teachers, setTeachers ] = useState([])

  useEffect(() => {
    fetchClassData();
  }, [Id]);

  useEffect(() => {
      const getTeachers = async () => {
        try {
          const data = await fetchTeachers();
          setTeachers(data);
        } catch (err) {
          console.error("Failed to load teachers", err);
        }
      };
      getTeachers();
    }, []);

  const fetchClassData = async () => {
    try {
      const data = await fetchClass(Id);
      setCls(data);
      setEditForm(data);
    } catch (err) {
      console.error("Error fetching class:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure? This will remove the class registry permanently.")) {
      try {
        await deleteClass(Id)
        navigate('/classes'); // Go back to manager
      } catch (err) {
        alert("Failed to delete");
      }
    }
  };

  const handleUpdate = async () => {
    try {
      await updateClass(Id, editForm)
      setIsEditing(false);
      fetchClassData();
    } catch (err) {
      alert("Failed to update");
    }
  };

  if (loading) return (
    <div className={`flex items-center justify-center h-screen ${bg}`}>
      <Loader2 className="animate-spin text-blue-600" />
    </div>
  );

  return (
    <div className={`p-6 min-h-screen ${bg} ${text} md:ml-16`}>
      {/* Navigation & Actions */}
      <div className="flex justify-between items-center mb-10">
        <button onClick={() => navigate('/classes')} className="flex items-center gap-2 font-black uppercase text-xs hover:gap-4 transition-all">
          <ArrowLeft size={20} /> Back to Registry
        </button>
        
        <div className="flex gap-4">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className={`p-3 border-2 border-black dark:border-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all ${inputBg}`}
          >
            {isEditing ? <X size={20} /> : <Edit3 size={20} />}
          </button>
          <button 
            onClick={handleDelete}
            className="p-3 bg-red-500 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* Class Header */}
      <div className={`p-8 border-4 border-black dark:border-white ${inputBg} shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] mb-12`}>
        {isEditing ? (
          <div className="space-y-4">
            <input 
              className={`text-5xl font-black uppercase w-full p-2 border-2 border-black ${bg}`}
              value={editForm.grade}
              onChange={e => setEditForm({...editForm, grade: e.target.value})}
            />
            <select 
              className={`text-5xl font-black uppercase w-full p-2 border-2 border-black ${bg}`}
              onChange={(e) => setFormData({...editForm, teacher_id: e.target.value})}
              value={editForm.teacher_id}
            >
              <option value="">Select Class Teacher</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button onClick={handleUpdate} className="bg-blue-600 text-white px-6 py-2 font-black flex items-center gap-2">
              <Save size={18} /> SAVE CHANGES
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-7xl font-black uppercase tracking-tighter mb-2">
              Class {cls?.grade}-{cls?.section}
            </h1>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 font-bold opacity-70">
                <GraduationCap className="text-blue-600" />
                <span>TEACHER: {cls?.teacher_name}</span>
              </div>
              <div className="flex items-center gap-2 font-bold opacity-70">
                <Users className="text-blue-600" />
                <span>{cls?.students?.length || 0} Students Enrolled</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Student List Section */}
      <h3 className="text-2xl font-black uppercase mb-6 tracking-tight">Student Roster</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cls?.students?.map(student => (
          <div key={student.id} className={`p-4 border-2 border-black dark:border-white flex items-center justify-between ${inputBg}`}>
            <div>
              <p className="font-black uppercase">{student.name}</p>
              <p className="text-xs opacity-60 font-bold">{student.email}</p>
            </div>
            <div className="w-8 h-8 bg-blue-100 border-2 border-black flex items-center justify-center font-black">
              {student.name[0]}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
