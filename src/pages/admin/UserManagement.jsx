import React from 'react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { apiService } from '../../services/api.js';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import { motion } from 'framer-motion';
import {
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Edit3,
  Trash2,
  Shield,
  Mail,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function UserManagement() {
  const { accessToken, refresh } = useAuth();
  const [users, setUsers] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [pageSize] = React.useState(10);
  const [totalPages, setTotalPages] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [filterLoading, setFilterLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState('all');
  const [statusFilter, setStatusFilter] = React.useState('all');

  const [debouncedSearchTerm, setDebouncedSearchTerm] = React.useState('');

  const [createOpen, setCreateOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    email: '',
    password: '',
    name: '',
    role: 'customer',
    status: 'active',
  });

  const fetchUsers = React.useCallback(
    async (isFilter = false) => {
      try {
        if (isFilter) {
          setFilterLoading(true);
        } else {
          setLoading(true);
        }
        setError('');
        let token = accessToken;
        if (!token) {
          const ok = await refresh();
          if (ok) token = (await apiService.refresh())?.access || token;
        }
        const params = {
          page,
          pageSize,
          search: debouncedSearchTerm,
          role: roleFilter !== 'all' ? roleFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        };
        const res = await apiService.adminListUsers(params, token || accessToken);
        const list = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.users)
            ? res.users
            : [];
        setUsers(list);
        setTotalPages(res?.totalPages || Math.ceil((res?.total || list.length) / pageSize));
      } catch (e) {
        setError(e?.message || 'Failed to load users');
      } finally {
        setLoading(false);
        setFilterLoading(false);
      }
    },
    [page, pageSize, debouncedSearchTerm, roleFilter, statusFilter, accessToken, refresh],
  );

  React.useEffect(() => {
    if (accessToken) fetchUsers();
  }, [fetchUsers, accessToken]);

  // Debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Auto-fetch when filters change
  React.useEffect(() => {
    if (accessToken) {
      setPage(1); // Reset to first page when filters change
      // Create a new fetch function that gets current filter states
      const fetchWithCurrentFilters = async () => {
        try {
          setFilterLoading(true);
          setError('');
          let token = accessToken;
          if (!token) {
            const ok = await refresh();
            if (ok) token = (await apiService.refresh())?.access || token;
          }
          const params = {
            page: 1, // Always use page 1 for filter changes
            pageSize,
            search: debouncedSearchTerm,
            role: roleFilter !== 'all' ? roleFilter : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
          };
          const res = await apiService.adminListUsers(params, token || accessToken);
          const list = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res?.users)
              ? res.users
              : [];
          setUsers(list);
          setTotalPages(res?.totalPages || Math.ceil((res?.total || list.length) / pageSize));
        } catch (e) {
          setError(e?.message || 'Failed to load users');
        } finally {
          setFilterLoading(false);
        }
      };
      fetchWithCurrentFilters();
    }
  }, [debouncedSearchTerm, roleFilter, statusFilter, accessToken]);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await apiService.adminCreateUser(form, accessToken);
      setCreateOpen(false);
      setForm({ email: '', password: '', name: '', role: 'customer', status: 'active' });
      await fetchUsers(true); // Pass true to maintain current filters
    } catch (e) {
      alert(e?.message || 'Failed to create user');
    }
  };

  const updateUser = async (id, patch) => {
    try {
      await apiService.adminUpdateUser(id, patch, accessToken);
      await fetchUsers(true); // Pass true to maintain current filters
    } catch (e) {
      alert(e?.message || 'Update failed');
    }
  };

  const deleteUser = async (id) => {
    if (!confirm('Delete this user? This will revoke all sessions.')) return;
    try {
      await apiService.adminDeleteUser(id, accessToken);
      await fetchUsers(true); // Pass true to maintain current filters
    } catch (e) {
      alert(e?.message || 'Delete failed');
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">User Management</h1>
              <p className="text-sm text-slate-600">Manage users, roles, and permissions</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 text-sm font-medium"
            >
              <UserPlus className="w-4 h-4" />
              Add User
            </motion.button>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-xl rounded-xl border border-slate-200/60 p-4 mb-4 shadow-lg shadow-slate-200/30"
        >
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px]">
              {filterLoading ? (
                <div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              )}
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
              />
            </div>

            {/* Role Filter */}
            <div className="relative">
              <Shield className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white text-sm min-w-[120px]"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="customer">Customer</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-2 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-8 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 appearance-none bg-white text-sm min-w-[120px]"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="deleted">Deleted</option>
              </select>
            </div>

            {/* Clear Filters Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
              disabled={filterLoading}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
            >
              {filterLoading ? (
                <>
                  <div className="w-3 h-3 border-2 border-slate-500 border-t-transparent rounded-full animate-spin"></div>
                  Filtering...
                </>
              ) : (
                'Clear'
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6"
          >
            {error}
          </motion.div>
        )}

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-xl shadow-slate-200/50 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-600 text-sm">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <div className="text-slate-500">
                        <UserPlus className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm font-medium">No users found</p>
                        <p className="text-xs">Try adjusting your search or filters</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  users.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors duration-150"
                    >
                      {/* User Info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {user.name
                              ? user.name.charAt(0).toUpperCase()
                              : user.email.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 truncate">
                              {user.name || 'No name'}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <select
                          value={user.role}
                          onChange={(e) => updateUser(user.id, { role: e.target.value })}
                          className="px-2 py-1 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <select
                          value={user.status}
                          onChange={(e) => updateUser(user.id, { status: e.target.value })}
                          className={`px-2 py-1 border rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                            user.status === 'active'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : user.status === 'suspended'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                          <option value="deleted">Deleted</option>
                        </select>
                      </td>

                      {/* Verified */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {user.emailVerifiedAt ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-500" />
                          )}
                          <span
                            className={`text-xs font-medium ${
                              user.emailVerifiedAt ? 'text-green-700' : 'text-red-700'
                            }`}
                          >
                            {user.emailVerifiedAt ? 'Verified' : 'Unverified'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => deleteUser(user.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between mt-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/60 p-4 shadow-xl shadow-slate-200/50"
          >
            <div className="text-sm text-slate-600">
              Page {page} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
                return (
                  <motion.button
                    key={pageNum}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPage(pageNum)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      page === pageNum
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {pageNum}
                  </motion.button>
                );
              })}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Create User Modal */}
        {createOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md border border-slate-200/60"
            >
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-xl font-bold text-slate-900">Create New User</h2>
                <p className="text-sm text-slate-600 mt-1">Add a new user to the system</p>
              </div>

              <form onSubmit={createUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="user@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                    <select
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    >
                      <option value="customer">Customer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
                    <select
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value })}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setCreateOpen(false)}
                    className="px-6 py-3 border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-300"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Create User
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </div>
    </AdminLayout>
  );
}
