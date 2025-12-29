import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, Upload, Menu, X, ChevronLeft, ChevronRight, EyeOff, Eye, Package, Zap } from 'lucide-react';

// Assuming you have a file at this path
import { useAuth } from '../../contexts/AuthContext';

interface ProductImage {
  id: string;
  imagePath: string;
  isMain: boolean;
}

// Updated Product interface - removed category, sizes, colors, season
interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  createdAt: string;
  images: ProductImage[];
  isHidden: boolean;
  isAvailable: boolean;
  isInstant?: boolean;
  isFeatured?: boolean;
  rating?: number;
  salesCount?: number;
}

interface PaginatedResponse {
  items: Product[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

const ProductsManagement: React.FC = () => {
  const { isAuthenticated, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState('products');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showEditProduct, setShowEditProduct] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Updated newProduct state - changed to empty strings
  const [newProduct, setNewProduct] = useState({
    code: '',
    name: '',
    price: '',
    originalPrice: '',
    description: '',
    sizes: [''],
    colors: [''],
    category: '',  // Changed to empty string
    images: [''],
    isHidden: false,
    isAvailable: true,
    season: '',  // Changed to empty string
    type: 0,
    isInstant: false,
    isFeatured: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const apiUrl = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const getAuthToken = () => {
      const authToken = localStorage.getItem('accessToken');
      setToken(authToken);
      return authToken;
    };

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (userRole !== 'admin') {
      navigate('/');
      return;
    }

    getAuthToken();
  }, [isAuthenticated, userRole, navigate]);

  useEffect(() => {
    if (token) {
      refreshProductsList(currentPage);
    }
  }, [token, currentPage]);

  const handleLogout = () => {
    logout();
    navigate('/');
    alert('تم تسجيل خروج المدير بنجاح');
  };

  const validateToken = () => {
    if (!token) {
      alert('لم يتم العثور على رمز المصادقة. يرجى تسجيل الدخول مرة أخرى.');
      navigate('/login');
      return false;
    }
    return true;
  };

  const refreshProductsList = async (page: number) => {
    if (!token) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/products?pageNumber=${page}&pageSize=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const responseText = await response.text();

      if (response.ok) {
        const data: PaginatedResponse = JSON.parse(responseText);
        if (data && Array.isArray(data.items)) {
          const mappedProducts: Product[] = data.items.map(item => ({
            ...item,
            isHidden: item.isHidden ?? false,
            isAvailable: item.isAvailable ?? false,
            isInstant: item.isInstant ?? false,
            isFeatured: item.isFeatured ?? false,
            rating: item.rating ?? 0,
            salesCount: item.salesCount ?? 0,
            images: item.images.map(img => ({
              id: img.id,
              imagePath: img.imagePath && img.imagePath.startsWith('/') && !img.imagePath.startsWith('http')
                ? `${apiUrl}${img.imagePath}`
                : img.imagePath,
              isMain: img.isMain,
            })),
          }));
          setProducts(mappedProducts);
          setTotalPages(data.totalPages);
        } else {
          alert('تنسيق البيانات غير صحيح');
        }
      } else {
        alert('فشل في جلب المنتجات');
      }
    } catch (error) {
      alert('حدث خطأ أثناء جلب المنتجات');
    } finally {
      setIsLoading(false);
    }
  };

  const checkProductCodeExists = (code: string, excludeId?: string): boolean => {
    return products.some(product =>
      product.code.toLowerCase() === code.toLowerCase() &&
      product.id !== excludeId
    );
  };

  const handleAddProduct = async () => {
    if (isLoading) return;
    if (!validateToken()) return;

    if (!newProduct.code || !newProduct.name || !newProduct.price) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    if (checkProductCodeExists(newProduct.code)) {
      alert('كود المنتج مُستخدم بالفعل. يرجى استخدام كود مختلف.');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', newProduct.name);
      formData.append('code', newProduct.code);
      formData.append('price', newProduct.price);
      formData.append('description', newProduct.description || '');
      formData.append('isHidden', newProduct.isHidden.toString());
      formData.append('isAvailable', newProduct.isAvailable.toString());
      formData.append('isInstant', newProduct.isInstant.toString());
      formData.append('isFeatured', newProduct.isFeatured.toString());
      formData.append('type', newProduct.type.toString());

      // Send empty string if category is empty
      formData.append('category', newProduct.category || '');
      
      // Send empty string if season is empty
      formData.append('season', newProduct.season || '');

      // Only append non-empty sizes or send empty string
      const validSizes = newProduct.sizes.filter(size => size.trim() !== '');
      if (validSizes.length > 0) {
        validSizes.forEach(size => formData.append('sizes[]', size));
      } else {
        formData.append('sizes', '');
      }

      // Only append non-empty colors or send empty string
      const validColors = newProduct.colors.filter(color => color.trim() !== '');
      if (validColors.length > 0) {
        validColors.forEach(color => formData.append('colors[]', color));
      } else {
        formData.append('colors', '');
      }

      if (newProduct.originalPrice) formData.append('originalPrice', newProduct.originalPrice);
      formData.append('mainImageIndex', '0');

      const imageFiles = await Promise.all(
        newProduct.images
          .filter(img => img.trim() !== '')
          .map(async (img, index) => {
            if (img.startsWith('data:image')) {
              const response = await fetch(img);
              const blob = await response.blob();
              return new File([blob], `image-${index}.jpg`, { type: blob.type });
            }
            return null;
          })
      );

      imageFiles
        .filter(file => file !== null)
        .forEach(file => formData.append('imageFiles', file as File));

      const response = await fetch(`${apiUrl}/api/products`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes('already exists')) {
          const codeMatch = errorText.match(/code '([^']+)'/);
          const duplicateCode = codeMatch ? codeMatch[1] : newProduct.code;
          throw new Error(`كود المنتج '${duplicateCode}' مُستخدم بالفعل. يرجى استخدام كود مختلف.`);
        } else if (response.status === 500 && errorText.includes('duplicate key')) {
          throw new Error('كود المنتج مُستخدم بالفعل. يرجى استخدام كود مختلف.');
        } else if (response.status === 400) {
          throw new Error(errorText || 'بيانات المنتج غير صحيحة');
        } else if (response.status === 500) {
          throw new Error(`خطأ في الخادم: ${errorText}`);
        } else {
          throw new Error(`فشل في إضافة المنتج: ${response.status} ${response.statusText}`);
        }
      }

      await refreshProductsList(1);
      setShowAddProduct(false);
      resetProductForm();
      alert('تم إضافة المنتج بنجاح!');

    } catch (error: any) {
      console.error('Error adding product:', error);
      alert(error.message || 'حدث خطأ أثناء إضافة المنتج');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (isLoading || !editingProduct) return;
    if (!validateToken()) return;

    if (!newProduct.code || !newProduct.name || !newProduct.price) {
      alert('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', newProduct.name.trim());
      formData.append('code', newProduct.code.trim());
      formData.append('price', newProduct.price.toString());
      formData.append('description', newProduct.description?.trim() || '');
      formData.append('isHidden', newProduct.isHidden.toString());
      formData.append('isAvailable', newProduct.isAvailable.toString());
      formData.append('isInstant', newProduct.isInstant.toString());
      formData.append('isFeatured', newProduct.isFeatured.toString());
      formData.append('type', newProduct.type.toString());

      // Send empty string if category is empty
      formData.append('category', newProduct.category || '');
      
      // Send empty string if season is empty
      formData.append('season', newProduct.season || '');

      if (newProduct.originalPrice && newProduct.originalPrice.trim() !== '') {
        formData.append('originalPrice', newProduct.originalPrice.toString());
      }

      // Add sizes array - only non-empty values or empty string
      const validSizes = newProduct.sizes.filter(size => size.trim() !== '');
      if (validSizes.length > 0) {
        validSizes.forEach((size, index) => {
          formData.append(`sizes[${index}]`, size.trim());
        });
      } else {
        formData.append('sizes', '');
      }

      // Add colors array - only non-empty values or empty string
      const validColors = newProduct.colors.filter(color => color.trim() !== '');
      if (validColors.length > 0) {
        validColors.forEach((color, index) => {
          formData.append(`colors[${index}]`, color.trim());
        });
      } else {
        formData.append('colors', '');
      }

      // Handle images - only add new uploaded images (data: URLs)
      const newImages = [];
      for (let i = 0; i < newProduct.images.length; i++) {
        const img = newProduct.images[i];
        if (img && img.trim() !== '' && img.startsWith('data:image')) {
          try {
            const response = await fetch(img);
            const blob = await response.blob();
            const file = new File([blob], `image-${i}.jpg`, { type: blob.type });
            newImages.push(file);
          } catch (error) {
            console.error('Error processing image:', error);
          }
        }
      }

      if (newImages.length > 0) {
        formData.append('mainImageIndex', '0');
        newImages.forEach((file) => {
          formData.append('imageFiles', file);
        });
      }

      const response = await fetch(`${apiUrl}/api/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes('already exists') || errorText.includes('duplicate')) {
          const codeMatch = errorText.match(/code '([^']+)'/);
          const duplicateCode = codeMatch ? codeMatch[1] : newProduct.code;
          throw new Error(`كود المنتج '${duplicateCode}' مُستخدم بالفعل. يرجى استخدام كود مختلف.`);
        } else if (response.status === 400) {
          throw new Error(`خطأ في البيانات المرسلة: ${errorText}`);
        } else if (response.status === 401) {
          throw new Error('انتهت صلاحية الجلسة. يرجى تسجيل الدخول مرة أخرى.');
        } else if (response.status === 404) {
          throw new Error('المنتج غير موجود أو تم حذفه.');
        } else {
          throw new Error(`فشل في تحديث المنتج (${response.status}): ${errorText || response.statusText}`);
        }
      }

      await refreshProductsList(currentPage);
      setShowEditProduct(false);
      setEditingProduct(null);
      resetProductForm();
      alert('تم تحديث المنتج بنجاح!');

    } catch (error: any) {
      console.error('Error updating product:', error);
      alert(error.message || 'حدث خطأ أثناء تحديث المنتج');
    } finally {
      setIsLoading(false);
    }
  };

  // Updated resetProductForm with empty strings
  const resetProductForm = () => {
    setNewProduct({
      code: '',
      name: '',
      price: '',
      originalPrice: '',
      description: '',
      sizes: [''],
      colors: [''],
      category: '',  // Changed to empty string
      images: [''],
      isHidden: false,
      isAvailable: true,
      season: '',  // Changed to empty string
      type: 0,
      isInstant: false,
      isFeatured: false,
    });
  };

  // Updated handleEditProduct - reset to empty strings
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setNewProduct({
      code: product.code,
      name: product.name,
      price: product.price.toString(),
      originalPrice: product.originalPrice?.toString() || '',
      description: product.description,
      images: product.images.map(img => img.imagePath),
      sizes: [''],  // Reset to empty
      colors: [''],  // Reset to empty
      category: '',  // Reset to empty
      isHidden: product.isHidden,
      isAvailable: product.isAvailable,
      season: '',  // Reset to empty
      type: 0,
      isInstant: product.isInstant || false,
      isFeatured: product.isFeatured || false,
    });
    setShowEditProduct(true);
    setShowSidebar(false);
  };

  const handleDeleteProduct = async (productId: string) => {
    const productToDelete = products.find(p => p.id === productId);
    if (!confirm(`هل أنت متأكد من حذف المنتج "${productToDelete?.name}"؟\n\nتحذير: إذا كان المنتج موجود في عربات التسوق أو الطلبات، فلن يمكن حذفه.`)) {
      return;
    }

    if (!validateToken()) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 500) {
          if (errorText.includes('REFERENCE constraint') ||
            errorText.includes('FK_CartItems_Products') ||
            errorText.includes('CartItems')) {
            throw new Error('لا يمكن حذف هذا المنتج لأنه موجود في عربات التسوق أو الطلبات الحالية. يرجى إزالته من جميع العربات أولاً أو انتظار حتى يتم إتمام الطلبات المرتبطة به.');
          } else if (errorText.includes('Orders') || errorText.includes('OrderItems')) {
            throw new Error('لا يمكن حذف هذا المنتج لأنه مرتبط بطلبات موجودة. يرجى انتظار حتى يتم معالجة جميع الطلبات المرتبطة به.');
          } else {
            throw new Error(`خطأ في الخادم: ${errorText}`);
          }
        } else if (response.status === 404) {
          throw new Error('المنتج غير موجود أو تم حذفه بالفعل.');
        } else {
          throw new Error(`فشل في حذف المنتج: ${response.status} ${response.statusText}`);
        }
      }

      setProducts(prevProducts => prevProducts.filter(product => product.id !== productId));
      await refreshProductsList(currentPage);
      alert('تم حذف المنتج بنجاح!');
    } catch (error: any) {
      if (error.message.includes('عربات التسوق') || error.message.includes('CartItems')) {
        alert(`❌ ${error.message}\n\n💡 نصيحة: يمكنك إخفاء المنتج بدلاً من حذفه عن طريق تعديله وإلغاء تفعيله.`);
      } else {
        alert(`حدث خطأ أثناء حذف المنتج: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        updateImageField(index, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const addImageField = () => {
    setNewProduct(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const updateImageField = (index: number, value: string) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.map((img, i) => i === index ? value : img)
    }));
  };

  const addSizeField = () => {
    setNewProduct(prev => ({
      ...prev,
      sizes: [...prev.sizes, '']
    }));
  };

  const updateSizeField = (index: number, value: string) => {
    setNewProduct(prev => ({
      ...prev,
      sizes: prev.sizes.map((size, i) => i === index ? value : size)
    }));
  };

  const addColorField = () => {
    setNewProduct(prev => ({
      ...prev,
      colors: [...prev.colors, '']
    }));
  };

  const updateColorField = (index: number, value: string) => {
    setNewProduct(prev => ({
      ...prev,
      colors: prev.colors.map((color, i) => i === index ? value : color)
    }));
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    const maxPagesToShow = 5;

    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

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

  if (!isAuthenticated) {
    return <div className="p-4 text-center">جاري التحقق من المصادقة...</div>;
  }

  if (!token) {
    return <div className="p-4 text-center">جاري تحميل رمز المصادقة...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-bold text-gray-800">إدارة المنتجات</h1>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            {showSidebar ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Mobile Sidebar */}
        {showSidebar && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden" onClick={() => setShowSidebar(false)}>
            <div
              className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">إحصائيات سريعة</h3>
                  <button
                    onClick={() => setShowSidebar(false)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-pink-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600">إجمالي المنتجات</p>
                    <p className="text-2xl font-bold text-pink-600">{products.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1">
          <div className="container mx-auto px-4 py-4 lg:py-8">
            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
              {/* Main Content */}
              <div className="flex-1">
                <div className="bg-white rounded-lg lg:rounded-2xl shadow-lg p-4 lg:p-6">
                  {activeTab === 'products' && (
                    <div>
                      {/* Desktop Header */}
                      <div className="hidden lg:flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">إدارة المنتجات</h2>
                        <div className="flex items-center space-x-reverse space-x-4">
                          <div className="text-sm text-gray-600">
                            المنتجات: {products.length} | الرمز: {token ? '✅ متوفر' : '❌ غير متوفر'}
                          </div>
                          <button
                            onClick={() => setShowAddProduct(true)}
                            disabled={isLoading}
                            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center space-x-reverse space-x-2 disabled:opacity-50"
                          >
                            <Plus size={20} />
                            <span>إضافة منتج</span>
                          </button>
                          <button
                            onClick={handleLogout}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors flex items-center"
                          >
                            تسجيل خروج
                          </button>
                        </div>
                      </div>

                      {/* Mobile Add Button */}
                      <div className="lg:hidden mb-4">
                        <div className="flex justify-between items-center">
                          <button
                            onClick={() => setShowAddProduct(true)}
                            disabled={isLoading}
                            className="flex-1 bg-pink-600 text-white px-4 py-3 rounded-lg hover:bg-pink-700 transition-colors flex items-center justify-center space-x-reverse space-x-2 disabled:opacity-50 ml-2"
                          >
                            <Plus size={20} />
                            <span>إضافة منتج</span>
                          </button>
                          <button
                            onClick={handleLogout}
                            className="bg-gray-200 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            خروج
                          </button>
                        </div>
                      </div>

                      {/* Product Form */}
                      {(showAddProduct || showEditProduct) && (
                        <div className="mb-6 lg:mb-8 p-4 lg:p-6 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">
                              {showAddProduct ? 'إضافة منتج جديد' : 'تعديل المنتج'}
                            </h3>
                            <button
                              onClick={() => {
                                setShowAddProduct(false);
                                setShowEditProduct(false);
                                setEditingProduct(null);
                                resetProductForm();
                              }}
                              className="p-2 text-gray-500 hover:bg-gray-200 rounded-lg"
                            >
                              <X size={20} />
                            </button>
                          </div>

                          <div className="space-y-4">
                            {/* Basic Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">كود المنتج *</label>
                                <input
                                  type="text"
                                  value={newProduct.code}
                                  onChange={(e) => setNewProduct(prev => ({ ...prev, code: e.target.value }))}
                                  className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-right ${
                                    newProduct.code && checkProductCodeExists(newProduct.code, editingProduct?.id)
                                      ? 'border-red-500 bg-red-50'
                                      : 'border-gray-300'
                                    }`}
                                  dir="rtl"
                                />
                                {newProduct.code && checkProductCodeExists(newProduct.code, editingProduct?.id) && (
                                  <p className="text-red-500 text-sm mt-1">كود المنتج مُستخدم بالفعل</p>
                                )}
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">اسم المنتج *</label>
                                <input
                                  type="text"
                                  value={newProduct.name}
                                  onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-right"
                                  dir="rtl"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">السعر *</label>
                                <input
                                  type="number"
                                  value={newProduct.price}
                                  onChange={(e) => setNewProduct(prev => ({ ...prev, price: e.target.value }))}
                                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-right"
                                  dir="rtl"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">السعر الأصلي</label>
                                <input
                                  type="number"
                                  value={newProduct.originalPrice}
                                  onChange={(e) => setNewProduct(prev => ({ ...prev, originalPrice: e.target.value }))}
                                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-right"
                                  dir="rtl"
                                />
                              </div>
                            </div>

                            {/* Toggles for isHidden, isAvailable, isInstant, isFeatured */}
                            <div className="flex flex-wrap gap-6 pt-2">
                              <label className="flex items-center space-x-reverse space-x-3">
                                <input
                                  type="checkbox"
                                  checked={newProduct.isHidden}
                                  onChange={(e) => setNewProduct(prev => ({ ...prev, isHidden: e.target.checked }))}
                                  className="w-5 h-5 text-blue-600 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">مخفي عن العملاء</span>
                              </label>
                              <label className="flex items-center space-x-reverse space-x-3">
                                <input
                                  type="checkbox"
                                  checked={newProduct.isAvailable}
                                  onChange={(e) => setNewProduct(prev => ({ ...prev, isAvailable: e.target.checked }))}
                                  className="w-5 h-5 text-green-600 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">متاح / متوفر</span>
                              </label>
                              <label className="flex items-center space-x-reverse space-x-3">
                                <input
                                  type="checkbox"
                                  checked={newProduct.isInstant}
                                  onChange={(e) => setNewProduct(prev => ({ ...prev, isInstant: e.target.checked }))}
                                  className="w-5 h-5 text-purple-600 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">منتج فوري</span>
                              </label>

                            {/* Description */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">الوصف</label>
                              <textarea
                                value={newProduct.description}
                                onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-right"
                                dir="rtl"
                              />
                            </div>

                            {/* Images */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">صور المنتج</label>
                              <div className="space-y-3">
                                {newProduct.images.map((image, index) => (
                                  <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 bg-white rounded-lg border">
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(e) => handleImageUpload(index, e)}
                                      className="hidden"
                                      id={`image-upload-${index}`}
                                    />
                                    <label
                                      htmlFor={`image-upload-${index}`}
                                      className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg cursor-pointer flex items-center space-x-reverse space-x-2 transition-colors"
                                    >
                                      <Upload size={16} />
                                      <span className="text-sm">اختر صورة</span>
                                    </label>
                                    {image && (
                                      <div className="flex items-center space-x-reverse space-x-2">
                                        <img src={image} alt="" className="w-12 h-12 object-cover rounded" />
                                        <span className="text-sm text-green-600">تم الرفع</span>
                                      </div>
                                    )}
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={addImageField}
                                  className="text-pink-600 hover:text-pink-700 text-sm font-medium"
                                >
                                  + إضافة صورة أخرى
                                </button>
                              </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex justify-end space-x-reverse space-x-3 pt-4">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowAddProduct(false);
                                  setShowEditProduct(false);
                                  setEditingProduct(null);
                                  resetProductForm();
                                }}
                                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                              >
                                إلغاء
                              </button>
                              <button
                                type="button"
                                onClick={showAddProduct ? handleAddProduct : handleUpdateProduct}
                                disabled={isLoading || (newProduct.code && checkProductCodeExists(newProduct.code, editingProduct?.id))}
                                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isLoading ? 'جار المعالجة...' : (showAddProduct ? 'إضافة المنتج' : 'تحديث المنتج')}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Products List */}
                      {isLoading && products.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
                          <p className="mt-4 text-gray-600">جار تحميل المنتجات...</p>
                        </div>
                      ) : products.length === 0 ? (
                        <div className="text-center py-12">
                          <Package size={48} className="mx-auto text-gray-400 mb-4" />
                          <h3 className="text-xl font-semibold text-gray-700 mb-2">لا توجد منتجات</h3>
                          <p className="text-gray-500">ابدأ بإضافة منتج جديد</p>
                        </div>
                      ) : (
                        <>
                          <div className="grid grid-cols-1 gap-4">
                            {products.map((product) => (
                              <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div className="flex flex-col sm:flex-row gap-4">
                                  {/* Product Image */}
                                  <div className="w-full sm:w-24 h-24 flex-shrink-0">
                                    {product.images && product.images.length > 0 ? (
                                      <img
                                        src={product.images.find(img => img.isMain)?.imagePath || product.images[0]?.imagePath}
                                        alt={product.name}
                                        className="w-full h-full object-cover rounded-lg"
                                      />
                                    ) : (
                                      <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                                        <Package size={32} className="text-gray-400" />
                                      </div>
                                    )}
                                  </div>

                                  {/* Product Info */}
                                  <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                                      <div>
                                        <h3 className="font-semibold text-lg text-gray-800">{product.name}</h3>
                                        <p className="text-sm text-gray-600">الكود: {product.code}</p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        {!product.isAvailable && (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                            <EyeOff size={12} className="ml-1" />
                                            غير متاح
                                          </span>
                                        )}
                                        {product.isHidden && (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                            <Eye size={12} className="ml-1" />
                                            مخفي
                                          </span>
                                        )}
                                        {product.isInstant && (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                            <Zap size={12} className="ml-1" />
                                            فوري
                                          </span>
                                        )}
                                        {product.isFeatured && (
                                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                            ⭐ مميز
                                          </span>
                                        )}
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3 text-sm">
                                      <div className="flex items-center gap-1">
                                        <span className="font-semibold text-pink-600">{product.price} ج.م</span>
                                        {product.originalPrice && product.originalPrice > product.price && (
                                          <span className="line-through text-gray-400">{product.originalPrice} ج.م</span>
                                        )}
                                      </div>
                                      {product.rating !== undefined && product.rating > 0 && (
                                        <span className="text-gray-600">⭐ {product.rating.toFixed(1)}</span>
                                      )}
                                      {product.salesCount !== undefined && (
                                        <span className="text-gray-600">📦 {product.salesCount} مبيعات</span>
                                      )}
                                    </div>

                                    {product.description && (
                                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
                                    )}

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 mt-3">
                                      <button
                                        onClick={() => handleEditProduct(product)}
                                        disabled={isLoading}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm disabled:opacity-50"
                                      >
                                        <Edit size={16} />
                                        <span>تعديل</span>
                                      </button>
                                      <button
                                        onClick={() => handleDeleteProduct(product.id)}
                                        disabled={isLoading}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm disabled:opacity-50"
                                      >
                                        <Trash2 size={16} />
                                        <span>حذف</span>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Pagination */}
                          {totalPages > 1 && (
                            <div className="flex justify-center items-center space-x-2 mt-8 space-x-reverse">
                              <button
                                onClick={handlePrevPage}
                                disabled={currentPage === 1 || isLoading}
                                className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                              >
                                <ChevronRight size={20} />
                                <span className="mr-1">السابق</span>
                              </button>

                              <div className="flex space-x-1 space-x-reverse">
                                {getPageNumbers().map((page, index) =>
                                  page === '...' ? (
                                    <span key={index} className="px-3 py-2 text-gray-500">...</span>
                                  ) : (
                                    <button
                                      key={index}
                                      onClick={() => handlePageChange(page as number)}
                                      disabled={isLoading}
                                      className={`px-3 py-2 rounded-lg transition-colors ${
                                        currentPage === page
                                          ? 'bg-pink-600 text-white'
                                          : 'bg-white border border-gray-300 hover:bg-gray-50 text-gray-700'
                                      } ${isLoading ? 'cursor-not-allowed opacity-50' : ''}`}
                                    >
                                      {page}
                                    </button>
                                  )
                                )}
                              </div>

                              <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages || isLoading}
                                className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                              >
                                <span className="ml-1">التالي</span>
                                <ChevronLeft size={20} />
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsManagement;
