import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './pages/Dashboard';
import { StudentProfile } from './pages/StudentProfile';
import { Experiments } from './pages/Experiments';
import { Analytics } from './pages/Analytics';
import { SettingsPage } from './pages/Settings';
import { Tutorial } from './pages/Tutorial';
import { EvaluationStart } from './pages/EvaluationStart';
import { PreTest } from './pages/PreTest';
import { CognitiveChallenge } from './pages/CognitiveChallenge';
import { ChallengeCalibration } from './pages/ChallengeCalibration';
import { MetacognitiveStrategies } from './pages/MetacognitiveStrategies';
import { RegisteredUsers } from './pages/RegisteredUsers';
import { Activities } from './pages/Activities';
import { motion, AnimatePresence } from 'motion/react';
import { useCognitiveTracking } from './hooks/useCognitiveTracking';
import { usePageLeaveSave } from './hooks/usePhaseSync';
import { CognitiveBrain } from './components/CognitiveBrain';
import { Home } from './pages/Home';
import { AdminLogin } from './pages/Admin';
import { useCognitiveStore } from './stores/useCognitiveStore';
import { useEffect } from 'react';
import { api } from './services/api';
import { cn } from './lib/utils';

import { BackgroundNetwork } from './components/BackgroundNetwork';
import { StudentDashboard } from './pages/StudentDashboard';

function AdminLayout({ children }: { children: React.ReactNode }) {
  const isCollapsed = useCognitiveStore((s) => s.isSidebarCollapsed);
  return (
    <div className="min-h-screen bg-background">
      <CognitiveBrain />
      <Sidebar />
      <TopBar />
      <main className={`pt-20 lg:pt-24 p-6 lg:p-12 min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function StudentLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isCollapsed = useCognitiveStore((s) => s.isSidebarCollapsed);
  const isEval = location.pathname === '/tutorial';
  const isEvalFlow = ['/evaluation-prep', '/pretest', '/challenge', '/calibration', '/metacognitive-strategies'].includes(location.pathname);

  if (isEval || isEvalFlow) {
    return (
      <div className="min-h-screen bg-background">
        <CognitiveBrain />
        <main className={cn("min-h-screen", !isEval && "pt-16")}>
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CognitiveBrain />
      <Sidebar />
      <TopBar />
      <main className={`pt-20 lg:pt-24 p-6 lg:p-12 min-h-screen transition-all duration-300 ${isCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen h-screen w-screen overflow-hidden bg-[#0F172A]">
      <BackgroundNetwork />
      <CognitiveBrain />
      <main className="absolute inset-0 p-0 m-0 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function RootRedirect() {
  return (
    <>
      <BackgroundNetwork />
      <Home />
    </>
  );
}

function ProtectedRoute({ children, requiredRole, redirectTo = '/profile' }: { children: React.ReactNode; requiredRole?: 'admin' | 'student' | 'teacher'; redirectTo?: string; }) {
  const token = useCognitiveStore((s) => s.token);
  const user = useCognitiveStore((s) => s.user);
  const role = useCognitiveStore((s) => s.role);

  if (!user || !token) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole === 'admin' && role !== 'admin' && role !== 'teacher') {
    const fallback = role === 'student' ? '/student' : redirectTo;
    return <Navigate to={fallback} replace />;
  }

  if (requiredRole && requiredRole !== 'admin' && role !== requiredRole) {
    const fallback = role === 'admin' || role === 'teacher' ? '/admin' : role === 'student' ? '/student' : redirectTo;
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const role = useCognitiveStore((s) => s.role);
  const user = useCognitiveStore((s) => s.user);
  const token = useCognitiveStore((s) => s.token);
  const setUser = useCognitiveStore((s) => s.setUser);
  const setRole = useCognitiveStore((s) => s.setRole);
  const setToken = useCognitiveStore((s) => s.setToken);
  const resetStore = useCognitiveStore((s) => s.reset);

  const authPaths = ['/profile', '/admin-login'];
  const isAuthPath = authPaths.includes(location.pathname);

  useEffect(() => {
    let mounted = true;
    if (!token) return;
    api.getMe()
      .then((me) => {
        if (!mounted) return;
        setUser({ name: me.name, lastName: me.last_name, email: me.email });
        setRole(me.role as any);
      })
      .catch(() => {
        setToken(null, null);
        setUser(null);
        setRole(null);
      });
    return () => { mounted = false; };
  }, [token, setUser, setRole, setToken, resetStore]);

  useCognitiveTracking(true);
  usePageLeaveSave();

  if (location.pathname === '/') return <>{children}</>;

  if (!user || !token) {
    if (isAuthPath) return <AuthLayout>{children}</AuthLayout>;
    if (location.pathname === '/admin') return <Navigate to="/admin-login" replace />;
    return <Navigate to="/profile" replace />;
  }

  if (role === 'admin' || role === 'teacher') {
    if (location.pathname === '/profile' || location.pathname === '/admin-login') return <Navigate to="/admin" replace />;
    return <AdminLayout>{children}</AdminLayout>;
  }

  if (location.pathname === '/admin' || location.pathname === '/admin-login') return <Navigate to="/student" replace />;
  return <StudentLayout>{children}</StudentLayout>;
}

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/student" element={<ProtectedRoute requiredRole="student" redirectTo="/profile"><StudentDashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin" redirectTo="/admin-login"><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<StudentProfile />} />
          <Route path="/registered-users" element={<ProtectedRoute requiredRole="admin" redirectTo="/admin-login"><RegisteredUsers /></ProtectedRoute>} />
          <Route path="/activities" element={<ProtectedRoute requiredRole="admin" redirectTo="/admin-login"><Activities /></ProtectedRoute>} />

          <Route path="/experiments" element={<ProtectedRoute redirectTo="/profile"><Experiments /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute requiredRole="student" redirectTo="/profile"><Analytics /></ProtectedRoute>} />
          <Route path="/tutorial" element={<ProtectedRoute requiredRole="student" redirectTo="/profile"><Tutorial /></ProtectedRoute>} />
          <Route path="/evaluation-prep" element={<ProtectedRoute requiredRole="student" redirectTo="/profile"><EvaluationStart /></ProtectedRoute>} />
          <Route path="/pretest" element={<ProtectedRoute requiredRole="student" redirectTo="/profile"><PreTest /></ProtectedRoute>} />
          <Route path="/challenge" element={<ProtectedRoute requiredRole="student" redirectTo="/profile"><CognitiveChallenge /></ProtectedRoute>} />
          <Route path="/calibration" element={<ProtectedRoute requiredRole="student" redirectTo="/profile"><ChallengeCalibration /></ProtectedRoute>} />
          <Route path="/metacognitive-strategies" element={<ProtectedRoute requiredRole="student" redirectTo="/profile"><MetacognitiveStrategies /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute redirectTo="/profile"><SettingsPage /></ProtectedRoute>} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}
