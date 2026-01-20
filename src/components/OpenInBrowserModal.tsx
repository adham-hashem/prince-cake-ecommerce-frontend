import React from 'react';
import { openInExternalBrowser, isIOS } from '../utils/inAppBrowser';

type Props = {
  open: boolean;
  onClose: () => void;
};

const OpenInBrowserModal: React.FC<Props> = ({ open, onClose }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl p-5 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-2">ملاحظة مهمة</h3>
        <p className="text-sm text-gray-600 mb-4">
          أنت فاتح الموقع من متصفح فيسبوك/إنستجرام، وتسجيل الدخول بجوجل قد لا يعمل هنا.
          الأفضل تفتح الموقع في المتصفح.
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => openInExternalBrowser()}
            className="flex-1 bg-purple-600 text-white rounded-xl py-2.5 font-semibold hover:bg-purple-700 transition-colors"
          >
            فتح في المتصفح
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-800 rounded-xl py-2.5 font-semibold hover:bg-gray-200 transition-colors"
          >
            متابعة هنا
          </button>
        </div>

        {isIOS() && (
          <p className="text-xs text-gray-400 mt-3">
            على iPhone: لو ما فتحش Safari تلقائيًا، افتح قائمة المشاركة واختر “Open in Safari”.
          </p>
        )}
      </div>
    </div>
  );
};

export default OpenInBrowserModal;