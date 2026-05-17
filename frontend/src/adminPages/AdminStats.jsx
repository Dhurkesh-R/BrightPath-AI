import React, { useState, useEffect } from 'react';
import { 
  Users, GraduationCap, MessageSquare, Target, 
  TrendingUp, BarChart3, ChevronLeft, RefreshCw, Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { getThemeClasses, useTheme } from "../contexts/ThemeContext";
import { fetchAdminStats } from "../services/api";

// 1. Import Recharts components for the historical line chart
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";

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

  // Determine line chart accent colors based on light vs dark context
  const chartStrokeColor = theme === 'dark' ? '#374151' : '#e5e7eb';
  const axisLabelColor = theme === 'dark' ? '#9ca3af' : '#4b5563';

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

  const growthData = stats?.historical_growth || [];

  if (loading && !stats) {
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
            <div className="w-12 h-10 md:hidden" />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          label="Total Users" 
          value={stats?.user_overview?.total} 
          icon={<Users size={24} />} 
          color="bg-blue-500" 
          subtext={`${stats?.user_overview?.recent_growth || 0} new registrations this month`}
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
        
        {/* GROWTH CHART */}
        <div className={`lg:col-span-2 p-6 rounded-3xl border ${border} ${inputBg} flex flex-col justify-between min-h-[350px]`}>
          <div className="mb-4">
            <h3 className="font-bold uppercase tracking-widest text-sm">User Registration Growth</h3>
            <p className={`text-xs ${textSecondary}`}>Monthly trends for platform onboarding</p>
          </div>
          
          <div className="w-full h-64 text-xs font-semibold">
            {growthData.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center italic text-gray-400 opacity-60">
                No historical growth logs available yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartStrokeColor} vertical={false} />
                  <XAxis dataKey="name" stroke={axisLabelColor} tickLine={false} />
                  <YAxis stroke={axisLabelColor} tickLine={false} allowDecimals={false} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#ffffff', 
                      borderColor: chartStrokeColor,
                      borderRadius: '12px',
                      color: theme === 'dark' ? '#f3f4f6' : '#1f2937'
                    }} 
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line 
                    type="monotone" 
                    dataKey="Students" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    activeDot={{ r: 6 }} 
                    dot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Teachers" 
                    stroke="#3b82f6" 
                    strokeWidth={3} 
                    activeDot={{ r: 6 }}
                    dot={{ r: 4 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        
        {/* USER SPLIT PROGRESS BARS */}
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
                  <span>{item.count || 0}</span>
                </div>
                <div className="w-full h-2 bg-gray-500/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} transition-all duration-500`} 
                    style={{ width: `${stats?.user_overview?.total ? (item.count / stats?.user_overview?.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
