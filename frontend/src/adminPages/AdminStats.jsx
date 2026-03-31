import React, {useState, useEffect} from 'react';
import { Users, GraduationCap, MessageSquare, Target, TrendingUp, UserCheck, Briefcase } from "lucide-react";
import { getThemeClasses, useTheme } from "../contexts/ThemeContext";
import { fetchAdminStats } from "../services/api"

const StatCard = ({ label, value, icon, subtext, color, border, inputBg, textSecondary }) => (
  <div className={`p-5 rounded-2xl border ${border} ${inputBg} shadow-sm hover:shadow-md transition-all duration-300 group`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
        {React.cloneElement(icon, { className: color.replace('bg-', 'text-') })}
      </div>
      <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold bg-green-500/10 px-2 py-0.5 rounded-full">
        <TrendingUp size={12} /> Live
      </div>
    </div>
    
    <div>
      <div className="text-3xl font-black tracking-tight">{value}</div>
      <div className="text-xs font-bold uppercase tracking-widest opacity-60 mt-1">{label}</div>
      <div className={`text-[10px] mt-3 flex items-center gap-1 ${textSecondary}`}>
        <span className="w-1 h-1 rounded-full bg-current opacity-40"></span>
        {subtext}
      </div>
    </div>
  </div>
);

export default function AdminStats() {
  const {theme} = useTheme()
  const [stats, setStats] = useState([])
  const { border, inputBg, textSecondary } = getThemeClasses(theme);

  useEffect(() => {
    const getStats = async () => {
      try {
        const info = await fetchAdminStats()
        setStats(info)
      } catch (err) {
        console.error("failed to fetch stats", err)
      }
    } 

    getStats()
  }, [])

  const data = [
    {
      label: "Total Users",
      value: stats.user_overview.total,
      icon: <Users size={20} />,
      color: "bg-blue-500",
      subtext: `${stats.user_overview.recent_growth} joined recently`
    },
    {
      label: "Students",
      value: stats.user_overview.students,
      icon: <GraduationCap size={20} />,
      color: "bg-green-500",
      subtext: "Preparing for Boards"
    },
    {
      label: "AI Interactions",
      value: stats.engagement.total_ai_interactions,
      icon: <MessageSquare size={20} />,
      color: "bg-purple-500",
      subtext: "Personalized Learning"
    },
    {
      label: "Goals Tracked",
      value: stats.engagement.active_goals,
      icon: <Target size={20} />,
      color: "bg-red-500",
      subtext: "Syllabus Progress"
    }
  ];

  return (
    <section className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {data.map((stat, index) => (
          <StatCard 
            key={index} 
            {...stat} 
            border={border} 
            inputBg={inputBg} 
            textSecondary={textSecondary} 
          />
        ))}
      </div>
      
      {/* Placeholder for Future Charts */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
         <div className={`h-10 border-2 border-dashed ${border} rounded-2xl flex items-center justify-center opacity-30 text-xs font-bold uppercase tracking-widest`}>
            Role Distribution Chart (Coming Soon)
         </div>
         <div className={`h-10 border-2 border-dashed ${border} rounded-2xl flex items-center justify-center opacity-30 text-xs font-bold uppercase tracking-widest`}>
            Activity Growth Trend (Coming Soon)
         </div>
      </div>
    </section>
  );
}
