import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { HiUserGroup, HiRefresh, HiLocationMarker, HiStar } from 'react-icons/hi';

/**
 * KPISection – polished, production‑ready stats section
 * - Elegant animated background (grid, glows, gradient orbs)
 * - Staggered reveal with spring; count‑up numbers (prefers‑reduced‑motion aware)
 * - Subtle hover parallax + magnetic cursor tilt
 * - Accessible, responsive, and themable with Tailwind
 *
 * Requirements: tailwindcss, framer-motion, react-icons
 * Usage: <KPISection />
 */

export default function KPISection({ scrollY }) {
  const items = useMemo(
    () => [
      {
        icon: <HiUserGroup className="w-6 h-6" />,
        label: 'Happy Customers',
        valueTo: 200000,
        suffix: '+',
      },
      {
        icon: <HiRefresh className="w-6 h-6" />,
        label: 'Devices Refurbished',
        valueTo: 500000,
        suffix: '+',
      },
      {
        icon: <HiLocationMarker className="w-6 h-6" />,
        label: 'Cities Covered',
        valueTo: 120,
      },
      {
        icon: <HiStar className="w-6 h-6" />,
        label: 'Avg. Rating',
        valueTo: 4.7,
        decimals: 1,
      },
    ],
    [],
  );

  return (
    <section className="kpi-section relative overflow-hidden py-14 md:py-16">
      {/* BACKGROUND LAYERS */}
      <AnimatedBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section header (optional) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 90, damping: 14 }}
          className="mx-auto mb-8 md:mb-10 max-w-2xl text-center"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
            Numbers that prove our impact
          </h2>
        </motion.div>

        {/* KPI GRID */}
        <motion.ul
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={containerStagger}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5"
          aria-label="Key performance indicators"
        >
          {items.map((it, i) => (
            <li key={i}>
              <KPICard {...it} index={i} />
            </li>
          ))}
        </motion.ul>
      </div>
    </section>
  );
}

// Also provide a named export for compatibility with existing imports
export { KPISection };

/* ---------------------------- Subcomponents ---------------------------- */

function KPICard({ icon, label, valueTo, suffix = '', decimals = 0, index = 0 }) {
  const [ref, inView] = useInViewOnce({
    threshold: 0.3,
    rootMargin: '0px 0px -10% 0px',
  });
  const prefersReduced = useReducedMotion();
  const [value, setValue] = useState(0);

  // Count up animation
  useEffect(() => {
    if (!inView) return;
    if (prefersReduced) {
      setValue(valueTo);
      return;
    }
    const duration = 1000; // ms
    const start = performance.now();
    const from = 0;
    const to = valueTo;

    let raf = 0;
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      // fast-out, slow-in cubic
      const eased = 1 - Math.pow(1 - p, 3);
      const current = from + (to - from) * eased;
      setValue(current);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, prefersReduced, valueTo]);

  // Magnetic hover (parallax tilt)
  const cardRef = useRef(null);
  useMagneticTilt(cardRef);

  return (
    <motion.div
      ref={cardRef}
      variants={itemSlide(index)}
      className="group relative p-5 md:p-6 text-center hover:-translate-y-0.5 transition-transform will-change-transform"
    >
      <div ref={ref}>
        <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/10 to-sky-100 text-blue-600">
          {icon}
        </div>
        <div className="text-[13px] md:text-sm text-gray-600">{label}</div>
        <div className="mt-1 text-3xl md:text-4xl font-black tracking-tight text-gray-900 tabular-nums">
          {value.toFixed(decimals)}
          {suffix}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------ Animations ----------------------------- */

const containerStagger = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

function itemSlide(i) {
  const dir = i % 2 === 0 ? 1 : -1;
  return {
    hidden: { opacity: 0, y: 16, x: 8 * dir },
    show: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: { type: 'spring', stiffness: 120, damping: 14 },
    },
  };
}

/* --------------------------- Intersection Hook ------------------------- */
function useInViewOnce(opts) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current || inView) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            io.disconnect();
            break;
          }
        }
      },
      opts ?? { threshold: 0.25 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, [opts, inView]);

  return [ref, inView];
}

/* ----------------------------- Magnetic Tilt --------------------------- */
function useMagneticTilt(ref) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = (e.clientX - cx) / (r.width / 2);
      const dy = (e.clientY - cy) / (r.height / 2);
      const rotX = dy * -4; // tilt up/down
      const rotY = dx * 6; // tilt left/right
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      });
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)';
    };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mousemove', onMove);
      el.removeEventListener('mouseleave', onLeave);
      cancelAnimationFrame(raf);
    };
  }, [ref]);
}

/* --------------------------- Animated Background ----------------------- */
function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ backgroundColor: '#f8f6f3' }}
    />
  );
}
