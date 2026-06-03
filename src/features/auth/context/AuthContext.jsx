import { useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { AuthContext } from './AuthContextValue';

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('yomu_user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    localStorage.removeItem('yomu_user');
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const sanitizeUserData = (data) => {
    if (!data) return null;
    return JSON.parse(JSON.stringify(data).replace(/[<>]/g, ''));
  };

  // Sync user state to localStorage
  const saveSession = (userData) => {
    setUser(userData);
    const cleanData = sanitizeUserData(userData);
    localStorage.setItem('yomu_user', JSON.stringify(cleanData));
  };

  const clearSession = () => {
    setUser(null);
    localStorage.removeItem('yomu_user');
  };

  useEffect(() => {
    const refreshStoredSession = async () => {
      const storedUser = getStoredUser();
      if (!storedUser?.refreshToken || !storedUser?.expiresAt) return;

      const expiresSoon = Date.parse(storedUser.expiresAt) - Date.now() < 60_000;
      if (!expiresSoon) return;

      try {
        const refreshedUser = await authService.refreshSession(storedUser.refreshToken);
        saveSession(refreshedUser);
      } catch {
        clearSession();
      }
    };

    refreshStoredSession();
  }, []);

  const login = async (identifier, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await authService.login(identifier, password);
      saveSession(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    setError(null);
    try {
      const newUserData = await authService.register(userData);
      saveSession(newUserData);
      return newUserData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = async (accessToken) => {
    setIsLoading(true);
    setError(null);
    try {
      const userData = await authService.googleLogin(accessToken);
      saveSession(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updateData) => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user) throw new Error("Not logged in");
      const updatedUser = await authService.updateProfile(updateData);
      saveSession(updatedUser);
      return updatedUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user) throw new Error("Not logged in");
      await authService.deleteAccount();
      clearSession();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearSession();
  };

  const value = {
    user,
    isLoading,
    error,
    login,
    register,
    googleLogin,
    updateProfile,
    deleteAccount,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
