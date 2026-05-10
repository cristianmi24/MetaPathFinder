import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { Dashboard } from './pages/Dashboard';
import { StudentProfile } from './pages/StudentProfile';
import { Experiments } from './pages/Experiments';
import { Analytics } from './pages/Analytics';
import { SettingsPage } from './pages/Settings';
import { Evaluations } from './pages/Evaluations';
import { PreTest } from './pages/PreTest';
import { CognitiveChallenge } from './pages/CognitiveChallenge';
import { RegisteredUsers } from './pages/RegisteredUsers';
import { motion, AnimatePresence } from 'motion/react';
import { useCognitiveTracking } from './hooks/useCognitiveTracking';
import { CognitiveBrain } from './components/CognitiveBrain';
import { Home } from './pages/Home';
import { useCognitiveStore } from './stores/useCognitiveStore';

import { BackgroundNetwork } from './components/BackgroundNetwork';

function Layout({ children }: { children: React.ReactNode }) {
  const role = useCognitiveStore((s) => s.role);
  const user = useCognitiveStore((s) => s.user);
  const location = useLocation();
  useCognitiveTracking(true);

  const isEvaluationRoute = location.pathname === '/evaluations';

  if (!role) return (
    <>
      <BackgroundNetwork />
      <Home />
    </>
  );

  // Si es estudiante y no está logueado, forzar vista de login/perfil sin Sidebar/TopBar
  const isStudentNotLoggedIn = role === 'student' && !user;

  if (isStudentNotLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0F172A]">
        <BackgroundNetwork />
        <CognitiveBrain />
        <main className="p-6 lg:p-12 min-h-screen flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full"
            >
              <StudentProfile />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  }

  if (isEvaluationRoute) {
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
      <main className="lg:ml-64 pt-20 lg:pt-24 p-6 lg:p-12 min-h-screen">
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

export default function App() {
  const role = useCognitiveStore((s) => s.role);

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={role === 'student' ? <StudentProfile /> : <Dashboard />} />
          <Route path="/registered-users" element={<RegisteredUsers />} />
          <Route path="/experiments" element={<Experiments />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/evaluations" element={<Evaluations />} />
          <Route path="/pretest" element={<PreTest />} />
          <Route path="/challenge" element={<CognitiveChallenge />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={role === 'student' ? <StudentProfile /> : <Dashboard />} />
        </Routes>
      </Layout>
    </Router>
  );
}
