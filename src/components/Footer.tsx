import React from 'react';
import {
  Instagram,
  Facebook,
  MessageCircle,
  MapPin,
  Phone,
} from 'lucide-react';


const Footer: React.FC = () => {
  const openWhatsApp = () => {
    const url = 'https://wa.me/message/OBN3BIAW4SGBO1';
    window.open(url, '_blank');
  };


  const currentYear = new Date().getFullYear();


  return (
    <footer className="bg-gradient-to-b from-purple-50 to-white mt-16 py-12">
      <div className="container mx-auto px-4">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center gap-6 mb-10">
          <div className="flex items-center gap-3">
            <img
              src="/logo_with_slogan.jpg"
              alt="Prince Cake"
              className="h-16 w-16 rounded-full object-cover shadow-lg border-4 border-white"
            />
            <div className="text-center">
              <h3 className="text-xl font-bold text-purple-900">Prince Cake</h3>
              <p className="text-sm text-amber-600">برنس الكيك في مصر</p>
            </div>
          </div>
        </div>


        {/* Social Media Links */}
        <div className="flex justify-center items-center gap-4 mb-8">
          <a
            href="https://www.instagram.com/princecake_eg?igsh=MXZ2NGc0amd1OXZuYQ=="
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a
            href="https://www.facebook.com/share/17rDjF4BAr/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-blue-600 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
          >
            <Facebook className="h-5 w-5" />
          </a>
          <a
            href="https://www.tiktok.com/@princecake.eg?_r=1&_t=ZS-92hiypmHKJI"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-gray-900 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
          </a>
          <button
            onClick={openWhatsApp}
            className="p-3 bg-green-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg"
          >
            <MessageCircle className="h-5 w-5" />
          </button>
        </div>


        {/* Copyright */}
        <div className="border-t border-purple-100 pt-6">
          <div className="text-center space-y-2">
            <p className="text-gray-600 text-sm">
              تم التصميم والتطوير بواسطة{' '}
              <span className="text-purple-600 font-medium">م/ أدهم</span> و{' '}
              <span className="text-pink-600 font-medium">م/ إسراء</span>
            </p>
            <p className="text-gray-500 text-xs">
              © {currentYear} Prince Cake. جميع الحقوق محفوظة 🎂
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};


export default Footer;
