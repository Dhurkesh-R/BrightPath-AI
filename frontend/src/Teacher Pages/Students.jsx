import React, { useState, useEffect } from "react";
import { Users, Search, Filter, GraduationCap } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Dialog } from "../ui/dialog";
import { fetchStudents } from "../services/api";

export default function Students() {
  // Use the local mock theme hook
  const { theme, setTheme, bg, text, border, primary, textSecondary, bgCard } = useTheme();

  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [gradeFilter, setGradeFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchStudents({
      grade: gradeFilter,
      section: sectionFilter,
      search
    }).then(setStudents);
  }, [gradeFilter, sectionFilter, search]);
  
  

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
    <div className={`p-6 min-h-screen ${bg} ${text} transition-colors duration-500 w-full`}>
      
      {/* Header */}
      <header className={`flex items-center pb-6 mb-6 border-b ${border}`}>
        <div className="flex items-center">
          {/* Using primary variable here (will render text-blue-500) */}
          <Users className={`w-8 h-8 text-${primary}-500`} /> 
          <h1 className="text-3xl font-extrabold pl-3">Students Directory</h1>
        </div>
      </header>


      {/* Filter and Search Section */}
      <Card className={`mb-8 p-6 shadow-lg ${bgCard} ${border}`} theme={theme}>
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
            theme={theme}
          />

          {/* Grade Select */}
          <Select value={gradeFilter} onValueChange={setGradeFilter} theme={theme}>
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
          <Select value={sectionFilter} onValueChange={setSectionFilter} theme={theme}>
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
            theme={theme}
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
              theme={theme}
            >
              <CardContent className="p-5 flex items-start gap-4 cursor-pointer" theme={theme}>
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