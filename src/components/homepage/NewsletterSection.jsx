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
    <section className="newsletter-section py-14 md:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h2
          className="text-2xl md:text-3xl font-black tracking-tight text-white"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ type: 'spring', stiffness: 90, damping: 14 }}
        >
          Stay Updated with Latest Deals
        </motion.h2>
        <motion.p
          className="mt-2 text-sm md:text-base text-white/80"
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
          className="mt-6 flex flex-col sm:flex-row items-stretch gap-3 max-w-md mx-auto"
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
            className="flex-1 h-12 px-4 rounded-lg border border-white/20 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/40"
          />
          <button
            type="submit"
            disabled={loading}
            className="h-12 px-5 rounded-lg bg-white text-blue-900 font-semibold hover:bg-gray-100 disabled:opacity-70 disabled:cursor-not-allowed shrink-0"
          >
            {loading ? 'Subscribing…' : 'Subscribe'}
          </button>
        </motion.form>
      </div>
    </section>
  );
}
