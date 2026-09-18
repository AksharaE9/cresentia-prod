import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Use sessionStorage instead of localStorage for auto-logout on tab close
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    setAuthToken(token);

    api
      .get('/auth/me')
      .then((res) => {
        if (res.data?.user) {
          setUser(res.data.user);
          sessionStorage.setItem('user', JSON.stringify(res.data.user));
        }
      })
      .catch((error) => {
        // ONLY clear session if server explicitly returned 401/403 (token is genuinely invalid or expired)
        const status = error.response?.status;
        if (status === 401 || status === 403) {
          console.warn('Session expired or unauthorized. Logging out.');
          setToken(null);
          setUser(null);
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          setAuthToken(null);
        } else {
          // If cold start, network hiccup, or temporary error, DO NOT kick the user out!
          console.warn('Backend verification pending or network delay, keeping existing session.');
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setAuthToken(data.token);
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setLoading(false);
    return data.user;
  };

  const loginWithGoogle = async (googleData) => {
    const { data } = await api.post('/auth/google', googleData);
    setAuthToken(data.token);
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setLoading(false);
    return data.user;
  };

  const register = async (payload) => {
    return api.post('/auth/register', payload);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setAuthToken(null);
  };

  // Refresh user data without manual refresh button
  const refreshUser = async () => {
    if (!token) return;
    
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
      sessionStorage.setItem('user', JSON.stringify(res.data.user));
      return res.data.user;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // Session expired, logout
      logout();
      return null;
    }
  };

  // Check if user has access based on role
  const hasAccess = () => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'instructor') return true;
    if (user.role === 'user') {
      return user.assignedCourses && user.assignedCourses.length > 0;
    }
    return false;
  };

  // Check if user has access to a specific course
  const hasCourseAccess = (courseId) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'instructor') {
      // Instructors can access courses they created
      // This will be verified on the backend
      return true;
    }
    if (user.role === 'user') {
      if (!user.assignedCourses || user.assignedCourses.length === 0) {
        return false;
      }
      const hasAccess = user.assignedCourses.some(id => {
        const idStr = typeof id === 'object' && id._id ? id._id.toString() : id.toString();
        return idStr === courseId.toString();
      });
      return hasAccess;
    }
    return false;
  };

  // Check if user can perform action based on role
  const canPerformAction = (action) => {
    if (!user) return false;
    
    const permissions = {
      admin: [
        'create_instructor', 'delete_instructor', 'view_all_users', 'delete_user',
        'assign_courses', 'create_course', 'edit_any_course', 'delete_course',
        'upload_video', 'delete_video', 'view_all_students', 'manage_users'
      ],
      instructor: [
        'create_course', 'edit_own_course', 'upload_video', 'edit_own_video',
        'view_assigned_students', 'create_assessment'
      ],
      user: [
        'view_assigned_courses', 'take_assessment', 'download_certificate'
      ]
    };

    return permissions[user.role]?.includes(action) || false;
  };

  const value = useMemo(
    () => ({ 
      token, 
      user, 
      loading, 
      login, 
      loginWithGoogle,
      register, 
      logout, 
      refreshUser, 
      setUser, 
      setToken, 
      hasAccess, 
      hasCourseAccess,
      canPerformAction
    }),
    [token, user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
