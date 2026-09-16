import React, { useState } from 'react';
import { BRAND_LOGO, USER_AVATAR } from '../data/mockData.js';
import { ROLES, ROLE_DETAILS } from '../data/userRoleStore.js';

export const Header = ({
  currentScreen,
  onNavigate,
  searchQuery,
  onSearchChange,
  isSidebarVisible,
  onToggleSidebar,
  currentUser,
  onRoleChange,
  onLogout,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const screenTitles = {
    dashboard: 'Operations Suite',
    'start-new-ob': 'Pipeline Intake',
    'customer-onboarding': 'Onboarding Workspace',
    'customer-details': 'Customer Accounts',
    'server-details': 'Compute Infrastructure',
    'talk-with-ob': 'AI Operations Assistant',
    learn: 'CATMAN Knowledge Base',
    settings: 'Settings & Administration',
  };

  const notifications = [
    { id: '1', title: 'New upgrade project created', target: 'Customer 1', time: '20 mins ago', unread: true },
    { id: '2', title: 'SOW uploaded & validated', target: 'Customer 2', time: '1 hour ago', unread: true },
    { id: '3', title: 'TEST Cluster container build healthy', target: 'Customer 1-2026-UPG', time: '2 hours ago', unread: false },
    { id: '4', title: 'Legacy Host scheduled sunset', target: '6 days remaining', time: '1 day ago', unread: false },
  ];

  const currentRole = currentUser?.role || 'Admin User';
  const roleDetail = ROLE_DETAILS[currentRole] || ROLE_DETAILS['No Role'];
  const userName = currentUser?.name || 'Test User';
  const userEmail = currentUser?.email || 'test.user@blueyonder.com';
  const isAdmin = currentRole === 'Admin User';

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,75,135,0.06)] flex items-center justify-between px-4 sm:px-8 h-[72px] border-b border-[#E5E7EB]/60 w-full">
      {/* Breadcrumb Title & Brand Logo */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 hover:opacity-85 transition-opacity text-left cursor-pointer"
        >
          <img
            alt="IntelliOnboard AI"
            className="h-7 w-auto object-contain rounded"
            src={BRAND_LOGO}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <span className="text-[17px] text-[#27609d] font-bold hidden sm:inline">IntelliOnboard AI</span>
        </button>
        <span className="text-[#bcc8d0] font-normal hidden sm:inline">/</span>
        <span className="text-[14px] text-[#3d484f] font-medium truncate max-w-[140px] sm:max-w-none">
          {screenTitles[currentScreen] || 'Operations'}
        </span>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-xl mx-3 sm:mx-6">
        <div className="relative flex items-center">
          <span className="material-symbols-outlined absolute left-3.5 text-[#6d7980] text-[20px]">
            search
          </span>
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#eff4ff] border-0 rounded-xl text-[14px] text-[#121c2a] placeholder:text-[#6d7980] focus:outline-none focus:ring-2 focus:ring-[#00b7f1] shadow-inner transition-all"
            placeholder="Search customers, projects, servers, agreements..."
            type="text"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 text-[#6d7980] hover:text-[#121c2a] text-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Right Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
            className="relative p-2 rounded-lg text-[#3d484f] hover:bg-[#eff4ff] hover:text-[#121c2a] transition-colors cursor-pointer"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00b7f1] rounded-full ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,75,135,0.15)] border border-[#e6eeff] p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-[#e6eeff]">
                <span className="text-sm font-bold text-[#121c2a]">Notifications</span>
                <span className="text-xs text-[#006688] font-semibold">2 unread</span>
              </div>
              <div className="divide-y divide-[#e6eeff]/60 max-h-72 overflow-y-auto mt-2">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 px-1 hover:bg-[#eff4ff]/60 rounded-lg transition-colors cursor-pointer">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#121c2a]">{n.title}</span>
                      {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-[#00b7f1]"></span>}
                    </div>
                    <p className="text-[11px] text-[#3d484f] mt-0.5">{n.target}</p>
                    <span className="text-[10px] text-[#6d7980]">{n.time}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 mt-2 border-t border-[#e6eeff] text-center">
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-[#006688] hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-full hover:bg-[#eff4ff] transition-colors cursor-pointer"
          >
            <img
              alt={userName}
              className="w-8 h-8 rounded-full object-cover shadow-[0_2px_6px_rgba(0,75,135,0.15)] border border-white"
              src={USER_AVATAR}
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';
              }}
            />
            <span className="hidden xl:inline text-[14px] text-[#121c2a] font-medium pr-1">
              {userName}
            </span>
            <span className="material-symbols-outlined text-[16px] text-[#6d7980]">
              expand_more
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-[0_10px_30px_rgba(0,75,135,0.18)] border border-[#e6eeff] p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-[#e6eeff]">
                <p className="text-xs font-bold text-[#121c2a]">{userName}</p>
                <p className="text-[11px] text-[#6d7980] truncate font-mono">{userEmail}</p>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${roleDetail.badgeClass}`}>
                    {currentRole}
                  </span>
                  <span className="text-[10px] text-[#15803d] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></span>
                    Active
                  </span>
                </div>
              </div>

              {/* Quick Role Simulator for testing RBAC */}
              <div className="mt-2.5 px-3 py-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-[#6d7980] font-bold">
                    Simulate Access Role
                  </span>
                </div>
                <div className="space-y-1">
                  {ROLES.map((role) => {
                    const isSelected = currentRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          if (onRoleChange) onRoleChange(role);
                          setShowUserMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[#eff4ff] text-[#004B87] font-bold'
                            : 'text-[#3d484f] hover:bg-[#f8fbfe]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSelected ? 'bg-[#004B87]' : 'bg-[#cbd5e1]'
                            }`}
                          />
                          <span>{role}</span>
                        </div>
                        {isSelected && (
                          <span className="material-symbols-outlined text-[14px] text-[#004B87]">
                            check
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-[#e6eeff] space-y-1">
                {isAdmin && (
                  <button
                    onClick={() => {
                      onNavigate('settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#004B87] hover:bg-[#eff4ff] flex items-center gap-2 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                    User Management & Settings
                  </button>
                )}
                <button
                  onClick={() => {
                    onNavigate('learn');
                    setShowUserMenu(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-[#3d484f] hover:bg-[#eff4ff] flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">school</span>
                  Learning Hub
                </button>

                {onLogout && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 cursor-pointer transition-colors border-t border-slate-100 mt-1 pt-2"
                  >
                    <span className="material-symbols-outlined text-[16px] text-red-500">logout</span>
                    Sign Out
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
