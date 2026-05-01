import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Menu, X } from "lucide-react";

// Components
import Login from "./components/Login";
import VerificationGuard from "./components/VerificationGuard";
import Register from "./components/Register";
import Chatbot from "./pages/Chatbot";
import PrivateRoute from "./components/PrivateRoute";
import Sidebar from "./components/SideBar";
import MoodCheck from "./components/MoodCheck";
import LoadingScreen from "./components/LoadingScreen";

// Contexts & Services
import { AuthProvider } from "./contexts/AuthContext";
import { useTheme } from "./contexts/ThemeContext";
import api from "./services/logout";

// Pages
import Dashboard from "./pages/Dashboard";
import Activities from "./studentPages/Activities";
import Goals from "./studentPages/Goals";
import Books from "./pages/Books";
import Quizzes from "./studentPages/Quizzes";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import TeacherDashboard from "./teacherPages/TeacherDashboard";
import Analytics from "./teacherPages/Analytics";
import Students from "./teacherPages/Students";
import StudentProfile from "./teacherPages/StudentProfile";
import TeacherInterventions from "./teacherPages/Interventions";
import TeacherAssignments from "./teacherPages/Assignments";
import TeacherMessages from "./teacherPages/TeacherMessages";
import ParentMessages from "./parentPages/ParentMessages";
import ParentReports from "./parentPages/Reports";
import ParentProgress from "./parentPages/Progress";
import ParentRecommendations from "./parentPages/Recommendations";
import ParentNotifications from "./parentPages/Notifications";
import AdminDashboard from "./adminPages/AdminDashboard"
import AdminStats from "./adminPages/AdminStats"
import ClassManager from "./adminPages/ClassManager"
import ClassDetails from "./adminPages/ClassDetails"
import StudentActivities from "./pages/StudentActivities"
import StudentGoals from "./pages/StudentGoals"
import AnnouncementManager from "./adminPages/AnnouncementManager"
import Announcements from "./pages/Announcements"

const App = () => {
    const { user } = useAuth(); 
    const { theme } = useTheme();
    const role = user?.role;
    
    const [moodCompleted, setMoodCompleted] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Move your LayoutWrapper inside here or keep it as a sub-component
    const LayoutWrapper = ({ children }) => (
        <div className="flex h-screen relative overflow-hidden">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="md:hidden fixed top-4 left-4 z-[100] ...">
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <main className="flex-1 h-screen overflow-auto relative">
                {children}
                {!moodCompleted && <MoodCheck onComplete={() => setMoodCompleted(true)} />}
            </main>
        </div>
    );

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login theme={theme} />} />
            <Route path="/register" element={<Register />} />

            {/* Private Routes */}
            <Route path="/" element={<PrivateRoute><LayoutWrapper>{role === "admin" ? <AdminDashboard /> : <Chatbot />}</LayoutWrapper></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><LayoutWrapper>{role === "teacher" ? <TeacherDashboard /> : <Dashboard />}</LayoutWrapper></PrivateRoute>} />
            {/* ... rest of your routes ... */}
            <Route path="/announcements" element={<PrivateRoute><LayoutWrapper>{role === "admin" ? <AnnouncementManager /> : <Announcements />}</LayoutWrapper></PrivateRoute>} />
        </Routes>
    );
};

const App = () => {
    const [isAwake, setIsAwake] = useState(false);

    useEffect(() => {
        const wakeUpServer = async () => {
            try {
                await api.get('/health');
                setIsAwake(true);
            } catch (error) {
                setTimeout(wakeUpServer, 5000);
            }
        };
        wakeUpServer();
    }, []);

    if (!isAwake) return <LoadingScreen />;

    return (
        <Router>
            <AuthProvider> {/* Provider is at the top */}
                <VerificationGuard>
                    <AppContent /> {/* AppContent can now use useAuth() */}
                </VerificationGuard>
            </AuthProvider>
        </Router>
    );
};

export default App;
