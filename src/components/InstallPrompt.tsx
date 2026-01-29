import React, { useState, useEffect } from 'react';
import { X, Download, Smartphone } from 'lucide-react';

// PWA Install Prompt Component
// Shows a smart, non-intrusive prompt to install the app on mobile devices

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if device is iOS
        const checkIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(checkIOS);

        // Check if we should show the prompt
        const shouldShowPrompt = () => {
            // Don't show on desktop
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (!isMobile) return false;

            // Check if already installed
            if (window.matchMedia('(display-mode: standalone)').matches) {
                return false;
            }

            // Check if dismissed recently (within 7 days)
            const dismissedTime = localStorage.getItem('pwa-install-dismissed');
            if (dismissedTime) {
                const daysSinceDismissed = (Date.now() - parseInt(dismissedTime)) / (1000 * 60 * 60 * 24);
                if (daysSinceDismissed < 7) {
                    return false;
                }
            }

            // Check visit count or time spent
            const visitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0');
            localStorage.setItem('pwa-visit-count', (visitCount + 1).toString());

            // Show after 2 visits OR after 30 seconds on first visit
            if (visitCount >= 1) {
                return true;
            }

            return false;
        };

        // Listen for beforeinstallprompt event (Android/Chrome)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            const promptEvent = e as BeforeInstallPromptEvent;
            setDeferredPrompt(promptEvent);

            // Wait 30 seconds before showing on first visit
            const visitCount = parseInt(localStorage.getItem('pwa-visit-count') || '0');
            if (visitCount === 0) {
                setTimeout(() => {
                    if (shouldShowPrompt()) {
                        setShowPrompt(true);
                    }
                }, 30000); // 30 seconds
            } else if (shouldShowPrompt()) {
                // Show immediately on subsequent visits
                setTimeout(() => setShowPrompt(true), 3000); // Small delay for better UX
            }
        };

        // Listen for app installed event
        const handleAppInstalled = () => {
            setShowPrompt(false);
            setDeferredPrompt(null);
            localStorage.setItem('pwa-installed', 'true');
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('appinstalled', handleAppInstalled);

        // For iOS, show prompt based on visit count only
        if (checkIOS && shouldShowPrompt()) {
            setTimeout(() => setShowPrompt(true), 3000);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, []);

    // Handle install button click
    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            // For iOS, we can't trigger install programmatically
            // The prompt will show instructions instead
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for user choice
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        // Clear the deferredPrompt
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    // Handle dismiss
    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('pwa-install-dismissed', Date.now().toString());
    };

    // Don't render if we shouldn't show the prompt
    if (!showPrompt) {
        return null;
    }

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up"
            style={{
                animation: 'slideUp 0.3s ease-out',
            }}
        >
            <div className="mx-4 mb-4 sm:mx-auto sm:max-w-md">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 p-4 shadow-2xl">
                    {/* Close Button */}
                    <button
                        onClick={handleDismiss}
                        className="absolute top-2 left-2 rounded-full bg-white/20 p-1 text-white hover:bg-white/30 transition-colors"
                        aria-label="إغلاق"
                    >
                        <X size={18} />
                    </button>

                    {/* Content */}
                    <div className="flex items-center gap-4 pr-8">
                        {/* Icon */}
                        <div className="flex-shrink-0">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                                {isIOS ? (
                                    <Smartphone className="h-7 w-7 text-white" />
                                ) : (
                                    <Download className="h-7 w-7 text-white" />
                                )}
                            </div>
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-white mb-1">
                                ثبت التطبيق على هاتفك 📱
                            </h3>
                            <p className="text-sm text-white/90">
                                {isIOS
                                    ? 'اضغط على زر المشاركة واختر "إضافة إلى الشاشة الرئيسية"'
                                    : 'وصول أسرع وأسهل لطلب التورتات اللذيذة'}
                            </p>
                        </div>

                        {/* Install Button (only show on Android/Chrome) */}
                        {!isIOS && deferredPrompt && (
                            <button
                                onClick={handleInstallClick}
                                className="flex-shrink-0 rounded-xl bg-white px-4 py-2 font-bold text-purple-600 hover:bg-white/90 transition-colors shadow-lg"
                            >
                                ثبت
                            </button>
                        )}
                    </div>

                    {/* Decorative elements */}
                    <div className="absolute -top-10 -right-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-10 -left-10 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
                </div>
            </div>

            <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
        </div>
    );
};

export default InstallPrompt;
