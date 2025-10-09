import React from 'react';
import Header from './Header.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { apiService } from '../services/api.js';

export default function Layout({ children, onSearch }) {
  const { user } = useAuth();
  const [bannerVisible, setBannerVisible] = React.useState(true);
  const [sending, setSending] = React.useState(false);

  const showVerify = user && !user.emailVerifiedAt && bannerVisible;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onSearch={onSearch} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showVerify && (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-900">
            <div className="text-sm">
              We sent a verification link to <span className="font-semibold">{user.email}</span>.
              Please verify to unlock all features.
            </div>
            <div className="flex items-center gap-3">
              <button
                className="text-sm text-amber-700 hover:underline cursor-pointer disabled:cursor-default"
                onClick={async () => {
                  try {
                    setSending(true);
                    await apiService.resendVerification();
                  } finally {
                    setSending(false);
                  }
                }}
                disabled={sending}
              >
                {sending ? 'Sending…' : 'Resend'}
              </button>
              <button
                className="text-sm text-amber-700/80 hover:underline cursor-pointer"
                onClick={() => setBannerVisible(false)}
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
