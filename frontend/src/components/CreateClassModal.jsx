import React, { useState, useEffect } from 'react';
import { X } from "lucide-react";
import { createClass, fetchTeachers } from "../services/api"; 

export default function CreateClassModal({ isOpen, onClose, onRefresh, themeProps }) {
  const [formData, setFormData] = useState({ 
    grade: "", 
    section: "", 
    stream: "General", 
    teacher_id: "" 
  });
  const [teachers, setTeachers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { border, inputBg } = themeProps;

  // Fetch available teachers when modal opens
  useEffect(() => {
    if (isOpen) {
      const getTeachers = async () => {
        try {
          const data = await fetchTeachers();
          setTeachers(data);
        } catch (err) {
          console.error("Failed to load teachers", err);
        }
      };
      getTeachers();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Send teacher_id as an integer (or null)
      await createClass({
        ...formData,
        teacher_id: formData.teacher_id ? parseInt(formData.teacher_id) : null
      });
      onRefresh();
      onClose();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full max-w-md ${inputBg} border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black uppercase italic tracking-tighter">Register New Class</h2>
          <button onClick={onClose}><X /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Grade (e.g. 10)" className={`w-full p-3 border-2 ${border} ${inputBg}`} 
              onChange={(e) => setFormData({...formData, grade: e.target.value})} />
            
            <input required placeholder="Section (e.g. A)" className={`w-full p-3 border-2 ${border} ${inputBg}`} 
              onChange={(e) => setFormData({...formData, section: e.target.value})} />
          </div>

          <input required placeholder="Stream (e.g. Science / Commerce)" className={`w-full p-3 border-2 ${border} ${inputBg}`} 
            onChange={(e) => setFormData({...formData, stream: e.target.value})} />

          <select 
            className={`w-full p-3 border-2 ${border} ${inputBg} font-bold`}
            onChange={(e) => setFormData({...formData, teacher_id: e.target.value})}
            value={formData.teacher_id}
          >
            <option value="">Select Class Teacher</option>
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          <button type="submit" disabled={submitting} className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-widest hover:bg-blue-700 transition-colors">
            {submitting ? "PROVISIONING..." : "CONFIRM REGISTRATION"}
          </button>
        </form>
      </div>
    </div>
  );
}
