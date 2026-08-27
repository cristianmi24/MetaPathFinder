import {
  Brain, ArrowRight, Mail, Lock, User as UserIcon, LogIn, Sun, Moon,
  Heart, Sparkles, ShieldCheck, Compass, Play, Coffee, HelpCircle, CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { api } from '../services/api';
import { TermsCheckbox } from '../components/TermsAndConditions';

export function StudentProfile() {
  const { cognitiveLoad, calibration, events, user, setUser, setRole, setToken, currentLevel, role, token } = useCognitiveStore();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const navigateEffect = useNavigate();

  useEffect(() => {
    if (role === 'admin' && user && token) {
      navigateEffect('/admin', { replace: true });
    }
  }, [role, user, token, navigateEffect]);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'recovery'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [lastName, setLastName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const phase1Complete = events.some(e => e.type === 'PHASE_COMPLETED' && e.metadata?.phase === 'Juicio_Pretest');
  const phase2Complete = events.some(e => e.type === 'PHASE_COMPLETED' && e.metadata?.phase === 'Desafío_Cognitivo');
  const phase3Complete = events.some(e => e.type === 'PHASE_COMPLETED' && e.metadata?.phase === 'Desfase');

  const hasStarted = phase1Complete || phase2Complete || phase3Complete;
  const diagnosisComplete = phase1Complete && phase2Complete && phase3Complete;

  const handleBeginDiagnosis = () => {
    const store = useCognitiveStore.getState();
    if (!hasStarted) {
      store.setCurrentLevel(1);
      store.setCurrentChallengeId(null);
      store.setAssignedStrategyId(null);
    }
    navigate(hasStarted && !diagnosisComplete ? '/evaluation-prep' : '/tutorial');
  };

  const beginButtonLabel = diagnosisComplete
    ? 'Ver mi recorrido'
    : hasStarted
      ? 'Continuar donde quedé'
      : 'Comenzar';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    try {
      const res = await api.login(email, password);
      setUser({ name: res.user.name, lastName: res.user.last_name, email: res.user.email });
      setRole(res.user.role as 'student' | 'admin');
      setToken(res.access_token, res.user.id);
      navigate(res.user.role === 'admin' ? '/admin' : '/profile');
    } catch (err: any) {
      setAuthError(err.message || 'Correo electrónico o contraseña incorrectos.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!termsAccepted) {
      setAuthError('Debes aceptar los Términos y Condiciones y la Política de Tratamiento de Datos Personales para crear una cuenta.');
      return;
    }
    setIsLoading(true);
    try {
      await api.register({ name, last_name: lastName, email, password, terms_accepted: termsAccepted });
      setRegisterSuccess(true);
      setAuthMode('login');
      setName('');
      setLastName('');
      setEmail('');
      setPassword('');
      setTermsAccepted(false);
    } catch (err: any) {
      setAuthError(err.message || 'Error al registrar la cuenta.');
    } finally {
      setIsLoading(false);
    }
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

  if (!user || !token) {
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
              {authMode === 'login' ? 'Accede a tu espacio de aprendizaje' : authMode === 'register' ? 'Crea tu cuenta para empezar' : 'Te ayudamos a recuperar tu acceso'}
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
                  {registerSuccess && (
                    <div className="rounded-2xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-700 font-semibold text-center">
                      Cuenta creada con éxito. Ahora inicia sesión.
                    </div>
                  )}
                  {authError && (
                    <div className="rounded-2xl border border-red-300 bg-red-50 dark:bg-red-950/50 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300 font-semibold text-center">
                      {authError}
                    </div>
                  )}
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

                  <div className="flex flex-col gap-2 text-xs font-bold">
                    <button 
                      type="button" 
                      onClick={() => { setAuthMode('recovery'); setAuthError(null); }} 
                      className="text-primary hover:text-primary-container transition-colors text-left"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                    <button 
                      type="button" 
                      onClick={() => { setAuthMode('register'); setRegisterSuccess(false); setAuthError(null); }} 
                      className="text-sm font-black text-on-primary bg-primary/90 hover:bg-primary py-3 px-4 rounded-2xl transition-all shadow-md text-center"
                    >
                      Crear Cuenta Nueva
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
                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                  {authError && (
                    <div className="rounded-2xl border border-red-300 bg-red-50 dark:bg-red-950/50 dark:border-red-800 px-4 py-3 text-sm text-red-700 dark:text-red-300 font-semibold text-center">
                      {authError}
                    </div>
                  )}
                  <div className="space-y-4">
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

                  <TermsCheckbox checked={termsAccepted} onChange={setTermsAccepted} dark={theme !== 'light'} />

                  <div className="space-y-3">
                    <button
                      disabled={isLoading || !termsAccepted}
                      className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-primary/20 text-sm font-black text-on-primary bg-primary hover:scale-[1.02] transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:scale-100"
                    >
                      {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setAuthMode('login'); setAuthError(null); }}
                      className="w-full flex justify-center py-3 px-4 rounded-2xl text-xs font-black text-slate-500 hover:text-primary transition-all"
                    >
                      <LogIn className="w-3 h-3 mr-2" /> ¿Ya tienes cuenta? Inicia Sesión
                    </button>
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
                        onClick={() => { setAuthMode('login'); setAuthError(null); }} 
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
    <div className="space-y-8 max-w-4xl mx-auto py-8 px-4 sm:px-0">
      {/* Saludo */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-5"
      >
        <div className="w-14 h-14 rounded-lg overflow-hidden border border-outline-variant shrink-0 bg-primary/10">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name + ' ' + user.lastName)}&background=random&color=fff&bold=true&size=200`}
            alt={`${user.name} ${user.lastName}`}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="ui-sans text-sm font-medium text-on-surface-variant">Tu espacio personal</p>
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-on-surface">
            Hola, {user.name}
          </h2>
        </div>
      </motion.div>

      {/* Tranquilidad: es un análisis, no se califica */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bento-card p-6 sm:p-8"
      >
        <div className="flex gap-4 items-start">
          <div className="w-11 h-11 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-on-surface mb-1.5">
              Tranquilo: esto no se califica
            </h3>
            <p className="ui-sans text-sm text-on-surface-variant leading-relaxed">
              Meta-Pathfinder es un <strong>análisis metacognitivo</strong>, no una prueba con nota.
              Solo mira cómo aprendes, como cuando un profesor pregunta «¿cómo te sientes con este tema?».
              No hay respuestas trampa ni castigo por equivocarte.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Cómo ayuda */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-xs font-black uppercase tracking-[0.15em] text-on-surface-variant/60 mb-4 px-1">
          ¿Cómo te ayuda esto?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            {
              icon: Brain,
              color: 'primary',
              title: 'Conocerte como aprendiz',
              text: 'Descubrirás qué tan bien calibras tu confianza: si crees que sabes algo y realmente lo sabes, o si te falta practicar un poco más.',
            },
            {
              icon: Compass,
              color: 'secondary',
              title: 'Estrategias que sí funcionan',
              text: 'Probarás herramientas metacognitivas (planificar, pausar, reflexionar) mientras haces retos de tecnología — como en clase, pero a tu ritmo.',
            },
            {
              icon: Coffee,
              color: 'tertiary',
              title: 'Sin presión de nota',
              text: 'No hay calificación definitiva. Lo que importa es cómo piensas mientras trabajas, no si aciertas a la primera.',
            },
            {
              icon: ShieldCheck,
              color: 'primary',
              title: 'Retos variados y justos',
              text: 'El sistema te asigna un reto al azar del nivel. Es sorteo, no selección tuya — todos pueden tocar actividades distintas.',
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bento-card p-5 bg-white border border-outline-variant/20 rounded-2xl flex gap-4"
            >
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                item.color === 'primary' && 'bg-primary/10 text-primary',
                item.color === 'secondary' && 'bg-secondary/10 text-secondary',
                item.color === 'tertiary' && 'bg-tertiary/10 text-tertiary',
              )}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black text-on-surface mb-1">{item.title}</p>
                <p className="text-xs text-on-surface-variant leading-relaxed font-medium">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Qué vas a hacer */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bento-card p-6 sm:p-8 bg-surface-container-low/60 border border-outline-variant/20 rounded-[1.75rem]"
      >
        <div className="flex items-center gap-2 mb-5">
          <HelpCircle className="w-5 h-5 text-primary" />
          <h3 className="text-base font-black text-on-surface">¿Qué vas a hacer? (en pocas palabras)</h3>
        </div>
        <ol className="space-y-4">
          {[
            'Leer con calma de qué trata el reto — te lo explicamos paso a paso, como un profesor.',
            'Responder unas preguntas cortas sobre cómo te sientes (no hay respuestas correctas).',
            'Hacer una actividad de tecnología con herramientas de apoyo a tu lado.',
            'Reflexionar al final y, si quieres, elegir una estrategia para el siguiente nivel.',
          ].map((step, i) => (
            <li key={i} className="flex gap-3 text-sm text-on-surface-variant font-medium leading-relaxed">
              <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
        <p className="mt-5 text-xs text-on-surface-variant/80 italic border-t border-outline-variant/20 pt-4">
          Tómate el tiempo que necesites. Puedes pausar mentalmente entre pasos — no hay cronómetro que te apure.
        </p>
      </motion.div>

      {/* Progreso + CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bento-card p-6 sm:p-8 bg-white border border-primary/10 rounded-[1.75rem] shadow-lg shadow-primary/5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex-1">
            <h3 className="text-xs font-black uppercase tracking-[0.15em] text-on-surface-variant/60 mb-3">
              Tu recorrido {hasStarted ? `· Nivel ${currentLevel}` : ''}
            </h3>
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className={cn('h-2 rounded-full transition-all', phase1Complete ? 'bg-secondary' : hasStarted ? 'bg-primary' : 'bg-outline-variant/30')} />
              <div className={cn('h-2 rounded-full transition-all', phase2Complete ? 'bg-secondary' : phase1Complete ? 'bg-primary/60' : 'bg-outline-variant/30')} />
              <div className={cn('h-2 rounded-full transition-all', phase3Complete ? 'bg-secondary' : phase2Complete ? 'bg-primary/60' : 'bg-outline-variant/30')} />
            </div>
            <div className="grid grid-cols-3 gap-1 text-[10px] font-bold text-on-surface-variant">
              <span className={phase1Complete ? 'text-secondary' : ''}>Autopercepción</span>
              <span className={cn('text-center', phase2Complete && 'text-secondary')}>Actividad</span>
              <span className={cn('text-right', phase3Complete && 'text-secondary')}>Reflexión</span>
            </div>
            {!hasStarted && (
              <p className="text-xs text-on-surface-variant mt-3 font-medium">
                Aún no has empezado — cuando pulses «Comenzar», te guiamos desde el principio.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleBeginDiagnosis}
            className="w-full sm:w-auto px-10 py-5 bg-primary text-on-primary rounded-2xl font-black text-base shadow-xl shadow-primary/25 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 active:scale-95 shrink-0"
          >
            <Play className="w-5 h-5 fill-current" />
            {beginButtonLabel}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Métricas solo si ya avanzó — sin alarmar */}
      {hasStarted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="bento-card p-5 bg-surface-container-low/40 border border-outline-variant/20 rounded-2xl text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Tu calibración</p>
            <p className="text-3xl font-black text-on-surface">{Math.round(calibration * 100)}%</p>
            <p className="text-[10px] text-on-surface-variant/70 mt-1">Qué tan alineada está tu confianza con tu desempeño</p>
          </div>
          <div className="bento-card p-5 bg-surface-container-low/40 border border-outline-variant/20 rounded-2xl text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Esfuerzo mental</p>
            <p className="text-3xl font-black text-on-surface">{Math.round(cognitiveLoad * 100)}%</p>
            <p className="text-[10px] text-on-surface-variant/70 mt-1">Solo informativo — no es bueno ni malo</p>
          </div>
          <div className="bento-card p-5 bg-surface-container-low/40 border border-outline-variant/20 rounded-2xl text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">Preparación</p>
            <p className="text-3xl font-black text-on-surface">{Math.round(useCognitiveStore.getState().transferReadiness * 100)}%</p>
            <p className="text-[10px] text-on-surface-variant/70 mt-1">Cómo vas integrando lo aprendido</p>
          </div>
        </motion.div>
      )}

      <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/40 pb-4">
        <Sparkles className="w-3 h-3" />
        Meta-Pathfinder · Análisis metacognitivo
        <CheckCircle2 className="w-3 h-3" />
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


