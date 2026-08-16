import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

interface RouterContextType {
  path: string;
  navigate: (to: string, replace?: boolean) => void;
  isAdminRoute: boolean;
  isAdminLogin: boolean;
  isAdminDashboard: boolean;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function normalizePath(rawPath: string): string {
  const clean = rawPath.split('?')[0].split('#')[0].trim().toLowerCase();
  if (clean.length > 1 && clean.endsWith('/')) {
    return clean.slice(0, -1);
  }
  return clean || '/';
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState<string>(() =>
    normalizePath(window.location.pathname)
  );

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(normalizePath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((to: string, replace = false) => {
    const normalized = normalizePath(to);
    if (replace) {
      window.history.replaceState({}, '', to);
    } else {
      window.history.pushState({}, '', to);
    }
    setCurrentPath(normalized);
    window.scrollTo(0, 0);
  }, []);

  const value = useMemo(() => {
    const normalized = normalizePath(currentPath);
    const isAdminLogin =
      normalized === '/admin/login' || normalized.startsWith('/admin/login/');
    const isAdminDashboard = normalized === '/admin';
    const isAdminRoute =
      (normalized === '/admin' || normalized.startsWith('/admin/')) && !isAdminLogin;

    return {
      path: normalized,
      navigate,
      isAdminRoute,
      isAdminLogin,
      isAdminDashboard,
    };
  }, [currentPath, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}
