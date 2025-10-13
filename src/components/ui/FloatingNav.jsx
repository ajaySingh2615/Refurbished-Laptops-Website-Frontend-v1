import React from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import CartIcon from '../cart/CartIcon.jsx';

export function FloatingNav({ navItems, onLoginClick, onRegisterClick, className = '' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = React.useState(false);
  const profileRef = React.useRef(null);
  const { scrollY } = useScroll();
  const visibleRef = React.useRef(true);
  const lastYRef = React.useRef(0);
  const [visible, setVisible] = React.useState(true);

  // Ensure visible on mount
  React.useEffect(() => {
    visibleRef.current = true;
    setVisible(true);
  }, []);

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const current = Number(latest || 0);
    const prev = lastYRef.current;
    const diff = current - prev;
    lastYRef.current = current;

    // Always show near the very top
    if (current < 80) {
      if (!visibleRef.current) {
        visibleRef.current = true;
        setVisible(true);
      }
      return;
    }

    // Ignore tiny scroll jitter
    if (Math.abs(diff) < 4) return;

    // Hide on scroll down, show on scroll up
    const nextVisible = diff < 0;
    if (nextVisible !== visibleRef.current) {
      visibleRef.current = nextVisible;
      setVisible(nextVisible);
    }
  });

  React.useEffect(() => {
    function onDocClick(e) {
      if (!profileOpen) return;
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') setProfileOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      window.removeEventListener('keydown', onKey);
    };
  }, [profileOpen]);

  return (
    <motion.nav
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -100 }}
      transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.6 }}
      className={
        'fixed top-2 sm:top-4 left-1/2 -translate-x-1/2 w-[calc(100%-16px)] sm:w-auto rounded-full bg-white/90 backdrop-blur border border-white/60 shadow-[0_2px_10px_rgba(0,0,0,0.08)] z-50 px-2 sm:px-3 py-2 ' +
        className
      }
      aria-label="Main Navigation"
    >
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Links scroller */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar whitespace-nowrap px-1 sm:px-2">
            {navItems?.map((item, idx) => (
              <Link
                key={idx}
                to={item.link}
                className="group relative text-slate-700/90 hover:text-slate-900 text-[13px] sm:text-sm px-2 py-1 transition-colors"
              >
                <span className="relative">
                  {item.name}
                  <span className="pointer-events-none absolute left-0 right-0 -bottom-1 mx-auto h-px w-0 bg-gradient-to-r from-blue-500 via-fuchsia-500 to-purple-600 transition-all duration-200 group-hover:w-full" />
                </span>
              </Link>
            ))}
          </div>
        </div>
        {/* Actions */}
        <div className="relative flex items-center gap-2 pl-1 sm:pl-2">
          {/* Cart Icon */}
          <CartIcon className="text-slate-600 hover:text-slate-900" />

          {!user ? (
            <>
              <button
                onClick={() => (onLoginClick ? onLoginClick() : navigate('/login'))}
                className="inline-flex h-9 items-center justify-center cursor-pointer border text-[13px] sm:text-sm font-medium border-slate-200 text-slate-700 px-3 sm:px-4 rounded-full bg-white hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400/40 active:scale-[0.99] transition-colors"
                aria-label="Login"
              >
                Login
              </button>
              <button
                onClick={() => (onRegisterClick ? onRegisterClick() : navigate('/register'))}
                className="inline-flex h-9 items-center justify-center cursor-pointer group text-[13px] sm:text-sm font-semibold relative text-white px-4 sm:px-5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow transition-colors hover:from-blue-600/95 hover:to-purple-600/95 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400/40 active:scale-[0.99]"
                aria-label="Register"
              >
                <span>Register</span>
                <span className="pointer-events-none absolute -inset-0.5 rounded-full bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-purple-600/0 blur opacity-0 group-hover:opacity-40 transition" />
              </button>
            </>
          ) : (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen((v) => !v)}
                className="group inline-flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-full border border-slate-200 bg-white/90 backdrop-blur hover:bg-white transition shadow-sm"
                aria-label="Open profile menu"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-semibold">
                  {(user.name || user.email || '?').toString().trim().charAt(0).toUpperCase()}
                </span>
                <span className="hidden sm:block text-sm text-slate-700 max-w-[140px] truncate">
                  {user.name || user.email}
                </span>
                <svg
                  className={`h-4 w-4 text-slate-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white/95 backdrop-blur shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50/70">
                    <div className="text-[11px] text-slate-500">Signed in as</div>
                    <div className="text-sm font-medium text-slate-800 truncate">{user.email}</div>
                  </div>
                  <Link
                    to="/orders"
                    onClick={() => setProfileOpen(false)}
                    className="block w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    My Orders
                  </Link>
                  <Link
                    to="/profile"
                    onClick={() => setProfileOpen(false)}
                    className="block w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Profile
                  </Link>
                  <div className="h-px bg-slate-200" />
                  <button
                    onClick={() => {
                      setProfileOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
