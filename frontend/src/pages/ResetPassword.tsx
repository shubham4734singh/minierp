import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PackageSearch, KeyRound } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error('Invalid token. Please request a new link.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', { token, newPassword: password });
      toast.success(res.data.message);
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#050505] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-zinc-900 dark:text-white">
          <div className="bg-white dark:bg-[#111] p-3 rounded-2xl shadow-xl border border-black/5 dark:border-white/5 relative group">
            <PackageSearch className="h-10 w-10 relative z-10" strokeWidth={2.5} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Reset Password
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Enter your new password below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#0a0a0a] py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-black/5 dark:border-white/5 relative overflow-hidden">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">
                New Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="input-field pl-11 h-12 text-base w-full rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#111] px-4 py-3.5 text-zinc-900 dark:text-white placeholder-zinc-600 focus:border-white/30 focus:outline-none transition-all"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-black bg-white hover:bg-zinc-200 transition-all disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
