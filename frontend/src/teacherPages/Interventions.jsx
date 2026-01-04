import React, { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { getInterventions } from "../services/api";
import { useTheme, getThemeClasses } from "../contexts/ThemeContext";

export default function TeacherInterventions() {
  const { theme } = useTheme();
  const { bg, text, border, bgCard, textSecondary } =
    getThemeClasses(theme);

  const [grade, setGrade] = useState("9");
  const [section, setSection] = useState("B");
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInterventions = async () => {
    setLoading(true);
    try {
      const res = await getInterventions(grade, section);
      setInterventions(res || []);
    } catch (err) {
      console.error("Failed to fetch interventions", err);
      setInterventions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInterventions();
  }, [grade, section]);

  return (
    <div className={`p-6 min-h-screen ${bg} ${text} w-full ml-14`}>
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Student Interventions</h1>
        <Button variant="outline" onClick={fetchInterventions}>
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </header>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <select
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${bg}`}
        >
          {[6, 7, 8, 9, 10, 11, 12].map((g) => (
            <option key={g} value={g}>
              Grade {g}
            </option>
          ))}
        </select>

        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className={`px-4 py-2 rounded-lg border ${bg}`}
        >
          {["A", "B", "C"].map((s) => (
            <option key={s} value={s}>
              Section {s}
            </option>
          ))}
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <p className={textSecondary}>Analyzing student risk profiles…</p>
      ) : interventions.length === 0 ? (
        <p className={textSecondary}>
          No students currently require intervention.
        </p>
      ) : (
        <div className="grid gap-4">
          {interventions.map((item, idx) => (
            <motion.div
              key={item.studentId || idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className={`${bgCard} border ${border}`} theme={theme}>
                <CardContent className="p-5 space-y-3" theme={theme}>
                  <div className="flex items-center gap-2">
                    <AlertTriangle
                      size={18}
                      className={
                        item.riskLevel === "High"
                          ? "text-red-500"
                          : item.riskLevel === "Medium"
                          ? "text-yellow-500"
                          : "text-green-500"
                      }
                    />
                    <h3 className="font-semibold text-lg">
                      {item.studentName}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        item.riskLevel === "High"
                          ? "bg-red-600 text-white"
                          : item.riskLevel === "Medium"
                          ? "bg-yellow-500 text-black"
                          : "bg-green-600 text-white"
                      }`}
                    >
                      {item.riskLevel} Risk
                    </span>
                  </div>

                  {/* Reasons */}
                  {item.reasons && item.reasons.length > 0 && (
                    <ul className="list-disc ml-6 text-sm">
                      {item.reasons.map((r, i) => (
                        <li key={i} className={textSecondary}>
                          {r}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Intervention Text */}
                  <div className="text-sm leading-relaxed">
                    {item.intervention ||
                      "Encourage consistent study routines and offer additional support sessions."}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
