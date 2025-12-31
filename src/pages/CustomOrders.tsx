import { useState, useEffect } from 'react';
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

interface OccasionOption {
  id: string;
  value: string;
  name: string;
  nameAr: string;
  icon: string;
  sizes: SizeOption[];
}

interface SizeOption {
  id: string;
  value: string;
  name: string;
  nameAr: string;
  persons: string;
  price: number;
}

interface FlavorOption {
  id: string;
  value: string;
  name: string;
  nameAr: string;
  color: string;
  additionalPrice: number;
}

interface PaymentMethodOption {
  value: string;
  name: string;
  nameAr: string;
  icon: string;
}

interface CakeOptions {
  occasions: OccasionOption[];
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

export default function CustomOrders() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [cakeOptions, setCakeOptions] = useState<CakeOptions | null>(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [estimatedPrice, setEstimatedPrice] = useState(0);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

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
  }, []);

  useEffect(() => {
    if (formData.occasionId && formData.sizeId && formData.flavorId) {
      calculatePrice();
    }
  }, [formData.occasionId, formData.sizeId, formData.flavorId]);

  const fetchCakeOptions = async () => {
    const requestStart = Date.now();
    const endpoint = `${apiUrl}/api/CakeConfiguration/options`;
    
    console.group('🔄 FETCH CAKE OPTIONS - REQUEST');
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('🌐 API Base URL:', apiUrl);
    console.log('🔗 Full Endpoint:', endpoint);
    console.log('📤 Method:', 'GET');
    console.log('📋 Headers:', 'Default fetch headers');
    console.groupEnd();

    try {
      setLoadingOptions(true);
      
      const response = await fetch(endpoint);
      const processingTime = Date.now() - requestStart;

      console.group('📡 FETCH CAKE OPTIONS - RESPONSE');
      console.log('⏱️ Processing Time:', `${processingTime}ms`);
      console.log('📊 Status Code:', response.status);
      console.log('✅ Status OK:', response.ok);
      console.log('📝 Status Text:', response.statusText);
      console.log('🔗 Response URL:', response.url);
      console.log('🏷️ Response Type:', response.type);
      console.log('📋 Headers:', {
        'Content-Type': response.headers.get('Content-Type'),
        'Content-Length': response.headers.get('Content-Length'),
        'Date': response.headers.get('Date'),
      });
      console.groupEnd();
      
      if (!response.ok) {
        console.error('❌ Response not OK:', response.status, response.statusText);
        throw new Error('فشل في تحميل الخيارات');
      }

      const responseText = await response.text();
      console.group('📦 RAW RESPONSE BODY');
      console.log('📄 Raw Text Length:', responseText.length, 'characters');
      console.log('📄 Raw Response:', responseText.substring(0, 500) + '...');
      console.groupEnd();

      const data = JSON.parse(responseText);
      
      console.group('✅ PARSED JSON DATA');
      console.log('📊 Full Data Object:', data);
      console.log('🔍 Data Type:', typeof data);
      console.log('🔍 Is Array:', Array.isArray(data));
      console.log('🔍 Object Keys:', Object.keys(data));
      console.groupEnd();

      // Deep inspection of occasions
      console.group('🎉 OCCASIONS DATA');
      console.log('📊 Total Occasions:', data.occasions?.length || 0);
      console.log('📋 Occasions Array:', data.occasions);
      
      if (data.occasions && data.occasions.length > 0) {
        data.occasions.forEach((occasion: OccasionOption, index: number) => {
          console.group(`🎈 Occasion #${index + 1}`);
          console.log('🆔 ID:', occasion.id);
          console.log('📝 Value:', occasion.value);
          console.log('🔤 Name (English):', occasion.name);
          console.log('🔤 Name (Arabic):', occasion.nameAr);
          console.log('📛 NameAr Type:', typeof occasion.nameAr);
          console.log('📛 NameAr Length:', occasion.nameAr?.length);
          console.log('😀 Icon:', occasion.icon);
          console.log('📏 Sizes Count:', occasion.sizes?.length || 0);
          
          if (occasion.sizes && occasion.sizes.length > 0) {
            console.log('📏 Sizes:', occasion.sizes.map((s: SizeOption) => ({
              id: s.id,
              name: s.name,
              nameAr: s.nameAr,
              price: s.price,
              persons: s.persons
            })));
          }
          console.groupEnd();
        });
      }
      console.groupEnd();

      // Deep inspection of flavors
      console.group('🍰 FLAVORS DATA');
      console.log('📊 Total Flavors:', data.flavors?.length || 0);
      console.log('📋 Flavors Array:', data.flavors);
      
      if (data.flavors && data.flavors.length > 0) {
        data.flavors.forEach((flavor: FlavorOption, index: number) => {
          console.group(`🧁 Flavor #${index + 1}`);
          console.log('🆔 ID:', flavor.id);
          console.log('📝 Value:', flavor.value);
          console.log('🔤 Name (English):', flavor.name);
          console.log('🔤 Name (Arabic):', flavor.nameAr);
          console.log('📛 NameAr Type:', typeof flavor.nameAr);
          console.log('📛 NameAr Length:', flavor.nameAr?.length);
          console.log('🎨 Color:', flavor.color);
          console.log('💰 Additional Price:', flavor.additionalPrice);
          console.groupEnd();
        });
      }
      console.groupEnd();

      // Deep inspection of payment methods
      console.group('💳 PAYMENT METHODS DATA');
      console.log('📊 Total Payment Methods:', data.paymentMethods?.length || 0);
      console.log('📋 Payment Methods Array:', data.paymentMethods);
      
      if (data.paymentMethods && data.paymentMethods.length > 0) {
        data.paymentMethods.forEach((method: PaymentMethodOption, index: number) => {
          console.group(`💰 Payment Method #${index + 1}`);
          console.log('📝 Value:', method.value);
          console.log('🔤 Name (English):', method.name);
          console.log('🔤 Name (Arabic):', method.nameAr);
          console.log('📛 NameAr Type:', typeof method.nameAr);
          console.log('📛 NameAr Length:', method.nameAr?.length);
          console.log('😀 Icon:', method.icon);
          console.groupEnd();
        });
      }
      console.groupEnd();

      console.log('✅ Setting cakeOptions state with data');
      setCakeOptions(data);
      
    } catch (error) {
      console.group('❌ FETCH CAKE OPTIONS - ERROR');
      console.error('🔴 Error Type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('🔴 Error Message:', error instanceof Error ? error.message : error);
      console.error('🔴 Error Stack:', error instanceof Error ? error.stack : 'N/A');
      console.error('🔴 Full Error Object:', error);
      console.groupEnd();
      
      alert('حدث خطأ أثناء تحميل الخيارات. يرجى إعادة المحاولة.');
    } finally {
      setLoadingOptions(false);
      console.log('🏁 Fetch Cake Options Complete - loadingOptions set to false');
    }
  };

  const calculatePrice = async () => {
    const requestStart = Date.now();
    const endpoint = `${apiUrl}/api/CakeConfiguration/price?occasionId=${formData.occasionId}&sizeId=${formData.sizeId}&flavorId=${formData.flavorId}`;
    
    console.group('💰 CALCULATE PRICE - REQUEST');
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('🔗 Full Endpoint:', endpoint);
    console.log('📤 Method:', 'GET');
    console.log('📋 Query Params:', {
      occasionId: formData.occasionId,
      sizeId: formData.sizeId,
      flavorId: formData.flavorId,
    });
    console.groupEnd();

    try {
      const response = await fetch(endpoint);
      const processingTime = Date.now() - requestStart;

      console.group('📡 CALCULATE PRICE - RESPONSE');
      console.log('⏱️ Processing Time:', `${processingTime}ms`);
      console.log('📊 Status Code:', response.status);
      console.log('✅ Status OK:', response.ok);
      console.log('📝 Status Text:', response.statusText);
      console.groupEnd();

      if (!response.ok) {
        console.error('❌ Response not OK:', response.status, response.statusText);
        throw new Error('فشل في حساب السعر');
      }

      const data = await response.json();
      
      console.group('✅ PRICE CALCULATION RESULT');
      console.log('📊 Full Response:', data);
      console.log('💵 Price:', data.price);
      console.log('💰 Price Type:', typeof data.price);
      console.groupEnd();
      
      setEstimatedPrice(data.price);
    } catch (error) {
      console.group('❌ CALCULATE PRICE - ERROR');
      console.error('🔴 Error Type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('🔴 Error Message:', error instanceof Error ? error.message : error);
      console.error('🔴 Full Error Object:', error);
      console.groupEnd();
    }
  };

  const getSelectedOccasion = () => {
    const occasion = cakeOptions?.occasions.find((o) => o.id === formData.occasionId);
    console.log('🔍 getSelectedOccasion:', {
      searchId: formData.occasionId,
      found: occasion,
      nameAr: occasion?.nameAr,
      name: occasion?.name,
    });
    return occasion;
  };

  const getSelectedSize = () => {
    const occasion = getSelectedOccasion();
    const size = occasion?.sizes.find((s) => s.id === formData.sizeId);
    console.log('🔍 getSelectedSize:', {
      searchId: formData.sizeId,
      found: size,
      nameAr: size?.nameAr,
      name: size?.name,
    });
    return size;
  };

  const getSelectedFlavor = () => {
    const flavor = cakeOptions?.flavors.find((f) => f.id === formData.flavorId);
    console.log('🔍 getSelectedFlavor:', {
      searchId: formData.flavorId,
      found: flavor,
      nameAr: flavor?.nameAr,
      name: flavor?.name,
    });
    return flavor;
  };

  const handleFileUpload = (file: File | null) => {
    console.group('📁 FILE UPLOAD');
    console.log('📄 File:', file);
    console.log('📏 File Size:', file?.size, 'bytes');
    console.log('📝 File Name:', file?.name);
    console.log('🔖 File Type:', file?.type);
    console.groupEnd();

    if (!file) {
      setFormData({ ...formData, designImage: null, imagePreview: null });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      console.warn('⚠️ File too large:', file.size, 'bytes (max: 5MB)');
      alert('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('✅ File read complete, setting preview');
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
    const requestStart = Date.now();
    
    console.group('📤 SUBMIT CUSTOM ORDER - REQUEST');
    console.log('⏰ Timestamp:', new Date().toISOString());
    console.log('🔗 Endpoint:', `${apiUrl}/api/CustomOrders`);
    console.log('📤 Method:', 'POST');
    console.log('📋 Form Data:', {
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      occasionId: formData.occasionId,
      sizeId: formData.sizeId,
      flavorId: formData.flavorId,
      customText: formData.customText,
      hasDesignImage: !!formData.designImage,
      pickupDate: formData.pickupDate,
      pickupTime: formData.pickupTime,
      notes: formData.notes,
      paymentMethod: formData.paymentMethod,
    });
    console.groupEnd();

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('CustomerName', formData.customerName);
      formDataToSend.append('CustomerPhone', formData.customerPhone);
      formDataToSend.append('OccasionId', formData.occasionId);
      formDataToSend.append('SizeId', formData.sizeId);
      formDataToSend.append('FlavorId', formData.flavorId);
      formDataToSend.append('CustomText', formData.customText || '');
      
      if (formData.designImage) {
        formDataToSend.append('DesignImage', formData.designImage);
        console.log('📎 Design image attached:', formData.designImage.name);
      }

      const pickupDateTime = new Date(`${formData.pickupDate}T${formData.pickupTime}`);
      formDataToSend.append('PickupDate', pickupDateTime.toISOString());
      formDataToSend.append('PickupTime', formData.pickupTime);
      formDataToSend.append('Notes', formData.notes || '');
      formDataToSend.append('PaymentMethod', formData.paymentMethod.toString());

      console.log('📦 FormData entries:');
      for (let pair of formDataToSend.entries()) {
        console.log(`  ${pair[0]}:`, pair[1]);
      }

      const response = await fetch(`${apiUrl}/api/CustomOrders`, {
        method: 'POST',
        body: formDataToSend,
      });

      const processingTime = Date.now() - requestStart;

      console.group('📡 SUBMIT CUSTOM ORDER - RESPONSE');
      console.log('⏱️ Processing Time:', `${processingTime}ms`);
      console.log('📊 Status Code:', response.status);
      console.log('✅ Status OK:', response.ok);
      console.log('📝 Status Text:', response.statusText);
      console.groupEnd();

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Error Response Body:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          console.error('❌ Parsed Error Data:', errorData);
          throw new Error(errorData.message || 'فشل في إنشاء الطلب');
        } catch {
          throw new Error('فشل في إنشاء الطلب');
        }
      }

      const result = await response.json();
      
      console.group('✅ ORDER CREATED SUCCESSFULLY');
      console.log('📊 Full Response:', result);
      console.log('🆔 Order ID:', result.id);
      console.log('🔢 Order Number:', result.orderNumber);
      console.groupEnd();
      
      setOrderId(result.id);
      setOrderNumber(result.orderNumber);
      setOrderComplete(true);
    } catch (error) {
      console.group('❌ SUBMIT CUSTOM ORDER - ERROR');
      console.error('🔴 Error Type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('🔴 Error Message:', error instanceof Error ? error.message : error);
      console.error('🔴 Error Stack:', error instanceof Error ? error.stack : 'N/A');
      console.error('🔴 Full Error Object:', error);
      console.groupEnd();
      
      alert(error instanceof Error ? error.message : 'حدث خطأ أثناء إنشاء الطلب. حاول مرة أخرى.');
    } finally {
      setLoading(false);
      console.log('🏁 Submit Order Complete');
    }
  };

  useEffect(() => {
    console.group('🔄 STATE UPDATE: cakeOptions');
    console.log('📊 New cakeOptions:', cakeOptions);
    console.log('🎉 Occasions:', cakeOptions?.occasions.length || 0);
    console.log('🍰 Flavors:', cakeOptions?.flavors.length || 0);
    console.log('💳 Payment Methods:', cakeOptions?.paymentMethods.length || 0);
    console.groupEnd();
  }, [cakeOptions]);

  useEffect(() => {
    console.log('🔄 STATE UPDATE: step =', step);
  }, [step]);

  useEffect(() => {
    console.group('🔄 STATE UPDATE: formData');
    console.log('📋 Current formData:', formData);
    console.groupEnd();
  }, [formData]);

  if (loadingOptions) {
    console.log('⏳ Rendering: Loading Options Screen');
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="h-12 w-12 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-purple-900 font-medium">جاري تحميل الخيارات...</p>
        </div>
      </div>
    );
  }

  if (!cakeOptions) {
    console.log('⚠️ Rendering: Error Screen (no cakeOptions)');
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-red-600 mb-4">فشل في تحميل الخيارات</p>
          <button
            onClick={fetchCakeOptions}
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-600"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    console.log('🎉 Rendering: Order Complete Screen');
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-purple-900 mb-2">
            تم استلام طلبك! 🎉
          </h1>
          <p className="text-gray-600 mb-6">
            سيتم التواصل معك قريباً لتأكيد التفاصيل
          </p>

          <div className="bg-purple-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">رقم الطلب</p>
            <p className="text-2xl font-bold text-purple-600">{orderNumber}</p>
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 mb-6 text-right">
            <h3 className="font-bold text-purple-900 mb-3">ملخص الطلب</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {getSelectedOccasion()?.icon} {getSelectedOccasion()?.nameAr || getSelectedOccasion()?.name}
                </span>
                <span className="font-medium">المناسبة</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {getSelectedSize()?.nameAr || getSelectedSize()?.name} ({getSelectedSize()?.persons})
                </span>
                <span className="font-medium">الحجم</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {getSelectedFlavor()?.nameAr || getSelectedFlavor()?.name}
                </span>
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
                <span className="text-xl font-bold text-amber-600">
                  {estimatedPrice.toFixed(2)} جنيه
                </span>
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
        console.log('🎯 Rendering Step 1: Occasions');
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-2">
                اختر المناسبة 🎉
              </h2>
              <p className="text-gray-600 text-sm">
                ما هي المناسبة السعيدة؟
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {cakeOptions.occasions.map((occasion) => {
                const displayName = occasion.nameAr || occasion.name || 'No name';
                console.log(`🔄 Rendering occasion button: ${occasion.id}`, {
                  nameAr: occasion.nameAr,
                  name: occasion.name,
                  displaying: displayName,
                });
                
                return (
                  <button
                    key={occasion.id}
                    type="button"
                    onClick={() => {
                      console.log('👆 User clicked occasion:', occasion);
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
                    <span>{displayName}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 2:
        console.log('🎯 Rendering Step 2: Sizes');
        const selectedOccasion = getSelectedOccasion();
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-2">
                اختر الحجم 📏
              </h2>
              <p className="text-gray-600 text-sm">كم عدد الضيوف المتوقع؟</p>
            </div>
            <div className="space-y-3">
              {selectedOccasion?.sizes.map((size) => {
                const displayName = size.nameAr || size.name || 'No name';
                console.log(`🔄 Rendering size button: ${size.id}`, {
                  nameAr: size.nameAr,
                  name: size.name,
                  displaying: displayName,
                });
                
                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => {
                      console.log('👆 User clicked size:', size);
                      setFormData({ ...formData, sizeId: size.id });
                      setStep(3);
                    }}
                    className={`w-full p-4 border-2 rounded-2xl transition-all hover:scale-[1.02] ${
                      formData.sizeId === size.id
                        ? 'border-purple-500 bg-purple-50 shadow-lg'
                        : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="bg-amber-100 px-3 py-1 rounded-full">
                        <span className="text-amber-600 font-bold">
                          {size.price.toFixed(2)} جنيه
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-purple-900 font-bold block">
                          {displayName}
                        </span>
                        <span className="text-gray-500 text-sm">
                          يكفي {size.persons}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 3:
        console.log('🎯 Rendering Step 3: Flavors');
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-2">
                اختر النكهة 🍰
              </h2>
              <p className="text-gray-600 text-sm">ما هي نكهتك المفضلة؟</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {cakeOptions.flavors.map((flavor) => {
                const displayName = flavor.nameAr || flavor.name || 'No name';
                console.log(`🔄 Rendering flavor button: ${flavor.id}`, {
                  nameAr: flavor.nameAr,
                  name: flavor.name,
                  displaying: displayName,
                });
                
                return (
                  <button
                    key={flavor.id}
                    type="button"
                    onClick={() => {
                      console.log('👆 User clicked flavor:', flavor);
                      setFormData({ ...formData, flavorId: flavor.id });
                      setStep(4);
                    }}
                    className={`p-4 border-2 rounded-2xl font-medium transition-all hover:scale-105 ${
                      formData.flavorId === flavor.id
                        ? 'border-purple-500 bg-purple-50 text-purple-900 shadow-lg'
                        : 'border-purple-200 hover:border-purple-400 text-gray-700 hover:bg-purple-50'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${flavor.color}`} />
                    <div>
                      <span className="block">{displayName}</span>
                      {flavor.additionalPrice > 0 && (
                        <span className="text-xs text-purple-600">
                          +{flavor.additionalPrice} جنيه
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 4:
        console.log('🎯 Rendering Step 4: Customization');
        return (
          <div className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-2">
                التخصيص ✨
              </h2>
              <p className="text-gray-600 text-sm">أضف لمستك الخاصة</p>
            </div>

            <div>
              <label className="block text-right text-purple-900 font-medium mb-2">
                نص على التورتة (اختياري)
              </label>
              <input
                type="text"
                value={formData.customText}
                onChange={(e) => {
                  console.log('✏️ Custom text changed:', e.target.value);
                  setFormData({ ...formData, customText: e.target.value });
                }}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl text-right focus:border-purple-500 focus:outline-none transition-colors"
                placeholder="مثال: كل سنة وأنت طيب يا أحمد 🎂"
                maxLength={50}
              />
              <p className="text-xs text-gray-400 text-right mt-1">
                {formData.customText.length}/50 حرف
              </p>
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
                  onChange={(e) =>
                    handleFileUpload(e.target.files?.[0] || null)
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {formData.imagePreview ? (
                  <div>
                    <img
                      src={formData.imagePreview}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-xl mx-auto mb-2"
                    />
                    <p className="text-green-600 font-medium text-sm">
                      ✓ تم رفع الصورة
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('🗑️ Removing design image');
                        setFormData({
                          ...formData,
                          designImage: null,
                          imagePreview: null,
                        });
                      }}
                      className="text-red-500 text-xs mt-1 hover:underline"
                    >
                      إزالة الصورة
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="h-10 w-10 text-purple-400 mx-auto mb-2" />
                    <p className="text-gray-700 font-medium">
                      اضغط لاختيار صورة
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      PNG أو JPG - حتى 5MB
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                console.log('👆 User clicked Next to Step 5');
                setStep(5);
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white py-4 rounded-xl text-lg font-bold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
            >
              التالي ←
            </button>
          </div>
        );

      case 5:
        console.log('🎯 Rendering Step 5: Delivery Information');
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-purple-900 mb-2">
                معلومات التسليم 📦
              </h2>
              <p className="text-gray-600 text-sm">أدخل بياناتك لإتمام الطلب</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-right text-purple-900 font-medium mb-2">
                  الاسم بالكامل *
                </label>
                <input
                  type="text"
                  required
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl text-right focus:border-purple-500 focus:outline-none"
                  placeholder="أحمد محمد"
                />
              </div>

              <div>
                <label className="block text-right text-purple-900 font-medium mb-2">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  required
                  pattern="^01[0-2,5]\d{8}$"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl text-right focus:border-purple-500 focus:outline-none"
                  placeholder="01xxxxxxxxx"
                />
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
                  onChange={(e) =>
                    setFormData({ ...formData, pickupDate: e.target.value })
                  }
                  min={
                    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
                      .toISOString()
                      .split('T')[0]
                  }
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl text-right focus:border-purple-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 text-right mt-1">
                  الحد الأدنى يومين من الآن
                </p>
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
                  onChange={(e) =>
                    setFormData({ ...formData, pickupTime: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl text-right focus:border-purple-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-right text-purple-900 font-medium mb-2">
                ملاحظات إضافية
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
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
                {cakeOptions.paymentMethods.map((method, index) => {
                  const displayName = method.nameAr || method.name || 'No name';
                  console.log(`🔄 Rendering payment method: ${index}`, {
                    nameAr: method.nameAr,
                    name: method.name,
                    displaying: displayName,
                  });
                  
                  return (
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
                        <span>{displayName}</span>
                      </span>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={index}
                        checked={formData.paymentMethod === index}
                        onChange={(e) => {
                          console.log('👆 Payment method selected:', index, method);
                          setFormData({
                            ...formData,
                            paymentMethod: parseInt(e.target.value) as 0 | 1 | 2,
                          });
                        }}
                        className="w-5 h-5 text-purple-600"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4">
              <h3 className="font-bold text-purple-900 mb-3 text-right flex items-center justify-end gap-2">
                <span>ملخص الطلب</span>
                <Cake className="h-5 w-5" />
              </h3>
              <div className="space-y-2 text-sm text-right">
                <div className="flex justify-between">
                  <span>{getSelectedOccasion()?.nameAr || getSelectedOccasion()?.name}</span>
                  <span className="text-gray-500">المناسبة</span>
                </div>
                <div className="flex justify-between">
                  <span>{getSelectedSize()?.nameAr || getSelectedSize()?.name}</span>
                  <span className="text-gray-500">الحجم</span>
                </div>
                <div className="flex justify-between">
                  <span>{getSelectedFlavor()?.nameAr || getSelectedFlavor()?.name}</span>
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
                <span className="text-2xl font-bold text-amber-600">
                  {estimatedPrice.toFixed(2)} جنيه
                </span>
                <span className="text-lg font-bold text-purple-900">
                  السعر التقديري
                </span>
              </div>
              <p className="text-xs text-gray-500 text-right mt-2">
                * السعر النهائي قد يختلف حسب التصميم المطلوب
              </p>
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

  console.log('🎨 Rendering main component, current step:', step);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50">
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
            <h1 className="text-3xl md:text-4xl font-bold text-purple-900 mb-2">
              اطلب تورتة خاصة
            </h1>
            <p className="text-gray-600">صمم تورتتك المثالية خطوة بخطوة ✨</p>
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
            <span className={step >= 1 ? 'text-purple-600 font-medium' : ''}>
              المناسبة
            </span>
            <span className={step >= 2 ? 'text-purple-600 font-medium' : ''}>
              الحجم
            </span>
            <span className={step >= 3 ? 'text-purple-600 font-medium' : ''}>
              النكهة
            </span>
            <span className={step >= 4 ? 'text-purple-600 font-medium' : ''}>
              التخصيص
            </span>
            <span className={step >= 5 ? 'text-purple-600 font-medium' : ''}>
              التسليم
            </span>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8">
            {renderStep()}

            {step > 1 && (
              <button
                type="button"
                onClick={() => {
                  console.log('👆 User clicked Back button, going to step:', step - 1);
                  setStep(step - 1);
                }}
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
