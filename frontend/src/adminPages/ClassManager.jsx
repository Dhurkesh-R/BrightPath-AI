import React, { useState, useEffect } from 'react';
import { LayoutGrid, Plus, Users, GraduationCap, ArrowRight } from "lucide-react";
import { getThemeClasses, useTheme } from "../contexts/ThemeContext";

export default function ClassManager() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const { bg, text, border, inputBg, textSecondary } = getThemeClasses(theme);

  useEffect(() => {
    // Replace with your actual API call: fetchClasses()
    const mockData = [
      { id: 1, name: "10 - A", stream: "CBSE Core", teacher: "Ms. Sharma", student_count: 32 },
      { id: 2, name: "10 - B", stream: "CBSE Core", teacher: "Mr. Gupta", student_count: 28 },
    ];
    setClasses(mockData);
    setLoading(false);
  }, []);

  return (
    <div className={`p-6 min-h-screen ${bg} ${text} md:ml-16`}>
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
            <LayoutGrid className="text-blue-600" size={32} /> Class Registry
          </h1>
          <p className={`mt-1 font-bold opacity-60 ${textSecondary}`}>Manage 10th Grade Sections & Faculty</p>
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]">
          <Plus size={18} /> Create New Class
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {classes.map((cls) => (
          <div 
            key={cls.id} 
            className={`group p-6 rounded-none border-2 border-black dark:border-white ${inputBg} shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:-translate-y-1 transition-all`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest">
                {cls.stream}
              </div>
              <button className="opacity-30 hover:opacity-100 transition-opacity">
                <ArrowRight size={20} />
              </button>
            </div>

            <h2 className="text-5xl font-black mb-1">{cls.name}</h2>
            <div className="flex items-center gap-2 mb-6 opacity-60">
              <GraduationCap size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">{cls.teacher}</span>
            </div>

            <div className="pt-4 border-t-2 border-black/5 dark:border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-gray-300" />
                  ))}
                </div>
                <span className="text-[10px] font-black uppercase opacity-40">+{cls.student_count - 3} Students</span>
              </div>
              <Users size={18} className="opacity-20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
