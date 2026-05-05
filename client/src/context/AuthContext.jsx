import { createContext, useState, useEffect } from "react";
import { authAPI } from "../api/client";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true while we check existing session

  // On mount, check if there's already an active session (e.g. page refresh)
  useEffect(() => {
    authAPI
      .me()
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const data = await authAPI.login(username, password);
    setUser(data.user);
    return data;
  };

  const register = async (username, email, password) => {
    const data = await authAPI.register(username, email, password);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authAPI.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
