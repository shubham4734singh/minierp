import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, LayoutDashboard, Users, Package, FileText, UserCog, CornerDownLeft } from 'lucide-react';

interface CmdKMenuProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  userRole?: string;
}

export default function CmdKMenu({ isOpen, setIsOpen, userRole }: CmdKMenuProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, setIsOpen]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const allCommands = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { name: 'Customers', path: '/customers', icon: Users, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { name: 'Products', path: '/products', icon: Package, roles: ['ADMIN', 'WAREHOUSE', 'SALES'] },
    { name: 'Sales Challans', path: '/challans', icon: FileText, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { name: 'Team Settings', path: '/users', icon: UserCog, roles: ['ADMIN'] },
  ];

  const allowedCommands = allCommands.filter(cmd => cmd.roles.includes(userRole || 'ADMIN'));
  
  const filteredCommands = allowedCommands.filter(cmd => 
    cmd.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    setIsOpen(false);
    setQuery('');
    navigate(path);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 pointer-events-none z-[101] flex items-start justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl bg-white dark:bg-[#0a0a0a] rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 overflow-hidden pointer-events-auto flex flex-col"
            >
              <div className="flex items-center px-4 py-4 border-b border-black/5 dark:border-white/5 relative">
                <Search className="h-5 w-5 text-zinc-400 absolute left-4" />
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What do you need?"
                  className="w-full bg-transparent border-none outline-none focus:ring-0 pl-10 pr-4 text-lg text-zinc-900 dark:text-white placeholder:text-zinc-400"
                />
                <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-zinc-400 uppercase tracking-widest absolute right-4">
                  <kbd className="px-2 py-1 bg-zinc-100 dark:bg-white/5 rounded border border-black/5 dark:border-white/10">esc</kbd>
                  to close
                </div>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="p-8 text-center text-zinc-500 font-medium">
                    No results found for "{query}"
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">Navigation</p>
                    {filteredCommands.map((cmd) => {
                      const Icon = cmd.icon;
                      return (
                        <button
                          key={cmd.name}
                          onClick={() => handleSelect(cmd.path)}
                          className="w-full flex items-center justify-between px-3 py-3 rounded-xl hover:bg-zinc-100 dark:hover:bg-white/5 transition-colors text-left group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-[#111] rounded-lg border border-black/5 dark:border-white/5 shadow-sm group-hover:scale-110 transition-transform">
                              <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-300" />
                            </div>
                            <span className="font-medium text-zinc-900 dark:text-white">{cmd.name}</span>
                          </div>
                          <CornerDownLeft className="h-4 w-4 text-zinc-300 dark:text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
