import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from 'react';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from './supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isLoading: boolean;
  adminCheckDone: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  checkAdminStatus: (userId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminCheckDone, setAdminCheckDone] = useState<boolean>(false);

  const isMountedRef = useRef(true);

  const checkAdminStatus = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[Auth] admin_users query returned:', error.message);
        if (isMountedRef.current) {
          setIsAdmin(false);
          setAdminCheckDone(true);
        }
        return false;
      }

      const admin = !!data?.user_id;
      if (isMountedRef.current) {
        setIsAdmin(admin);
        setAdminCheckDone(true);
      }
      return admin;
    } catch (err) {
      console.warn('[Auth] Exception checking admin status:', err);
      if (isMountedRef.current) {
        setIsAdmin(false);
        setAdminCheckDone(true);
      }
      return false;
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    async function initSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('[Auth] getSession error:', error.message);
        }

        const currentSession = data?.session ?? null;
        const currentUser = currentSession?.user ?? null;

        if (isMountedRef.current) {
          setSession(currentSession);
          setUser(currentUser);

          if (currentUser) {
            await checkAdminStatus(currentUser.id);
          } else {
            setIsAdmin(false);
            setAdminCheckDone(true);
          }
        }
      } catch (err) {
        console.error('[Auth] Init auth error:', err);
        if (isMountedRef.current) {
          setIsAdmin(false);
          setAdminCheckDone(true);
        }
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMountedRef.current) return;

      const newUser = newSession?.user ?? null;
      setSession(newSession ?? null);
      setUser(newUser);

      if (newUser) {
        setAdminCheckDone(false);
        await checkAdminStatus(newUser.id);
      } else {
        setIsAdmin(false);
        setAdminCheckDone(true);
      }

      setIsLoading(false);
    });

    return () => {
      isMountedRef.current = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user && isMountedRef.current) {
        setUser(data.user);
        setSession(data.session);
        await checkAdminStatus(data.user.id);
      }

      return { error: null };
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      if (isMountedRef.current) {
        setUser(null);
        setSession(null);
        setIsAdmin(false);
        setAdminCheckDone(true);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  const value = useMemo(
    () => ({
      user,
      session,
      isAdmin,
      isLoading,
      adminCheckDone,
      signIn,
      signOut,
      checkAdminStatus,
    }),
    [user, session, isAdmin, isLoading, adminCheckDone]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
