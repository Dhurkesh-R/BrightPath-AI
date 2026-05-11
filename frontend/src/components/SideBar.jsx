import React, { useState, useEffect } from "react";
import {
  MessageCircle,
  Settings,
  LayoutDashboard,
  Activity,
  Goal,
  BookOpen,
  Book,
  User,
  ChartColumn,
  Users,
  ShieldAlert,
  School,
  MessagesSquare,
  FileText,
  TrendingUp,
  Lightbulb,
  Bell,
  LayoutGrid,
  Megaphone,
} from "lucide-react";

import { useTheme, getThemeClasses } from "../contexts/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { fetchParentNotifications } from "../services/api";

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user } = useAuth();
  const userRole = user?.role || "student";

  /* ---------------- MENU ---------------- */

  const topMenu =
    userRole === "student"
      ? [
          { name: "Chat", icon: MessageCircle, path: "/" },
          { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
          { name: "Activities", icon: Activity, path: "/activities" },
          { name: "Goals", icon: Goal, path: "/goals" },
          { name: "Quizzes", icon: BookOpen, path: "/quizzes" },
          { name: "Books", icon: Book, path: "/books" },
          { name: "Assignments", icon: School, path: "/assignments" },
          { name: "Announcements", icon: Megaphone, path: "/announcements" },
        ]
      : userRole === "teacher"
      ? [
          { name: "Chat", icon: MessageCircle, path: "/" },
          { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
          { name: "Analytics", icon: ChartColumn, path: "/analytics" },
          { name: "Students", icon: Users, path: "/students" },
          { name: "Books", icon: Book, path: "/books" },
          { name: "Interventions", icon: ShieldAlert, path: "/interventions" },
          { name: "Assignments", icon: School, path: "/assignments" },
          { name: "Messages", icon: MessagesSquare, path: "/messages" },
          { name: "Announcements", icon: Megaphone, path: "/announcements" },
        ]
      : userRole === "parent"
      ? [
          { name: "Chat", icon: MessageCircle, path: "/" },
          { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
          { name: "Reports", icon: FileText, path: "/reports" },
          { name: "Progress", icon: TrendingUp, path: "/progress" },
          { name: "Recommendations", icon: Lightbulb, path: "/recommendations" },
          { name: "Notifications", icon: Bell, path: "/notifications" },
          { name: "Messages", icon: MessagesSquare, path: "/messages" },
          { name: "Announcements", icon: Megaphone, path: "/announcements" },
        ]
      : [
          { name: "Dashboard", icon: LayoutDashboard, path: "/" },
          { name: "Stats", icon: ChartColumn, path: "/stats" },
          { name: "Classes", icon: LayoutGrid, path: "/classes" },
          { name: "Announcements", icon: Megaphone, path: "/announcements" },
        ];

  const bottomMenu =
    userRole === "student" || userRole === "teacher"
      ? [
          { name: "Profile", icon: User, path: "/profile" },
          { name: "Settings", icon: Settings, path: "/settings" },
        ]
      : [{ name: "Settings", icon: Settings, path: "/settings" }];

  /* ---------------- THEME ---------------- */

  const { theme } = useTheme();
  const { barBg, border } = getThemeClasses(theme);

  const [unreadCount, setUnreadCount] = useState(0);

  /* ---------------- NOTIFICATIONS ---------------- */

  useEffect(() => {
    if (userRole === "parent") {
      const check = async () => {
        try {
          const data = await fetchParentNotifications();
          setUnreadCount(data.filter((n) => !n.read).length);
        } catch (e) {
          console.error(e);
        }
      };

      check();
      const interval = setInterval(check, 60000);
      return () => clearInterval(interval);
    }
  }, [userRole]);

  /* ---------------- AUTO FLEX SIZES ---------------- */

  const topCount = topMenu.length;

  const itemGap =
    topCount >= 9 ? "gap-2" :
    topCount >= 8 ? "gap-3" :
    "gap-4";

  const iconSize =
    topCount >= 9 ? 18 :
    topCount >= 8 ? 20 :
    22;

  const btnPadding =
    topCount >= 9 ? "p-2" :
    topCount >= 8 ? "p-2.5" :
    "p-3";

  return (
    <aside
      className={`
        h-screen w-16 ${barBg}
        fixed left-0 top-0 z-[60]
        border-r ${border}
        flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
      `}
    >
      {/* TOP SECTION */}
      <div className="flex-1 flex flex-col pt-4 pb-3 min-h-0">
        
        {/* Logo / Top Gap */}
        <div className="h-2 shrink-0" />
    
        {/* Menu Items */}
        <div className="flex-1 flex flex-col justify-start gap-2 px-1">
          {topMenu.map((item, idx) => (
            <MenuItem
              key={`top-${idx}`}
              item={item}
              unreadCount={unreadCount}
              closeSidebar={() => setIsOpen(false)}
              compact={topMenu.length > 8}
            />
          ))}
        </div>
      </div>
    
      {/* BOTTOM SECTION */}
      <div className="pb-4 pt-3 border-t border-white/5 flex flex-col gap-2 px-1 shrink-0">
        {bottomMenu.map((item, idx) => (
          <MenuItem
            key={`bottom-${idx}`}
            item={item}
            closeSidebar={() => setIsOpen(false)}
          />
        ))}
      </div>
    </aside>
  );
}

/* ---------------- MENU ITEM ---------------- */

const MenuItem = ({ item, unreadCount, closeSidebar, compact = false }) => {
  const { theme } = useTheme();
  const classes = getThemeClasses(theme);

  const Icon = item.icon;
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = location.pathname === item.path;

  const handleClick = () => {
    navigate(item.path);

    if (window.innerWidth < 768) {
      closeSidebar();
    }
  };

  return (
    <div className="relative group w-full flex justify-center">
      {/* ACTIVE BAR */}
      <div
        className={`
          absolute left-0 w-1 rounded-r-full bg-indigo-600
          transition-all duration-300
          ${isActive ? "opacity-100 h-6" : "opacity-0 h-4"}
        `}
      />

      {/* BUTTON */}
      <button
        onClick={handleClick}
        className={`
          ${compact ? "p-2" : "p-2.5"}
          rounded-xl transition-all duration-200 relative
          ${isActive
            ? "bg-indigo-600/10 text-indigo-600"
            : `${classes.hoverBg} ${classes.text} opacity-70`}
        `}
        >
        <Icon size={compact ? 18 : 22} />
      </button>

      {/* BADGE */}
      {item.path === "/notifications" && unreadCount > 0 && (
        <span className="absolute top-0 right-1 bg-red-500 text-white text-[10px] min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
          {unreadCount}
        </span>
      )}

      {/* TOOLTIP */}
      <span
        className={`
          hidden md:block
          absolute left-16
          px-3 py-1.5
          ${classes.cardBg} ${classes.text}
          border ${classes.border}
          rounded-lg shadow-xl
          text-xs font-bold whitespace-nowrap
          opacity-0 group-hover:opacity-100
          translate-x-[-10px] group-hover:translate-x-0
          transition-all duration-200
          pointer-events-none z-[100]
        `}
      >
        {item.name}
      </span>
    </div>
  );
};
