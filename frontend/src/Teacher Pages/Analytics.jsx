import React, { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";

// ==============================================================================
// 1. THEME CONTEXT AND UTILITIES (Mocking external imports to ensure runnability)
// ==============================================================================

/** Mimics getThemeClasses(theme) from ThemeContext */
const getThemeClasses = (theme) => {
    const isDark = theme === 'dark';
    return {
        theme,
        // Background and Text
        bg: isDark ? 'bg-gray-900' : 'bg-gray-50',
        text: isDark ? 'text-gray-100' : 'text-gray-900',
        textSecondary: isDark ? 'text-gray-400' : 'text-gray-500',
        // Card Background
        bgCard: isDark ? 'bg-gray-800' : 'bg-white',
        // Borders
        border: isDark ? 'border-gray-700' : 'border-gray-200',
        // Primary Color (Used as a string for Tailwind class construction)
        primary: 'blue', 
        // Primary button styling (if needed)
        primaryButton: isDark 
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md',
    };
};

/** Mimics the useTheme hook by managing the theme state locally */
const useTheme = () => {
    const [theme, setTheme] = useState('light');

    // Effect to apply the theme class to the root element for Tailwind dark mode
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    return { 
        theme: theme, 
        setTheme: setTheme,
        ...getThemeClasses(theme), // Destructures all class variables
    }; 
};

// Theme Toggle Component
const ThemeToggle = ({ theme, setTheme }) => {
    const isDark = theme === 'dark';
    const Icon = isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg> // Moon
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg> // Sun
    );

    const toggleTheme = () => {
        setTheme(isDark ? 'light' : 'dark');
    };

    return (
        <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-full transition-colors duration-300 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 shadow-md"
            aria-label="Toggle theme"
        >
            {Icon}
        </button>
    );
};

// 2. Minimal Card Component definition (Themed)
const Card = ({ className, children }) => {
    const { bgCard, border } = useTheme();
    return (
        <div className={`rounded-xl border ${border} ${bgCard} shadow-lg transition-all hover:shadow-xl ${className || ''}`}>
            {children}
        </div>
    );
};

// 3. Minimal CardContent Component definition
const CardContent = ({ className, children }) => (
  <div className={`p-6 ${className || ''}`}>{children}</div>
);

// 4. Custom Select component replacement
const CustomSelect = ({ onValueChange, defaultValue, options, placeholder, className = "w-[150px]" }) => {
    const { bgCard, border, text } = useTheme();
    const [localValue, setLocalValue] = useState(defaultValue);

    const handleChange = (e) => {
        const newValue = e.target.value;
        setLocalValue(newValue);
        if (onValueChange) {
            onValueChange(newValue);
        }
    };

    return (
        <div className="relative">
            <select
                onChange={handleChange}
                value={localValue}
                className={`appearance-none block h-10 px-4 py-2 border ${border} rounded-lg text-sm 
                            ${bgCard} ${text} cursor-pointer 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${className}`}
            >
                {placeholder && (
                    <option value="" disabled hidden>
                        {placeholder}
                    </option>
                )}
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <svg className="w-4 h-4 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
        </div>
    );
};

// ==============================================================================
// 5. MAIN ANALYTICS COMPONENT
// ==============================================================================

export default function Analytics() {
  // Use the local mock theme hook, which provides the theme variables
  const { theme, setTheme, bg, text, border, primary, textSecondary, bgCard } = useTheme(); 
  
  const [gradeFilter, setGradeFilter] = useState("9");
  const [subjectFilter, setSubjectFilter] = useState("all"); 
  const [data, setData] = useState({});

  useEffect(() => {
    // Mock backend data load based on filters
    const mockAnalytics = {
      studentPerformance: [
        { week: "Week 1", averageScore: 78 },
        { week: "Week 2", averageScore: 82 },
        { week: "Week 3", averageScore: 85 },
        { week: "Week 4", averageScore: 88 },
        { week: "Week 5", averageScore: 84 },
      ],
      emotionalTrend: [
        { mood: "Calm", value: 40 },
        { mood: "Focused", value: 30 },
        { mood: "Anxious", value: 15 },
        { mood: "Tired", value: 15 },
      ],
      behaviorRisks: [
        { type: "Distraction", value: 25 },
        { type: "Laziness", value: 15 },
        { type: "Low Participation", value: 10 },
        { type: "None", value: 50 },
      ],
    };

    setData(mockAnalytics);
  }, [gradeFilter, subjectFilter]);

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
    <div className={`p-6 space-y-8 min-h-screen transition-colors duration-500 ${bg} ${text} w-full`}>
      
      {/* Header and Theme Toggle */}
      <header className={`flex justify-between items-center pb-4 border-b ${border}`}>
        <h1 className="text-3xl font-extrabold">
          Analytics Dashboard
        </h1>
        {/* Pass theme and setTheme down to the toggle component */}
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </header>

      {/* Filter Bar */}
      <div className={`flex gap-4 flex-wrap items-center ${bgCard} p-4 rounded-xl shadow-inner border ${border}`}>
        <span className={`font-semibold ${textSecondary} mr-2`}>Data Filters:</span>
        <CustomSelect 
            onValueChange={setGradeFilter} 
            defaultValue="9"
            options={gradeOptions}
            placeholder="Select Grade"
        />
        <CustomSelect 
            onValueChange={setSubjectFilter} 
            defaultValue="all"
            options={subjectOptions}
            placeholder="Select Subject"
        />
      </div>

      {/* Summary Insights (Key Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-5">
            <h3 className={`text-sm font-medium ${textSecondary}`}>Average Class Score</h3>
            <p className="text-4xl font-extrabold text-blue-500 mt-2">84%</p>
            <p className="text-green-500 text-sm mt-1 flex items-center">
              <span className="text-lg mr-1">↑</span> Up 5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className={`text-sm font-medium ${textSecondary}`}>Positive Emotion Ratio</h3>
            <p className="text-4xl font-extrabold text-emerald-500 mt-2">70%</p>
            <p className={`text-sm mt-1 ${textSecondary}`}>
              Mostly calm/focused mood patterns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className={`text-sm font-medium ${textSecondary}`}>High-Risk Students</h3>
            <p className="text-4xl font-extrabold text-red-500 mt-2">12%</p>
            <p className={`text-sm mt-1 ${textSecondary}`}>
              Need personal intervention attention
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Performance Trend Chart */}
      <Card>
        <CardContent>
          <h2 className="text-xl font-semibold mb-6">Weekly Performance Trend</h2>
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
        </CardContent>
      </Card>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Emotional Distribution */}
        <Card>
          <CardContent>
            <h2 className="text-xl font-semibold mb-6">Emotional State Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.emotionalTrend}
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
                  {data.emotionalTrend && data.emotionalTrend.map((entry, index) => (
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
        <Card>
          <CardContent>
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