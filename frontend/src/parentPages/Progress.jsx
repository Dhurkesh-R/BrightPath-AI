import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, BookOpen, Palette, Dumbbell, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { useTheme, getThemeClasses } from "../contexts/ThemeContext";
import { getParentProgress } from "../services/api";

export default function ParentProgress() {
  const { theme } = useTheme();
  const {
    bg,
    text,
    cardBg,
    border,
    textSecondary,
    buttonPrimary,
  } = getThemeClasses(theme);

  const [period, setPeriod] = useState("weekly");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ---------------- FETCH ---------------- */

  const loadProgress = async () => {
    setLoading(true);
    try {
      const res = await getParentProgress(period);
      setData(res);
    } catch (err) {
      console.error("Failed to load progress", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [period]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${bg} w-full ml-14`}>
        <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`p-6 ${bg} ${text} w-full ml-14`}>
        Unable to load progress data.
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${text} p-6 w-full ml-14`}>
      {/* ---------- HEADER ---------- */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-extrabold">Progress Overview</h1>
        </div>

        <div className="flex gap-2">
          <Button
            className={period === "weekly" ? buttonPrimary : ""}
            variant={period === "weekly" ? "default" : "outline"}
            onClick={() => setPeriod("weekly")}
          >
            Weekly
          </Button>
          <Button
            className={period === "monthly" ? buttonPrimary : ""}
            variant={period === "monthly" ? "default" : "outline"}
            onClick={() => setPeriod("monthly")}
          >
            Monthly
          </Button>
        </div>
      </div>

      {/* ---------- SUMMARY CARDS ---------- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <ProgressCard
          title="Academic"
          icon={<BookOpen className="text-blue-400" />}
          value={`${data.summary.academic}%`}
          theme={theme}
        />
        <ProgressCard
          title="Creative"
          icon={<Palette className="text-pink-400" />}
          value={`${data.summary.creative}%`}
          theme={theme}
        />
        <ProgressCard
          title="Sports"
          icon={<Dumbbell className="text-green-400" />}
          value={`${data.summary.sports}%`}
          theme={theme}
        />
      </div>

      {/* ---------- TREND CHART ---------- */}
      <Card className={`${cardBg} ${border} mb-6`} theme={theme}>
        <CardHeader>
          <CardTitle>Growth Trend</CardTitle>
        </CardHeader>

        <CardContent theme={theme}>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data.trend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis domain={[0, 100]} />
              <Tooltip />

              <Line
                type="monotone"
                dataKey="academic"
                stroke="#3b82f6"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="creative"
                stroke="#ec4899"
                strokeWidth={3}
              />
              <Line
                type="monotone"
                dataKey="sports"
                stroke="#22c55e"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ---------- INSIGHT ---------- */}
      {data.insight && (
        <Card className={`${cardBg} ${border}`} theme={theme}>
          <CardContent theme={theme}>
            <p className={`italic ${textSecondary}`}>
              {data.insight}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ================= COMPONENTS ================= */

function ProgressCard({ title, icon, value, theme }) {
  return (
    <Card className="p-4" theme={theme}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-xs opacity-60">{title}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}
