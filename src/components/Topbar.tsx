import React, { useState, useEffect } from 'react';
import {
  Bell,
  RotateCw,
  Moon,
  Sun,
  Search,
  CheckCircle2,
  User as UserIcon,
  Filter,
  SlidersHorizontal,
  Menu,
  Smartphone,
  Monitor,
  Info,
  X
} from 'lucide-react';
import { User, NotificationItem } from '../types';
import { detectEnvironment, EnvInfo } from '../utils/envDetector';

interface TopbarProps {
  activeSection?: string;
  theme?: 'light' | 'dark';
  onToggleTheme?: (theme: 'light' | 'dark') => void;
  onRefresh?: () => void;
  currentUser?: User;
  globalSearch?: string;
  onGlobalSearchChange?: (val: string) => void;
  notifications?: NotificationItem[];
  onToggleMobileMenu?: () => void;
  forcedViewMode?: 'auto' | 'mobile' | 'desktop';
  onSetForcedViewMode?: (mode: 'auto' | 'mobile' | 'desktop') => void;
}

export const Topbar: React.FC<TopbarProps> = ({
  activeSection = 'Dashboard',
  theme = 'light',
  onToggleTheme,
  onRefresh,
  currentUser,
  globalSearch = '',
  onGlobalSearchChange,
  notifications = [],
  onToggleMobileMenu,
  forcedViewMode = 'auto',
  onSetForcedViewMode
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isEnvModalOpen, setIsEnvModalOpen] = useState(false);
  const [envInfo, setEnvInfo] = useState<EnvInfo>(detectEnvironment());

  useEffect(() => {
    const handleResize = () => setEnvInfo(detectEnvironment());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatSectionTitle = (sec: string) => {
    switch (sec) {
      case 'dashboard': return 'Dashboard Overview';
      case 'purchase-requests':
      case 'purchase-request': return 'Purchase Requests (PR)';
      case 'purchase-orders':
      case 'purchase-order': return 'Purchase Orders (PO)';
      case 'quotations':
      case 'quotation': return 'Quotations (Penawaran)';
      case 'invoices':
      case 'invoice': return 'Invoices & Tax';
      case 'delivery-status':
      case 'status': return 'Delivery Status & Tracking';
      case 'suppliers':
      case 'supplier': return 'Supplier & Vendor Database';
      case 'approvals': return 'Approval System Workflows';
      case 'report': return 'Reports & Analytics Exporter';
      case 'gas-exporter': return 'Google Apps Script Code Exporter';
      case 'account': return 'Account & Organization Settings';
      case 'media':
      case 'extra': return 'Media & Extra Features';
      default: return sec.toUpperCase();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 sm:px-6 shadow-2xs z-30 sticky top-0 transition-colors">
      {/* Breadcrumb & Section Name */}
      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 md:hidden mr-0.5"
            title="Menu Navigasi"
          >
            <Menu className="w-4 h-4 text-slate-700 dark:text-slate-200" />
          </button>
        )}
        <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px] hidden sm:inline">Purchasing</span>
        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>
        <span className="text-slate-900 dark:text-white font-bold tracking-tight text-sm flex items-center gap-2 truncate">
          <span className="w-1.5 h-3.5 bg-blue-600 rounded-full shrink-0"></span>
          <span className="truncate">{formatSectionTitle(activeSection)}</span>
        </span>
      </div>

      {/* Global Search & Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Environment Auto-Detector Badge */}
        <button
          onClick={() => setIsEnvModalOpen(true)}
          className={`hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-[11px] font-bold transition-all shadow-2xs ${
            envInfo.isMobileApkOrPwa || forcedViewMode === 'mobile'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800'
              : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800'
          }`}
          title="Auto Detect Platform / Mode Tampilan (Klik untuk detail)"
        >
          {envInfo.isMobileApkOrPwa || forcedViewMode === 'mobile' ? (
            <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Monitor className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          )}
          <span className="hidden md:inline font-mono">
            {forcedViewMode === 'mobile'
              ? '📱 Mobile Sim'
              : forcedViewMode === 'desktop'
              ? '💻 Desktop Sim'
              : envInfo.isAndroidWebView
              ? '📱 Android APK'
              : envInfo.isStandaloneApp
              ? '📱 Mobile PWA'
              : envInfo.isMobileDevice
              ? '📱 Mobile Web'
              : '💻 Web Browser'}
          </span>
          <span className="md:hidden text-[10px]">
            {envInfo.isMobileDevice || forcedViewMode === 'mobile' ? 'Mobile' : 'Web'}
          </span>
        </button>

        {/* Search Input */}
        {onGlobalSearchChange && (
          <div className="relative hidden lg:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Cari PO, PR, Vendor, Invoice..."
              value={globalSearch}
              onChange={e => onGlobalSearchChange(e.target.value)}
              className="w-48 xl:w-56 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400"
            />
          </div>
        )}

        {/* Refresh Button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="px-2.5 sm:px-3 py-1.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Refresh Data dari Google Sheets"
          >
            <RotateCw className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        )}

        {/* Theme Toggle */}
        {onToggleTheme && (
          <button
            onClick={() => onToggleTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-1.5 sm:p-2 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            title={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="p-1.5 sm:p-2 border border-slate-200 dark:border-slate-700 rounded-md text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors relative"
            title="Notifikasi"
          >
            <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-white dark:border-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Notifikasi System</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded font-semibold">Sistem Aktif</span>
              </div>
              <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                Semua pembaruan data dan status approval berjalan secara real-time.
              </div>
            </div>
          )}
        </div>

        {/* User Badge */}
        {currentUser && (
          <div className="pl-1.5 sm:pl-2 border-l border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-900 dark:bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
              {currentUser.name ? currentUser.name[0] : 'A'}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-none">{currentUser.name || currentUser.username}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">{currentUser.role || 'Administrator'}</div>
            </div>
          </div>
        )}
      </div>

      {/* Environment Info Modal */}
      {isEnvModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Auto Detect Environment & Device</h3>
              </div>
              <button
                onClick={() => setIsEnvModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status Platform Terdeteksi</div>
                <div className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{envInfo.label}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-sans block">Layar / Window</span>
                  <strong className="text-slate-800 dark:text-slate-200">{envInfo.screenWidth} x {envInfo.screenHeight} px</strong>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 font-sans block">Standalone / APK</span>
                  <strong className={envInfo.isMobileApkOrPwa ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}>
                    {envInfo.isMobileApkOrPwa ? 'Aktif (APK/PWA)' : 'Browser Standard'}
                  </strong>
                </div>
              </div>

              {onSetForcedViewMode && (
                <div className="pt-2">
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
                    Simulasi / Paksa Mode Tampilan Layout:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => onSetForcedViewMode('auto')}
                      className={`py-1.5 px-2 rounded-md font-semibold text-xs border transition-all ${
                        forcedViewMode === 'auto'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      Otomatis
                    </button>
                    <button
                      onClick={() => onSetForcedViewMode('mobile')}
                      className={`py-1.5 px-2 rounded-md font-semibold text-xs border transition-all ${
                        forcedViewMode === 'mobile'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      📱 Mobile APK
                    </button>
                    <button
                      onClick={() => onSetForcedViewMode('desktop')}
                      className={`py-1.5 px-2 rounded-md font-semibold text-xs border transition-all ${
                        forcedViewMode === 'desktop'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      💻 Desktop Web
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setIsEnvModalOpen(false)}
                className="px-4 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-bold hover:bg-slate-800 dark:hover:bg-slate-200"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

