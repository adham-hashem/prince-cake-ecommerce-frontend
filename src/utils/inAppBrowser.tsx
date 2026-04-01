export const isAndroid = () => /Android/i.test(navigator.userAgent);

export const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);

export const isFacebookOrInstagramInAppBrowser = () => {
  const ua = navigator.userAgent || '';
  // FBAN = Facebook App Name, FBAV = Facebook App Version
  // Instagram, Messenger = Facebook Messenger in-app browser
  return /FBAN|FBAV|Instagram|Messenger\//i.test(ua);
};

/**
 * Attempts to open current URL in external browser.
 * - Android: Uses Chrome Intent (usually escapes FB/IG WebView to Chrome)
 * - iOS: Uses x-safari-https:// scheme, with fallback guidance
 */
export const openInExternalBrowser = () => {
  const url = window.location.href;

  if (isAndroid()) {
    // Remove protocol for intent format
    const noProtocol = url.replace(/^https?:\/\//, '');
    const intentUrl = `intent://${noProtocol}#Intent;scheme=https;package=com.android.chrome;end`;
    window.location.href = intentUrl;
    return;
  }

  if (isIOS()) {
    // Strategy 1: Try x-safari-https:// URL scheme (works on many iOS versions)
    const safariUrl = url.replace(/^https:\/\//, 'x-safari-https://').replace(/^http:\/\//, 'x-safari-http://');
    window.location.href = safariUrl;

    // Strategy 2: After a short delay, if we're still here, try window.open
    // and also copy URL to clipboard for manual pasting
    setTimeout(() => {
      // Copy URL to clipboard so user can paste in Safari
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(url);
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = url;
          textArea.style.position = 'fixed';
          textArea.style.opacity = '0';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
      } catch (_) {
        // Clipboard access may fail in in-app browsers
      }

      // Also try window.open as a secondary attempt
      window.open(url, '_blank', 'noopener,noreferrer');
    }, 500);
    return;
  }

  // Other browsers (best-effort)
  window.open(url, '_blank', 'noopener,noreferrer');
};