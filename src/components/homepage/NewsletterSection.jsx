import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { apiService } from '../../services/api.js';
import toast from 'react-hot-toast';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    const isValid =
      /^(?:[a-zA-Z0-9_'^&+%`{}~!$*-]+(?:\.[a-zA-Z0-9_'^&+%`{}~!$*-]+)*)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(
        email.trim(),
      );
    if (!isValid) {
      toast.error('Please enter a valid email address.');
      return;
    }
    try {
      setLoading(true);
      await apiService.subscribeNewsletter(email.trim(), 'homepage');
      toast.success("Subscribed! You'll hear from us soon.");
      setEmail('');
    } catch (err) {
      const message = err?.data?.message || err?.message || 'Something went wrong. Try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="newsletter-section py-12 sm:py-14 md:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-6 sm:mb-8 md:mb-12 text-white"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          Stay Updated with Latest Deals
        </motion.h2>
        <motion.p
          className="text-sm sm:text-base md:text-lg text-white/80 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, delay: 0.05 }}
        >
          Subscribe to our newsletter and be the first to know about new arrivals and exclusive
          offers
        </motion.p>

        <motion.form
          onSubmit={onSubmit}
          className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 w-full sm:max-w-md mx-auto"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12 sm:h-14 px-4 sm:px-5 rounded-lg border border-white/20 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/40 transition-all duration-200 w-full text-base"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-12 sm:h-14 px-6 sm:px-8 rounded-lg bg-white text-blue-900 font-semibold hover:bg-gray-100 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-white shrink-0 transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-lg text-base min-h-[48px] w-full sm:w-auto"
          >
            {loading ? 'Subscribing…' : 'Subscribe'}
          </button>
        </motion.form>
      </div>
    </section>
  );
}
