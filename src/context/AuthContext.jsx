import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../api/api';
import { Navigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userEmail, setUserEmail] = useState(localStorage.getItem('user_email') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get('/api/v1/user/getuser');
      setUser(response.data.user);
      setUserEmail(response.data.user.email);
      localStorage.setItem('user_email', response.data.user.email);
      setError(null);
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err.message);
      setUser(null);
      setUserEmail(null);
      localStorage.removeItem('user_email');
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await axiosInstance.post('/api/v1/auth/login', credentials);
      const { token, user } = response.data;
      
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('user_email', user.email);
      
      setUser(user);
      setUserEmail(user.email);
      setError(null);
      
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_email');
    setUser(null);
    setUserEmail(null);
  };

  // Utility functions
  const isAuthenticated = () => {
    return !!localStorage.getItem('jwt_token');
  };

  const hasPermission = (requiredRole) => {
    return user?.role === requiredRole;
  };

  const updateUserEmail = (newEmail) => {
    setUserEmail(newEmail);
    localStorage.setItem('user_email', newEmail);
    if (user) {
      setUser({ ...user, email: newEmail });
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const value = {
    user,
    userEmail,
    loading,
    error,
    isAuthenticated,
    hasPermission,
    fetchUser,
    login,
    logout,
    updateUserEmail
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// HOC for protected routes
export const withAuth = (WrappedComponent, requiredRole = null) => {
  return function WithAuthComponent(props) {
    const { isAuthenticated, hasPermission, loading } = useAuth();

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated()) {
      return <Navigate to="/login" />;
    }

    if (requiredRole && !hasPermission(requiredRole)) {
      return <Navigate to="/" />;
    }

    return <WrappedComponent {...props} />;
  };
};

// Protected Route Component
export const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, hasPermission, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && !hasPermission(requiredRole)) {
    return <Navigate to="/" />;
  }

  return children;
};

export default AuthContext;