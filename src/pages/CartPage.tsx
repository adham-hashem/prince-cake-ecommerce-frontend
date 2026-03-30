import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getImageUrl } from '../utils/imageUtils';
import { ArrowRight, Trash2, Plus, Minus, Loader2, ShoppingCart, Sparkles } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { CartItem } from '../types';

// --- Inline Interfaces ---
interface CartItemImage {
  id: string;
  imagePath: string;
  isMain: boolean;
}

interface ApiCartResponse {
  id: string;
  userId: string;
  createdAt: string;
  items: {
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    size: string;
    color: string;
    price: number;
    images: CartItemImage[];
  }[];
  total: number;
}
// -------------------------

const CartPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [isClearingCart, setIsClearingCart] = useState(false);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // Fetch authentication token
  useEffect(() => {
    const authToken = localStorage.getItem('accessToken');
    setToken(authToken);
    // Guest access allowed - no redirect
  }, []);

  // Fetch cart data
  const fetchCart = useCallback(async () => {
    if (!token) {
      // Guest user: Cart is managed by AppContext/localStorage
      setCartItems(state.cart);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${apiUrl}/api/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid - fallback to guest mode
          localStorage.removeItem('accessToken');
          setToken(null);
          setCartItems(state.cart);
          setLoading(false);
          return;
          // throw new Error('جلسة منتهية، يرجى تسجيل الدخول مرة أخرى');
        }
        throw new Error('فشل في جلب بيانات السلة');
      }

      const data: ApiCartResponse = await response.json();
      const normalizedItems: CartItem[] = data.items.map(item => ({
        id: item.id,
        product: {
          id: item.productId,
          name: item.productName,
          price: item.price,
        },
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        images: item.images.map(img => {
          let fullPath = img.imagePath;
          if (!fullPath.startsWith('http://') && !fullPath.startsWith('https://')) {
            fullPath = fullPath.startsWith('/') ? fullPath : `/${fullPath}`;
            fullPath = `${apiUrl}${fullPath}`;
          }
          return {
            ...img,
            imagePath: fullPath,
          };
        }),
      }));

      setCartItems(normalizedItems || []);
      dispatch({ type: 'SET_CART', payload: normalizedItems || [] });
    } catch (err) {
      console.error('Cart fetch error:', err);
      // Fallback to local state on error
      setCartItems(state.cart);
      setError(null); // Clear error to allow viewing local cart
    } finally {
      setLoading(false);
    }
  }, [dispatch, token, apiUrl, state.cart]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(itemId);
      return;
    }

    const previousItems = [...cartItems];
    const updatedItems = cartItems.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);
    dispatch({ type: 'SET_CART', payload: updatedItems });

    if (!token) {
      // Guest user: Local update only
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/cart/items/${itemId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newQuantity),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          throw new Error('جلسة منتهية، يرجى تسجيل الدخول مرة أخرى');
        } else if (response.status === 400) {
          throw new Error('كمية غير صالحة');
        } else if (response.status === 404) {
          throw new Error('العنصر غير موجود في السلة');
        } else if (response.status === 409) {
          throw new Error('تم تعديل العنصر من قبل مستخدم آخر، يرجى إعادة المحاولة');
        }
        throw new Error(errorText || 'فشل في تحديث الكمية');
      }

      await fetchCart();
    } catch (err) {
      setCartItems(previousItems);
      dispatch({ type: 'SET_CART', payload: previousItems });
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تحديث الكمية');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    const previousItems = [...cartItems];
    const updatedItems = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedItems);
    dispatch({ type: 'SET_CART', payload: updatedItems });

    if (!token) {
      // Guest user: Local update only
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/cart/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          throw new Error('جلسة منتهية، يرجى تسجيل الدخول مرة أخرى');
        } else if (response.status === 404) {
          throw new Error('العنصر غير موجود في السلة');
        } else if (errorText.includes('REFERENCE constraint') || errorText.includes('Orders')) {
          throw new Error('لا يمكن حذف هذا العنصر لأنه مرتبط بطلب حالي');
        }
        throw new Error(errorText || 'فشل في إزالة العنصر');
      }
    } catch (err) {
      setCartItems(previousItems);
      dispatch({ type: 'SET_CART', payload: previousItems });
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إزالة العنصر');
    }
  };

  const handleClearCart = async () => {
    if (!window.confirm('هل أنت متأكد من إفراغ السلة؟')) {
      return;
    }

    setIsClearingCart(true);
    const previousItems = [...cartItems];
    setCartItems([]);
    dispatch({ type: 'SET_CART', payload: [] });

    if (!token) {
      // Guest user: Local update only
      setIsClearingCart(false);
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/api/cart`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          throw new Error('جلسة منتهية، يرجى تسجيل الدخول مرة أخرى');
        } else if (errorText.includes('REFERENCE constraint') || errorText.includes('Orders')) {
          throw new Error('لا يمكن إفراغ السلة لأنها تحتوي على عناصر مرتبطة بطلبات حالية');
        }
        throw new Error(errorText || 'فشل في إفراغ السلة');
      }
    } catch (err) {
      setCartItems(previousItems);
      dispatch({ type: 'SET_CART', payload: previousItems });
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء إفراغ السلة');
    } finally {
      setIsClearingCart(false);
    }
  };

  const handleApplyDiscountCode = async () => {
    if (!token) {
      alert('يرجى تسجيل الدخول لتطبيق كود الخصم');
      navigate('/');
      return;
    }

    if (!discountCode.trim()) {
      alert('يرجى إدخال كود خصم صالح');
      return;
    }

    setIsApplyingDiscount(true);
    try {
      const response = await fetch(`${apiUrl}/api/cart/discount`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: discountCode }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 401) {
          throw new Error('جلسة منتهية، يرجى تسجيل الدخول مرة أخرى');
        } else if (response.status === 400 || errorText.includes('invalid')) {
          throw new Error('كود الخصم غير صحيح أو منتهي الصلاحية');
        }
        throw new Error(errorText || 'فشل في تطبيق كود الخصم');
      }

      const data = await response.json();
      const discount = data.discountPercentage || 0;
      setAppliedDiscount(discount);
      if (discount <= 0) {
        alert('كود الخصم غير صحيح أو منتهي الصلاحية');
      } else {
        alert(`تم تطبيق خصم ${discount}% بنجاح`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ أثناء تطبيق كود الخصم');
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const subtotal = cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
  const discountAmount = (subtotal * appliedDiscount) / 100;
  const total = subtotal - discountAmount;

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center px-4" dir="rtl">
        <div className="text-center py-12">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 bg-purple-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative bg-purple-600 rounded-full p-4">
              <ShoppingCart className="h-12 w-12 text-white animate-bounce" />
            </div>
          </div>
          <p className="text-purple-900 font-bold text-lg">جاري تحميل السلة...</p>
          <p className="text-gray-500 text-sm mt-2">انتظر لحظة 🛒</p>
        </div>
      </div>
    );
  }

  if (error && cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center px-4" dir="rtl">
        <div className="text-center bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full border-2 border-purple-100">
          <div className="text-5xl sm:text-6xl mb-4">⚠️</div>
          <h2 className="text-xl sm:text-2xl font-bold text-red-600 mb-3">حدث خطأ</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchCart}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 font-semibold shadow-lg transition-all text-sm sm:text-base"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center px-4" dir="rtl">
        <div className="text-center bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full border-2 border-purple-100">
          <div className="text-5xl sm:text-6xl mb-4">🛒</div>
          <h2 className="text-xl sm:text-2xl font-bold text-purple-900 mb-3">السلة فارغة</h2>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">لم تقم بإضافة أي منتجات بعد</p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-purple-600 text-white px-6 py-3 rounded-xl hover:bg-purple-700 font-semibold shadow-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <Sparkles size={20} />
            <span>تصفح المنتجات</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-purple-50 py-4 sm:py-6 md:py-8" dir="rtl">
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-purple-700 hover:text-purple-900 font-medium mb-4 sm:mb-6 transition-colors text-sm sm:text-base"
        >
          <ArrowRight size={20} className="ml-2" />
          <span>العودة للتسوق</span>
        </button>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 p-3 sm:p-4 rounded-xl sm:rounded-2xl mb-4 sm:mb-6 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-sm sm:text-base">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-700 hover:text-red-900 font-bold text-xl"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 border-2 border-purple-100">
            <div className="flex justify-between items-center mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-purple-100">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-purple-900 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                <span>سلة التسوق ({cartItems.length})</span>
              </h2>
              <button
                onClick={handleClearCart}
                disabled={isClearingCart}
                className="flex items-center text-red-600 hover:text-red-700 font-semibold text-xs sm:text-sm md:text-base disabled:opacity-50 transition-colors"
              >
                {isClearingCart ? (
                  <Loader2 className="animate-spin ml-1 sm:ml-2" size={16} />
                ) : (
                  <Trash2 className="ml-1 sm:ml-2" size={16} />
                )}
                <span className="hidden sm:inline">إفراغ السلة</span>
                <span className="sm:hidden">إفراغ</span>
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {cartItems.map((item) => {
                const itemImages = item.images || (item.product as any).images || [];
                const mainImage = itemImages.find((img: any) => img.isMain) || itemImages[0];
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 border-2 border-purple-100 rounded-xl sm:rounded-2xl hover:shadow-md transition-all bg-purple-50/30"
                  >
                    <img
                      src={
                        mainImage
                          ? getImageUrl(mainImage.imagePath, apiUrl)
                          : 'https://placehold.co/600x400/f5f3ff/7c3aed?text=🎂+Prince+Cake'
                      }
                      alt={item.product.name}
                      loading="lazy"
                      className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain rounded-lg sm:rounded-xl bg-white border-2 border-purple-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-purple-900 text-sm sm:text-base md:text-lg truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 mt-1">
                        المقاس: <span className="font-medium text-purple-700">{item.size || 'غير محدد'}</span>
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        اللون: <span className="font-medium text-purple-700">{item.color || 'غير محدد'}</span>
                      </p>
                      <p className="text-purple-700 font-black text-base sm:text-lg md:text-xl mt-1">
                        {item.product.price.toFixed(2)} جنيه
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <div className="flex items-center gap-1 sm:gap-2 bg-white border-2 border-purple-200 rounded-lg sm:rounded-xl p-1">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center hover:bg-purple-100 text-purple-700 transition-colors"
                          aria-label="تقليل الكمية"
                          disabled={isClearingCart}
                        >
                          <Minus size={14} className="sm:hidden" />
                          <Minus size={16} className="hidden sm:block" />
                        </button>
                        <span className="w-6 sm:w-8 text-center font-bold text-purple-900 text-sm sm:text-base">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center hover:bg-purple-100 text-purple-700 transition-colors"
                          aria-label="زيادة الكمية"
                          disabled={isClearingCart}
                        >
                          <Plus size={14} className="sm:hidden" />
                          <Plus size={16} className="hidden sm:block" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                        aria-label="إزالة العنصر"
                        disabled={isClearingCart}
                      >
                        <Trash2 size={16} className="sm:hidden" />
                        <Trash2 size={18} className="hidden sm:block" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 sticky top-4 sm:top-8 border-2 border-purple-100">
              <h3 className="text-lg sm:text-xl font-bold text-purple-900 mb-4 sm:mb-6 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                <span>ملخص الطلب</span>
              </h3>

              {/* Price Summary */}
              <div className="space-y-3 mb-4 sm:mb-6 pb-4 border-b-2 border-purple-100">
                <div className="flex justify-between text-sm sm:text-base">
                  <span className="text-gray-600">المجموع الفرعي</span>
                  <span className="font-semibold text-purple-900">{subtotal.toFixed(2)} جنيه</span>
                </div>
                {appliedDiscount > 0 && (
                  <div className="flex justify-between text-green-600 text-sm sm:text-base bg-green-50 p-2 rounded-lg">
                    <span className="font-medium">الخصم ({appliedDiscount}%)</span>
                    <span className="font-bold">-{discountAmount.toFixed(2)} جنيه</span>
                  </div>
                )}
                <div className="flex justify-between text-base sm:text-lg font-black pt-2">
                  <span className="text-purple-900">المجموع الكلي</span>
                  <span className="text-purple-700 text-xl sm:text-2xl">{total.toFixed(2)} جنيه</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-purple-600 text-white py-3 sm:py-3.5 rounded-xl sm:rounded-2xl hover:bg-purple-700 font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={isClearingCart}
              >
                <ShoppingCart size={20} />
                <span>إتمام الطلب</span>
              </button>

              {/* Security Note */}
              <p className="text-xs sm:text-sm text-gray-500 text-center mt-3 sm:mt-4">
                🔒 الدفع آمن ومضمون
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
