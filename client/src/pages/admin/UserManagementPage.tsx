import React, { useEffect, useState, useCallback } from 'react';
import { User, Role } from '../../types';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import {
  Users,
  Search,
  Shield,
  Truck,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Sparkles,
  X,
  Mail,
  Phone,
  User as UserIcon,
  CheckCircle2,
} from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Add User Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('CITIZEN');
  const [creatingUser, setCreatingUser] = useState(false);

  const limit = 15;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (roleFilter !== 'ALL') params.append('role', roleFilter);
      if (search.trim()) params.append('search', search.trim());

      let fetchedUsers: User[] = [];

      try {
        const res = await axiosClient.get(`/users?${params.toString()}`);
        if (res.data?.success) {
          fetchedUsers = res.data.data.users || [];
        }
      } catch (e) {
        console.debug('Failed to fetch from /users API:', e);
      }

      // Merge local users (registered users, current logged-in user, and report creators)
      try {
        const localRegistered: User[] = JSON.parse(
          localStorage.getItem('cleancity_registered_users') || '[]'
        );
        const cachedUserStr = localStorage.getItem('cleancity_user');
        const cachedUser: User | null = cachedUserStr ? JSON.parse(cachedUserStr) : null;

        const extraUsers: User[] = [...localRegistered];

        if (currentUser) {
          if (!extraUsers.some((u) => u.email?.toLowerCase() === currentUser.email?.toLowerCase())) {
            extraUsers.unshift(currentUser);
          }
        } else if (cachedUser) {
          if (!extraUsers.some((u) => u.email?.toLowerCase() === cachedUser.email?.toLowerCase())) {
            extraUsers.unshift(cachedUser);
          }
        }

        // Also check if any custom reports were submitted by other citizens
        const localReports = JSON.parse(localStorage.getItem('cleancity_local_reports') || '[]');
        if (Array.isArray(localReports)) {
          localReports.forEach((r: any) => {
            if (r.user && r.user.name && r.user.email) {
              if (!extraUsers.some((u) => u.email?.toLowerCase() === r.user.email.toLowerCase())) {
                extraUsers.push({
                  _id: r.user._id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                  name: r.user.name,
                  email: r.user.email,
                  phone: r.user.phone || '+91 94440 00000',
                  role: (r.user.role || 'CITIZEN') as Role,
                  createdAt: r.createdAt || new Date().toISOString(),
                });
              }
            }
          });
        }

        if (extraUsers.length > 0) {
          const existingEmails = new Set(fetchedUsers.map((u) => u.email.toLowerCase()));
          const missing = extraUsers.filter((u) => !existingEmails.has(u.email.toLowerCase()));
          if (missing.length > 0) {
            fetchedUsers = [...missing, ...fetchedUsers];
          }
        }
      } catch {}

      // Apply role filter to combined list
      if (roleFilter !== 'ALL') {
        fetchedUsers = fetchedUsers.filter((u) => u.role === roleFilter);
      }

      // Apply search query to combined list
      if (search.trim()) {
        const q = search.toLowerCase();
        fetchedUsers = fetchedUsers.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            (u.phone && u.phone.includes(q))
        );
      }

      // Sort: current user first, then newest
      fetchedUsers.sort((a, b) => {
        const aIsCur = currentUser && a.email.toLowerCase() === currentUser.email.toLowerCase();
        const bIsCur = currentUser && b.email.toLowerCase() === currentUser.email.toLowerCase();
        if (aIsCur && !bIsCur) return -1;
        if (!aIsCur && bIsCur) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setUsers(fetchedUsers);
      setTotal(fetchedUsers.length);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, search, currentUser]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    setUpdatingId(userId);
    try {
      // Update local state immediately
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u))
      );

      // Persist in local storage registered users
      try {
        const registered: User[] = JSON.parse(
          localStorage.getItem('cleancity_registered_users') || '[]'
        );
        const updated = registered.map((u) => (u._id === userId ? { ...u, role: newRole } : u));
        localStorage.setItem('cleancity_registered_users', JSON.stringify(updated));
      } catch {}

      try {
        await axiosClient.patch(`/users/${userId}/role`, { role: newRole });
      } catch (e: any) {
        console.debug('Server role sync note:', e.message);
      }

      toast(`User role updated to ${newRole}`, 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to update user role', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      toast('Please enter both name and email', 'error');
      return;
    }

    setCreatingUser(true);
    try {
      const newUser: User = {
        _id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: newUserName.trim(),
        email: newUserEmail.toLowerCase().trim(),
        phone: newUserPhone.trim() || '+91 98400 11223',
        role: newUserRole,
        createdAt: new Date().toISOString(),
      };

      // 1. Save to local registered users
      try {
        const registered: User[] = JSON.parse(
          localStorage.getItem('cleancity_registered_users') || '[]'
        );
        registered.unshift(newUser);
        localStorage.setItem('cleancity_registered_users', JSON.stringify(registered));
      } catch {}

      // 2. Sync to server
      try {
        await axiosClient.post('/users', {
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
        });
      } catch (e: any) {
        console.debug('User creation server sync note:', e.message);
      }

      toast(`User "${newUser.name}" added to user board as ${newUser.role}!`, 'success');
      setIsAddModalOpen(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPhone('');
      setNewUserRole('CITIZEN');
      fetchUsers();
    } catch {
      toast('Failed to add user', 'error');
    } finally {
      setCreatingUser(false);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Personnel & Citizen Registry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-0.5">
            User & Fleet Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage system users, assign driver credentials, or promote personnel to municipal administrators.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 active:scale-95 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
        >
          <option value="ALL">All Roles ({total})</option>
          <option value="CITIZEN">Citizens</option>
          <option value="DRIVER">Drivers</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      {/* User Table */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50/75 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-800 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-4">Contact</th>
                <th className="py-4 px-4">Current Role</th>
                <th className="py-4 px-4">Joined Date</th>
                <th className="py-4 px-6 text-right">Assign Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-6"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-36"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-28"></div></td>
                    <td className="py-4 px-4"><div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-20"></div></td>
                    <td className="py-4 px-4"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-24"></div></td>
                    <td className="py-4 px-6 text-right"><div className="h-8 bg-gray-200 dark:bg-gray-800 rounded-xl w-28 ml-auto"></div></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrent =
                    (currentUser &&
                      (u._id === currentUser._id ||
                        u.email?.toLowerCase() === currentUser.email?.toLowerCase())) ||
                    false;

                  return (
                    <tr
                      key={u._id}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-emerald-50/60 dark:bg-emerald-950/25 border-l-4 border-l-emerald-500'
                          : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                      }`}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-gray-900 dark:text-white">{u.name}</span>
                          {isCurrent && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                              Current User (You)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </td>

                      <td className="py-4 px-4 text-xs text-gray-600 dark:text-gray-300">
                        {u.phone || <span className="text-gray-400 italic">No phone</span>}
                      </td>

                      <td className="py-4 px-4">
                        {u.role === 'ADMIN' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        )}
                        {u.role === 'DRIVER' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">
                            <Truck className="w-3 h-3" /> Driver
                          </span>
                        )}
                        {u.role === 'CITIZEN' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            <UserCheck className="w-3 h-3" /> Citizen
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-xs text-gray-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '01/01/2026'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <select
                          value={u.role}
                          disabled={updatingId === u._id}
                          onChange={(e) => handleRoleChange(u._id, e.target.value as Role)}
                          className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
                        >
                          <option value="CITIZEN">Citizen</option>
                          <option value="DRIVER">Driver</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500">
          <div>
            Showing {users.length > 0 ? (page - 1) * limit + 1 : 0} to{' '}
            {Math.min(page * limit, total)} of {total} users
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-md w-full border border-gray-100 dark:border-gray-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-600" />
                <span>Register User to Board</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Create a new user or citizen account to manage in the municipal roster.
            </p>

            <form onSubmit={handleCreateUser} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="e.g. Sandhiya"
                    required
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="email"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="e.g. sandhiya@gmail.com"
                    required
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  Phone Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="tel"
                    value={newUserPhone}
                    onChange={(e) => setNewUserPhone(e.target.value)}
                    placeholder="+91 98400 12345"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">
                  System Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as Role)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="CITIZEN">Citizen (Report Waste)</option>
                  <option value="DRIVER">Driver (Collect & Navigate)</option>
                  <option value="ADMIN">Admin (Full Control)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{creatingUser ? 'Adding...' : 'Add to User Board'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
