import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Menu, X } from "lucide-react";

// Components
import Login from "./components/Login";
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

const App = () => {
    const { theme } = useTheme();
    const [moodCompleted, setMoodCompleted] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isAwake, setIsAwake] = useState(false);

    const user = JSON.parse(localStorage.getItem("user"));
    const role = user?.role;

    // --- Server Wakeup Logic ---
    useEffect(() => {
        const wakeUpServer = async () => {
            try {
                await api.get('/health');
                setIsAwake(true);
            } catch (error) {
                if (error.response) {
                    setIsAwake(true);
                } else {
                    console.log("Server spinning up... retrying in 5s");
                    setTimeout(wakeUpServer, 5000);
                }
            }
        };
        wakeUpServer();
    }, []);

    // --- Layout Wrapper for Sidebar Logic ---
    const LayoutWrapper = ({ children }) => {
        return (
            <div className="flex h-screen relative overflow-hidden">
                {/* Mobile Hamburger Button */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="md:hidden fixed top-5 left-5 z-[100] p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>

                {/* Sidebar Component */}
                <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

                {/* Mobile Backdrop Overlay */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[55] md:hidden transition-opacity"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Main Content Area */}
                <main className="flex-1 h-screen overflow-auto relative">
                    {children}
                    
                    {/* Global MoodCheck Modal */}
                    {!moodCompleted && (
                        <MoodCheck onComplete={() => setMoodCompleted(true)} />
                    )}
                </main>
            </div>
        );
    };

    if (!isAwake) {
        return <LoadingScreen />;
    }

    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login theme={theme} />} />
                    <Route path="/register" element={<Register />} />

                    {/* Private Routes with Sidebar Layout */}
                    <Route path="/" element={<PrivateRoute><LayoutWrapper><Chatbot /></LayoutWrapper></PrivateRoute>} />
                    
                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <LayoutWrapper>
                                {role === "teacher" ? <TeacherDashboard /> : <Dashboard />}
                            </LayoutWrapper>
                        </PrivateRoute>
                    } />

                    <Route path="/activities" element={<PrivateRoute><LayoutWrapper><Activities /></LayoutWrapper></PrivateRoute>} />
                    <Route path="/goals" element={<PrivateRoute><LayoutWrapper><Goals /></LayoutWrapper></PrivateRoute>} />
                    <Route path="/books" element={<PrivateRoute><LayoutWrapper><Books /></LayoutWrapper></PrivateRoute>} />
                    <Route path="/quizzes" element={<PrivateRoute><LayoutWrapper><Quizzes /></LayoutWrapper></PrivateRoute>} />
                    <Route path="/profile" element={<PrivateRoute><LayoutWrapper><Profile /></LayoutWrapper></PrivateRoute>} />
                    <Route path="/settings" element={<PrivateRoute><LayoutWrapper><Settings /></LayoutWrapper></PrivateRoute>} />

                    {/* Teacher Specific Routes */}
                    <Route path="/analytics" element={<PrivateRoute><LayoutWrapper><Analytics /></LayoutWrapper></PrivateRoute>} />
                    <Route path="/students" element={<PrivateRoute><LayoutWrapper><Students /></LayoutWrapper></PrivateRoute>} />
                    <Route path="/students/:userId" element={<PrivateRoute><LayoutWrapper><StudentProfile /></LayoutWrapper></PrivateRoute>} />
                    <Route path="/interventions" element={<PrivateRoute><LayoutWrapper><TeacherInterventions /></LayoutWrapper></PrivateRoute>} />
                    <Route path="/assignments" element={<PrivateRoute><LayoutWrapper><TeacherAssignments /></LayoutWrapper></PrivateRoute>} />
                    
                    {/* Unified Messaging Route */}
                    <Route path="/messages" element={
                        <PrivateRoute>
                            <LayoutWrapper>
                                {role === "teacher" ? <TeacherMessages /> : <ParentMessages />}
                            </LayoutWrapper>
                        </PrivateRoute>
                    } />

                    {/* Parent Specific Routes */}
                    <Route path="/reports" element={<PrivateRoute><LayoutWrapper><ParentReports /></LayoutWrapper></PrivateRoute>} />
                    <Route path="/progress" element={<PrivateRoute><LayoutWrapper><ParentProgress /></LayoutWrapper></PrivateRoute>} />
                    <Route path="/recommendations" element={<PrivateRoute><LayoutWrapper><ParentRecommendations /></LayoutWrapper></PrivateRoute>} />
                    <Route path="/notifications" element={<PrivateRoute><LayoutWrapper><ParentNotifications /></LayoutWrapper></PrivateRoute>} />
                    
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default App;
