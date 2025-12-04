import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent } from "@/ui/card";
import { Book, Users, BarChart3, Brain, LayoutDashboardIcon } from "lucide-react";
import { Button } from "@/ui/button";
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

export default function TeacherDashboard() {
  // FIX 1: Correctly destructure theme from useTheme
  const { theme } = useTheme(); 
  
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalBooks: 0,
    avgQuizScore: 0,
    aiSummary: "Fetching insights...",
  });

  const [chartData, setChartData] = useState([]);
  const [recentBooks, setRecentBooks] = useState([]);

  // FIX 2: Correctly call getThemeClasses and destructure necessary variables
  const { bg, text, border, primary, textSecondary, bgCard } = getThemeClasses(theme);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, booksRes, chartRes] = await Promise.all([
        axios.get("/api/teacher-stats"),
        axios.get("/api/books/recent"),
        axios.get("/api/performance-data"),
      ]);

      setStats(statsRes.data);
      setRecentBooks(booksRes.data);
      setChartData(chartRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    }
  };

  const cards = [
    {
      title: "Total Students",
      // Keeping fixed semantic color for clarity
      icon: <Users className="text-blue-500" size={26} />, 
      value: stats.totalStudents,
    },
    {
      title: "Books Uploaded",
      icon: <Book className="text-green-500" size={26} />,
      value: stats.totalBooks,
    },
    {
      title: "Avg Quiz Score",
      icon: <BarChart3 className="text-yellow-500" size={26} />,
      value: `${stats.avgQuizScore}%`,
    },
    {
      title: "AI Insights",
      icon: <Brain className="text-purple-500" size={26} />,
      value: stats.aiSummary,
    },
  ];

  return (
    // FIX 3: Apply theme classes to the main container
    <div className={`p-6 space-y-8 min-h-screen ${bg} ${text}`}>
      
      {/* Header */}
      <header className={`flex items-center justify-between pb-6 mb-6 border-b ${border}`}>
        <div className="flex items-center">
          {/* FIX 4: Use primary color class instead of theme check */}
          <LayoutDashboardIcon className={`w-8 h-8 text-${primary}-500`} />
          <h1 className="text-3xl font-extrabold pl-3">Teacher Dashboard</h1>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            {/* FIX 5: Use theme for card background/border */}
            <Card className={`shadow-md p-4 border ${border} ${bgCard}`}>
              <CardContent className="flex items-center gap-3 p-0">
                {card.icon}
                <div>
                  {/* FIX 6: Use textSecondary for labels */}
                  <p className={`text-sm ${textSecondary}`}>{card.title}</p>
                  <p className="text-xl font-bold">{card.value}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Chart Section */}
      {/* FIX 7: Apply theme classes to chart container */}
      <Card className={`shadow-md p-6 border ${border} ${bgCard}`}>
        <h2 className="text-xl font-semibold mb-4">📊 Student Performance Overview</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            {/* FIX 8: Use dynamic border for grid stroke (recharts requires a hex color, so we approximate) */}
            <CartesianGrid stroke={border.includes('700') ? '#475569' : '#e5e7eb'} strokeDasharray="3 3" /> 
            {/* FIX 9: Use dynamic color for axis text */}
            <XAxis dataKey="subject" stroke={textSecondary.includes('400') ? '#9ca3af' : '#4b5563'} />
            <YAxis stroke={textSecondary.includes('400') ? '#9ca3af' : '#4b5563'} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="average_score"
              stroke="#2563eb" // Keeping blue stroke for data visualization consistency
              strokeWidth={3}
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Uploads */}
      {/* FIX 10: Apply theme classes to uploads container */}
      <Card className={`shadow-md p-6 border ${border} ${bgCard}`}>
        <h2 className="text-xl font-semibold mb-4">📚 Recent Book Uploads</h2>
        {recentBooks.length === 0 ? (
          <p className={`${textSecondary} italic`}>No recent uploads yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentBooks.map((book) => (
              // FIX 11: Apply theme classes to individual books
              <Card key={book.id} className={`p-4 border shadow-sm ${border} ${bgCard}`}>
                <CardContent className="p-0">
                  <h3 className="font-semibold mb-1">{book.title}</h3>
                  {/* FIX 12: Use textSecondary for metadata */}
                  <p className={`text-sm ${textSecondary}`}>
                    {book.subject} — Grade {book.grade}-{book.section}
                  </p>
                  <a
                    href={book.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    // FIX 13: Use theme primary color for link
                    className={`text-${primary}-500 text-sm mt-2 block hover:text-${primary}-400 transition-colors`}
                  >
                    View File
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="flex gap-4 mt-6">
        <Button onClick={() => (window.location.href = "/books")}>
          Upload New Book
        </Button>
        <Button onClick={() => (window.location.href = "/students")}>
          View Students
        </Button>
        <Button variant="outline" onClick={fetchDashboardData}>
          Refresh Data
        </Button>
      </div>
    </div>
  );
}