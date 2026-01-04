import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  TrendingUp,
  ClipboardList,
  Target,
  Activity,
  Smile,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useTheme, getThemeClasses } from "../contexts/ThemeContext";
import { getParentReport } from "../services/api";

export default function ParentReports() {
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
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({
    academics: true,
    assignments: true,
    goals: true,
    activity_percent: true,
    activities: true,
    mood: true,
  });

  /* ---------------- FETCH ---------------- */

  const loadReport = async () => {
    setLoading(true);
    try {
      const data = await getParentReport(period);
      setReport(data);
    } catch (err) {
      console.error("Failed to load report", err);
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [period]);

  const activityStats = useMemo(() => {
    if (!report?.activities?.length) {
      return { totalTime: 0, count: 0, longest: null, recent: null };
    }

  const totalTime = report.activities.reduce((s, a) => s + a.timeSpent, 0);
    const longest = [...report.activities].sort((a, b) => b.timeSpent - a.timeSpent)[0];
    const recent = report.activities[0];

  return { totalTime, count: report.activities.length, longest, recent };
  }, [report]);

  /* ---------------- HELPERS ---------------- */

  const toggle = (key) =>
    setExpanded((p) => ({ ...p, [key]: !p[key] }));

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${bg} w-full ml-14`}>
        <Loader2 className="animate-spin w-6 h-6 text-blue-500" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className={`p-6 ${bg} ${text} w-full ml-14`}>
        Failed to load report.
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${text} p-6 w-full ml-14`}>
      {/* ---------- HEADER ---------- */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-indigo-400" />
          <h1 className="text-3xl font-extrabold">Child Report</h1>
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

      {/* ---------- SUMMARY ---------- */}
      {report.summary && (
        <Card className={`${cardBg} ${border} mb-6`} theme={theme}>
          <CardContent theme={theme}>
            <p className="italic text-sm">{report.summary}</p>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-2 gap-6 items-start">
        {/* ---------- ACADEMICS ---------- */}
        <Section
          title="Academic Performance"
          icon={<TrendingUp />}
          open={expanded.academics}
          onToggle={() => toggle("academics")}
          theme={theme}
        >
          <p className="text-sm mb-3">
            Average Score:{" "}
            <span className="font-bold">
              {report.academics.averageScore}%
            </span>
          </p>

          <div className="grid grid-cols-2 gap-3">
            {report.academics.subjects.map((s) => (
              <StatCard
                key={s.topic}
                label={s.topic}
                value={`${s.accuracy}%`}
                theme={theme}
              />
            ))}
          </div>
        </Section>
        {/* ---------- ACTIVITIES ---------- */}
        <Section
          title="Activity Stats"
          icon={<Activity />}
          open={expanded.activities}
          onToggle={() => toggle("activities")}
          theme={theme}
        >
          <div className="grid grid-cols-2 gap-3 text-sm">
            {Object.entries(report.activity_percent).map(([k, v]) => (
              <StatCard key={k} label={k} value={`${v}%`} theme={theme}/>
            ))}
            <StatCard label="Recent" value={activityStats.recent?.title || "—"} theme={theme}/>
            <StatCard label="Longest" value={activityStats.longest?.title || "—"} theme={theme}/>
            <StatCard label="Count" value={activityStats.count} theme={theme}/>
            <StatCard label="Total Time" value={`${activityStats.totalTime} mins`} theme={theme}/>
          </div>
        </Section>

        {/* ---------- ASSIGNMENTS ---------- */}
        <Section
          title="Assignments"
          icon={<ClipboardList />}
          open={expanded.assignments}
          onToggle={() => toggle("assignments")}
          theme={theme}
        >
          <div className="flex gap-6 text-sm">
            <Stat label="Total" value={report.academics.assignments.total} />
            <Stat label="Completed" value={report.academics.assignments.completed} />
            <Stat label="Pending" value={report.academics.assignments.pending} />
            <Stat label="Overdue" value={report.academics.assignments.overdue} />
          </div>
        </Section>

        {/* ---------- GOALS ---------- */}
        <Section
          title="Goals Progress"
          icon={<Target />}
          open={expanded.goals}
          onToggle={() => toggle("goals")}
          theme={theme}
        >
          <div className="flex gap-6 text-sm">
            <Stat label="Total" value={report.goals.total} />
            <Stat label="Completed" value={report.goals.completed} />
            <Stat label="Pending" value={report.goals.pending} />
            <Stat label="Overdue" value={report.goals.overdue} />
          </div>
        </Section>


        {/* ---------- MOOD ---------- */}
        <Section
          title="Mood & Well-being"
          icon={<Smile />}
          open={expanded.mood}
          onToggle={() => toggle("mood")}
          theme={theme}
        >
          <p className="text-sm">
            Risk Level:{" "}
            <span className="font-semibold capitalize">
              {report.mood.riskLevel}
            </span>
          </p>
        </Section>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function Section({ title, icon, open, onToggle, children, theme }) {
  return (
    // 'layout' helps the Card animate its own size change
    // 'h-fit' ensures the card doesn't try to fill the grid cell height
    <motion.div layout> 
      <Card className="mb-5 h-fit overflow-hidden border-none shadow-none" theme={theme}>
        <CardHeader
          className="flex flex-row justify-between items-center cursor-pointer select-none"
          onClick={onToggle}
        >
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle>{title}</CardTitle>
          </div>
          {/* Simple rotation animation for the icon */}
          <motion.div animate={{ rotate: open ? 0 : 180 }}>
            <ChevronUp />
          </motion.div>
        </CardHeader>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="content" // Crucial for AnimatePresence
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              style={{ overflow: "hidden" }} // Force hidden here
            >
              <CardContent theme={theme}>
                {children}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs opacity-60">{label}</p>
      <p className="font-bold">{value}</p>
    </div>
  );
}

function StatCard({ label, value, theme }) {
  return (
    <Card className="p-3" theme={theme}>
      <p className="text-xs opacity-60 capitalize">{label}</p>
      <p className="font-bold">{value}</p>
    </Card>
  );
}
