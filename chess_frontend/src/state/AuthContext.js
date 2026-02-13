import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createApiClient } from "../api/client";

const AuthContext = createContext(null);

function getStoredToken() {
  try {
    return localStorage.getItem("chess_token");
  } catch {
    return null;
  }
}

/**
 * PUBLIC_INTERFACE
 * AuthProvider manages session state (mock token today, real JWT later).
 */
export function AuthProvider({ children }) {
  const [accessToken, setAccessToken] = useState(getStoredToken());
  const [user, setUser] = useState(null);

  const api = useMemo(() => createApiClient({
    baseUrl: process.env.REACT_APP_BACKEND_URL || "",
    getAccessToken: () => accessToken,
    enableMocks: true
  }), [accessToken]);

  useEffect(() => {
    // On load, try to fetch current user (mock returns basic user if token exists).
    let mounted = true;
    api.me()
      .then(u => { if (mounted) setUser(u); })
      .catch(() => { if (mounted) setUser(null); });
    return () => { mounted = false; };
  }, [api]);

  function persistToken(token) {
    setAccessToken(token);
    try {
      if (token) localStorage.setItem("chess_token", token);
      else localStorage.removeItem("chess_token");
    } catch {
      // ignore storage errors (private mode, etc.)
    }
  }

  // PUBLIC_INTERFACE
  async function login(username, password) {
    const res = await api.login({ username, password });
    persistToken(res.access_token);
    setUser(res.user || { username });
    return res;
  }

  // PUBLIC_INTERFACE
  async function register(username, password) {
    return api.register({ username, password });
  }

  // PUBLIC_INTERFACE
  function logout() {
    persistToken(null);
    setUser(null);
  }

  const value = {
    accessToken,
    user,
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * PUBLIC_INTERFACE
 * Access auth state and actions.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
