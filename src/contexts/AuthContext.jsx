import React from 'react';
import { apiService } from '../services/api.js';

export const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(null);
  const [accessToken, setAccessToken] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  const fetchProfile = React.useCallback(async (token) => {
    try {
      const me = await apiService.me(token);
      setUser(me);
      return me;
    } catch {
      setUser(null);
      return null;
    }
  }, []);

  const doRefresh = React.useCallback(async () => {
    try {
      const res = await apiService.refresh();
      if (res?.access) {
        setAccessToken(res.access);
        await fetchProfile(res.access);
        return true;
      }
    } catch {}
    return false;
  }, [fetchProfile]);

  React.useEffect(() => {
    (async () => {
      await doRefresh();
      setLoading(false);
    })();
  }, [doRefresh]);

  const login = async (email, password) => {
    const res = await apiService.login({ email, password });
    setAccessToken(res.access);
    const me = await fetchProfile(res.access);
    return me;
  };

  const logout = async () => {
    await apiService.logout();
    setUser(null);
    setAccessToken('');
  };

  const value = {
    user,
    accessToken,
    login,
    logout,
    refresh: doRefresh,
    loading,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}
