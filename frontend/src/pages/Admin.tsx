import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../ThemeContext';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { api } from '../services/api';
import { cn } from '../lib/utils';
import { Mail, Lock, Sun, Moon, LogIn, ArrowLeft } from 'lucide-react';
import WalkingScene from '../components/WalkingScene/WalkingScene';

function InputField({ icon: Icon, type, placeholder, value, onChange }: {
  icon: typeof Mail;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
      <div className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        {placeholder}
      </div>
      <div className="flex items-center gap-3 rounded-3xl border border-slate-300 bg-white/90 px-4 py-3 text-slate-900 shadow-sm transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
        <Icon className="w-4 h-4 text-slate-400" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent outline-none text-sm leading-6 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          placeholder={placeholder}
          required
        />
      </div>
    </label>
  );
}

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
    if (user && token && (role === 'admin' || role === 'teacher')) {
      navigate('/admin', { replace: true });
    }
  }, [user, role, token, navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.login(email, password);
      setUser({ name: res.user.name, lastName: res.user.last_name, email: res.user.email });
      setRole(res.user.role as 'admin' | 'teacher' | null);
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

        <div className="relative z-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-5 h-20 w-20 rounded-3xl bg-primary/10 flex items-center justify-center overflow-hidden p-3">
              <img src="/logo.png" alt="MetaPathFinder" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Admin Login</h1>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Ingresa con tu cuenta de administrador o profesor para acceder al panel.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <InputField icon={Mail} type="email" placeholder="Correo electrónico" value={email} onChange={setEmail} />
            <InputField icon={Lock} type="password" placeholder="Contraseña" value={password} onChange={setPassword} />

            {error && (
              <div className="rounded-2xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-primary px-5 py-4 text-sm font-bold text-white shadow-xl shadow-primary/20 transition hover:bg-primary-dark disabled:opacity-60"
            >
              {isLoading ? 'Verificando...' : 'Ingresar como Administrador'}
            </button>
          </form>

          <div className="mt-6 flex flex-col items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span>Usa las credenciales admin@gmail.com / admin</span>
          </div>
        </div>
      </div>
    </div>
    </div>
    </WalkingScene>
    </div>
  );
}
