import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync session and admin profile
  const checkAdminStatus = async (sessionUser) => {
    if (!sessionUser) {
      setAdminProfile(null);
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      // Verify via backend API to check RLS approval status
      const adminData = await api.verifyAdmin();
      setAdminProfile(adminData);
      setUser(sessionUser);
    } catch (err) {
      console.error('Admin verification failed:', err.message);
      // Logout if they are rejected or not an approved admin
      setAdminProfile(null);
      setUser(null);
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        // Store session data in localStorage for our api.js helper to pick up
        localStorage.setItem('supabase.auth.token', JSON.stringify(session));
        checkAdminStatus(session.user);
      } else {
        localStorage.removeItem('supabase.auth.token');
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        localStorage.setItem('supabase.auth.token', JSON.stringify(session));
        checkAdminStatus(session.user);
      } else {
        localStorage.removeItem('supabase.auth.token');
        setUser(null);
        setAdminProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      // Store session manually immediately so next calls pick it up
      if (data.session) {
        localStorage.setItem('supabase.auth.token', JSON.stringify(data.session));
      }
      
      // Now verify if approved
      const adminData = await api.verifyAdmin();
      setAdminProfile(adminData);
      setUser(data.user);
      return adminData;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('supabase.auth.token');
      setUser(null);
      setAdminProfile(null);
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    adminProfile,
    isAuthenticated: !!adminProfile && adminProfile.approval_status === 'approved',
    loading,
    login,
    logout,
    refreshProfile: () => checkAdminStatus(user),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
