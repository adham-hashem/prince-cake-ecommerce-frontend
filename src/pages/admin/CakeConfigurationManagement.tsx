import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Edit,
  Trash2,
  Plus,
  AlertCircle,
  RefreshCw,
  Cake,
  Sparkles,
  Calendar,
  Ruler,
  Cookie,
  DollarSign,
  Eye,
  EyeOff,
  Save,
  X,
  Link as LinkIcon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Interfaces
interface CakeOccasion {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
}

interface CakeSize {
  id: string;
  name: string;
  nameEn: string;
  servings: string;
  isActive: boolean;
  createdAt: string;
}

interface CakeFlavor {
  id: string;
  name: string;
  nameEn: string;
  color: string;
  additionalPrice: number;
  isActive: boolean;
  createdAt: string;
}

interface OccasionSize {
  occasionId: string;
  sizeId: string;
  sizeName: string;
  price: number;
}

type TabType = 'occasions' | 'sizes' | 'flavors' | 'pricing';

const CakeConfigurationManagement: React.FC = () => {
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('occasions');
  
  // Occasions state
  const [occasions, setOccasions] = useState<CakeOccasion[]>([]);
  const [editingOccasion, setEditingOccasion] = useState<CakeOccasion | null>(null);
  const [occasionForm, setOccasionForm] = useState({
    name: '',
    nameEn: '',
    icon: '',
    isActive: true,
  });

  // Sizes state
  const [sizes, setSizes] = useState<CakeSize[]>([]);
  const [editingSize, setEditingSize] = useState<CakeSize | null>(null);
  const [sizeForm, setSizeForm] = useState({
    name: '',
    nameEn: '',
    servings: '',
    isActive: true,
  });

  // Flavors state
  const [flavors, setFlavors] = useState<CakeFlavor[]>([]);
  const [editingFlavor, setEditingFlavor] = useState<CakeFlavor | null>(null);
  const [flavorForm, setFlavorForm] = useState({
    name: '',
    nameEn: '',
    color: '#FCD34D',
    additionalPrice: '',
    isActive: true,
  });

  // Pricing state
  const [selectedOccasionForPricing, setSelectedOccasionForPricing] = useState('');
  const [occasionSizes, setOccasionSizes] = useState<OccasionSize[]>([]);
  const [pricingForm, setPricingForm] = useState<{ [key: string]: string }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [includeInactive, setIncludeInactive] = useState(false);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (userRole !== 'admin') {
      navigate('/');
      return;
    }

    fetchData();
  }, [isAuthenticated, userRole, navigate, activeTab, includeInactive]);

  const fetchData = async () => {
    switch (activeTab) {
      case 'occasions':
        await fetchOccasions();
        break;
      case 'sizes':
        await fetchSizes();
        break;
      case 'flavors':
        await fetchFlavors();
        break;
      case 'pricing':
        await fetchOccasions();
        await fetchSizes();
        break;
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      throw new Error('لا يوجد رمز مصادقة. يرجى تسجيل الدخول مرة أخرى.');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  // ========== OCCASIONS ==========
  const fetchOccasions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${apiUrl}/api/CakeConfiguration/occasions?includeInactive=${includeInactive}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) throw new Error('فشل في جلب المناسبات');
      const data = await response.json();
      setOccasions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب المناسبات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOccasion = async () => {
    if (!occasionForm.name || !occasionForm.nameEn || !occasionForm.icon) {
      alert('جميع الحقول مطلوبة');
      return;
    }

    setIsLoading(true);
    try {
      const url = editingOccasion
        ? `${apiUrl}/api/CakeConfiguration/occasions/${editingOccasion.id}`
        : `${apiUrl}/api/CakeConfiguration/occasions`;
      
      const response = await fetch(url, {
        method: editingOccasion ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(occasionForm),
      });

      if (!response.ok) throw new Error('فشل في حفظ المناسبة');
      
      await fetchOccasions();
      resetOccasionForm();
      alert(editingOccasion ? 'تم تحديث المناسبة بنجاح!' : 'تم إضافة المناسبة بنجاح!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ المناسبة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOccasion = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه المناسبة؟')) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/api/CakeConfiguration/occasions/${id}`,
        { method: 'DELETE', headers: getAuthHeaders() }
      );

      if (!response.ok) throw new Error('فشل في حذف المناسبة');
      
      await fetchOccasions();
      alert('تم حذف المناسبة بنجاح!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'حدث خطأ أثناء حذف المناسبة');
    } finally {
      setIsLoading(false);
    }
  };

  const resetOccasionForm = () => {
    setEditingOccasion(null);
    setOccasionForm({ name: '', nameEn: '', icon: '', isActive: true });
  };

  // ========== SIZES ==========
  const fetchSizes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${apiUrl}/api/CakeConfiguration/sizes?includeInactive=${includeInactive}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) throw new Error('فشل في جلب الأحجام');
      const data = await response.json();
      setSizes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب الأحجام');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSize = async () => {
    if (!sizeForm.name || !sizeForm.nameEn || !sizeForm.servings) {
      alert('جميع الحقول مطلوبة');
      return;
    }

    setIsLoading(true);
    try {
      const url = editingSize
        ? `${apiUrl}/api/CakeConfiguration/sizes/${editingSize.id}`
        : `${apiUrl}/api/CakeConfiguration/sizes`;
      
      const response = await fetch(url, {
        method: editingSize ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(sizeForm),
      });

      if (!response.ok) throw new Error('فشل في حفظ الحجم');
      
      await fetchSizes();
      resetSizeForm();
      alert(editingSize ? 'تم تحديث الحجم بنجاح!' : 'تم إضافة الحجم بنجاح!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ الحجم');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSize = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحجم؟')) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/api/CakeConfiguration/sizes/${id}`,
        { method: 'DELETE', headers: getAuthHeaders() }
      );

      if (!response.ok) throw new Error('فشل في حذف الحجم');
      
      await fetchSizes();
      alert('تم حذف الحجم بنجاح!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'حدث خطأ أثناء حذف الحجم');
    } finally {
      setIsLoading(false);
    }
  };

  const resetSizeForm = () => {
    setEditingSize(null);
    setSizeForm({ name: '', nameEn: '', servings: '', isActive: true });
  };

  // ========== FLAVORS ==========
  const fetchFlavors = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${apiUrl}/api/CakeConfiguration/flavors?includeInactive=${includeInactive}`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) throw new Error('فشل في جلب النكهات');
      const data = await response.json();
      setFlavors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب النكهات');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFlavor = async () => {
    if (!flavorForm.name || !flavorForm.nameEn) {
      alert('الاسم بالعربية والإنجليزية مطلوب');
      return;
    }

    setIsLoading(true);
    try {
      const url = editingFlavor
        ? `${apiUrl}/api/CakeConfiguration/flavors/${editingFlavor.id}`
        : `${apiUrl}/api/CakeConfiguration/flavors`;
      
      const body = {
        ...flavorForm,
        additionalPrice: parseFloat(flavorForm.additionalPrice) || 0,
      };

      const response = await fetch(url, {
        method: editingFlavor ? 'PUT' : 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) throw new Error('فشل في حفظ النكهة');
      
      await fetchFlavors();
      resetFlavorForm();
      alert(editingFlavor ? 'تم تحديث النكهة بنجاح!' : 'تم إضافة النكهة بنجاح!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ النكهة');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFlavor = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه النكهة؟')) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/api/CakeConfiguration/flavors/${id}`,
        { method: 'DELETE', headers: getAuthHeaders() }
      );

      if (!response.ok) throw new Error('فشل في حذف النكهة');
      
      await fetchFlavors();
      alert('تم حذف النكهة بنجاح!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'حدث خطأ أثناء حذف النكهة');
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlavorForm = () => {
    setEditingFlavor(null);
    setFlavorForm({ name: '', nameEn: '', color: '#FCD34D', additionalPrice: '', isActive: true });
  };

  // ========== PRICING ==========
  const fetchOccasionSizes = async (occasionId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${apiUrl}/api/CakeConfiguration/occasions/${occasionId}/sizes`,
        { headers: getAuthHeaders() }
      );

      if (!response.ok) throw new Error('فشل في جلب الأسعار');
      const data = await response.json();
      setOccasionSizes(data);
      
      // Initialize pricing form
      const initialPrices: { [key: string]: string } = {};
      data.forEach((os: OccasionSize) => {
        initialPrices[os.sizeId] = os.price.toString();
      });
      setPricingForm(initialPrices);
    } catch (error) {
      console.error('Error fetching occasion sizes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePricing = async () => {
    if (!selectedOccasionForPricing) {
      alert('يرجى اختيار مناسبة');
      return;
    }

    setIsLoading(true);
    try {
      const sizesData = sizes.map(size => ({
        sizeId: size.id,
        price: parseFloat(pricingForm[size.id] || '0'),
      })).filter(item => item.price > 0);

      const response = await fetch(
        `${apiUrl}/api/CakeConfiguration/occasions/${selectedOccasionForPricing}/sizes`,
        {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify(sizesData),
        }
      );

      if (!response.ok) throw new Error('فشل في حفظ الأسعار');
      
      await fetchOccasionSizes(selectedOccasionForPricing);
      alert('تم حفظ الأسعار بنجاح!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'حدث خطأ أثناء حفظ الأسعار');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const iconOptions = ['🎂', '💒', '💍', '🎓', '👶', '🏆', '❤️', '🎉', '🎈', '🎁', '⭐', '✨'];

  return (
    <div className="p-6 bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-xl">
            <Cake className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-purple-900">إعدادات التورتات المخصصة</h2>
            <p className="text-sm text-purple-600">إدارة المناسبات والأحجام والنكهات والأسعار</p>
          </div>
        </div>
        <Sparkles className="h-8 w-8 text-amber-500 animate-pulse" />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 flex items-center shadow-lg">
          <AlertCircle className="h-5 w-5 text-red-600 ml-2 flex-shrink-0" />
          <span className="text-red-800 font-medium flex-1">{error}</span>
          <button
            onClick={fetchData}
            className="mr-auto bg-red-100 hover:bg-red-200 px-4 py-2 rounded-xl text-sm text-red-800 flex items-center font-semibold transition-all"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 ml-1" />
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-xl p-2 mb-6 border-2 border-purple-100 flex gap-2">
        <button
          onClick={() => setActiveTab('occasions')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'occasions'
              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
              : 'text-purple-700 hover:bg-purple-50'
          }`}
        >
          <Calendar className="h-5 w-5" />
          المناسبات
        </button>
        <button
          onClick={() => setActiveTab('sizes')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'sizes'
              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
              : 'text-purple-700 hover:bg-purple-50'
          }`}
        >
          <Ruler className="h-5 w-5" />
          الأحجام
        </button>
        <button
          onClick={() => setActiveTab('flavors')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'flavors'
              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
              : 'text-purple-700 hover:bg-purple-50'
          }`}
        >
          <Cookie className="h-5 w-5" />
          النكهات
        </button>
        <button
          onClick={() => setActiveTab('pricing')}
          className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'pricing'
              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
              : 'text-purple-700 hover:bg-purple-50'
          }`}
        >
          <DollarSign className="h-5 w-5" />
          الأسعار
        </button>
      </div>

      {/* Include Inactive Toggle */}
      {activeTab !== 'pricing' && (
        <div className="mb-6 flex items-center justify-end gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-sm font-medium text-purple-900">عرض المحذوفات</span>
            <button
              onClick={() => setIncludeInactive(!includeInactive)}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                includeInactive ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  includeInactive ? 'transform translate-x-6' : ''
                }`}
              />
            </button>
          </label>
        </div>
      )}

      {/* OCCASIONS TAB */}
      {activeTab === 'occasions' && (
        <>
          {/* Add/Edit Form */}
          <div className="mb-8 p-6 bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border-2 border-purple-100">
            <h3 className="text-xl font-bold text-purple-900 mb-6 flex items-center gap-2">
              {editingOccasion ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingOccasion ? 'تعديل المناسبة' : 'إضافة مناسبة جديدة'}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">
                  الاسم بالعربية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={occasionForm.name}
                  onChange={(e) => setOccasionForm({ ...occasionForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right"
                  dir="rtl"
                  placeholder="مثال: عيد ميلاد"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">
                  Name in English <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={occasionForm.nameEn}
                  onChange={(e) => setOccasionForm({ ...occasionForm, nameEn: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Birthday"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">
                  الأيقونة <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-6 gap-2 mb-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setOccasionForm({ ...occasionForm, icon })}
                      className={`text-2xl p-2 rounded-xl border-2 transition-all ${
                        occasionForm.icon === icon
                          ? 'border-purple-500 bg-purple-50 scale-110'
                          : 'border-purple-200 hover:border-purple-400 hover:bg-purple-50'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={occasionForm.icon}
                  onChange={(e) => setOccasionForm({ ...occasionForm, icon: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-2xl"
                  placeholder="🎂"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">الحالة</label>
                <select
                  value={occasionForm.isActive ? 'true' : 'false'}
                  onChange={(e) => setOccasionForm({ ...occasionForm, isActive: e.target.value === 'true' })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right font-medium"
                  dir="rtl"
                >
                  <option value="true">مفعّل</option>
                  <option value="false">غير مفعّل</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveOccasion}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all font-semibold shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {editingOccasion ? 'تحديث' : 'إضافة'}
              </button>
              {(editingOccasion || occasionForm.name || occasionForm.nameEn || occasionForm.icon) && (
                <button
                  onClick={resetOccasionForm}
                  disabled={isLoading}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all font-semibold flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  إلغاء
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
            <h4 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              المناسبات المتاحة ({occasions.length})
            </h4>
            {occasions.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد مناسبات</p>
            ) : (
              <div className="space-y-3">
                {occasions.map((occasion) => (
                  <div
                    key={occasion.id}
                    className="flex items-center justify-between p-4 border-2 border-purple-100 rounded-xl bg-gradient-to-r from-white to-purple-50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{occasion.icon}</span>
                      <div>
                        <p className="font-bold text-purple-900">{occasion.name}</p>
                        <p className="text-sm text-gray-600">{occasion.nameEn}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            occasion.isActive
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {occasion.isActive ? 'مفعّل' : 'غير مفعّل'}
                          </span>
                          <span className="text-xs text-gray-500">{formatDate(occasion.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingOccasion(occasion);
                          setOccasionForm({
                            name: occasion.name,
                            nameEn: occasion.nameEn,
                            icon: occasion.icon,
                            isActive: occasion.isActive,
                          });
                        }}
                        className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-xl transition-colors"
                        title="تعديل"
                        disabled={isLoading}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteOccasion(occasion.id)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-xl transition-colors"
                        title="حذف"
                        disabled={isLoading}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* SIZES TAB */}
      {activeTab === 'sizes' && (
        <>
          {/* Add/Edit Form */}
          <div className="mb-8 p-6 bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border-2 border-purple-100">
            <h3 className="text-xl font-bold text-purple-900 mb-6 flex items-center gap-2">
              {editingSize ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingSize ? 'تعديل الحجم' : 'إضافة حجم جديد'}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">
                  الاسم بالعربية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sizeForm.name}
                  onChange={(e) => setSizeForm({ ...sizeForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right"
                  dir="rtl"
                  placeholder="مثال: صغير"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">
                  Name in English <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sizeForm.nameEn}
                  onChange={(e) => setSizeForm({ ...sizeForm, nameEn: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Small"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">
                  عدد الأشخاص <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sizeForm.servings}
                  onChange={(e) => setSizeForm({ ...sizeForm, servings: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right"
                  dir="rtl"
                  placeholder="مثال: 8-10 أشخاص"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">الحالة</label>
                <select
                  value={sizeForm.isActive ? 'true' : 'false'}
                  onChange={(e) => setSizeForm({ ...sizeForm, isActive: e.target.value === 'true' })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right font-medium"
                  dir="rtl"
                >
                  <option value="true">مفعّل</option>
                  <option value="false">غير مفعّل</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveSize}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all font-semibold shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {editingSize ? 'تحديث' : 'إضافة'}
              </button>
              {(editingSize || sizeForm.name || sizeForm.nameEn || sizeForm.servings) && (
                <button
                  onClick={resetSizeForm}
                  disabled={isLoading}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all font-semibold flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  إلغاء
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
            <h4 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              الأحجام المتاحة ({sizes.length})
            </h4>
            {sizes.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد أحجام</p>
            ) : (
              <div className="space-y-3">
                {sizes.map((size) => (
                  <div
                    key={size.id}
                    className="flex items-center justify-between p-4 border-2 border-purple-100 rounded-xl bg-gradient-to-r from-white to-purple-50 hover:shadow-md transition-all"
                  >
                    <div>
                      <p className="font-bold text-purple-900">{size.name}</p>
                      <p className="text-sm text-gray-600">{size.nameEn}</p>
                      <p className="text-sm text-purple-600 mt-1">يكفي {size.servings}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          size.isActive
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {size.isActive ? 'مفعّل' : 'غير مفعّل'}
                        </span>
                        <span className="text-xs text-gray-500">{formatDate(size.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingSize(size);
                          setSizeForm({
                            name: size.name,
                            nameEn: size.nameEn,
                            servings: size.servings,
                            isActive: size.isActive,
                          });
                        }}
                        className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-xl transition-colors"
                        title="تعديل"
                        disabled={isLoading}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteSize(size.id)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-xl transition-colors"
                        title="حذف"
                        disabled={isLoading}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* FLAVORS TAB */}
      {activeTab === 'flavors' && (
        <>
          {/* Add/Edit Form */}
          <div className="mb-8 p-6 bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border-2 border-purple-100">
            <h3 className="text-xl font-bold text-purple-900 mb-6 flex items-center gap-2">
              {editingFlavor ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingFlavor ? 'تعديل النكهة' : 'إضافة نكهة جديدة'}
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">
                  الاسم بالعربية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={flavorForm.name}
                  onChange={(e) => setFlavorForm({ ...flavorForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right"
                  dir="rtl"
                  placeholder="مثال: فانيليا"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">
                  Name in English <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={flavorForm.nameEn}
                  onChange={(e) => setFlavorForm({ ...flavorForm, nameEn: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Vanilla"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">اللون</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={flavorForm.color}
                    onChange={(e) => setFlavorForm({ ...flavorForm, color: e.target.value })}
                    className="w-16 h-12 border-2 border-purple-200 rounded-xl cursor-pointer"
                  />
                  <input
                    type="text"
                    value={flavorForm.color}
                    onChange={(e) => setFlavorForm({ ...flavorForm, color: e.target.value })}
                    className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="#FCD34D"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">
                  سعر إضافي (جنيه)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={flavorForm.additionalPrice}
                  onChange={(e) => setFlavorForm({ ...flavorForm, additionalPrice: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right"
                  dir="rtl"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">الحالة</label>
                <select
                  value={flavorForm.isActive ? 'true' : 'false'}
                  onChange={(e) => setFlavorForm({ ...flavorForm, isActive: e.target.value === 'true' })}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right font-medium"
                  dir="rtl"
                >
                  <option value="true">مفعّل</option>
                  <option value="false">غير مفعّل</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveFlavor}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all font-semibold shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                {editingFlavor ? 'تحديث' : 'إضافة'}
              </button>
              {(editingFlavor || flavorForm.name || flavorForm.nameEn) && (
                <button
                  onClick={resetFlavorForm}
                  disabled={isLoading}
                  className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all font-semibold flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  إلغاء
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
            <h4 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
              <Cookie className="h-5 w-5" />
              النكهات المتاحة ({flavors.length})
            </h4>
            {flavors.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد نكهات</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {flavors.map((flavor) => (
                  <div
                    key={flavor.id}
                    className="flex items-center justify-between p-4 border-2 border-purple-100 rounded-xl bg-gradient-to-r from-white to-purple-50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full border-2 border-purple-200"
                        style={{ backgroundColor: flavor.color }}
                      />
                      <div>
                        <p className="font-bold text-purple-900">{flavor.name}</p>
                        <p className="text-sm text-gray-600">{flavor.nameEn}</p>
                        {flavor.additionalPrice > 0 && (
                          <p className="text-xs text-amber-600 font-semibold mt-1">
                            +{flavor.additionalPrice} جنيه
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                            flavor.isActive
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {flavor.isActive ? 'مفعّل' : 'غير مفعّل'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingFlavor(flavor);
                          setFlavorForm({
                            name: flavor.name,
                            nameEn: flavor.nameEn,
                            color: flavor.color,
                            additionalPrice: flavor.additionalPrice.toString(),
                            isActive: flavor.isActive,
                          });
                        }}
                        className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-xl transition-colors"
                        title="تعديل"
                        disabled={isLoading}
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteFlavor(flavor.id)}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-xl transition-colors"
                        title="حذف"
                        disabled={isLoading}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* PRICING TAB */}
      {activeTab === 'pricing' && (
        <>
          <div className="mb-8 p-6 bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border-2 border-purple-100">
            <h3 className="text-xl font-bold text-purple-900 mb-6 flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              ربط الأسعار بالمناسبات
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-purple-900 mb-2">
                اختر المناسبة <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedOccasionForPricing}
                onChange={(e) => {
                  setSelectedOccasionForPricing(e.target.value);
                  if (e.target.value) {
                    fetchOccasionSizes(e.target.value);
                  } else {
                    setOccasionSizes([]);
                    setPricingForm({});
                  }
                }}
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right font-medium"
                dir="rtl"
              >
                <option value="">اختر مناسبة...</option>
                {occasions.filter(o => o.isActive).map((occasion) => (
                  <option key={occasion.id} value={occasion.id}>
                    {occasion.icon} {occasion.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedOccasionForPricing && (
              <>
                <div className="space-y-3 mb-6">
                  <p className="text-sm font-bold text-purple-900 mb-3">أسعار الأحجام المختلفة:</p>
                  {sizes.filter(s => s.isActive).map((size) => (
                    <div key={size.id} className="flex items-center justify-between p-4 border-2 border-purple-100 rounded-xl bg-white">
                      <div>
                        <p className="font-bold text-purple-900">{size.name}</p>
                        <p className="text-sm text-gray-600">{size.servings}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={pricingForm[size.id] || ''}
                          onChange={(e) => setPricingForm({ ...pricingForm, [size.id]: e.target.value })}
                          className="w-32 px-4 py-2 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right"
                          dir="rtl"
                          placeholder="0"
                        />
                        <span className="text-gray-600 font-medium">جنيه</span>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSavePricing}
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  حفظ الأسعار
                </button>
              </>
            )}
          </div>

          {selectedOccasionForPricing && occasionSizes.length > 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
              <h4 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                الأسعار الحالية
              </h4>
              <div className="space-y-2">
                {occasionSizes.map((os) => (
                  <div key={os.sizeId} className="flex items-center justify-between p-3 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl">
                    <span className="font-bold text-purple-900">{os.sizeName}</span>
                    <span className="text-xl font-bold text-amber-600">{os.price} جنيه</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CakeConfigurationManagement;
