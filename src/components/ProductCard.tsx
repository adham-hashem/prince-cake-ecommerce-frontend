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
      className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 group hover:shadow-2xl cursor-pointer transform hover:scale-[1.02] active:scale-[0.98] border-2 border-transparent hover:border-purple-200"
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50">
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
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {/* Offer Badge */}
          {product.isOffer && (
            <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse">
              <Sparkles size={12} />
              <span>عرض خاص</span>
            </div>
          )}

          {/* Discount Badge */}
          {discountPercentage > 0 && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
              خصم {discountPercentage}%
            </div>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-bold text-sm">
              غير متوفر حالياً
            </span>
          </div>
        )}

        {/* Hover Actions - Desktop Only */}
        <div className="hidden md:flex absolute inset-0 bg-gradient-to-t from-purple-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 items-end justify-center pb-4 gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewProduct(product);
            }}
            className="bg-white text-purple-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
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
            className={`px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-xl transition-all ${
              product.inStock
                ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:shadow-2xl hover:scale-105'
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
          className={`md:hidden absolute bottom-3 left-3 p-3 rounded-full shadow-xl transition-all ${
            product.inStock
              ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white active:scale-90'
              : 'bg-gray-400 text-white cursor-not-allowed'
          }`}
          disabled={!product.inStock}
        >
          <ShoppingCart size={20} />
        </button>

        {/* Cake Icon Decoration */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md">
          <Cake size={18} className="text-purple-600" />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-3">
        {/* Name & Code */}
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-lg text-purple-900 flex-1 text-right leading-tight line-clamp-2">
            {product.name}
          </h3>
          <span className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full font-medium whitespace-nowrap">
            {product.code}
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-500 text-sm line-clamp-2 text-right leading-relaxed">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between pt-2 border-t border-purple-100">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600">
              {product.price}
            </span>
            <span className="text-sm text-purple-600 font-medium">جنيه</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {product.originalPrice}
              </span>
            )}
          </div>

          {/* Rating placeholder */}
          <div className="flex items-center gap-1 text-amber-500">
            <Star size={14} className="fill-current" />
            <span className="text-xs font-medium">4.9</span>
          </div>
        </div>

        {/* Flavors (formerly colors) */}
        {product.colors.length > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">النكهات:</span>
            <div className="flex items-center gap-1">
              {product.colors.slice(0, 4).map((flavor, index) => (
                <div
                  key={index}
                  className="w-6 h-6 rounded-full border-2 border-white shadow-md transition-transform hover:scale-110 flex items-center justify-center text-xs"
                  style={{ backgroundColor: getFlavorColor(flavor) }}
                  title={flavor}
                >
                  {isFlavorDark(flavor) && (
                    <span className="text-white text-[8px]">🍫</span>
                  )}
                </div>
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full font-medium">
                  +{product.colors.length - 4}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Sizes */}
        {product.sizes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 justify-end">
            {product.sizes.slice(0, 3).map((size, index) => (
              <span
                key={index}
                className="text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-3 py-1 rounded-full"
              >
                {size}
              </span>
            ))}
            {product.sizes.length > 3 && (
              <span className="text-xs text-gray-400 py-1">
                +{product.sizes.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Quick Info */}
        <div className="flex items-center justify-between pt-2 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <Heart size={12} className="text-pink-400" />
            <span>صنع بحب</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles size={12} className="text-amber-400" />
            <span>جودة عالية</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;