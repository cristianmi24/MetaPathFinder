import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './pages/Dashboard';
import { StudentProfile } from './pages/StudentProfile';
import { Experiments } from './pages/Experiments';
import { Analytics } from './pages/Analytics';
import { SettingsPage } from './pages/Settings';
import { Evaluations } from './pages/Evaluations';
import { EvaluationStart } from './pages/EvaluationStart';
import { PreTest } from './pages/PreTest';
import { CognitiveChallenge } from './pages/CognitiveChallenge';
import { ChallengeCalibration } from './pages/ChallengeCalibration';
import { RegisteredUsers } from './pages/RegisteredUsers';
import { motion, AnimatePresence } from 'motion/react';
import { useCognitiveTracking } from './hooks/useCognitiveTracking';
import { CognitiveBrain } from './components/CognitiveBrain';
import { Home } from './pages/Home';
import { useCognitiveStore } from './stores/useCognitiveStore';

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
  const isEval = location.pathname === '/evaluations';

  if (isEval) {
    return (
      <div className="min-h-screen bg-background">
        <CognitiveBrain />
        <main className="p-6 lg:p-12 min-h-screen">
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

function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const role = useCognitiveStore((s) => s.role);
  const user = useCognitiveStore((s) => s.user);
  useCognitiveTracking(true);

  // En / no aplicar ningún layout, solo el canvas + Home
  if (location.pathname === '/') return <>{children}</>;

  if (role === 'admin') return <AdminLayout>{children}</AdminLayout>;

  if (!user) return <AuthLayout>{children}</AuthLayout>;

  return <StudentLayout>{children}</StudentLayout>;
}

export default function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/profile" element={<StudentProfile />} />
          <Route path="/registered-users" element={<RegisteredUsers />} />
          <Route path="/experiments" element={<Experiments />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/evaluations" element={<Evaluations />} />
          <Route path="/evaluation-prep" element={<EvaluationStart />} />
          <Route path="/pretest" element={<PreTest />} />
          <Route path="/challenge" element={<CognitiveChallenge />} />
          <Route path="/calibration" element={<ChallengeCalibration />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}
