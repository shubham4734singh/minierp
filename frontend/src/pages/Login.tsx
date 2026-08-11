import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Loader2, LayoutGrid, Activity, Box } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Login() {
  const [email, setEmail] = useState('admin@erp.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 3D Tilt Setup for Left Pane
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 30 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 30 });
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const slideUp = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } 
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fafafa] dark:bg-[#050505] text-zinc-900 dark:text-zinc-50 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black overflow-hidden">
      {/* Left Pane - Interactive Aurora & 3D Cards */}
      <div 
        className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden bg-white dark:bg-[#0a0a0a] border-r border-black/5 dark:border-white/5 perspective-1000"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Monochromatic Aurora Effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              x: ['-20%', '20%', '-20%'],
              y: ['-20%', '20%', '-20%'],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-zinc-700/10 rounded-full blur-[100px]"
          />
          <motion.div 
            animate={{ 
              x: ['20%', '-20%', '20%'],
              y: ['20%', '-20%', '20%'],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-zinc-500/10 rounded-full blur-[120px]"
          />
        </div>
        
        <Link to="/" className="relative z-10 flex items-center gap-3 group cursor-pointer w-fit">
          <div className="h-8 w-8 bg-white text-black flex items-center justify-center rounded-sm transform transition-transform group-hover:rotate-12">
            <LayoutGrid className="h-4 w-4" strokeWidth={3} />
          </div>
          <span className="text-xl font-bold tracking-tight">MiniERP.</span>
        </Link>
        
        {/* 3D Floating Data Widgets */}
        <motion.div 
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative z-10 flex-1 flex flex-col justify-center gap-6 max-w-md mx-auto w-full mt-12"
        >
          <motion.div 
            style={{ transform: "translateZ(40px)" }}
            className="bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-xl p-6 rounded-2xl flex items-center gap-4 shadow-xl dark:shadow-2xl transition-colors hover:bg-zinc-100 dark:hover:bg-white/10 hover:border-white/20"
          >
            <div className="bg-white/10 p-3 rounded-xl"><Activity className="h-6 w-6 text-zinc-900 dark:text-white" /></div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Live Transactions</p>
              <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">1,048,230</p>
            </div>
          </motion.div>
          
          <motion.div 
            style={{ transform: "translateZ(80px)" }}
            className="bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-xl p-6 rounded-2xl flex items-center gap-4 shadow-xl dark:shadow-2xl ml-12 transition-colors hover:bg-zinc-100 dark:hover:bg-white/10 hover:border-white/20"
          >
            <div className="bg-white/10 p-3 rounded-xl"><Box className="h-6 w-6 text-zinc-900 dark:text-white" /></div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Inventory Synced</p>
              <p className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">Real-time</p>
            </div>
          </motion.div>
        </motion.div>

        <div className="relative z-10 max-w-lg mt-auto pb-12">
          <h1 className="text-5xl font-bold tracking-tighter mb-6 leading-[1.1]">
            Uncompromising <br />
            <span className="text-zinc-500 dark:text-zinc-500">control.</span>
          </h1>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 relative">
        <motion.div 
          initial="hidden"
          animate="show"
          variants={staggerContainer}
          className="mx-auto w-full max-w-sm lg:w-[400px] relative z-10"
        >
          <motion.div variants={slideUp}>
            <Link to="/" className="lg:hidden flex items-center gap-3 group cursor-pointer mb-12">
              <div className="h-8 w-8 bg-white text-black flex items-center justify-center rounded-sm">
                <LayoutGrid className="h-4 w-4" strokeWidth={3} />
              </div>
              <span className="text-xl font-bold tracking-tight">MiniERP.</span>
            </Link>
          </motion.div>
          
          <motion.div variants={slideUp}>
            <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Log in</h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 font-medium">Authenticate to access your workspace.</p>
          </motion.div>

          <motion.div variants={slideUp} className="mt-8">
            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded border border-red-900/50 bg-red-950/20 p-4 text-sm font-medium text-red-400 flex items-center">
                  {error}
                </motion.div>
              )}

              <motion.div variants={slideUp}>
                <Label htmlFor="email" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Email address</Label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-500 to-white rounded-xl opacity-0 group-focus-within:opacity-20 transition duration-500 blur"></div>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="relative w-full rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-4 py-6 text-base transition-all"
                    placeholder="admin@erp.com"
                  />
                </div>
              </motion.div>

              <motion.div variants={slideUp}>
                <Label htmlFor="password" className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">Password</Label>
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-500 to-white rounded-xl opacity-0 group-focus-within:opacity-20 transition duration-500 blur"></div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="relative w-full rounded-xl border border-black/5 dark:border-white/10 bg-white dark:bg-[#0a0a0a] px-4 py-6 text-base transition-all"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex justify-end mt-2">
                  <Link to="/forgot-password" className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-white transition-colors">
                    Forgot password?
                  </Link>
                </div>
              </motion.div>

              <motion.div variants={slideUp}>
                <Button
                  type="submit"
                  disabled={loading}
                  className="relative w-full h-12 flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 text-sm font-bold rounded-xl transition-all mt-6 group overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {loading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Initialize Session
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </Button>
              </motion.div>
            </form>
            
            <motion.div variants={slideUp} className="mt-12 pt-8 border-t border-black/5 dark:border-white/5">
              <p className="text-[10px] text-zinc-500 dark:text-zinc-500 font-bold uppercase tracking-widest mb-4 text-center">
                Developer Fast-Switch
              </p>
              <div className="grid grid-cols-2 gap-3">
                {['Admin', 'Sales', 'Warehouse', 'Accounts'].map((role) => (
                  <button 
                    key={role}
                    type="button" 
                    onClick={() => { setEmail(`${role.toLowerCase()}@erp.com`); setPassword('password123'); }}
                    className="text-xs bg-white dark:bg-[#0a0a0a] hover:bg-[#fafafa] dark:bg-[#111] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white font-medium py-3 px-2 rounded-lg border border-black/5 dark:border-white/5 transition-all group relative overflow-hidden"
                  >
                    <span className="relative z-10">{role}</span>
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
