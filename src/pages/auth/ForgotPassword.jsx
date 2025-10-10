import React from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../../services/api';

// VanishInput component (same as in Register/Login)
const VanishInput = ({
  value,
  onChange,
  placeholderOptions = [],
  type = 'text',
  leftAdornment,
  inputClassName = '',
  className = '',
}) => {
  const [currentPlaceholder, setCurrentPlaceholder] = React.useState(placeholderOptions[0] || '');
  const [placeholderIndex, setPlaceholderIndex] = React.useState(0);

  React.useEffect(() => {
    if (placeholderOptions.length <= 1) return;

    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholderOptions.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [placeholderOptions.length]);

  React.useEffect(() => {
    if (placeholderOptions[placeholderIndex]) {
      setCurrentPlaceholder(placeholderOptions[placeholderIndex]);
    }
  }, [placeholderIndex, placeholderOptions]);

  return (
    <div className={`relative ${className}`}>
      {leftAdornment}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={currentPlaceholder}
        className={`w-full h-11 px-3 rounded-lg border border-slate-300 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${inputClassName}`}
      />
    </div>
  );
};

export default function ForgotPassword() {
  const [email, setEmail] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');

    try {
      const result = await apiService.forgotPassword(email);
      setMessage(result.message);
    } catch (err) {
      setError(err?.message || 'Failed to send reset link');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl"></div>
        <svg
          className="absolute inset-0 w-full h-full text-slate-400"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.3"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Reset Password</h1>
            <p className="text-slate-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <VanishInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholderOptions={[
                'Enter your email address',
                'example@email.com',
                'your.email@domain.com',
              ]}
              leftAdornment={
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <svg
                    className="h-4 w-4 text-slate-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              }
              inputClassName="pl-12"
            />

            {error && <div className="text-red-600 text-sm">{error}</div>}
            {message && <div className="text-emerald-600 text-sm">{message}</div>}

            <button
              disabled={busy}
              type="submit"
              className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:opacity-95 disabled:opacity-60"
            >
              {busy ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-sm text-center text-slate-600">
            Remember your password?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
