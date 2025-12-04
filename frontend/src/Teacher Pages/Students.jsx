import React, { useState, useEffect } from "react";
import { Users, Search, Filter, GraduationCap } from "lucide-react";

// ==============================================================================
// 1. THEME CONTEXT AND UTILITIES (Mocking external imports to ensure runnability)
// ==============================================================================

// Defines the theme-specific classes used throughout the components
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
        // Primary Color (Used as a string for Tailwind class construction, e.g., text-${primary}-500)
        primary: 'blue', 
        // Primary button styling
        primaryButton: isDark 
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md',
        // Outline button styling
        outlineButton: isDark
            ? 'border-gray-600 text-gray-100 hover:bg-gray-700'
            : 'border-gray-300 text-gray-700 hover:bg-gray-100',
    };
};

// Mimics the useTheme hook by managing the theme state locally
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

    const themeClasses = getThemeClasses(theme);

    // Mimic the full context return structure
    return { 
        theme: theme, 
        setTheme: setTheme,
        getThemeClasses: getThemeClasses,
        t: (key) => key, // Mock translation function
        ...themeClasses,
    }; 
};

// Theme Toggle Component (Added as requested)
const ThemeToggle = ({ theme, setTheme }) => {
    const isDark = theme === 'dark';
    const Icon = isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
    ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
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

// ==============================================================================
// 2. MOCK SHADCN UI COMPONENTS (Replacing external component imports)
// ==============================================================================

const Card = ({ className, children }) => (
  <div className={`rounded-xl border transition-shadow ${className}`}>
    {children}
  </div>
);

const CardContent = ({ className, children }) => (
  <div className={`p-6 ${className || ''}`}>{children}</div>
);

const Button = ({ children, onClick, variant = "default", size = "default", className }) => {
    const { primaryButton, outlineButton } = useTheme(); 
    
    let baseClass = "px-4 py-2 rounded-lg font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900";
    
    if (variant === "outline") {
        baseClass += ` border ${outlineButton}`;
    } else { // default
        baseClass += ` ${primaryButton}`;
    }

    if (size === "sm") {
        baseClass = baseClass.replace('px-4 py-2', 'px-3 py-1.5 text-sm');
    }

    return (
        <button onClick={onClick} className={`${baseClass} ${className}`}>
            {children}
        </button>
    );
};

const Input = ({ type, placeholder, value, onChange, className, icon: Icon }) => {
    const { border, bgCard, text } = useTheme();

    return (
        <div className="relative flex items-center">
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                className={`flex h-10 w-full rounded-lg ${bgCard} ${text} ${border} border px-3 py-2 text-sm 
                            placeholder:text-gray-400 dark:placeholder:text-gray-500 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                            disabled:cursor-not-allowed disabled:opacity-50 transition-colors pl-10 ${className}`}
            />
            {Icon && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    {Icon}
                </div>
            )}
        </div>
    );
};

// Simplified Select Components (using standard HTML select)
const Select = ({ value, onValueChange, children }) => {
    const handleChange = (e) => onValueChange(e.target.value);
    // Since we can't use complex floating UI components, Select will just render its children with value/onChange attached.
    return <div className="inline-block">{children(value, handleChange)}</div>;
};

const SelectTrigger = ({ children, className }) => {
    // This is the container for the actual select element in the simplified model
    return <>{children}</>;
};

const SelectValue = ({ placeholder }) => <>{placeholder}</>;

const SelectContent = ({ children, className }) => {
    // In the simplified model, this is where we render the select options wrapper
    return <>{children}</>;
};

const SelectItem = ({ value, children }) => (
    <option key={value} value={value}>
        {children}
    </option>
);

// ==============================================================================
// 3. MAIN STUDENTS COMPONENT
// ==============================================================================

const mockStudents = [
  { id: 1, name: "Ravi Kumar", grade: "9", section: "A", performance: "Excellent", avatar: "RK" },
  { id: 2, name: "Priya Sharma", grade: "9", section: "B", performance: "Good", avatar: "PS" },
  { id: 3, name: "Arjun Patel", grade: "10", section: "A", performance: "Average", avatar: "AP" },
  { id: 4, name: "Meena Reddy", grade: "10", section: "B", performance: "Excellent", avatar: "MR" },
  { id: 5, name: "Suresh Menon", grade: "9", section: "A", performance: "Average", avatar: "SM" },
  { id: 6, name: "Geeta Singh", grade: "10", section: "A", performance: "Good", avatar: "GS" },
];

export default function Students() {
  // Use the local mock theme hook
  const { theme, setTheme, bg, text, border, primary, textSecondary, bgCard } = useTheme();

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [gradeFilter, setGradeFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setStudents(mockStudents);
    setFilteredStudents(mockStudents);
  }, []);

  useEffect(() => {
    let filtered = students;

    if (gradeFilter && gradeFilter !== "all") {
      filtered = filtered.filter((s) => s.grade === gradeFilter);
    }

    if (sectionFilter && sectionFilter !== "all") {
      filtered = filtered.filter((s) => s.section === sectionFilter);
    }

    if (search.trim()) {
      filtered = filtered.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredStudents(filtered);
  }, [gradeFilter, sectionFilter, search, students]);

  const grades = Array.from(new Set(students.map(s => s.grade))).sort();
  const sections = Array.from(new Set(students.map(s => s.section))).sort();

  const getPerformanceBadge = (performance) => {
    let colorClass = "";
    switch (performance) {
      case "Excellent":
        colorClass = "bg-green-500 text-white";
        break;
      case "Good":
        colorClass = "bg-blue-500 text-white";
        break;
      case "Average":
        colorClass = "bg-yellow-500 text-gray-800";
        break;
      default:
        colorClass = "bg-gray-200 text-gray-800";
    }
    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
        {performance}
      </span>
    );
  };

  return (
    // Apply main theme classes
    <div className={`p-6 min-h-screen ${bg} ${text} transition-colors duration-500`}>
      
      {/* Header */}
      <header className={`flex items-center justify-between pb-6 mb-6 border-b ${border}`}>
        <div className="flex items-center">
          {/* Using primary variable here (will render text-blue-500) */}
          <Users className={`w-8 h-8 text-${primary}-500`} /> 
          <h1 className="text-3xl font-extrabold pl-3">Students Directory</h1>
        </div>
        <div className="flex items-center gap-4">
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <Button onClick={() => console.log("Navigate to Add Student")}>
              <GraduationCap className="w-5 h-5 mr-2" /> Add New Student
            </Button>
        </div>
      </header>


      {/* Filter and Search Section */}
      <Card className={`mb-8 p-6 shadow-lg ${bgCard} ${border}`}>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Filter className={`w-5 h-5 mr-2 text-${primary}-500`} /> Filter Controls
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          
          <Input
            type="text"
            placeholder="Search student name..."
            className={`w-full sm:w-[250px]`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className={`${textSecondary} w-4 h-4`} />}
          />

          {/* Grade Select */}
          <Select value={gradeFilter} onValueChange={setGradeFilter}>
            {(currentValue, handleChange) => (
                <select
                    value={currentValue}
                    onChange={handleChange}
                    className={`h-10 px-3 py-2 rounded-lg text-sm appearance-none ${bgCard} border ${border} ${text} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-[150px] cursor-pointer`}
                >
                    <SelectContent>
                        <SelectItem value="all">All Grades</SelectItem> 
                        {grades.map(grade => (
                            <SelectItem key={grade} value={grade}>Grade {grade}</SelectItem>
                        ))}
                    </SelectContent>
                </select>
            )}
          </Select>

          {/* Section Select */}
          <Select value={sectionFilter} onValueChange={setSectionFilter}>
            {(currentValue, handleChange) => (
                <select
                    value={currentValue}
                    onChange={handleChange}
                    className={`h-10 px-3 py-2 rounded-lg text-sm appearance-none ${bgCard} border ${border} ${text} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-[150px] cursor-pointer`}
                >
                    <SelectContent>
                        <SelectItem value="all">All Sections</SelectItem>
                        {sections.map(section => (
                            <SelectItem key={section} value={section}>Section {section}</SelectItem>
                        ))}
                    </SelectContent>
                </select>
            )}
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => { setGradeFilter("all"); setSectionFilter("all"); setSearch(""); }}
            className={`w-full sm:w-auto ${border} ${textSecondary}`}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Student List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <Card
              key={student.id}
              className={`hover:shadow-xl transition-all border ${border} ${bgCard}`}
              onClick={() => console.log(`View profile for ${student.name}`)}
            >
              <CardContent className="p-5 flex items-start gap-4 cursor-pointer">
                {/* Avatar / Initial Circle */}
                <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-${primary}-100 text-${primary}-600 font-bold flex-shrink-0`}>
                  {student.avatar}
                </div>
                
                <div className="flex-grow">
                  <h2 className="text-lg font-bold mb-1">{student.name}</h2>
                  <p className={`text-sm ${textSecondary} mb-2`}>
                    <span className="font-semibold">ID:</span> {student.id} | <span className="font-semibold">Grade:</span> {student.grade}-{student.section}
                  </p>
                  
                  <div className="flex items-center justify-between mt-3">
                    {getPerformanceBadge(student.performance)}
                    <Button 
                      size="sm" 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click event
                        console.log(`View profile for ${student.name}`);
                      }}
                    >
                      View Profile
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className={`p-6 rounded-lg ${bgCard} border ${border} col-span-full`}>
            <p className="text-center text-lg font-medium">
              No students found matching the current filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}