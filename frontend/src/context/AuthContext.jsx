import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { api } from "../api/client";
import {
  clearAuth,
  clearProfileId,
  getProfileId,
  getToken,
  getUser,
  setAuth,
  setProfileId,
} from "../utils/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getUser());
  const [profileId, setProfileIdState] = useState(() => {
    const u = getUser();
    if (!u) return null;
    return getProfileId(u.role, u.email);
  });

  const isAuthenticated = Boolean(getToken() && user);

  const login = useCallback((token, userData) => {
    setAuth(token, userData);
    setUser(userData);
    const storedProfile = getProfileId(userData.role, userData.email);
    setProfileIdState(storedProfile);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    setProfileIdState(null);
  }, []);

  const saveProfileId = useCallback(
    (id) => {
      if (!user) return;
      setProfileId(user.role, user.email, id);
      setProfileIdState(id);
    },
    [user],
  );

  const removeProfileId = useCallback(() => {
    if (!user) return;
    clearProfileId(user.role, user.email);
    setProfileIdState(null);
  }, [user]);

  const refreshSession = useCallback(async () => {
    const token = getToken();
    if (!token) return false;
    try {
      const { user: me } = await api.me();
      setUser(me);
      const storedProfile = getProfileId(me.role, me.email);
      setProfileIdState(storedProfile);
      return true;
    } catch {
      logout();
      return false;
    }
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      profileId,
      isAuthenticated,
      login,
      logout,
      saveProfileId,
      removeProfileId,
      refreshSession,
    }),
    [
      user,
      profileId,
      isAuthenticated,
      login,
      logout,
      saveProfileId,
      removeProfileId,
      refreshSession,
    ],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
