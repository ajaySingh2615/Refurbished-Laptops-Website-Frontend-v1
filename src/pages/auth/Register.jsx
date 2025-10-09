import React from 'react';
import { apiService } from '../../services/api.js';
import { Link } from 'react-router-dom';

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

  const handleGoogle = () => {
    window.location.href = '/api/auth/google/start';
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
      setMsg('Registered successfully. Please login.');
      setName('');
      setEmail('');
      setPassword('');
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
          <div className="hidden md:flex flex-col justify-center p-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <h2 className="text-2xl font-bold mb-2">Create your account</h2>
            <p className="text-white/90 text-sm mb-6">
              Join to manage orders, wishlist, and get exclusive offers.
            </p>
            <ul className="space-y-2 text-white/90 text-sm">
              <li className="flex items-center gap-2">
                <span className="inline-block w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  ✓
                </span>{' '}
                Fast checkout experience
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  ✓
                </span>{' '}
                Track orders & repairs
              </li>
              <li className="flex items-center gap-2">
                <span className="inline-block w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                  ✓
                </span>{' '}
                Early access to deals
              </li>
            </ul>
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
              <form onSubmit={submitEmail} className="space-y-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                <input
                  value={password}
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
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
                  className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:opacity-95 disabled:opacity-60"
                >
                  {busy ? 'Creating...' : 'Create account'}
                </button>
              </form>
            ) : (
              <div className="space-y-3">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
                <div className="flex gap-2">
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone number"
                    className="flex-1 h-11 px-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                  <button
                    disabled={busy || !phone}
                    onClick={sendOtp}
                    className="h-11 px-4 rounded-lg border border-slate-300 hover:bg-slate-50"
                  >
                    {otpSent ? 'Resend' : 'Send OTP'}
                  </button>
                </div>
                {otpSent && (
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    className="w-full h-11 px-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
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
                  className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:opacity-95 disabled:opacity-60"
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
