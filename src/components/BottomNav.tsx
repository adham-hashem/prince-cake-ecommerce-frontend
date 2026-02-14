import { Home, Menu, Zap, Coffee, Palette, ShoppingCart } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

interface BottomNavProps {
    currentPage: string;
    onNavigate: (page: string) => void;
}

export function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
    const { getItemCount } = useApp();
    const itemCount = getItemCount();

    const navItems = [
        { id: 'home', label: 'الرئيسية', icon: Home },
        { id: 'menu', label: 'منيو', icon: Menu },
        { id: 'instant', label: 'فورية', icon: Zap },
        { id: 'breakfast', label: 'فطور', icon: Coffee },
        { id: 'custom', label: 'مخصص', icon: Palette },
        { id: 'cart', label: 'السلة', icon: ShoppingCart },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg pb-safe" style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
            <div className="w-full">
                <div className="grid grid-cols-6 gap-0 md:flex md:justify-center md:gap-12 py-2 px-0 sm:px-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = currentPage === item.id;

                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                className={`flex flex-col items-center justify-center min-w-0 p-1 md:px-3 md:py-2 rounded-xl transition-all duration-300 relative ${isActive
                                    ? 'text-purple-700 font-bold transform scale-105 md:scale-110'
                                    : 'text-gray-700 hover:text-purple-600 hover:bg-purple-50'
                                    }`}
                            >
                                <div className="relative mb-1">
                                    <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isActive ? 'animate-pulse' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                                    {item.id === 'cart' && itemCount > 0 && (
                                        <span className="absolute -top-2 -right-2 bg-purple-600 text-white text-[10px] font-bold rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                                            {itemCount}
                                        </span>
                                    )}
                                </div>
                                <span
                                    className={`text-[9px] md:text-xs font-medium text-center leading-tight ${isActive ? 'font-bold' : ''}`}
                                    style={{ fontFamily: 'Tajawal, sans-serif' }}
                                >
                                    {item.label}
                                </span>
                                {isActive && (
                                    <div className="absolute top-0 right-0 w-full h-full bg-purple-600/5 rounded-xl -z-10" />
                                )}
                                {isActive && (
                                    <div className="absolute -bottom-1 md:-bottom-2 w-1 h-1 bg-purple-600 rounded-full" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
