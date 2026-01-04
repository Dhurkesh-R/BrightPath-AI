import React, { useEffect, useState } from "react";
import {
  Lightbulb,
  BookOpen,
  Palette,
  Dumbbell,
  HeartPulse,
  AlertTriangle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

import { useTheme, getThemeClasses } from "../contexts/ThemeContext";
import { fetchParentRecommendations } from "../services/api";

/* -------------------- ICON MAP -------------------- */

const TYPE_ICON = {
  academic: <BookOpen className="w-5 h-5 text-blue-400" />,
  creative: <Palette className="w-5 h-5 text-pink-400" />,
  sports: <Dumbbell className="w-5 h-5 text-green-400" />,
  wellbeing: <HeartPulse className="w-5 h-5 text-red-400" />,
};

const PRIORITY_STYLE = {
  high: "bg-red-500/20 text-red-400 border-red-500/30",
  medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  low: "bg-green-500/20 text-green-400 border-green-500/30",
};

/* -------------------- COMPONENT -------------------- */

export default function ParentRecommendations() {
  const { theme } = useTheme();
  const {
    bg,
    text,
    cardBg,
    border,
    textSecondary,
  } = getThemeClasses(theme);

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  /* -------------------- DATA -------------------- */

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      const res = await fetchParentRecommendations();
      setSummary(res.summary);
      setRecommendations(res.recommendations || []);
    } catch (err) {
      console.error("Failed to load recommendations", err);
      setSummary(null);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  /* -------------------- LOADING -------------------- */

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${bg} w-full ml-14`}>
        <p className={`${textSecondary} animate-pulse`}>
          Generating personalized recommendations…
        </p>
      </div>
    );
  }

  /* -------------------- EMPTY -------------------- */

  if (!recommendations.length) {
    return (
      <div className={`min-h-screen ${bg} ${text} p-6 ml-14 w-full`}>
        <Card className={`${cardBg} ${border}`} theme={theme}>
          <CardContent className="py-10 text-center" theme={theme}>
            <Lightbulb className="w-10 h-10 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold">
              Everything looks balanced 🎉
            </p>
            <p className={`${textSecondary} mt-2`}>
              No major concerns detected at the moment. Keep encouraging healthy routines.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  /* -------------------- RENDER -------------------- */

  return (
    <div className={`min-h-screen ${bg} ${text} p-6 ml-14 w-full`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold mb-1">
          Recommendations
        </h1>
        <p className={`${textSecondary}`}>
          Personalized guidance based on your child’s recent activity and progress.
        </p>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <SummaryCard title="Academic" value={summary.academic} theme={theme} />
          <SummaryCard title="Creative" value={summary.creative} theme={theme} />
          <SummaryCard title="Sports" value={summary.sports} theme={theme} />
        </div>
      )}

      {/* Recommendations */}
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {recommendations.map((r, idx) => (
          <Card
            key={idx}
            className={`${cardBg} ${border} relative`}
            theme={theme}
          >
            <CardHeader className="flex flex-row items-start gap-3" theme={theme}>
              {TYPE_ICON[r.type] || <AlertTriangle />}
              <div className="flex-1">
                <CardTitle className="text-base">
                  {r.title}
                </CardTitle>
                <Badge
                  className={`mt-2 ${PRIORITY_STYLE[r.priority]}`}
                  variant="outline"
                >
                  {r.priority.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>

            <CardContent theme={theme}>
              <p className={`${textSecondary} text-sm mb-3`}>
                {r.reason}
              </p>

              <div className="p-3 rounded-md bg-black/20 border border-white/10 mb-4">
                <p className="text-sm font-medium">
                  Suggested Action
                </p>
                <p className="text-sm mt-1">
                  {r.action}
                </p>
              </div>

              <div className="flex items-center justify-between text-xs opacity-70">
                <span>Confidence</span>
                <span>{Math.round(r.confidence * 100)}%</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* -------------------- SUMMARY CARD -------------------- */

function SummaryCard({ title, value, theme }) {
  return (
    <Card theme={theme} className="p-4">
      <p className="text-xs uppercase opacity-60">{title}</p>
      <p className="text-2xl font-bold mt-1">
        {Math.round(value)}%
      </p>
    </Card>
  );
}
