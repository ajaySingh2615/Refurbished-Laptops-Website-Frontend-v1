import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiMail,
  HiPhone,
  HiLocationMarker,
  HiClock,
  HiShieldCheck,
  HiRefresh,
  HiBadgeCheck,
} from 'react-icons/hi';
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
  FaWhatsapp,
} from 'react-icons/fa';

export default function Footer() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 12,
      },
    },
  };

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* Main Footer Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        className="relative z-10"
      >
        {/* Top Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <motion.div variants={itemVariants} className="lg:col-span-1">
              <div className="mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  DeviceHub
                </h3>
                <p className="text-slate-300 mt-2 text-sm leading-relaxed">
                  Your trusted partner for premium refurbished electronics. Quality devices with
                  peace of mind.
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-slate-300">
                  <HiLocationMarker className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <span className="text-sm">123 Tech Street, Digital City, DC 12345</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300">
                  <HiPhone className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <span className="text-sm">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300">
                  <HiMail className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <span className="text-sm">support@devicehub.com</span>
                </div>
                <div className="flex items-center space-x-3 text-slate-300">
                  <HiClock className="h-5 w-5 text-blue-400 flex-shrink-0" />
                  <span className="text-sm">Mon-Fri: 9AM-6PM</span>
                </div>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={itemVariants}>
              <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
              <ul className="space-y-3">
                {[
                  { name: 'Home', href: '/' },
                  { name: 'Products', href: '/products' },
                  { name: 'Categories', href: '/c/laptops' },
                  { name: 'About Us', href: '/about' },
                  { name: 'Contact', href: '/contact' },
                  { name: 'Blog', href: '/blog' },
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-slate-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Categories */}
            <motion.div variants={itemVariants}>
              <h4 className="text-lg font-semibold mb-6 text-white">Categories</h4>
              <ul className="space-y-3">
                {[
                  { name: 'Laptops', href: '/c/laptops' },
                  { name: 'Smartphones', href: '/c/smartphones' },
                  { name: 'Tablets', href: '/c/tablets' },
                  { name: 'Accessories', href: '/c/accessories' },
                  { name: 'Gaming', href: '/c/gaming' },
                  { name: 'Business', href: '/c/business' },
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-slate-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"
                    >
                      <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Support & Social */}
            <motion.div variants={itemVariants}>
              <h4 className="text-lg font-semibold mb-6 text-white">Support & Connect</h4>

              {/* Support Links */}
              <div className="mb-6">
                <ul className="space-y-3">
                  {[
                    { name: 'Help Center', href: '/help' },
                    { name: 'Live Chat', href: '/chat' },
                    { name: 'Track Order', href: '/track' },
                    { name: 'Size Guide', href: '/size-guide' },
                    { name: 'Warranty Info', href: '/warranty' },
                    { name: 'Return Policy', href: '/returns' },
                  ].map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-slate-300 hover:text-blue-400 transition-colors duration-200 text-sm flex items-center group"
                      >
                        <span className="w-0 group-hover:w-2 h-0.5 bg-blue-400 transition-all duration-200 mr-0 group-hover:mr-2"></span>
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Social Links */}
              <div>
                <h5 className="text-sm font-medium text-white mb-3">Follow Us</h5>
                <div className="flex space-x-4">
                  {[
                    { icon: FaFacebook, href: '#', color: 'hover:text-blue-400' },
                    { icon: FaTwitter, href: '#', color: 'hover:text-sky-400' },
                    { icon: FaInstagram, href: '#', color: 'hover:text-pink-400' },
                    { icon: FaLinkedin, href: '#', color: 'hover:text-blue-500' },
                    { icon: FaYoutube, href: '#', color: 'hover:text-red-500' },
                    { icon: FaWhatsapp, href: '#', color: 'hover:text-green-400' },
                  ].map((social, index) => (
                    <motion.a
                      key={index}
                      href={social.href}
                      className={`text-slate-400 ${social.color} transition-colors duration-200`}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <social.icon className="h-5 w-5" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Trust Badges */}
        <motion.div variants={itemVariants} className="border-t border-slate-700 bg-slate-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: HiShieldCheck,
                  title: '32-Point Quality Check',
                  description: 'Every device thoroughly tested',
                },
                {
                  icon: HiRefresh,
                  title: '15-Day Replacement',
                  description: 'Hassle-free returns guaranteed',
                },
                {
                  icon: HiBadgeCheck,
                  title: '6-Month Warranty',
                  description: 'Comprehensive warranty coverage',
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-4 text-center md:text-left"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h5 className="font-semibold text-white text-sm">{feature.title}</h5>
                    <p className="text-slate-400 text-xs">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div variants={itemVariants} className="border-t border-slate-700 bg-slate-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-slate-400 text-sm">
                © {new Date().getFullYear()} DeviceHub. All rights reserved.
              </div>
              <div className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
                {[
                  { name: 'Privacy Policy', href: '/privacy' },
                  { name: 'Terms of Service', href: '/terms' },
                  { name: 'Cookie Policy', href: '/cookies' },
                  { name: 'Refund Policy', href: '/refunds' },
                ].map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-slate-400 hover:text-blue-400 transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}
