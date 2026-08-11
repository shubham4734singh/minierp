import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Plus, Trash2, X, ShieldAlert, Download, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadCSV } from '../lib/exportCsv';

import SkeletonRow from '../components/SkeletonRow';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'SALES' });
  const [sortField, setSortField] = useState<keyof User | null>(null);
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const sortedUsers = [...users].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField] || '';
    const bVal = b[sortField] || '';
    return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await api.put(`/users/${editingId}`, formData);
        setUsers(users.map(u => u.id === editingId ? res.data : u));
        toast.success("Team member updated successfully!");
      } else {
        const res = await api.post('/auth/register', formData);
        setUsers([res.data.user, ...users]);
        toast.success("Team member added successfully!");
      }
      closeForm();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save user. Email might be in use.");
    }
  };

  const handleEdit = (user: User) => {
    setFormData({ name: user.name, email: user.email, password: '', role: user.role });
    setEditingId(user.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', email: '', password: '', role: 'SALES' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this account?")) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      toast.success("User account deleted.");
    } catch (err) {
      toast.error("Failed to delete user. They might have active challans/logs.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Team Management</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Manage employee accounts and role-based access control.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <button onClick={() => downloadCSV(users, 'Team_Members')} className="btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button onClick={showForm ? closeForm : () => setShowForm(true)} className="btn-primary">
            {showForm ? <X className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
            {showForm ? 'Cancel' : 'Add Employee'}
          </button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreateOrUpdate} className="bg-white dark:bg-[#0a0a0a] p-6 rounded-2xl border border-black/5 dark:border-white/5 shadow-xl dark:shadow-2xl animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-zinc-900 dark:text-white mb-4 text-lg">
            {editingId ? 'Edit Account' : 'Create New Account'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Full Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" placeholder="e.g. Alex" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Email (Login)</label>
              <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-field" placeholder="alex@erp.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">
                {editingId ? 'New Password (Optional)' : 'Password'}
              </label>
              <input required={!editingId} minLength={6} type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="input-field" placeholder={editingId ? "Leave blank to keep current" : "••••••••"} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Role / Permission Level</label>
              <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="input-field bg-[#fafafa] dark:bg-[#111]">
                <option value="SALES">Sales (Create Challans)</option>
                <option value="WAREHOUSE">Warehouse (Manage Products)</option>
                <option value="ACCOUNTS">Accounts (Read Only)</option>
                <option value="ADMIN">Administrator (Full Access)</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button type="submit" className="btn-primary">
              {editingId ? 'Save Changes' : 'Provision Account'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-xl dark:shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-black/5 dark:divide-white/5">
            <thead className="bg-[#fafafa] dark:bg-[#111]">
              <tr>
                <th onClick={() => handleSort('name')} className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Employee {sortField === 'name' && (sortAsc ? '(Asc)' : '(Desc)')}
                </th>
                <th onClick={() => handleSort('email')} className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Email Address {sortField === 'email' && (sortAsc ? '(Asc)' : '(Desc)')}
                </th>
                <th onClick={() => handleSort('role')} className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Access Role {sortField === 'role' && (sortAsc ? '(Asc)' : '(Desc)')}
                </th>
                <th onClick={() => handleSort('createdAt')} className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Joined {sortField === 'createdAt' && (sortAsc ? '(Asc)' : '(Desc)')}
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#0a0a0a] divide-y divide-black/5 dark:divide-white/5">
              {loading ? (
                <SkeletonRow columns={5} />
              ) : sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-500 font-medium">No team members found.</td>
                </tr>
              ) : (
                sortedUsers.map((u) => {
                  const isAdmin = u.role === 'ADMIN';
                  return (
                    <tr key={u.id} className="hover:bg-[#fafafa] dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`h-10 w-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm bg-[#fafafa] dark:bg-[#111] text-zinc-900 dark:text-white border border-black/5 dark:border-white/5 shadow-inner`}>
                            {u.name.charAt(0)}
                          </div>
                          <div className="ml-4 font-bold text-zinc-900 dark:text-white">{u.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 font-medium">{u.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md border ${isAdmin ? 'bg-white text-black border-white' : 'bg-[#fafafa] dark:bg-[#111] text-zinc-700 dark:text-zinc-300 border-black/5 dark:border-white/10'}`}>
                          {isAdmin && <ShieldAlert className="h-3 w-3 mr-1 self-center" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-1">
                        <button onClick={() => handleEdit(u)} className="text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10">
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="text-red-900 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
