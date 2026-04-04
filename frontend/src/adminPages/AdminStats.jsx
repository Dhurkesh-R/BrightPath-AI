import React, { useState, useEffect } from 'react';
import { 
  Users, GraduationCap, MessageSquare, Target, 
  TrendingUp, BarChart3, ChevronLeft, RefreshCw 
} from "lucide-react";
import { Link } from "react-router-dom"; // For navigation back to dashboard
import { getThemeClasses, useTheme } from "../contexts/ThemeContext";
import { fetchAdminStats } from "../services/api";

const StatCard = ({ label, value, icon, subtext, color, border, inputBg, textSecondary }) => (
  <div className={`p-6 rounded-2xl border ${border} ${inputBg} shadow-sm hover:shadow-md transition-all duration-300`}>
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        {React.cloneElement(icon, { className: color.replace('bg-', 'text-') })}
      </div>
      <div className="flex items-center gap-1 text-green-500 text-[10px] font-bold bg-green-500/10 px-2 py-0.5 rounded-full">
        <TrendingUp size={12} /> Live
      </div>
    </div>
    <div>
      <div className="text-4xl font-black tracking-tight">{value || 0}</div>
      <div className="text-xs font-bold uppercase tracking-widest opacity-60 mt-1">{label}</div>
      <p className={`text-[10px] mt-4 flex items-center gap-1 ${textSecondary}`}>
        {subtext}
      </p>
    </div>
  </div>
);

export default function AdminStats() {
  const { theme } = useTheme();
  const { bg, text, border, inputBg, textSecondary } = getThemeClasses(theme);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const getStats = async () => {
    setLoading(true);
    try {
      const info = await fetchAdminStats();
      setStats(info);
    } catch (err) {
      console.error("Stats fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getStats();
  }, []);

    if (loading) {
        return (
            <div className={`flex items-center justify-center h-screen ${bg} ${textSecondary} w-full`}>
                <Loader2 className="animate-spin mr-2 w-6 h-6 text-blue-500" /> 
                <span className="text-lg">Loading admin stats...</span>
            </div>
        );
    }

  return (
    <div className={`p-6 min-h-screen ${bg} ${text} md:ml-16`}>
      {/* PAGE HEADER */}
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/admin" className={`p-2 rounded-lg hover:bg-gray-500/10 ${textSecondary}`}>
              <ChevronLeft size={20} />
            </Link>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <BarChart3 className="text-blue-500" size={32} /> Platform Analytics
            </h1>
          </div>
          <p className={`ml-10 ${textSecondary}`}>Real-time insights for BrightPathAI</p>
        </div>

        <button 
          onClick={getStats}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${border} ${inputBg} hover:opacity-80 transition-all text-sm font-bold`}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </header>

      {/* MAIN CONTENT */}
      {loading && !stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-40 animate-pulse rounded-2xl border ${border} ${inputBg} opacity-40`} />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard 
              label="Total Users" 
              value={stats?.user_overview?.total} 
              icon={<Users size={24} />} 
              color="bg-blue-500" 
              subtext={`${stats?.user_overview?.recent_growth} new registrations this month`}
              {...{border, inputBg, textSecondary}}
            />
            <StatCard 
              label="Active Students" 
              value={stats?.user_overview?.students} 
              icon={<GraduationCap size={24} />} 
              color="bg-green-500" 
              subtext="Focusing on CBSE Class 10 prep"
              {...{border, inputBg, textSecondary}}
            />
            <StatCard 
              label="AI Interactions" 
              value={stats?.engagement?.total_ai_interactions} 
              icon={<MessageSquare size={24} />} 
              color="bg-purple-500" 
              subtext="Total queries processed by Lyria"
              {...{border, inputBg, textSecondary}}
            />
            <StatCard 
              label="Goals Completed" 
              value={stats?.engagement?.active_goals} 
              icon={<Target size={24} />} 
              color="bg-red-500" 
              subtext="Academic milestones reached"
              {...{border, inputBg, textSecondary}}
            />
          </div>

          {/* DETAILED INSIGHTS SECTION */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className={`lg:col-span-2 p-8 rounded-3xl border-2 border-dashed ${border} flex flex-col items-center justify-center min-h-[300px] opacity-40`}>
              <BarChart3 size={48} className="mb-4" />
              <h3 className="font-bold uppercase tracking-widest text-sm">Growth Chart</h3>
              <p className="text-xs italic">Historical data visualization coming soon</p>
            </div>
            
            <div className={`p-8 rounded-3xl border ${border} ${inputBg}`}>
              <h3 className="font-bold mb-6 text-sm uppercase tracking-widest">User Split</h3>
              <div className="space-y-6">
                {[
                  { label: 'Students', count: stats?.user_overview?.students, color: 'bg-green-500' },
                  { label: 'Teachers', count: stats?.user_overview?.teachers, color: 'bg-blue-500' },
                  { label: 'Parents', count: stats?.user_overview?.parents, color: 'bg-yellow-500' }
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs font-bold mb-2">
                      <span>{item.label}</span>
                      <span>{item.count}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-500/10 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color}`} 
                        style={{ width: `${(item.count / stats?.user_overview?.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
