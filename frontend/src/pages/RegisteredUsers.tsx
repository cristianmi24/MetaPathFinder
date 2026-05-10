import { Users, BarChart3, Clock, MousePointer2, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { cn } from '../lib/utils';

interface StudentResult {
  id: string;
  name: string;
  email: string;
  testDate: string;
  status: 'completed' | 'in-progress' | 'pending';
  totalTime: number; // segundos
  totalClicks: number;
  pageNavigations: number;
  score: number;
  questionStats: Array<{
    number: number;
    timeSpent: number; // segundos
    clicks: number;
    answered: boolean;
    correct: boolean;
  }>;
}

// Datos de ejemplo
const mockStudentResults: StudentResult[] = [
  {
    id: 'student-1',
    name: 'Juan Pérez',
    email: 'juan.perez@estudiante.edu',
    testDate: '2026-05-09',
    status: 'completed',
    totalTime: 1245, // 20:45
    totalClicks: 47,
    pageNavigations: 3,
    score: 85,
    questionStats: [
      { number: 1, timeSpent: 180, clicks: 5, answered: true, correct: true },
      { number: 2, timeSpent: 245, clicks: 8, answered: true, correct: true },
      { number: 3, timeSpent: 320, clicks: 12, answered: true, correct: false },
      { number: 4, timeSpent: 190, clicks: 4, answered: true, correct: true },
      { number: 5, timeSpent: 310, clicks: 18, answered: true, correct: false },
    ]
  },
  {
    id: 'student-2',
    name: 'María García',
    email: 'maria.garcia@estudiante.edu',
    testDate: '2026-05-08',
    status: 'completed',
    totalTime: 2140, // 35:40
    totalClicks: 89,
    pageNavigations: 7,
    score: 72,
    questionStats: [
      { number: 1, timeSpent: 340, clicks: 15, answered: true, correct: true },
      { number: 2, timeSpent: 520, clicks: 22, answered: true, correct: false },
      { number: 3, timeSpent: 410, clicks: 18, answered: true, correct: false },
      { number: 4, timeSpent: 480, clicks: 20, answered: true, correct: true },
      { number: 5, timeSpent: 390, clicks: 14, answered: true, correct: false },
    ]
  },
  {
    id: 'student-3',
    name: 'Carlos López',
    email: 'carlos.lopez@estudiante.edu',
    testDate: '2026-05-07',
    status: 'completed',
    totalTime: 890, // 14:50
    totalClicks: 28,
    pageNavigations: 1,
    score: 92,
    questionStats: [
      { number: 1, timeSpent: 120, clicks: 3, answered: true, correct: true },
      { number: 2, timeSpent: 180, clicks: 5, answered: true, correct: true },
      { number: 3, timeSpent: 200, clicks: 6, answered: true, correct: true },
      { number: 4, timeSpent: 240, clicks: 8, answered: true, correct: true },
      { number: 5, timeSpent: 150, clicks: 6, answered: true, correct: false },
    ]
  },
  {
    id: 'student-4',
    name: 'Ana Rodríguez',
    email: 'ana.rodriguez@estudiante.edu',
    testDate: '2026-05-09',
    status: 'in-progress',
    totalTime: 450,
    totalClicks: 15,
    pageNavigations: 0,
    score: 0,
    questionStats: []
  },
];

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function StudentResultCard({ student, onClick }: { student: StudentResult; onClick: () => void }) {
  const avgTimePerQuestion = student.questionStats.length > 0 
    ? Math.round(student.totalTime / student.questionStats.length)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-outline-variant/30 rounded-2xl bg-surface p-4 cursor-pointer hover:border-primary transition-all"
      onClick={onClick}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h4 className="text-base font-semibold text-on-surface">{student.name}</h4>
          <p className="text-sm text-on-surface-variant">Haz clic para ver detalles</p>
        </div>
        <span className={cn(
          'px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide',
          student.status === 'completed' ? 'bg-secondary-container text-on-secondary-container' :
          student.status === 'in-progress' ? 'bg-tertiary-container text-on-tertiary-container' :
          'bg-surface-container-highest text-on-surface-variant'
        )}>
          {student.status === 'completed' ? 'Completada' :
           student.status === 'in-progress' ? 'En Progreso' : 'Pendiente'}
        </span>
      </div>
    </motion.div>
  );
}

function StudentDetailModal({ student, onClose }: { student: StudentResult; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-surface-container p-6 border-b border-outline-variant/20 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-on-surface">{student.name}</h2>
            <p className="text-sm text-on-surface-variant">{student.email}</p>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Resumen General */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bento-card p-4 text-center">
              <Clock className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-xs text-on-surface-variant font-bold uppercase mb-1">Tiempo Total</p>
              <p className="text-2xl font-bold text-on-surface">{formatTime(student.totalTime)}</p>
            </div>
            <div className="bento-card p-4 text-center">
              <MousePointer2 className="w-6 h-6 text-secondary mx-auto mb-2" />
              <p className="text-xs text-on-surface-variant font-bold uppercase mb-1">Total de Clicks</p>
              <p className="text-2xl font-bold text-on-surface">{student.totalClicks}</p>
            </div>
            <div className="bento-card p-4 text-center">
              <Zap className="w-6 h-6 text-tertiary mx-auto mb-2" />
              <p className="text-xs text-on-surface-variant font-bold uppercase mb-1">Cambios de Página</p>
              <p className="text-2xl font-bold text-on-surface">{student.pageNavigations}</p>
            </div>
            <div className="bento-card p-4 text-center">
              <BarChart3 className="w-6 h-6 text-error mx-auto mb-2" />
              <p className="text-xs text-on-surface-variant font-bold uppercase mb-1">Calificación</p>
              <p className="text-2xl font-bold text-on-surface">{student.score}%</p>
            </div>
          </div>

          {/* Detalles por Pregunta */}
          <div className="bento-card p-6">
            <h3 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Análisis por Pregunta
            </h3>
            <div className="space-y-4">
              {student.questionStats.map((q) => (
                <motion.div
                  key={q.number}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-surface-container p-4 rounded-2xl flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center font-bold text-on-primary-container">
                        {q.number}
                      </div>
                      <div>
                        <p className="font-semibold text-on-surface">Pregunta {q.number}</p>
                        <p className="text-xs text-on-surface-variant">
                          {q.answered && (q.correct ? '✓ Correcta' : '✕ Incorrecta')}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-on-surface-variant font-bold mb-1">TIEMPO</p>
                      <p className="font-semibold text-on-surface">{formatTime(q.timeSpent)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant font-bold mb-1">CLICKS</p>
                      <p className="font-semibold text-on-surface">{q.clicks}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant font-bold mb-1">RESULTADO</p>
                      <span className={cn(
                        'px-2 py-1 rounded-full text-xs font-bold',
                        q.correct ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container text-on-error-container'
                      )}>
                        {q.correct ? 'OK' : 'NO'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Análisis de Patrones */}
          <div className="bento-card p-6">
            <h3 className="text-xl font-bold text-on-surface mb-6">Análisis de Patrones</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-surface-container p-4 rounded-2xl">
                <p className="text-sm text-on-surface-variant font-bold mb-2">VELOCIDAD PROMEDIO</p>
                <p className="text-2xl font-bold text-primary">
                  {(student.totalClicks / (student.totalTime / 60)).toFixed(1)} clicks/min
                </p>
              </div>
              <div className="bg-surface-container p-4 rounded-2xl">
                <p className="text-sm text-on-surface-variant font-bold mb-2">EFICIENCIA</p>
                <p className={cn(
                  'text-2xl font-bold',
                  student.totalClicks > 50 ? 'text-error' : student.totalClicks > 30 ? 'text-tertiary' : 'text-secondary'
                )}>
                  {student.totalClicks > 50 ? 'Baja' : student.totalClicks > 30 ? 'Media' : 'Alta'}
                </p>
              </div>
              <div className="bg-surface-container p-4 rounded-2xl">
                <p className="text-sm text-on-surface-variant font-bold mb-2">ESTABILIDAD</p>
                <p className={cn(
                  'text-2xl font-bold',
                  student.pageNavigations > 5 ? 'text-error' : 'text-secondary'
                )}>
                  {student.pageNavigations > 5 ? 'Inestable' : 'Estable'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function RegisteredUsers() {
  const [selectedStudent, setSelectedStudent] = useState<StudentResult | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in-progress' | 'pending'>('all');

  const filteredStudents = filterStatus === 'all' 
    ? mockStudentResults 
    : mockStudentResults.filter(s => s.status === filterStatus);

  const completedCount = mockStudentResults.filter(s => s.status === 'completed').length;
  const inProgressCount = mockStudentResults.filter(s => s.status === 'in-progress').length;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold tracking-tight">Usuarios Registrados</h2>
        <p className="text-lg text-on-surface-variant mt-2 font-medium">
          Gestiona y visualiza los resultados de los estudiantes que han completado las pruebas.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bento-card p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <Users className="w-6 h-6 text-primary" />
            <p className="text-sm text-on-surface-variant font-bold">Total de Estudiantes</p>
          </div>
          <p className="text-3xl font-bold text-on-surface">{mockStudentResults.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bento-card p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle className="w-6 h-6 text-secondary" />
            <p className="text-sm text-on-surface-variant font-bold">Pruebas Completadas</p>
          </div>
          <p className="text-3xl font-bold text-on-surface">{completedCount}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bento-card p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-6 h-6 text-tertiary" />
            <p className="text-sm text-on-surface-variant font-bold">En Progreso</p>
          </div>
          <p className="text-3xl font-bold text-on-surface">{inProgressCount}</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        {(['all', 'completed', 'in-progress', 'pending'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              'px-4 py-2 rounded-full font-semibold text-sm transition-all',
              filterStatus === status
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'
            )}
          >
            {status === 'all' ? 'Todos' :
             status === 'completed' ? 'Completadas' :
             status === 'in-progress' ? 'En Progreso' : 'Pendientes'}
          </button>
        ))}
      </div>

      {/* Student Cards */}
      <div className="space-y-3">
        {filteredStudents.map((student) => (
          <StudentResultCard
            key={student.id}
            student={student}
            onClick={() => setSelectedStudent(student)}
          />
        ))}
      </div>

      {/* Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}

// Para imports faltantes
const CheckCircle = ({ className }: { className: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);
