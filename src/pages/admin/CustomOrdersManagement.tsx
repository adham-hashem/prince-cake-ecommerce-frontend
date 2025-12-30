import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Cake,
  Calendar,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  Clock3,
  Package,
  DollarSign,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Enums matching backend
enum CustomOrderStatus {
  Pending = 0,
  Confirmed = 1,
  InProgress = 2,
  Ready = 3,
  Completed = 4,
  Cancelled = 5,
}

enum PaymentMethod {
  Cash = 0,
  VodafoneCash = 1,
  Instapay = 2,
}

interface CustomOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  occasionName: string;
  sizeName: string;
  flavorName: string;
  customText?: string;
  designImageUrl?: string;
  pickupDate: string;
  pickupTime: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  status: CustomOrderStatus;
  estimatedPrice: number;
  finalPrice?: number;
  adminNotes?: string;
  createdAt: string;
  userId?: string;
}

interface PaginatedResponse {
  items: CustomOrder[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  todayOrders: number;
  thisMonthOrders: number;
  totalRevenue: number;
  thisMonthRevenue: number;
  mostPopularOccasion: string;
  mostPopularSize: string;
  mostPopularFlavor: string;
}

const CustomOrdersManagement: React.FC = () => {
  const { isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<CustomOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomOrderStatus | ''>('');
  const [dateFilter, setDateFilter] = useState('');

  // Status update
  const [newStatus, setNewStatus] = useState<CustomOrderStatus>(CustomOrderStatus.Pending);
  const [finalPrice, setFinalPrice] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

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

    fetchOrders();
    fetchStats();
  }, [isAuthenticated, userRole, navigate, currentPage, statusFilter]);

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

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let url = `${apiUrl}/api/CustomOrders?pageNumber=${currentPage}&pageSize=${pageSize}`;
      
      if (statusFilter !== '') {
        url += `&status=${statusFilter}`;
      }
      if (searchTerm) {
        url += `&searchTerm=${encodeURIComponent(searchTerm)}`;
      }
      if (dateFilter) {
        url += `&pickupFromDate=${dateFilter}`;
      }

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('accessToken');
          navigate('/login');
          throw new Error('غير مصرح: يرجى تسجيل الدخول مرة أخرى.');
        } else if (response.status === 403) {
          navigate('/');
          throw new Error('ممنوع: يتطلب صلاحيات إدارية.');
        }
        throw new Error('فشل في جلب الطلبات');
      }

      const data: PaginatedResponse = await response.json();
      setOrders(data.items);
      setTotalPages(data.totalPages);
      setTotalItems(data.totalItems);
      setCurrentPage(data.pageNumber);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'فشل في جلب الطلبات');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${apiUrl}/api/CustomOrders/stats`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data: OrderStats = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || isLoading) return;

    setIsLoading(true);
    try {
      const updateData = {
        status: newStatus,
        finalPrice: finalPrice ? parseFloat(finalPrice) : undefined,
        adminNotes: adminNotes || undefined,
      };

      const response = await fetch(
        `${apiUrl}/api/CustomOrders/${selectedOrder.id}/status`,
        {
          method: 'PUT',
          headers: getAuthHeaders(),
          body: JSON.stringify(updateData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`فشل في تحديث حالة الطلب: ${errorText}`);
      }

      await fetchOrders();
      await fetchStats();
      setShowStatusModal(false);
      setSelectedOrder(null);
      alert('تم تحديث حالة الطلب بنجاح!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'حدث خطأ أثناء تحديث الطلب');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOrder = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الطلب؟')) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/CustomOrders/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('فشل في حذف الطلب');
      }

      await fetchOrders();
      await fetchStats();
      alert('تم حذف الطلب بنجاح!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'حدث خطأ أثناء حذف الطلب');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusText = (status: CustomOrderStatus) => {
    const statusMap = {
      [CustomOrderStatus.Pending]: 'قيد الانتظار',
      [CustomOrderStatus.Confirmed]: 'مؤكد',
      [CustomOrderStatus.InProgress]: 'قيد التنفيذ',
      [CustomOrderStatus.Ready]: 'جاهز للاستلام',
      [CustomOrderStatus.Completed]: 'مكتمل',
      [CustomOrderStatus.Cancelled]: 'ملغي',
    };
    return statusMap[status];
  };

  const getStatusColor = (status: CustomOrderStatus) => {
    const colorMap = {
      [CustomOrderStatus.Pending]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      [CustomOrderStatus.Confirmed]: 'bg-blue-100 text-blue-800 border-blue-200',
      [CustomOrderStatus.InProgress]: 'bg-purple-100 text-purple-800 border-purple-200',
      [CustomOrderStatus.Ready]: 'bg-green-100 text-green-800 border-green-200',
      [CustomOrderStatus.Completed]: 'bg-gray-100 text-gray-800 border-gray-200',
      [CustomOrderStatus.Cancelled]: 'bg-red-100 text-red-800 border-red-200',
    };
    return colorMap[status];
  };

  const getPaymentMethodText = (method: PaymentMethod) => {
    const methodMap = {
      [PaymentMethod.Cash]: 'نقدي',
      [PaymentMethod.VodafoneCash]: 'فودافون كاش',
      [PaymentMethod.Instapay]: 'إنستاباي',
    };
    return methodMap[method];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString: string) => {
    // If the time is in HH:mm:ss format, extract HH:mm
    if (timeString && timeString.includes(':')) {
      return timeString.substring(0, 5);
    }
    return timeString;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on new search
    fetchOrders();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setDateFilter('');
    setCurrentPage(1);
  };

  return (
    <div className="p-6 bg-gradient-to-b from-purple-50 via-pink-50 to-amber-50 min-h-screen">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-xl">
            <Cake className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-purple-900">إدارة الطلبات الخاصة</h2>
            <p className="text-sm text-purple-600">إجمالي الطلبات: {totalItems}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <Clock3 className="h-8 w-8 text-yellow-600" />
              <span className="text-3xl font-bold text-yellow-900">{stats.pendingOrders}</span>
            </div>
            <p className="text-sm text-gray-700 font-medium">قيد الانتظار</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <Package className="h-8 w-8 text-purple-600" />
              <span className="text-3xl font-bold text-purple-900">{stats.inProgressOrders}</span>
            </div>
            <p className="text-sm text-gray-700 font-medium">قيد التنفيذ</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <span className="text-3xl font-bold text-green-900">{stats.completedOrders}</span>
            </div>
            <p className="text-sm text-gray-700 font-medium">مكتمل</p>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4 shadow-md">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-8 w-8 text-amber-600" />
              <span className="text-3xl font-bold text-amber-900">{stats.totalRevenue.toFixed(0)}</span>
            </div>
            <p className="text-sm text-gray-700 font-medium">الإيرادات (جنيه)</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-6 flex items-center shadow-lg">
          <AlertCircle className="h-5 w-5 text-red-600 ml-2 flex-shrink-0" />
          <span className="text-red-800 font-medium flex-1">{error}</span>
          <button
            onClick={fetchOrders}
            className="mr-auto bg-red-100 hover:bg-red-200 px-4 py-2 rounded-xl text-sm text-red-800 flex items-center font-semibold transition-all"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 ml-1" />
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border-2 border-purple-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-purple-900 mb-2">
              <Search className="inline h-4 w-4 ml-1" />
              بحث (رقم الطلب، اسم العميل، رقم الهاتف)
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right"
              placeholder="ابحث..."
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-purple-900 mb-2">
              <Filter className="inline h-4 w-4 ml-1" />
              الحالة
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right font-medium"
              dir="rtl"
            >
              <option value="">الكل</option>
              <option value={CustomOrderStatus.Pending}>قيد الانتظار</option>
              <option value={CustomOrderStatus.Confirmed}>مؤكد</option>
              <option value={CustomOrderStatus.InProgress}>قيد التنفيذ</option>
              <option value={CustomOrderStatus.Ready}>جاهز للاستلام</option>
              <option value={CustomOrderStatus.Completed}>مكتمل</option>
              <option value={CustomOrderStatus.Cancelled}>ملغي</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-purple-900 mb-2">
              <Calendar className="inline h-4 w-4 ml-1" />
              تاريخ الاستلام (من)
            </label>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSearch}
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all font-semibold shadow-md flex items-center gap-2"
            disabled={isLoading}
          >
            <Search className="h-4 w-4" />
            بحث
          </button>
          <button
            onClick={handleResetFilters}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-300 transition-all font-semibold"
          >
            إعادة تعيين
          </button>
        </div>
      </div>

      {/* Orders List */}
      {isLoading && orders.length === 0 ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="mr-3 text-purple-600 font-medium">جاري تحميل الطلبات...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-lg border-2 border-purple-100">
          <div className="text-7xl mb-4">🎂</div>
          <h3 className="text-xl font-bold text-purple-900 mb-2">لا توجد طلبات</h3>
          <p className="text-gray-600 mb-6">لم يتم العثور على طلبات بهذه المعايير</p>
          <button
            onClick={fetchOrders}
            className="bg-gradient-to-r from-purple-600 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all flex items-center mx-auto font-semibold shadow-lg gap-2"
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4" />
            إعادة التحميل
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-purple-100">
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 border-2 border-purple-100 rounded-xl bg-gradient-to-r from-white to-purple-50 hover:shadow-md transition-all"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-purple-900">{order.orderNumber}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-purple-600" />
                      {order.customerName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4 text-purple-600" />
                      {order.customerPhone}
                    </div>
                    <div className="flex items-center gap-1">
                      <Cake className="h-4 w-4 text-purple-600" />
                      {order.occasionName} - {order.sizeName}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      {formatDate(order.pickupDate)}
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-semibold text-amber-600">
                      السعر: {order.finalPrice || order.estimatedPrice} جنيه
                    </span>
                    <span className="text-gray-500 mr-3">
                      الدفع: {getPaymentMethodText(order.paymentMethod)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetailsModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-xl transition-colors"
                    title="عرض التفاصيل"
                  >
                    <Eye size={20} />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setNewStatus(order.status);
                      setFinalPrice(order.finalPrice?.toString() || order.estimatedPrice.toString());
                      setAdminNotes(order.adminNotes || '');
                      setShowStatusModal(true);
                    }}
                    className="text-purple-600 hover:text-purple-700 p-2 hover:bg-purple-50 rounded-xl transition-colors"
                    title="تحديث الحالة"
                    disabled={isLoading}
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={() => handleDeleteOrder(order.id)}
                    className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-xl transition-colors"
                    title="حذف الطلب"
                    disabled={isLoading}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || isLoading}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                السابق
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      disabled={isLoading}
                      className={`px-3 py-2 rounded-xl text-sm font-semibold ${
                        currentPage === pageNum
                          ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white'
                          : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                      } disabled:opacity-50`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || isLoading}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                التالي
              </button>
            </div>
          )}
          <div className="text-center text-sm text-gray-500 mt-4">
            عرض {((currentPage - 1) * pageSize) + 1} إلى {Math.min(currentPage * pageSize, totalItems)} من {totalItems} طلب
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-purple-900">تفاصيل الطلب</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-purple-50 rounded-2xl p-4 border-2 border-purple-200">
                <p className="text-sm text-gray-600 mb-1">رقم الطلب</p>
                <p className="text-xl font-bold text-purple-600">{selectedOrder.orderNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">اسم العميل</p>
                  <p className="font-bold text-gray-900">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">رقم الهاتف</p>
                  <p className="font-bold text-gray-900">{selectedOrder.customerPhone}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">المناسبة</p>
                  <p className="font-bold text-gray-900">{selectedOrder.occasionName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">الحجم</p>
                  <p className="font-bold text-gray-900">{selectedOrder.sizeName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">النكهة</p>
                  <p className="font-bold text-gray-900">{selectedOrder.flavorName}</p>
                </div>
              </div>

              {selectedOrder.customText && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">النص المخصص</p>
                  <p className="font-bold text-gray-900 bg-amber-50 p-3 rounded-xl">
                    "{selectedOrder.customText}"
                  </p>
                </div>
              )}

              {selectedOrder.designImageUrl && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">صورة التصميم</p>
                  <img
                    src={selectedOrder.designImageUrl}
                    alt="Design"
                    className="w-full max-w-md rounded-xl border-2 border-purple-200"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">تاريخ الاستلام</p>
                  <p className="font-bold text-gray-900">{formatDate(selectedOrder.pickupDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">وقت الاستلام</p>
                  <p className="font-bold text-gray-900">{formatTime(selectedOrder.pickupTime)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">طريقة الدفع</p>
                  <p className="font-bold text-gray-900">{getPaymentMethodText(selectedOrder.paymentMethod)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">الحالة</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">السعر التقديري</span>
                  <span className="font-bold text-gray-900">{selectedOrder.estimatedPrice} جنيه</span>
                </div>
                {selectedOrder.finalPrice && (
                  <div className="flex justify-between items-center pt-2 border-t border-amber-200">
                    <span className="text-gray-600">السعر النهائي</span>
                    <span className="text-xl font-bold text-amber-600">{selectedOrder.finalPrice} جنيه</span>
                  </div>
                )}
              </div>

              {selectedOrder.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">ملاحظات العميل</p>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-xl">{selectedOrder.notes}</p>
                </div>
              )}

              {selectedOrder.adminNotes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">ملاحظات الإدارة</p>
                  <p className="text-gray-900 bg-purple-50 p-3 rounded-xl">{selectedOrder.adminNotes}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-600 mb-1">تاريخ الإنشاء</p>
                <p className="text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setNewStatus(selectedOrder.status);
                  setFinalPrice(selectedOrder.finalPrice?.toString() || selectedOrder.estimatedPrice.toString());
                  setAdminNotes(selectedOrder.adminNotes || '');
                  setShowStatusModal(true);
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-600 transition-all shadow-md"
              >
                تحديث الحالة
              </button>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-purple-900">تحديث حالة الطلب</h3>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">
                  الحالة الجديدة *
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(parseInt(e.target.value))}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right font-medium"
                  dir="rtl"
                >
                  <option value={CustomOrderStatus.Pending}>قيد الانتظار</option>
                  <option value={CustomOrderStatus.Confirmed}>مؤكد</option>
                  <option value={CustomOrderStatus.InProgress}>قيد التنفيذ</option>
                  <option value={CustomOrderStatus.Ready}>جاهز للاستلام</option>
                  <option value={CustomOrderStatus.Completed}>مكتمل</option>
                  <option value={CustomOrderStatus.Cancelled}>ملغي</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">
                  السعر النهائي (جنيه)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={finalPrice}
                  onChange={(e) => setFinalPrice(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right"
                  dir="rtl"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-purple-900 mb-2">
                  ملاحظات الإدارة
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right resize-none"
                  dir="rtl"
                  placeholder="أي ملاحظات إضافية..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleUpdateStatus}
                disabled={isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 text-white py-3 rounded-xl font-bold hover:from-purple-700 hover:to-pink-600 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'جاري التحديث...' : 'تحديث'}
              </button>
              <button
                onClick={() => setShowStatusModal(false)}
                disabled={isLoading}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all disabled:opacity-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomOrdersManagement;
