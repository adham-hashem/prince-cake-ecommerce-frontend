import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

// --- TYPE DEFINITIONS ---

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  governorate?: string;
  role: 'user' | 'admin';
  createdAt: string;
  isProfileComplete?: boolean;
}

interface DecodedToken {
  sub: string;
  email: string;
  exp: number;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string | string[];
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ redirectTo: string }>;
  googleLogin: (idToken: string) => Promise<{ redirectTo: string }>;
  register: (fullName: string, email: string, phoneNumber: string, address: string, governorate: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (data: Partial<User>) => void;
  isAuthenticated: boolean;
  userRole: 'user' | 'admin' | null;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, token: string, newPassword: string) => Promise<void>;
  sendEmailVerification: (email: string) => Promise<void>;
}

// --- CONTEXT CREATION ---

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- PROVIDER COMPONENT ---

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  /**
   * Centralized function to handle successful authentication.
   * It decodes the token, fetches profile status, sets the user state,
   * and determines the correct redirect path.
   */
  const handleAuthSuccess = async (accessToken: string, emailForFallback?: string) => {
    localStorage.setItem('accessToken', accessToken);
    const decoded = jwtDecode<DecodedToken>(accessToken);

    // 🚀 CRITICAL PERFORMANCE RECOMMENDATION FOR YOUR BACKEND TEAM 🚀
    // The API call below to `/api/users/profile-status` is what makes your login feel slow.
    // To fix this, your backend should return `isProfileComplete` and `roles` DIRECTLY
    // in the response from the `/api/auth/login` and `/api/auth/google-login` endpoints.
    // This would eliminate an entire network request and make the login feel instant.
    // Example ideal response: { accessToken, refreshToken, roles, isProfileComplete }
    const profileResponse = await fetch(`${apiUrl}/api/users/profile-status`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
    });
    
    if (!profileResponse.ok) {
        throw new Error('فشل في التحقق من حالة الملف الشخصي.');
    }
    const { isProfileComplete } = await profileResponse.json();

    const roleClaim = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    const roles = Array.isArray(roleClaim) ? roleClaim : [roleClaim || 'Customer'];
    const isAdmin = roles.some((role: string) => role.toLowerCase() === 'admin');

    const userData: User = {
      id: decoded.sub || '',
      name: decoded.email?.split('@')[0] || emailForFallback?.split('@')[0] || 'المستخدم',
      email: decoded.email || emailForFallback || '',
      role: isAdmin ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
      isProfileComplete: isProfileComplete || false,
    };

    setUser(userData);
    return isProfileComplete ? (isAdmin ? '/admin/notifications' : '/') : '/complete-profile';
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const decoded = jwtDecode<DecodedToken>(token);
          if (decoded.exp * 1000 > Date.now()) {
            await handleAuthSuccess(token);
          } else {
            logout(); // Token expired
          }
        } catch (error) {
          console.error('Invalid token during initialization:', error);
          logout(); // Clear invalid token
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ redirectTo: string }> => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email, Password: password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.Message || 'فشل تسجيل الدخول. تحقق من بريدك الإلكتروني وكلمة المرور.');
      }

      const data = await response.json();
      if (!data.accessToken) throw new Error('accessToken is missing in the response');
      
      const redirectTo = await handleAuthSuccess(data.accessToken, email);
      return { redirectTo };
    } catch (error: any) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (idToken: string): Promise<{ redirectTo: string }> => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ Token: idToken }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.errorMessage || 'فشل تسجيل الدخول باستخدام جوجل');
      }

      const data = await response.json();
      if (!data.accessToken) throw new Error('accessToken is missing in the response');
      
      const redirectTo = await handleAuthSuccess(data.accessToken);
      return { redirectTo };
    } catch (error: any) {
      console.error('Google login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullName: string, email: string, phoneNumber: string, address: string, governorate: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ FullName: fullName, Email: email, PhoneNumber: phoneNumber, Address: address, Governorate: governorate, Password: password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || 'فشل إنشاء الحساب');
      }
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const updateUserProfile = (data: Partial<User>) => {
    setUser(prevUser => (prevUser ? { ...prevUser, ...data } : null));
  };
  
  const forgotPassword = async (email: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || 'فشل إرسال رابط إعادة تعيين كلمة المرور');
      }
    } catch (error: any) {
      console.error('Forgot password failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string, token: string, newPassword: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email, Token: token, NewPassword: newPassword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || 'فشل إعادة تعيين كلمة المرور');
      }
    } catch (error: any) {
      console.error('Reset password failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const sendEmailVerification = async (email: string): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/auth/send-email-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Email: email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || 'فشل إرسال رابط التحقق من البريد الإلكتروني');
      }
    } catch (error: any) {
      console.error('Send email verification failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Derive state from the user object for reliability
  const isAuthenticated = !!user;
  const userRole = user?.role ?? null;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        googleLogin,
        register,
        logout,
        updateUserProfile,
        isAuthenticated,
        userRole,
        forgotPassword,
        resetPassword,
        sendEmailVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};