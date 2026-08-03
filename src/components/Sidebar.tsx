import React, { useState } from 'react';
import {
  BarChart3,
  ClipboardList,
  ShoppingCart,
  FileText,
  Receipt,
  Truck,
  Building2,
  CheckSquare,
  Bot,
  Sparkles,
  FileBarChart,
  UserCircle,
  Code2,
  ChevronLeft,
  RotateCw,
  LogOut,
  User
} from 'lucide-react';
import { User as UserType } from '../types';

interface SidebarProps {
  isMini?: boolean;
  onToggleMini?: () => void;
  activeSec?: string;
  activeSection?: string;
  onNavigate?: (sec: string) => void;
  onSelectSection?: (sec: string) => void;
  currentUser?: UserType | null;
  onLogout?: () => void;
  onRefreshAll?: () => void;
  profilePhotoUrl?: string;
  pendingApprovalsCount?: number;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: number;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMini: propIsMini = false,
  onToggleMini: propOnToggleMini,
  activeSec,
  activeSection,
  onNavigate,
  onSelectSection,
  currentUser,
  onLogout,
  onRefreshAll,
  profilePhotoUrl,
  pendingApprovalsCount = 0,
  isMobileOpen = false,
  onCloseMobile
}) => {
  const [internalMini, setInternalMini] = useState(false);
  const isMini = propOnToggleMini ? propIsMini : internalMini;
  const toggleMini = propOnToggleMini || (() => setInternalMini(!internalMini));

  const currentActive = activeSection || activeSec || 'dashboard';
  const handleSelect = (id: string) => {
    if (onSelectSection) onSelectSection(id);
    if (onNavigate) onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  const mainNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'purchase-request', label: 'Purchase Request', icon: ClipboardList },
    { id: 'purchase-order', label: 'Purchase Order', icon: ShoppingCart },
    { id: 'quotation', label: 'Quotation', icon: FileText },
    { id: 'invoice', label: 'Invoice', icon: Receipt },
  ];

  const opsNav: NavItem[] = [
    { id: 'delivery-status', label: 'Delivery Status', icon: Truck },
    { id: 'supplier', label: 'Supplier / Vendor', icon: Building2 },
    {
      id: 'approvals',
      label: 'Approval System',
      icon: CheckSquare,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined
    },
    { id: 'ai-agent', label: 'Chat Bot - BMS Agent AI', icon: Bot, highlight: true },
  ];

  const sysNav: NavItem[] = [
    { id: 'report', label: 'Report & Export', icon: FileBarChart },
    { id: 'account', label: 'Account Settings', icon: UserCircle },
  ];

  const renderNavGroup = (title: string, items: NavItem[]) => (
    <>
      {!isMini && (
        <div className="px-5 py-2 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
          {title}
        </div>
      )}
      {items.map(item => {
        const Icon = item.icon;
        const isActive = currentActive === item.id || (item.id === 'purchase-request' && currentActive === 'purchase-requests') || (item.id === 'purchase-order' && currentActive === 'purchase-orders') || (item.id === 'delivery-status' && currentActive === 'status') || (item.id === 'supplier' && currentActive === 'suppliers') || (item.id === 'ai-agent' && (currentActive === 'media' || currentActive === 'extra' || currentActive === 'chat-bot' || currentActive === 'ai-agent'));
        return (
          <a
            key={item.id}
            className={`flex items-center gap-3 px-5 py-2.5 text-xs font-medium cursor-pointer transition-all relative ${
              isActive
                ? 'bg-blue-600 text-white font-semibold shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
            onClick={() => handleSelect(item.id)}
            title={item.label}
          >
            {isActive && <span className="w-1.5 h-3.5 rounded-full bg-white shrink-0"></span>}
            <Icon className="w-4 h-4 shrink-0" />
            {!isMini && (
              <span className="flex-1 flex items-center justify-between truncate">
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="bg-amber-500 text-slate-900 text-[10px] font-bold px-1.5 py-0.2 rounded font-mono">
                    {item.badge}
                  </span>
                )}
              </span>
            )}
            {isMini && item.badge !== undefined && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full animate-ping" />
            )}
          </a>
        );
      })}
    </>
  );

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        id="sidebar"
        className={`${isMini ? 'mini' : ''} ${
          isMobileOpen ? 'mobile-open' : ''
        }`}
      >
      <button className="sb-toggle" onClick={toggleMini} title="Toggle sidebar">
        <ChevronLeft className={`w-3.5 h-3.5 transition-transform ${isMini ? 'rotate-180' : ''}`} />
      </button>

      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-800 bg-slate-900">
        <img
          src="https://docs.google.com/drawings/d/e/2PACX-1vT3QpvI0MKSmDoilYUG7si-kizLx9UxTgcTLj18ueAQ4XHfRrNlrxOhQLmtJUgrXu623dC0Ek3qeeLZ/pub?w=480&h=360"
          alt="Purchasing Logo"
          className="w-8 h-8 rounded object-cover shrink-0 shadow-sm bg-white p-0.5"
          referrerPolicy="no-referrer"
        />
        {!isMini && (
          <div className="min-w-0">
            <h1 className="text-white font-bold tracking-tight text-lg italic leading-none mb-1">
              Purchasing
            </h1>
            <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase opacity-70 truncate">
              PT. Berkatama Mulia Saputra
            </p>
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {renderNavGroup('Main Menu', mainNav)}
        <div className="my-2 border-t border-slate-800/60"></div>
        {renderNavGroup('Operations', opsNav)}
        <div className="my-2 border-t border-slate-800/60"></div>
        {renderNavGroup('System & Reports', sysNav)}
      </nav>

      {/* Refresh Data Shortcut */}
      {onRefreshAll && (
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={onRefreshAll}
            className="w-full py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded border border-slate-700 flex items-center justify-center gap-2 transition-colors"
            title="Refresh Data dari Spreadsheet"
          >
            <RotateCw className="w-3.5 h-3.5 text-blue-400" />
            {!isMini && <span>Refresh Sheets</span>}
          </button>
        </div>
      )}

      {/* User Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 text-xs font-bold shrink-0">
            {currentUser?.name ? currentUser.name[0] : 'A'}
          </div>
          {!isMini && (
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-xs leading-none truncate mb-1">
                {currentUser?.name || currentUser?.username || 'Admin User'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {currentUser?.role || 'Procurement Dept.'}
              </p>
            </div>
          )}
          {!isMini && onLogout && (
            <button
              className="text-slate-500 hover:text-rose-400 p-1.5 rounded transition-colors"
              onClick={onLogout}
              title="Keluar"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </aside>
    </>
  );
};
