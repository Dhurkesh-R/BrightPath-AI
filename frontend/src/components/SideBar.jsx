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
  Bell,
  LayoutGrid
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
  : userRole === "parent"
  ? [
      { name: "Chat", icon: MessageCircle, path: "/" },
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
      { name: "Reports", icon: FileText, path: "/reports" },
      { name: "Progress", icon: TrendingUp, path: "/progress" },
      { name: "Recommendations", icon: Lightbulb, path: "/recommendations" },
      { name: "Notifications", icon: Bell, path: "/notifications" },
      { name: "Messages", icon: MessagesSquare, path: "/messages" },
    ]
  : [
    { name: "Dashboard", icon: LayoutDashboard, path: "/" },
    { name: "Stats", icon: ChartColumn, path: "/stats" },
    { name: "Classes", icon: LayoutGrid, path: "/classes" },
  ];


const bottomMenu = userRole === "student" || userRole === "teacher"
  ? [
    { name: "Profile", icon: User, path: "/profile" },
    { name: "Settings", icon: Settings, path: "/settings" },
  ] : [
    { name: "Settings", icon: Settings, path: "/settings" },
  ];

export default function Sidebar({ isOpen, setIsOpen }) {
  const { theme } = useTheme();
  const { barBg, border } = getThemeClasses(theme);
  const location = useLocation();

  return (
    <aside 
      className={`
        h-screen w-16 ${barBg} flex flex-col items-center py-6 justify-between border-r ${border} 
        fixed left-0 top-0 z-[60] transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0
      `}
    >
      {/* Top Menu Section */}
      <div className="flex flex-col space-y-4 w-full mt-12 md:mt-0">
        {topMenu.map((item, idx) => (
          <MenuItem 
            key={`top-${idx}`} 
            item={item} 
            closeSidebar={() => setIsOpen(false)} // Close on click for mobile
          />
        ))}
      </div>

      {/* Bottom Menu Section */}
      <div className="flex flex-col space-y-4 w-full">
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

const MenuItem = ({ item, closeSidebar }) => {
  const { theme } = useTheme();
  const classes = getThemeClasses(theme);
  const Icon = item.icon;
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === item.path;

  const handleClick = () => {
    navigate(item.path);
    if (window.innerWidth < 768) {
      closeSidebar(); // Auto-hide sidebar after navigation on mobile
    }
  };

  return (
    <div className="relative group flex items-center justify-center w-full px-2">
      <div className={`absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
      <button 
        className={`p-2.5 rounded-xl transition-all duration-200 relative
          ${isActive ? 'bg-indigo-600/10 text-indigo-600' : `${classes.hoverBg} ${classes.text} opacity-70`}`} 
        onClick={handleClick}
      >
        <Icon size={22} />
      </button>
      {/* Tooltip: Hidden on mobile to avoid clutter */}
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
