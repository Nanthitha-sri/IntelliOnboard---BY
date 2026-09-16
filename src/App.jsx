import React, { useState, useEffect } from 'react';
import { INITIAL_PROJECTS } from './data/mockData.js';
import { loadActiveUser, saveActiveUser, hasAreaPermission, ROLE_DETAILS } from './data/userRoleStore.js';
import { Sidebar } from './components/Sidebar.jsx';
import { Header } from './components/Header.jsx';
import { DashboardScreen } from './components/DashboardScreen.jsx';
import { StartNewOBScreen } from './components/StartNewOBScreen.jsx';
import { CustomerOnboardingScreen } from './components/CustomerOnboardingScreen.jsx';
import { CustomerDetailsScreen } from './components/CustomerDetailsScreen.jsx';
import { ServerDetailsScreen } from './components/ServerDetailsScreen.jsx';
import { TalkWithOBScreen } from './components/TalkWithOBScreen.jsx';
import { LearnScreen } from './components/LearnScreen.jsx';
import { SettingsScreen } from './components/SettingsScreen.jsx';
import { FloatingAssistant } from './components/FloatingAssistant.jsx';
import { LoginScreen } from './components/LoginScreen.jsx';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [projects, setProjects] = useState(INITIAL_PROJECTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState('Customer 1');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(() => {
    try {
      const saved = localStorage.getItem('intellionboard_sidebar_visible');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Centralized Active User & RBAC State
  const [currentUser, setCurrentUser] = useState(() => loadActiveUser());

  // Application Authentication & Session State
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const rawSession = localStorage.getItem('intellionboard_auth_session');
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        return Boolean(parsed?.isAuthenticated);
      }
    } catch (e) {
      console.error('Failed to load session:', e);
    }
    return false;
  });

  const handleLoginSuccess = (user) => {
    if (user) {
      setCurrentUser(user);
    }
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('intellionboard_auth_session');
    } catch (e) {}
    setIsAuthenticated(false);
    setCurrentScreen('dashboard');
  };

  const handleRoleChange = (newRole) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, role: newRole };
      saveActiveUser(updated);
      return updated;
    });
  };

  const handleUserChange = (user) => {
    setCurrentUser(user);
    saveActiveUser(user);
  };

  const toggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileSidebarOpen((prev) => !prev);
    } else {
      setIsSidebarVisible((prev) => {
        const next = !prev;
        try {
          localStorage.setItem('intellionboard_sidebar_visible', String(next));
        } catch {}
        return next;
      });
    }
  };

  // Keyboard shortcut: Ctrl+B or Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Guard routes if role is changed or screen isn't permitted
  useEffect(() => {
    if (currentScreen === 'settings' && currentUser?.role !== 'Admin User') {
      setCurrentScreen('dashboard');
    }
    if (currentScreen === 'start-new-ob' && !['Admin User', 'Power User'].includes(currentUser?.role)) {
      setCurrentScreen('customer-onboarding');
    }
  }, [currentUser?.role, currentScreen]);

  // Navigation handler with optional data payload
  const handleNavigate = (screen, data) => {
    // Access control checks before navigating
    if (screen === 'settings' && currentUser?.role !== 'Admin User') {
      return;
    }
    if (screen === 'start-new-ob' && !['Admin User', 'Power User'].includes(currentUser?.role)) {
      setCurrentScreen('customer-onboarding');
      return;
    }

    setCurrentScreen(screen);
    if (data?.customer) {
      setSelectedCustomer(data.customer);
    } else if (data?.customerName) {
      setSelectedCustomer(data.customerName);
    }
    setMobileSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add new onboarding project from Step 4 launch
  const handleAddProject = (newProject) => {
    setProjects((prev) => [newProject, ...prev]);
  };

  // If unauthenticated, show the IntelliOnboard AI Login Screen as the application's Home
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F5FAFD] flex text-[#121c2a] font-sans antialiased selection:bg-[#c2e8ff] selection:text-[#001e2b]">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container (Collapsible on Desktop, Drawer on Mobile) */}
      <div
        className={`fixed top-0 bottom-0 left-0 z-50 transition-transform duration-300 ease-in-out ${
          isSidebarVisible ? 'lg:translate-x-0' : 'lg:-translate-x-full'
        } ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          currentUser={currentUser}
          onLogout={handleLogout}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          onToggleCollapse={() => {
            setIsSidebarVisible(false);
            try {
              localStorage.setItem('intellionboard_sidebar_visible', 'false');
            } catch {}
          }}
        />
      </div>

      {/* Tiny Quick Reveal Button when Sidebar is Hidden on Desktop */}
      {!isSidebarVisible && (
        <button
          onClick={() => {
            setIsSidebarVisible(true);
            try {
              localStorage.setItem('intellionboard_sidebar_visible', 'true');
            } catch {}
          }}
          className="hidden lg:flex fixed left-0 top-20 z-40 bg-[#004B87]/90 hover:bg-[#004B87] text-white w-5 h-8 rounded-r flex items-center justify-center shadow-md transition-colors cursor-pointer"
          title="Show Sidebar (Ctrl+B)"
          aria-label="Show Sidebar"
        >
          <span className="material-symbols-outlined text-[16px]">
            chevron_right
          </span>
        </button>
      )}

      {/* Main Content Area (Offset by 280px sidebar width on lg screens when visible) */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarVisible ? 'lg:pl-[280px]' : 'lg:pl-0'
        }`}
      >
        {/* Global Header */}
        <Header
          currentScreen={currentScreen}
          onNavigate={handleNavigate}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isSidebarVisible={isSidebarVisible}
          onToggleSidebar={toggleSidebar}
          currentUser={currentUser}
          onRoleChange={handleRoleChange}
          onLogout={handleLogout}
        />

        {/* Dynamic Screen View */}
        <main className="flex-1 w-full flex flex-col">
          {currentUser?.role === 'No Role' ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[60vh]">
              <div className="bg-white border border-[#d3e4ff] rounded-2xl p-8 max-w-lg text-center shadow-[0_8px_30px_rgba(0,75,135,0.08)]">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
                  <span className="material-symbols-outlined text-[36px]">lock_person</span>
                </div>
                <h2 className="text-xl font-black text-[#121c2a] mb-2">Access Restricted: No Role Assigned</h2>
                <p className="text-xs text-[#6d7980] leading-relaxed mb-6">
                  Your account currently does not have an active assigned role in IntelliOnboard AI. Access to all features and onboarding data is locked until an administrator grants permissions.
                </p>
                <div className="p-3 bg-[#f8fbfe] border border-[#e6eeff] rounded-xl text-left mb-6">
                  <div className="text-[11px] font-bold text-[#004B87] uppercase tracking-wider mb-1">
                    Simulation Role Switcher
                  </div>
                  <p className="text-[11px] text-[#6d7980] mb-3">
                    Switch to an active role to resume testing the application:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['Admin User', 'Power User', 'SME User', 'Read-only User'].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => handleRoleChange(role)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-[#eff4ff] text-[#004B87] border border-[#d3e4ff] shadow-2xs cursor-pointer transition-colors"
                      >
                        Set {role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {currentScreen === 'dashboard' && (
                <DashboardScreen
                  projects={projects}
                  onNavigate={handleNavigate}
                  searchQuery={searchQuery}
                  currentUser={currentUser}
                />
              )}

              {currentScreen === 'start-new-ob' && (
                <StartNewOBScreen
                  onNavigate={handleNavigate}
                  onAddProject={handleAddProject}
                />
              )}

              {currentScreen === 'customer-onboarding' && (
                <CustomerOnboardingScreen
                  projects={projects}
                  onNavigate={handleNavigate}
                  searchQuery={searchQuery}
                  currentUser={currentUser}
                  onRoleChange={handleRoleChange}
                />
              )}

              {currentScreen === 'customer-details' && (
                <CustomerDetailsScreen
                  projects={projects}
                  onNavigate={handleNavigate}
                  selectedCustomer={selectedCustomer}
                  currentUser={currentUser}
                  onRoleChange={handleRoleChange}
                />
              )}

              {currentScreen === 'server-details' && (
                <ServerDetailsScreen
                  onNavigate={handleNavigate}
                  searchQuery={searchQuery}
                  selectedCustomer={selectedCustomer}
                  currentUser={currentUser}
                  onRoleChange={handleRoleChange}
                />
              )}

              {currentScreen === 'talk-with-ob' && (
                <TalkWithOBScreen onNavigate={handleNavigate} />
              )}

              {currentScreen === 'learn' && (
                <LearnScreen onNavigate={handleNavigate} />
              )}

              {currentScreen === 'settings' && (
                <SettingsScreen
                  onNavigate={handleNavigate}
                  currentUser={currentUser}
                  onUserChange={handleUserChange}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Floating Bottom-Right Assistant Widget */}
      <FloatingAssistant onNavigate={handleNavigate} />
    </div>
  );
}
