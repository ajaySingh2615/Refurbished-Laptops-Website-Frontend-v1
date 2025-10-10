import React from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export function FloatingNav({ navItems, onLoginClick, onRegisterClick, className = '' }) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: visible ? 1 : 0, y: visible ? 0 : -100 }}
      transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.6 }}
      className={
        'hidden md:flex max-w-fit fixed top-4 inset-x-0 mx-auto rounded-full bg-white/90 backdrop-blur border border-white/60 shadow-[0_2px_10px_rgba(0,0,0,0.08)] z-50 pr-2 pl-6 py-2 items-center justify-center gap-4 ' +
        className
      }
    >
      {navItems?.map((item, idx) => (
        <a key={idx} href={item.link} className="text-slate-700 hover:text-slate-900 text-sm px-2">
          {item.name}
        </a>
      ))}
      <div className="h-5 w-px bg-slate-200" />
      <button
        onClick={onLoginClick}
        className="border text-sm font-medium relative border-slate-200 text-slate-900 px-4 py-1.5 rounded-full hover:bg-slate-50"
      >
        <span>Login</span>
        <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent h-px" />
      </button>
      <button
        onClick={onRegisterClick}
        className="text-sm font-semibold relative text-white px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow hover:opacity-95"
      >
        <span>Register</span>
      </button>
    </motion.div>
  );
}
