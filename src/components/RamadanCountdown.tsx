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

    // Accurate prayer times for Alexandria during Ramadan 2026 (Feb 19 - Mar 19)
    // Day-by-day lookup table from Aladhan API (Egyptian General Authority of Survey method)
    // Coordinates: 31.2001°N, 29.9187°E (Alexandria, Egypt)
    const ramadanPrayerTimes: { fajr: string; maghrib: string }[] = [
        { fajr: '5:10 ص', maghrib: '5:51 م' },  // Day 1  - Feb 19
        { fajr: '5:09 ص', maghrib: '5:52 م' },  // Day 2  - Feb 20
        { fajr: '5:08 ص', maghrib: '5:52 م' },  // Day 3  - Feb 21
        { fajr: '5:07 ص', maghrib: '5:53 م' },  // Day 4  - Feb 22
        { fajr: '5:06 ص', maghrib: '5:54 م' },  // Day 5  - Feb 23
        { fajr: '5:05 ص', maghrib: '5:55 م' },  // Day 6  - Feb 24
        { fajr: '5:04 ص', maghrib: '5:55 م' },  // Day 7  - Feb 25
        { fajr: '5:03 ص', maghrib: '5:56 م' },  // Day 8  - Feb 26
        { fajr: '5:02 ص', maghrib: '5:57 م' },  // Day 9  - Feb 27
        { fajr: '5:01 ص', maghrib: '5:58 م' },  // Day 10 - Feb 28
        { fajr: '5:00 ص', maghrib: '5:58 م' },  // Day 11 - Mar 1
        { fajr: '4:59 ص', maghrib: '5:59 م' },  // Day 12 - Mar 2
        { fajr: '4:58 ص', maghrib: '6:00 م' },  // Day 13 - Mar 3
        { fajr: '4:56 ص', maghrib: '6:01 م' },  // Day 14 - Mar 4
        { fajr: '4:55 ص', maghrib: '6:01 م' },  // Day 15 - Mar 5
        { fajr: '4:54 ص', maghrib: '6:02 م' },  // Day 16 - Mar 6
        { fajr: '4:53 ص', maghrib: '6:03 م' },  // Day 17 - Mar 7
        { fajr: '4:52 ص', maghrib: '6:04 م' },  // Day 18 - Mar 8
        { fajr: '4:51 ص', maghrib: '6:04 م' },  // Day 19 - Mar 9
        { fajr: '4:49 ص', maghrib: '6:05 م' },  // Day 20 - Mar 10
        { fajr: '4:48 ص', maghrib: '6:06 م' },  // Day 21 - Mar 11
        { fajr: '4:47 ص', maghrib: '6:06 م' },  // Day 22 - Mar 12
        { fajr: '4:46 ص', maghrib: '6:07 م' },  // Day 23 - Mar 13
        { fajr: '4:44 ص', maghrib: '6:08 م' },  // Day 24 - Mar 14
        { fajr: '4:43 ص', maghrib: '6:08 م' },  // Day 25 - Mar 15
        { fajr: '4:42 ص', maghrib: '6:09 م' },  // Day 26 - Mar 16
        { fajr: '4:40 ص', maghrib: '6:10 م' },  // Day 27 - Mar 17
        { fajr: '4:39 ص', maghrib: '6:10 م' },  // Day 28 - Mar 18
        { fajr: '4:38 ص', maghrib: '6:11 م' },  // Day 29 - Mar 19
        { fajr: '4:38 ص', maghrib: '6:11 م' },  // Day 30 - Mar 20 (if applicable)
    ];

    const getPrayerTimes = (day: number): { fajr: string; maghrib: string } => {
        const index = Math.max(0, Math.min(day - 1, ramadanPrayerTimes.length - 1));
        return ramadanPrayerTimes[index];
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
