import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Chatbot from "./pages/Chatbot";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { useTheme } from "./contexts/ThemeContext";
import Sidebar from "./components/SideBar";
import MoodCheck from "./components/MoodCheck"; // 👈 Import our MoodCheck
import Dashboard from "./pages/Dashboard"
import Activities from "./studentPages/Activities";
import Goals from "./studentPages/Goals"
import Books from "./pages/Books"
import Quizzes from "./studentPages/Quizzes"
import Profile from "./pages/Profile"
import Settings from "./pages/Settings"
import TeacherDashboard from "./teacherPages/TeacherDashboard"
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
  const user = JSON.parse(localStorage.getItem("user"))
  const role = user?.role

  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login theme={theme} />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <div className="flex h-screen relative">
                  <Sidebar />
                  <Chatbot />

                  {/* MoodCheck modal overlays everything */}
                  {!moodCompleted && (
                    <MoodCheck onComplete={() => setMoodCompleted(true)} />
                  )}
                </div>
              </PrivateRoute>
            }
          />
          {role !== "teacher" && (
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <div className="flex h-screen relative">
                    <Sidebar />
                    <Dashboard />
                  </div>
                </PrivateRoute>
            }
            />
          )}
          {role === "teacher" && (
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <div className="flex h-screen relative">
                    <Sidebar />
                    <TeacherDashboard />
                  </div>
                </PrivateRoute>
            }
            />
          )}
          <Route
            path="/activities"
            element={
              <PrivateRoute>
                <div className="flex h-screen relative">
                  <Sidebar />
                  <Activities />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/goals"
            element={
              <PrivateRoute>
                <div className="flex h-screen relative">
                  <Sidebar />
                  <Goals />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/books"
            element={
              <PrivateRoute>
                <div className="flex h-screen relative">
                  <Sidebar />
                  <Books />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/quizzes"
            element={
              <PrivateRoute>
                <div className="flex h-screen relative">
                  <Sidebar />
                  <Quizzes />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <div className="flex h-screen relative">
                  <Sidebar />
                  <Profile />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <div className="flex h-screen relative">
                  <Sidebar />
                  <Settings />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <PrivateRoute>
                <div className="flex h-screen relative">
                  <Sidebar />
                  <Analytics />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/students"
            element={
              <PrivateRoute>
                <div className="flex h-screen relative">
                  <Sidebar />
                  <Students />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/students/:userId"
            element={
              <PrivateRoute>
                <div className="flex h-screen relative">
                  <Sidebar />
                  <StudentProfile />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/interventions"
            element={
              <PrivateRoute>
                <div className="flex h-screen relative">
                  <Sidebar />
                  <TeacherInterventions />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/assignments"
            element={
              <PrivateRoute>
                <div className="flex h-screen relative">
                  <Sidebar />
                  <TeacherAssignments />
                </div>
              </PrivateRoute>
            }
          />
          {role === "teacher" && (
            <Route
              path="/messages"
              element={
                <PrivateRoute>
                  <div className="flex h-screen relative">
                    <Sidebar />
                    <TeacherMessages />
                  </div>
                </PrivateRoute>
              }
            />
          )}
          {role === "parent" && (
            <Route
              path="/messages"
              element={
                <PrivateRoute>
                  <div className="flex h-screen relative">
                    <Sidebar />
                    <ParentMessages />
                  </div>
                </PrivateRoute>
              }
            />
          )}
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <div className="flex h-screen relative">
                  <Sidebar />
                  <ParentReports />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <PrivateRoute>
                <div className="flex h-screen relative">
                  <Sidebar />
                  <ParentProgress />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <PrivateRoute>
                <div className="flex h-screen relative">
                  <Sidebar />
                  <ParentRecommendations />
                </div>
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <div className="flex h-screen relative">
                  <Sidebar />
                  <ParentNotifications />
                </div>
              </PrivateRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
