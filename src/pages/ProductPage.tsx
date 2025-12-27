import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShoppingCart,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Share2,
  Check
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

// Product interface (unchanged)
interface Product {
  id: string;
  name: string;
  code: string;
  description: string;
  price: number;
  originalPrice?: number;
  createdAt: string;
  category: number;
  isHidden: boolean;
  isAvailable: boolean;
  season: number;
  sizes: string[];
  colors: string[];
  images: { imagePath: string; id: string; isMain: boolean }[];
  rowVersion: string;
}

const apiUrl = import.meta.env.VITE_API_BASE_URL;

const ProductPage: React.FC = () => {
  const { dispatch } = useApp();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [copied, setCopied] = useState(false);
  const [product, setProduct] = useState<Product | null>(location.state?.product || null);
  const [loading, setLoading] = useState(!product);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const [productRestricted, setProductRestricted] = useState<string | null>(null);

  const productUrl = `${window.location.origin}/product/${id}`;

  // Arabic labels
  const categoryLabel = {
    0: 'حريمي',
    1: 'أطفال'
  };

  const seasonLabel = {
    0: 'جميع المواسم',
    1: 'صيفي',
    2: 'شتوي'
  };

  // Effects (unchanged)
  useEffect(() => {
    document.body.style.overflowX = 'hidden';
    return () => { document.body.style.overflowX = 'auto'; };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  useEffect(() => {
    if (!product && id) {
      const fetchProduct = async () => {
        setLoading(true);
        setError(null);
        setProductRestricted(null);

        try {
          const token = localStorage.getItem('accessToken');
          const response = await fetch(`${apiUrl}/api/products/${id}`, {
            headers: {
              Authorization: token ? `Bearer ${token}` : '',
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error('Product not found or access denied.');
          }

          const data: Product = await response.json();

          if (data.isHidden) {
            setProductRestricted('هذا المنتج غير مرئي للجمهور حالياً.');
          }
          if (!data.isAvailable) {
            setProductRestricted('المنتج غير متاح حالياً.');
          }

          setProduct(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'فشل في تحميل المنتج.');
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, product]);

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || '');
      setSelectedColor(product.colors[0] || '');
    }
  }, [product]);

  // Share functions
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product?.name} - ${product?.price.toFixed(2)} جنيه`,
          text: product?.name,
          url: productUrl,
        });
      } catch (error) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      setCopied(true);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = productUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
    }
  };

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(e.touches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX !== null && touchEndX !== null && product) {
      const diff = touchStartX - touchEndX;
      const threshold = 35;

      if (Math.abs(diff) > threshold) {
        if (diff > 0) {
          setCurrentImageIndex((prev) =>
            prev < product.images.length - 1 ? prev + 1 : 0
          );
        } else {
          setCurrentImageIndex((prev) =>
            prev > 0 ? prev - 1 : product.images.length - 1
          );
        }
      }
    }
  };

  const handleAddToCart = async () => {
    if (!product || addingToCart || productRestricted || product.isHidden || !product.isAvailable)
      return;

    setAddingToCart(true);
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        alert('يرجى تسجيل الدخول أولاً');
        navigate('/login');
        return;
      }

      const response = await fetch(`${apiUrl}/api/cart/items`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          size: selectedSize,
          color: selectedColor,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل في إضافة المنتج إلى السلة');
      }

      dispatch({
        type: 'ADD_TO_CART',
        payload: { product, quantity, selectedSize, selectedColor },
      });

    } catch (error) {
      setError(error instanceof Error ? error.message : 'حدث خطأ أثناء إضافة المنتج إلى السلة');
    } finally {
      setAddingToCart(false);
    }
  };

  const isPurchaseDisabled =
    addingToCart || !product || product.isHidden || !product.isAvailable;

  let statusMessage = productRestricted;
  if (!statusMessage && product) {
    if (product.isHidden) statusMessage = 'هذا المنتج غير مرئي للجمهور حالياً.';
    else if (!product.isAvailable) statusMessage = 'المنتج غير متاح حالياً.';
    else statusMessage = 'متوفر في المخزن وجاهز للشراء.';
  }

  // Loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4" dir="rtl">
        <div className="text-center py-12">
          <Loader2 className="animate-spin text-pink-600 mx-auto mb-4" size={32} />
          <span className="text-gray-600 text-sm">جاري تحميل المنتج...</span>
        </div>
      </div>
    );
  }

  // Error or restricted
  if (error || !product || productRestricted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8" dir="rtl">
        <div className="bg-white p-6 rounded-2xl shadow-md text-center w-full max-w-sm">
          <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold mb-2">
            {error ? 'حدث خطأ' : 'وصول مقيد'}
          </h2>
          <p className="text-gray-600 mb-8 text-sm leading-relaxed">
            {error || productRestricted}
          </p>

          <button
            onClick={() => navigate('/')}
            className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 w-full font-medium text-sm"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  // MAIN PRODUCT PAGE - 🎯 FIXED: Details LEFT, Images RIGHT on desktop
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="pt-2 pb-12 px-4 lg:px-8 max-w-7xl mx-auto">
        
        {/* Back button + Share */}
        <div className="mb-6 lg:mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-pink-600 text-sm lg:text-base font-medium py-2"
          >
            <ArrowRight size={18} className="ml-2" />
            <span>العودة</span>
          </button>
          
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 p-2 rounded-xl transition-all font-medium text-sm shadow-md ${
              copied
                ? 'bg-green-500 text-white shadow-green-300 hover:shadow-green-400'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-pink-200 hover:text-pink-600 hover:shadow-lg'
            }`}
            title={copied ? 'تم النسخ!' : 'مشاركة المنتج'}
          >
            {copied ? (
              <>
                <Check size={18} />
                <span>تم النسخ!</span>
              </>
            ) : (
              <>
                <Share2 size={18} />
                <span className="hidden sm:inline">مشاركة</span>
              </>
            )}
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          
          {/* 🎯 DESKTOP: 2-COLUMN REVERSED (Details LEFT, Images RIGHT) | MOBILE: 1-COLUMN */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-8">

            {/* Images Section - DESKTOP RIGHT SIDE | MOBILE FULL WIDTH */}
            <div className="w-full lg:order-1">
              <div
                className="relative w-full overflow-hidden bg-gray-100 aspect-[4/5] lg:aspect-video"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={`${apiUrl}${product.images[currentImageIndex]?.imagePath}`}
                  alt={product.name}
                  className="w-full h-full object-contain select-none"
                />

                {/* Navigation arrows - Desktop only */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev > 0 ? prev - 1 : product.images.length - 1
                        )
                      }
                      className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black/90 transition-all"
                    >
                                            <ChevronLeft size={24} />
                    </button>

                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev < product.images.length - 1 ? prev + 1 : 0
                        )
                      }
                      className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 text-white p-3 rounded-full hover:bg-black/90 transition-all"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Dots indicator */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 lg:left-4 lg:-translate-y-1/2 lg:translate-x-0 flex gap-2 bg-black/50 rounded-full py-2 px-3">
                    {product.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`w-3 h-3 lg:w-2 lg:h-2 rounded-full transition-all ${
                          currentImageIndex === i 
                            ? 'bg-pink-600 scale-125 shadow-lg' 
                            : 'bg-white/60 hover:bg-white'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="px-3 lg:px-6 py-4 lg:py-6 bg-gray-50">
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    {product.images.map((image, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`h-20 w-20 lg:h-24 lg:w-24 flex-shrink-0 rounded-xl overflow-hidden border-3 transition-all shadow-md hover:shadow-xl ${
                          currentImageIndex === i 
                            ? 'border-pink-600 bg-pink-50 shadow-pink-300' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={`${apiUrl}${image.imagePath}`}
                          alt={`thumbnail ${i}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Details Section - DESKTOP LEFT SIDE | MOBILE FULL WIDTH */}
            <div className="p-4 lg:p-8 xl:p-12 space-y-6 lg:space-y-8 lg:max-w-2xl lg:order-2">
              
              {/* Title & Description - FIXED: Better line height and word wrapping */}
              <div>
                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold leading-tight mb-4 lg:mb-6 break-words hyphens-auto">
                  {product.name}
                </h1>
                <p className="text-gray-600 text-base lg:text-lg xl:text-xl leading-relaxed line-clamp-4">
                  {product.description}
                </p>
              </div>

              {/* Category + Season */}
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-blue-50 text-blue-700 text-sm lg:text-base rounded-xl font-semibold shadow-sm">
                  التصنيف: {categoryLabel[product.category as keyof typeof categoryLabel]}
                </span>
                <span className="px-4 py-2 bg-green-50 text-green-700 text-sm lg:text-base rounded-xl font-semibold shadow-sm">
                  الموسم: {seasonLabel[product.season as keyof typeof seasonLabel]}
                </span>
              </div>

              {/* Price */}
              <div className="flex gap-4 items-baseline">
                <span className="text-3xl lg:text-4xl xl:text-5xl font-black text-pink-600 tracking-tight">
                  {product.price.toFixed(2)} جنيه
                </span>
                {product.originalPrice && (
                  <span className="text-xl lg:text-2xl xl:text-3xl text-gray-500 line-through font-light">
                    {product.originalPrice.toFixed(2)} جنيه
                  </span>
                )}
              </div>

              {/* Color Selector */}
              {product.colors.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg lg:text-xl mb-4 flex items-center gap-2">
                    الألوان
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedColor(color)}
                        disabled={isPurchaseDisabled}
                        className={`px-6 lg:px-8 py-3 lg:py-4 rounded-xl border-3 font-semibold text-sm lg:text-base shadow-lg transition-all hover:shadow-xl ${
                          selectedColor === color
                            ? 'bg-pink-600 text-white border-pink-600 shadow-pink-300 scale-105'
                            : 'bg-white text-gray-800 border-gray-300 hover:border-pink-400 hover:scale-105 hover:text-pink-700'
                        } ${isPurchaseDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes.length > 0 && (
                <div>
                  <h3 className="font-bold text-lg lg:text-xl mb-4 flex items-center gap-2">
                    المقاسات
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedSize(size)}
                        disabled={isPurchaseDisabled}
                        className={`px-6 lg:px-8 py-3 lg:py-4 rounded-xl border-3 font-semibold text-sm lg:text-base shadow-lg transition-all hover:shadow-xl ${
                          selectedSize === size
                            ? 'bg-pink-600 text-white border-pink-600 shadow-pink-300 scale-105'
                            : 'bg-white text-gray-800 border-gray-300 hover:border-pink-400 hover:scale-105 hover:text-pink-700'
                        } ${isPurchaseDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg lg:text-xl">الكمية</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isPurchaseDisabled}
                    className="w-14 h-14 lg:w-16 lg:h-16 flex items-center justify-center border-3 rounded-2xl font-bold text-2xl lg:text-3xl shadow-xl transition-all hover:shadow-2xl hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-lg bg-white border-gray-300 hover:border-pink-400"
                  >
                    -
                  </button>
                  <span className="text-2xl lg:text-4xl font-black min-w-[3rem] text-center text-pink-600">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={isPurchaseDisabled}
                    className="w-14 h-14 lg:w-16 lg:h-16 flex items-center justify-center border-3 rounded-2xl font-bold text-2xl lg:text-3xl shadow-xl transition-all hover:shadow-2xl hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-lg bg-white border-gray-300 hover:border-pink-400"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isPurchaseDisabled}
                className="w-full h-16 lg:h-20 bg-gradient-to-r from-pink-600 to-pink-700 text-white py-4 lg:py-6 rounded-2xl font-bold text-lg lg:text-xl shadow-2xl hover:from-pink-700 hover:to-pink-800 hover:shadow-3xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-lg flex items-center justify-center gap-3"
              >
                {addingToCart ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    جاري الإضافة...
                  </>
                ) : (
                  <>
                    <ShoppingCart size={24} />
                    أضف إلى السلة
                  </>
                )}
              </button>

              {/* Status */}
              <div
                className={`p-6 lg:p-8 rounded-2xl font-semibold flex items-center gap-3 shadow-lg ${
                  isPurchaseDisabled 
                    ? 'bg-red-50 border-4 border-red-200 text-red-800' 
                    : 'bg-green-50 border-4 border-green-200 text-green-800'
                }`}
              >
                {isPurchaseDisabled ? (
                  <AlertTriangle size={28} />
                ) : (
                  <span className="text-3xl font-black">✓</span>
                )}
                <span className="text-base lg:text-lg leading-relaxed">
                  {isPurchaseDisabled 
                    ? (product.isHidden 
                        ? 'هذا المنتج غير مرئي حالياً.'
                        : 'المنتج غير متاح حالياً.')
                    : statusMessage
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;