import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { ShoppingCart, ChevronDown } from 'lucide-react';
import RamadanCountdown from '../components/RamadanCountdown';

interface ApiResponse {
  items: Product[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}


interface HomeRestoreState {
  scrollY: number;
}

const HomePage: React.FC = () => {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoreScroll, setRestoreScroll] = useState<number | null>(null);

  useEffect(() => {
    const state = location.state?.fromHome as HomeRestoreState | undefined;

    if (state) {
      setRestoreScroll(state.scrollY);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('jwt_token') || 'jwt_token';
      const apiUrl = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(
        `${apiUrl}/api/products?pageNumber=1&pageSize=10`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const contentType = response.headers.get('Content-Type');

      if (!response.ok) {
        const text = await response.text();
        throw new Error(
          `HTTP error! Status: ${response.status} ${response.statusText}`
        );
      }

      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        throw new Error(
          `Invalid response format: Expected JSON, received ${contentType}`
        );
      }

      const data: ApiResponse = await response.json();

      if (!data || !Array.isArray(data.items)) {
        throw new Error('Invalid response format: items is not an array');
      }

      const mappedProducts: Product[] = data.items.map((item) => ({
        id: item.id,
        name: item.name || '',
        code: item.code || '',
        price: item.price || 0,
        originalPrice: item.originalPrice || undefined,
        description: item.description || '',
        createdAt: item.createdAt || new Date().toISOString(),

        images: Array.isArray(item.images) ? item.images : [],
        sizes: Array.isArray(item.sizes) ? item.sizes : [],
        colors: Array.isArray(item.colors) ? item.colors : [],

        isHidden: item.isHidden !== undefined ? item.isHidden : false,
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
        isInstant: item.isInstant !== undefined ? item.isInstant : false,
        isFeatured: item.isFeatured !== undefined ? item.isFeatured : false,

        inStock: item.isAvailable !== undefined ? item.isAvailable : true,
        isOffer: (item.originalPrice !== undefined &&
          item.originalPrice > item.price) ? true : false,

        rating: item.rating !== undefined ? item.rating : 0,
        salesCount: item.salesCount !== undefined ? item.salesCount : 0,

        category: item.category || undefined,
        type: item.type || undefined,
        season: item.season || undefined,
      }));

      setProducts(mappedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Error fetching products. Please try again later.'
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (restoreScroll !== null && !loading && products.length > 0) {
      const timer = setTimeout(() => {
        window.scrollTo(0, restoreScroll);
        setRestoreScroll(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, restoreScroll, products]);

  const handleViewProduct = (product: Product) => {
    navigate(`/product/${product.id}`, {
      state: {
        product,
        fromHome: {
          scrollY: window.scrollY,
        },
      },
    });
  };

  const handleAddToCart = (product: Product) => {
    if (!product || !product.inStock) {
      return;
    }

    const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
    const hasColors = Array.isArray(product.colors) && product.colors.length > 0;

    if (hasSizes || hasColors) {
      handleViewProduct(product);
    } else {
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          id: `quick-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          product,
          quantity: 1,
          size: hasSizes ? product.sizes[0] : '',
          color: hasColors ? product.colors[0] : '',
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50" dir="rtl">
      <main className="">
        {/* Animation styles */}
        <style>{`
          @keyframes bounce-down {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(8px); }
          }
          .animate-bounce-down {
            animation: bounce-down 2s infinite;
          }
        `}</style>

        {/* Hero Section */}
        <div className="relative min-h-screen bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url(/الصورة_الرئسية_.jpeg)' }}>
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
            <div className="text-center space-y-8 sm:space-y-12 max-w-2xl mx-auto">
              {/* Logo and Ramadan Countdown - Side by Side */}
              <div className="flex items-center justify-center gap-3 sm:gap-4 -mb-2 sm:-mb-4">
                {/* Logo Circle */}
                <div className="relative w-32 sm:w-40 h-32 sm:h-40 rounded-full overflow-hidden shadow-2xl ring-6 ring-white bg-white flex items-center justify-center">
                  <img
                    src="/لجو_برنس_الكيك_.jpeg"
                    alt="Prince Cake Logo"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Ramadan Countdown Badge - Slightly bigger */}
                <div className="transform scale-90 sm:scale-100">
                  <RamadanCountdown />
                </div>
              </div>

              {/* Title Section */}
              <div className="space-y-4 pt-4">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  👑 برنس الكيك
                </h1>
                <p className="text-lg sm:text-xl text-white font-medium drop-shadow-md">
                  مصنع حلويات دليفري في إسكندرية
                </p>
              </div>

              {/* Description */}
              <div className="space-y-3 pt-4">
                <p className="text-base sm:text-lg text-white leading-relaxed drop-shadow-md">
                  أهلاً بيك نورتنا في برنس كيك 💜
                </p>
                <p className="text-sm sm:text-base text-white drop-shadow-md">
                  حلويات فاخرة بجودة عالية وأسعار مناسبة
                </p>

                {/* Guest Checkout Message */}
                <div className="pt-2 animate-pulse">
                  <span className="inline-block bg-white/20 backdrop-blur-md border border-white/50 rounded-full px-4 py-1 text-sm sm:text-base font-bold text-white shadow-lg">
                    ✨ يمكنك طلب الأوردر الآن بدون تسجيل دخول! ✨
                  </span>
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 pt-6">
                <button
                  onClick={() => navigate('/menu')}
                  className="group bg-gradient-to-b from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2"
                >
                  <span className="text-lg sm:text-xl">🍰</span>
                  <span>المنيو</span>
                </button>

                <button
                  onClick={() => navigate('/custom')}
                  className="group bg-gradient-to-b from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2"
                >
                  <span className="text-lg sm:text-xl">🎂</span>
                  <span>تورت مقاسات خاصة</span>
                </button>

                <button
                  onClick={() => navigate('/instant')}
                  className="group bg-gradient-to-b from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2"
                >
                  <span className="text-lg sm:text-xl">⚡</span>
                  <span>المتاح فوري</span>
                </button>

                <button
                  onClick={() => navigate('/breakfast')}
                  className="group bg-gradient-to-b from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2"
                >
                  <span className="text-lg sm:text-xl">🎁</span>
                  <span>بوكسات الفطار</span>
                </button>
              </div>

              {/* Scroll Down Arrow */}
              <div className="pt-8 animate-bounce-down">
                <ChevronDown className="w-8 h-8 text-white mx-auto drop-shadow-md" />
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">


            {loading && products.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600 mb-4"></div>
                <p className="text-xl text-gray-600 font-semibold">جار التحميل...</p>
              </div>
            ) : error ? (
              <div className="text-center py-20 max-w-2xl mx-auto">
                <div className="text-6xl mb-6">⚠️</div>
                <p className="text-2xl text-red-600 font-bold mb-4">{error}</p>
                <p className="text-gray-600 mb-8 text-lg">
                  حدث خطأ أثناء جلب المنتجات. يرجى التأكد من اتصالك أو معاودة المحاولة.
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-8 py-3 rounded-full hover:from-purple-700 hover:to-pink-600 transition-colors font-semibold shadow-md"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : (
              <>
                {products.length > 0 && (
                  <>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-purple-900 text-center mb-12 sm:mb-16">
                      منتجاتنا المميزة
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-12">
                      {products.map((product) => (
                        <div
                          key={product.id}
                          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl hover:shadow-xl transition-all duration-300 border border-purple-100 hover:border-purple-300 overflow-hidden"
                        >
                          <ProductCard
                            product={product}
                            onViewProduct={handleViewProduct}
                            onAddToCart={handleAddToCart}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="text-center">
                      <button
                        onClick={() => navigate('/menu')}
                        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-8 sm:px-12 py-3 sm:py-4 rounded-2xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all duration-200"
                      >
                        عرض كل المنتجات
                      </button>
                    </div>
                  </>
                )}

                {products.length === 0 && !loading && !error && (
                  <div className="text-center py-20">
                    <div className="text-7xl mb-6">📦</div>
                    <p className="text-2xl text-purple-900 font-bold mb-3">
                      لا توجد منتجات للعرض حالياً
                    </p>
                    <p className="text-gray-500 text-lg">
                      نحن نعمل على إضافة مجموعة جديدة ومميزة من التورتات قريباً!
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage;