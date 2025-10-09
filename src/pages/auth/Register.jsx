import React from 'react';
import { apiService } from '../../services/api.js';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

function VanishInput({
  value,
  onChange,
  name,
  type = 'text',
  placeholderOptions = [],
  className = '',
  inputClassName = '',
  leftAdornment = null,
  disabled = false,
  ...rest
}) {
  const [idx, setIdx] = React.useState(0);
  const [focused, setFocused] = React.useState(false);

  React.useEffect(() => {
    if (focused || value) return;
    if (!placeholderOptions?.length) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % placeholderOptions.length), 4000);
    return () => clearInterval(id);
  }, [focused, value, placeholderOptions]);

  const current = placeholderOptions[idx] || '';

  return (
    <div className={`relative ${className}`}>
      {leftAdornment}
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`w-full h-11 pl-9 pr-3 rounded-xl border border-slate-300 bg-white/80 backdrop-blur focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition shadow-sm ${inputClassName}`}
        {...rest}
      />
      {!focused && !value && current && (
        <div className="pointer-events-none absolute inset-y-0 left-9 flex items-center text-slate-400">
          {current}
        </div>
      )}
    </div>
  );
}

export default function Register() {
  const [tab, setTab] = React.useState('email');
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [agree, setAgree] = React.useState(false);
  const [msg, setMsg] = React.useState('');
  const [err, setErr] = React.useState('');
  const [busy, setBusy] = React.useState(false);

  // phone
  const [phone, setPhone] = React.useState('');
  const [otpSent, setOtpSent] = React.useState(false);
  const [otp, setOtp] = React.useState('');
  const { refresh } = useAuth();

  const handleGoogle = () => {
    window.location.href = 'http://localhost:4000/api/auth/google/start';
  };

  const submitEmail = async (e) => {
    e.preventDefault();
    setErr('');
    setMsg('');
    if (!agree) {
      setErr('Please accept Terms & Privacy');
      return;
    }
    try {
      setBusy(true);
      await apiService.register({ email, password, name });
      // Ensure AuthContext fetches profile before navigating
      await refresh();
      setMsg('Welcome! Redirecting to products...');
      window.location.href = '/products';
    } catch (e) {
      setErr(e?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  const sendOtp = async () => {
    setErr('');
    try {
      setBusy(true);
      await apiService.sendPhoneOtp({ phone });
      setOtpSent(true);
    } catch (e) {
      setErr(e?.message || 'Failed to send OTP');
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    setErr('');
    setMsg('');
    if (!agree) {
      setErr('Please accept Terms & Privacy');
      return;
    }
    try {
      setBusy(true);
      await apiService.verifyPhoneOtp({ phone, code: otp, name });
      setMsg('Phone verified. Account created. Please login.');
      setPhone('');
      setOtp('');
      setOtpSent(false);
    } catch (e) {
      setErr(e?.message || 'OTP verification failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 to-white">
      {/* Decorative background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full blur-3xl bg-blue-500/25" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full blur-3xl bg-purple-500/25" />
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.12] text-slate-500"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="currentColor" strokeWidth="1.25" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="w-full max-w-3xl bg-white/90 backdrop-blur rounded-2xl border border-slate-200 shadow-xl overflow-hidden relative">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left: marketing / illustration */}
          <div className="hidden md:flex flex-col justify-center p-8 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
            {/* subtle rings */}
            <div className="pointer-events-none absolute -right-12 -top-12 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />

            <div className="mb-6">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-300"></span>
                Join the community
              </span>
            </div>

            <h2 className="text-3xl font-extrabold tracking-tight leading-snug">
              Create your
              <span className="ml-2 inline-block bg-clip-text text-transparent bg-gradient-to-r from-amber-300 to-white">
                account
              </span>
            </h2>
            <p className="text-white/90 text-sm mt-2 mb-6">
              Manage orders, wishlist, and unlock exclusive offers tailored for you.
            </p>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 border border-white/15 shadow-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-400/90 text-emerald-950 font-bold">
                  ✓
                </div>
                <div>
                  <div className="text-sm font-semibold">Fast checkout experience</div>
                  <div className="text-xs text-white/80">
                    Save details securely for one‑tap payments.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 border border-white/15 shadow-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-300/90 text-sky-950 font-bold">
                  ✓
                </div>
                <div>
                  <div className="text-sm font-semibold">Track orders & repairs</div>
                  <div className="text-xs text-white/80">
                    Real‑time status and proactive updates.
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/10 border border-white/15 shadow-sm">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-300/90 text-amber-950 font-bold">
                  ✓
                </div>
                <div>
                  <div className="text-sm font-semibold">Early access to deals</div>
                  <div className="text-xs text-white/80">
                    Members‑only launches and festival offers.
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 text-[11px] text-white/80">
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 border border-white/15">
                ISO‑27001
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 border border-white/15">
                RBI‑Guidelines
              </div>
              <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-white/10 border border-white/15">
                Secure by Design
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="p-6 md:p-8">
            {/* Google */}
            <button
              onClick={handleGoogle}
              className="w-full h-11 rounded-lg border border-slate-300 hover:bg-slate-50 flex items-center justify-center gap-2 font-semibold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 c0-6.627,5.373-12,12-12c3.059,0,5.842,1.158,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.86,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,16.108,18.961,14,24,14c3.059,0,5.842,1.158,7.961,3.039l5.657-5.657 C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.197l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946 l-6.522,5.022C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.106,5.565c0,0,0.001,0,0.001,0l6.19,5.238 C36.871,39.026,44,34,44,24C44,22.659,43.86,21.35,43.611,20.083z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-slate-500">or continue with</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex rounded-lg bg-slate-100 p-1 mb-4">
              <button
                onClick={() => setTab('email')}
                className={`flex-1 h-9 rounded-md text-sm font-semibold ${tab === 'email' ? 'bg-white shadow' : 'text-slate-600'}`}
              >
                Email
              </button>
              <button
                onClick={() => setTab('phone')}
                className={`flex-1 h-9 rounded-md text-sm font-semibold ${tab === 'phone' ? 'bg-white shadow' : 'text-slate-600'}`}
              >
                Phone
              </button>
            </div>

            {tab === 'email' ? (
              <form onSubmit={submitEmail} className="space-y-4">
                {/* Full name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Full name
                  </label>
                  <VanishInput
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholderOptions={['Your full name', 'Rahul Sharma', 'Aarav Kumar']}
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
                            d="M5.121 17.804A7 7 0 0112 15a7 7 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                    }
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Email address
                  </label>
                  <VanishInput
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    placeholderOptions={[
                      'you@example.com',
                      'rahul@example.com',
                      'aarav@example.com',
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
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Create password
                  </label>
                  <VanishInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholderOptions={['Minimum 8 characters', 'Use letters & numbers']}
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
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                  />
                  I agree to the{' '}
                  <a className="text-blue-600 hover:underline" href="#">
                    Terms
                  </a>{' '}
                  and{' '}
                  <a className="text-blue-600 hover:underline" href="#">
                    Privacy Policy
                  </a>
                </label>
                {err && <div className="text-red-600 text-sm">{err}</div>}
                {msg && <div className="text-emerald-600 text-sm">{msg}</div>}
                <button
                  disabled={busy}
                  type="submit"
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:opacity-95 transition disabled:opacity-60"
                >
                  {busy ? 'Creating...' : 'Create account'}
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                {/* Full name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Full name
                  </label>
                  <div className="relative group">
                    <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                      <svg
                        className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5.121 17.804A7 7 0 0112 15a7 7 0 016.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-300 bg-white/80 backdrop-blur focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition shadow-sm"
                    />
                  </div>
                </div>

                {/* Phone + Send OTP */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Phone number
                  </label>
                  <div className="flex gap-2">
                    <div className="relative group flex-1">
                      <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                        <span className="text-slate-400 text-xs mr-1">+91</span>
                      </div>
                      <VanishInput
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholderOptions={['98765 43210', '90000 00000', '81234 56789']}
                        inputClassName="pl-12"
                      />
                    </div>
                    <button
                      disabled={busy || !phone}
                      onClick={sendOtp}
                      className="h-11 px-4 rounded-xl border border-slate-300 bg-white/80 hover:bg-slate-50 font-semibold shadow-sm"
                    >
                      {otpSent ? 'Resend' : 'Send OTP'}
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    We’ll send a 6‑digit code to verify your number.
                  </p>
                </div>

                {/* OTP */}
                {otpSent && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Enter OTP
                    </label>
                    <input
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="6-digit code"
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white/80 backdrop-blur focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition shadow-sm"
                    />
                  </div>
                )}

                <label className="flex items-center gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                  />
                  I agree to the{' '}
                  <a className="text-blue-600 hover:underline" href="#">
                    Terms
                  </a>{' '}
                  and{' '}
                  <a className="text-blue-600 hover:underline" href="#">
                    Privacy Policy
                  </a>
                </label>
                {err && <div className="text-red-600 text-sm">{err}</div>}
                {msg && <div className="text-emerald-600 text-sm">{msg}</div>}
                <button
                  disabled={busy || !otpSent}
                  onClick={verifyOtp}
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl hover:opacity-95 transition disabled:opacity-60"
                >
                  {busy ? 'Verifying...' : 'Verify & Create account'}
                </button>
              </div>
            )}

            <div className="mt-6 text-sm text-center text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
