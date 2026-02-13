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
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 rounded-3xl p-8 mb-12 text-center shadow-2xl border-4 border-amber-400/30">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-4 left-10 animate-pulse"><Star size={24} /></div>
                <div className="absolute top-10 right-20 animate-pulse delay-75"><Star size={16} /></div>
                <div className="absolute bottom-10 left-1/4 animate-pulse delay-150"><Star size={20} /></div>
                <div className="absolute top-1/2 right-10 animate-pulse delay-300"><Star size={12} /></div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Moon className="h-8 w-8 text-amber-400 fill-current animate-bounce" />
                    <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200 drop-shadow-lg" style={{ fontFamily: 'Tahoma, sans-serif' }}>
                        رمضان كريم
                    </h2>
                    <Star className="h-8 w-8 text-amber-400 fill-current animate-bounce delay-100" />
                </div>

                <p className="text-amber-100/90 text-lg mb-8 font-medium">
                    باقي من الزمن على شهر الخير والبركة
                </p>

                {/* Timer Grid */}
                <div className="grid grid-cols-4 gap-4 sm:gap-8 max-w-2xl w-full">
                    {/* Seconds */}
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-amber-400/30 shadow-lg">
                            <span className="text-2xl sm:text-3xl font-bold text-white font-mono">{timeLeft.seconds}</span>
                        </div>
                        <span className="text-amber-200 text-sm mt-2 font-medium">ثانية</span>
                    </div>

                    {/* Minutes */}
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-amber-400/30 shadow-lg">
                            <span className="text-2xl sm:text-3xl font-bold text-white font-mono">{timeLeft.minutes}</span>
                        </div>
                        <span className="text-amber-200 text-sm mt-2 font-medium">دقيقة</span>
                    </div>

                    {/* Hours */}
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-amber-400/30 shadow-lg">
                            <span className="text-2xl sm:text-3xl font-bold text-white font-mono">{timeLeft.hours}</span>
                        </div>
                        <span className="text-amber-200 text-sm mt-2 font-medium">ساعة</span>
                    </div>

                    {/* Days */}
                    <div className="flex flex-col items-center">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg transform scale-110 border-2 border-amber-300">
                            <span className="text-2xl sm:text-3xl font-bold text-white font-mono">{timeLeft.days}</span>
                        </div>
                        <span className="text-amber-400 text-sm mt-3 font-bold">يوم</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 flex items-center gap-2 text-amber-200/80 text-sm">
                    <Sparkles size={16} />
                    <span>اللهم بلغنا رمضان لا فاقدين ولا مفقودين</span>
                    <Sparkles size={16} />
                </div>
            </div>
        </div>
    );
};

export default RamadanCountdown;
