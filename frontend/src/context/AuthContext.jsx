import { createContext, useContext, useState } from "react";
import { login as apiLogin } from "../api/client";

const AuthContext = createContext(null);

const STORAGE_USER_KEY = "leaveapp_user";

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function login(email, password) {
    setError("");
    setIsLoading(true);
    try {
      // Expected shape from the backend: { token, user: { id, name, email, role } }
      const data = await apiLogin(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message || "Login failed.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem(STORAGE_USER_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, error, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside an AuthProvider");
  return ctx;
}
