import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Menu as MenuIcon,
  X,
  LogOut,
  UserCircle,
  Settings,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';

const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://elshal.runasp.net';

const Header: React.FC = () => {
  const { state } = useApp();
  const { user, isAuthenticated, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchCode, setSearchCode] = useState('');
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async () => {
    if (!searchCode.trim()) {
      setSearchResult(null);
      setSearchError(null);
      return;
    }

    try {
      setIsLoading(true);
      setSearchError(null);

      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${apiUrl}/api/products/code/${searchCode.trim()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        }
      );

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const product = await response.json();
          if (
            product.id &&
            product.name &&
            product.code &&
            product.price &&
            product.images?.[0]?.imagePath
          ) {
            setSearchResult(product);
          } else {
            setSearchError('البيانات المستلمة غير صالحة');
          }
        } else {
          throw new Error('Response is not JSON');
        }
      } else {
        const contentType = response.headers.get('content-type');
        let errorMessage = `خطأ في الخادم: ${response.status} ${response.statusText}`;
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json().catch(() => ({}));
          errorMessage = errorData.message || errorMessage;
        } else if (response.status === 404) {
          errorMessage = 'لم يتم العثور على منتج بهذا الكود';
        }
        setSearchResult(null);
        setSearchError(errorMessage);
      }
    } catch {
      setSearchResult(null);
      setSearchError(
        'حدث خطأ أثناء البحث. تحقق من الاتصال بالإنترنت أو حاول مرة أخرى لاحقاً.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const cartItemsCount = state.cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const currentPage = location.pathname;

  // كلمات المنيو مثل الكود الأول
  const menuItems = [
    { path: '/', label: 'الرئيسية' },
    { path: '/menu', label: 'المنيو' },
    { path: '/instant', label: 'المتاح فوري' },
    { path: '/breakfast', label: 'بوكسات الفطار' },
    { path: '/my-orders', label: 'طلباتي' },
    { path: '/custom', label: 'تورت مقاسات خاصة' },
    { path: '/my-custom-orders', label: 'طلباتي الخاصة' },
    { path: '/cart', label: 'السلة' },
  ];

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 border-b-2 border-pink-200">
      <div className="container mx-auto px-4 py-3">
        {/* الصف العلوي */}
        <div className="flex items-center justify-between">
          {/* اللوجو + الاسم */}
          <Link
            to="/"
            className="flex items-center gap-3"
          >
            <img
              src="/logoooo.jpeg"
              alt="Prince Cake"
              className="h-12 w-12 rounded-full object-cover"
            />
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-purple-900">
                Prince Cake
              </h1>
              <p className="text-xs text-amber-600">
                برنس الكيك في مصر
              </p>
            </div>
          </Link>

          {/* منيو في النص - ديسكتوب */}
          <nav className="hidden md:flex items-center gap-6">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-base font-medium transition-colors ${
                  currentPage === item.path
                    ? 'text-purple-700'
                    : 'text-gray-700 hover:text-purple-600'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* يمين: بحث + حساب + سلة + منيو موبايل */}
          <div className="flex items-center gap-3">
            {/* البحث ديسكتوب */}
            <div className="hidden md:flex items-center flex-1 max-w-md mx-4">
              <div className="flex items-center space-x-reverse space-x-2 bg-gray-100 rounded-lg px-4 py-2 w-full">
                <input
                  type="text"
                  placeholder="ابحث بكود الكيك..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-transparent outline-none text-right flex-1"
                  dir="rtl"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSearch}
                  className="text-gray-500 hover:text-pink-600 transition-colors"
                  disabled={isLoading}
                  aria-label="بحث"
                >
                  <Search size={20} />
                </button>
              </div>
            </div>

            {/* حساب المستخدم ديسكتوب */}
            <div className="hidden md:flex items-center space-x-reverse space-x-4">
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() =>
                      setIsProfileDropdownOpen(!isProfileDropdownOpen)
                    }
                    className="flex items-center space-x-reverse space-x-2 text-gray-700 hover:text-pink-600 transition-colors p-2 rounded-lg hover:bg-gray-50"
                  >
                    <UserCircle size={24} />
                    <span className="text-sm font-medium">{user?.name}</span>
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center space-x-reverse space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings size={18} />
                        <span className="text-sm">الملف الشخصي</span>
                      </Link>

                      {/* طلباتي تبقى هنا من غير ما تبان في المنيو الرئيسي */}
                      <Link
                        to="/my-orders"
                        onClick={() => setIsProfileDropdownOpen(false)}
                        className="flex items-center space-x-reverse space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <ShoppingCart size={18} />
                        <span className="text-sm">طلباتي</span>
                      </Link>

                      {userRole === 'admin' && (
                        <Link
                          to="/admin"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center space-x-reverse space-x-3 px-4 py-3 text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Settings size={18} />
                          <span className="text-sm font-medium">
                            لوحة التحكم
                          </span>
                        </Link>
                      )}

                      <div className="border-t border-gray-100 mt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center space-x-reverse space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors w-full"
                        >
                          <LogOut size={18} />
                          <span className="text-sm font-medium">
                            تسجيل الخروج
                          </span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-pink-600 font-medium transition-colors"
                >
                  تسجيل دخول
                </Link>
              )}
            </div>

            {/* زر السلة */}
            <button
              onClick={() => navigate('/cart')}
              className="relative p-2 rounded-full hover:bg-purple-50 transition-colors"
              aria-label="السلة"
            >
              <ShoppingCart className="h-6 w-6 text-purple-700" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {/* منيو موبايل */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-full hover:bg-purple-50 transition-colors"
              aria-label="القائمة"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6 text-purple-700" />
              ) : (
                <MenuIcon className="h-6 w-6 text-purple-700" />
              )}
            </button>
          </div>
        </div>

        {/* حالات البحث */}
        {isLoading && (
          <div className="mb-4 mt-3 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-gray-600 text-center">جارٍ البحث عن الكيك...</p>
          </div>
        )}

        {searchResult && !isLoading && (
          <div className="mb-4 mt-3 p-4 bg-pink-50 rounded-lg border border-pink-100">
            <div className="flex items-center space-x-reverse space-x-4">
              <img
                src={`${apiUrl}${searchResult.images[0].imagePath}`}
                alt={searchResult.name}
                className="w-16 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-800">
                  {searchResult.name}
                </h3>
                <p className="text-sm text-gray-600">
                  كود الكيك: {searchResult.code}
                </p>
                <p className="text-pink-600 font-bold">
                  {searchResult.price} جنيه
                </p>
              </div>
              <button
                onClick={() => {
                  navigate(`/product/${searchResult.id}`, {
                    state: { product: searchResult },
                  });
                  setSearchResult(null);
                  setSearchCode('');
                }}
                className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors whitespace-nowrap"
              >
                عرض الكيك
              </button>
            </div>
          </div>
        )}

        {searchError && !isLoading && (
          <div className="mb-4 mt-3 p-4 bg-red-50 rounded-lg border border-red-100">
            <p className="text-red-600 text-center">{searchError}</p>
          </div>
        )}

        {/* منيو موبايل تحت الهيدر */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-2 border-t border-gray-200 pt-4">
            {/* بحث موبايل */}
            <div className="mb-4">
              <div className="flex items-center space-x-reverse space-x-2 bg-gray-100 rounded-lg px-3 py-2">
                <input
                  type="text"
                  placeholder="ابحث بكود الكيك..."
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="bg-transparent outline-none text-right flex-1"
                  dir="rtl"
                  disabled={isLoading}
                />
                <button
                  onClick={handleSearch}
                  className="text-gray-500 hover:text-pink-600"
                  disabled={isLoading}
                  aria-label="بحث"
                >
                  <Search size={20} />
                </button>
              </div>
            </div>

            {/* عناصر المنيو موبايل */}
            <nav className="space-y-2 mb-4">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block w-full text-right px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === item.path
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-purple-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* حساب المستخدم موبايل */}
            {isAuthenticated ? (
              <div className="border-t pt-4 space-y-3">
                <div className="px-4 py-2 bg-gray-50 rounded-lg">
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email}
                  </p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-reverse space-x-3 py-3 px-4 text-gray-700 hover:text-pink-600 font-medium transition-colors rounded-lg hover:bg-gray-50"
                >
                  <Settings size={18} />
                  <span>الملف الشخصي</span>
                </Link>

                {userRole === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-reverse space-x-3 py-3 px-4 text-blue-600 hover:text-blue-700 font-medium transition-colors rounded-lg hover:bg-blue-50"
                  >
                    <Settings size={18} />
                    <span>لوحة التحكم</span>
                  </Link>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-reverse space-x-3 w-full text-right py-3 px-4 text-red-600 hover:text-red-700 font-medium transition-colors rounded-lg hover:bg-red-50"
                >
                  <LogOut size={18} />
                  <span>تسجيل الخروج</span>
                </button>
              </div>
            ) : (
              <div className="border-t pt-4">
                <Link
                  to="/login"
                  onClick={() => setIsMenuOpen(false)}
                  className="block text-right py-3 px-4 text-gray-700 hover:text-pink-600 font-medium transition-colors rounded-lg hover:bg-gray-50"
                >
                  تسجيل دخول
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;