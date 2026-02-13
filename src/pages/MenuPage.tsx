import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Cake,
  Sparkles,
} from 'lucide-react';
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

interface MenuRestoreState {
  scrollY: number;
  pageNumber: number;
}

const MenuPage: React.FC = () => {
  const { dispatch } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [products, setProducts] = useState<Product[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoreScroll, setRestoreScroll] = useState<number | null>(null);

  const fetchProducts = async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('jwt_token') || 'jwt_token';
      const apiUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(
        `${apiUrl}/api/products?pageNumber=${page}&pageSize=10`,
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

      // Map products with safe defaults for all fields
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
        category: item.category ?? 0,
        type: item.type || undefined,
        season: item.season || undefined,
      }));

      setProducts(mappedProducts);
      setTotalPages(data.totalPages);
      setPageNumber(data.pageNumber);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Error fetching products. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  // initial load / restore
  useEffect(() => {
    const state = location.state?.fromMenuPage as
      | MenuRestoreState
      | undefined;

    if (state) {
      setPageNumber(state.pageNumber);
      setRestoreScroll(state.scrollY);
      fetchProducts(state.pageNumber);
    } else {
      window.scrollTo(0, 0);
      fetchProducts(1);
    }
  }, []); // mount only

  // restore scroll after data load
  useEffect(() => {
    if (restoreScroll !== null && !loading && products.length > 0) {
      const timer = setTimeout(() => {
        window.scrollTo(0, restoreScroll);
        setRestoreScroll(null);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [loading, products, restoreScroll]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== pageNumber) {
      window.scrollTo(0, 0);
      fetchProducts(page);
    }
  };

  const handlePrevPage = () => {
    if (pageNumber > 1) {
      window.scrollTo(0, 0);
      fetchProducts(pageNumber - 1);
    }
  };

  const handleNextPage = () => {
    if (pageNumber < totalPages) {
      window.scrollTo(0, 0);
      fetchProducts(pageNumber + 1);
    }
  };

  const handleViewProduct = (product: Product) => {
    navigate(`/product/${product.id}`, {
      state: {
        product,
        fromMenuPage: {
          scrollY: window.scrollY,
          pageNumber: pageNumber,
        },
      },
    });
  };

  const handleAddToCart = (product: Product) => {
    // Safety check
    if (!product || !product.inStock) {
      return;
    }

    // Check if product has sizes or colors with safety checks
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

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, pageNumber - 2);
      let end = Math.min(totalPages, pageNumber + 2);

      if (end - start < maxPagesToShow - 1) {
        if (start === 1) {
          end = Math.min(totalPages, start + maxPagesToShow - 1);
        } else {
          start = Math.max(1, end - maxPagesToShow + 1);
        }
      }

      if (start > 1) {
        pages.push(1);
        if (start > 2) pages.push('...');
      }

      for (let i = start; i <= end; i++) pages.push(i);

      if (end < totalPages) {
        if (end < totalPages - 1) pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = getPageNumbers();

    return (
      <div className="flex justify-center items-center space-x-2 mt-8 space-x-reverse">
        <button
          onClick={handlePrevPage}
          disabled={pageNumber === 1 || loading}
          className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={20} />
          <span className="mr-1">السابق</span>
        </button>

        <div className="flex space-x-1 space-x-reverse">
          {pageNumbers.map((page, index) =>
            page === '...' ? (
              <span key={index} className="px-3 py-2 text-gray-500">
                ...
              </span>
            ) : (
              <button
                key={index}
                onClick={() => handlePageChange(page as number)}
                disabled={loading}
                className={`px-3 py-2 rounded-lg transition-colors ${pageNumber === page
                  ? 'bg-purple-600 text-white'
                  : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                  } ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
              >
                {page}
              </button>
            )
          )}
        </div>

        <button
          onClick={handleNextPage}
          disabled={pageNumber === totalPages || loading}
          className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <span className="ml-1">التالي</span>
          <ChevronLeft size={20} />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-white py-8">
      <div className="container mx-auto px-4">
        <Link
          to="/"
          className="flex items-center space-x-reverse space-x-2 text-gray-600 hover:text-pink-600 mb-6 transition-colors"
        >
          <ArrowRight size={20} />
          <span>العودة للرئيسية</span>
        </Link>

        {/* Header like cake section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-amber-500" />
            <Cake className="h-10 w-10 text-purple-600" />
            <Sparkles className="h-8 w-8 text-pink-500" />
          </div>
          <h1 className="text-3xl font-bold text-purple-900 mb-3">
            تورتات برنس كيك
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            مجموعة مميزة من تورتات برنس كيك، بنكهات وتصاميم تناسب كل
            المناسبات
          </p>
        </div>

        {loading && products.length === 0 ? (
          <div className="text-center py-12">
            <Cake className="h-16 w-16 text-purple-500 mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              جار تحميل التورتات...
            </h2>
            <p className="text-gray-600">
              برجاء الانتظار حتى يتم تحميل جميع المنتجات.
            </p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
            <p className="text-gray-600 mb-6">
              حدث خطأ أثناء جلب التورتات. حاول مرة أخرى لاحقاً.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              العودة للرئيسية
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎂</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              لا توجد تورتات حالياً
            </h2>
            <p className="text-gray-600 mb-6">
              نعمل على إضافة تورتات جديدة ومميزة قريباً، تابعنا دائماً.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
            >
              العودة للرئيسية
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onViewProduct={handleViewProduct}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
            {renderPagination()}
          </>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
