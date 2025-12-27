import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowRight, Sparkles, Heart, Cake, Search } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50 flex items-center justify-center py-8 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-10 left-10 text-pink-200 animate-bounce">
        <Cake className="h-12 w-12" />
      </div>
      <div className="absolute top-20 right-16 text-purple-200 animate-pulse">
        <Sparkles className="h-10 w-10" />
      </div>
      <div className="absolute bottom-20 left-16 text-amber-200 animate-pulse">
        <Heart className="h-8 w-8 fill-current" />
      </div>
      <div className="absolute bottom-32 right-10 text-pink-200 animate-bounce delay-100">
        <Cake className="h-10 w-10" />
      </div>
      <div className="absolute top-1/2 left-5 text-purple-100 opacity-50">
        <Cake className="h-16 w-16" />
      </div>
      <div className="absolute top-1/3 right-5 text-pink-100 opacity-50">
        <Heart className="h-12 w-12 fill-current" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-lg mx-auto text-center">
          {/* Main Card */}
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/50">
            {/* Logo */}
            <div className="mb-6">
              <div className="relative inline-block">
                <div className="absolute -inset-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-lg opacity-30 animate-pulse"></div>
                <img
                  src="/logo_with_slogan.jpg"
                  alt="Prince Cake"
                  className="relative h-20 w-20 mx-auto rounded-full object-cover shadow-xl border-4 border-white"
                />
              </div>
            </div>

            {/* 404 Illustration */}
            <div className="relative mb-6">
              <div className="text-8xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 bg-clip-text text-transparent">
                404
              </div>
              <div className="absolute -top-2 right-1/4 animate-bounce">
                <span className="text-3xl">🎂</span>
              </div>
              <div className="absolute -bottom-2 left-1/4 animate-bounce delay-75">
                <span className="text-2xl">🍰</span>
              </div>
            </div>

            {/* Sad Cake Icon */}
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full">
                <span className="text-5xl">😢</span>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-purple-900 mb-3">
              أوبس! الصفحة غير موجودة
            </h2>

            <p className="text-gray-600 mb-8 leading-relaxed">
              يبدو أن هذه الصفحة اختفت مثل آخر قطعة كيك! 🍰
              <br />
              لا تقلق، يمكنك العودة واستكشاف حلوياتنا اللذيذة.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                to="/"
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 px-6 rounded-2xl hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl font-bold flex items-center justify-center gap-2 transform hover:scale-105"
              >
                <Home size={20} />
                <span>العودة للرئيسية</span>
              </Link>

              <Link
                to="/menu"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 px-6 rounded-2xl hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl font-bold flex items-center justify-center gap-2 transform hover:scale-105"
              >
                <Cake size={20} />
                <span>تصفح المنيو</span>
              </Link>

              <button
                onClick={() => window.history.back()}
                className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-2xl hover:bg-gray-200 transition-all font-medium flex items-center justify-center gap-2"
              >
                <ArrowRight size={20} />
                <span>العودة للخلف</span>
              </button>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-white/80 backdrop-blur-sm border-2 border-purple-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Search className="h-5 w-5 text-purple-600" />
              <h3 className="font-bold text-purple-900">هل تبحث عن شيء معين؟</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">
              يمكنك تصفح أقسام الموقع أو التواصل معنا مباشرة
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                to="/"
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
              >
                الرئيسية
              </Link>
              <Link
                to="/menu"
                className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium hover:bg-pink-200 transition-colors"
              >
                المنيو
              </Link>
              <Link
                to="/instant"
                className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium hover:bg-green-200 transition-colors"
              >
                المتاح فوري
              </Link>
              <Link
                to="/custom"
                className="px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-medium hover:bg-amber-200 transition-colors"
              >
                طلب خاص
              </Link>
            </div>
          </div>

          {/* Contact WhatsApp */}
          <div className="mt-6">
            <a
              href="https://wa.me/201000070653?text=مرحباً، أحتاج مساعدة"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              <span className="text-xl">💬</span>
              <span>تواصل معنا عبر واتساب</span>
            </a>
          </div>

          {/* Fun Message */}
          <div className="mt-8 text-center">
            <p className="text-gray-400 text-sm">
              لا تحزن! كل المشاكل تُحل بقطعة كيك 🎂💜
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;