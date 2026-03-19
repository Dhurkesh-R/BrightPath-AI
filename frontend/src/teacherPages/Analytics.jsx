import React, { useEffect, useState } from "react";
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, 
  CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend 
} from "recharts";
import { Card, CardContent } from "../ui/card";
import { CustomSelect } from "../ui/customSelect";
import { useTheme } from "../contexts/ThemeContext";
import { loadAnalytics } from "../services/api";
import { Loader2, TrendingUp, ShieldAlert, Heart } from "lucide-react";

export default function Analytics() {
  const { theme, bg, text, border, textSecondary, bgCard } = useTheme(); 
  
  const [gradeFilter, setGradeFilter] = useState("9");
  const [subjectFilter, setSubjectFilter] = useState("all"); 
  const [data, setData] = useState({
    averageScore: null,
    positiveEmotionRatio: null,
    highRiskPercentage: null,
    emotionalDistribution: [],
    behaviorRisks: [],
    studentPerformance: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await loadAnalytics(gradeFilter, subjectFilter);
        if (res) {
          setData({
            averageScore: res.averageScore,
            positiveEmotionRatio: res.positiveEmotionRatio,
            highRiskPercentage: res.highRiskPercentage,
            emotionalDistribution: res.emotionalDistribution || [],
            behaviorRisks: res.behaviorRisks || [],
            studentPerformance: res.weeklyTrend || []
          });
        }
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [gradeFilter, subjectFilter]);

  if (loading) {
    return (
      <div className={`flex flex-col items-center justify-center h-screen ${bg} ${textSecondary} w-full`}>
        <Loader2 className="animate-spin mb-4 w-10 h-10 text-blue-500" /> 
        <span className="text-lg font-medium">Gathering insights...</span>
      </div>
    );
  }

  const COLORS = ["#3b82f6", "#10b981", "#f97316", "#ef4444"];
  const chartStrokeColor = theme === 'dark' ? '#374151' : '#e5e7eb';
  const axisColor = text;

  return (
    /* BETTERMENT: md:pl-16 handles sidebar space, overflow-x-hidden prevents mobile horizontal scroll */
    <div className={`min-h-screen ${bg} ${text} w-full transition-all duration-300 overflow-x-hidden md:pl-16`}>
      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header - Improved for Mobile */}
        <header className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b ${border}`}>
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">Analytics Dashboard</h1>
            <p className={`text-sm ${textSecondary} mt-1`}>Monitoring student progress and well-being</p>
          </div>
          
          {/* Filter Bar - Better layout on mobile */}
          <div className={`flex flex-wrap gap-3 items-center ${bgCard} p-2 md:p-3 rounded-2xl border ${border} w-full sm:w-auto`}>
            <CustomSelect 
                onValueChange={setGradeFilter} 
                defaultValue="9"
                options={[{ value: "9", label: "9th Grade" }, { value: "10", label: "10th Grade" }]}
                theme={theme}
            />
            <CustomSelect 
                onValueChange={setSubjectFilter} 
                defaultValue="all"
                options={[
                    { value: "all", label: "All Subjects" },
                    { value: "Math", label: "Math" },
                    { value: "Science", label: "Science" }
                ]}
                theme={theme}
            />
          </div>
        </header>

        {/* Summary Insights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard title="Avg Class Score" value={data.averageScore} icon={<TrendingUp className="text-blue-500"/>} suffix="%" color="text-blue-500" theme={theme} textSecondary={textSecondary} />
          <MetricCard title="Positive Emotion" value={data.positiveEmotionRatio} icon={<Heart className="text-emerald-500"/>} suffix="%" color="text-emerald-500" theme={theme} textSecondary={textSecondary} />
          <MetricCard title="High-Risk Cases" value={data.highRiskPercentage} icon={<ShieldAlert className="text-red-500"/>} suffix="%" color="text-red-500" theme={theme} textSecondary={textSecondary} />
        </div>
        
        {/* Performance Trend */}
        <Card className={`border ${border} ${bgCard} p-4 md:p-6`} theme={theme}>
          <h2 className="text-lg font-bold mb-6">Weekly Performance Trend</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.studentPerformance} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartStrokeColor} />
                <XAxis dataKey="week" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[70, 100]} stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#111827' : '#fff', borderRadius: '12px', border: `1px solid ${chartStrokeColor}` }}
                />
                <Line type="monotone" dataKey="averageScore" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DistributionCard title="Emotional State" data={data.emotionalDistribution} dataKey="value" nameKey="mood" colors={COLORS} theme={theme} border={border} bgCard={bgCard} />
          <DistributionCard title="Behavioral Risks" data={data.behaviorRisks} dataKey="value" nameKey="type" colors={COLORS} theme={theme} border={border} bgCard={bgCard} />
        </div>
      </div>
    </div>
  );
}

// Sub-components for cleaner code
function MetricCard({ title, value, icon, suffix, color, theme, textSecondary }) {
  return (
    <Card theme={theme} className="overflow-hidden">
      <CardContent className="p-5 flex items-center justify-between" theme={theme}>
        <div>
          <h3 className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>{title}</h3>
          <p className={`text-3xl font-black mt-1 ${color}`}>
            {value !== null ? `${value}${suffix}` : "--"}
          </p>
        </div>
        <div className="p-3 bg-gray-500/5 rounded-2xl">{icon}</div>
      </CardContent>
    </Card>
  );
}

function DistributionCard({ title, data, dataKey, nameKey, colors, theme, border, bgCard }) {
  return (
    <Card className={`border ${border} ${bgCard} p-4 md:p-6`} theme={theme}>
      <h2 className="text-lg font-bold mb-4">{title}</h2>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey={dataKey} nameKey={nameKey} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5}>
              {data?.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} stroke="transparent" />)}
            </Pie>
            <Tooltip />
            <Legend verticalAlign="bottom" height={36}/>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
