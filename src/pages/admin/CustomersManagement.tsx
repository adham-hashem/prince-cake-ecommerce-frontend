import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Eye, X, ChevronRight, ChevronLeft, Users, Mail, Phone, MapPin, CheckCircle, XCircle, Sparkles } from 'lucide-react';

// Updated Customer interface to match API response
interface Customer {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  governorate?: string;
  isEmailVerified: boolean;
  orderCount: number;
  isProfileComplete: boolean;
}

interface PaginatedCustomersResponse {
  items: Customer[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

const apiUrl = import.meta.env.VITE_API_BASE_URL;

const CustomersManagement: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        if (!apiUrl) {
          throw new Error('API base URL is not configured.');
        }

        const token = localStorage.getItem('accessToken');
        if (!token) {
          throw new Error('No access token found. Please log in again.');
        }

        const response = await fetch(`${apiUrl}/api/users/customers?pageNumber=${pageNumber}&pageSize=${pageSize}`, {
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
          throw new Error(`Failed to fetch customers: ${response.status} ${errorText}`);
        }

        const data: PaginatedCustomersResponse = await response.json();

        if (!Array.isArray(data.items)) {
          setCustomers([]);
          throw new Error('Invalid response format: Expected an array of customers.');
        }

        setCustomers(data.items);
        setTotalPages(data.totalPages);
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching customers.');
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchCustomers();
    } else {
      setError('You must be logged in to view customers.');
      setLoading(false);
      setCustomers([]);
    }
  }, [isAuthenticated, pageNumber]);

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleCloseDetails = () => {
    setSelectedCustomer(null);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPageNumber(newPage);
      setLoading(true);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <span className="mr-3 text-purple-600 font-medium">جاري تحميل بيانات العملاء...</span>
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
          <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-3 rounded-xl">
            <Users className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-purple-900">إدارة العملاء</h2>
            <p className="text-sm text-purple-600">إجمالي العملاء: {customers.length}</p>
          </div>
        </div>
        <Sparkles className="h-8 w-8 text-amber-500 animate-pulse" />
      </div>

      {selectedCustomer ? (
        <div className="mb-6 p-6 bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border-2 border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-purple-900 flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-600" />
              تفاصيل العميل
            </h3>
            <button
              onClick={handleCloseDetails}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-purple-100">
              <Users className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <span className="text-sm text-gray-500">الاسم الكامل</span>
                <p className="font-semibold text-gray-900">{selectedCustomer.fullName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-purple-100">
              <Mail className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <span className="text-sm text-gray-500">البريد الإلكتروني</span>
                <p className="font-semibold text-gray-900">{selectedCustomer.email}</p>
              </div>
              {selectedCustomer.isEmailVerified ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-purple-100">
              <Phone className="h-5 w-5 text-purple-600" />
              <div className="flex-1">
                <span className="text-sm text-gray-500">رقم الهاتف</span>
                <p className="font-semibold text-gray-900">{selectedCustomer.phoneNumber || 'غير متوفر'}</p>
              </div>
            </div>

            {selectedCustomer.address && (
              <div className="flex items-center gap-3 p-4 bg-white rounded-xl border border-purple-100">
                <MapPin className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <span className="text-sm text-gray-500">العنوان</span>
                  <p className="font-semibold text-gray-900">{selectedCustomer.address}</p>
                  {selectedCustomer.governorate && (
                    <p className="text-sm text-purple-600 mt-1">المحافظة: {selectedCustomer.governorate}</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                <p className="text-sm text-gray-600 mb-1">إجمالي الطلبات</p>
                <p className="text-2xl font-bold text-purple-900">{selectedCustomer.orderCount}</p>
              </div>
              <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                <p className="text-sm text-gray-600 mb-1">حالة الملف</p>
                <p className="text-lg font-bold text-amber-900">
                  {selectedCustomer.isProfileComplete ? '✅ مكتمل' : '⚠️ غير مكتمل'}
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={handleCloseDetails}
            className="mt-6 w-full bg-gradient-to-r from-gray-400 to-gray-500 text-white px-6 py-3 rounded-xl hover:from-gray-500 hover:to-gray-600 transition-all font-semibold shadow-md"
          >
            إغلاق التفاصيل
          </button>
        </div>
      ) : customers.length > 0 ? (
        <>
          {/* Desktop Table View */}
          <div className="hidden sm:block bg-white rounded-2xl shadow-xl border-2 border-purple-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                  <tr>
                    <th className="px-6 py-4 text-right text-xs font-bold text-purple-900 uppercase tracking-wider">الاسم</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-purple-900 uppercase tracking-wider">البريد الإلكتروني</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-purple-900 uppercase tracking-wider">رقم الهاتف</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-purple-900 uppercase tracking-wider">الطلبات</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-purple-900 uppercase tracking-wider">الحالة</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-purple-900 uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-purple-100">
                  {customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-purple-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="bg-purple-100 p-2 rounded-lg">
                            <Users className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{customer.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{customer.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {customer.phoneNumber || 'غير متوفر'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          {customer.orderCount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {customer.isEmailVerified ? (
                          <span className="inline-flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            مؤكد
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                            <XCircle className="h-4 w-4" />
                            غير مؤكد
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="flex items-center gap-1 text-purple-600 hover:text-pink-600 font-semibold transition-colors"
                        >
                          <Eye className="h-4 w-4" />
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
            {customers.map((customer) => (
              <div
                key={customer.id}
                className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 p-4 transition-all duration-200 hover:shadow-xl hover:border-purple-200"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{customer.fullName}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewCustomer(customer)}
                    className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-lg hover:bg-purple-100 font-semibold transition-all"
                  >
                    <Eye className="h-3 w-3" />
                    التفاصيل
                  </button>
                </div>
                <div className="space-y-2 border-t border-purple-100 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">رقم الهاتف:</span>
                    <span className="text-xs text-gray-900 font-medium">{customer.phoneNumber || 'غير متوفر'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">إجمالي الطلبات:</span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {customer.orderCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">الحالة:</span>
                    {customer.isEmailVerified ? (
                      <span className="inline-flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle className="h-3 w-3" />
                        مؤكد
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <XCircle className="h-3 w-3" />
                        غير مؤكد
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-4 space-x-reverse">
              <button
                onClick={() => handlePageChange(pageNumber - 1)}
                disabled={pageNumber === 1}
                className={`px-5 py-3 rounded-xl flex items-center font-semibold transition-all shadow-md ${
                  pageNumber === 1 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 hover:shadow-lg'
                }`}
              >
                <ChevronRight className="h-4 w-4 ml-2" />
                السابق
              </button>
              <div className="bg-white px-6 py-3 rounded-xl border-2 border-purple-200 shadow-md">
                <span className="text-purple-900 font-bold">
                  {pageNumber} / {totalPages}
                </span>
              </div>
              <button
                onClick={() => handlePageChange(pageNumber + 1)}
                disabled={pageNumber === totalPages}
                className={`px-5 py-3 rounded-xl flex items-center font-semibold transition-all shadow-md ${
                  pageNumber === totalPages 
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 hover:shadow-lg'
                }`}
              >
                التالي
                <ChevronLeft className="h-4 w-4 mr-2" />
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border-2 border-purple-100">
          <div className="text-7xl mb-4">👥</div>
          <p className="text-xl font-bold text-purple-900 mb-2">لا توجد بيانات عملاء</p>
          <p className="text-gray-600">لم يتم العثور على أي عملاء حالياً</p>
        </div>
      )}
    </div>
  );
};

export default CustomersManagement;
