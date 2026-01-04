import React, { useState, useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import {
  Book,
  Users,
  BarChart3,
  Brain,
  LayoutDashboardIcon,
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
import { Loader2 } from "lucide-react";

export default function TeacherDashboard() {
  const { theme,_, t } =
    useTheme();

  const { bg, text, border, primary, textSecondary, bgCard  } = getThemeClasses(theme)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalBooks: 0,
    avgQuizScore: 0,
    aiSummary: "",
  });

  console.log(primary)

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
      icon: <Users className="text-blue-500" size={26} />,
      value: stats.totalStudents ?? "--",
    },
    {
      title: "Books Uploaded",
      icon: <Book className="text-green-500" size={26} />,
      value: stats.totalBooks ?? "--",
    },
    {
      title: "Avg Quiz Score",
      icon: <BarChart3 className="text-yellow-500" size={26} />,
      value:
        typeof stats.avgQuizScore === "number"
          ? `${stats.avgQuizScore}%`
          : "--",
    },
    {
      title: "AI Insights",
      icon: <Brain className="text-purple-500" size={26} />,
      value: stats.aiSummary || "No insights yet",
    },
  ];

  if (loading) {
      return (
          <div className={`flex items-center justify-center h-screen ${bg} ${textSecondary} w-full`}>
              <Loader2 className="animate-spin mr-2 w-6 h-6 text-blue-500" /> 
              <span className="text-lg">Loading analytics data...</span>
          </div>
      );
  }

  return (
    <div className={`p-6 space-y-8 min-h-screen ${bg} ${text} w-full ml-14`}>
      {/* Header */}
      <header
        className={`flex items-center justify-between pb-6 border-b ${border}`}
      >
        <div className="flex items-center">
          <LayoutDashboardIcon
            className={`w-8 h-8 text-${primary}-500`}
          />
          <h1 className="text-3xl font-extrabold pl-3">
            Teacher Dashboard
          </h1>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className={`border ${border} ${bgCard}`} theme={theme}>
              <CardContent className="flex items-center gap-3 p-4" theme={theme}>
                {card.icon}
                <div>
                  <p className={`text-sm ${textSecondary}`}>
                    {card.title}
                  </p>
                  <p className="text-xl font-bold truncate max-w-[180px]">
                    {card.value}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Performance Chart */}
      <Card className={`border ${border} ${bgCard} p-6`} theme={theme}>
        <h2 className="text-xl font-semibold mb-4"theme={theme}>
          Student Performance Overview
        </h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="subject" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="average_score"
              stroke="#2563eb"
              strokeWidth={3}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Recent Books */}
      <Card className={`border ${border} ${bgCard} p-6`} theme={theme}>
        <h2 className="text-xl font-semibold mb-4" theme={theme}>
          Recent Book Uploads
        </h2>

        {recentBooks.length === 0 ? (
          <p className={`${textSecondary} italic`}>
            No recent uploads.
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentBooks.map((book) => (
              <Card
                key={book.id}
                className={`border ${border} ${bgCard} p-4`}
                theme={theme}
              >
                <CardContent className="p-0" theme={theme}>
                  <h3 className="font-semibold">{book.title}</h3>
                  <p className={`text-sm ${textSecondary}`}>
                    {book.subject} — Grade {book.grade}
                    {book.section}
                  </p>
                  <a
                    href={book.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-${primary}-500 text-sm mt-2 block`}
                  >
                    View File
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Actions */}
      <div className="flex gap-4 mb-8">
        <Button onClick={() => (window.location.href = "/books")}>
          Upload Book
        </Button>
        <Button onClick={() => (window.location.href = "/students")}>
          View Students
        </Button>
        <Button variant="outline" onClick={fetchDashboardData}>
          Refresh
        </Button>
      </div>
    </div>
  );
}
