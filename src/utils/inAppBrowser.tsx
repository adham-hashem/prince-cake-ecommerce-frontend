export const isAndroid = () => /Android/i.test(navigator.userAgent);

export const isIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent);

export const isFacebookOrInstagramInAppBrowser = () => {
  const ua = navigator.userAgent || '';
  return /FBAN|FBAV|Instagram/i.test(ua);
};

/**
 * Attempts to open current URL in external browser.
 * - Android: Uses Chrome Intent (usually escapes FB/IG WebView to Chrome)
 * - iOS: Can't reliably force Safari; opens new tab and shows guidance in UI
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

  // iOS / others (best-effort)
  window.open(url, '_blank', 'noopener,noreferrer');
};