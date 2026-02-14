import React, { useState, useEffect } from 'react';
import { Moon, Star, Sunrise, Sunset } from 'lucide-react';

const RamadanCountdown: React.FC = () => {
    const [timeLeft, setTimeLeft] = useState<{
        days: number;
        hours: number;
        minutes: number;
        seconds: number;
    }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const [ramadanDay, setRamadanDay] = useState<number>(0);
    const [isRamadan, setIsRamadan] = useState<boolean>(false);
    const [prayerTimes, setPrayerTimes] = useState<{ fajr: string; maghrib: string }>({ fajr: '', maghrib: '' });

    // Approximate prayer times for Alexandria during Ramadan 2026
    // These times change slightly each day, this is a static approximation
    const getPrayerTimes = (day: number): { fajr: string; maghrib: string } => {
        // Base times for start of Ramadan (adjusting by ~1 minute per day for Fajr, Maghrib gets later)
        const baseFajr = 4 * 60 + 50; // 4:50 AM in minutes
        const baseMaghrib = 17 * 60 + 45; // 5:45 PM in minutes

        // Adjust times based on day (Fajr gets earlier, Maghrib gets later as month progresses)
        const fajrMinutes = baseFajr - Math.floor(day / 2); // Gets ~30 minutes earlier over the month
        const maghribMinutes = baseMaghrib + Math.floor(day / 2); // Gets ~30 minutes later

        const formatTime = (totalMinutes: number): string => {
            const hours = Math.floor(totalMinutes / 60);
            const mins = totalMinutes % 60;
            const period = hours >= 12 ? 'م' : 'ص';
            const displayHours = hours > 12 ? hours - 12 : hours;
            return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
        };

        return {
            fajr: formatTime(fajrMinutes),
            maghrib: formatTime(maghribMinutes),
        };
    };

    useEffect(() => {
        // Ramadan Start Date: Feb 19, 2026 at 00:00:00 Egypt time (UTC+2)
        // Create date in local time (Egypt timezone)
        const ramadanStart = new Date(2026, 1, 19, 0, 0, 0); // Month is 0-indexed, so 1 = February
        const ramadanStartDate = ramadanStart.getTime();
        // Ramadan lasts 29 or 30 days, using 30 for this example
        const ramadanEndDate = ramadanStartDate + (30 * 24 * 60 * 60 * 1000);

        const timer = setInterval(() => {
            const now = new Date().getTime();

            // Check if we're in Ramadan
            if (now >= ramadanStartDate && now < ramadanEndDate) {
                setIsRamadan(true);
                // Calculate which day of Ramadan it is (1-30)
                const daysSinceStart = Math.floor((now - ramadanStartDate) / (1000 * 60 * 60 * 24)) + 1;
                setRamadanDay(daysSinceStart);
                setPrayerTimes(getPrayerTimes(daysSinceStart));
            } else if (now < ramadanStartDate) {
                // Before Ramadan - show countdown
                setIsRamadan(false);
                const distance = ramadanStartDate - now;

                // Calculate days remaining more accurately
                const nowDate = new Date(now);
                const ramadanDate = new Date(ramadanStartDate);

                // Set both to midnight to calculate full days
                nowDate.setHours(0, 0, 0, 0);
                ramadanDate.setHours(0, 0, 0, 0);

                const daysRemaining = Math.ceil((ramadanDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24));

                setTimeLeft({
                    days: daysRemaining,
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000),
                });
            } else {
                // After Ramadan - component can be hidden
                clearInterval(timer);
                setIsRamadan(false);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Don't show component if Ramadan is over
    if (!isRamadan && timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
        return null;
    }

    // During Ramadan - Show current day with prayer times
    if (isRamadan) {
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

                    {/* Current Ramadan Day */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg px-3 py-1 shadow-md border border-amber-300">
                            <span className="text-xl font-bold text-white font-mono">{ramadanDay}</span>
                        </div>
                        <span className="text-amber-200 text-xs font-bold">رمضان</span>
                    </div>

                    {/* Prayer Times for Alexandria */}
                    <div className="flex items-center gap-3 text-[10px]">
                        {/* Fajr */}
                        <div className="flex items-center gap-1">
                            <Sunrise className="w-3 h-3 text-amber-300" />
                            <div className="flex flex-col items-start">
                                <span className="text-amber-400 font-medium">الفجر</span>
                                <span className="text-amber-100 font-mono">{prayerTimes.fajr}</span>
                            </div>
                        </div>

                        <div className="w-px h-6 bg-amber-400/30"></div>

                        {/* Maghrib */}
                        <div className="flex items-center gap-1">
                            <Sunset className="w-3 h-3 text-amber-300" />
                            <div className="flex flex-col items-start">
                                <span className="text-amber-400 font-medium">المغرب</span>
                                <span className="text-amber-100 font-mono">{prayerTimes.maghrib}</span>
                            </div>
                        </div>
                    </div>

                    {/* Location indicator */}
                    <p className="text-amber-200/60 text-[9px] mt-1">الإسكندرية</p>
                </div>
            </div>
        );
    }

    // Before Ramadan - Show countdown
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
