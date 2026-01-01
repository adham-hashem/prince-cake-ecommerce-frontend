import { useState, useEffect, useMemo } from 'react';
import {
  Upload,
  Calendar,
  Clock,
  CreditCard,
  Sparkles,
  CheckCircle,
  Cake,
  Heart,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface OccasionSizeOption {
  id: string;
  sizeId?: string | null;
  name?: string;
  nameAr?: string;
  personsCount?: string;
  personsCountAr?: string;
  price: number;
  displayOrder: number;
  isActive: boolean;
}

interface OccasionOption {
  id: string;
  name: string;
  nameAr: string;
  icon: string;
  description?: string | null;
  descriptionAr?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  sizes: OccasionSizeOption[];
}

interface SizeMasterOption {
  id: string;
  name: string;
  nameAr: string;
  personsCount: string;
  personsCountAr: string;
  description?: string | null;
  descriptionAr?: string | null;
  defaultPrice: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface FlavorOption {
  id: string;
  name: string;
  nameAr: string;
  color: string;
  description?: string | null;
  descriptionAr?: string | null;
  additionalPrice: number;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

interface PaymentMethodOption {
  value: string;
  label: string;
  icon: string;
}

interface PaginatedResult<T> {
  items: T[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages?: number;
}

interface CakeOptions {
  occasions: OccasionOption[];
  sizes: SizeMasterOption[];
  flavors: FlavorOption[];
  paymentMethods: PaymentMethodOption[];
}

interface CustomOrderForm {
  customerName: string;
  customerPhone: string;
  occasionId: string;
  sizeId: string;
  flavorId: string;
  customText: string;
  designImage: File | null;
  imagePreview: string | null;
  pickupDate: string;
  pickupTime: string;
  notes: string;
  paymentMethod: 0 | 1 | 2;
}

const EMPTY_GUID = '00000000-0000-0000-0000-000000000000';

const normalizeDigitsToEnglish = (value: string) => {
  const ar = '٠١٢٣٤٥٦٧٨٩';
  const fa = '۰۱۲۳۴۵۶۷۸۹';
  let out = value;

  out = out.replace(/[٠-٩]/g, (d) => String(ar.indexOf(d)));
  out = out.replace(/[۰-۹]/g, (d) => String(fa.indexOf(d)));

  return out;
};

const normalizePhone = (value: string) => {
  const englishDigits = normalizeDigitsToEnglish(value);
  return englishDigits.replace(/\D/g, '').slice(0, 11);
};

const isValidEgyptPhone = (value: string) => /^01[0125][0-9]{8}$/.test(value);

export default function CustomOrders() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [cakeOptions, setCakeOptions] = useState<CakeOptions | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [estimatedPrice, setEstimatedPrice] = useState(0);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  const paymentMethods: PaymentMethodOption[] = useMemo(
    () => [
      { value: 'cash', label: 'كاش', icon: '💵' },
      { value: 'vodafoneCash', label: 'فودافون كاش', icon: '📱' },
      { value: 'instapay', label: 'إنستا باي', icon: '🏦' },
    ],
    []
  );

  const [formData, setFormData] = useState<CustomOrderForm>({
    customerName: '',
    customerPhone: '',
    occasionId: '',
    sizeId: '',
    flavorId: '',
    customText: '',
    designImage: null,
    imagePreview: null,
    pickupDate: '',
    pickupTime: '',
    notes: '',
    paymentMethod: 0,
  });

  useEffect(() => {
    fetchCakeOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (formData.occasionId && formData.sizeId && formData.flavorId) {
      calculatePrice();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.occasionId, formData.sizeId, formData.flavorId]);

  const fetchCakeOptions = async () => {
    try {
      setLoadingOptions(true);
      setFetchError(null);

      // Use large page size to get all items for dropdowns
      const pageSize = 1000;

      const [occRes, sizesRes, flavorsRes] = await Promise.all([
        fetch(
          `${apiUrl}/api/CakeConfiguration/occasions?pageNumber=1&pageSize=${pageSize}&includeInactive=false`
        ),
        fetch(
          `${apiUrl}/api/CakeConfiguration/sizes?pageNumber=1&pageSize=${pageSize}&includeInactive=false`
        ),
        fetch(
          `${apiUrl}/api/CakeConfiguration/flavors?pageNumber=1&pageSize=${pageSize}&includeInactive=false`
        ),
      ]);

      // Check response status
      if (!occRes.ok) {
        const errorText = await occRes.text();
        console.error('Occasions API error:', occRes.status, errorText);
        throw new Error(`فشل في تحميل المناسبات (${occRes.status})`);
      }
      if (!sizesRes.ok) {
        const errorText = await sizesRes.text();
        console.error('Sizes API error:', sizesRes.status, errorText);
        throw new Error(`فشل في تحميل الأحجام (${sizesRes.status})`);
      }
      if (!flavorsRes.ok) {
        const errorText = await flavorsRes.text();
        console.error('Flavors API error:', flavorsRes.status, errorText);
        throw new Error(`فشل في تحميل النكهات (${flavorsRes.status})`);
      }

      // Parse JSON responses
      const occasionsData = await occRes.json();
      const sizesData = await sizesRes.json();
      const flavorsData = await flavorsRes.json();

      console.log('API Responses:', {
        occasions: occasionsData,
        sizes: sizesData,
        flavors: flavorsData,
      });

      // Extract items from paginated response
      const occasions = (occasionsData as PaginatedResult<OccasionOption>).items || [];
      const sizes = (sizesData as PaginatedResult<SizeMasterOption>).items || [];
      const flavors = (flavorsData as PaginatedResult<FlavorOption>).items || [];

      // Validate arrays
      if (!Array.isArray(occasions)) {
        console.error('Invalid occasions format:', occasionsData);
        throw new Error('تنسيق بيانات المناسبات غير صحيح');
      }
      if (!Array.isArray(sizes)) {
        console.error('Invalid sizes format:', sizesData);
        throw new Error('تنسيق بيانات الأحجام غير صحيح');
      }
      if (!Array.isArray(flavors)) {
        console.error('Invalid flavors format:', flavorsData);
        throw new Error('تنسيق بيانات النكهات غير صحيح');
      }

      // Check if we have data
      if (occasions.length === 0) {
        console.warn('No occasions found');
      }
      if (sizes.length === 0) {
        console.warn('No sizes found');
      }
      if (flavors.length === 0) {
        console.warn('No flavors found');
      }

      // Sort by display order
      const byOrder = <T extends { displayOrder: number; nameAr?: string }>(a: T, b: T) =>
        (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || (a.nameAr || '').localeCompare(b.nameAr || '');

      setCakeOptions({
        occasions: [...occasions].sort(byOrder),
        sizes: [...sizes].sort(byOrder),
        flavors: [...flavors].sort(byOrder),
        paymentMethods,
      });

      console.log('Cake options loaded successfully:', {
        occasionsCount: occasions.length,
        sizesCount: sizes.length,
        flavorsCount: flavors.length,
      });
    } catch (error) {
      console.error('Error fetching cake options:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'حدث خطأ أثناء تحميل الخيارات. يرجى إعادة المحاولة.';
      setFetchError(errorMessage);
      alert(errorMessage);
    } finally {
      setLoadingOptions(false);
    }
  };

  const calculatePrice = async () => {
    try {
      const response = await fetch(
        `${apiUrl}/api/CakeConfiguration/price?occasionId=${formData.occasionId}&sizeId=${formData.sizeId}&flavorId=${formData.flavorId}`
      );

      if (!response.ok) {
        console.error('Price calculation failed:', response.status);
        throw new Error('فشل في حساب السعر');
      }

      const data = await response.json();
      setEstimatedPrice(data.price || 0);
    } catch (error) {
      console.error('Error calculating price:', error);
      setEstimatedPrice(0);
    }
  };

  const getSelectedOccasion = () => {
    return cakeOptions?.occasions.find((o) => o.id === formData.occasionId);
  };

  const getOccasionSizeRealId = (s: OccasionSizeOption) => {
    const candidate = s.sizeId && s.sizeId !== EMPTY_GUID ? s.sizeId : s.id;
    return candidate || '';
  };

  const getSelectedSize = () => {
    if (!cakeOptions) return undefined;

    const occasion = getSelectedOccasion();
    const rel = occasion?.sizes?.find((s) => getOccasionSizeRealId(s) === formData.sizeId);
    const master = cakeOptions.sizes.find((m) => m.id === formData.sizeId);

    return {
      id: formData.sizeId,
      nameAr: rel?.nameAr ?? master?.nameAr ?? '',
      personsCountAr: rel?.personsCountAr ?? master?.personsCountAr ?? '',
      price: rel?.price ?? master?.defaultPrice ?? 0,
    };
  };

  const getSelectedFlavor = () => {
    return cakeOptions?.flavors.find((f) => f.id === formData.flavorId);
  };

  const handleFileUpload = (file: File | null) => {
    if (!file) {
      setFormData({ ...formData, designImage: null, imagePreview: null });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({
        ...formData,
        designImage: file,
        imagePreview: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const normalizedPhone = normalizePhone(formData.customerPhone);

      if (!isValidEgyptPhone(normalizedPhone)) {
        alert('من فضلك أدخل رقم موبايل مصري صحيح (11 رقم يبدأ بـ 010 أو 011 أو 012 أو 015)');
        setLoading(false);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('CustomerName', formData.customerName);
      formDataToSend.append('CustomerPhone', normalizedPhone);
      formDataToSend.append('OccasionId', formData.occasionId);
      formDataToSend.append('SizeId', formData.sizeId);
      formDataToSend.append('FlavorId', formData.flavorId);
      formDataToSend.append('CustomText', formData.customText || '');

      if (formData.designImage) {
        formDataToSend.append('DesignImage', formData.designImage);
      }

      const pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
      formDataToSend.append('PickupDate', pickupDateTime.toISOString());
      formDataToSend.append('PickupTime', formData.pickupTime);
      formDataToSend.append('Notes', formData.notes || '');
      formDataToSend.append('PaymentMethod', formData.paymentMethod.toString());

      // Get auth token if user is logged in
      const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiUrl}/api/CustomOrders`, {
        method: 'POST',
        headers,
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'فشل في إنشاء الطلب' }));
        throw new Error(errorData.message || 'فشل في إنشاء الطلب');
      }

      const result = await response.json();
      setOrderId(result.id);
      setOrderNumber(result.orderNumber);
      setOrderComplete(true);
    } catch (error) {
      console.error('Error creating custom order:', error);
      alert(error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء الطلب. حاول مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingOptions) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-purple-900 font-medium">جاري تحميل الخيارات...</p>
        </div>
      </div>
    );
  }

  if (!cakeOptions || fetchError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">{fetchError || 'فشل في تحميل الخيارات'}</p>
          <button
            onClick={fetchCakeOptions}
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-600 transition-all"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-purple-900 mb-2">تم استلام طلبك!</h1>
          <p className="text-gray-600 mb-6">سيتم التواصل معك قريباً لتأكيد التفاصيل</p>

          <div className="bg-purple-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">رقم الطلب</p>
            <p className="text-2xl font-bold text-purple-600">{orderNumber}</p>
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 mb-6 text-right">
            <h3 className="font-bold text-purple-900 mb-3">ملخص الطلب</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {getSelectedOccasion()?.icon} {getSelectedOccasion()?.nameAr}
                </span>
                <span className="font-medium">المناسبة</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {getSelectedSize()?.nameAr}{' '}
                  {getSelectedSize()?.personsCountAr ? `(${getSelectedSize()?.personsCountAr})` : ''}
                </span>
                <span className="font-medium">الحجم</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{getSelectedFlavor()?.nameAr}</span>
                <span className="font-medium">النكهة</span>
              </div>
              {formData.customText && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{formData.customText}</span>
                  <span className="font-medium">النص</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {formData.pickupDate} - {formData.pickupTime}
                </span>
                <span className="font-medium">الاستلام</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-amber-200">
                <span className="text-xl font-bold text-amber-600">{estimatedPrice.toFixed(2)} جنيه</span>
                <span className="font-bold text-purple-900">السعر التقديري</span>
              </div>
            </div>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg"
          >
            <span>العودة للرئيسية</span>
            <ArrowRight className="h-5 w-5 rotate-180" />
          </Link>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-2">اختر المناسبة</h2>
              <p className="text-gray-600 text-sm">ما هي المناسبة السعيدة؟</p>
            </div>

            {cakeOptions.occasions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">لا توجد مناسبات متاحة حالياً</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {cakeOptions.occasions.map((occasion) => (
                  <button
                    key={occasion.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, occasionId: occasion.id, sizeId: '', flavorId: '' });
                      setStep(2);
                    }}
                    className={`p-4 border-2 rounded-2xl font-medium transition-all hover:scale-105 ${
                      formData.occasionId === occasion.id
                        ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-lg'
                        : 'border-purple-200 hover:border-purple-400 text-gray-700 hover:bg-purple-50'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{occasion.icon}</span>
                    <span>{occasion.nameAr}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 2: {
        const selectedOccasion = getSelectedOccasion();

        const availableSizes =
          selectedOccasion?.sizes?.length && selectedOccasion.sizes.length > 0
            ? selectedOccasion.sizes.map((rel) => {
                const realId = getOccasionSizeRealId(rel);
                const master = cakeOptions.sizes.find((m) => m.id === realId);
                return {
                  realId,
                  nameAr: rel.nameAr ?? master?.nameAr ?? '',
                  personsCountAr: rel.personsCountAr ?? master?.personsCountAr ?? '',
                  price: rel.price ?? master?.defaultPrice ?? 0,
                  displayOrder: rel.displayOrder ?? master?.displayOrder ?? 0,
                };
              })
            : cakeOptions.sizes.map((m) => ({
                realId: m.id,
                nameAr: m.nameAr,
                personsCountAr: m.personsCountAr,
                price: m.defaultPrice ?? 0,
                displayOrder: m.displayOrder ?? 0,
              }));

        availableSizes.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-2">اختر الحجم</h2>
              <p className="text-gray-600 text-sm">كم عدد الضيوف المتوقع؟</p>
            </div>

            {availableSizes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">لا توجد أحجام متاحة لهذه المناسبة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {availableSizes.map((size) => (
                  <button
                    key={size.realId}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, sizeId: size.realId });
                      setStep(3);
                    }}
                    className={`w-full p-4 border-2 rounded-2xl transition-all hover:scale-[1.02] ${
                      formData.sizeId === size.realId
                        ? 'border-purple-500 bg-purple-50 shadow-lg'
                        : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="bg-amber-100 px-3 py-1 rounded-full">
                        <span className="text-amber-600 font-bold">{Number(size.price).toFixed(2)} جنيه</span>
                      </div>
                      <div className="text-right">
                        <span className="text-purple-900 font-bold block">{size.nameAr}</span>
                        {size.personsCountAr && (
                          <span className="text-gray-500 text-sm">يكفي {size.personsCountAr}</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      }

      case 3:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-2">اختر النكهة</h2>
              <p className="text-gray-600 text-sm">ما هي نكهتك المفضلة؟</p>
            </div>

            {cakeOptions.flavors.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">لا توجد نكهات متاحة حالياً</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {cakeOptions.flavors.map((flavor) => (
                  <button
                    key={flavor.id}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, flavorId: flavor.id });
                      setStep(4);
                    }}
                    className={`p-4 border-2 rounded-2xl font-medium transition-all hover:scale-105 ${
                      formData.flavorId === flavor.id
                        ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-lg'
                        : 'border-purple-200 hover:border-purple-400 text-gray-700 hover:bg-purple-50'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full mx-auto mb-2" style={{ backgroundColor: flavor.color }} />
                    <div>
                      <span className="block">{flavor.nameAr}</span>
                      {flavor.additionalPrice > 0 && (
                        <span className="text-xs text-purple-600">+{flavor.additionalPrice} جنيه</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-2">التخصيص</h2>
              <p className="text-gray-600 text-sm">أضف لمستك الخاصة</p>
            </div>

            <div>
              <label className="block text-right text-purple-900 font-medium mb-2">نص على التورتة (اختياري)</label>
              <input
                type="text"
                value={formData.customText}
                onChange={(e) => setFormData({ ...formData, customText: e.target.value })}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl text-right focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="مثال: كل سنة وأنت طيب يا أحمد"
                maxLength={50}
              />
              <p className="text-xs text-gray-400 text-right mt-1">{formData.customText.length}/50 حرف</p>
            </div>

            <div>
              <label className="block text-right text-purple-900 font-medium mb-2">
                <Upload className="inline h-5 w-5 ml-2" />
                صورة التصميم المطلوب (اختياري)
              </label>
              <div
                className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                  formData.imagePreview
                    ? 'border-green-400 bg-green-50'
                    : 'border-purple-300 hover:border-purple-500 hover:bg-purple-50'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {formData.imagePreview ? (
                  <div>
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-xl mx-auto mb-2"
                    />
                    <p className="text-green-600 font-medium text-sm">✓ تم رفع الصورة</p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFormData({ ...formData, designImage: null, imagePreview: null });
                      }}
                      className="text-red-500 text-xs mt-1 hover:underline"
                    >
                      إزالة الصورة
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-10 w-10 text-purple-400 mx-auto mb-2" />
                    <p className="text-gray-700 font-medium">اضغط لاختيار صورة</p>
                    <p className="text-sm text-gray-500 mt-1">PNG أو JPG - حتى 5MB</p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep(5)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 rounded-xl text-lg font-bold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
            >
              التالي ←
            </button>
          </div>
        );

      case 5:
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-2">معلومات التسليم</h2>
              <p className="text-gray-600 text-sm">أدخل بياناتك لإتمام الطلب</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-right text-purple-900 font-medium mb-2">الاسم بالكامل *</label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl text-right focus:border-purple-500 focus:outline-none"
                  placeholder="أحمد محمد"
                />
              </div>

              <div>
                <label className="block text-right text-purple-900 font-medium mb-2">رقم الهاتف *</label>
                <input
                  type="tel"
                  required
                  inputMode="numeric"
                  autoComplete="tel"
                  maxLength={11}
                  pattern="01[0125][0-9]{8}"
                  title="رقم مصري 11 رقم يبدأ بـ 010 أو 011 أو 012 أو 015"
                  value={formData.customerPhone}
                  onChange={(e) => {
                    const v = normalizePhone(e.target.value);
                    setFormData({ ...formData, customerPhone: v });
                  }}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl text-right focus:border-purple-500 focus:outline-none"
                  placeholder="01xxxxxxxxx"
                />
                <p className="text-xs text-gray-400 text-right mt-1">مثال: 01012345678</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-right text-purple-900 font-medium mb-2">
                  <Calendar className="inline h-5 w-5 ml-2" />
                  تاريخ الاستلام *
                </label>
                <input
                  type="date"
                  required
                  value={formData.pickupDate}
                  onChange={(e) => setFormData({ ...formData, pickupDate: e.target.value })}
                  min={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl text-right focus:border-purple-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 text-right mt-1">الحد الأدنى يومين من الآن</p>
              </div>

              <div>
                <label className="block text-right text-purple-900 font-medium mb-2">
                  <Clock className="inline h-5 w-5 ml-2" />
                  وقت الاستلام *
                </label>
                <input
                  type="time"
                  required
                  value={formData.pickupTime}
                  onChange={(e) => setFormData({ ...formData, pickupTime: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl text-right focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-right text-purple-900 font-medium mb-2">ملاحظات إضافية</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl text-right focus:border-purple-500 focus:outline-none resize-none"
                placeholder="أي تفاصيل إضافية تريد إخبارنا بها..."
              />
            </div>

            <div>
              <label className="block text-right text-purple-900 font-medium mb-3">
                <CreditCard className="inline h-5 w-5 ml-2" />
                طريقة الدفع *
              </label>
              <div className="space-y-2">
                {cakeOptions.paymentMethods.map((method, index) => (
                  <label
                    key={method.value}
                    className={`flex items-center justify-end gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.paymentMethod === index
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                    <span className="text-gray-700 font-medium flex items-center gap-2">
                      <span>{method.icon}</span>
                      <span>{method.label}</span>
                    </span>
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={index}
                      checked={formData.paymentMethod === index}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          paymentMethod: parseInt(e.target.value) as 0 | 1 | 2,
                        })
                      }
                      className="w-5 h-5 text-purple-600"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4">
              <h3 className="font-bold text-purple-900 mb-3 text-right flex items-center justify-end gap-2">
                <span>ملخص الطلب</span>
                <Cake className="h-5 w-5" />
              </h3>

              <div className="space-y-2 text-sm text-right">
                <div className="flex justify-between">
                  <span>{getSelectedOccasion()?.nameAr}</span>
                  <span className="text-gray-500">المناسبة</span>
                </div>
                <div className="flex justify-between">
                  <span>{getSelectedSize()?.nameAr}</span>
                  <span className="text-gray-500">الحجم</span>
                </div>
                <div className="flex justify-between">
                  <span>{getSelectedFlavor()?.nameAr}</span>
                  <span className="text-gray-500">النكهة</span>
                </div>
                {formData.customText && (
                  <div className="flex justify-between">
                    <span>{formData.customText}</span>
                    <span className="text-gray-500">النص</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t-2 border-amber-200">
                <span className="text-2xl font-bold text-amber-600">{estimatedPrice.toFixed(2)} جنيه</span>
                <span className="text-lg font-bold text-purple-900">السعر التقديري</span>
              </div>

              <p className="text-xs text-gray-500 text-right mt-2">* السعر النهائي قد يختلف حسب التصميم المطلوب</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 rounded-xl text-lg font-bold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Sparkles className="h-6 w-6 animate-spin" />
                  <span>جاري إرسال الطلب...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-6 w-6" />
                  <span>تأكيد الطلب</span>
                </>
              )}
            </button>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/"
            className="inline-flex items-center space-x-reverse space-x-2 text-gray-600 hover:text-purple-600 mb-6 transition-colors"
          >
            <ArrowRight size={20} />
            <span>العودة للرئيسية</span>
          </Link>

          <div className="text-center mb-8">
            <div className="relative inline-block mb-4">
              <div className="absolute -top-2 -right-2 text-pink-400 animate-pulse">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="absolute -bottom-2 -left-2 text-amber-400 animate-pulse">
                <Heart className="h-6 w-6 fill-current" />
              </div>
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-4">
                <Cake className="h-12 w-12 text-white" />
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-purple-900 mb-2">اطلب تورتة خاصة</h1>
            <p className="text-gray-600">صمم تورتتك المثالية خطوة بخطوة</p>
          </div>

          <div className="flex justify-center items-center gap-2 mb-8">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    s < step
                      ? 'bg-green-500 text-white'
                      : s === step
                      ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-lg scale-110'
                      : 'bg-purple-200 text-purple-400'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                {s < 5 && (
                  <div
                    className={`w-8 h-1 rounded-full mx-1 transition-colors ${
                      s < step ? 'bg-green-500' : 'bg-purple-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-4 mb-8 text-xs text-gray-500">
            <span className={step >= 1 ? 'text-purple-600 font-medium' : ''}>المناسبة</span>
            <span className={step >= 2 ? 'text-purple-600 font-medium' : ''}>الحجم</span>
            <span className={step >= 3 ? 'text-purple-600 font-medium' : ''}>النكهة</span>
            <span className={step >= 4 ? 'text-purple-600 font-medium' : ''}>التخصيص</span>
            <span className={step >= 5 ? 'text-purple-600 font-medium' : ''}>التسليم</span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
            {renderStep()}

            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="w-full mt-4 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <ArrowRight className="h-5 w-5" />
                <span>رجوع للخطوة السابقة</span>
              </button>
            )}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3">
            <div className="bg-white/80 rounded-2xl p-4 text-center shadow-md">
              <span className="text-2xl block mb-1">🎨</span>
              <p className="text-xs text-gray-600">تصميم حسب الطلب</p>
            </div>
            <div className="bg-white/80 rounded-2xl p-4 text-center shadow-md">
              <span className="text-2xl block mb-1">⭐</span>
              <p className="text-xs text-gray-600">جودة عالية</p>
            </div>
            <div className="bg-white/80 rounded-2xl p-4 text-center shadow-md">
              <span className="text-2xl block mb-1">🚚</span>
              <p className="text-xs text-gray-600">توصيل آمن</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
