import {
  Brain, ArrowRight, Mail, Lock, User as UserIcon, LogIn, Sun, Moon,
  Heart, Sparkles, ShieldCheck, Compass, Play, Coffee, HelpCircle, CheckCircle2,
} from 'lucide-react';
import { AuthInput } from '../components/AuthInput';
import { motion, AnimatePresence } from 'motion/react';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { api } from '../services/api';
import { TermsCheckbox } from '../components/TermsAndConditions';
import { LEGAL } from '../data/legalConfig';
import { StudentHome } from '../components/StudentHome';
import WalkingScene from '../components/WalkingScene/WalkingScene';

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
      const res = await api.login(email, password, 'student');
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
      setAuthError('Debes aceptar los Términos y Condiciones y la Política de Privacidad, y confirmar que eres mayor de edad o cuentas con autorización de tu representante legal, para crear una cuenta.');
      return;
    }
    if (password.length < 8) {
      setAuthError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    setIsLoading(true);
    try {
      await api.register({ name, last_name: lastName, email, password, terms_accepted: termsAccepted, guardian_declaration: termsAccepted, terms_version: LEGAL.version });
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
      <div className="relative w-full" style={{ height: '100vh' }}>
      <WalkingScene initialTheme={theme === 'dark' ? 'night' : 'day'} showControls={false} boyLeft={78}>
      <div className={cn(
        "h-full w-full flex items-start justify-center overflow-y-auto py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-300",
        theme === 'light' ? 'text-slate-900' : 'text-white'
      )}>
      <div className="w-full max-w-md flex flex-col gap-4 my-auto">
        <button
          type="button"
          onClick={() => {
            useCognitiveStore.getState().reset();
            navigate('/');
          }}
          className={cn(
            'self-start inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-full border shadow-md transition-all hover:scale-105',
            theme === 'light'
              ? 'bg-white/70 border-white/40 text-slate-900 hover:bg-white/90'
              : 'bg-slate-950/70 border-slate-700/50 text-white hover:bg-slate-900/90'
          )}
        >
          <ArrowRight className="w-4 h-4 rotate-180" /> Volver al inicio
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
                    <AuthInput 
                      icon={Mail} 
                      type="email" 
                      placeholder="Correo Electrónico" 
                      value={email} 
                      onChange={setEmail} 
                      required 
                    />
                    <AuthInput 
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
                    <AuthInput 
                      icon={UserIcon} 
                      type="text" 
                      placeholder="Nombre" 
                      value={name} 
                      onChange={setName} 
                      required 
                    />
                    <AuthInput 
                      icon={UserIcon} 
                      type="text" 
                      placeholder="Apellido" 
                      value={lastName} 
                      onChange={setLastName} 
                      required 
                    />
                    <AuthInput 
                      icon={Mail} 
                      type="email" 
                      placeholder="Correo Electrónico" 
                      value={email} 
                      onChange={setEmail} 
                      required 
                    />
                    <AuthInput 
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
                    <AuthInput 
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
                    </div>
                  </div>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      </div>
      </WalkingScene>
      </div>
    );
  }

  return (
    <StudentHome
      name={user.name}
      hasStarted={hasStarted}
      level={currentLevel}
      steps={[phase1Complete, phase2Complete, phase3Complete]}
      ctaLabel={beginButtonLabel}
      onBegin={handleBeginDiagnosis}
      metrics={{
        calibration: Math.round(calibration * 100),
        load: Math.round(cognitiveLoad * 100),
        readiness: Math.round(useCognitiveStore.getState().transferReadiness * 100),
      }}
    />
  );
}



