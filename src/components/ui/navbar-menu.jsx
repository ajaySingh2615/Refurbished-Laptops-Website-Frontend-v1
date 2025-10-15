'use client';
import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const transition = {
  type: 'spring',
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({ setActive, active, item, children }) => {
  const buttonRef = useRef(null);
  const touchHandledRef = useRef(false);

  const handleClick = (e) => {
    // If touch was already handled, ignore the click event
    if (touchHandledRef.current) {
      touchHandledRef.current = false;
      return;
    }

    e.stopPropagation();
    // Toggle dropdown on mobile (click)
    if (active === item) {
      setActive(null);
    } else {
      setActive(item);
    }
  };

  const handleMouseEnter = () => {
    // Only use hover on desktop (not mobile)
    if (window.innerWidth >= 640) {
      // sm breakpoint
      setActive(item);
    }
  };

  const handleTouchStart = (e) => {
    e.stopPropagation();

    // Mark that touch was handled to prevent click event
    touchHandledRef.current = true;

    // Toggle dropdown on touch
    if (active === item) {
      setActive(null);
    } else {
      setActive(item);
    }
  };

  return (
    <div ref={buttonRef} onMouseEnter={handleMouseEnter} className="relative z-50" data-dropdown>
      <motion.p
        transition={{ duration: 0.3 }}
        className="cursor-pointer text-slate-700 hover:text-slate-900 text-[13px] sm:text-sm px-2 py-1"
        onClick={handleClick}
        onTouchStart={handleTouchStart}
      >
        {item}
      </motion.p>
      {active === item && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={transition}
          onMouseEnter={() => setActive(item)}
          className="fixed sm:absolute z-[9999] top-[60px] sm:top-0 left-1/2 transform -translate-x-1/2 sm:pt-12"
          style={{ minWidth: '200px' }}
        >
          <motion.div
            transition={transition}
            layoutId="active"
            className="bg-white/90 backdrop-blur border border-white/60 shadow-[0_2px_10px_rgba(0,0,0,0.08)] rounded-2xl overflow-hidden"
          >
            <motion.div layout className="w-max h-full p-4">
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({ setActive, children }) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)}
      className="relative rounded-full border border-transparent bg-white shadow-input flex justify-center space-x-4 px-8 py-6"
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({ title, description, href, src }) => {
  return (
    <Link to={href} className="flex space-x-2">
      <img
        src={src}
        width={140}
        height={70}
        alt={title}
        className="flex-shrink-0 rounded-md shadow-2xl"
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-slate-900">{title}</h4>
        <p className="text-slate-700 text-sm max-w-[10rem]">{description}</p>
      </div>
    </Link>
  );
};

export const HoveredLink = ({ children, onClick, ...rest }) => {
  const handleClick = (e) => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link
      {...rest}
      onClick={handleClick}
      className="group relative text-slate-700/90 hover:text-slate-900 text-[13px] sm:text-sm px-2 py-1 transition-colors"
    >
      <span className="relative">
        {children}
        <span className="pointer-events-none absolute left-0 right-0 -bottom-1 mx-auto h-px w-0 bg-gradient-to-r from-blue-500 via-fuchsia-500 to-purple-600 transition-all duration-200 group-hover:w-full" />
      </span>
    </Link>
  );
};
