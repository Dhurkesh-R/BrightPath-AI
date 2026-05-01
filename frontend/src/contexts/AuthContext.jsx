import React, { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    // If there's no user, return null
    if (!savedUser) return null;
    
    // If the string is literally "[object Object]", it's corrupted. Clear it.
    if (savedUser === "[object Object]") {
      localStorage.removeItem("user");
      return null;
    }

    try {
      return JSON.parse(savedUser);
    } catch (e) {
      console.error("Failed to parse user from local storage", e);
      return null;
    }
  });

  const login = (user, token, refreshToken) => {
    setUser(user);
    setToken(token);
    localStorage.setItem("token", token);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
