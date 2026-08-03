// Utility for Auto-Detecting Mobile APK / PWA / WebView vs Desktop Web Browser Mode

export interface EnvInfo {
  isMobileDevice: boolean;
  isStandaloneApp: boolean;
  isAndroidWebView: boolean;
  isMobileApkOrPwa: boolean;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  platformType: 'android-apk' | 'mobile-pwa' | 'mobile-web' | 'desktop-web';
  label: string;
}

export function detectEnvironment(): EnvInfo {
  if (typeof window === 'undefined') {
    return {
      isMobileDevice: false,
      isStandaloneApp: false,
      isAndroidWebView: false,
      isMobileApkOrPwa: false,
      userAgent: '',
      screenWidth: 1024,
      screenHeight: 768,
      platformType: 'desktop-web',
      label: '💻 Desktop Web Browser'
    };
  }

  const ua = navigator.userAgent || '';
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isMobileDevice = isMobileUserAgent || (isTouchDevice && screenWidth <= 768);

  const isStandaloneApp =
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://');

  const isAndroidWebView =
    /wv|Android.*Version\/[0-9]\.[0-9]/i.test(ua) ||
    Boolean((window as any).AndroidInterface || (window as any).webkit);

  const isMobileApkOrPwa = isStandaloneApp || isAndroidWebView;

  let platformType: EnvInfo['platformType'] = 'desktop-web';
  let label = '💻 Desktop Web Browser';

  if (isAndroidWebView) {
    platformType = 'android-apk';
    label = '📱 Android Native APK / WebView';
  } else if (isStandaloneApp) {
    platformType = 'mobile-pwa';
    label = '📱 Mobile PWA / Standalone App';
  } else if (isMobileDevice) {
    platformType = 'mobile-web';
    label = '📱 Mobile Web Browser';
  }

  return {
    isMobileDevice,
    isStandaloneApp,
    isAndroidWebView,
    isMobileApkOrPwa,
    userAgent: ua,
    screenWidth,
    screenHeight,
    platformType,
    label
  };
}
