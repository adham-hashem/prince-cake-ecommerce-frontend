import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Cake, Star } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../contexts/AuthContext';
import OpenInBrowserModal from '../components/OpenInBrowserModal';
import { isFacebookOrInstagramInAppBrowser } from '../utils/inAppBrowser';

const LoginPage: React.FC = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
 
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [showOpenInBrowser, setShowOpenInBrowser] = useState(false);

  const inApp = isFacebookOrInstagramInAppBrowser();

  useEffect(() => {
    if (inApp) setShowOpenInBrowser(true);
  }, [inApp]);

  // Validate email
  const validateEmail = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  // Handle form validation
  const validateForm = (): boolean => {
    const errors: { email?: string; password?: string } = {};

    if (!email) {
      errors.email = 'البريد الإلكتروني مطلوب';
    } else if (!validateEmail(email)) {
      errors.email = 'البريد الإلكتروني غير صحيح';
    }

    if (!password) {
      errors.password = 'كلمة المرور مطلوبة';
    } else if (password.length < 6) {
      errors.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle email/password login
  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoggingIn(true);
    setError('');

    try {
      const loginResponse = await login(email, password);
      const from = (location.state as any)?.from?.pathname || loginResponse.redirectTo;
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Google OAuth login
  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoggingIn(true);
    setError('');

    try {
      const idToken = credentialResponse.credential;
      if (!idToken) throw new Error('لم يتم استلام رمز جوجل التعريفي.');

      const loginResponse = await googleLogin(idToken);
      const from = (location.state as any)?.from?.pathname || loginResponse.redirectTo;
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleError = () => {
    console.error('Google Sign-In failed');
    setError('فشل تسجيل الدخول باستخدام جوجل. يرجى المحاولة مرة أخرى.');
  };

  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-amber-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* ✅ Modal for FB/IG in-app browser */}
      <OpenInBrowserModal open={showOpenInBrowser} onClose={() => setShowOpenInBrowser(false)} />

      {/* Background Decorations */}
      <div className="absolute top-10 left-10 text-pink-200 animate-bounce">
        <Cake className="h-16 w-16" />
      </div>
      <div className="absolute top-20 right-20 text-purple-200 animate-pulse">
        <Sparkles className="h-12 w-12" />
      </div>
      <div className="absolute bottom-20 left-20 text-amber-200 animate-pulse">
        <Heart className="h-10 w-10 fill-current" />
      </div>
      <div className="absolute bottom-32 right-16 text-pink-200 animate-bounce delay-100">
        <Star className="h-8 w-8 fill-current" />
      </div>
      <div className="absolute top-1/2 left-5 text-purple-100">
        <Cake className="h-20 w-20 opacity-50" />
      </div>
      <div className="absolute top-1/3 right-5 text-pink-100">
        <Heart className="h-14 w-14 fill-current opacity-50" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center space-x-reverse space-x-2 text-gray-600 hover:text-purple-600 mb-6 transition-colors group"
        >
          <ArrowRight size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">العودة للرئيسية</span>
        </Link>

        {/* Main Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/50">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 p-8 text-center">
            {/* Animated Stars */}
            <div className="absolute top-3 right-6 animate-pulse">
              <Sparkles className="h-5 w-5 text-yellow-200" />
            </div>
            <div className="absolute top-6 left-8 animate-pulse delay-75">
              <Star className="h-4 w-4 text-pink-200 fill-current" />
            </div>
            <div className="absolute bottom-4 right-10 animate-pulse delay-150">
              <Heart className="h-4 w-4 text-red-200 fill-current" />
            </div>

            {/* Logo */}
            <div className="relative inline-block mb-4">
              <div className="absolute -inset-2 bg-white/20 rounded-full blur-md"></div>
              <img
                src="/logo_with_slogan.jpg"
                alt="Prince Cake"
                className="relative h-28 w-28 mx-auto rounded-full object-cover shadow-xl border-4 border-white/80"
              />
            </div>

            <h1 className="text-3xl font-bold text-white mb-1 drop-shadow-lg">Prince Cake</h1>
            <p className="text-white/90 text-lg font-medium">برنس الكيك في مصر 👑</p>
          </div>

          {/* Login Content */}
          <div className="p-8">
            {/* Welcome Message */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <h2 className="text-2xl font-bold text-purple-900">أهلاً بك!</h2>
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-gray-600">سجل دخولك واستمتع بأشهى الحلويات والتورتات</p>
            </div>

            {isLoggingIn ? (
              <div className="flex flex-col items-center space-y-4 py-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
                  <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-4">
                    <Cake className="h-10 w-10 text-white animate-bounce" />
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-purple-900 font-bold text-lg">جاري تسجيل الدخول...</p>
                  <p className="text-gray-500 text-sm mt-1">نجهز لك أشهى المفاجآت 🎂</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* ✅ If in FB/IG show a small hint */}
                {inApp && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-sm text-amber-800">
                    ⚠️ تسجيل الدخول بجوجل قد لا يعمل داخل متصفح فيسبوك/إنستجرام. الأفضل فتح الموقع في المتصفح.
                  </div>
                )}

                {/* Google Login */}
                <div className="flex justify-center">
                  <div className="transform hover:scale-105 transition-transform duration-200">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      width="300"
                      theme="outline"
                      size="large"
                      text="continue_with"
                      shape="pill"
                      locale="ar"
                      // ✅ Disable OneTap inside FB/IG WebView
                      useOneTap={!inApp}
                    />
                  </div>
                </div>

                {/* Terms */}
                <div className="text-center text-gray-400 text-xs">
                  <p>
                    بتسجيل الدخول، أنت توافق على{' '}
                    <span className="text-purple-500 hover:underline cursor-pointer">
                      سياسة الخصوصية
                    </span>{' '}
                    و{' '}
                    <span className="text-purple-500 hover:underline cursor-pointer">
                      شروط الاستخدام
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Banner */}
          <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 p-4">
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-1 text-purple-600">
                <Cake className="h-4 w-4" />
                <span>تورتات فاخرة</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-300"></div>
              <div className="flex items-center gap-1 text-pink-600">
                <Heart className="h-4 w-4 fill-current" />
                <span>صنع بحب</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-300"></div>
              <div className="flex items-center gap-1 text-amber-600">
                <Star className="h-4 w-4 fill-current" />
                <span>جودة عالية</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Cards */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg text-center hover:shadow-xl transition-shadow hover:-translate-y-1 duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full mb-2">
              <span className="text-2xl">🎂</span>
            </div>
            <p className="text-xs text-gray-600 font-medium">تورتات مميزة</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg text-center hover:shadow-xl transition-shadow hover:-translate-y-1 duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-pink-100 to-pink-200 rounded-full mb-2">
              <span className="text-2xl">🚚</span>
            </div>
            <p className="text-xs text-gray-600 font-medium">توصيل سريع</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg text-center hover:shadow-xl transition-shadow hover:-translate-y-1 duration-300">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-full mb-2">
              <span className="text-2xl">⭐</span>
            </div>
            <p className="text-xs text-gray-600 font-medium">أعلى تقييم</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;