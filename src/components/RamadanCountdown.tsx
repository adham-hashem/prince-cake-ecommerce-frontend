import React, { useState, useEffect } from 'react';
import { Moon, Star } from 'lucide-react';

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
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 rounded-2xl px-3 py-2 text-center shadow-xl border-2 border-amber-400/30">
            {/* Background Decorations - Simplified */}
            <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                <div className="absolute top-1 left-2 animate-pulse"><Star size={10} /></div>
                <div className="absolute top-1 right-2 animate-pulse delay-75"><Star size={8} /></div>
                <div className="absolute bottom-1 left-3 animate-pulse delay-150"><Star size={6} /></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Header - Compact */}
                <div className="flex items-center gap-1.5 mb-2">
                    <Moon className="h-3 w-3 text-amber-400 fill-current" />
                    <h3 className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                        رمضان كريم
                    </h3>
                </div>

                {/* Timer - Horizontal Compact */}
                <div className="flex items-center gap-1.5">
                    {/* Days */}
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md border border-amber-300">
                            <span className="text-sm font-bold text-white font-mono">{timeLeft.days}</span>
                        </div>
                        <span className="text-amber-200 text-[9px] mt-0.5 font-medium">يوم</span>
                    </div>

                    <span className="text-amber-400 text-xs font-bold">:</span>

                    {/* Hours */}
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md border border-amber-400/20">
                            <span className="text-sm font-bold text-white font-mono">{timeLeft.hours}</span>
                        </div>
                        <span className="text-amber-200 text-[9px] mt-0.5 font-medium">ساعة</span>
                    </div>

                    <span className="text-amber-400 text-xs font-bold">:</span>

                    {/* Minutes */}
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md border border-amber-400/20">
                            <span className="text-sm font-bold text-white font-mono">{timeLeft.minutes}</span>
                        </div>
                        <span className="text-amber-200 text-[9px] mt-0.5 font-medium">دقيقة</span>
                    </div>

                    <span className="text-amber-400 text-xs font-bold">:</span>

                    {/* Seconds */}
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 bg-white/10 backdrop-blur-sm rounded-lg flex items-center justify-center shadow-md border border-amber-400/20">
                            <span className="text-sm font-bold text-white font-mono">{timeLeft.seconds}</span>
                        </div>
                        <span className="text-amber-200 text-[9px] mt-0.5 font-medium">ثانية</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RamadanCountdown;
