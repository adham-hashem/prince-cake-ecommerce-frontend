Library
Recent
installHook.js:1 TypeError: l.map is not a function at U1 (index-BRBzzXkA.js:1254:161061) at
Tell me about what they call "Multi-layer perceptron"? and give me an example
هذا كان البوست هو إحنا لسه بندفع ثروات في الهوستنج؟ لما تيجي ترفع .NET Core Web API أول حاجة بتيجي
use paginated result using System; using System.Collections.Generic; using System.Linq; using Sy
New-Text-Document-2.txt
New-Text-Document-2.txt
Privacy Threat Landscape write on that using only at most 10 references including state-of-the-art
New-Text-Document.txt
import { useState, useEffect } from 'react'; import { Upload, Calendar, Clock, CreditCa
import { useState, useEffect } from 'react'; import {   Upload,   Calendar,   Clock,   CreditCard,  
import { useState, useEffect } from 'react'; import {   Upload,   Calendar,   Clock,   CreditCard,  
write the postman request of these files [HttpPost("occasions/{occasionId:guid}/sizes")]
View All


Account

Upgrade
installHook.js:1 TypeError: l.map is not a function
at U1 (index-BRBzzXkA.js:1254:161061)
at ic (index-BRBzzXkA.js:38:16998)
at ti (index-BRBzzXkA.js:40:3139)
at Wp (index-BRBzzXkA.js:40:44737)
at Up (index-BRBzzXkA.js:40:39727)
at N0 (index-BRBzzXkA.js:40:39655)
at Xa (index-BRBzzXkA.js:40:39508)
at mi (index-BRBzzXkA.js:40:35875)
at Lp (index-BRBzzXkA.js:40:34826)
at k (index-BRBzzXkA.js:25:1556)
overrideMethod
@
installHook.js:1
ei
@
index-BRBzzXkA.js:40
Np.r.callback
@
index-BRBzzXkA.js:40
_d
@
index-BRBzzXkA.js:38
Wd
@
index-BRBzzXkA.js:40
Rp
@
index-BRBzzXkA.js:40
v0
@
index-BRBzzXkA.js:40
S0
@
index-BRBzzXkA.js:40
Os
@
index-BRBzzXkA.js:40
Lp
@
index-BRBzzXkA.js:40
k
@
index-BRBzzXkA.js:25
A
@
index-BRBzzXkA.js:25
index-BRBzzXkA.js:1254 Uncaught TypeError: l.map is not a function
at U1 (index-BRBzzXkA.js:1254:161061)
at ic (index-BRBzzXkA.js:38:16998)
at ti (index-BRBzzXkA.js:40:3139)
at Wp (index-BRBzzXkA.js:40:44737)
at Up (index-BRBzzXkA.js:40:39727)
at N0 (index-BRBzzXkA.js:40:39655)
at Xa (index-BRBzzXkA.js:40:39508)
at mi (index-BRBzzXkA.js:40:35875)
at Lp (index-BRBzzXkA.js:40:34826)
at k (index-BRBzzXkA.js:25:1556)
U1
@
index-BRBzzXkA.js:1254
ic
@
index-BRBzzXkA.js:38
ti
@
index-BRBzzXkA.js:40
Wp
@
index-BRBzzXkA.js:40
Up
@
index-BRBzzXkA.js:40
N0
@
index-BRBzzXkA.js:40
Xa
@
index-BRBzzXkA.js:40
mi
@
index-BRBzzXkA.js:40
Lp
@
index-BRBzzXkA.js:40
k
@
index-BRBzzXkA.js:25
A
@
index-BRBzzXkA.js:25

paste.txt
6 steps completed
The error "TypeError: l.map is not a function" occurs when your code tries to call .map() on a value that isn't an array. In your React component, this typically happens when API responses return data in an unexpected format.
​

Root Cause
Your fetch functions expect the API to return arrays directly, but the API might be returning objects with nested data. For example, instead of [{...}, {...}], you might be receiving { data: [{...}, {...}] } or { occasions: [{...}] }.
​

Solutions
Check API Response Structure
Add console logging to inspect what your API actually returns:
​

javascript
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
    
    // Add this to inspect the structure
    console.log('API Response:', data);
    console.log('Is Array?', Array.isArray(data));
    
    setOccasions(data);
  } catch (err) {
    setError(err instanceof Error ? err.message : 'فشل في جلب المناسبات');
  } finally {
    setIsLoading(false);
  }
};
Fix Data Access
If the API returns nested data, adjust how you set state:
​

javascript
// If response is { data: [...] }
setOccasions(data.data);

// If response is { occasions: [...] }
setOccasions(data.occasions);
Add Safety Checks
Protect your .map() calls with array validation:
​

javascript
{Array.isArray(occasions) && occasions.length > 0 ? (
  occasions.map((occasion) => (
    <div key={occasion.id}>
      {/* ... */}
    </div>
  ))
) : (
  <p className="text-center text-gray-500">لا توجد مناسبات</p>
)}
Universal Fix for All Fetch Functions
Apply array validation to all your fetch functions:

javascript
const data = await response.json();
// Ensure data is always an array
setOccasions(Array.isArray(data) ? data : data.data || []);
This approach ensures your state always contains an array, even if the API structure changes.
​

write full corrected code
5 steps completed
CakeConfigurationManagement_CORRECTED_Part1.tsx
Generated File

CakeConfigurationManagement_CORRECTED_Part2.tsx
Generated File

CakeConfigurationManagement_COMPLETE.tsx
Generated File

CakeConfigurationManagement_CORRECTED_Part3.tsx
Generated File

I've created the complete corrected code file . The error has been fixed with multiple safety measures applied throughout the component.

Key Fixes Applied
Array Initialization
All state variables that use .map() are now properly initialized as empty arrays:
​

typescript
const [occasions, setOccasions] = useState<CakeOccasion[]>([]);
const [sizes, setSizes] = useState<CakeSize[]>([]);
const [flavors, setFlavors] = useState<CakeFlavor[]>([]);
const [occasionSizes, setOccasionSizes] = useState<OccasionSize[]>([]);
API Response Validation
Each fetch function now validates that the response is an array before setting state:
​

typescript
if (Array.isArray(data)) {
  setOccasions(data);
} else if (data && Array.isArray(data.data)) {
  setOccasions(data.data);
} else if (data && Array.isArray(data.occasions)) {
  setOccasions(data.occasions);
} else {
  console.error('Invalid data format:', data);
  setOccasions([]);
  setError('تنسيق البيانات غير صحيح');
}
Safe Rendering
All .map() calls are now protected with Array.isArray() checks:
​

typescript
{!Array.isArray(occasions) || occasions.length === 0 ? (
  <p>لا توجد مناسبات</p>
) : (
  occasions.map((occasion) => ...)
)}
Error Handling
Error handlers set empty arrays to prevent crashes:
​

typescript
catch (err) {
  setError(err instanceof Error ? err.message : 'فشل في جلب المناسبات');
  setOccasions([]); // Ensures state is always an array
}
Debugging Support
Console logging added to help identify API response structure issues:
​

typescript
console.log('Occasions API Response:', data);
This comprehensive fix ensures your component will never crash with the "map is not a function" error, regardless of what the API returns.
​






CakeConfigurationManagement_COMPLETE.tsx
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
  Save,
  X,
  Link as LinkIcon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Interfaces
interface CakeOccasion {
  id: string;
  nameAr: string;
  name: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
}

interface CakeSize {
  id: string;
  nameAr: string;
  name: string;
  personsCount: string;
  personsCountAr: string;
  isActive: boolean;
  createdAt: string;
}

interface CakeFlavor {
  id: string;
  nameAr: string;
  name: string;
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
  isActive: boolean;
}

type TabType = 'occasions' | 'sizes' | 'flavors' | 'pricing';

const CakeConfigurationManagement: React.FC = () => {
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('occasions');

  // Occasions state - FIXED: Initialize as empty array
  const [occasions, setOccasions] = useState<CakeOccasion[]>([]);
  const [editingOccasion, setEditingOccasion] = useState<CakeOccasion | null>(null);
  const [occasionForm, setOccasionForm] = useState({
    nameAr: '',
    name: '',
    icon: '',
    isActive: true,
  });

  // Sizes state - FIXED: Initialize as empty array
  const [sizes, setSizes] = useState<CakeSize[]>([]);
  const [editingSize, setEditingSize] = useState<CakeSize | null>(null);
  const [sizeForm, setSizeForm] = useState({
    nameAr: '',
    name: '',
    personsCount: '',
    personsCountAr: '',
    isActive: true,
  });

  // Flavors state - FIXED: Initialize as empty array
  const [flavors, setFlavors] = useState<CakeFlavor[]>([]);
  const [editingFlavor, setEditingFlavor] = useState<CakeFlavor | null>(null);
  const [flavorForm, setFlavorForm] = useState({
    nameAr: '',
    name: '',
    color: '#FCD34D',
    additionalPrice: '',
    isActive: true,
  });

  // Pricing state - FIXED: Initialize as empty array
  const [selectedOccasionForPricing, setSelectedOccasionForPricing] = useState('');
  const [occasionSizes, setOccasionSizes] = useState<OccasionSize[]>([]);
  const [pricingForm, setPricingForm] = useState<{ [key: string]: { price: string; isActive: boolean } }>({});

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

      // FIXED: Validate response is an array
      console.log('Occasions API Response:', data);
      if (Array.isArray(data)) {
        setOccasions(data);
      } else if (data && Array.isArray(data.data)) {
        setOccasions(data.data);
      } else if (data && Array.isArray(data.occasions)) {
        setOccasions(data.occasions);
      } else {
        console.error('Invalid occasions data format:', data);
        setOccasions([]);
        setError('تنسيق البيانات غير صحيح');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب المناسبات');
      setOccasions([]); // FIXED: Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveOccasion = async () => {
    if (!occasionForm.nameAr || !occasionForm.name || !occasionForm.icon) {
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
        body: JSON.stringify({
          nameAr: occasionForm.nameAr,
          name: occasionForm.name,
          icon: occasionForm.icon,
          isActive: occasionForm.isActive,
        }),
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
    setOccasionForm({ nameAr: '', name: '', icon: '', isActive: true });
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

      // FIXED: Validate response is an array
      console.log('Sizes API Response:', data);
      if (Array.isArray(data)) {
        setSizes(data);
      } else if (data && Array.isArray(data.data)) {
        setSizes(data.data);
      } else if (data && Array.isArray(data.sizes)) {
        setSizes(data.sizes);
      } else {
        console.error('Invalid sizes data format:', data);
        setSizes([]);
        setError('تنسيق البيانات غير صحيح');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب الأحجام');
      setSizes([]); // FIXED: Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSize = async () => {
    if (!sizeForm.nameAr || !sizeForm.name || !sizeForm.personsCount || !sizeForm.personsCountAr) {
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
        body: JSON.stringify({
          nameAr: sizeForm.nameAr,
          name: sizeForm.name,
          personsCount: sizeForm.personsCount,
          personsCountAr: sizeForm.personsCountAr,
          isActive: sizeForm.isActive,
        }),
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
    setSizeForm({ nameAr: '', name: '', personsCount: '', personsCountAr: '', isActive: true });
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

      // FIXED: Validate response is an array
      console.log('Flavors API Response:', data);
      if (Array.isArray(data)) {
        setFlavors(data);
      } else if (data && Array.isArray(data.data)) {
        setFlavors(data.data);
      } else if (data && Array.isArray(data.flavors)) {
        setFlavors(data.flavors);
      } else {
        console.error('Invalid flavors data format:', data);
        setFlavors([]);
        setError('تنسيق البيانات غير صحيح');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب النكهات');
      setFlavors([]); // FIXED: Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFlavor = async () => {
    if (!flavorForm.nameAr || !flavorForm.name) {
      alert('الاسم بالعربية والإنجليزية مطلوب');
      return;
    }

    setIsLoading(true);
    try {
      const url = editingFlavor
        ? `${apiUrl}/api/CakeConfiguration/flavors/${editingFlavor.id}`
        : `${apiUrl}/api/CakeConfiguration/flavors`;

      const body = {
        nameAr: flavorForm.nameAr,
        name: flavorForm.name,
        color: flavorForm.color,
        additionalPrice: parseFloat(flavorForm.additionalPrice) || 0,
        isActive: flavorForm.isActive,
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
    setFlavorForm({ nameAr: '', name: '', color: '#FCD34D', additionalPrice: '', isActive: true });
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

      // FIXED: Validate response is an array
      console.log('Occasion Sizes API Response:', data);
      const sizesData = Array.isArray(data) ? data : (data?.data || data?.sizes || []);
      setOccasionSizes(sizesData);

      // Initialize pricing form
      const initialPrices: { [key: string]: { price: string; isActive: boolean } } = {};
      sizes.forEach((size) => {
        const existingSize = sizesData.find((os: OccasionSize) => os.sizeId === size.id);
        initialPrices[size.id] = {
          price: existingSize ? existingSize.price.toString() : '',
          isActive: existingSize ? existingSize.isActive : true,
        };
      });
      setPricingForm(initialPrices);
    } catch (error) {
      console.error('Error fetching occasion sizes:', error);
      setOccasionSizes([]); // FIXED: Set empty array on error
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
        price: parseFloat(pricingForm[size.id]?.price || '0'),
        isActive: pricingForm[size.id]?.isActive ?? true,
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
    <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50 min-h-screen">
      {/* Header */}
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-2 sm:p-3 rounded-xl">
            <Cake className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-purple-900">إعدادات التورتات</h2>
            <p className="text-xs sm:text-sm text-purple-600 hidden sm:block">إدارة المناسبات والأحجام والنكهات والأسعار</p>
          </div>
        </div>
        <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-amber-500 animate-pulse" />
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 mb-4 sm:mb-6 flex items-start sm:items-center shadow-lg">
          <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 ml-2 flex-shrink-0 mt-0.5 sm:mt-0" />
          <span className="text-sm sm:text-base text-red-800 font-medium flex-1">{error}</span>
          <button
            onClick={fetchData}
            className="mr-auto bg-red-100 hover:bg-red-200 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm text-red-800 flex items-center font-semibold transition-all"
            disabled={isLoading}
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 ml-1" />
            <span className="hidden sm:inline">إعادة المحاولة</span>
            <span className="sm:hidden">إعادة</span>
          </button>
        </div>
      )}

      {/* Tabs - Mobile Optimized */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-1 sm:p-2 mb-4 sm:mb-6 border-2 border-purple-100">
        <div className="grid grid-cols-2 sm:flex gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('occasions')}
            className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base ${
              activeTab === 'occasions'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
                : 'text-purple-700 hover:bg-purple-50'
            }`}
          >
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">المناسبات</span>
            <span className="sm:hidden">مناسبات</span>
          </button>
          <button
            onClick={() => setActiveTab('sizes')}
            className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base ${
              activeTab === 'sizes'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
                : 'text-purple-700 hover:bg-purple-50'
            }`}
          >
            <Ruler className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">الأحجام</span>
            <span className="sm:hidden">أحجام</span>
          </button>
          <button
            onClick={() => setActiveTab('flavors')}
            className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base ${
              activeTab === 'flavors'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
                : 'text-purple-700 hover:bg-purple-50'
            }`}
          >
            <Cookie className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">النكهات</span>
            <span className="sm:hidden">نكهات</span>
          </button>
          <button
            onClick={() => setActiveTab('pricing')}
            className={`py-2 sm:py-3 px-2 sm:px-4 rounded-lg sm:rounded-xl font-bold transition-all flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm md:text-base ${
              activeTab === 'pricing'
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white shadow-md'
                : 'text-purple-700 hover:bg-purple-50'
            }`}
          >
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="hidden sm:inline">الأسعار</span>
            <span className="sm:hidden">أسعار</span>
          </button>
        </div>
      </div>

      {/* Include Inactive Toggle */}
      {activeTab !== 'pricing' && (
        <div className="mb-4 sm:mb-6 flex items-center justify-end gap-2">
          <label className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
            <span className="text-xs sm:text-sm font-medium text-purple-900">عرض المحذوفات</span>
            <button
              onClick={() => setIncludeInactive(!includeInactive)}
              className={`relative w-10 h-5 sm:w-12 sm:h-6 rounded-full transition-colors ${
                includeInactive ? 'bg-purple-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-0.5 sm:top-1 left-0.5 sm:left-1 w-4 h-4 sm:w-4 sm:h-4 bg-white rounded-full transition-transform ${
                  includeInactive ? 'transform translate-x-5 sm:translate-x-6' : ''
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
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-white to-purple-50 rounded-xl sm:rounded-2xl shadow-xl border-2 border-purple-100">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-purple-900 mb-4 sm:mb-6 flex items-center gap-2">
              {editingOccasion ? <Edit className="h-4 w-4 sm:h-5 sm:w-5" /> : <Plus className="h-4 w-4 sm:h-5 sm:w-5" />}
              <span className="text-sm sm:text-base md:text-xl">{editingOccasion ? 'تعديل المناسبة' : 'إضافة مناسبة جديدة'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-2">
                  الاسم بالعربية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={occasionForm.nameAr}
                  onChange={(e) => setOccasionForm({ ...occasionForm, nameAr: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right text-sm sm:text-base"
                  dir="rtl"
                  placeholder="مثال: عيد ميلاد"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-2">
                  Name in English <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={occasionForm.name}
                  onChange={(e) => setOccasionForm({ ...occasionForm, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="e.g., Birthday"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-2">
                  الأيقونة <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-6 sm:grid-cols-6 md:grid-cols-12 gap-1.5 sm:gap-2 mb-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setOccasionForm({ ...occasionForm, icon })}
                      className={`text-xl sm:text-2xl p-1.5 sm:p-2 rounded-lg sm:rounded-xl border-2 transition-all ${
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
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center text-xl sm:text-2xl"
                  placeholder="🎂"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-2">الحالة</label>
                <select
                  value={occasionForm.isActive ? 'true' : 'false'}
                  onChange={(e) => setOccasionForm({ ...occasionForm, isActive: e.target.value === 'true' })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right font-medium text-sm sm:text-base"
                  dir="rtl"
                >
                  <option value="true">مفعّل</option>
                  <option value="false">غير مفعّل</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={handleSaveOccasion}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
              >
                <Save className="h-4 w-4" />
                {editingOccasion ? 'تحديث' : 'إضافة'}
              </button>
              {(editingOccasion || occasionForm.nameAr || occasionForm.name || occasionForm.icon) && (
                <button
                  onClick={resetOccasionForm}
                  disabled={isLoading}
                  className="bg-gray-200 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-gray-300 transition-all font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <X className="h-4 w-4" />
                  إلغاء
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-purple-100">
            <h4 className="text-base sm:text-lg font-bold text-purple-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
              المناسبات المتاحة ({occasions.length})
            </h4>
            {/* FIXED: Added Array.isArray check */}
            {!Array.isArray(occasions) || occasions.length === 0 ? (
              <p className="text-center text-gray-500 py-6 sm:py-8 text-sm sm:text-base">لا توجد مناسبات</p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {occasions.map((occasion) => (
                  <div
                    key={occasion.id}
                    className="flex items-center justify-between p-3 sm:p-4 border-2 border-purple-100 rounded-lg sm:rounded-xl bg-gradient-to-r from-white to-purple-50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-2 sm:gap-4 flex-1">
                      <span className="text-2xl sm:text-3xl">{occasion.icon}</span>
                      <div className="flex-1">
                        <p className="font-bold text-purple-900 text-sm sm:text-base">{occasion.nameAr}</p>
                        <p className="text-xs sm:text-sm text-gray-600">{occasion.name}</p>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                            occasion.isActive
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {occasion.isActive ? 'مفعّل' : 'غير مفعّل'}
                          </span>
                          <span className="text-[10px] sm:text-xs text-gray-500 hidden sm:inline">{formatDate(occasion.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => {
                          setEditingOccasion(occasion);
                          setOccasionForm({
                            nameAr: occasion.nameAr,
                            name: occasion.name,
                            icon: occasion.icon,
                            isActive: occasion.isActive,
                          });
                        }}
                        className="text-blue-600 hover:text-blue-700 p-1.5 sm:p-2 hover:bg-blue-50 rounded-lg sm:rounded-xl transition-colors"
                        title="تعديل"
                        disabled={isLoading}
                      >
                        <Edit size={16} className="sm:hidden" />
                        <Edit size={18} className="hidden sm:block" />
                      </button>
                      <button
                        onClick={() => handleDeleteOccasion(occasion.id)}
                        className="text-red-600 hover:text-red-700 p-1.5 sm:p-2 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors"
                        title="حذف"
                        disabled={isLoading}
                      >
                        <Trash2 size={16} className="sm:hidden" />
                        <Trash2 size={18} className="hidden sm:block" />
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
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-white to-purple-50 rounded-xl sm:rounded-2xl shadow-xl border-2 border-purple-100">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-purple-900 mb-4 sm:mb-6 flex items-center gap-2">
              {editingSize ? <Edit className="h-4 w-4 sm:h-5 sm:w-5" /> : <Plus className="h-4 w-4 sm:h-5 sm:w-5" />}
              <span className="text-sm sm:text-base md:text-xl">{editingSize ? 'تعديل الحجم' : 'إضافة حجم جديد'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-2">
                  الاسم بالعربية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sizeForm.nameAr}
                  onChange={(e) => setSizeForm({ ...sizeForm, nameAr: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right text-sm sm:text-base"
                  dir="rtl"
                  placeholder="مثال: صغير"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-2">
                  Name in English <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sizeForm.name}
                  onChange={(e) => setSizeForm({ ...sizeForm, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="e.g., Small"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-2">
                  عدد الأشخاص (عربي) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sizeForm.personsCountAr}
                  onChange={(e) => setSizeForm({ ...sizeForm, personsCountAr: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right text-sm sm:text-base"
                  dir="rtl"
                  placeholder="مثال: 2-4 أشخاص"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-2">
                  Servings (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={sizeForm.personsCount}
                  onChange={(e) => setSizeForm({ ...sizeForm, personsCount: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="e.g., 2-4 persons"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-2">الحالة</label>
                <select
                  value={sizeForm.isActive ? 'true' : 'false'}
                  onChange={(e) => setSizeForm({ ...sizeForm, isActive: e.target.value === 'true' })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right font-medium text-sm sm:text-base"
                  dir="rtl"
                >
                  <option value="true">مفعّل</option>
                  <option value="false">غير مفعّل</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={handleSaveSize}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
              >
                <Save className="h-4 w-4" />
                {editingSize ? 'تحديث' : 'إضافة'}
              </button>
              {(editingSize || sizeForm.nameAr || sizeForm.name || sizeForm.personsCount || sizeForm.personsCountAr) && (
                <button
                  onClick={resetSizeForm}
                  disabled={isLoading}
                  className="bg-gray-200 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-gray-300 transition-all font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <X className="h-4 w-4" />
                  إلغاء
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-purple-100">
            <h4 className="text-base sm:text-lg font-bold text-purple-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Ruler className="h-4 w-4 sm:h-5 sm:w-5" />
              الأحجام المتاحة ({sizes.length})
            </h4>
            {/* FIXED: Added Array.isArray check */}
            {!Array.isArray(sizes) || sizes.length === 0 ? (
              <p className="text-center text-gray-500 py-6 sm:py-8 text-sm sm:text-base">لا توجد أحجام</p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {sizes.map((size) => (
                  <div
                    key={size.id}
                    className="flex items-center justify-between p-3 sm:p-4 border-2 border-purple-100 rounded-lg sm:rounded-xl bg-gradient-to-r from-white to-purple-50 hover:shadow-md transition-all"
                  >
                    <div className="flex-1">
                      <p className="font-bold text-purple-900 text-sm sm:text-base">{size.nameAr}</p>
                      <p className="text-xs sm:text-sm text-gray-600">{size.name}</p>
                      <p className="text-xs sm:text-sm text-purple-600 mt-1">يكفي {size.personsCountAr}</p>
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                        <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                          size.isActive
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-gray-100 text-gray-800 border border-gray-200'
                        }`}>
                          {size.isActive ? 'مفعّل' : 'غير مفعّل'}
                        </span>
                        <span className="text-[10px] sm:text-xs text-gray-500 hidden sm:inline">{formatDate(size.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => {
                          setEditingSize(size);
                          setSizeForm({
                            nameAr: size.nameAr,
                            name: size.name,
                            personsCount: size.personsCount,
                            personsCountAr: size.personsCountAr,
                            isActive: size.isActive,
                          });
                        }}
                        className="text-blue-600 hover:text-blue-700 p-1.5 sm:p-2 hover:bg-blue-50 rounded-lg sm:rounded-xl transition-colors"
                        title="تعديل"
                        disabled={isLoading}
                      >
                        <Edit size={16} className="sm:hidden" />
                        <Edit size={18} className="hidden sm:block" />
                      </button>
                      <button
                        onClick={() => handleDeleteSize(size.id)}
                        className="text-red-600 hover:text-red-700 p-1.5 sm:p-2 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors"
                        title="حذف"
                        disabled={isLoading}
                      >
                        <Trash2 size={16} className="sm:hidden" />
                        <Trash2 size={18} className="hidden sm:block" />
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
          <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-white to-purple-50 rounded-xl sm:rounded-2xl shadow-xl border-2 border-purple-100">
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-purple-900 mb-4 sm:mb-6 flex items-center gap-2">
              {editingFlavor ? <Edit className="h-4 w-4 sm:h-5 sm:w-5" /> : <Plus className="h-4 w-4 sm:h-5 sm:w-5" />}
              <span className="text-sm sm:text-base md:text-xl">{editingFlavor ? 'تعديل النكهة' : 'إضافة نكهة جديدة'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-2">
                  الاسم بالعربية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={flavorForm.nameAr}
                  onChange={(e) => setFlavorForm({ ...flavorForm, nameAr: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right text-sm sm:text-base"
                  dir="rtl"
                  placeholder="مثال: فانيليا"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-2">
                  Name in English <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={flavorForm.name}
                  onChange={(e) => setFlavorForm({ ...flavorForm, name: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base"
                  placeholder="e.g., Vanilla"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-2">اللون</label>
                <input
                  type="color"
                  value={flavorForm.color}
                  onChange={(e) => setFlavorForm({ ...flavorForm, color: e.target.value })}
                  className="w-full h-10 sm:h-12 border-2 border-purple-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-2">السعر الإضافي</label>
                <input
                  type="number"
                  value={flavorForm.additionalPrice}
                  onChange={(e) => setFlavorForm({ ...flavorForm, additionalPrice: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right text-sm sm:text-base"
                  dir="rtl"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-2">الحالة</label>
                <select
                  value={flavorForm.isActive ? 'true' : 'false'}
                  onChange={(e) => setFlavorForm({ ...flavorForm, isActive: e.target.value === 'true' })}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right font-medium text-sm sm:text-base"
                  dir="rtl"
                >
                  <option value="true">مفعّل</option>
                  <option value="false">غير مفعّل</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={handleSaveFlavor}
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
              >
                <Save className="h-4 w-4" />
                {editingFlavor ? 'تحديث' : 'إضافة'}
              </button>
              {(editingFlavor || flavorForm.nameAr || flavorForm.name) && (
                <button
                  onClick={resetFlavorForm}
                  disabled={isLoading}
                  className="bg-gray-200 text-gray-700 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:bg-gray-300 transition-all font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <X className="h-4 w-4" />
                  إلغاء
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-purple-100">
            <h4 className="text-base sm:text-lg font-bold text-purple-900 mb-3 sm:mb-4 flex items-center gap-2">
              <Cookie className="h-4 w-4 sm:h-5 sm:w-5" />
              النكهات المتاحة ({flavors.length})
            </h4>
            {/* FIXED: Added Array.isArray check */}
            {!Array.isArray(flavors) || flavors.length === 0 ? (
              <p className="text-center text-gray-500 py-6 sm:py-8 text-sm sm:text-base">لا توجد نكهات</p>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {flavors.map((flavor) => (
                  <div
                    key={flavor.id}
                    className="flex items-center justify-between p-3 sm:p-4 border-2 border-purple-100 rounded-lg sm:rounded-xl bg-gradient-to-r from-white to-purple-50 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-2 sm:gap-4 flex-1">
                      <div
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: flavor.color }}
                      />
                      <div className="flex-1">
                        <p className="font-bold text-purple-900 text-sm sm:text-base">{flavor.nameAr}</p>
                        <p className="text-xs sm:text-sm text-gray-600">{flavor.name}</p>
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1">
                          <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                            flavor.isActive
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'bg-gray-100 text-gray-800 border border-gray-200'
                          }`}>
                            {flavor.isActive ? 'مفعّل' : 'غير مفعّل'}
                          </span>
                          {flavor.additionalPrice > 0 && (
                            <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] sm:text-xs font-bold border border-amber-200">
                              +{flavor.additionalPrice} جنيه
                            </span>
                          )}
                          <span className="text-[10px] sm:text-xs text-gray-500 hidden sm:inline">{formatDate(flavor.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <button
                        onClick={() => {
                          setEditingFlavor(flavor);
                          setFlavorForm({
                            nameAr: flavor.nameAr,
                            name: flavor.name,
                            color: flavor.color,
                            additionalPrice: flavor.additionalPrice.toString(),
                            isActive: flavor.isActive,
                          });
                        }}
                        className="text-blue-600 hover:text-blue-700 p-1.5 sm:p-2 hover:bg-blue-50 rounded-lg sm:rounded-xl transition-colors"
                        title="تعديل"
                        disabled={isLoading}
                      >
                        <Edit size={16} className="sm:hidden" />
                        <Edit size={18} className="hidden sm:block" />
                      </button>
                      <button
                        onClick={() => handleDeleteFlavor(flavor.id)}
                        className="text-red-600 hover:text-red-700 p-1.5 sm:p-2 hover:bg-red-50 rounded-lg sm:rounded-xl transition-colors"
                        title="حذف"
                        disabled={isLoading}
                      >
                        <Trash2 size={16} className="sm:hidden" />
                        <Trash2 size={18} className="hidden sm:block" />
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
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 border-2 border-purple-100">
          <h3 className="text-base sm:text-lg font-bold text-purple-900 mb-4 sm:mb-6 flex items-center gap-2">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
            إدارة الأسعار
          </h3>

          <div className="mb-4 sm:mb-6">
            <label className="block text-xs sm:text-sm font-bold text-purple-900 mb-2">
              اختر المناسبة <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedOccasionForPricing}
              onChange={(e) => {
                setSelectedOccasionForPricing(e.target.value);
                if (e.target.value) {
                  fetchOccasionSizes(e.target.value);
                }
              }}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right font-medium text-sm sm:text-base"
              dir="rtl"
            >
              <option value="">-- اختر المناسبة --</option>
              {/* FIXED: Added Array.isArray check */}
              {Array.isArray(occasions) && occasions.filter(o => o.isActive).map((occasion) => (
                <option key={occasion.id} value={occasion.id}>
                  {occasion.icon} {occasion.nameAr}
                </option>
              ))}
            </select>
          </div>

          {selectedOccasionForPricing && (
            <>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                {/* FIXED: Added Array.isArray check */}
                {Array.isArray(sizes) && sizes.filter(s => s.isActive).map((size) => (
                  <div key={size.id} className="p-3 sm:p-4 border-2 border-purple-100 rounded-lg sm:rounded-xl bg-gradient-to-r from-white to-purple-50">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-purple-900 text-sm sm:text-base">{size.nameAr}</p>
                        <p className="text-xs sm:text-sm text-gray-600">{size.name} - يكفي {size.personsCountAr}</p>
                      </div>
                      <label className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-xs sm:text-sm font-medium text-purple-900">مفعّل</span>
                        <input
                          type="checkbox"
                          checked={pricingForm[size.id]?.isActive ?? true}
                          onChange={(e) =>
                            setPricingForm({
                              ...pricingForm,
                              [size.id]: {
                                ...pricingForm[size.id],
                                isActive: e.target.checked,
                              },
                            })
                          }
                          className="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
                        />
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={pricingForm[size.id]?.price || ''}
                        onChange={(e) =>
                          setPricingForm({
                            ...pricingForm,
                            [size.id]: {
                              ...pricingForm[size.id],
                              price: e.target.value,
                            },
                          })
                        }
                        className="flex-1 px-3 sm:px-4 py-2 sm:py-3 border-2 border-purple-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right text-sm sm:text-base"
                        dir="rtl"
                        placeholder="السعر"
                        min="0"
                        step="0.01"
                      />
                      <span className="text-purple-900 font-bold text-sm sm:text-base">جنيه</span>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSavePricing}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg sm:rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all font-semibold shadow-md flex items-center justify-center gap-2 disabled:opacity-50 text-sm sm:text-base"
              >
                <Save className="h-4 w-4" />
                حفظ الأسعار
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CakeConfigurationManagement;
