import { Search, Bell, HelpCircle, Menu, LogOut, User, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { useNavigate } from 'react-router-dom';

export function TopBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { reset, role, userId, user } = useCognitiveStore();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  const userName = user ? `${user.name} ${user.lastName}` : (role === 'student' ? 'Mateo Reatiga' : 'Dra. Silva');
  const userInitials = user ? `${user.name[0]}${user.lastName[0]}`.toUpperCase() : (role === 'student' ? 'MR' : 'DS');

  const avatarUrl = user 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=random&color=fff&bold=true`
    : (role === 'student' 
        ? "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=150&auto=format&fit=crop" 
        : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    reset();
    navigate('/');
  };

  return (
    <header className="glass fixed top-0 right-0 left-0 lg:left-64 z-50 px-6 py-4 flex items-center justify-between border-b border-outline-variant/10">
      <div className="flex items-center gap-4">
        <button className="lg:hidden p-2 text-primary" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <Menu className="w-6 h-6" />
        </button>
        <div className="lg:hidden flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 object-contain" />
          <span className="font-bold text-primary tracking-tighter text-sm">Meta-Pathfinder</span>
        </div>
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
        <button className="p-2 text-on-surface-variant hover:bg-surface-variant rounded-full relative transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
        </button>
        
        <div className="relative" ref={menuRef}>
          <div 
            className="flex items-center gap-3 ml-2 cursor-pointer group"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <div className="w-10 h-10 rounded-full border-2 border-primary/20 overflow-hidden group-hover:scale-105 transition-transform shadow-sm bg-surface-container flex items-center justify-center">
              <img 
                src={avatarUrl} 
                alt={userInitials} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>

          <AnimatePresence>
            {isMenuOpen && (
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
                
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-variant transition-colors">
                  <User className="w-4 h-4" /> Ver Perfil
                </button>
                <button 
                  onClick={() => { navigate('/settings'); setIsMenuOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface-variant hover:bg-surface-variant transition-colors"
                >
                  <Settings className="w-4 h-4" /> Configuración
                </button>
                
                <div className="my-2 border-t border-outline-variant/20" />
                
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
  );
}
