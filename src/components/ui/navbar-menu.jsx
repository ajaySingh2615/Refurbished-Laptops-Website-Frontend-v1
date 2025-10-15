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

  return (
    <div ref={buttonRef} onMouseEnter={() => setActive(item)} className="relative z-50">
      <motion.p
        transition={{ duration: 0.3 }}
        className="cursor-pointer text-slate-700 hover:text-slate-900 text-[13px] sm:text-sm px-2 py-1"
      >
        {item}
      </motion.p>
      {active === item && (
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={transition}
          onMouseEnter={() => setActive(item)}
          className="absolute z-[100] top-0 left-1/2 transform -translate-x-1/2 pt-12"
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

export const HoveredLink = ({ children, ...rest }) => {
  return (
    <Link {...rest} className="text-slate-700 hover:text-slate-900 transition-colors">
      {children}
    </Link>
  );
};
