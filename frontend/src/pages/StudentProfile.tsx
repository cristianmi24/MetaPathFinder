import { Brain, Award, CheckCircle2, ArrowRight, Mail, Lock, User as UserIcon, LogIn, UserPlus, Key, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCognitiveStore, stateTranslations, type User } from '../stores/useCognitiveStore';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useTheme } from '../ThemeContext';

export function StudentProfile() {
  const { cognitiveLoad, calibration, state, events, user, setUser } = useCognitiveStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recovery'>('login');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');

  const phase1Complete = events.some(e => e.type === 'PHASE_COMPLETED' && e.metadata?.phase === 'Juicio_Pretest');
  const phase2Complete = events.some(e => e.type === 'PHASE_COMPLETED' && e.metadata?.phase === 'Desafío_Cognitivo');
  const phase3Complete = events.some(e => e.type === 'PHASE_COMPLETED' && e.metadata?.phase === 'Desfase');

  const latestEvaluation = [...events].reverse().find((event) => event.type === 'EVALUATION_COMPLETED');
  const evaluationScore = latestEvaluation?.metadata?.score ?? null;
  const evaluationCalibration = latestEvaluation?.metadata?.calibration ?? null;
  const evaluationPerception = latestEvaluation?.metadata?.initial_perception ?? null;
  const evaluationGap = latestEvaluation?.metadata?.calibration_gap ?? null;
  const evaluationRetries = latestEvaluation?.metadata?.total_retries ?? null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setUser({ name: 'Mateo', lastName: 'Andrade', email });
      setIsLoading(false);
      navigate('/student');
    }, 1000);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate register
    setTimeout(() => {
      setUser({ name, lastName, email });
      setIsLoading(false);
      navigate('/student');
    }, 1500);
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate recovery
    setTimeout(() => {
      alert('Se ha enviado un enlace de recuperación a tu correo.');
      setAuthMode('login');
      setIsLoading(false);
    }, 1200);
  };

  if (!user) {
    return (
      <div className={cn(
        "h-screen w-full flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300",
        theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-slate-950 text-white'
      )}>
        <div className={cn(
          "w-full max-w-md space-y-8 bento-card p-10 backdrop-blur-2xl border shadow-2xl relative overflow-hidden",
          theme === 'light'
            ? 'bg-white/90 border-white/20 text-slate-900'
            : 'bg-slate-950/95 border-slate-700/70 text-white'
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
              {authMode === 'login' ? 'Iniciar Sesión' : authMode === 'register' ? 'Crear Cuenta' : 'Recuperar'}
            </h2>
            <p className={cn(
              'mt-2 text-sm font-medium',
              theme === 'light' ? 'text-slate-500' : 'text-slate-300'
            )}>
              {authMode === 'login' ? 'Tu rastro cognitivo te espera' : authMode === 'register' ? 'Comienza tu viaje meta-cognitivo' : 'Te ayudamos a volver a tu flujo'}
            </p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={authMode}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="relative z-10"
            >
              {authMode === 'login' && (
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                  <div className="space-y-4">
                    <InputField 
                      icon={Mail} 
                      type="email" 
                      placeholder="Correo Electrónico" 
                      value={email} 
                      onChange={setEmail} 
                      required 
                    />
                    <InputField 
                      icon={Lock} 
                      type="password" 
                      placeholder="Contraseña" 
                      value={password} 
                      onChange={setPassword} 
                      required 
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold">
                    <button 
                      type="button" 
                      onClick={() => setAuthMode('recovery')} 
                      className="text-primary hover:text-primary-container transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setAuthMode('register')} 
                      className="text-secondary hover:text-secondary-container transition-colors"
                    >
                      Crear una cuenta
                    </button>
                  </div>

                  <div className="space-y-3">
                    <button
                      disabled={isLoading}
                      className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-primary/20 text-sm font-black text-on-primary bg-primary hover:scale-[1.02] transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:scale-100"
                    >
                      {isLoading ? 'Accediendo...' : 'Ingresar al Perfil'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        useCognitiveStore.getState().reset();
                        navigate('/');
                      }}
                      className="w-full flex justify-center py-3 px-4 rounded-2xl text-xs font-black text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md active:scale-95"
                    >
                      Volver al inicio
                    </button>
                  </div>
                </form>
              )}

              {authMode === 'register' && (
                <form className="mt-8 space-y-4" onSubmit={handleRegister}>
                  <div className="grid grid-cols-2 gap-4">
                    <InputField 
                      icon={UserIcon} 
                      type="text" 
                      placeholder="Nombre" 
                      value={name} 
                      onChange={setName} 
                      required 
                    />
                    <InputField 
                      icon={UserIcon} 
                      type="text" 
                      placeholder="Apellido" 
                      value={lastName} 
                      onChange={setLastName} 
                      required 
                    />
                  </div>
                  <InputField 
                    icon={Mail} 
                    type="email" 
                    placeholder="Correo Electrónico" 
                    value={email} 
                    onChange={setEmail} 
                    required 
                  />
                  <InputField 
                    icon={Lock} 
                    type="password" 
                    placeholder="Contraseña" 
                    value={password} 
                    onChange={setPassword} 
                    required 
                  />

                  <div className="flex flex-col items-center gap-4 mt-6">
                    <button
                      disabled={isLoading}
                      className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-secondary/20 text-sm font-black text-on-secondary bg-secondary hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isLoading ? 'Configurando...' : 'Crear mi Cuenta'}
                    </button>

                    <div className="flex flex-col items-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => setAuthMode('login')} 
                        className="text-xs font-bold text-slate-500 hover:text-primary transition-colors"
                      >
                        ¿Ya tienes cuenta? <span className="text-primary underline">Inicia Sesión</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          useCognitiveStore.getState().reset();
                          navigate('/');
                        }}
                        className="w-full flex justify-center py-3 px-4 rounded-2xl text-xs font-black text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md active:scale-95 uppercase tracking-widest"
                      >
                        Volver al inicio
                      </button>
                    </div>
                  </div>
                </form>
              )}

              {authMode === 'recovery' && (
                <form className="mt-8 space-y-6" onSubmit={handleRecovery}>
                  <div className="space-y-4">
                    <InputField 
                      icon={Mail} 
                      type="email" 
                      placeholder="Correo Electrónico" 
                      value={email} 
                      onChange={setEmail} 
                      required 
                    />
                  </div>

                  <div className="flex flex-col items-center gap-4 mt-6">
                    <button
                      disabled={isLoading}
                      className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-tertiary/20 text-sm font-black text-on-tertiary bg-tertiary hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isLoading ? 'Enviando...' : 'Recuperar Acceso'}
                    </button>

                    <div className="flex flex-col items-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => setAuthMode('login')} 
                        className="text-xs font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-2"
                      >
                        <LogIn className="w-3 h-3" /> Volver al Inicio de Sesión
                      </button>
                      <button 
                        type="button" 
                        onClick={() => {
                          useCognitiveStore.getState().reset();
                          navigate('/');
                        }}
                        className="w-full flex justify-center py-3 px-4 rounded-2xl text-xs font-black text-white bg-slate-900 hover:bg-slate-800 transition-all shadow-md active:scale-95 uppercase tracking-widest"
                      >
                        Volver al inicio
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-5xl mx-auto py-10">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start bento-card p-10 bg-white shadow-xl border border-primary/5">
        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-surface shadow-2xl shrink-0 bg-primary/10 flex items-center justify-center">
          <img 
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name + ' ' + user.lastName)}&background=random&color=fff&bold=true&size=200`} 
            alt={`${user.name[0]}${user.lastName[0]}`} 
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-center md:text-left flex-1 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className="text-5xl font-black tracking-tight text-on-surface">{user.name} {user.lastName}</h2>
          </div>
          
          <div className="mt-10 bg-surface-container-low/50 p-6 rounded-[2rem] border border-outline-variant/20">
            <div className="flex flex-col sm:flex-row justify-between items-end gap-6">
              <div className="flex-1 w-full">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-on-surface-variant/50 mb-4 px-2">Ruta de Evaluación Metacognitiva</h3>
                <div className="grid grid-cols-3 gap-2">
                  <div className={cn("h-1.5 rounded-full", phase1Complete ? "bg-secondary" : "bg-primary")}></div>
                  <div className={cn("h-1.5 rounded-full transition-all", phase2Complete ? "bg-secondary" : (phase1Complete ? "bg-primary" : "bg-outline-variant/30"))}></div>
                  <div className={cn("h-1.5 rounded-full transition-all", phase3Complete ? "bg-secondary" : (phase2Complete ? "bg-primary" : "bg-outline-variant/30"))}></div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 px-1">
                  <p className={cn("text-[10px] font-bold uppercase", phase1Complete ? "text-secondary" : "text-primary")}>Juicio</p>
                  <p className={cn("text-[10px] font-bold uppercase text-center", phase2Complete ? "text-secondary" : (phase1Complete ? "text-primary" : "text-on-surface-variant/40"))}>Desafío</p>
                  <p className={cn("text-[10px] font-bold uppercase text-right", phase3Complete ? "text-secondary" : (phase2Complete ? "text-primary" : "text-on-surface-variant/40"))}>Análisis</p>
                </div>
              </div>
              
              <button 
                onClick={() => navigate('/evaluations')}
                className="w-full sm:w-auto px-8 py-4 bg-primary text-on-primary rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all flex items-center justify-center gap-3 active:scale-95"
              >
                {phase1Complete ? (phase2Complete ? (phase3Complete ? "Ver Resultados" : "Fase Final") : "Continuar Evaluación") : "Iniciar Proceso"}
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bento-card p-8 bg-surface-container-low border border-outline-variant/30 flex flex-col justify-center items-center text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Calibración Actual</p>
          <p className="text-5xl font-black text-on-surface">{Math.round(calibration * 100)}%</p>
        </div>
        <div className="bento-card p-8 bg-surface-container-low border border-outline-variant/30 flex flex-col justify-center items-center text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-secondary mb-2">Carga Cognitiva</p>
          <p className="text-5xl font-black text-on-surface">{Math.round(cognitiveLoad * 100)}%</p>
        </div>
        <div className="bento-card p-8 bg-surface-container-low border border-outline-variant/30 flex flex-col justify-center items-center text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Transferencia</p>
          <p className="text-5xl font-black text-on-surface">{Math.round(useCognitiveStore.getState().transferReadiness * 100)}%</p>
        </div>
      </div>

    </div>
  );
}

function InputField({ icon: Icon, type, placeholder, value, onChange, ...props }: any) {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:bg-white"
        placeholder={placeholder}
        {...props}
      />
    </div>
  );
}

function Badge({ icon: Icon, text, color }: any) {
  return (
    <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-wider", color)}>
      <Icon className="w-3 h-3" />
      {text}
    </div>
  );
}


