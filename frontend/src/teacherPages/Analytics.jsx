import React, { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { Card, CardContent } from "../ui/card";
import { CustomSelect } from "../ui/customSelect";
import { useTheme } from "../contexts/ThemeContext";
import { loadAnalytics } from "../services/api";
import { Loader2 } from "lucide-react";


export default function Analytics() {
  // Use the local mock theme hook, which provides the theme variables
  const { theme, setTheme, bg, text, border, primary, textSecondary, bgCard } = useTheme(); 
  
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
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const res = await loadAnalytics(gradeFilter, subjectFilter);

        console.log(res)
  
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
        setLoading(false)
      }
    };
  
    fetchData();
  }, [gradeFilter, subjectFilter]);
  
  
  if (loading) {
        return (
            <div className={`flex items-center justify-center h-screen ${bg} ${textSecondary} w-full`}>
                <Loader2 className="animate-spin mr-2 w-6 h-6 text-blue-500" /> 
                <span className="text-lg">Loading analytics data...</span>
            </div>
        );
    }

  const COLORS = ["#3b82f6", "#10b981", "#f97316", "#ef4444"]; // blue, emerald, orange, red
  
  const gradeOptions = [
    { value: "9", label: "9th Grade" },
    { value: "10", label: "10th Grade" },
  ];

  const subjectOptions = [
    { value: "all", label: "All Subjects" },
    { value: "Math", label: "Mathematics" },
    { value: "Science", label: "Science" },
    { value: "English", label: "English" },
  ];
  
  // Dynamic Chart styling based on theme
  const chartStrokeColor = theme === 'dark' ? '#4b5563' : '#e5e7eb'; // Grid lines
  const axisColor = text; // Axis labels inherit main text color

  return (
    // Applying themed classes from the utility function
    <div className={`p-6 space-y-8 min-h-screen transition-colors duration-500 ${bg} ${text} w-full ml-14`}>
      
      {/* Header and Theme Toggle */}
      <header className={`flex pb-4 border-b ${border}`}>
        <h1 className="text-3xl font-extrabold">
          Analytics Dashboard
        </h1>
      </header>

      {/* Filter Bar */}
      <div className={`flex gap-4 flex-wrap items-center ${bgCard} p-4 rounded-xl shadow-inner border ${border}`}>
        <span className={`font-semibold ${textSecondary} mr-2`}>Data Filters:</span>
        <CustomSelect 
            onValueChange={setGradeFilter} 
            defaultValue="9"
            options={gradeOptions}
            placeholder="Select Grade"
            theme={theme}
        />
        <CustomSelect 
            onValueChange={setSubjectFilter} 
            defaultValue="all"
            options={subjectOptions}
            placeholder="Select Subject"
            theme={theme}
        />
      </div>

      {/* Summary Insights (Key Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card theme={theme}>
          <CardContent className="p-5" theme={theme}>
            <h3 className={`text-sm font-medium ${textSecondary}`}>Average Class Score</h3>
            <p className="text-4xl font-extrabold text-blue-500 mt-2">
              {data?.averageScore !== null ? `${data.averageScore}%` : "--"}
            </p>
          </CardContent>
        </Card>

        <Card theme={theme}>
          <CardContent className="p-5" theme={theme}>
            <h3 className={`text-sm font-medium ${textSecondary}`}>Positive Emotion Ratio</h3>
            <p className="text-4xl font-extrabold text-emerald-500 mt-2">
              {data?.positiveEmotionRatio !== null ? `${data.positiveEmotionRatio}%` : "--"}
            </p>
          </CardContent>
        </Card>

        <Card theme={theme}>
          <CardContent className="p-5" theme={theme}>
            <h3 className={`text-sm font-medium ${textSecondary}`}>High-Risk Students</h3>
            <p className="text-4xl font-extrabold text-red-500 mt-2">
              {data?.highRiskPercentage !== null ? `${data.highRiskPercentage}%` : "--"}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Trend Chart */}
      <Card theme={theme}>
        <CardContent theme={theme}>
          <h2 className="text-xl font-semibold mb-6">Weekly Performance Trend</h2>
          {data.studentPerformance?.length > 0 && (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={data.studentPerformance} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartStrokeColor} />
                <XAxis dataKey="week" stroke={axisColor} />
                <YAxis domain={[70, 100]} stroke={axisColor} />
                <Tooltip 
                  contentStyle={{ 
                      backgroundColor: theme === 'dark' ? '#1f2937' : '#fff', 
                      border: '1px solid #4b5563', 
                      borderRadius: '8px', 
                      color: axisColor
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="averageScore" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ r: 5, fill: '#3b82f6' }} 
                  activeDot={{ r: 8, strokeWidth: 2 }} 
                />
              </LineChart>
          </ResponsiveContainer>
          )}
          {data.studentPerformance?.length < 0 &&(
            <p>
               Weekly performance trend not available yet 
            </p>
          )}
        </CardContent>
      </Card>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emotional Distribution */}
        <Card theme={theme} className="mb-8">
          <CardContent theme={theme}>
            <h2 className="text-xl font-semibold mb-6">Emotional State Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.emotionalDistribution}
                  dataKey="value"
                  nameKey="mood"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={3}
                  labelLine={false}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {data.emotionalDistribution && data.emotionalDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend 
                    layout="vertical" 
                    align="right" 
                    verticalAlign="middle" 
                    wrapperStyle={{ color: axisColor }}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Behavioral Risks */}
        <Card theme={theme} className="mb-8">
          <CardContent theme={theme}>
            <h2 className="text-xl font-semibold mb-6">Behavioral Risk Analysis</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.behaviorRisks}
                  dataKey="value"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={3}
                  labelLine={false}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {data.behaviorRisks && data.behaviorRisks.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend 
                    layout="vertical" 
                    align="right" 
                    verticalAlign="middle" 
                    wrapperStyle={{ color: axisColor }}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}