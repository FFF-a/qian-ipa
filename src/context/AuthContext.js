import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { login as apiLogin } from "../api/auth";
import { setUnauthorizedHandler } from "../api/client";
import { clearToken, getToken, saveToken } from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    await clearToken();
    setToken(null);
  }, []);

  useEffect(() => {
    (async () => {
      const stored = await getToken();
      setToken(stored);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
  }, [logout]);

  const login = useCallback(async (username, password) => {
    const data = await apiLogin(username, password);
    const jwt = data?.token;
    if (!jwt) {
      throw new Error("登录成功但未返回 token，请检查后端接口");
    }
    await saveToken(jwt);
    setToken(jwt);
    return data;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        token,
        loading,
        isLoggedIn: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
