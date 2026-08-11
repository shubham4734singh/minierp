import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PackageSearch, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success(res.data.message || 'If an account exists, a link was sent.');
    } catch (err: any) {
      toast.error('An error occurred. Please try again.');
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
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">
          Enter your email to receive a reset link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#0a0a0a] py-8 px-4 shadow-2xl sm:rounded-3xl sm:px-10 border border-black/5 dark:border-white/5 relative overflow-hidden">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-zinc-900 dark:text-white mb-2">
                Email address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-field pl-11 h-12 text-base w-full rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#111] px-4 py-3.5 text-zinc-900 dark:text-white placeholder-zinc-600 focus:border-white/30 focus:outline-none transition-all"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-black bg-white hover:bg-zinc-200 transition-all disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <div className="text-sm text-center">
              <Link to="/login" className="font-bold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors">
                Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
