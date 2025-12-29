import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, X, Check, Sparkles, Calendar, AlertCircle } from 'lucide-react';

// OrderNotification interface matching the backend response
interface OrderNotification {
  id: string;
  orderId: string;
  title: string;
  body: string;
  sentAt: string;
  success: boolean;
  errorMessage: string | null;
  isRead: boolean;
}

interface PaginatedNotificationsResponse {
  items: OrderNotification[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

const apiUrl = import.meta.env.VITE_API_BASE_URL;

const OrderNotifications: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [selectedNotification, setSelectedNotification] = useState<OrderNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // Utility function to format notification body with Egyptian Pound
  const formatNotificationBody = (body: string) => {
    return body.replace(/\$/g, 'جنية مصري ');
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        if (!apiUrl) {
          throw new Error('API base URL is not configured.');
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No access token found. Please log in again.');
        }

        const response = await fetch(`${apiUrl}/api/OrderNotifications?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            throw new Error('Unauthorized: Please log in again.');
          }
          const errorText = await response.text();
          throw new Error(`Failed to fetch notifications: ${response.status} ${errorText}`);
        }

        const data: PaginatedNotificationsResponse = await response.json();

        if (!Array.isArray(data.items)) {
          setNotifications([]);
          throw new Error('Invalid response format: Expected an array of notifications.');
        }

        // Map backend response to frontend interface (handle missing isRead)
        const mappedNotifications = data.items.map((item) => ({
          ...item,
          isRead: item.isRead ?? false, // Default to false if isRead is not provided
        }));

        setNotifications(mappedNotifications);
        setTotalPages(data.totalPages);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching notifications.');
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setError('You must be logged in to view notifications.');
      setLoading(false);
      setNotifications([]);
    }
  }, [isAuthenticated, pageNumber]);

  const handleViewNotification = (notification: OrderNotification) => {
    setSelectedNotification(notification);
  };

  const handleCloseDetails = () => {
    setSelectedNotification(null);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('No access token found. Please log in again.');
      }

      const response = await fetch(`${apiUrl}/api/OrderNotifications/${notificationId}/mark-as-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to mark notification as read: ${response.status} ${errorText}`);
      }

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      if (selectedNotification?.id === notificationId) {
        setSelectedNotification({ ...selectedNotification, isRead: true });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while marking notification as read. Please try again or contact support.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="mr-3 text-purple-600 font-medium">جاري تحميل الإشعارات...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-red-600 bg-red-50 border-2 border-red-200 rounded-2xl">
        <div className="text-5xl mb-4">⚠️</div>
        <p className="font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-xl relative">
            <Bell className="h-6 w-6 text-purple-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-purple-900">إشعارات الطلبات</h2>
            <p className="text-sm text-purple-600">
              {unreadCount > 0 ? `${unreadCount} إشعار غير مقروء` : 'جميع الإشعارات مقروءة'}
            </p>
          </div>
        </div>
        <Sparkles className="h-8 w-8 text-amber-500 animate-pulse" />
      </div>

      {selectedNotification ? (
        <div className="mb-6 p-6 bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border-2 border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-purple-900 flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-600" />
              تفاصيل الإشعار
            </h3>
            <button
              onClick={handleCloseDetails}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl border border-purple-100">
              <span className="text-sm text-gray-500 block mb-1">العنوان</span>
              <p className="font-semibold text-purple-900 text-lg">{selectedNotification.title}</p>
            </div>

            <div className="p-4 bg-white rounded-xl border border-purple-100">
              <span className="text-sm text-gray-500 block mb-1">الرسالة</span>
              <p className="text-gray-900">{formatNotificationBody(selectedNotification.body)}</p>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-purple-100">
              <Calendar className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <span className="text-sm text-gray-500 block">تاريخ الإنشاء</span>
                <p className="font-semibold text-gray-900">{formatDate(selectedNotification.sentAt)}</p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-purple-100">
              <span className="text-sm text-gray-500 block mb-2">الحالة</span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                selectedNotification.isRead 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {selectedNotification.isRead ? <Check className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                {selectedNotification.isRead ? 'مقروء' : 'غير مقروء'}
              </span>
            </div>

            {selectedNotification.errorMessage && (
              <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border-2 border-red-200">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="text-sm text-red-600 font-semibold block mb-1">رسالة الخطأ</span>
                  <p className="text-red-700">{selectedNotification.errorMessage}</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 flex space-x-4 space-x-reverse">
            {!selectedNotification.isRead && (
              <button
                onClick={() => handleMarkAsRead(selectedNotification.id)}
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all flex items-center justify-center font-semibold shadow-md"
              >
                <Check className="h-4 w-4 ml-2" />
                تحديد كمقروء
              </button>
            )}
            <button
              onClick={handleCloseDetails}
              className={`${selectedNotification.isRead ? 'flex-1' : ''} bg-gradient-to-r from-gray-400 to-gray-500 text-white px-6 py-3 rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all flex items-center justify-center font-semibold shadow-md`}
            >
              <X className="h-4 w-4 ml-2" />
              إغلاق
            </button>
          </div>
        </div>
      ) : notifications.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white rounded-2xl shadow-xl border-2 border-purple-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-bold text-purple-900 uppercase tracking-wider">العنوان</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-purple-900 uppercase tracking-wider">الرسالة</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-purple-900 uppercase tracking-wider">التاريخ</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-purple-900 uppercase tracking-wider">الحالة</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-purple-900 uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-purple-100">
                  {notifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-purple-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {!notification.isRead && (
                            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                          )}
                          <span className={`text-sm ${notification.isRead ? 'text-gray-600' : 'font-bold text-purple-900'}`}>
                            {notification.title}
                          </span>
                        </div>
                      </td>
                      <td className={`px-6 py-4 text-sm ${notification.isRead ? 'text-gray-600' : 'font-semibold text-gray-900'}`}>
                        {formatNotificationBody(notification.body).substring(0, 50)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {formatDate(notification.sentAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          notification.isRead 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {notification.isRead ? <Check className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
                          {notification.isRead ? 'مقروء' : 'غير مقروء'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewNotification(notification)}
                          className="flex items-center gap-1 text-purple-600 hover:text-pink-600 font-semibold transition-colors"
                        >
                          <Bell className="h-4 w-4" />
                          عرض
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="block sm:hidden space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-4 transition-all duration-200 hover:shadow-xl hover:border-purple-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-2 flex-1">
                    {!notification.isRead && (
                      <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse mt-1.5 flex-shrink-0"></span>
                    )}
                    <div>
                      <p className={`text-sm ${notification.isRead ? 'text-gray-600' : 'font-bold text-purple-900'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatNotificationBody(notification.body).substring(0, 60)}...
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewNotification(notification)}
                    className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-lg hover:bg-purple-100 font-semibold transition-all flex-shrink-0 ml-2"
                  >
                    <Bell className="h-3 w-3" />
                    التفاصيل
                  </button>
                </div>
                <div className="space-y-2 border-t border-purple-100 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      التاريخ:
                    </span>
                    <span className="text-xs text-gray-900 font-medium">{formatDate(notification.sentAt)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">الحالة:</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                      notification.isRead 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {notification.isRead ? <Check className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
                      {notification.isRead ? 'مقروء' : 'غير مقروء'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-4 space-x-reverse">
              <button
                onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
                disabled={pageNumber === 1}
                className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl hover:from-purple-700 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-md"
              >
                السابق
              </button>
              <div className="bg-white px-6 py-3 rounded-xl border-2 border-purple-200 shadow-md">
                <span className="text-purple-900 font-bold">
                  {pageNumber} / {totalPages}
                </span>
              </div>
              <button
                onClick={() => setPageNumber((prev) => Math.min(prev + 1, totalPages))}
                disabled={pageNumber === totalPages}
                className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl hover:from-purple-700 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all shadow-md"
              >
                التالي
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border-2 border-purple-100">
          <div className="text-7xl mb-4">🔔</div>
          <p className="text-xl font-bold text-purple-900 mb-2">لا توجد إشعارات</p>
          <p className="text-gray-600">لم يتم العثور على أي إشعارات حالياً</p>
        </div>
      )}
    </div>
  );
};

export default OrderNotifications;
