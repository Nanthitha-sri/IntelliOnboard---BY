import React from 'react';
import { BRAND_LOGO } from '../data/mockData.js';

export const Sidebar = ({
  currentScreen,
  onNavigate,
  onCloseMobile,
  onToggleCollapse,
  currentUser,
  onLogout,
}) => {
  const role = currentUser?.role || 'Admin User';
  const isAdmin = role === 'Admin User';
  const canCreateOB = role === 'Admin User' || role === 'Power User';

  const allNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', visible: true },
    { id: 'start-new-ob', label: 'Start New OB', icon: 'add_circle_outline', visible: canCreateOB },
    { id: 'customer-onboarding', label: 'Customer Onboarding', icon: 'rocket_launch', visible: true },
    { id: 'customer-details', label: 'Customer Details', icon: 'business', visible: true },
    { id: 'server-details', label: 'Server Details', icon: 'dns', visible: true },
    { id: 'talk-with-ob', label: 'Talk with OB', icon: 'chat_bubble', visible: true },
    { id: 'learn', label: 'Learn', icon: 'menu_book', visible: true },
    { id: 'settings', label: 'Settings', icon: 'settings', visible: isAdmin },
  ];

  const visibleNavItems = allNavItems.filter((item) => item.visible);

  return (
    <aside className="h-screen w-[280px] bg-gradient-to-b from-[#004B87] to-[#00B7F1] flex flex-col justify-between shadow-[0_4px_20px_rgba(0,75,135,0.18)] select-none">
      <div className="flex flex-col">
        {/* Brand Header */}
        <div className="h-[72px] px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              alt="IntelliOnboard AI Logo"
              className="h-8 w-auto object-contain rounded"
              src={BRAND_LOGO}
              onError={(e) => {
                e.target.src =
                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>';
              }}
            />
            <div className="flex flex-col">
              <span className="text-[17px] text-white font-bold tracking-tight leading-tight">
                IntelliOnboard AI
              </span>
              <span className="text-[11px] text-[#c2e8ff] tracking-wider uppercase opacity-90 font-semibold">
                CATMAN Cloud Ops
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Desktop Collapse / Hide Button */}
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-white/80 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
                title="Hide Sidebar (Ctrl+B)"
                aria-label="Hide Sidebar"
              >
                <span className="material-symbols-outlined text-[20px]">first_page</span>
              </button>
            )}

            {/* Mobile Close Button */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/15 cursor-pointer"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="px-4 py-2">
          <div className="h-px w-full bg-white/15"></div>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5 px-3">
          {visibleNavItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg transition-all text-left w-full cursor-pointer ${
                  isActive
                    ? 'bg-white/20 text-white font-semibold border-l-4 border-white shadow-[0_2px_8px_rgba(0,0,0,0.12)]'
                    : 'text-white/80 hover:bg-white/15 hover:text-white'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                <span className="text-[14px] leading-tight">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Authenticated User Session & Logout Action */}
      <div className="p-3 border-t border-white/15 bg-black/10">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-white/20 border border-white/30 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {(currentUser?.name || 'U').charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-white truncate leading-tight">
                {currentUser?.name || 'Test User'}
              </p>
              <p className="text-[10px] text-white/70 truncate">
                {currentUser?.role || 'Admin User'}
              </p>
            </div>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer shrink-0"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
