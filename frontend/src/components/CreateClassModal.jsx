import React, { useState } from 'react';
import { X, Check } from "lucide-react";
import { createClass } from "../services/api";

// Component to handle the class creation form within a modal
export default function CreateClassModal({ isOpen, onClose, onRefresh, themeProps }) {
  const [formData, setFormData] = useState({ grade: "", section: "", stream: "General" });
  const [submitting, setSubmitting] = useState(false);
  const { border, inputBg } = themeProps;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createClass(formData);
      onRefresh(); // Refresh data in parent
      onClose();   // Close modal
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className={`w-full max-w-md ${inputBg} border-2 border-black p-6`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black uppercase italic">New Class</h2>
          <button onClick={onClose}><X /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input required placeholder="Grade" className={`w-full p-3 border-2 ${border} ${inputBg}`} onChange={(e) => setFormData({...formData, grade: e.target.value})} />
          <input required placeholder="Section" className={`w-full p-3 border-2 ${border} ${inputBg}`} onChange={(e) => setFormData({...formData, section: e.target.value})} />
          <button type="submit" disabled={submitting} className="w-full py-4 bg-blue-600 text-white font-bold">
            {submitting ? "Saving..." : "Confirm"}
          </button>
        </form>
      </div>
    </div>
  );
}
