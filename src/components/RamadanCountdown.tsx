import React, { useState, useEffect } from 'react';
import { Sparkles, Moon, Star } from 'lucide-react';

const RamadanCountdown: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    useEffect(() => {
        // Ramadan Start Date: Feb 18, 2026 (Approximate)
        const ramadanDate = new Date('2026-02-18T00:00:00').getTime();

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = ramadanDate - now;

            if (distance < 0) {
                clearInterval(timer);
                return;
            }

            setTimeLeft({
                days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                seconds: Math.floor((distance % (1000 * 60)) / 1000),
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 rounded-2xl px-4 py-3 text-center shadow-xl border-2 border-amber-400/30">
            {/* Background Decorations - Simplified */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <div className="absolute top-1 left-2 animate-pulse"><Star size={12} /></div>
                <div className="absolute top-1 right-2 animate-pulse delay-75"><Star size={10} /></div>
                <div className="absolute bottom-1 left-3 animate-pulse delay-150"><Star size={8} /></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Header - Compact */}
                <div className="flex items-center gap-2 mb-2">
                    <Moon className="h-4 w-4 text-amber-400 fill-current" />
                    <h3 className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                        رمضان كريم
                    </h3>
                </div>

                {/* Only Days Counter - Compact */}
                <div className="flex items-center gap-2">
                    <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg border-2 border-amber-300">
                        <span className="text-xl font-bold text-white font-mono">{timeLeft.days}</span>
                    </div>
                    <span className="text-amber-200 text-xs font-medium">يوم</span>
                </div>
            </div>
        </div>
    );
};

export default RamadanCountdown;
