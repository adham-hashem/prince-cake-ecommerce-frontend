import React, { useEffect } from 'react';
import { CheckCircle, Package, Truck, X } from 'lucide-react';

interface OrderSuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderNumber?: string;
}

const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
    isOpen,
    onClose,
    orderNumber,
}) => {
    useEffect(() => {
        if (isOpen) {
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';

            // Auto close after 5 seconds
            const timer = setTimeout(() => {
                onClose();
            }, 5000);

            return () => {
                document.body.style.overflow = 'unset';
                clearTimeout(timer);
            };
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full pointer-events-auto transform animate-slideUp"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Content */}
                    <div className="p-8 text-center">
                        {/* Success Icon with Animation */}
                        <div className="relative mb-6 flex justify-center">
                            {/* Animated rings */}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-32 h-32 rounded-full bg-green-100 animate-ping opacity-75" />
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-28 h-28 rounded-full bg-green-200 animate-pulse" />
                            </div>

                            {/* Main icon */}
                            <div className="relative bg-gradient-to-br from-green-400 to-green-600 rounded-full p-6 shadow-lg transform animate-bounceIn">
                                <CheckCircle className="w-16 h-16 text-white" strokeWidth={2.5} />
                            </div>
                        </div>

                        {/* Title */}
                        <h2 className="text-3xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                            🎉 تم تأكيد طلبك بنجاح!
                        </h2>

                        {/* Order Number */}
                        {orderNumber && (
                            <div className="inline-block bg-purple-50 border-2 border-purple-200 rounded-xl px-6 py-3 mb-6">
                                <p className="text-sm text-purple-600 font-medium mb-1">رقم الطلب</p>
                                <p className="text-2xl font-bold text-purple-900 font-mono">#{orderNumber}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        <p className="text-gray-600 text-lg mb-6 leading-relaxed">
                            شكراً لثقتك في برنس الكيك! 💜<br />
                            سيتم التواصل معك قريباً لتأكيد التفاصيل
                        </p>

                        {/* Status Steps */}
                        <div className="flex justify-center items-center gap-3 mb-8 flex-wrap">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white mb-2 shadow-md">
                                    <CheckCircle className="w-6 h-6" />
                                </div>
                                <span className="text-xs text-gray-600 font-medium">تم الاستلام</span>
                            </div>

                            <div className="w-8 h-0.5 bg-gradient-to-r from-green-500 to-purple-300 mt-[-20px]" />

                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mb-2 shadow-sm">
                                    <Package className="w-6 h-6" />
                                </div>
                                <span className="text-xs text-gray-600 font-medium">جاري التحضير</span>
                            </div>

                            <div className="w-8 h-0.5 bg-gradient-to-r from-purple-300 to-gray-200 mt-[-20px]" />

                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                                    <Truck className="w-6 h-6" />
                                </div>
                                <span className="text-xs text-gray-600 font-medium">التوصيل</span>
                            </div>
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={onClose}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                        >
                            رائع! 🎊
                        </button>

                        {/* Auto-close hint */}
                        <p className="text-gray-400 text-xs mt-4">
                            سيتم الإغلاق تلقائياً بعد 5 ثوان
                        </p>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none rounded-3xl">
                        <div className="absolute top-10 right-10 text-4xl animate-float">🎂</div>
                        <div className="absolute top-20 left-10 text-3xl animate-float animation-delay-1000">🍰</div>
                        <div className="absolute bottom-20 right-16 text-3xl animate-float animation-delay-2000">✨</div>
                        <div className="absolute bottom-16 left-20 text-2xl animate-float animation-delay-1500">🎈</div>
                    </div>
                </div>
            </div>

            {/* Custom Animations */}
            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes bounceIn {
          0% {
            transform: scale(0);
          }
          50% {
            transform: scale(1.15);
          }
          100% {
            transform: scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(10deg);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-1500 {
          animation-delay: 1.5s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
        </>
    );
};

export default OrderSuccessModal;
