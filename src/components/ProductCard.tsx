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
      className="bg-white rounded-3xl shadow-xl overflow-hidden transition-all duration-300 group hover:shadow-2xl cursor-pointer transform hover:scale-[1.03] active:scale-[0.98] border-2 border-purple-100 hover:border-purple-300"
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50">
        <img
          src={`${apiUrl}${product.images[0]?.imagePath || ''}`}
          alt={product.name}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src =
              'https://placehold.co/600x400/f5f3ff/7c3aed?text=🎂+Prince+Cake';
          }}
          className="w-full h-56 sm:h-64 object-contain group-hover:scale-110 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 rounded-2xl text-sm font-bold shadow-lg">
              خصم {discountPercentage}%
            </div>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-xl shadow-lg border-2 border-purple-200">
          <Cake size={20} className="text-purple-600" />
        </div>

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/40 flex items-center justify-center backdrop-blur-sm">
            <div className="text-center">
              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-2xl font-bold text-base shadow-2xl block">
                غير متوفر حالياً
              </span>
            </div>
          </div>
        )}

        {/* Hover Actions - Desktop Only */}
        <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-purple-900/80 via-pink-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 items-end justify-center pb-6 gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProduct(product);
            }}
            className="bg-white text-purple-700 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-2xl hover:shadow-purple-500/50 hover:scale-110 transition-all"
          >
            <Eye size={18} />
            <span>عرض التفاصيل</span>
          </button>

          <button
            data-action="add-to-cart"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className={`px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-2xl transition-all ${
              product.inStock
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-pink-500/50 hover:scale-110'
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
            disabled={!product.inStock}
          >
            <ShoppingCart size={18} />
            <span>{product.inStock ? 'أضف للسلة' : 'غير متوفر'}</span>
          </button>
        </div>

        {/* Quick Add - Mobile */}
        <button
          data-action="add-to-cart"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className={`md:hidden absolute bottom-4 left-4 p-3.5 rounded-2xl shadow-2xl transition-all ${
            product.inStock
              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white active:scale-90'
              : 'bg-gray-400 text-white cursor-not-allowed'
          }`}
          disabled={!product.inStock}
        >
          <ShoppingCart size={22} />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-3.5">
        {/* Name & Code */}
        <div className="flex justify-between items-start gap-3">
          <h3 className="font-bold text-xl text-purple-900 flex-1 text-right leading-tight line-clamp-2">
            {product.name}
          </h3>
          <span className="text-xs text-purple-700 bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap border-2 border-purple-200">
            {product.code}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 text-right leading-relaxed">
          {product.description}
        </p>

        {/* Price Section */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border-2 border-amber-200">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-600">
                {product.price}
              </span>
              <span className="text-sm text-amber-700 font-bold">جنيه</span>
              {product.originalPrice && (
                <span className="text-sm text-gray-400 line-through font-medium">
                  {product.originalPrice}
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border-2 border-amber-200">
              <Star size={16} className="fill-amber-400 text-amber-400" />
              <span className="text-sm font-bold text-amber-600">4.9</span>
            </div>
          </div>
        </div>

        {/* Flavors (formerly colors) */}
        {product.colors.length > 0 && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-3 border-2 border-purple-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-purple-700 flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-500" />
                النكهات المتاحة:
              </span>
              <div className="flex items-center gap-1.5">
                {product.colors.slice(0, 4).map((flavor, index) => (
                  <div
                    key={index}
                    className="w-7 h-7 rounded-xl border-3 border-white shadow-md transition-all hover:scale-125 hover:rotate-12 flex items-center justify-center text-xs cursor-pointer"
                    style={{ backgroundColor: getFlavorColor(flavor) }}
                    title={flavor}
                  >
                    {isFlavorDark(flavor) && (
                      <span className="text-white text-[10px]">🍫</span>
                    )}
                  </div>
                ))}
                {product.colors.length > 4 && (
                  <span className="text-xs text-purple-700 bg-white px-2.5 py-1 rounded-xl font-bold border-2 border-purple-200">
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
            <div className="flex items-center gap-2 mb-2">
              <Cake size={14} className="text-purple-600" />
              <span className="text-sm font-bold text-purple-700">الأحجام المتاحة:</span>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              {product.sizes.slice(0, 3).map((size, index) => (
                <span
                  key={index}
                  className="text-sm font-bold bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-2 rounded-xl border-2 border-purple-200 hover:scale-105 transition-transform"
                >
                  {size}
                </span>
              ))}
              {product.sizes.length > 3 && (
                <span className="text-sm text-purple-600 bg-purple-50 px-3 py-2 rounded-xl font-bold border-2 border-purple-200">
                  +{product.sizes.length - 3} أخرى
                </span>
              )}
            </div>
          </div>
        )}

        {/* Quick Info Footer */}
        <div className="flex items-center justify-between pt-3 border-t-2 border-purple-100">
          <div className="flex items-center gap-1.5 text-sm text-pink-600 font-medium">
            <Heart size={14} className="text-pink-500 fill-pink-200" />
            <span>صنع بحب</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-amber-600 font-medium">
            <Sparkles size={14} className="text-amber-500" />
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
            className="flex-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 border-2 border-purple-200 active:scale-95 transition-all"
          >
            <Eye size={18} />
            <span>عرض</span>
          </button>

          <button
            data-action="add-to-cart"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            className={`flex-1 px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              product.inStock
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white border-2 border-purple-400 active:scale-95'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed border-2 border-gray-400'
            }`}
            disabled={!product.inStock}
          >
            <ShoppingCart size={18} />
            <span>{product.inStock ? 'أضف' : 'غير متوفر'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
