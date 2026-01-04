import React, { useState, useEffect } from "react";
import { Users, Search, Filter } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem } from "../ui/select";
import { Input } from "../ui/input";
import { fetchStudents } from "../services/api";
import { useNavigate } from "react-router-dom";


export default function Students() {
  const { theme, bg, text, border, primary, textSecondary, bgCard } = useTheme();

  // ---- STATE ----
  const [students, setStudents] = useState([]);
  const [gradeFilter, setGradeFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();


  // ---- FETCH FROM BACKEND (single source of truth) ----
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);

        const response = await fetchStudents({
          grade: gradeFilter,
          section: sectionFilter,
          search
        });

        // IMPORTANT: backend returns { success, count, data }
        setStudents(response);
      } catch (err) {
        console.error("Failed to fetch students", err);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [gradeFilter, sectionFilter, search]);

  // ---- DYNAMIC FILTER OPTIONS (FROM DATA) ----
  const grades = Array.from(new Set(students.map(s => s.grade))).sort();
  const sections = Array.from(new Set(students.map(s => s.section))).sort();

  // ---- PERFORMANCE BADGE ----
  const getPerformanceBadge = (performance) => {
    const map = {
      Excellent: "bg-green-500 text-white",
      Good: "bg-blue-500 text-white",
      Average: "bg-yellow-500 text-gray-800"
    };

    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${map[performance] || "bg-gray-200 text-gray-800"}`}>
        {performance || "N/A"}
      </span>
    );
  };

  // ---- UI ----
  return (
    <div className={`p-6 min-h-screen ${bg} ${text} w-full ml-14`}>
      
      {/* Header */}
      <header className={`flex items-center pb-6 mb-6 border-b ${border}`}>
        <Users className={`w-8 h-8 text-${primary}-500`} />
        <h1 className="text-3xl font-extrabold pl-3">Students Directory</h1>
      </header>

      {/* Filters */}
      <Card className={`mb-8 p-6 ${bgCard} ${border}`} theme={theme}>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Filter className={`w-5 h-5 mr-2 text-${primary}-500`} />
          Filter Controls
        </h2>

        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Search student name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className={`${textSecondary} w-4 h-4`} />}
            theme={theme}
          />

          <Select value={gradeFilter} onValueChange={setGradeFilter} theme={theme}>
            {(value, onChange) => (
              <select value={value} onChange={onChange} className={`h-10 px-3 rounded-lg ${bgCard} border ${border}`}>
                <SelectContent>
                  <SelectItem value="all">All Grades</SelectItem>
                  {grades.map(g => (
                    <SelectItem key={g} value={g}>Grade {g}</SelectItem>
                  ))}
                </SelectContent>
              </select>
            )}
          </Select>

          <Select value={sectionFilter} onValueChange={setSectionFilter} theme={theme}>
            {(value, onChange) => (
              <select value={value} onChange={onChange} className={`h-10 px-3 rounded-lg ${bgCard} border ${border}`}>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sections.map(s => (
                    <SelectItem key={s} value={s}>Section {s}</SelectItem>
                  ))}
                </SelectContent>
              </select>
            )}
          </Select>

          <Button
            variant="outline"
            onClick={() => {
              setGradeFilter("all");
              setSectionFilter("all");
              setSearch("");
            }}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {/* Students Grid */}
      {loading ? (
        <p className="text-center text-lg">Loading students...</p>
      ) : students.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {students.map(student => (
            <Card key={student.id} className={`border ${border} ${bgCard}`} theme={theme} onClick={() => navigate(`/students/${student.id}`)}>
              <CardContent className="p-5 flex gap-4" theme={theme}>
                <div className={`w-12 h-12 rounded-full bg-${primary}-100 text-${primary}-600 flex items-center justify-center font-bold`}>
                  <img
                      src={student.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover rounded-full border-4 border-blue-400 shadow-xl transition-all duration-300 group-hover:scale-[1.02]"
                  />
                </div>

                <div className="flex-grow">
                  <h2 className="text-lg font-bold">{student.name}</h2>
                  <p className={`text-sm ${textSecondary}`}>
                    Grade {student.grade}-{student.section}
                  </p>

                  <div className="flex justify-between items-center mt-3">
                    {getPerformanceBadge(student.performance)}
                    <Button size="sm" onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/students/${student.id}`);
                    }}>View Profile</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className={`p-6 rounded-lg ${bgCard} border ${border}`}>
          <p className="text-center text-lg font-medium">
            No students found matching the current filters.
          </p>
        </div>
      )}
    </div>
  );
}
