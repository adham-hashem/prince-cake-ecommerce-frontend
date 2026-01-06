import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';

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

      // Map and normalize products with safe defaults
      const mappedProducts: Product[] = data.items.map((item) => ({
        id: item.id,
        name: item.name || '',
        code: item.code || '',
        price: item.price || 0,
        originalPrice: item.originalPrice || undefined,
        description: item.description || '',
        createdAt: item.createdAt || new Date().toISOString(),
        
        // Safe array handling - ensure they're always arrays
        images: Array.isArray(item.images) ? item.images : [],
        sizes: Array.isArray(item.sizes) ? item.sizes : [],
        colors: Array.isArray(item.colors) ? item.colors : [],
        
        // Boolean fields with safe defaults
        isHidden: item.isHidden !== undefined ? item.isHidden : false,
        isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
        isInstant: item.isInstant !== undefined ? item.isInstant : false,
        isFeatured: item.isFeatured !== undefined ? item.isFeatured : false,
        
        // Computed fields
        inStock: item.isAvailable !== undefined ? item.isAvailable : true,
        isOffer: (item.originalPrice !== undefined && 
                  item.originalPrice > item.price) ? true : false,
        
        // Additional fields
        rating: item.rating !== undefined ? item.rating : 0,
        salesCount: item.salesCount !== undefined ? item.salesCount : 0,
        
        // Optional enum fields
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
    // Safety check
    if (!product || !product.inStock) {
      return;
    }

    // Check if product has sizes or colors (with safety checks)
    const hasSizes = Array.isArray(product.sizes) && product.sizes.length > 0;
    const hasColors = Array.isArray(product.colors) && product.colors.length > 0;

    if (hasSizes || hasColors) {
      handleViewProduct(product);
    } else {
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          product,
          quantity: 1,
          selectedSize: hasSizes ? product.sizes[0] : '',
          selectedColor: hasColors ? product.colors[0] : '',
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50" dir="rtl">
      {/* Hero Section with Background Image */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/الصورة_الرئسية_.jpeg)',
            imageRendering: 'crisp-edges'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/30"></div>
        </div>

        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 max-w-4xl mx-auto space-y-8 sm:space-y-10 lg:space-y-12">
          <div className="space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-relaxed drop-shadow-2xl" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
              👑 برنس الكيك في مصر
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl text-purple-100 font-medium leading-relaxed drop-shadow-lg">
              أهلاً بيك نورتنا في برنس كيك 💜
            </p>
            <p className="text-base sm:text-lg lg:text-xl text-white leading-relaxed drop-shadow-lg">
              إحنا مصنع حلويات دليفري فقط داخل إسكندرية
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
            <button
              onClick={() => navigate('/menu')}
              className="group bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 sm:px-8 py-4 sm:py-5 rounded-2xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 drop-shadow-lg"
            >
              <span className="text-2xl">🍰</span>
              <span>المنيو</span>
            </button>

            <button
              onClick={() => navigate('/custom')}
              className="group bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-6 sm:px-8 py-4 sm:py-5 rounded-2xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 drop-shadow-lg"
            >
              <span className="text-2xl">🎂</span>
              <span>اطلب تورتك الخاصة</span>
            </button>

            <button
              onClick={() => navigate('/instant')}
              className="group bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 sm:px-8 py-4 sm:py-5 rounded-2xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 drop-shadow-lg"
            >
              <span className="text-2xl">⚡</span>
              <span>المتاح فوري</span>
            </button>

            <button
              onClick={() => navigate('/breakfast')}
              className="group bg-gradient-to-r from-rose-500 to-red-500 hover:from-rose-600 hover:to-red-600 text-white px-6 sm:px-8 py-4 sm:py-5 rounded-2xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 drop-shadow-lg"
            >
              <span className="text-2xl">🎁</span>
              <span>بوكسات الفطار</span>
            </button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div className="container mx-auto px-4 py-12">
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
            {/* Products Grid */}
            {products.length > 0 && (
              <>
                <div className="flex flex-col items-center mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold text-purple-900 mb-4">
                    استكشف التورتات
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
                    >
                      <ProductCard
                        product={product}
                        onViewProduct={handleViewProduct}
                        onAddToCart={handleAddToCart}
                      />
                    </div>
                  ))}
                </div>

                {/* View All Button */}
                <div className="text-center mb-20">
                  <button
                    onClick={() => navigate('/menu')}
                    className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-12 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-600 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 text-lg"
                  >
                    عرض كل التورتات
                  </button>
                </div>
              </>
            )}

            {/* No Products Found */}
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
  );
};

export default HomePage;
