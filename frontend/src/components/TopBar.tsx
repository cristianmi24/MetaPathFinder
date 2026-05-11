import { Search, Bell, Menu, LogOut, User, Settings, LayoutDashboard, GraduationCap, BarChart3, TestTube2, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { cn } from '../lib/utils';

export function TopBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { reset, role, userId, user } = useCognitiveStore();
  const navigate = useNavigate();
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const { theme, toggleTheme } = useTheme();

  const userName = user ? `${user.name} ${user.lastName}` : (role === 'student' ? 'Mateo Reatiga' : 'Dra. Silva');
  const userInitials = user ? `${user.name[0]}${user.lastName[0]}`.toUpperCase() : (role === 'student' ? 'MR' : 'DS');

  const avatarUrl = user 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&bold=true`
    : (role === 'student' 
        ? "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=150&auto=format&fit=crop" 
        : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop");

  const mobileItems = role === 'student'
    ? [
        { icon: User, label: 'Mi Perfil', path: '/' },
        { icon: GraduationCap, label: 'Evaluaciones', path: '/evaluations' },
        { icon: BarChart3, label: 'Analíticas', path: '/analytics' },
      ]
    : [
        { icon: LayoutDashboard, label: 'Dashboards', path: '/' },
        { icon: TestTube2, label: 'Experimentos', path: '/experiments' },
      ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    reset();
    navigate('/');
  };

  const handleNavigate = (path: string) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      <header className="glass fixed top-0 right-0 left-0 lg:left-64 z-50 px-6 py-4 flex items-center justify-between border-b border-outline-variant/10">
        <div className="flex items-center gap-4">
          <button className="lg:hidden p-2 text-primary" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
          <img src="/logoedutlan.png" alt="EduTlan" className="h-9 w-auto object-contain" />
          <div className="hidden md:flex items-center bg-surface-container-high rounded-full px-4 py-2 w-64 group focus-within:ring-2 focus-within:ring-primary transition-all">
            <Search className="w-4 h-4 text-on-surface-variant group-focus-within:text-primary" />
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="bg-transparent border-none focus:ring-0 text-sm ml-2 w-full text-on-surface outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            title={`Cambiar a tema ${theme === 'light' ? 'Oscuro' : 'Claro'}`}
            className={cn(
              'p-2 rounded-full border shadow-sm transition-colors hidden sm:inline-flex',
              theme === 'light'
                ? 'bg-white/20 border-white/30 text-slate-900 hover:bg-white/30'
                : 'bg-slate-800/80 border-white/20 text-white hover:bg-white/20'
            )}
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>

          <button className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full relative transition-colors hidden sm:inline-flex">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
          </button>

          <div className="relative" ref={profileMenuRef}>
            <button 
              className="flex items-center gap-3 ml-2 cursor-pointer group"
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            >
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden group-hover:scale-105 transition-transform shadow-sm bg-surface-container flex items-center justify-center">
                <img 
                  src={avatarUrl} 
                  alt={userInitials} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </button>

            <AnimatePresence>
              {isProfileMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-3 w-64 bento-card p-2 z-[60] bg-surface shadow-xl"
                >
                  <div className="p-3 border-b border-outline-variant/20 mb-2">
                    <p className="font-bold text-on-surface truncate">{userName}</p>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">{role === 'student' ? 'Estudiante' : 'Administrador'}</p>
                    {userId && <p className="text-[9px] text-outline mt-1 font-mono">{userId}</p>}
                  </div>

                  <button 
                    onClick={() => { navigate('/settings'); setIsProfileMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-variant transition-colors"
                  >
                    <Settings className="w-4 h-4" /> Configuración
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-error hover:bg-error-container/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Cerrar Sesión
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-surface/70 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            <motion.aside
              ref={mobileMenuRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="fixed inset-y-0 left-0 z-50 w-72 max-w-full bg-surface p-5 shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
                  <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
                </div>
                <div>
                  <p className="font-bold text-xl leading-tight tracking-tight">Meta-Pathfinder</p>
                  <p className="text-[11px] uppercase tracking-[.24em] text-on-surface-variant mt-1">{role === 'student' ? 'Estudiante' : 'Administrador'}</p>
                </div>
              </div>

              <div className="space-y-2">
                {mobileItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => handleNavigate(item.path)}
                    className="w-full flex items-center gap-3 rounded-3xl px-4 py-4 text-left text-sm font-semibold text-on-surface transition-all hover:bg-surface-container-highest"
                  >
                    <item.icon className="w-5 h-5 text-primary" />
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-8 border-t border-outline-variant/20 pt-5 space-y-2">
                <button
                  onClick={() => handleNavigate('/settings')}
                  className="w-full flex items-center gap-3 rounded-3xl px-4 py-4 text-left text-sm font-semibold text-on-surface transition-all hover:bg-surface-container-highest"
                >
                  <Settings className="w-5 h-5 text-primary" />
                  Configuración
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 rounded-3xl px-4 py-4 text-left text-sm font-semibold text-error transition-all hover:bg-error-container/20"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar Sesión
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
