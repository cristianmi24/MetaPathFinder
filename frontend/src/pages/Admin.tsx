import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { api } from '../services/api';
import { cn } from '../lib/utils';
import { Mail, Lock, Sun, Moon, LogIn, ArrowLeft } from 'lucide-react';
import WalkingScene from '../components/WalkingScene/WalkingScene';
import { AuthInput } from '../components/AuthInput';

export function AdminLogin() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const user = useCognitiveStore((state) => state.user);
  const role = useCognitiveStore((state) => state.role);
  const token = useCognitiveStore((state) => state.token);
  const setUser = useCognitiveStore((state) => state.setUser);
  const setRole = useCognitiveStore((state) => state.setRole);
  const setToken = useCognitiveStore((state) => state.setToken);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user && token && role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, role, token, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password, 'admin');
      setUser({ name: res.user.name, lastName: res.user.last_name, email: res.user.email });
      setRole(res.user.role as 'admin' | null);
      setToken(res.access_token, res.user.id);
      navigate('/admin', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full" style={{ height: '100vh' }}>
    <WalkingScene initialTheme={theme === 'dark' ? 'night' : 'day'} showControls={false} boyLeft={78}>
    <div className={cn(
      'h-full w-full flex items-start justify-center overflow-y-auto px-4 py-10 transition-colors',
      theme === 'light' ? 'text-slate-900' : 'text-white'
    )}>
    <div className="w-full max-w-md flex flex-col gap-4 my-auto">
      <button
        type="button"
        onClick={() => navigate('/')}
        className={cn(
          'self-start inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border shadow-md transition-all hover:scale-105',
          theme === 'light'
            ? 'bg-white/70 border-white/40 text-slate-900 hover:bg-white/90'
            : 'bg-slate-950/70 border-slate-700/50 text-white hover:bg-slate-900/90'
        )}
      >
        <ArrowLeft className="w-4 h-4" /> Volver al inicio
      </button>
      <div className={cn(
        "w-full space-y-8 bento-card p-10 backdrop-blur-2xl border shadow-2xl relative overflow-hidden",
        theme === 'light'
          ? 'bg-white/70 border-white/40 text-slate-900'
          : 'bg-slate-950/70 border-slate-700/50 text-white'
      )}>
        <button
          type="button"
          onClick={toggleTheme}
          title={`Cambiar a tema ${theme === 'light' ? 'Oscuro' : 'Claro'}`}
          className={cn(
            'absolute top-5 right-5 z-20 p-3 rounded-full border shadow-lg transition-all hover:scale-110',
            theme === 'light'
              ? 'bg-white/20 border-white/30 text-slate-900 hover:bg-white/30'
              : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
          )}
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* Subtle glow effect */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-secondary/5 rounded-full blur-[80px]" />

        <div className="text-center relative z-10">
          <div className="mx-auto h-24 w-24 mb-6">
            <img src="/logo.png" alt="Meta-Pathfinder Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className={cn(
            'text-3xl font-black tracking-tight uppercase',
            theme === 'light' ? 'text-slate-900' : 'text-white'
          )}>
            Iniciar Sesión
          </h2>
          <p className={cn(
            'mt-2 text-sm font-medium',
            theme === 'light' ? 'text-slate-500' : 'text-slate-300'
          )}>
            Acceso para administradores
          </p>
        </div>

        <form className="mt-8 space-y-6 relative z-10" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-2xl border border-red-300 bg-red-50 dark:bg-red-950/50 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300 font-semibold text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <AuthInput icon={Mail} type="email" placeholder="Correo Electrónico" value={email} onChange={setEmail} required />
            <AuthInput icon={Lock} type="password" placeholder="Contraseña" value={password} onChange={setPassword} required />
          </div>

          <div className="space-y-3">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-primary/20 text-sm font-black text-on-primary bg-primary hover:scale-[1.02] transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:scale-100"
            >
              {isLoading ? 'Accediendo...' : 'Ingresar al Panel'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </div>
    </WalkingScene>
    </div>
  );
}
