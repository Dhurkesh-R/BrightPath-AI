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
import Activities from "./pages/Activities";
import Goals from "./pages/Goals"
import Books from "./pages/Books"
import Quizzes from "./pages/Quizzes"
import Profile from "./pages/Profile"
import Settings from "./pages/Settings"

const App = () => {
  const { theme } = useTheme();
  const [moodCompleted, setMoodCompleted] = useState(false);

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
            path="/Settings"
            element={
              <PrivateRoute>
                <div className="flex h-screen relative">
                  <Sidebar />
                  <Settings />
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
