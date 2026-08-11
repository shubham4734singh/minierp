import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation, useOutlet } from 'react-router-dom';
import { Users, Package, FileText, LogOut, LayoutDashboard, Search, Bell, PackageSearch, ChevronRight, UserCog, ShieldAlert } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import ThemeToggle from './ThemeToggle';
import { socket } from '../lib/socket';
import CmdKMenu from './CmdKMenu';
import { AnimatePresence, motion } from 'framer-motion';

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentOutlet = useOutlet();
  const [user, setUser] = useState<any>(null);
  const [cmdKOpen, setCmdKOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCmdKOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    socket.on('new_challan', (data) => {
      toast.success(data.message, {
        style: {
          borderRadius: '10px',
          background: '#111',
          color: '#fff',
        },
      });
    });

    return () => {
      socket.off('new_challan');
    };
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/');
    } else {
      setUser(JSON.parse(userData));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { name: 'Customers', path: '/customers', icon: Users, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { name: 'Products', path: '/products', icon: Package, roles: ['ADMIN', 'WAREHOUSE', 'SALES'] },
    { name: 'Sales Challans', path: '/challans', icon: FileText, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { name: 'Team', path: '/users', icon: UserCog, roles: ['ADMIN'] },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert, roles: ['ADMIN'] },
  ];

  return (
    <div className="flex h-screen bg-[#fafafa] dark:bg-[#050505] overflow-hidden font-sans selection:bg-white selection:text-black text-zinc-900 dark:text-zinc-50">
      {/* Sidebar */}
      <div className="w-72 bg-white dark:bg-[#0a0a0a] border-r border-black/5 dark:border-white/5 flex flex-col relative z-20">
        {/* Logo */}
        <div className="h-20 flex items-center px-8 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-xl text-black shadow-lg">
              <PackageSearch className="h-5 w-5" strokeWidth={2.5} />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">MiniERP.</span>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-500 mb-4">Operations</p>
          <nav className="space-y-1.5">
            {navItems.filter(item => item.roles.includes(user?.role || 'ADMIN')).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-white/10 text-zinc-900 dark:text-white'
                      : 'text-zinc-500 dark:text-zinc-400 hover:bg-[#fafafa] dark:hover:bg-white/5 hover:text-zinc-900 dark:text-white'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                        isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-500 dark:text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-300'
                      }`}
                      strokeWidth={isActive ? 2.5 : 2}
                      aria-hidden="true"
                    />
                    {item.name}
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-zinc-900 dark:text-white/50" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-black/5 dark:border-white/5 bg-black/20">
          <div className="flex items-center p-3 bg-[#fafafa] dark:bg-[#111] rounded-xl border border-black/5 dark:border-white/5">
            <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-black font-bold shadow-inner">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3 flex-1 overflow-hidden">
              <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-xs font-medium text-zinc-500 dark:text-zinc-500 truncate">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-zinc-500 dark:text-zinc-500 hover:text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-white/10 rounded-lg transition-colors ml-1"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        
        {/* Top Header */}
        <header className="h-20 bg-white dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 flex items-center justify-between px-8 z-30 sticky top-0">
          <div className="flex items-center w-full max-w-md">
            <div className="relative w-full group">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-zinc-500 dark:text-zinc-500 group-focus-within:text-zinc-900 dark:text-white transition-colors" />
              </div>
              <input
                type="text"
                readOnly
                onClick={() => setCmdKOpen(true)}
                className="block w-full rounded-xl border border-black/5 dark:border-white/5 bg-[#fafafa] dark:bg-[#111] py-2 pl-10 pr-3 text-zinc-900 dark:text-white placeholder:text-zinc-500 dark:text-zinc-500 hover:bg-[#1a1a1a] transition-all cursor-pointer sm:text-sm sm:leading-6"
                placeholder="Search everywhere... (Cmd+K)"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button className="relative p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)] dark:bg-white dark:shadow-[0_0_10px_rgba(255,255,255,0.8)]"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: '#111',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px'
              }
            }} 
          />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -15, filter: 'blur(8px)' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto max-w-7xl"
            >
              {currentOutlet}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <CmdKMenu isOpen={cmdKOpen} setIsOpen={setCmdKOpen} userRole={user?.role} />
    </div>
  );
}
