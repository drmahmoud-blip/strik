import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string; role: 'admin' | 'customer'; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  loginAsDemo: (role: 'admin' | 'customer') => Promise<void>;
  logout: () => void;
  language: 'ar' | 'en';
  setLanguage: (lang: 'ar' | 'en') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [language, setLanguageState] = useState<'ar' | 'en'>('ar');

  const setLanguage = (lang: 'ar' | 'en') => {
    setLanguageState(lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    localStorage.setItem('strike_lang', lang);
  };

  useEffect(() => {
    const savedLang = (localStorage.getItem('strike_lang') as 'ar' | 'en') || 'ar';
    setLanguage(savedLang);

    // Check stored token
    const storedToken = localStorage.getItem('strike_token');
    const storedUser = localStorage.getItem('strike_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('strike_user');
      }

      // Verify token with backend
      fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      })
        .then((res) => {
          if (res.ok) {
            return res.json();
          }
          throw new Error('Token expired');
        })
        .then((data) => {
          setUser(data.user);
          localStorage.setItem('strike_user', JSON.stringify(data.user));
        })
        .catch(() => {
          // Clear if invalid
          localStorage.removeItem('strike_token');
          localStorage.removeItem('strike_user');
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        return { success: false, error: data.error || 'فشل تسجيل الدخول' };
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('strike_token', data.token);
      localStorage.setItem('strike_user', JSON.stringify(data.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'تعذر الاتصال بالخادم' };
    }
  };

  const register = async (data: { name: string; email: string; password: string; role: 'admin' | 'customer'; phone?: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();

      if (!res.ok) {
        return { success: false, error: resData.error || 'فشل إنشاء الحساب' };
      }

      setToken(resData.token);
      setUser(resData.user);
      localStorage.setItem('strike_token', resData.token);
      localStorage.setItem('strike_user', JSON.stringify(resData.user));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: 'تعذر الاتصال بالخادم' };
    }
  };

  const loginAsDemo = async (role: 'admin' | 'customer') => {
    const creds =
      role === 'admin'
        ? { email: 'admin@strikers.com', password: 'admin123' }
        : { email: 'user@strikers.com', password: 'user123' };

    await login(creds.email, creds.password);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('strike_token');
    localStorage.removeItem('strike_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        loginAsDemo,
        logout,
        language,
        setLanguage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
