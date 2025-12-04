import { MessageCircle, Settings, LayoutDashboard, Activity, Goal, BookOpen, Book, User } from "lucide-react";
import { useTheme, getThemeClasses } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";

// Define the menu items
const topMenu = [
  { name: "Chat", icon: MessageCircle, path: "/" },
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Activities", icon: Activity, path: "/activities" },
  { name: "Goals", icon: Goal, path: "/goals" },
  { name: "Quizzes", icon: BookOpen, path: "/quizzes" },
  { name: "Books", icon: Book, path: "/books" },
];

const bottomMenu = [
    { name: "Settings", icon: Settings, path: "/settings" },
    { name: "Profile", icon: User, path: "/profile" },
];

// Helper component for the Menu Items (to avoid repetition)
const MenuItem = ({ item }) => {
  const {theme, _, t} = useTheme();
  const { cardBg, hoverBg, text } = getThemeClasses(theme);
  const Icon = item.icon;
  const navigate = useNavigate();
  return (
    <div
      className="relative group flex items-center justify-center"
    >
      {/* Icon button */}
      <button className={`p-2 rounded-lg hover:${hoverBg} transition`} onClick={() => navigate(item.path)}>
        <Icon size={22} className={`${text}`} />
      </button>

      {/* Tooltip on hover */}
      <span className={`absolute left-14 px-2 py-1 ${cardBg} text-white text-sm rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap`}>
        {item.name}
      </span>
    </div>
  );
};

export default function Sidebar() {
  const {theme, _, t} = useTheme();
  const { barBg} = getThemeClasses(theme);
  return (
    <div className={`h-screen w-16 ${barBg} flex flex-col items-center py-4 justify-between`}>
      
      {/* Top Menu Section */}
      <div className="flex flex-col space-y-6">
        {topMenu.map((item, idx) => (
          <MenuItem key={idx} item={item} />
        ))}
      </div>

      {/* Bottom Menu Section */}
      <div className="flex flex-col space-y-6">
        {bottomMenu.map((item, idx) => (
          <MenuItem key={idx} item={item} />
        ))}
      </div>
    </div>
  );
}