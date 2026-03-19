import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import {
  Book,
  Users,
  BarChart3,
  LayoutDashboardIcon,
  Loader2,
  RefreshCw,
  PlusCircle,
  GraduationCap
} from "lucide-react";
import { Button } from "../ui/button";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { getThemeClasses, useTheme } from "../contexts/ThemeContext";
import {
  loadTeacherStats,
  loadTeacherPerformance,
  loadRecentBooks,
} from "../services/api";

export default function TeacherDashboard() {
  const { theme } = useTheme();
  const { bg, text, border, primary, textSecondary, bgCard } = getThemeClasses(theme);
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalBooks: 0,
    avgQuizScore: 0,
    aiSummary: "",
  });

  const [chartData, setChartData] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, booksRes, chartRes] = await Promise.all([
        loadTeacherStats(),
        loadRecentBooks(),
        loadTeacherPerformance(),
      ]);
      setStats(statsRes || {});
      setRecentBooks(Array.isArray(booksRes) ? booksRes : []);
      setChartData(Array.isArray(chartRes) ? chartRes : []);
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    {
      title: "Total Students",
      icon: <Users className="text-blue-500" size={24} />,
      value: stats.totalStudents ?? "--",
    },
    {
      title: "Books Uploaded",
      icon: <Book className="text-green-500" size={24} />,
      value: stats.totalBooks ?? "--",
    },
    {
      title: "Avg Quiz Score",
      icon: <BarChart3 className="text-yellow-500" size={24} />,
      value: typeof stats.avgQuizScore === "number" ? `${stats.avgQuizScore}%` : "--",
    },
  ];

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center h-screen ${bg} ${textSecondary} w-full`}>
        <Loader2 className="animate-spin mb-4 w-10 h-10 text-blue-500" /> 
        <span className="text-lg font-medium">Analyzing dashboard data...</span>
      </div>
    );
  }

  return (
    /* FIXED: Added md:ml-16 to only apply margin on desktop and overflow-x-hidden for safety */
    <div className={`min-h-screen ${bg} ${text} w-full overflow-x-hidden transition-all duration-300 md:pl-16`}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header - Improved Mobile Scaling */}
        <header className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b ${border}`}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-10 md:hidden" />
            <div className={`p-2 rounded-lg bg-blue-500/10`}>
                <LayoutDashboardIcon className={`w-7 h-7 text-blue-500`} />
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Dashboard
            </h1>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
             <Button variant="outline" size="sm" onClick={fetchDashboardData} className="flex-1 sm:flex-none gap-2">
                <RefreshCw size={16} />
             </Button>
            <span>
              Refresh
            </span>
          </div>
        </header>

        {/* Summary Cards - Fixed Grid for Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className={`border ${border} ${bgCard} hover:shadow-md transition-shadow`}>
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="p-3 bg-gray-500/5 rounded-2xl">
                    {card.icon}
                  </div>
                  <div>
                    <p className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>
                      {card.title}
                    </p>
                    <p className="text-2xl font-black">
                      {card.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Performance Chart - Responsive Container Fix */}
        <Card className={`border ${border} ${bgCard} p-4 md:p-6 overflow-hidden`}>
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-blue-500" />
            Performance Overview
          </h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis 
                    dataKey="subject" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                />
                <YAxis 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `${val}%`}
                />
                <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line
                  type="monotone"
                  dataKey="average_score"
                  stroke="#2563eb"
                  strokeWidth={4}
                  dot={{ r: 6, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Books - Responsive Grid */}
        <div className="space-y-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
                <Book size={20} className="text-green-500" />
                Recent Content
            </h2>
            {recentBooks.length === 0 ? (
              <div className={`p-8 text-center border-2 border-dashed ${border} rounded-3xl ${textSecondary}`}>
                <p className="italic">No recent uploads found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentBooks.map((book) => (
                  <Card key={book.id} className={`border ${border} ${bgCard} p-4 hover:border-blue-500/50 transition-colors`}>
                    <CardContent className="p-0">
                      <h3 className="font-bold text-sm mb-1 truncate">{book.title}</h3>
                      <p className={`text-xs ${textSecondary} mb-3`}>
                        {book.subject} • Grade {book.grade}
                      </p>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        className="w-full text-xs font-bold"
                        onClick={() => window.open(book.file_url, '_blank')}
                      >
                        View Resource
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
        </div>

        {/* Quick Actions Footer - Mobile Fixed or Stacked */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button className="flex-1 gap-2 py-6 rounded-2xl font-bold" onClick={() => (window.location.href = "/books")}>
            <PlusCircle size={20} /> Upload New Book
          </Button>
          <Button variant="outline" className="flex-1 gap-2 py-6 rounded-2xl font-bold" onClick={() => (window.location.href = "/students")}>
            <GraduationCap size={20} /> Student Directory
          </Button>
        </div>
      </div>
    </div>
  );
}
