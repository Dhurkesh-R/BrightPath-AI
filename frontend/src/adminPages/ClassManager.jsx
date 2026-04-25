import React, { useState, useEffect } from 'react';
import { LayoutGrid, Plus, Users, GraduationCap, ArrowRight, Loader2 } from "lucide-react";
import { getThemeClasses, useTheme } from "../contexts/ThemeContext";
import { fetchClasses } from "../services/api";
import CreateClassModal from "../components/CreateClassModal";
import { useNavigate } from 'react-router-dom';


export default function ClassManager() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { bg, text, border, inputBg, textSecondary, cardBg } = getThemeClasses(theme);
  const navigate = useNavigate();

  const getClasses = async () => {
      try {
        setLoading(true);
        const data = await fetchClasses();
        setClasses(data);
      } catch (err) {
        console.error("Failed to load classes:", err);
      } finally {
        setLoading(false);
      }
    };
  
  useEffect(() => {
    getClasses();
  }, []);
  
  const handleRefresh = async () => {
    getClasses();
  };

  if (loading) {
        return (
            <div className={`flex items-center justify-center h-screen ${bg} ${textSecondary} w-full`}>
                <Loader2 className="animate-spin mr-2 w-6 h-6 text-blue-500" /> 
                <span className="text-lg">Loading classes...</span>
            </div>
        );
  }

  return (
    <div className={`p-6 min-h-screen ${bg} ${text} md:ml-16`}>
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-3">
            <LayoutGrid className="text-blue-600" size={32} /> Class Registry
          </h1>
          <p className={`mt-1 font-bold opacity-60 ${textSecondary}`}>Manage 10th Grade Sections & Faculty</p>
        </div>

        <button className="flex items-center gap-2 px-6 py-3 bg-black dark:bg-white text-white dark:text-black font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Create New Class
        </button>
      </header>

      <CreateClassModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onRefresh={handleRefresh}
        themeProps={{ border: 'border-gray-300', inputBg: 'bg-white' }}
      />
      
      {classes.length === 0 ? (
        <div className={`text-center py-20 border-4 border-dashed ${border} opacity-50`}>
          <p className="text-2xl font-black uppercase">No Classes Found</p>
          <p className="text-sm">Click "Create New Class" to get started.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {classes.map((cls) => (
          <div 
            key={cls.id} 
            className={`group p-6 rounded-none border-2 border-black dark:border-white ${cardBg} shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:-translate-y-1 transition-all`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest">
                {cls.stream}
              </div>
              <div 
                onClick={() => navigate(`/classes/${cls.id}`)}
                className="cursor-pointer group ..."
              >
                <button className="opacity-30 hover:opacity-100 transition-opacity">
                  <ArrowRight size={20} />
                </button>
              </div>
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
                {cls.student_count === 0 ? (
                  <span className="text-[10px] font-black uppercase opacity-40">0 Students</span>
                ) : cls.student_count === 3 ? (
                  <span className="text-[10px] font-black uppercase opacity-40">3 Students</span>
                ): (
                  <span className="text-[10px] font-black uppercase opacity-40">+{cls.student_count - 3} Students</span>
                )}
              </div>
              <Users size={18} className="opacity-20" />
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
