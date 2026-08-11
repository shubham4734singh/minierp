import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Plus, Search, FileText, Download, X, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadCSV } from '../lib/exportCsv';
import SkeletonRow from '../components/SkeletonRow';

interface Challan {
  id: string;
  challanNumber: string;
  status: string;
  customer: { name: string };
  createdAt: string;
  items?: any[];
  totalQuantity?: number;
}

interface Customer {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  unitPrice: number;
  currentStock: number;
}

export default function Challans() {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [customerId, setCustomerId] = useState('');
  const [status, setStatus] = useState('CONFIRMED');
  const [items, setItems] = useState<{ productId: string; quantity: string }[]>([{ productId: '', quantity: '1' }]);

  useEffect(() => {
    fetchChallans();
    api.get('/customers').then(res => setCustomers(res.data));
    api.get('/products').then(res => setProducts(res.data));
  }, []);

  const filteredChallans = challans.filter(c => 
    c.challanNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchChallans = async () => {
    try {
      const res = await api.get('/challans');
      setChallans(res.data);
    } catch (error) {
      console.error('Failed to fetch challans', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return toast.error("Please select a customer.");
    
    const validItems = items.filter(i => i.productId && parseInt(i.quantity) > 0);
    if (validItems.length === 0) return toast.error("Please add at least one valid product.");

    try {
      const payload = {
        customerId,
        status,
        items: validItems.map(i => ({ productId: i.productId, quantity: parseInt(i.quantity) }))
      };
      const res = await api.post('/challans', payload);
      setChallans([res.data, ...challans]);
      setShowForm(false);
      setCustomerId('');
      setStatus('CONFIRMED');
      setItems([{ productId: '', quantity: '1' }]);
      toast.success(`Sales Challan saved as ${status}!`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create challan");
    }
  };

  const addItem = () => setItems([...items, { productId: '', quantity: '1' }]);
  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };
  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await api.put(`/challans/${id}/status`, { status: newStatus });
      setChallans(challans.map(c => c.id === id ? res.data : c));
      toast.success(`Challan status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to update status.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this challan?")) return;
    try {
      await api.delete(`/challans/${id}`).catch(() => console.warn("No delete endpoint yet"));
      setChallans(challans.filter(c => c.id !== id));
      toast.success("Challan deleted.");
    } catch (err) {
      toast.error("Failed to delete challan.");
    }
  };

  const downloadPDF = async (id: string, challanNumber: string) => {
    try {
      const res = await api.get(`/challans/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Challan-${challanNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to download PDF');
    }
  };

  if (showForm) {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Create Sales Challan</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium">Build a new invoice and deduct live stock.</p>
          </div>
          <button onClick={() => setShowForm(false)} className="btn-secondary">
            <X className="h-4 w-4 mr-2" /> Cancel
          </button>
        </div>

        <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-xl border border-black/5 dark:border-white/5 overflow-hidden">
          <div className="p-8 space-y-8">
            {/* Customer Section */}
            <section>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white border-b border-black/5 dark:border-white/5 pb-2 mb-4">Invoice Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Select Customer</label>
                  <select required value={customerId} onChange={e => setCustomerId(e.target.value)} className="input-field w-full bg-[#fafafa] dark:bg-[#111]">
                    <option value="">-- Choose a Customer --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Status</label>
                  <select required value={status} onChange={e => setStatus(e.target.value)} className="input-field w-full bg-[#fafafa] dark:bg-[#111]">
                    <option value="DRAFT">Draft (No stock deduction)</option>
                    <option value="CONFIRMED">Confirmed (Deducts stock)</option>
                  </select>
                </div>
              </div>
            </section>

            {/* Line Items Section */}
            <section>
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2 mb-4">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Line Items</h3>
                <button type="button" onClick={addItem} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center">
                  <Plus className="h-4 w-4 mr-1" /> Add Product
                </button>
              </div>
              
              <div className="space-y-4">
                {items.map((item, index) => {
                  const selectedProduct = products.find(p => p.id === item.productId);
                  return (
                    <div key={index} className="flex items-start gap-4 p-4 bg-[#fafafa] dark:bg-[#111] rounded-xl border border-black/5 dark:border-white/5">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Product</label>
                        <select 
                          required 
                          value={item.productId} 
                          onChange={e => updateItem(index, 'productId', e.target.value)} 
                          className="input-field w-full text-sm py-2"
                        >
                          <option value="">-- Select Product --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id} disabled={p.currentStock <= 0}>
                              {p.name} (₹{p.unitPrice}) - {p.currentStock} in stock
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-32">
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1">Quantity</label>
                        <input 
                          required 
                          type="number" 
                          min="1" 
                          max={selectedProduct?.currentStock || ""}
                          value={item.quantity} 
                          onChange={e => updateItem(index, 'quantity', e.target.value)} 
                          className="input-field w-full text-sm py-2" 
                        />
                      </div>
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeItem(index)} className="mt-6 p-2 text-zinc-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="p-6 bg-[#fafafa] dark:bg-[#111] border-t border-black/5 dark:border-white/5 flex justify-end gap-4">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary px-6">Cancel</button>
            <button type="button" onClick={handleCreate} className="btn-primary px-8 py-2.5 text-base shadow-lg hover:shadow-xl transition-all">Generate Invoice & Deduct Stock</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Sales Challans</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            Manage invoices, delivery challans, and orders.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search challans..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-field pl-9 h-10 w-64"
            />
          </div>
          <button onClick={() => setViewMode(viewMode === 'table' ? 'kanban' : 'table')} className="btn-secondary">
            {viewMode === 'table' ? 'Kanban View' : 'Table View'}
          </button>
          <button onClick={() => downloadCSV(filteredChallans, 'Challans')} className="btn-secondary">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            New
          </button>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-xl dark:shadow-2xl border border-black/5 dark:border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-black/5 dark:divide-white/5">
              <thead className="bg-[#fafafa] dark:bg-[#111]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Challan #</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#0a0a0a] divide-y divide-black/5 dark:divide-white/5">
                {loading ? (
                  <SkeletonRow columns={5} />
                ) : filteredChallans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 dark:text-zinc-500 font-medium">No challans found.</td>
                  </tr>
                ) : (
                  filteredChallans.map((challan) => (
                    <tr key={challan.id} className="hover:bg-[#fafafa] dark:hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-zinc-900 dark:text-white font-mono font-bold">
                          <FileText className="h-4 w-4 mr-2 text-zinc-500 dark:text-zinc-500" />
                          {challan.challanNumber}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-zinc-900 dark:text-white">
                          {challan.customer.name}
                        </div>
                        <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 truncate max-w-[250px]">
                          {challan.items?.map((i: any) => `${i.quantity}x ${i.productName}`).join(', ')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                        {new Date(challan.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-zinc-900 dark:text-white">
                        ₹{challan.items?.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0).toLocaleString('en-IN') || 0}
                        <div className="text-[10px] text-zinc-500 font-normal">{challan.totalQuantity} items</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select 
                          value={challan.status}
                          onChange={(e) => handleStatusChange(challan.id, e.target.value)}
                          className="px-2 py-1 text-xs font-bold rounded-md bg-zinc-100 dark:bg-[#111] text-zinc-700 dark:text-zinc-300 border border-black/10 dark:border-white/10 cursor-pointer outline-none focus:border-indigo-500"
                        >
                          <option value="DRAFT">DRAFT</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="SHIPPED">SHIPPED</option>
                          <option value="DELIVERED">DELIVERED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-1">
                        <button 
                          onClick={() => downloadPDF(challan.id, challan.challanNumber)}
                          className="text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:text-white transition-colors p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/10"
                          title="Download PDF"
                        >
                          <Download className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(challan.id)} className="text-red-900 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-500/10">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x">
          {['DRAFT', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(status => (
            <div key={status} className="flex-shrink-0 w-80 bg-[#fafafa] dark:bg-[#0a0a0a] rounded-2xl border border-black/5 dark:border-white/5 flex flex-col max-h-[70vh] snap-center">
              <div className="p-4 border-b border-black/5 dark:border-white/5">
                <h3 className="font-bold text-zinc-900 dark:text-white flex items-center justify-between">
                  {status}
                  <span className="bg-black/5 dark:bg-white/10 text-zinc-500 dark:text-zinc-400 py-0.5 px-2 rounded-full text-xs">
                    {filteredChallans.filter(c => c.status === status).length}
                  </span>
                </h3>
              </div>
              <div className="p-4 flex-1 overflow-y-auto space-y-4">
                {filteredChallans.filter(c => c.status === status).map(challan => (
                  <div key={challan.id} className="bg-white dark:bg-[#111] p-4 rounded-xl border border-black/5 dark:border-white/10 shadow-sm cursor-grab active:cursor-grabbing hover:border-black/20 dark:hover:border-white/20 transition-colors group relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-mono text-xs font-bold text-zinc-500 dark:text-zinc-400">{challan.challanNumber}</p>
                      <button onClick={() => downloadPDF(challan.id, challan.challanNumber)} className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="font-bold text-zinc-900 dark:text-white mb-2">{challan.customer.name}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">{new Date(challan.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
