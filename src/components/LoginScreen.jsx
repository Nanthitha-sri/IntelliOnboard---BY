import React, { useState } from 'react';
import { BRAND_LOGO } from '../data/mockData.js';
import { loadUsers, saveActiveUser } from '../data/userRoleStore.js';

export const LoginScreen = ({ onLoginSuccess }) => {
  const [usernameOrEmail, setUsernameOrEmail] = useState('12345@jdadelivers.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSignIn = (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const trimmedUser = (usernameOrEmail || '').trim();
    const trimmedPass = (password || '').trim();

    // Validate inputs
    if (!trimmedUser || !trimmedPass) {
      setErrorMessage('Unable to sign in. Please check your credentials and try again.');
      return;
    }

    setIsLoading(true);

    // Simulate authentication processing
    setTimeout(() => {
      const allUsers = loadUsers();
      const lowerInput = trimmedUser.toLowerCase();

      // Check for 12345@jdadelivers.com or standard user match
      let matchedUser = null;

      if (lowerInput.includes('12345') || lowerInput === '12345@jdadelivers.com') {
        matchedUser = {
          id: 'usr-jda-12345',
          name: 'JDA Delivers Admin',
          email: '12345@jdadelivers.com',
          role: 'Admin User',
          assignedCustomers: ['All Customers'],
          status: 'Active',
        };
      } else {
        // Find matching user by email, name, or username prefix
        matchedUser = allUsers.find((u) => {
          const uEmail = (u.email || '').toLowerCase();
          const uName = (u.name || '').toLowerCase();
          const uPrefix = uEmail.split('@')[0];
          return (
            uEmail === lowerInput ||
            uName === lowerInput ||
            uPrefix === lowerInput ||
            (lowerInput === 'admin' && u.role === 'Admin User')
          );
        });
      }

      // If not in the pre-defined list but non-empty credentials entered
      if (!matchedUser) {
        if (trimmedPass.length < 3) {
          setIsLoading(false);
          setErrorMessage('Unable to sign in. Please check your credentials and try again.');
          return;
        }

        // Create a compliant JDA Delivers session user
        matchedUser = {
          id: `usr-${Date.now()}`,
          name: trimmedUser.includes('@') ? trimmedUser.split('@')[0].replace('.', ' ') : trimmedUser,
          email: trimmedUser.includes('@') ? trimmedUser : `${trimmedUser}@jdadelivers.com`,
          role: 'Admin User',
          assignedCustomers: ['All Customers'],
          status: 'Active',
        };
      }

      // Store authenticated user
      saveActiveUser(matchedUser);

      // Store session token in localStorage
      try {
        const sessionData = {
          isAuthenticated: true,
          user: matchedUser,
          loginTime: new Date().toISOString(),
          provider: 'JDA Delivers',
        };
        localStorage.setItem('intellionboard_auth_session', JSON.stringify(sessionData));
      } catch (err) {
        console.error('Failed to write session:', err);
      }

      setIsLoading(false);
      onLoginSuccess(matchedUser);
    }, 600);
  };

  const handleQuickRoleSelect = (roleName, email, defaultPass = 'BlueYonder2026!') => {
    setUsernameOrEmail(email);
    setPassword(defaultPass);
    setErrorMessage('');
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-y-auto md:overflow-hidden font-sans antialiased selection:bg-[#c2e8ff] selection:text-[#001e2b] bg-white">
      {/* ============================================================== */}
      {/* LEFT PANEL: Blue Yonder & IntelliOnboard AI Branding (60% col) */}
      {/* ============================================================== */}
      <div className="w-full md:w-[58%] lg:w-[60%] h-auto md:h-full relative overflow-hidden bg-gradient-to-br from-[#003B6D] via-[#004B87] to-[#00A3E0] p-8 sm:p-12 lg:p-16 flex flex-col justify-between text-white select-none shrink-0">
        
        {/* Subtle Background Orbital / Connected-line Visual */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-60">
          <svg
            className="absolute -right-24 -top-24 w-[680px] h-[680px] lg:w-[820px] lg:h-[820px] text-white/10"
            viewBox="0 0 600 600"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Orbit */}
            <circle cx="300" cy="300" r="260" stroke="currentColor" strokeWidth="1.2" strokeDasharray="4 6" />
            {/* Mid Orbit */}
            <circle cx="300" cy="300" r="190" stroke="currentColor" strokeWidth="1.2" />
            {/* Inner Orbit */}
            <circle cx="300" cy="300" r="120" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
            
            {/* Connected Dots & Nodes */}
            <circle cx="300" cy="40" r="4.5" fill="white" fillOpacity="0.75" />
            <circle cx="110" cy="300" r="4" fill="white" fillOpacity="0.6" />
            <circle cx="434" cy="166" r="5" fill="#00B7F1" fillOpacity="0.85" />
            <circle cx="180" cy="420" r="3.5" fill="white" fillOpacity="0.5" />
            <circle cx="420" cy="420" r="4" fill="white" fillOpacity="0.65" />
            <circle cx="490" cy="300" r="3" fill="#BFE7FF" fillOpacity="0.7" />

            {/* Connecting Tangent Lines */}
            <line x1="300" y1="40" x2="434" y2="166" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
            <line x1="110" y1="300" x2="180" y2="420" stroke="white" strokeWidth="0.8" strokeOpacity="0.2" />
            <line x1="434" y1="166" x2="490" y2="300" stroke="white" strokeWidth="0.8" strokeOpacity="0.25" />
          </svg>
        </div>

        {/* Top: Blue Yonder Logo in pure White (from uploaded Blue_Yonder_w.png image asset) */}
        <div className="relative z-10">
          <img
            src="/assets/Blue_Yonder_w.png"
            alt="Blue Yonder"
            className="h-10 sm:h-12 lg:h-14 w-auto max-w-[280px] object-contain select-none"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Middle: IntelliOnboard AI Logo, Title, Tagline & Description */}
        <div className="relative z-10 my-8 sm:my-14">
          {/* Logo Badge + Titles */}
          <div className="flex items-center gap-5 sm:gap-6">
            {/* White Squircle Badge with Logo */}
            <div className="w-22 h-22 sm:w-26 sm:h-26 rounded-2xl sm:rounded-3xl bg-white p-3 shadow-[0_12px_36px_rgba(0,0,0,0.22)] border border-white/80 flex items-center justify-center shrink-0">
              <img
                src={BRAND_LOGO}
                alt="IntelliOnboard AI"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Title & Tagline */}
            <div>
              <h1
                style={{ fontFamily: 'Google Sans, sans-serif' }}
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-[54px] font-black text-white tracking-tight leading-[1.1]"
              >
                IntelliOnboard AI
              </h1>
              <p
                style={{ fontSize: '15px' }}
                className="text-[15px] font-semibold text-[#BFE7FF] tracking-wide mt-2"
              >
                Intelligent Customer Onboarding
              </p>
            </div>
          </div>

          {/* Description Paragraph */}
          <p
            style={{ fontSize: '14px' }}
            className="text-white/95 text-[14px] font-normal leading-relaxed mt-7 max-w-xl"
          >
            Transform customer onboarding from manual coordination into an intelligent, connected workflow powered by AI.
          </p>

          {/* Subtle Horizontal Accent Line */}
          <div className="h-px w-3/4 bg-gradient-to-r from-white/40 via-white/20 to-transparent mt-7" />
        </div>

        {/* Bottom Spacer / Ambient Enterprise Platform Note */}
        <div className="relative z-10 text-xs sm:text-sm lg:text-base font-medium text-white/70 tracking-wide">
          Enterprise Cloud Merchandising Operations Platform
        </div>
      </div>

      {/* ============================================================== */}
      {/* RIGHT PANEL: White Sign In Container (40% col)                 */}
      {/* ============================================================== */}
      <div className="w-full md:w-[42%] lg:w-[40%] h-full bg-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between overflow-y-auto shrink-0">
        <div className="w-full max-w-sm mx-auto my-auto">
          {/* Heading & Subheading */}
          <div className="mb-7">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937] tracking-tight">
              Sign In
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-1.5 flex items-center gap-1">
              <span>Sign in with your</span>
              <span className="text-[#9CA3AF] font-normal">JDA Delivers account</span>
            </p>
          </div>

          {/* Error Message Display */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-2 animate-in fade-in duration-200">
              <span className="material-symbols-outlined text-[18px] text-red-600 shrink-0 mt-0.5">
                error
              </span>
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Sign In Form */}
          <form onSubmit={handleSignIn} className="space-y-4 sm:space-y-5">
            {/* Field 1: USERNAME / EMAIL */}
            <div>
              <label
                htmlFor="login-username"
                className="block text-[11px] font-bold uppercase tracking-wider text-[#4B5563] mb-1.5"
              >
                USERNAME / EMAIL
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#9CA3AF] text-[20px] pointer-events-none">
                  person
                </span>
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  value={usernameOrEmail}
                  onChange={(e) => {
                    setUsernameOrEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Enter your username or email"
                  disabled={isLoading}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#00B7F1] focus:border-transparent focus:bg-white transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Field 2: PASSWORD */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-[11px] font-bold uppercase tracking-wider text-[#4B5563] mb-1.5"
              >
                PASSWORD
              </label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-[#9CA3AF] text-[20px] pointer-events-none">
                  lock
                </span>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Enter your password"
                  disabled={isLoading}
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#00B7F1] focus:border-transparent focus:bg-white transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  className="absolute right-3.5 text-[#9CA3AF] hover:text-[#4B5563] p-1 transition-colors cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Primary Action Button: Sign In */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-6 rounded-xl bg-gradient-to-r from-[#004B87] to-[#009FE3] hover:from-[#003B6D] hover:to-[#008CC9] text-white font-bold text-sm sm:text-[15px] shadow-[0_4px_16px_rgba(0,159,227,0.35)] hover:shadow-[0_6px_20px_rgba(0,159,227,0.45)] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <span className="material-symbols-outlined text-[18px]">
                      login
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Integrated Quick Test Roles */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex flex-col items-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Quick Test Roles
            </span>
            <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickRoleSelect('Admin User', '12345@jdadelivers.com')}
                className="px-2.5 py-1 rounded-md bg-white border border-[#00B7F1] text-[#004B87] font-semibold hover:bg-[#eff4ff] transition-colors cursor-pointer shadow-2xs"
              >
                12345@jdadelivers.com (Admin)
              </button>
              <button
                type="button"
                onClick={() => handleQuickRoleSelect('Power User', 'elena.rostova@blueyonder.com')}
                className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Power User
              </button>
              <button
                type="button"
                onClick={() => handleQuickRoleSelect('SME User', 'alex.vance@blueyonder.com')}
                className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                SME User
              </button>
              <button
                type="button"
                onClick={() => handleQuickRoleSelect('Edit Sheet User', 'marcus.brody@blueyonder.com')}
                className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Edit Sheet
              </button>
              <button
                type="button"
                onClick={() => handleQuickRoleSelect('Read-only User', 'rachel.adams@blueyonder.com')}
                className="px-2 py-1 rounded-md bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Read-only
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Branding */}
        <div className="pt-6 text-center">
          <p className="text-[11px] font-medium text-[#9CA3AF] select-none">
            © Blue Yonder • IntelliOnboard AI
          </p>
        </div>
      </div>
    </div>
  );
};
