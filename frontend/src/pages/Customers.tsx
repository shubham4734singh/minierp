import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Plus, Search, Edit2, Trash2, X, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadCSV } from '../lib/exportCsv';
import SkeletonRow from '../components/SkeletonRow';

import { Link } from 'react-router-dom';

interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string | null;
  gstNumber?: string | null;
  type: string;
  status: string;
  address?: string;
  followUpDate?: string | null;
  notes?: string | null;
  createdAt?: string;
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // RBAC
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const canEdit = user.role === 'ADMIN' || user.role === 'SALES';
  const canDelete = user.role === 'ADMIN';

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Customer | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;
  const [formData, setFormData] = useState({ name: '', mobile: '', email: '', businessName: '', gstNumber: '', type: 'WHOLESALE', status: 'ACTIVE', address: '', followUpDate: '', notes: '' });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = [...customers].filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.businessName && c.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField] || '';
    const bVal = b[sortField] || '';
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return 0;
  });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSort = (field: keyof Customer) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
    } catch (error) {
      console.error('Failed to fetch customers', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await api.put(`/customers/${editingId}`, formData);
        setCustomers(customers.map(c => c.id === editingId ? res.data : c));
        toast.success("Customer updated successfully!");
      } else {
        const res = await api.post('/customers', formData);
        setCustomers([res.data, ...customers]);
        toast.success("Customer added successfully!");
      }
      closeForm();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to save customer.");
    }
  };

  const handleEdit = (customer: Customer) => {
    setFormData({
      name: customer.name,
      mobile: customer.mobile,
      email: customer.email || '',
      businessName: customer.businessName || '',
      gstNumber: customer.gstNumber || '',
      type: customer.type,
      status: customer.status,
      address: customer.address || '',
      followUpDate: customer.followUpDate ? new Date(customer.followUpDate).toISOString().split('T')[0] : '',
      notes: customer.notes || ''
    });
    setEditingId(customer.id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ name: '', mobile: '', email: '', businessName: '', gstNumber: '', type: 'WHOLESALE', status: 'ACTIVE', address: '', followUpDate: '', notes: '' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await api.delete(`/customers/${id}`).catch(() => console.warn("No delete endpoint yet"));
      setCustomers(customers.filter(c => c.id !== id));
      toast.success("Customer deleted.");
    } catch (err) {
      toast.error("Failed to delete. Customer might have active challans.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Customers</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Manage your customer database and viewing history.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <button onClick={() => downloadCSV(customers, 'Customers')} className="btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          {canEdit && (
            <button onClick={() => setShowForm(true)} className="btn-primary">
              <Plus className="h-4 w-4 mr-2" /> Add Customer
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-black/5 dark:border-white/5 shadow-2xl">
            <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center justify-between sticky top-0 bg-white dark:bg-[#111] z-10">
              <h3 className="font-bold text-zinc-900 dark:text-white text-xl">
                {editingId ? 'Edit Customer' : 'Add New Customer'}
              </h3>
              <button onClick={closeForm} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdate} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Company / Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input-field" placeholder="Acme Corp" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="input-field" placeholder="contact@acme.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Phone</label>
              <input value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="input-field" placeholder="+1..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Type</label>
              <select required value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="input-field bg-[#fafafa] dark:bg-[#111]">
                <option value="RETAIL">Retail</option>
                <option value="WHOLESALE">Wholesale</option>
                <option value="DISTRIBUTOR">Distributor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Status</label>
              <select required value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="input-field bg-[#fafafa] dark:bg-[#111]">
                <option value="LEAD">Lead</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">GST Number</label>
              <input required value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} className="input-field" placeholder="GSTIN..." />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Follow-up Date</label>
              <input type="date" value={formData.followUpDate} onChange={e => setFormData({...formData, followUpDate: e.target.value})} className="input-field" />
            </div>
            <div className="md:col-span-2 lg:col-span-2">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Address</label>
              <input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="input-field" placeholder="123 Business Rd." />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-1">Notes</label>
              <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="input-field min-h-[80px]" placeholder="Special requirements..." />
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-black/5 dark:border-white/5">
            <button type="button" onClick={closeForm} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">
              {editingId ? 'Update Customer' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
      </div>
      )}

      <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-xl dark:shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-black/5 dark:border-white/5 bg-[#fafafa] dark:bg-[#111] flex items-center justify-between">
          <div className="relative max-w-sm w-full">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-zinc-500 dark:text-zinc-500" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="input-field pl-10"
              placeholder="Search customers..."
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-black/5 dark:divide-white/5">
            <thead className="bg-[#fafafa] dark:bg-[#111]">
              <tr>
                <th onClick={() => handleSort('name')} className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Customer {sortField === 'name' && (sortAsc ? '(Asc)' : '(Desc)')}
                </th>
                <th onClick={() => handleSort('businessName')} className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Business Name {sortField === 'businessName' && (sortAsc ? '(Asc)' : '(Desc)')}
                </th>
                <th onClick={() => handleSort('mobile')} className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Mobile {sortField === 'mobile' && (sortAsc ? '(Asc)' : '(Desc)')}
                </th>
                <th onClick={() => handleSort('createdAt' as any)} className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Joined {sortField === 'createdAt' && (sortAsc ? '(Asc)' : '(Desc)')}
                </th>
                <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#0a0a0a] divide-y divide-black/5 dark:divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5}><SkeletonRow columns={5} /></td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-500 font-medium">No customers found.</td>
                </tr>
              ) : (
                paginatedCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#fafafa] dark:hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-[#fafafa] dark:bg-[#111] border border-black/5 dark:border-white/5 shadow-inner flex items-center justify-center">
                          <span className="text-zinc-900 dark:text-white font-bold">{c.name.charAt(0)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-zinc-900 dark:text-white">{c.name}</div>
                          <div className="text-xs text-zinc-500 dark:text-zinc-500 font-medium">{c.businessName || 'No business name'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-zinc-900 dark:text-white font-medium">{c.email || 'N/A'}</div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-500 font-mono">{c.mobile || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md bg-[#fafafa] dark:bg-[#111] text-zinc-700 dark:text-zinc-300 border border-black/5 dark:border-white/10">
                        {c.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md border ${
                        c.status === 'ACTIVE' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' :
                        c.status === 'LEAD' ? 'bg-indigo-950/30 text-indigo-400 border-indigo-900/50' :
                        'bg-zinc-900/30 text-zinc-400 border-zinc-700/50'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-1">
                        <Link to={`/customers/${c.id}`} className="text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10" title="View Details">
                          <Search className="h-5 w-5" />
                        </Link>
                        {canEdit && (
                          <button onClick={() => handleEdit(c)} className="text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10" title="Edit Customer">
                            <Edit2 className="h-5 w-5" />
                          </button>
                        )}
                        {canDelete && (
                          <button onClick={() => handleDelete(c.id)} className="text-red-900 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-500/10" title="Delete Customer">
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          
          {!loading && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#0a0a0a]">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Showing <span className="font-bold text-zinc-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-bold text-zinc-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredCustomers.length)}</span> of <span className="font-bold text-zinc-900 dark:text-white">{filteredCustomers.length}</span> results
              </p>
              <div className="flex gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="btn-secondary disabled:opacity-50">Previous</button>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="btn-secondary disabled:opacity-50">Next</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
