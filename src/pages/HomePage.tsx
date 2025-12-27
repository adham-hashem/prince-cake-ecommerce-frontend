import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { Cake, Heart, Sparkles } from 'lucide-react';

interface ApiResponse {
  items: Product[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

interface HomeRestoreState {
  scrollY: number;
  activeCategory: 'women' | 'children';
}

const HomePage: React.FC = () => {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [womenProducts, setWomenProducts] = useState<Product[]>([]);
  const [childrenProducts, setChildrenProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<'women' | 'children'>('women');
  const [restoreScroll, setRestoreScroll] = useState<number | null>(null);

  useEffect(() => {
    const state = location.state?.fromHome as HomeRestoreState | undefined;

    if (state) {
      setActiveCategory(state.activeCategory);
      setRestoreScroll(state.scrollY);
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  const fetchProducts = async (category: 'women' | 'children', pageSize: number = 4) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('jwt_token') || 'jwt_token';
      const apiUrl = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(
        `${apiUrl}/api/products/${category}?pageNumber=1&pageSize=${pageSize}`,
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
        ...item,
        inStock: item.inStock !== undefined ? item.inStock : true,
        isOffer: item.isOffer !== undefined ? item.isOffer : false,
        originalPrice:
          item.originalPrice !== undefined ? item.originalPrice : undefined,
      }));

      return mappedProducts;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error fetching products. Please try again later.'
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchAllProducts = async () => {
      const womenData = await fetchProducts('women', 6);
      const childrenData = await fetchProducts('children', 6);
      setWomenProducts(womenData);
      setChildrenProducts(childrenData);
    };

    fetchAllProducts();
  }, []);

  const currentProducts =
    activeCategory === 'women' ? womenProducts : childrenProducts;

  useEffect(() => {
    if (restoreScroll !== null && !loading && currentProducts.length > 0) {
      const timer = setTimeout(() => {
        window.scrollTo(0, restoreScroll);
        setRestoreScroll(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, restoreScroll, currentProducts]);

  const handleViewProduct = (product: Product) => {
    navigate(`/product/${product.id}`, {
      state: {
        product,
        fromHome: {
          scrollY: window.scrollY,
          activeCategory: activeCategory,
        },
      },
    });
  };

  const handleAddToCart = (product: Product) => {
    if (!product.inStock) {
      return;
    }

    if (
      (product.sizes && product.sizes.length > 0) ||
      (product.colors && product.colors.length > 0)
    ) {
      handleViewProduct(product);
    } else {
      dispatch({
        type: 'ADD_TO_CART',
        payload: {
          product,
          quantity: 1,
          selectedSize: product.sizes ? product.sizes[0] : '',
          selectedColor: product.colors ? product.colors[0] : '',
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section - Prince Cake style */}
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center mb-12">
          <div className="relative mb-8 animate-float">
            <div className="absolute -top-6 -right-6 text-pink-400 animate-pulse">
              <Sparkles className="h-8 w-8" />
            </div>
            <div className="absolute -bottom-6 -left-6 text-amber-400 animate-pulse">
              <Heart className="h-8 w-8 fill-current" />
            </div>
            <img
              src="/logo_with_slogan.jpg"
              alt="Prince Cake"
              className="h-48 w-48 md:h-64 md:w-64 rounded-full object-cover shadow-2xl border-8 border-white"
            />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-purple-900 mb-4">
            Prince Cake
          </h1>
          <p className="text-2xl md:text-3xl text-amber-600 font-medium mb-8">
            برنس الكيك في مصر
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md">
              <Cake className="h-6 w-6 text-pink-500" />
              <span className="text-gray-700 font-medium">حلويات فاخرة</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md">
              <Heart className="h-6 w-6 text-pink-500 fill-current" />
              <span className="text-gray-700 font-medium">مصنوعة بحب</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-md">
              <Sparkles className="h-6 w-6 text-amber-500" />
              <span className="text-gray-700 font-medium">طعم لا يُنسى</span>
            </div>
          </div>

          {/* Main CTAs like original Home */}
          <div className="space-y-4 w-full max-w-md">
            <button
              onClick={() => navigate('/menu')}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 rounded-2xl text-lg font-bold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              تصفح المنيو
            </button>
            <button
              onClick={() => navigate('/custom')}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white py-4 rounded-2xl text-lg font-bold hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              اطلب تورتة خاصة
            </button>
          </div>

          <div className="mt-12 text-gray-600 text-sm">
            <p>كل لحظة سعيدة تبدأ بقطعة حلوى من برنس كيك</p>
          </div>
        </div>

        {/* Category Toggle (keeps your women/children logic, just UI) */}
        <div className="flex flex-col items-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-purple-900 mb-4">
            استكشف التورتات
          </h2>
        </div>

        {/* Loading / error / products */}
        {loading && currentProducts.length === 0 ? (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
              {currentProducts.map((product) => (
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
            {currentProducts.length > 0 && (
              <div className="text-center mb-20">
                <button
                  onClick={() =>
                    navigate(
                      activeCategory === 'women' ? '/menu' : '/children'
                    )
                  }
                  className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-12 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-600 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 text-lg"
                >
                  عرض كل التورتات
                </button>
              </div>
            )}

            {/* No Products Found */}
            {currentProducts.length === 0 && !loading && (
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

        {/* Features Section - Prince Cake style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <Cake className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold text-purple-900 mb-2">
              جودة عالية
            </h3>
            <p className="text-gray-600">
              نستخدم أفضل المكونات لضمان طعم مميز
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 rounded-full mb-4">
              <Heart className="h-8 w-8 text-pink-600 fill-current" />
            </div>
            <h3 className="text-xl font-bold text-purple-900 mb-2">
              صنع بحب
            </h3>
            <p className="text-gray-600">كل منتج يُحضّر بعناية واهتمام</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
              <Sparkles className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-bold text-purple-900 mb-2">
              تصاميم مميزة
            </h3>
            <p className="text-gray-600">تورتات خاصة لكل المناسبات</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;