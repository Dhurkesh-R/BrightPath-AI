import React, { useEffect, useState } from "react";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

import {
  fetchParentNotifications,
  markNotificationRead
} from "../services/api";

import { useTheme, getThemeClasses } from "../contexts/ThemeContext.jsx";

/* -------------------- ICON MAP -------------------- */

const TYPE_ICONS = {
  academic: AlertTriangle,
  wellbeing: Info,
  goals: Clock,
  system: Bell
};

const SEVERITY_STYLES = {
  info: "border-blue-500/30",
  warning: "border-yellow-500/40",
  critical: "border-red-500/50"
};

/* -------------------- COMPONENT -------------------- */

export default function ParentNotifications() {
  const { theme } = useTheme();
  const {
    bg,
    text,
    cardBg,
    border,
    textSecondary,
    buttonPrimary
  } = getThemeClasses(theme);

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  /* -------------------- DATA -------------------- */

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchParentNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  /* -------------------- ACTIONS -------------------- */

  const markRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  /* -------------------- RENDER -------------------- */

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-screen ${bg} w-full ml-14`}>
        <p className={`${textSecondary} animate-pulse`}>
          Loading notifications…
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bg} ${text} p-6 w-full ml-14`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Bell className="w-8 h-8 text-indigo-400" />
        <h1 className="text-3xl font-extrabold">
          Notifications
        </h1>
      </div>

      {/* Empty State */}
      {notifications.length === 0 && (
        <p className={`${textSecondary} text-center mt-20`}>
          No notifications at the moment.
        </p>
      )}

      {/* List */}
      <div className="space-y-4">
        <AnimatePresence>
          {notifications.map((n) => {
            const Icon =
              TYPE_ICONS[n.type] || Bell;

            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Card
                  className={`
                    ${cardBg}
                    ${border}
                    ${SEVERITY_STYLES[n.severity]}
                    ${n.read ? "opacity-70" : ""}
                  `}
                  theme={theme}
                >
                  <CardHeader className="flex flex-row items-center gap-3">
                    <Icon className="w-5 h-5 text-indigo-400" />
                    <CardTitle className="flex-1">
                      {n.title}
                    </CardTitle>

                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    )}
                  </CardHeader>

                  <CardContent theme={theme}>
                    <p className={`${textSecondary} text-sm mb-3`}>
                      {n.message}
                    </p>

                    <div className="flex justify-between items-center text-xs">
                      <span className="opacity-60">
                        {new Date(n.created_at).toLocaleString()}
                      </span>

                      {!n.read && (
                        <Button
                          size="sm"
                          className={buttonPrimary}
                          onClick={() => markRead(n.id)}
                        >
                          Mark as read
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
