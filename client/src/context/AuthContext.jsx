// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../utils/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ New: refreshUser function to pull fresh data from the server
  // Wrapped in useCallback so it can be safely used in useEffect dependencies
  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data); // This updates the global state and triggers re-renders
      return res.data;
    } catch (err) {
      console.error("Auth Refresh Error:", err);
      // If token is invalid, clear it
      if (err.response?.status === 401) {
        localStorage.clear();
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        await refreshUser();
      }
      setLoading(false);
    };
    initAuth();
  }, [refreshUser]);

  const login = async(userData, token) => {
    localStorage.setItem("token", token);

    localStorage.setItem("role", userData.role);
    setUser(userData);
      await refreshUser();
      
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    // ✅ Added refreshUser to the Provider value
    <AuthContext.Provider value={{ user, login, logout, loading, setUser, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);