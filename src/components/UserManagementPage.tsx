import React, { useState } from 'react';
import { Users, UserPlus, Check, X, Shield, Lock } from 'lucide-react';
import { User, UserRole } from '../types';
import { CampusCareStorage } from '../services/storage';
import { DEPARTMENTS } from '../services/smartEngine';

interface UserManagementPageProps {
  allUsers: User[];
  onRefreshUsers: () => void;
}

export const UserManagementPage: React.FC<UserManagementPageProps> = ({
  allUsers,
  onRefreshUsers,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('staff');
  const [department, setDepartment] = useState('Maintenance');

  const handleToggle = (userId: string) => {
    CampusCareStorage.toggleUserActive(userId);
    onRefreshUsers();
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      role,
      department,
      active: true,
    };

    CampusCareStorage.addUser(newUser);
    onRefreshUsers();
    setName('');
    setEmail('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
            Access Control & Personnel
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white">
            User Directory & Roles
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage student registrations, staff duty officers, department heads, and system administrators.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
        >
          <UserPlus className="w-4 h-4" />
          {showAddForm ? 'Close Intake' : 'Add Staff Officer'}
        </button>
      </div>

      {/* Add Staff Officer Form */}
      {showAddForm && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
            Register Administrative Staff or Officer
          </h3>

          <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-500 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. S. Raman"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-500 mb-1">University Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sraman@campus.com"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-500 mb-1">Role Permission</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                <option value="staff">Staff Specialist</option>
                <option value="department_head">Department Head</option>
                <option value="admin">Administrator</option>
                <option value="student">Student</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-500 mb-1">Assigned Department</label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-4 flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 dark:bg-indigo-600 rounded-lg hover:bg-slate-800 shadow-xs"
              >
                Save New Personnel Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Active Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {allUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {u.name}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {u.email}
                    </div>
                  </td>

                  <td className="py-3 px-4 capitalize font-medium text-slate-700 dark:text-slate-300">
                    {u.role.replace('_', ' ')}
                  </td>

                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {u.department}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                        u.active
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                      }`}
                    >
                      {u.active ? 'Active' : 'Suspended'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    {u.email !== 'admin@campus.com' && (
                      <button
                        onClick={() => handleToggle(u.id)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
