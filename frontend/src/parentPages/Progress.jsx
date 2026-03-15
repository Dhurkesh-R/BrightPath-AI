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
      <div className={`flex items-center justify-center h-screen ${bg} w-full md:ml-14`}>
        <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className={`p-6 ${bg} ${text} w-full md:ml-14`}>
        Unable to load progress data.
      </div>
    );
  }

  return (
    /* Change 1: Responsive margin and width calculation */
    <div className={`min-h-screen ${bg} ${text} p-4 md:p-8 w-full md:w-[calc(100%-3.5rem)] md:ml-14`}>
      
      {/* ---------- HEADER ---------- */}
      {/* Change 2: Stack header on mobile (flex-col), row on desktop */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black">Progress</h1>
        </div>

        {/* Change 3: Full-width buttons on mobile */}
        <div className="flex w-full sm:w-auto p-1 bg-black/5 rounded-xl border border-white/10">
          <button
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              period === "weekly" ? `${buttonPrimary} shadow-md` : "opacity-60"
            }`}
            onClick={() => setPeriod("weekly")}
          >
            Weekly
          </button>
          <button
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              period === "monthly" ? `${buttonPrimary} shadow-md` : "opacity-60"
            }`}
            onClick={() => setPeriod("monthly")}
          >
            Monthly
          </button>
        </div>
      </div>

      {/* ---------- SUMMARY CARDS ---------- */}
      {/* Change 4: Adjusted grid for better mobile flow */}
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
      <Card className={`${cardBg} ${border} mb-6 overflow-hidden`} theme={theme}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-bold">Growth Trend</CardTitle>
        </CardHeader>

        <CardContent theme={theme} className="px-1 sm:px-6">
          <div className="h-[250px] md:h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trend} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                <XAxis 
                  dataKey="label" 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false}
                  minTickGap={10} 
                />
                <YAxis 
                  domain={[0, 100]} 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    backgroundColor: theme === 'dark' ? '#1f2937' : '#fff',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                  }} 
                />

                <Line
                  type="monotone"
                  dataKey="academic"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="creative"
                  stroke="#ec4899"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="sports"
                  stroke="#22c55e"
                  strokeWidth={3}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* ---------- INSIGHT ---------- */}
      {data.insight && (
        <Card className={`${cardBg} ${border} border-l-4 border-l-indigo-500`} theme={theme}>
          <CardContent theme={theme} className="py-4">
            <p className={`text-sm italic leading-relaxed ${textSecondary}`}>
              "{data.insight}"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

/* ================= COMPONENTS ================= */

function ProgressCard({ title, icon, value, theme }) {
  const { cardBg, border } = getThemeClasses(theme);
  return (
    <Card className={`${cardBg} ${border} p-5 shadow-sm`} theme={theme}>
      <div className="flex items-center gap-4">
        <div className="p-3 bg-black/5 rounded-xl">
          {React.cloneElement(icon, { size: 24 })}
        </div>
        <div>
          <p className="text-[10px] uppercase font-bold tracking-wider opacity-50">{title}</p>
          <p className="text-2xl font-black">{value}</p>
        </div>
      </div>
    </Card>
  );
}
