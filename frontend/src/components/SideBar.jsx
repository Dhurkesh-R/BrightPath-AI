import React from "react";
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
  Bell
} from "lucide-react";
import { useTheme, getThemeClasses } from "../contexts/ThemeContext";
import { useNavigate, useLocation } from "react-router-dom";

// Safely parse user data
const getUserData = () => {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    return null;
  }
};

const user = getUserData();
const userRole = user?.role || "student";

const topMenu = userRole === "student" 
  ? [
      { name: "Chat", icon: MessageCircle, path: "/" },
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { name: "Activities", icon: Activity, path: "/activities" },
      { name: "Goals", icon: Goal, path: "/goals" },
      { name: "Quizzes", icon: BookOpen, path: "/quizzes" },
      { name: "Books", icon: Book, path: "/books" },
      { name: "Assignments", icon: School, path: "/assignments" },
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
    ] 
  : [
      { name: "Chat", icon: MessageCircle, path: "/" },
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { name: "Reports", icon: FileText, path: "/reports" },
      { name: "Progress", icon: TrendingUp, path: "/progress" },
      { name: "Recommendations", icon: Lightbulb, path: "/recommendations" },
      { name: "Notifications", icon: Bell, path: "/notifications" },
      { name: "Messages", icon: MessagesSquare, path: "/messages" },
    ];


const bottomMenu = userRole === "student" || userRole === "teacher"
  ? [
    { name: "Profile", icon: User, path: "/profile" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ] : [
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

/**
 * MenuItem Component
 * Fixes: 
 * 1. Z-index for tooltips to prevent overlapping issues
 * 2. Visual indicator for the active route
 * 3. Shadow and pointer-events for cleaner interactions
 */
const MenuItem = ({ item }) => {
  const { theme } = useTheme();
  const classes = getThemeClasses(theme);
  const Icon = item.icon;
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if the current item is the active route
  const isActive = location.pathname === item.path;

  return (
    <div className="relative group flex items-center justify-center w-full px-2">
      {/* Active Indicator (vertical bar) */}
      <div className={`absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />

      {/* Icon button */}
      <button 
        className={`p-2.5 rounded-xl transition-all duration-200 relative
          ${isActive 
            ? 'bg-indigo-600/10 text-indigo-600 shadow-sm' 
            : `${classes.hoverBg} ${classes.text} opacity-70 hover:opacity-100`
          }`} 
        onClick={() => navigate(item.path)}
      >
        <Icon size={22} className={isActive ? "text-indigo-600" : classes.text} />
      </button>

      {/* Tooltip 
          Fix: Added z-50 to stay on top, shadow for depth, 
          and pointer-events-none to prevent flickering.
      */}
      <span className={`
        absolute left-16 px-3 py-1.5 
        ${classes.cardBg} ${classes.text} 
        text-xs font-bold rounded-lg shadow-xl border ${classes.border}
        opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0
        transition-all duration-200 whitespace-nowrap z-[100] pointer-events-none
      `}>
        {item.name}
      </span>
    </div>
  );
};

export default function Sidebar() {
  const { theme } = useTheme();
  const { barBg, border } = getThemeClasses(theme);

  return (
    <aside 
      className={`h-screen w-16 ${barBg} flex flex-col items-center py-6 justify-between border-r ${border} fixed left-0 top-0 z-[60]`}
    >
      {/* Top Menu Section */}
      <div className="flex flex-col space-y-4 w-full">
        {topMenu.map((item, idx) => (
          <MenuItem key={`top-${idx}`} item={item} />
        ))}
      </div>

      {/* Bottom Menu Section */}
      <div className="flex flex-col space-y-4 w-full">
        {bottomMenu.map((item, idx) => (
          <MenuItem key={`bottom-${idx}`} item={item} />
        ))}
      </div>
    </aside>
  );
}