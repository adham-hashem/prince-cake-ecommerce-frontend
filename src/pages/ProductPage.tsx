import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  ShoppingCart,
  Loader2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Share2,
  Check,
  Sparkles,
  Cake,
  Heart,
  Star,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';

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
  const [product, setProduct] = useState<Product | null>(
    location.state?.product || null
  );
  const [loading, setLoading] = useState(!product);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const [productRestricted, setProductRestricted] = useState<string | null>(
    null
  );

  const productUrl = `${window.location.origin}/product/${id}`;

  // Effects
  useEffect(() => {
    document.body.style.overflowX = 'hidden';
    return () => {
      document.body.style.overflowX = 'auto';
    };
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
    if (addedToCart) {
      const timer = setTimeout(() => setAddedToCart(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [addedToCart]);

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
            setProductRestricted('هذا المنتج غير متاح للعرض حالياً.');
          }
          if (!data.isAvailable) {
            setProductRestricted('المنتج غير متاح حالياً.');
          }

          setProduct(data);
        } catch (err) {
          setError(
            err instanceof Error ? err.message : 'فشل في تحميل المنتج.'
          );
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
          title: `${product?.name} - ${product?.price.toFixed(2)} جنيه | Prince Cake`,
          text: `🎂 ${product?.name} من برنس كيك`,
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
    if (
      !product ||
      addingToCart ||
      productRestricted ||
      product.isHidden ||
      !product.isAvailable
    )
      return;

    setAddingToCart(true);
    try {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        alert('يرجى تسجيل الدخول أولاً لإضافة المنتج للسلة');
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

      setAddedToCart(true);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'حدث خطأ أثناء إضافة المنتج إلى السلة'
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const isPurchaseDisabled =
    addingToCart || !product || product.isHidden || !product.isAvailable;

  let statusMessage = productRestricted;
  if (!statusMessage && product) {
    if (product.isHidden)
      statusMessage = 'هذا المنتج غير متاح للعرض حالياً.';
    else if (!product.isAvailable) statusMessage = 'المنتج غير متاح حالياً.';
    else statusMessage = 'متوفر وجاهز للطلب الآن! 🎂';
  }

  // Loading screen
  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50 flex items-center justify-center px-4"
        dir="rtl"
      >
        <div className="text-center py-12">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-4">
              <Cake className="h-12 w-12 text-white animate-bounce" />
            </div>
          </div>
          <p className="text-purple-900 font-bold text-lg">
            جاري تحميل التورتة...
          </p>
          <p className="text-gray-500 text-sm mt-2">انتظر لحظة 🍰</p>
        </div>
      </div>
    );
  }

  // Error or restricted
  if (error || !product || productRestricted) {
    return (
      <div
        className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50 flex items-center justify-center px-4 py-8"
        dir="rtl"
      >
        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl text-center w-full max-w-md border border-white/50">
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
              <AlertTriangle className="text-red-500" size={40} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-purple-900 mb-3">
            {error ? 'حدث خطأ' : 'عذراً!'}
          </h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            {error || productRestricted}
          </p>

          <div className="space-y-3">
            <Link
              to="/"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-4 rounded-2xl hover:from-purple-700 hover:to-pink-600 font-bold flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Cake size={20} />
              <span>تصفح التورتات</span>
            </Link>
            <button
              onClick={() => navigate(-1)}
              className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-200 font-medium transition-all"
            >
              العودة للخلف
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN PRODUCT PAGE
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50"
      dir="rtl"
    >
      <div className="pt-4 pb-12 px-4 lg:px-8 max-w-7xl mx-auto">
        {/* Back button + Share */}
        <div className="mb-6 lg:mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-purple-600 font-medium py-2 transition-colors"
          >
            <ArrowRight size={20} className="ml-2" />
            <span>العودة</span>
          </button>

          <button
            onClick={handleShare}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium shadow-md ${
              copied
                ? 'bg-green-500 text-white shadow-green-300'
                : 'bg-white text-gray-700 border-2 border-purple-200 hover:border-purple-400 hover:text-purple-600 hover:shadow-lg'
            }`}
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

        {/* Added to Cart Notification */}
        {addedToCart && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
            <div className="bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
              <Check size={24} />
              <span className="font-bold">تمت الإضافة للسلة بنجاح! 🎂</span>
            </div>
          </div>
        )}

        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/50">
          {/* Product Grid */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-0">
            {/* Images Section */}
            <div className="w-full lg:order-1">
              <div
                className="relative w-full overflow-hidden bg-gradient-to-br from-purple-100 to-pink-100 aspect-square"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={`${apiUrl}${product.images[currentImageIndex]?.imagePath}`}
                  alt={product.name}
                  className="w-full h-full object-contain select-none"
                />

                {/* Discount Badge */}
                {product.originalPrice && (
                  <div className="absolute top-4 right-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                    خصم{' '}
                    {Math.round(
                      ((product.originalPrice - product.price) /
                        product.originalPrice) *
                        100
                    )}
                    %
                  </div>
                )}

                {/* Navigation arrows */}
                {product.images.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev > 0 ? prev - 1 : product.images.length - 1
                        )
                      }
                      className="hidden lg:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 text-purple-600 p-3 rounded-full hover:bg-white hover:shadow-xl transition-all shadow-lg"
                    >
                      <ChevronLeft size={24} />
                    </button>

                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) =>
                          prev < product.images.length - 1 ? prev + 1 : 0
                        )
                      }
                      className="hidden lg:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 text-purple-600 p-3 rounded-full hover:bg-white hover:shadow-xl transition-all shadow-lg"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                {/* Dots indicator */}
                {product.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white/80 backdrop-blur-sm rounded-full py-2 px-4 shadow-lg">
                    {product.images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          currentImageIndex === i
                            ? 'bg-purple-600 scale-125'
                            : 'bg-gray-300 hover:bg-purple-400'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="px-4 lg:px-6 py-4 bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                    {product.images.map((image, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImageIndex(i)}
                        className={`h-20 w-20 lg:h-24 lg:w-24 flex-shrink-0 rounded-xl overflow-hidden border-3 transition-all shadow-md hover:shadow-xl ${
                          currentImageIndex === i
                            ? 'border-purple-500 shadow-purple-300 scale-105'
                            : 'border-white hover:border-purple-300'
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

            {/* Details Section */}
            <div className="p-6 lg:p-8 xl:p-10 space-y-6 lg:order-2">
              {/* Title */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <span className="text-amber-600 font-medium text-sm">
                    من برنس كيك
                  </span>
                </div>
                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-purple-900 leading-tight mb-4">
                  {product.name}
                </h1>
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Category + Code */}
              <div className="flex flex-wrap gap-3">
                <span className="px-4 py-2 bg-pink-100 text-pink-700 text-sm rounded-full font-medium">
                  كود: {product.code}
                </span>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-4 border-2 border-purple-100">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl lg:text-4xl font-black text-purple-600">
                    {product.price.toFixed(2)}
                  </span>
                  <span className="text-xl text-purple-600 font-bold">جنيه</span>
                  {product.originalPrice && (
                    <span className="text-xl text-gray-400 line-through font-medium">
                      {product.originalPrice.toFixed(2)} جنيه
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex justify-between items-center bg-gray-50 rounded-2xl p-4">
                <h3 className="font-bold text-purple-900 text-lg">الكمية</h3>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={isPurchaseDisabled}
                    className="w-12 h-12 flex items-center justify-center bg-white border-2 border-purple-200 rounded-xl font-bold text-xl text-purple-600 shadow-md hover:shadow-lg hover:border-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="text-2xl font-black text-purple-600 min-w-[2rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={isPurchaseDisabled}
                    className="w-12 h-12 flex items-center justify-center bg-white border-2 border-purple-200 rounded-xl font-bold text-xl text-purple-600 shadow-md hover:shadow-lg hover:border-purple-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isPurchaseDisabled}
                className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${
                  addedToCart
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 hover:shadow-2xl hover:scale-[1.02]'
                } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
              >
                {addingToCart ? (
                  <>
                    <Loader2 size={24} className="animate-spin" />
                    <span>جاري الإضافة...</span>
                  </>
                ) : addedToCart ? (
                  <>
                    <Check size={24} />
                    <span>تمت الإضافة ✓</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart size={24} />
                    <span>أضف للسلة</span>
                  </>
                )}
              </button>

              {/* Status */}
              <div
                className={`p-4 rounded-2xl font-medium flex items-center gap-3 ${
                  isPurchaseDisabled
                    ? 'bg-red-50 border-2 border-red-200 text-red-700'
                    : 'bg-green-50 border-2 border-green-200 text-green-700'
                }`}
              >
                {isPurchaseDisabled ? (
                  <AlertTriangle size={24} />
                ) : (
                  <Check size={24} className="text-green-600" />
                )}
                <span>{statusMessage}</span>
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-3 pt-4 border-t border-purple-100">
                <div className="text-center p-3 bg-purple-50 rounded-xl">
                  <Cake className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                  <p className="text-xs text-gray-600">جودة عالية</p>
                </div>
                <div className="text-center p-3 bg-pink-50 rounded-xl">
                  <Heart className="h-6 w-6 text-pink-600 mx-auto mb-1 fill-current" />
                  <p className="text-xs text-gray-600">صنع بحب</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-xl">
                  <Star className="h-6 w-6 text-amber-600 mx-auto mb-1 fill-current" />
                  <p className="text-xs text-gray-600">طعم مميز</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Contact */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-3">هل لديك سؤال عن هذه التورتة؟</p>
          <a
            href={`https://wa.me/201000070653?text=مرحباً، أريد الاستفسار عن: ${product.name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-green-600 transition-all shadow-lg hover:shadow-xl"
          >
            <span>💬</span>
            <span>تواصل معنا عبر واتساب</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;