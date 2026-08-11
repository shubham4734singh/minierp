import { Link } from 'react-router-dom';
import { ArrowRight, Box, Target, Layers, LayoutGrid } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import SpotlightCard from '../components/SpotlightCard';
import ThemeToggle from '../components/ThemeToggle';

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  
  // 3D Tilt Setup
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);
  
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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#0a0a0a] text-zinc-900 dark:text-zinc-50 font-sans selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Navigation */}
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white dark:bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="h-8 w-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center rounded-sm transform transition-transform group-hover:rotate-12">
                <LayoutGrid className="h-4 w-4" strokeWidth={3} />
              </div>
              <span className="text-xl font-bold tracking-tight">MiniERP.</span>
            </div>
            <div className="flex items-center gap-6">
              <ThemeToggle />
              <Link to="/login" className="text-sm font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition-colors">
                Sign In
              </Link>
              <Link to="/login" className="text-sm font-bold bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 rounded-full hover:scale-105 transition-transform">
                Enter Portal
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden flex flex-col items-center text-center">
        {/* Subtle Ambient Light */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-zinc-800/30 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
        <div className="max-w-5xl mx-auto px-6 md:px-12 relative z-10 flex flex-col items-center">
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }}
            className="text-6xl md:text-8xl font-bold tracking-tighter text-zinc-900 dark:text-white mb-8 leading-[1.1] max-w-4xl"
          >
            Enterprise clarity. <br />
            <span className="text-zinc-500 dark:text-zinc-500">Ruthless efficiency.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] as any }}
            className="text-lg md:text-xl text-zinc-500 dark:text-zinc-400 font-medium max-w-2xl mb-12 leading-relaxed"
          >
            A centralized nervous system for your entire business. Seamlessly synchronize inventory, relationships, and complex sales pipelines in real time.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] as any }}
            className="flex items-center gap-4"
          >
            <Link to="/login" className="group flex items-center gap-2 bg-white text-black text-sm font-bold px-8 py-4 rounded-full hover:bg-zinc-200 transition-colors">
              Initialize Dashboard
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </motion.div>
        </div>

        {/* Abstract UI Preview */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] as any }}
          className="w-full max-w-6xl mx-auto px-6 md:px-12 mt-24"
          style={{ perspective: 2000 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div 
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative rounded-2xl bg-zinc-900 border border-black/5 dark:border-white/10 p-2 shadow-xl dark:shadow-2xl shadow-black/50 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none transform-gpu" style={{ transform: "translateZ(50px)" }}></div>
            
            <div className="bg-white dark:bg-[#0a0a0a] rounded-xl overflow-hidden border border-black/5 dark:border-white/5 h-[400px] flex flex-col relative">
              {/* Mock App Header */}
              <div className="h-12 border-b border-black/5 dark:border-white/5 flex items-center px-4 gap-4 bg-black/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-800"></div>
                </div>
                <div className="flex-1 flex justify-center">
                  <div className="h-6 w-64 bg-zinc-900 rounded-md border border-black/5 dark:border-white/5 flex items-center justify-center">
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-500 font-mono">minierp.app/dashboard</span>
                  </div>
                </div>
              </div>
              
              {/* Mock App Body with Advanced Animations */}
              <div className="flex-1 flex p-6 gap-6 relative overflow-hidden">
                {/* Glowing Background Orb */}
                <motion.div 
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-zinc-500/10 blur-[80px] rounded-full pointer-events-none"
                />

                <div className="w-48 hidden md:flex flex-col gap-3 z-10">
                  <div className="h-10 w-full bg-white/5 rounded-lg border border-black/5 dark:border-white/10 flex items-center px-3">
                    <div className="h-4 w-4 rounded bg-zinc-400 mr-2"></div>
                    <div className="h-3 w-16 bg-zinc-400/50 rounded"></div>
                  </div>
                  <div className="h-10 w-full bg-zinc-900/50 rounded-lg border border-black/5 dark:border-white/5 flex items-center px-3">
                    <div className="h-4 w-4 rounded bg-zinc-700 mr-2"></div>
                    <div className="h-3 w-20 bg-zinc-700 rounded"></div>
                  </div>
                  <div className="h-10 w-full bg-zinc-900/50 rounded-lg border border-black/5 dark:border-white/5 flex items-center px-3">
                    <div className="h-4 w-4 rounded bg-zinc-700 mr-2"></div>
                    <div className="h-3 w-12 bg-zinc-700 rounded"></div>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col gap-6 z-10">
                  <div className="flex gap-6 h-32">
                    <div className="flex-1 bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-black/5 dark:border-white/10 p-5 flex flex-col justify-end relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4">
                        <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>
                      </div>
                      <div className="text-xs font-medium text-zinc-500 dark:text-zinc-500 mb-1">Total Revenue</div>
                      <div className="text-2xl font-bold text-zinc-900 dark:text-white font-mono">₹48,290</div>
                      <motion.div 
                        initial={{ width: "0%" }}
                        animate={{ width: "70%" }}
                        transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                        className="h-1 bg-white/80 mt-3 rounded-full"
                      />
                    </div>
                    
                    <div className="flex-1 bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-black/5 dark:border-white/10 p-5 flex items-end justify-between relative overflow-hidden">
                      <div className="w-full flex items-end gap-2 h-full pt-6">
                        {[40, 70, 45, 90, 65, 100].map((h, i) => (
                          <motion.div 
                            key={i}
                            initial={{ height: 0 }}
                            animate={{ height: `${h}%` }}
                            transition={{ duration: 0.8, delay: 0.6 + (i * 0.1) }}
                            className="flex-1 bg-white/20 rounded-t-sm hover:bg-white/40 transition-colors"
                          />
                        ))}
                      </div>
                      <div className="absolute top-4 left-5 text-xs font-medium text-zinc-500 dark:text-zinc-500">Weekly Orders</div>
                    </div>
                  </div>
                  
                  <div className="flex-1 bg-zinc-900/80 backdrop-blur-sm rounded-xl border border-black/5 dark:border-white/10 p-5 overflow-hidden">
                    <div className="text-xs font-medium text-zinc-500 dark:text-zinc-500 mb-4">Live Activity Stream</div>
                    <div className="space-y-3 relative">
                      {/* Animated scrolling list */}
                      <motion.div 
                        animate={{ y: [0, -48] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
                        className="space-y-3"
                      >
                        {[
                          { action: "Challan Generated", id: "#CH-1049", color: "text-zinc-900 dark:text-white", bg: "bg-white/20" },
                          { action: "Stock Updated", id: "Wireless Mouse", color: "text-zinc-500 dark:text-zinc-400", bg: "bg-white/10" },
                          { action: "Payment Received", id: "₹12,400", color: "text-zinc-700 dark:text-zinc-300", bg: "bg-white/10" },
                          { action: "Challan Generated", id: "#CH-1050", color: "text-zinc-900 dark:text-white", bg: "bg-white/20" },
                        ].map((item, i) => (
                          <div key={i} className="h-10 w-full bg-black/40 rounded-lg border border-black/5 dark:border-white/5 flex items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                              <div className={`h-2 w-2 rounded-full ${item.bg}`}></div>
                              <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{item.action}</span>
                            </div>
                            <span className={`text-xs font-mono font-bold ${item.color}`}>{item.id}</span>
                          </div>
                        ))}
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fog overlay for bottom */}
              <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent pointer-events-none z-20"></div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Philosophy / Features */}
      <section className="py-32 bg-white dark:bg-[#0a0a0a] border-t border-black/5 dark:border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid md:grid-cols-3 gap-8">
            <SpotlightCard className="p-8">
              <Box className="h-8 w-8 text-zinc-900 dark:text-white mb-6" strokeWidth={1.5} />
              <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">Atomic Inventory.</h3>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                Every physical item is tracked with uncompromising precision. Automated stock deductions occur synchronously when challans are generated.
              </p>
            </SpotlightCard>
            <SpotlightCard className="p-8">
              <Target className="h-8 w-8 text-zinc-900 dark:text-white mb-6" strokeWidth={1.5} />
              <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">Role-Based Primitives.</h3>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                Strict compartmentalization. Sales creates challans. Warehouse manages stock. Administrators command everything. Zero overlap.
              </p>
            </SpotlightCard>
            <SpotlightCard className="p-8">
              <Layers className="h-8 w-8 text-zinc-900 dark:text-white mb-6" strokeWidth={1.5} />
              <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-4">Relational Integrity.</h3>
              <p className="text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                Powered by a robust PostgreSQL backbone. Customer records are permanently bound to their historical challan and invoice data.
              </p>
            </SpotlightCard>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-black/5 dark:border-white/5 text-center">
        <p className="text-sm font-medium text-zinc-600">
          &copy; {new Date().getFullYear()} MiniERP Systems. Industrial Grade software.
        </p>
      </footer>
    </div>
  );
}
