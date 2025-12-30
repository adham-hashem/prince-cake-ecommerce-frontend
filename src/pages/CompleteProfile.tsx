import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader, UserCircle, MapPin, Phone, Home, Sparkles } from 'lucide-react';

const CompleteProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    governorate: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkProfileStatus = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://elshal.runasp.net';
        const response = await fetch(`${apiUrl}/api/users/profile-status`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });
        if (!response.ok) {
          throw new Error('فشل في التحقق من حالة الملف الشخصي');
        }
        const data = await response.json();
        if (data.isProfileComplete) {
          navigate('/');
        }
      } catch (err) {
        setError('حدث خطأ أثناء التحقق من حالة الملف الشخصي');
      }
    };
    checkProfileStatus();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (formData.governorate === "0") {
      setError('يرجى اختيار محافظة صالحة');
      setLoading(false);
      return;
    }

    try {
      const apiUrl = import.meta.env.VITE_API_BASE_URL || 'https://elshal.runasp.net';
      const response = await fetch(`${apiUrl}/api/users/complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في إكمال الملف الشخصي');
      }

      updateUserProfile({
        name: formData.fullName,
        address: formData.address,
        governorate: formData.governorate,
        phoneNumber: formData.phoneNumber,
      });

      setSuccess('تم إكمال الملف الشخصي بنجاح');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء إكمال الملف الشخصي. حاول مرة أخرى لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-purple-50 py-6 sm:py-12 md:py-16 px-3 sm:px-4" dir="rtl">
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-full mb-4">
            <UserCircle className="w-8 h-8 sm:w-10 sm:h-10 text-purple-600" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-900 mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500" />
            <span>إكمال الملف الشخصي</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            يرجى إكمال بياناتك للمتابعة
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-6 md:p-8 border-2 border-purple-100">
          {/* Error Message */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-50 rounded-xl sm:rounded-2xl border-2 border-red-200">
              <p className="text-red-600 text-center font-medium text-sm sm:text-base">{error}</p>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 rounded-xl sm:rounded-2xl border-2 border-green-200">
              <p className="text-green-600 text-center font-medium text-sm sm:text-base">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
            {/* Full Name */}
            <div>
              <label 
                htmlFor="fullName" 
                className="block text-right text-purple-900 font-bold mb-2 text-sm sm:text-base flex items-center justify-end gap-2"
              >
                <span>الاسم الكامل</span>
                <UserCircle className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-purple-50 text-right border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
                placeholder="أدخل الاسم الكامل"
                disabled={loading}
              />
            </div>

            {/* Address */}
            <div>
              <label 
                htmlFor="address" 
                className="block text-right text-purple-900 font-bold mb-2 text-sm sm:text-base flex items-center justify-end gap-2"
              >
                <span>العنوان</span>
                <Home className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-purple-50 text-right border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
                placeholder="أدخل العنوان"
                disabled={loading}
              />
            </div>

            {/* Governorate */}
            <div>
              <label 
                htmlFor="governorate" 
                className="block text-right text-purple-900 font-bold mb-2 text-sm sm:text-base flex items-center justify-end gap-2"
              >
                <span>المحافظة</span>
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </label>
              <select
                id="governorate"
                name="governorate"
                value={formData.governorate}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-purple-50 text-right border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
                disabled={loading}
                dir="rtl"
              >
                <option value="0">اختر المحافظة...</option>
                <option value="1">القاهرة</option>
                <option value="2">الأسكندرية</option>
                <option value="3">بورسعيد</option>
                <option value="4">السويس</option>
                <option value="5">الإسماعيلية</option>
                <option value="6">دمياط</option>
                <option value="7">الدقهلية</option>
                <option value="8">الشرقية</option>
                <option value="9">القليوبية</option>
                <option value="10">كفر الشيخ</option>
                <option value="11">الغربية</option>
                <option value="12">المنوفية</option>
                <option value="13">البحيرة</option>
                <option value="14">الجيزة</option>
                <option value="15">بنى سويف</option>
                <option value="16">الفيوم</option>
                <option value="17">المنيا</option>
                <option value="18">أسيوط</option>
                <option value="19">سوهاج</option>
                <option value="20">قنا</option>
                <option value="21">أسوان</option>
                <option value="22">مطروح</option>
                <option value="23">الوادى الجديد</option>
                <option value="24">البحر الاحمر</option>
                <option value="25">شمال سيناء</option>
                <option value="26">جنوب سيناء</option>
                <option value="27">الأقصر</option>
              </select>
            </div>

            {/* Phone Number */}
            <div>
              <label 
                htmlFor="phoneNumber" 
                className="block text-right text-purple-900 font-bold mb-2 text-sm sm:text-base flex items-center justify-end gap-2"
              >
                <span>رقم الهاتف</span>
                <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg sm:rounded-xl bg-purple-50 text-right border-2 border-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all text-sm sm:text-base"
                placeholder="01xxxxxxxxx"
                disabled={loading}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2 sm:pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3 sm:py-3.5 md:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl hover:bg-purple-700 transition-all font-bold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base md:text-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="animate-spin" size={20} />
                    <span>جارٍ الإرسال...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    <span>إكمال الملف الشخصي</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Help Text */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-500">
              🔒 بياناتك آمنة ومحمية
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
