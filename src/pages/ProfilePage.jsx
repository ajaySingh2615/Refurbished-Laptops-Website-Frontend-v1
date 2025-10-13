import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { Button } from '../components/ui/Button';

export default function ProfilePage() {
  const { user, accessToken, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Password change states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (!user || !accessToken) {
      navigate('/login');
      return;
    }
    fetchProfile();
  }, [user, accessToken, navigate]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const data = await apiService.getProfile(accessToken);
      setProfile(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
      });
    } catch (err) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await apiService.updateProfile(formData, accessToken);
      setProfile(response.profile);
      setFormData({
        name: response.profile.name || '',
        email: response.profile.email || '',
        phone: response.profile.phone || '',
      });
      setSuccess(response.message || 'Profile updated successfully');
      setEditing(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      const response = await apiService.changePassword(
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        accessToken,
      );
      setSuccess(response.message || 'Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setChangingPassword(false);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    }
  };

  const getLoginMethodLabel = (method) => {
    switch (method) {
      case 'email':
        return 'Email & Password';
      case 'phone':
        return 'Phone Number';
      case 'google':
        return 'Google OAuth';
      default:
        return method;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your personal information and account settings
          </p>
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Profile Picture */}
              <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-600">
                <div className="flex flex-col items-center">
                  <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
                    {(profile.name || profile.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <h2 className="mt-4 text-xl font-semibold text-white">
                    {profile.name || 'User'}
                  </h2>
                  <p className="text-sm text-white/80">{profile.email}</p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Login Method</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {getLoginMethodLabel(profile.loginMethod)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Account Status</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        profile.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {profile.status}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Member Since</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                {!editing && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(true);
                      setError('');
                      setSuccess('');
                    }}
                  >
                    Edit
                  </Button>
                )}
              </div>

              {editing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                      {!profile.canEditEmail && (
                        <span className="ml-2 text-xs text-gray-500">(Cannot be changed)</span>
                      )}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!profile.canEditEmail}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !profile.canEditEmail ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    />
                    {profile.loginMethod === 'email' && (
                      <p className="mt-1 text-xs text-gray-500">
                        Email is your login method and cannot be changed
                      </p>
                    )}
                    {profile.loginMethod === 'google' && (
                      <p className="mt-1 text-xs text-gray-500">
                        Email comes from your Google account and cannot be changed
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                      {!profile.canEditPhone && (
                        <span className="ml-2 text-xs text-gray-500">(Cannot be changed)</span>
                      )}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      disabled={!profile.canEditPhone}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        !profile.canEditPhone ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                    />
                    {profile.loginMethod === 'phone' && (
                      <p className="mt-1 text-xs text-gray-500">
                        Phone is your login method and cannot be changed
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" variant="primary">
                      Save Changes
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditing(false);
                        setFormData({
                          name: profile.name || '',
                          email: profile.email || '',
                          phone: profile.phone || '',
                        });
                        setError('');
                        setSuccess('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Full Name</p>
                      <p className="mt-1 text-base text-gray-900">{profile.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email Address</p>
                      <p className="mt-1 text-base text-gray-900">{profile.email || '-'}</p>
                      {profile.emailVerifiedAt && (
                        <p className="mt-0.5 text-xs text-green-600">✓ Verified</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Phone Number</p>
                      <p className="mt-1 text-base text-gray-900">{profile.phone || '-'}</p>
                      {profile.phoneVerifiedAt && (
                        <p className="mt-0.5 text-xs text-green-600">✓ Verified</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Role</p>
                      <p className="mt-1 text-base text-gray-900 capitalize">{profile.role}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Security Section - Only for email/password users */}
            {profile.loginMethod === 'email' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Security</h3>
                  {!changingPassword && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setChangingPassword(true);
                        setError('');
                        setSuccess('');
                      }}
                    >
                      Change Password
                    </Button>
                  )}
                </div>

                {changingPassword ? (
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        required
                        minLength={8}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Must be at least 8 characters long
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button type="submit" variant="primary">
                        Update Password
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setChangingPassword(false);
                          setPasswordData({
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          });
                          setError('');
                          setSuccess('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <p className="text-sm text-gray-600">
                      Password was last updated on{' '}
                      {new Date(profile.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Login Method Info */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h4 className="text-sm font-semibold text-blue-900 mb-2">Login Information</h4>
              <p className="text-sm text-blue-800">
                {profile.loginMethod === 'email' && (
                  <>
                    You are using <strong>Email & Password</strong> to login. Your email address
                    cannot be changed as it is your primary login method.
                  </>
                )}
                {profile.loginMethod === 'phone' && (
                  <>
                    You are using <strong>Phone Number</strong> to login. Your phone number cannot
                    be changed as it is your primary login method.
                  </>
                )}
                {profile.loginMethod === 'google' && (
                  <>
                    You are using <strong>Google Sign-In</strong> to login. Your email address comes
                    from your Google account and cannot be changed here.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
