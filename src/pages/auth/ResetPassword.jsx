import React from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
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

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  const token = searchParams.get('token');

  React.useEffect(() => {
    if (!token) {
      setError('Invalid reset link');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError('Invalid reset link');
      return;
    }

    if (!password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');

    try {
      const result = await apiService.resetPassword(token, password);
      setMessage(result.message);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err?.message || 'Failed to reset password');
    } finally {
      setBusy(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Reset Link</h1>
          <p className="text-slate-600 mb-6">This password reset link is invalid or has expired.</p>
          <Link to="/forgot-password" className="text-blue-600 hover:underline">
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

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
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Set New Password</h1>
            <p className="text-slate-600">Enter your new password below.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <VanishInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              placeholderOptions={['Enter new password', 'Minimum 6 characters', 'Make it secure']}
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
                      d="M12 11c.552 0 1 .448 1 1v4a1 1 0 11-2 0v-4c0-.552.448-1 1-1zm-4 0V9a4 4 0 118 0v2m-9 0h10a2 2 0 012 2v5a2 2 0 01-2 2H7a2 2 0 01-2-2v-5a2 2 0 012-2z"
                    />
                  </svg>
                </div>
              }
              inputClassName="pl-12 pr-12"
            />

            <VanishInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type={showPassword ? 'text' : 'password'}
              placeholderOptions={[
                'Confirm new password',
                'Re-enter your password',
                'Must match above',
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
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              }
              inputClassName="pl-12 pr-12"
            />

            {/* Show/Hide Password Toggle */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="mr-2"
                />
                Show password
              </label>
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}
            {message && <div className="text-emerald-600 text-sm">{message}</div>}

            <button
              disabled={busy}
              type="submit"
              className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:opacity-95 disabled:opacity-60"
            >
              {busy ? 'Resetting...' : 'Reset Password'}
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
