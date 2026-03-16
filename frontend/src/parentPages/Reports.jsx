import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, TrendingUp, ClipboardList, Target, Activity,
  Smile, ChevronUp, Loader2, Award, Clock, Calendar
} from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useTheme, getThemeClasses } from "../contexts/ThemeContext";
import { getParentReport } from "../services/api";

export default function ParentReports() {
  const { theme } = useTheme();
  const { bg, text, cardBg, border, textSecondary, buttonPrimary } = getThemeClasses(theme);

  const [period, setPeriod] = useState("weekly");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({
    academics: true,
    assignments: true,
    goals: true,
    activity: true,
    mood: true,
  });

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

  useEffect(() => { loadReport(); }, [period]);

  const activityStats = useMemo(() => {
    if (!report?.activities?.length) return { totalTime: 0, count: 0, longest: null, recent: null };
    const totalTime = report.activities.reduce((s, a) => s + a.timeSpent, 0);
    const longest = [...report.activities].sort((a, b) => b.timeSpent - a.timeSpent)[0];
    const recent = report.activities[0];
    return { totalTime, count: report.activities.length, longest, recent };
  }, [report]);

  const toggle = (key) => setExpanded((p) => ({ ...p, [key]: !p[key] }));

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${bg} w-full ml-14`}>
        <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
      </div>
    );
  }

  if (!report) return <div className={`p-6 ${bg} ${text} w-full ml-14`}>Failed to load report.</div>;

  return (
    <div className={`min-h-screen ${bg} ${text} p-6 md:p-10 w-[calc(100%-3.5rem)] w-full md:ml-16`}>
      {/* ---------- HEADER ---------- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-12 h-10 md:hidden" />
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <FileText className="w-6 h-6 text-indigo-500" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Parental Insights</h1>
          </div>
          <p className={`${textSecondary} text-sm font-medium flex items-center gap-2`}>
            <Calendar className="w-4 h-4" /> Performance Review for {period === 'weekly' ? 'Last 7 Days' : 'Last 30 Days'}
          </p>
        </div>

        <div className={`flex p-1 rounded-xl border ${border} ${cardBg} shadow-sm`}>
          {["weekly", "monthly"].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                period === p ? `${buttonPrimary} shadow-md` : `hover:${textSecondary}`
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* ---------- TOP INSIGHT ---------- */}
      {report.summary && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`${cardBg} border-l-4 border-l-indigo-500 shadow-sm mb-8`} theme={theme}>
            <CardContent className="py-4">
              <div className="flex gap-4 items-center">
                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-500">
                  <Award className="w-6 h-6" />
                </div>
                <p className="italic text-sm leading-relaxed opacity-90">"{report.summary}"</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ---------- MAIN BENTO GRID ---------- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ACADEMICS (Span 8) */}
        <div className="lg:col-span-8 space-y-6">
          <Section
            title="Academic Mastery"
            icon={<TrendingUp className="text-emerald-500" />}
            open={expanded.academics}
            onToggle={() => toggle("academics")}
            theme={theme}
          >
            <div className="flex items-end gap-4 mb-6">
              <div className="text-5xl font-black text-emerald-500">{report.academics.averageScore}%</div>
              <div className="mb-2 font-bold opacity-60">Global Accuracy</div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {report.academics.subjects.map((s) => (
                <div key={s.topic} className={`p-4 rounded-xl border ${border} bg-black/5`}>
                  <div className="flex justify-between mb-2 font-bold text-sm">
                    <span>{s.topic}</span>
                    <span>{s.accuracy}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${s.accuracy}%` }}
                      className="h-full bg-emerald-500" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ACTIVITY TRACKER */}
          <Section
            title="Learning Engagement"
            icon={<Activity className="text-orange-500" />}
            open={expanded.activity}
            onToggle={() => toggle("activity")}
            theme={theme}
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <QuickStat label="Total Focus" value={`${activityStats.totalTime}m`} icon={<Clock />} theme={theme} />
              <QuickStat label="Sessions" value={activityStats.count} icon={<Activity />} theme={theme} />
              <QuickStat label="Most Recent" value={activityStats.recent?.title || "—"} icon={<Calendar />} theme={theme} />
              <QuickStat label="Longest Focus" value={`${activityStats.longest?.timeSpent}m`} icon={<TrendingUp />} theme={theme} />
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(report.activity_percent).map(([k, v]) => (
                <span key={k} className="px-3 py-1 bg-orange-500/10 text-orange-500 rounded-full text-xs font-bold uppercase tracking-wider">
                  {k}: {v}%
                </span>
              ))}
            </div>
          </Section>
        </div>

        {/* SIDEBAR (Span 4) */}
        <div className="lg:col-span-4 space-y-6">
          {/* ASSIGNMENTS */}
          <Section
            title="Workload"
            icon={<ClipboardList className="text-blue-500" />}
            open={expanded.assignments}
            onToggle={() => toggle("assignments")}
            theme={theme}
          >
            <div className="space-y-4">
               <ProgressCircle 
                label="Completed" 
                value={report.academics.assignments.completed} 
                total={report.academics.assignments.total} 
                color="bg-blue-500"
               />
               <div className="grid grid-cols-2 gap-2 mt-4">
                 <div className="p-3 bg-yellow-500/10 rounded-lg text-center">
                   <div className="text-xl font-bold text-yellow-500">{report.academics.assignments.pending}</div>
                   <div className="text-[10px] uppercase font-bold opacity-60">Pending</div>
                 </div>
                 <div className="p-3 bg-red-500/10 rounded-lg text-center">
                   <div className="text-xl font-bold text-red-500">{report.academics.assignments.overdue}</div>
                   <div className="text-[10px] uppercase font-bold opacity-60">Overdue</div>
                 </div>
               </div>
            </div>
          </Section>

          {/* MOOD & WELLBEING */}
          <Section
            title="Well-being"
            icon={<Smile className="text-pink-500" />}
            open={expanded.mood}
            onToggle={() => toggle("mood")}
            theme={theme}
          >
            <div className={`p-4 rounded-xl text-center border-2 ${
              report.mood.riskLevel === 'low' ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'
            }`}>
              <div className="text-xs font-bold uppercase tracking-widest opacity-60 mb-1">Current Risk Status</div>
              <div className={`text-2xl font-black capitalize ${
                report.mood.riskLevel === 'low' ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {report.mood.riskLevel} Risk
              </div>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

/* ================= REUSABLE UI COMPONENTS ================= */

function Section({ title, icon, open, onToggle, children, theme }) {
  const { cardBg, border } = getThemeClasses(theme);
  return (
    <motion.div layout className="w-full">
      <Card className={`${cardBg} ${border} shadow-sm overflow-hidden`} theme={theme}>
        <CardHeader
          className="flex flex-row justify-between items-center p-5 cursor-pointer hover:bg-black/5 transition-colors"
          onClick={onToggle}
        >
          <div className="flex items-center gap-3">
            <span className="p-2 bg-white/5 rounded-lg">{icon}</span>
            <CardTitle className="text-lg font-bold tracking-tight">{title}</CardTitle>
          </div>
          <motion.div animate={{ rotate: open ? 0 : 180 }} transition={{ type: "spring", stiffness: 300 }}>
            <ChevronUp className="w-5 h-5 opacity-50" />
          </motion.div>
        </CardHeader>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CardContent className="p-5 pt-0 border-t border-white/5">
                <div className="mt-4">{children}</div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

function QuickStat({ label, value, icon, theme }) {
  return (
    <div className="flex flex-col">
      <div className="text-[10px] uppercase font-bold opacity-50 mb-1 flex items-center gap-1">
        {React.cloneElement(icon, { size: 12 })} {label}
      </div>
      <div className="text-lg font-bold truncate">{value}</div>
    </div>
  );
}

function ProgressCircle({ label, value, total, color }) {
  const percent = Math.round((value / total) * 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-bold">
        <span className="opacity-60 uppercase">{label}</span>
        <span>{value} / {total}</span>
      </div>
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }} 
          animate={{ width: `${percent}%` }} 
          className={`h-full ${color} shadow-[0_0_10px_rgba(0,0,0,0.1)]`} 
        />
      </div>
    </div>
  );
}
