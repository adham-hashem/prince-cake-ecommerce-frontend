import React from 'react';
import { ShoppingCart, Eye, Cake, Heart, Sparkles, Star } from 'lucide-react';

type Product = {
  id: string;
  name: string;
  code: string;
  description: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  isOffer: boolean;
  images: { imagePath: string }[];
  colors: string[]; // For cakes: النكهات
  sizes: string[]; // For cakes: الأحجام
};

const apiUrl = import.meta.env.VITE_API_BASE_URL;

interface ProductCardProps {
  product: Product;
  onViewProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

// Map flavor names to colors for visual display
const getFlavorColor = (flavorName: string): string => {
  const trimmedName = flavorName.trim().toLowerCase();

  const flavorMap: { [key: string]: string } = {
    // Arabic flavors
    'فانيليا': '#fef3c7',
    'شوكولاتة': '#78350f',
    'فراولة': '#fecaca',
    'كراميل': '#d97706',
    'ريد فيلفيت': '#dc2626',
    'تيراميسو': '#a3a3a3',
    'موكا': '#451a03',
    'ليمون': '#fef08a',
    'توت': '#7c3aed',
    'مانجو': '#fb923c',
    // English flavors
    'vanilla': '#fef3c7',
    'chocolate': '#78350f',
    'strawberry': '#fecaca',
    'caramel': '#d97706',
    'red velvet': '#dc2626',
    'tiramisu': '#a3a3a3',
    'mocha': '#451a03',
    'lemon': '#fef08a',
    'berry': '#7c3aed',
    'mango': '#fb923c',
  };

  return flavorMap[trimmedName] || '#e5e7eb';
};

// Check if flavor is dark for text contrast
const isFlavorDark = (flavorName: string): boolean => {
  const darkFlavors = ['شوكولاتة', 'chocolate', 'موكا', 'mocha', 'ريد فيلفيت', 'red velvet'];
  return darkFlavors.includes(flavorName.trim().toLowerCase());
};

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onViewProduct,
  onAddToCart,
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button[data-action="add-to-cart"]')) {
      return;
    }
    onViewProduct(product);
  };

  const discountPercentage =
    product.originalPrice && product.price < product.originalPrice
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) * 100
        )
      : 0;

  return (
    <div
      className="bg-white rounded-2xl sm:rounded-3xl shadow-lg overflow-hidden transition-all duration-300 group hover:shadow-2xl cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] border-2 border-purple-100 hover:border-purple-400"
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative overflow-hidden bg-purple-50">
        <img
          src={`${apiUrl}${product.images[0]?.imagePath || ''}`}
          alt={product.name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src =
              'https://placehold.co/600x400/f5f3ff/7c3aed?text=🎂+Prince+Cake';
          }}
          className="w-full h-48 sm:h-56 md:h-64 object-contain group-hover:scale-110 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex flex-col gap-1.5 sm:gap-2">
          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="bg-orange-500 text-white px-2.5 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl text-[10px] sm:text-sm font-bold shadow-lg">
              خصم {discountPercentage}%
            </div>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3 bg-white p-1.5 sm:p-2 rounded-lg sm:rounded-xl shadow-md border-2 border-purple-200">
          <Cake size={16} className="sm:hidden text-purple-600" />
          <Cake size={20} className="hidden sm:block text-purple-600" />
        </div>

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <span className="bg-red-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base shadow-2xl block">
                غير متوفر حالياً
              </span>
            </div>
          </div>
        )}

        {/* Hover Actions - Desktop Only */}
        <div className="hidden md:flex absolute inset-0 bg-purple-900/80 opacity-0 group-hover:opacity-100 transition-all duration-300 items-end justify-center pb-6 gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProduct(product);
            }}
            className="bg-white text-purple-700 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-2xl hover:bg-purple-50 hover:scale-110 transition-all"
          >
            <Eye size={18} />
            <span>عرض التفاصيل</span>
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-3 sm:p-4 md:p-5 space-y-2.5 sm:space-y-3">
        {/* Name & Code */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-base sm:text-lg md:text-xl text-purple-900 flex-1 text-right leading-tight line-clamp-2">
            {product.name}
          </h3>
          <span className="text-[10px] sm:text-xs text-purple-700 bg-purple-100 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-bold whitespace-nowrap border border-purple-300 sm:border-2">
            {product.code}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-xs sm:text-sm line-clamp-2 text-right leading-relaxed">
          {product.description}
        </p>

        {/* Price Section */}
        <div className="bg-amber-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-amber-300 sm:border-2">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-2xl sm:text-3xl font-black text-amber-700">
                {product.price}
              </span>
              <span className="text-xs sm:text-sm text-amber-700 font-bold">جنيه</span>
              {product.originalPrice && (
                <span className="text-xs sm:text-sm text-gray-400 line-through font-medium">
                  {product.originalPrice}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Flavors */}
        {product.colors.length > 0 && (
          <div className="bg-purple-50 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 border border-purple-300 sm:border-2">
            <div className="flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-purple-700 flex items-center gap-1 sm:gap-1.5">
                <Sparkles size={12} className="sm:hidden text-purple-600" />
                <Sparkles size={14} className="hidden sm:block text-purple-600" />
                النكهات:
              </span>
              <div className="flex items-center gap-1 sm:gap-1.5">
                {product.colors.slice(0, 4).map((flavor, index) => (
                  <div
                    key={index}
                    className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-lg sm:rounded-xl border-2 sm:border-3 border-white shadow-md transition-all hover:scale-125 hover:rotate-12 flex items-center justify-center text-[8px] sm:text-xs cursor-pointer"
                    style={{ backgroundColor: getFlavorColor(flavor) }}
                    title={flavor}
                  >
                    {isFlavorDark(flavor) && (
                      <span className="text-white text-[8px] sm:text-[10px]">🍫</span>
                    )}
                  </div>
                ))}
                {product.colors.length > 4 && (
                  <span className="text-[10px] sm:text-xs text-purple-700 bg-white px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-lg sm:rounded-xl font-bold border border-purple-300 sm:border-2">
                    +{product.colors.length - 4}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sizes */}
        {product.sizes.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <Cake size={12} className="sm:hidden text-purple-600" />
              <Cake size={14} className="hidden sm:block text-purple-600" />
              <span className="text-xs sm:text-sm font-bold text-purple-700">الأحجام:</span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-end">
              {product.sizes.slice(0, 3).map((size, index) => (
                <span
                  key={index}
                  className="text-xs sm:text-sm font-bold bg-purple-100 text-purple-700 px-2.5 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-lg sm:rounded-xl border border-purple-300 sm:border-2 hover:scale-105 transition-transform"
                >
                  {size}
                </span>
              ))}
              {product.sizes.length > 3 && (
                <span className="text-xs sm:text-sm text-purple-600 bg-purple-50 px-2 sm:px-3 py-1 sm:py-1.5 md:py-2 rounded-lg sm:rounded-xl font-bold border border-purple-300 sm:border-2">
                  +{product.sizes.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quick Info Footer */}
        <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-purple-200 sm:border-t-2">
          <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-pink-600 font-medium">
            <Heart size={12} className="sm:hidden text-pink-500 fill-pink-200" />
            <Heart size={14} className="hidden sm:block text-pink-500 fill-pink-200" />
            <span>صنع بحب</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-amber-600 font-medium">
            <Sparkles size={12} className="sm:hidden text-amber-500" />
            <Sparkles size={14} className="hidden sm:block text-amber-500" />
            <span>جودة عالية</span>
          </div>
        </div>

        {/* Mobile Action Buttons */}
        <div className="md:hidden flex gap-2 pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProduct(product);
            }}
            className="flex-1 bg-purple-100 text-purple-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-1.5 sm:gap-2 border-2 border-purple-300 active:scale-95 transition-all text-sm sm:text-base"
          >
            <Eye size={16} className="sm:hidden" />
            <Eye size={18} className="hidden sm:block" />
            <span>عرض</span>
          </button>

          {/* <button
            data-action="add-to-cart"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className={`flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all text-sm sm:text-base ${
              product.inStock
                ? 'bg-purple-600 text-white border-2 border-purple-700 active:scale-95 hover:bg-purple-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed border-2 border-gray-400'
            }`}
            disabled={!product.inStock}
          >
            <ShoppingCart size={16} className="sm:hidden" />
            <ShoppingCart size={18} className="hidden sm:block" />
            <span>{product.inStock ? 'أضف' : 'غير متوفر'}</span>
          </button> */}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

