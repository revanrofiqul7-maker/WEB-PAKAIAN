import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // On every fresh load we intentionally discard any previous
  // authentication state. this makes the *initial* route always be
  // the login/register screen, even if the browser had a token saved.
  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  const login = (userData, accessToken, newRefreshToken) => {
    setUser(userData);
    setToken(accessToken);
    setRefreshToken(newRefreshToken);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setRefreshToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  const refreshAccessToken = useCallback(async () => {
    const storedRefreshToken = localStorage.getItem('refreshToken');
    if (!storedRefreshToken) {
      logout();
      return null;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          logout();
          return null;
        }
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      setToken(data.accessToken);
      localStorage.setItem('token', data.accessToken);
      return data.accessToken;
    } catch (err) {
      console.error('Token refresh failed:', err);
      logout();
      return null;
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, loading, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
}
