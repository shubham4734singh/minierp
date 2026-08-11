import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { ArrowLeft, Phone, Mail, MapPin, Calendar, FileText, Briefcase } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CustomerDetail {
  id: string;
  name: string;
  mobile: string;
  email: string | null;
  businessName: string | null;
  gstNumber: string | null;
  type: string;
  status: string;
  address: string | null;
  followUpDate: string | null;
  notes: string | null;
  createdAt: string;
  salesChallans: any[];
}

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Note form state
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesInput, setNotesInput] = useState('');
  const [followUpInput, setFollowUpInput] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const res = await api.get(`/customers/${id}`);
      setCustomer(res.data);
      setNotesInput(res.data.notes || '');
      setFollowUpInput(res.data.followUpDate ? new Date(res.data.followUpDate).toISOString().split('T')[0] : '');
    } catch (error) {
      console.error('Failed to fetch customer details', error);
      toast.error('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!customer) return;
    setSavingNotes(true);
    try {
      const res = await api.put(`/customers/${customer.id}`, {
        notes: notesInput,
        followUpDate: followUpInput || null
      });
      setCustomer({ ...customer, notes: res.data.notes, followUpDate: res.data.followUpDate });
      setEditingNotes(false);
      toast.success('Notes and follow-up updated');
    } catch (error) {
      toast.error('Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center font-bold text-zinc-500">Loading customer profile...</div>;
  }

  if (!customer) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold mb-4">Customer not found</h2>
        <Link to="/customers" className="btn-secondary inline-flex">Go Back</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/customers" className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors text-zinc-500 dark:text-zinc-400">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight flex items-center gap-3">
            {customer.name}
            <span className={`px-2.5 py-1 text-xs leading-5 font-bold rounded-md border ${
              customer.status === 'ACTIVE' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' :
              customer.status === 'LEAD' ? 'bg-indigo-950/30 text-indigo-400 border-indigo-900/50' :
              'bg-zinc-900/30 text-zinc-400 border-zinc-700/50'
            }`}>
              {customer.status}
            </span>
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400 font-medium flex gap-4">
            <span>ID: {customer.id.slice(0, 8)}</span>
            <span>Joined: {new Date(customer.createdAt).toLocaleDateString()}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-xl dark:shadow-2xl border border-black/5 dark:border-white/5 p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 border-b border-black/5 dark:border-white/5 pb-2">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Briefcase className="h-5 w-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Business Name</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{customer.businessName || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Mobile</p>
                  <p className="font-mono font-medium text-zinc-900 dark:text-white">{customer.mobile}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Email</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{customer.email || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">GST Number</p>
                  <p className="font-mono font-medium text-zinc-900 dark:text-white">{customer.gstNumber || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:col-span-2">
                <MapPin className="h-5 w-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Address</p>
                  <p className="font-medium text-zinc-900 dark:text-white">{customer.address || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-xl dark:shadow-2xl border border-black/5 dark:border-white/5 p-6">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-4 border-b border-black/5 dark:border-white/5 pb-2">
              Recent Sales Challans
            </h3>
            {customer.salesChallans.length === 0 ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">No sales challans recorded for this customer yet.</p>
            ) : (
              <div className="space-y-3">
                {customer.salesChallans.map((challan: any) => (
                  <div key={challan.id} className="flex items-center justify-between p-3 rounded-lg bg-[#fafafa] dark:bg-[#111] border border-black/5 dark:border-white/5">
                    <div>
                      <p className="font-mono font-bold text-sm text-zinc-900 dark:text-white">{challan.challanNumber}</p>
                      <p className="text-xs text-zinc-500 font-medium">{new Date(challan.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-0.5 text-xs font-bold bg-white/5 rounded border border-white/10">{challan.status}</span>
                      <p className="text-xs text-zinc-500 font-medium mt-1">{challan.totalQuantity} items</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: CRM & Notes */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-xl dark:shadow-2xl border border-black/5 dark:border-white/5 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4 border-b border-black/5 dark:border-white/5 pb-2">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                CRM & Notes
              </h3>
              {!editingNotes && (
                <button onClick={() => setEditingNotes(true)} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                  Edit Notes
                </button>
              )}
            </div>

            {editingNotes ? (
              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Follow-up Date</label>
                  <input type="date" value={followUpInput} onChange={e => setFollowUpInput(e.target.value)} className="input-field py-1.5 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">Notes</label>
                  <textarea 
                    rows={6}
                    value={notesInput} 
                    onChange={e => setNotesInput(e.target.value)} 
                    className="input-field py-2 text-sm resize-none" 
                    placeholder="Enter discussion notes, requirements..."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button onClick={() => setEditingNotes(false)} className="btn-secondary py-1.5 px-3 text-xs" disabled={savingNotes}>Cancel</button>
                  <button onClick={handleSaveNotes} className="btn-primary py-1.5 px-3 text-xs" disabled={savingNotes}>
                    {savingNotes ? 'Saving...' : 'Save CRM Data'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 space-y-4">
                <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                  <p className="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wider mb-1">Scheduled Follow-up</p>
                  <p className="font-medium text-indigo-900 dark:text-indigo-100">
                    {customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'No follow-up scheduled'}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Customer Notes</p>
                  <div className="p-3 bg-[#fafafa] dark:bg-[#111] rounded-lg border border-black/5 dark:border-white/5 min-h-[120px] text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                    {customer.notes || <span className="text-zinc-400 italic">No notes added yet. Click edit to add notes.</span>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
