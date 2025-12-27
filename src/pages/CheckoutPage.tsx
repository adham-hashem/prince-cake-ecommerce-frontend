import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  Calendar,
  Clock,
  CreditCard,
  Truck,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { CartItem } from '../types';

// Interfaces (Unchanged)
interface ShippingFee {
  id: string;
  governorate: string;
  fee: number;
  deliveryTime: string;
  status: number;
  createdAt: string;
}

interface DiscountCode {
  id: string;
  code: string;
  type: number;
  percentageValue: number | null;
  fixedValue: number | null;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  usageLimit: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  usageCount: number;
  createdAt: string;
}

interface ApiResponse {
  items: ShippingFee[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
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
    images: { id: string; imagePath: string; isMain: boolean }[];
  }[];
  total: number;
}

const CheckoutPage: React.FC = () => {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    governorate: '',
    paymentMethod: 'cash' as 'cash' | 'visa',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardName: '',
    discountCode: '',
    notes: '',
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [shippingFees, setShippingFees] = useState<ShippingFee[]>([]);
  const [loadingShippingFees, setLoadingShippingFees] = useState(true);
  const [errorShippingFees, setErrorShippingFees] = useState<string | null>(null);
  const [discount, setDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [loadingDiscount, setLoadingDiscount] = useState(false);
  const [errorDiscount, setErrorDiscount] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);
  const [loadingCart, setLoadingCart] = useState(true);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  // --- Cart Fetching Logic (Unchanged) ---
  const fetchCart = useCallback(async (retryCount = 3, retryDelay = 1000) => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setCartError('يرجى تسجيل الدخول لعرض السلة');
      setLoadingCart(false);
      navigate('/login');
      return;
    }
    setLoadingCart(true);
    setCartError(null);
    for (let attempt = 1; attempt <= retryCount; attempt++) {
      try {
        const response = await fetch(`${apiUrl}/api/cart`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('جلسة منتهية، يرجى تسجيل الدخول مرة أخرى');
          }
          throw new Error('فشل في جلب بيانات السلة');
        }
        const data: ApiCartResponse = await response.json();
        const normalizedItems: CartItem[] =
          data.items?.map((item) => ({
            id: item.id,
            product: {
              id: item.productId,
              name: item.productName || 'Unknown Product',
              price: item.price || 0,
            },
            quantity: item.quantity || 1,
            size: item.size || undefined,
            color: item.color || undefined,
            images:
              item.images?.map((img) => ({
                ...img,
                imagePath:
                  img.imagePath.startsWith('/Uploads') ||
                  img.imagePath.startsWith('/images')
                    ? `${apiUrl}${img.imagePath}`
                    : img.imagePath,
              })) || [],
          })) || [];
        dispatch({ type: 'SET_CART', payload: normalizedItems });
        if (normalizedItems.length === 0) {
          setCartError('السلة فارغة');
        }
        setLoadingCart(false);
        return;
      } catch (err) {
        if (attempt === retryCount) {
          setCartError(
            err instanceof Error ? err.message : 'حدث خطأ أثناء جلب بيانات السلة'
          );
          setLoadingCart(false);
          if (err instanceof Error && err.message.includes('جلسة منتهية')) {
            localStorage.removeItem('accessToken');
            navigate('/login');
          }
        } else {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
    }
  }, [dispatch, navigate, apiUrl]);

  // --- Shipping Fees Fetching Logic (Unchanged) ---
  const fetchShippingFees = useCallback(async () => {
    setLoadingShippingFees(true);
    setErrorShippingFees(null);
    try {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch(
        `${apiUrl}/api/shipping-fees?pageNumber=1&pageSize=30`,
        {
          method: 'GET',
          headers,
        }
      );
      if (!response.ok) {
        throw new Error(`فشل في جلب رسوم التوصيل: ${response.status}`);
      }
      const data: ApiResponse = await response.json();
      const cleanedItems = data.items
        .map((item) => ({
          ...item,
          governorate: item.governorate ? item.governorate.trim() : '',
        }))
        .filter((item) => item.governorate);
      setShippingFees(cleanedItems || []);
      if (
        formData.governorate &&
        !cleanedItems.some((item) => item.governorate === formData.governorate)
      ) {
        setFormData((prev) => ({ ...prev, governorate: '' }));
      }
    } catch (err) {
      setErrorShippingFees(
        err instanceof Error ? err.message : 'فشل في جلب رسوم التوصيل'
      );
    } finally {
      setLoadingShippingFees(false);
    }
  }, [apiUrl, formData.governorate]);

  // --- Calculations (Unchanged) ---
  const { subtotal, selectedGovernorate, shippingFee, discountAmount, total } =
    useMemo(() => {
      const subtotalCalc = state.cart.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );
      const selectedGov = shippingFees.find(
        (g) => g.governorate === formData.governorate
      );
      const shipFee = selectedGov?.fee || 0;
      const discountAmt = discount?.amount || 0;
      const totalCalc = Math.max(0, subtotalCalc - discountAmt + shipFee);
      return {
        subtotal: subtotalCalc,
        selectedGovernorate: selectedGov,
        shippingFee: shipFee,
        discountAmount: discountAmt,
        total: totalCalc,
      };
    }, [state.cart, shippingFees, formData.governorate, discount]);

  // --- Discount Code Fetching Logic (Unchanged) ---
  const fetchDiscountCode = useCallback(
    async (code: string) => {
      if (!code.trim()) return;
      setLoadingDiscount(true);
      setErrorDiscount(null);
      setDiscount(null);
      try {
        const response = await fetch(
          `${apiUrl}/api/discount-codes/code/${code}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
        if (!response.ok) {
          throw new Error(`فشل في التحقق من كود الخصم: ${response.status}`);
        }
        const data: DiscountCode = await response.json();
        if (!data.isActive) {
          throw new Error('الكود غير صالح أو منتهي الصلاحية');
        }
        const subtotalCalc = state.cart.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
        if (data.minOrderAmount > subtotalCalc) {
          throw new Error(
            `يجب أن يكون إجمالي الطلب ${data.minOrderAmount} جنيه على الأقل لاستخدام هذا الكود`
          );
        }
        let discountAmountCalc = 0;
        if (data.percentageValue) {
          discountAmountCalc = (subtotalCalc * data.percentageValue) / 100;
          if (
            data.maxDiscountAmount &&
            discountAmountCalc > data.maxDiscountAmount
          ) {
            discountAmountCalc = data.maxDiscountAmount;
          }
        } else if (data.fixedValue) {
          discountAmountCalc = data.fixedValue;
        }
        setDiscount({ code, amount: discountAmountCalc });
      } catch (err) {
        setErrorDiscount(
          err instanceof Error ? err.message : 'فشل في التحقق من الكود'
        );
      } finally {
        setLoadingDiscount(false);
      }
    },
    [state.cart, apiUrl]
  );

  // --- Form Validation Logic (Unchanged) ---
  const validateForm = useCallback(() => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'الاسم الكامل مطلوب';
    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^01[0-9]{9}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }
    if (!formData.address.trim()) newErrors.address = 'العنوان مطلوب';
    if (!formData.governorate.trim()) newErrors.governorate = 'المحافظة مطلوبة';
    if (formData.paymentMethod === 'visa') {
      if (!formData.cardNumber.trim())
        newErrors.cardNumber = 'رقم البطاقة مطلوب';
      if (!formData.expiryDate.trim())
        newErrors.expiryDate = 'تاريخ الانتهاء مطلوب';
      if (!formData.cvv.trim()) newErrors.cvv = 'رمز الأمان مطلوب';
      if (!formData.cardName.trim())
        newErrors.cardName = 'اسم حامل البطاقة مطلوب';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // --- Admin Notification Logic (Unchanged) ---
  const sendAdminNotification = useCallback(
    async (orderId: string, total: number, retryCount = 3, retryDelay = 1000) => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('authentication_required');
      }
      for (let attempt = 1; attempt <= retryCount; attempt++) {
        try {
          const response = await fetch(`${apiUrl}/api/notification/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              orderNumber: orderId,
              total: total.toFixed(2),
            }),
          });
          if (!response.ok) {
            throw new Error(`فشل إرسال الإشعار: ${response.status}`);
          }
          return;
        } catch (err) {
          if (attempt === retryCount) {
            throw err;
          }
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }
    },
    [apiUrl]
  );

  // --- Order Submission Logic (Unchanged) ---
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (isSubmitting) return;
      if (!validateForm()) return;

      if (!selectedGovernorate && formData.governorate.trim()) {
        alert(
          'حدث خطأ في تحديد رسوم التوصيل لهذه المحافظة. يرجى اختيار محافظة أخرى أو المحاولة لاحقاً.'
        );
        return;
      }

      setIsSubmitting(true);
      setNotificationError(null);
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('authentication_required');
        }

        const requestBody = {
          fullname: formData.fullName.trim(),
          phonenumber: formData.phone.trim(),
          address: formData.address.trim(),
          governorate: formData.governorate.trim(),
          discountCode: discount?.code || null,
          paymentMethod: formData.paymentMethod === 'cash' ? 0 : 1,
          notes: formData.notes.trim() || null,
          items: state.cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
            priceAtPurchase: item.product.price,
            size: item.size || null,
            color: item.color || null,
          })),
        };

        const response = await fetch(`${apiUrl}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(`فشل إرسال الطلب: ${response.status} - ${errorData}`);
        }

        const orderResult = await response.json();

        const mapStatus = (
          status: number
        ):
          | 'Pending'
          | 'Confirmed'
          | 'Processing'
          | 'Shipped'
          | 'Delivered'
          | 'Cancelled' => {
          switch (status) {
            case 0:
              return 'Pending';
            case 1:
              return 'Confirmed';
            case 2:
              return 'Processing';
            case 3:
              return 'Shipped';
            case 4:
              return 'Delivered';
            case 5:
              return 'Cancelled';
            default:
              return 'Pending';
          }
        };
        const mapPaymentMethod = (
          method: number
        ): 'Cash' | 'Card' | 'OnlinePayment' => {
          switch (method) {
            case 0:
              return 'Cash';
            case 1:
              return 'Card';
            case 2:
              return 'OnlinePayment';
            default:
              return 'Cash';
          }
        };

        const localOrder = {
          id: orderResult.id || `order-${Date.now()}`,
          customerId: orderResult.customerId || 'authenticated-user',
          items: state.cart.map((item) => ({
            id: `item-${Date.now()}-${item.product.id}`,
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            priceAtPurchase: item.product.price,
            size: item.size || 'غير محدد',
            color: item.color || 'غير محدد',
          })),
          total: Number(total.toFixed(2)),
          shippingFee: Number(shippingFee.toFixed(2)),
          discountCode: discount?.code || null,
          discountAmount: Number(discountAmount.toFixed(2)),
          paymentMethod: mapPaymentMethod(
            orderResult.paymentMethod ||
              (formData.paymentMethod === 'cash' ? 0 : 1)
          ),
          status: mapStatus(orderResult.status || 0),
          createdAt: orderResult.date || new Date().toISOString(),
          customerInfo: {
            id: orderResult.customerId || 'authenticated-user',
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
            address: formData.address.trim(),
            governorate: formData.governorate.trim(),
          },
        };

        dispatch({ type: 'ADD_ORDER', payload: localOrder });

        try {
          await sendAdminNotification(localOrder.id, total);
        } catch {
          setNotificationError(
            'فشل إرسال إشعار للإدارة، تم إنشاء الطلب بنجاح'
          );
        }

        dispatch({ type: 'CLEAR_CART' });
        alert('تم تأكيد طلبك بنجاح! سيتم التواصل معك قريباً.');
        navigate('/', { replace: true });
      } catch (error) {
        let errorMessage =
          'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.';
        if (error instanceof Error) {
          if (
            error.message.includes('authentication_required') ||
            error.message.includes('401')
          ) {
            errorMessage =
              'جلسة تسجيل الدخول منتهية أو غير صالحة. يرجى تسجيل الدخول مرة أخرى.';
            localStorage.removeItem('accessToken');
            navigate('/login', { replace: true });
          } else if (error.message.includes('400')) {
            errorMessage =
              'بيانات الطلب غير صحيحة. يرجى مراجعة البيانات المدخلة.';
          } else if (error.message.includes('403')) {
            errorMessage =
              'غير مصرح بإنشاء الطلب. يرجى التحقق من الصلاحيات.';
          } else if (error.message.includes('500')) {
            errorMessage = 'خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.';
          } else if (
            error.message.includes('network') ||
            error.message.includes('fetch')
          ) {
            errorMessage = 'تحقق من اتصال الإنترنت وحاول مرة أخرى.';
          }
        }
        alert(errorMessage);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isSubmitting,
      validateForm,
      formData,
      discount,
      state.cart,
      total,
      shippingFee,
      discountAmount,
      dispatch,
      navigate,
      apiUrl,
      sendAdminNotification,
      selectedGovernorate,
    ]
  );

  // --- Input Handlers (Unchanged) ---
  const handleInputChange = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleApplyDiscount = useCallback(() => {
    const code = formData.discountCode.trim();
    if (code) {
      fetchDiscountCode(code);
    } else {
      setErrorDiscount('يرجى إدخال كود خصم');
    }
  }, [formData.discountCode, fetchDiscountCode]);

  // --- Initial Mount Effect (Unchanged) ---
  useEffect(() => {
    fetchCart();
    fetchShippingFees();
  }, [fetchCart, fetchShippingFees]);

  // --- Loading Screen (Prince Cake Style) ---
  if (loadingCart) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-purple-900 font-medium">جاري تحميل السلة...</p>
        </div>
      </div>
    );
  }

  // --- Cart Error Screen (Prince Cake Style) ---
  if (cartError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">خطأ</h2>
            <p className="text-gray-600 mb-6">{cartError}</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => fetchCart()}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all font-medium"
              >
                إعادة المحاولة
              </button>
              <button
                onClick={() => navigate('/cart')}
                className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-colors font-medium"
              >
                العودة إلى السلة
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Empty Cart Screen (Prince Cake Style) ---
  if (state.cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              السلة فارغة
            </h2>
            <p className="text-gray-600 mb-6">لا يمكن إتمام الطلب بسلة فارغة</p>
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all font-medium"
            >
              العودة للتسوق
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Main Checkout Form (Prince Cake Style) ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/cart"
          className="flex items-center space-x-reverse space-x-2 text-gray-600 hover:text-pink-600 mb-6 transition-colors"
        >
          <ArrowRight size={20} />
          <span>العودة للسلة</span>
        </Link>

        <h1 className="text-3xl font-bold text-purple-900 mb-6 text-right">
          إتمام الطلب
        </h1>

        {notificationError && (
          <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl text-center">
            <p className="text-yellow-600 text-sm">{notificationError}</p>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-purple-900 mb-4 text-right">
            ملخص الطلب
          </h2>
          <div className="space-y-3 mb-4">
            {state.cart.map((item) => (
              <div
                key={`${item.product.id}-${item.size}-${item.color}`}
                className="flex justify-between text-right border-b border-purple-100 pb-2"
              >
                <span className="text-amber-600 font-medium">
                  {(item.product.price * item.quantity).toFixed(2)} جنيه
                </span>
                <div className="text-right">
                  <span className="text-gray-700 font-medium">
                    {item.product.name} × {item.quantity}
                  </span>
                  {(item.size || item.color) && (
                    <p className="text-xs text-gray-500">
                      {item.size && `المقاس: ${item.size}`}
                      {item.size && item.color && ' • '}
                      {item.color && `اللون: ${item.color}`}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2 border-t-2 border-purple-100 pt-4">
            <div className="flex justify-between">
              <span className="text-gray-600">المجموع الفرعي</span>
              <span className="font-semibold">{subtotal.toFixed(2)} جنيه</span>
            </div>
            {discount && (
              <div className="flex justify-between">
                <span className="text-gray-600">الخصم ({discount.code})</span>
                <span className="font-semibold text-green-600">
                  -{discountAmount.toFixed(2)} جنيه
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">رسوم التوصيل</span>
              {loadingShippingFees ? (
                <Loader2 className="animate-spin text-gray-400" size={16} />
              ) : (
                <span className="font-semibold">
                  {shippingFee.toFixed(2)} جنيه
                </span>
              )}
            </div>
            {selectedGovernorate && (
              <p className="text-xs text-gray-500 text-left">
                التوصيل خلال: {selectedGovernorate.deliveryTime}
              </p>
            )}
            <div className="flex justify-between items-center pt-2 border-t border-purple-100">
              <span className="text-2xl font-bold text-amber-600">
                {total.toFixed(2)} جنيه
              </span>
              <span className="text-xl font-bold text-purple-900">
                الإجمالي
              </span>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          {errorShippingFees && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl text-center">
              <p className="text-red-600 text-sm">{errorShippingFees}</p>
              <button
                type="button"
                onClick={fetchShippingFees}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          <div className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-right text-purple-900 font-medium mb-2">
                الاسم بالكامل *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-xl text-right focus:outline-none transition-colors ${
                  errors.fullName
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-purple-200 focus:border-purple-500'
                }`}
                disabled={isSubmitting}
              />
              {errors.fullName && (
                <p className="text-red-500 text-sm mt-1 text-right">
                  {errors.fullName}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-right text-purple-900 font-medium mb-2">
                رقم الهاتف *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="01xxxxxxxxx"
                className={`w-full px-4 py-3 border-2 rounded-xl text-right focus:outline-none transition-colors ${
                  errors.phone
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-purple-200 focus:border-purple-500'
                }`}
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1 text-right">
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-right text-purple-900 font-medium mb-2">
                العنوان التفصيلي *
              </label>
              <textarea
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                rows={3}
                className={`w-full px-4 py-3 border-2 rounded-xl text-right focus:outline-none resize-none transition-colors ${
                  errors.address
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-purple-200 focus:border-purple-500'
                }`}
                disabled={isSubmitting}
              />
              {errors.address && (
                <p className="text-red-500 text-sm mt-1 text-right">
                  {errors.address}
                </p>
              )}
            </div>

            {/* Governorate */}
            <div>
              <label className="block text-right text-purple-900 font-medium mb-2">
                المحافظة *
              </label>
              {loadingShippingFees ? (
                <div className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl bg-gray-100 flex items-center justify-end">
                  <span className="text-sm text-gray-500 ml-2">
                    جاري جلب المحافظات...
                  </span>
                  <Loader2
                    className="animate-spin text-purple-500"
                    size={16}
                  />
                </div>
              ) : (
                <select
                  value={formData.governorate}
                  onChange={(e) =>
                    handleInputChange('governorate', e.target.value)
                  }
                  className={`w-full px-4 py-3 border-2 rounded-xl text-right focus:outline-none transition-colors ${
                    errors.governorate
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-purple-200 focus:border-purple-500'
                  }`}
                  dir="rtl"
                  disabled={isSubmitting}
                >
                  <option value="">اختر المحافظة...</option>
                  {shippingFees.map((gov) => (
                    <option key={gov.id} value={gov.governorate}>
                      {gov.governorate} - {gov.fee} جنيه
                    </option>
                  ))}
                </select>
              )}
              {errors.governorate && (
                <p className="text-red-500 text-sm mt-1 text-right">
                  {errors.governorate}
                </p>
              )}
            </div>

            {/* Discount Code */}
            <div>
              <label className="block text-right text-purple-900 font-medium mb-2">
                كود الخصم
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={formData.discountCode}
                  onChange={(e) =>
                    handleInputChange('discountCode', e.target.value)
                  }
                  placeholder="أدخل كود الخصم"
                  className={`flex-1 px-4 py-3 border-2 rounded-xl text-right focus:outline-none transition-colors ${
                    errorDiscount
                      ? 'border-red-500 focus:border-red-500'
                      : 'border-purple-200 focus:border-purple-500'
                  }`}
                  disabled={loadingDiscount || isSubmitting}
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  disabled={loadingDiscount || isSubmitting}
                  className={`px-6 py-3 rounded-xl font-medium transition-all ${
                    loadingDiscount || isSubmitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600'
                  }`}
                >
                  {loadingDiscount ? (
                    <Loader2 className="animate-spin inline-block" size={18} />
                  ) : (
                    'تطبيق'
                  )}
                </button>
              </div>
              {errorDiscount && (
                <p className="text-red-500 text-sm mt-1 text-right">
                  {errorDiscount}
                </p>
              )}
              {discount && (
                <p className="text-green-600 text-sm mt-1 text-right">
                  ✓ تم تطبيق كود {discount.code}: خصم{' '}
                  {discount.amount.toFixed(2)} جنيه
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-right text-purple-900 font-medium mb-2">
                ملاحظات إضافية
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl text-right focus:border-purple-500 focus:outline-none resize-none"
                placeholder="أي ملاحظات خاصة بالطلب (مثل: كتابة على التورتة، حساسية معينة...)"
                disabled={isSubmitting}
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-right text-purple-900 font-medium mb-3">
                <CreditCard className="inline h-5 w-5 ml-2" />
                طريقة الدفع *
              </label>
              <div className="space-y-2">
                <label className="flex items-center justify-end gap-3 p-4 border-2 border-purple-200 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors">
                  <span className="text-gray-700 font-medium">
                    <Truck className="inline h-5 w-5 ml-2" />
                    الدفع عند الاستلام
                  </span>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={(e) =>
                      handleInputChange('paymentMethod', e.target.value)
                    }
                    className="w-5 h-5 text-purple-600"
                    disabled={isSubmitting}
                  />
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isSubmitting ||
                loadingShippingFees ||
                state.cart.length === 0 ||
                !selectedGovernorate
              }
              className={`w-full py-4 rounded-xl text-lg font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 ${
                isSubmitting ||
                loadingShippingFees ||
                state.cart.length === 0 ||
                !selectedGovernorate
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>جاري تأكيد الطلب...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-6 w-6" />
                  <span>تأكيد الطلب</span>
                </>
              )}
            </button>

            {!selectedGovernorate && formData.governorate && (
              <p className="text-red-500 text-sm mt-2 text-center">
                يرجى اختيار محافظة متوفرة لتحديد رسوم التوصيل.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;