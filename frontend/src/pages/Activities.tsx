import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Clock, BookOpen, Cpu, Code2, 
  HelpCircle, Sliders, Layers, ArrowLeftRight, CheckCircle2,
  FileText, Star, Eye, Compass, GraduationCap, X, Play, RefreshCw, Sparkles
} from 'lucide-react';
import { dynamicChallengeBank, DynamicChallenge } from '../data/dynamicChallengeBank';
import { useTheme } from '../ThemeContext';
import { cn } from '../lib/utils';

// Importación de todos los componentes interactivos reales de la plataforma
import { DragAndDropBoard } from '../components/DragAndDropBoard';
import { EssayBoard } from '../components/EssayBoard';
import { CanvasBoard } from '../components/CanvasBoard';
import { PhoneDismantlingBoard } from '../components/PhoneDismantlingBoard';
import { CodingIDEBoard } from '../components/CodingIDEBoard';
import { SqlBlockBoard } from '../components/SqlBlockBoard';
import { ArduinoBlockBoard } from '../components/ArduinoBlockBoard';
import { CodeBlockBoard } from '../components/CodeBlockBoard';
import { AdvancedIcfesBoard } from '../components/AdvancedIcfesBoard';
import TimelineGame from '../components/TimelineGame';
import MatchImageTerms from '../components/MatchImageTerms';
import MatchTechSituations from '../components/MatchTechSituations';
import DriveFileSorter from '../components/DriveFileSorter';
import AttendanceSimulator from '../components/AttendanceSimulator';
import DigitalAccessQuiz from '../components/DigitalAccessQuiz';
import SocialMediaQuiz from '../components/SocialMediaQuiz';
import { SmartphoneAnatomyQuiz } from '../components/SmartphoneAnatomyQuiz';
import { ComputingEvolutionQuiz } from '../components/ComputingEvolutionQuiz';
import { ProspectiveTechEssay } from '../components/ProspectiveTechEssay';
import MiniExcelBoard from '../components/MiniExcelBoard';
import { DigitalIdentityBoard } from '../components/DigitalIdentityBoard';
import { ArduinoHuertaBoard } from '../components/ArduinoHuertaBoard';

// Mapeo detallado de cada reto con su componente React real y su gameplay conceptual
const componentInfo: Record<string, { name: string; type: string; desc: string }> = {
  // Básico
  'RB-C1-N1': { name: 'TimelineGame', type: 'Línea de Tiempo', desc: 'Ordenamiento cronológico interactivo de 8 hitos históricos de la humanidad.' },
  'RB-C1-N2': { name: 'MatchImageTerms', type: 'Arrastrar Imágenes', desc: 'Clasificación de infraestructuras comunitarias en categorías correspondientes.' },
  'RB-C1-N3': { name: 'MatchTechSituations', type: 'Emparejamiento', desc: 'Conectar tecnologías antiguas y modernas con sus casos de uso.' },
  'RB-C2-N1': { name: 'DriveFileSorter', type: 'Ordenador de Archivos', desc: 'Simulador visual de archivos Drive para ordenar por fecha de modificación.' },
  'RB-C2-N2': { name: 'DragAndDropBoard', type: 'Arrastrar Bloques', desc: 'Ordenar el plan de acción secuencial para realizar una videollamada escolar.' },
  'RB-C2-N3': { name: 'DragAndDropBoard', type: 'Arrastrar Bloques', desc: 'Ordenar fórmulas del presupuesto escolar de egresos e ingresos.' },
  'RB-C3-N1': { name: 'CanvasBoard', type: 'Pizarra de Flujo', desc: 'Diseñar en una pizarra interactiva el diagrama de flujo para hacer un sándwich.' },
  'RB-C3-N2': { name: 'AttendanceSimulator', type: 'Simulador de Asistencia', desc: 'Bloques lógicos visuales para controlar la asistencia y alertar sobre fallas.' },
  'RB-C3-N3': { name: 'CanvasBoard', type: 'Pizarra de Flujo', desc: 'Diseñar el sistema lógico para el préstamo de libros en la biblioteca.' },
  'RB-C4-N1': { name: 'DigitalAccessQuiz', type: 'Módulo de Lectura', desc: 'Comprensión interactiva sobre la brecha digital y la conectividad escolar.' },
  'RB-C4-N2': { name: 'SocialMediaQuiz', type: 'Trivia Interactiva', desc: 'Cuestionario interactivo sobre hábitos saludables y bienestar en redes sociales.' },
  'RB-C4-N3': { name: 'EssayBoard', type: 'Editor de Ensayos', desc: 'Redacción crítica estructurada con rúbrica integrada sobre un problema de conectividad local.' },
  
  // Medio
  'RM-C1-N1': { name: 'SmartphoneAnatomyQuiz', type: 'Trivia de Disección', desc: 'Trivia técnica sobre hardware, componentes móviles (OLED, Litio) y anatomía interna.' },
  'RM-C1-N2': { name: 'ComputingEvolutionQuiz', type: 'Línea del Tiempo', desc: 'Evolución de la computación desde la ENIAC hasta los procesadores cuánticos.' },
  'RM-C1-N3': { name: 'ProspectiveTechEssay', type: 'Editor de Ensayos', desc: 'Ensayo prospectivo sobre cómo será la educación en el año 2040 con tecnologías emergentes.' },
  'RM-C2-N1': { name: 'MiniExcelBoard', type: 'Hoja de Cálculo', desc: 'Editor interactivo de celdas con macros por bloques socráticos y formato condicional.' },
  'RM-C2-N2': { name: 'DigitalIdentityBoard', type: 'Diseñador SVG', desc: 'Módulo interactivo de diseño vectorial SVG y aplicación de colores para logos.' },
  'RM-C2-N3': { name: 'SqlBlockBoard', type: 'Editor SQL Bloques', desc: 'Crear tablas, insertar registros y realizar consultas SELECT SUM estructuradas.' },
  'RM-C3-N1': { name: 'ArduinoBlockBoard', type: 'Simulador de Sensores', desc: 'Simulación de sensor de temperatura TMP36 y LEDs mediante lógica de bloques de código.' },
  'RM-C3-N2': { name: 'CodeBlockBoard', type: 'Completar Bloques (JS)', desc: 'Completar la lógica de persistencia de votos en localStorage usando bloques interactivos.' },
  'RM-C3-N3': { name: 'CodeBlockBoard', type: 'Completar Bloques (Python)', desc: 'Completar constructor y manejo de excepciones de WasteClassifier en Python.' },
  'RM-C4-N1': { name: 'EssayBoard', type: 'Editor de Ensayos', desc: 'Redactar una auditoría de huella digital personal con recomendaciones de seguridad.' },
  'RM-C4-N2': { name: 'EssayBoard', type: 'Editor de Ensayos', desc: 'Redacción argumentativa sobre la necesidad de regulación de la IA por parte del Estado.' },
  'RM-C4-N3': { name: 'EssayBoard', type: 'Editor de Ensayos', desc: 'Estructurar una política institucional de uso ético de Inteligencia Artificial.' },
  
  // Avanzado
  'RA-C1-N1': { name: 'PhoneDismantlingBoard', type: 'Simulador 3D', desc: 'Desarmado virtual interactivo de hardware en 3D y análisis de cadena ética.' },
  'RA-C1-N2': { name: 'CodingIDEBoard', type: 'IDE de Programación', desc: 'Implementar el mismo algoritmo en Python en tres paradigmas: Imperativo, POO y Funcional.' },
  'RA-C1-N3': { name: 'EssayBoard', type: 'Editor de Ensayos', desc: 'Ensayo crítico sobre patentes de tecnología emergente y su impacto en Colombia.' },
  'RA-C2-N1': { name: 'CodingIDEBoard', type: 'IDE de Programación', desc: 'Escribir rutas GET y POST y control de errores en una API REST de Flask.' },
  'RA-C2-N2': { name: 'CodingIDEBoard', type: 'IDE de Programación', desc: 'Cargar datos CSV con Pandas y crear gráficos interactivos con Plotly Express.' },
  'RA-C2-N3': { name: 'CodingIDEBoard', type: 'IDE de Programación', desc: 'Programar bucles de conversación y mapeo de respuestas en un chatbot de orientación.' },
  'RA-C3-N1': { name: 'ArduinoHuertaBoard', type: 'Guía y Simulación Interactiva', desc: 'Módulo interactivo de Arduino C++ y simulación de sensores en tiempo real de la huerta escolar.' },
  'RA-C3-N2': { name: 'CodingIDEBoard', type: 'IDE de Programación', desc: 'Entrenar un modelo de predicción de riesgo escolar con Scikit-Learn y evaluar métricas.' },
  'RA-C3-N3': { name: 'CodingIDEBoard', type: 'IDE de Programación', desc: 'Completar lógica móvil en App Inventor: navegación GPS, SMS y botones de emergencia.' },
  'RA-C4-N1': { name: 'AdvancedIcfesBoard', type: 'Evaluación ICFES', desc: 'Evaluación interactiva tipo ICFES sobre sesgo algorítmico e impacto en grupos vulnerables.' },
  'RA-C4-N2': { name: 'AdvancedIcfesBoard', type: 'Evaluación ICFES', desc: 'Evaluación interactiva tipo ICFES sobre startups de impacto social y pitch decks en Colombia.' },
  'RA-C4-N3': { name: 'AdvancedIcfesBoard', type: 'Evaluación ICFES', desc: 'Evaluación interactiva tipo ICFES sobre metodologías cualitativas e investigación de campo en comunidad.' },
};

// Mapa de colores e íconos por componente asignado para dar un look sumamente visual y ordenado
const compMeta: Record<string, { color: string; bg: string; icon: any }> = {
  TimelineGame: { color: '#ffa657', bg: 'rgba(255,166,87,0.1)', icon: Clock },
  MatchImageTerms: { color: '#58a6ff', bg: 'rgba(88,166,255,0.1)', icon: Compass },
  MatchTechSituations: { color: '#3fb950', bg: 'rgba(63,185,80,0.1)', icon: ArrowLeftRight },
  DriveFileSorter: { color: '#ff7b72', bg: 'rgba(255,123,114,0.1)', icon: Layers },
  DragAndDropBoard: { color: '#79c0ff', bg: 'rgba(121,192,255,0.1)', icon: Sliders },
  CanvasBoard: { color: '#bc8cff', bg: 'rgba(188,140,255,0.1)', icon: GraduationCap },
  AttendanceSimulator: { color: '#56e3b8', bg: 'rgba(86,227,184,0.1)', icon: Cpu },
  DigitalAccessQuiz: { color: '#ff9bce', bg: 'rgba(255,155,206,0.1)', icon: HelpCircle },
  SocialMediaQuiz: { color: '#ff9bce', bg: 'rgba(255,155,206,0.1)', icon: HelpCircle },
  EssayBoard: { color: '#dbab76', bg: 'rgba(219,171,118,0.1)', icon: FileText },
  SmartphoneAnatomyQuiz: { color: '#ffb454', bg: 'rgba(255,180,84,0.1)', icon: HelpCircle },
  ComputingEvolutionQuiz: { color: '#58a6ff', bg: 'rgba(88,166,255,0.1)', icon: Clock },
  ProspectiveTechEssay: { color: '#dbab76', bg: 'rgba(219,171,118,0.1)', icon: FileText },
  MiniExcelBoard: { color: '#33f07a', bg: 'rgba(51,240,122,0.1)', icon: Cpu },
  DigitalIdentityBoard: { color: '#bc8cff', bg: 'rgba(188,140,255,0.1)', icon: Code2 },
  SqlBlockBoard: { color: '#ff629c', bg: 'rgba(255,98,156,0.1)', icon: Code2 },
  ArduinoBlockBoard: { color: '#4cc3f0', bg: 'rgba(76,195,240,0.1)', icon: Cpu },
  CodeBlockBoard: { color: '#ffbd2e', bg: 'rgba(255,189,46,0.1)', icon: Code2 },
  PhoneDismantlingBoard: { color: '#ff7b72', bg: 'rgba(255,123,114,0.1)', icon: Cpu },
  CodingIDEBoard: { color: '#5cd3ff', bg: 'rgba(92,211,255,0.1)', icon: Code2 },
  ArduinoHuertaBoard: { color: '#4cc3f0', bg: 'rgba(76,195,240,0.1)', icon: Cpu },
};

// Generar dinámicamente la instancia del componente React real
const getLiveComponent = (id: string, onValidation: () => void): React.ReactNode => {
  switch (id) {
    // Nivel Básico (RB)
    case 'RB-C1-N1': return <TimelineGame />;
    case 'RB-C1-N2': return <MatchImageTerms />;
    case 'RB-C1-N3': return <MatchTechSituations />;
    case 'RB-C2-N1': return <DriveFileSorter />;
    case 'RB-C2-N2': return <DragAndDropBoard challengeId="RB-C2-N2" onValidation={onValidation} />;
    case 'RB-C2-N3': return <DragAndDropBoard challengeId="RB-C2-N3" onValidation={onValidation} />;
    case 'RB-C3-N1': return <CanvasBoard challengeId="RB-C3-N1" onValidation={onValidation} />;
    case 'RB-C3-N2': return <AttendanceSimulator />;
    case 'RB-C3-N3': return <CanvasBoard challengeId="RB-C3-N3" onValidation={onValidation} />;
    case 'RB-C4-N1': return <DigitalAccessQuiz />;
    case 'RB-C4-N2': return <SocialMediaQuiz />;
    case 'RB-C4-N3': return <EssayBoard challengeId="RB-C4-N3" onValidation={onValidation} />;
    
    // Nivel Medio (RM)
    case 'RM-C1-N1': return <SmartphoneAnatomyQuiz />;
    case 'RM-C1-N2': return <ComputingEvolutionQuiz />;
    case 'RM-C1-N3': return <ProspectiveTechEssay challengeId="RM-C1-N3" onValidation={onValidation} />;
    case 'RM-C2-N1': return <MiniExcelBoard challengeId="RM-C2-N1" onValidation={onValidation} />;
    case 'RM-C2-N2': return <DigitalIdentityBoard challengeId="RM-C2-N2" onValidation={onValidation} />;
    case 'RM-C2-N3': return <SqlBlockBoard challengeId="RM-C2-N3" onValidation={onValidation} />;
    case 'RM-C3-N1': return <ArduinoBlockBoard challengeId="RM-C3-N1" onValidation={onValidation} />;
    case 'RM-C3-N2': return <CodeBlockBoard challengeId="RM-C3-N2" onValidation={onValidation} />;
    case 'RM-C3-N3': return <CodeBlockBoard challengeId="RM-C3-N3" onValidation={onValidation} />;
    case 'RM-C4-N1': return <EssayBoard challengeId="RM-C4-N1" onValidation={onValidation} />;
    case 'RM-C4-N2': return <EssayBoard challengeId="RM-C4-N2" onValidation={onValidation} />;
    case 'RM-C4-N3': return <EssayBoard challengeId="RM-C4-N3" onValidation={onValidation} />;
    
    // Nivel Avanzado (RA)
    case 'RA-C1-N1': return <PhoneDismantlingBoard challengeId="RA-C1-N1" onValidation={onValidation} />;
    case 'RA-C1-N2': return <CodingIDEBoard challengeId="RA-C1-N2" onValidation={onValidation} />;
    case 'RA-C1-N3': return <EssayBoard challengeId="RA-C1-N3" onValidation={onValidation} />;
    case 'RA-C2-N1': return <CodingIDEBoard challengeId="RA-C2-N1" onValidation={onValidation} />;
    case 'RA-C2-N2': return <CodingIDEBoard challengeId="RA-C2-N2" onValidation={onValidation} />;
    case 'RA-C2-N3': return <CodingIDEBoard challengeId="RA-C2-N3" onValidation={onValidation} />;
    case 'RA-C3-N1': return <ArduinoHuertaBoard challengeId="RA-C3-N1" onValidation={onValidation} />;
    case 'RA-C3-N2': return <CodingIDEBoard challengeId="RA-C3-N2" onValidation={onValidation} />;
    case 'RA-C3-N3': return <CodingIDEBoard challengeId="RA-C3-N3" onValidation={onValidation} />;
    case 'RA-C4-N1': return <AdvancedIcfesBoard challengeId="RA-C4-N1" onValidation={onValidation} />;
    case 'RA-C4-N2': return <AdvancedIcfesBoard challengeId="RA-C4-N2" onValidation={onValidation} />;
    case 'RA-C4-N3': return <AdvancedIcfesBoard challengeId="RA-C4-N3" onValidation={onValidation} />;
    
    default: return <div className="text-center p-8 text-on-surface-variant font-mono">Componente no encontrado.</div>;
  }
};

export function Activities() {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'all' | 'Básico' | 'Medio' | 'Avanzado'>('all');
  const [compFilter, setCompFilter] = useState<string>('all');
  const [selectedChallenge, setSelectedChallenge] = useState<DynamicChallenge | null>(null);
  
  // Nuevo estado para la simulación interactiva
  const [modalTab, setModalTab] = useState<'pedagogico' | 'simulador'>('pedagogico');
  const [simResetKey, setSimResetKey] = useState(0);
  const [simCompleted, setSimCompleted] = useState(false);

  // Categorías de Componente MEN (C1, C2, C3, C4)
  const categoryLabels: Record<string, string> = {
    C1: 'Naturaleza y evolución de la tecnología',
    C2: 'Apropiación y uso de la tecnología',
    C3: 'Solución de problemas con tecnología',
    C4: 'Tecnología y sociedad',
  };

  const levelColors: Record<string, string> = {
    'Básico': 'text-green-400 bg-green-400/10 border-green-500/20',
    'Medio': 'text-blue-400 bg-blue-400/10 border-blue-500/20',
    'Avanzado': 'text-purple-400 bg-purple-400/10 border-purple-500/20',
  };

  const filteredChallenges = useMemo(() => {
    return dynamicChallengeBank.filter(c => {
      const matchSearch = 
        c.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (componentInfo[c.id]?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchLevel = levelFilter === 'all' || c.nivel === levelFilter;
      
      const matchComp = compFilter === 'all' || (componentInfo[c.id]?.name === compFilter);

      return matchSearch && matchLevel && matchComp;
    });
  }, [searchQuery, levelFilter, compFilter]);

  // Obtener lista de todos los componentes únicos para el dropdown de filtro
  const uniqueComponents = useMemo(() => {
    const list = Object.values(componentInfo).map(c => c.name);
    return Array.from(new Set(list)).sort();
  }, []);

  const handleOpenChallenge = (challenge: DynamicChallenge) => {
    setSelectedChallenge(challenge);
    setModalTab('pedagogico');
    setSimCompleted(false);
  };

  const handleValidation = () => {
    console.log('🎉 Simulación completada correctamente por el administrador.');
    setSimCompleted(true);
  };

  const restartSimulation = () => {
    setSimResetKey(prev => prev + 1);
    setSimCompleted(false);
  };

  return (
    <div className={cn("space-y-8 pb-12", theme)}>
      {/* Cabecera */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-bold tracking-tight">Catálogo de Actividades</h2>
          <p className="text-lg text-on-surface-variant mt-2 max-w-2xl font-medium">
            Visualiza los 36 retos del sistema Meta-Pathfinder, sus componentes interactivos asociados y las rúbricas detalladas de evaluación.
          </p>
        </div>
      </div>

      {/* Controles de Filtro */}
      <div className="bento-card p-6 flex flex-col md:flex-row gap-4 items-center justify-between shadow-lg">
        {/* Barra de Búsqueda */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
          <input
            type="text"
            placeholder="Buscar reto, componente o ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-full border border-outline-variant bg-surface-container text-sm text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Botones de Nivel */}
        <div className="flex gap-2 flex-wrap items-center">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mr-2 hidden sm:inline">Nivel:</span>
          {(['all', 'Básico', 'Medio', 'Avanzado'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevelFilter(lvl)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs font-semibold border transition-all',
                levelFilter === lvl
                  ? 'bg-primary text-on-primary border-primary shadow-sm'
                  : 'bg-surface-container text-on-surface-variant border-outline-variant hover:bg-surface-container-highest'
              )}
            >
              {lvl === 'all' ? 'Todos' : lvl}
            </button>
          ))}
        </div>

        {/* Dropdown de Componente */}
        <div className="flex gap-2 w-full md:w-auto items-center">
          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mr-2 hidden sm:inline">Componente:</span>
          <select
            value={compFilter}
            onChange={(e) => setCompFilter(e.target.value)}
            className="w-full md:w-56 px-4 py-2.5 rounded-full border border-outline-variant bg-surface-container text-xs text-on-surface focus:outline-none focus:border-primary font-semibold transition-all"
          >
            <option value="all">Todos los componentes ({uniqueComponents.length})</option>
            {uniqueComponents.map(comp => (
              <option key={comp} value={comp}>{comp}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid de Retos */}
      {filteredChallenges.length === 0 ? (
        <div className="bento-card p-12 text-center text-on-surface-variant italic">
          <Sliders className="w-12 h-12 mx-auto mb-4 opacity-20 text-primary" />
          No se encontraron actividades que coincidan con los filtros seleccionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChallenges.map((challenge, index) => {
            const comp = componentInfo[challenge.id] || { name: 'Desconocido', type: 'Genérico', desc: 'No asignado' };
            const meta = compMeta[comp.name] || { color: '#888', bg: 'rgba(128,128,128,0.1)', icon: HelpCircle };
            const MetaIcon = meta.icon;

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
                onClick={() => handleOpenChallenge(challenge)}
                className="bento-card group flex flex-col p-6 cursor-pointer border border-outline-variant/30 hover:border-primary/50 hover:translate-y-[-4px] hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                {/* ID y Nivel */}
                <div className="flex justify-between items-center mb-4">
                  <span className="font-mono text-xs font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                    {challenge.id}
                  </span>
                  <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border", levelColors[challenge.nivel])}>
                    {challenge.nivel}
                  </span>
                </div>

                {/* Título */}
                <h3 className="text-base font-bold text-on-surface mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {challenge.titulo}
                </h3>

                {/* Componente Asignado Pill */}
                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-outline-variant/20">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: meta.bg, color: meta.color }}
                  >
                    <MetaIcon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-tight">Componente React</span>
                    <span className="text-xs font-bold text-on-surface truncate">
                      {comp.name}
                    </span>
                  </div>
                </div>

                {/* Tipo de Actividad Pill */}
                <div className="flex justify-between items-center mt-3 pt-2">
                  <span className="text-[10px] font-medium text-on-surface-variant truncate max-w-[150px]">
                    {categoryLabels[challenge.codigo_men]}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {challenge.tiempo_estimado} min
                  </span>
                </div>

                {/* Efecto hover decorativo */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-500" />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal de Detalle con Entorno de Simulación */}
      <AnimatePresence>
        {selectedChallenge && (() => {
          const comp = componentInfo[selectedChallenge.id] || { name: 'Desconocido', type: 'Genérico', desc: 'No asignado' };
          const meta = compMeta[comp.name] || { color: '#888', bg: 'rgba(128,128,128,0.1)', icon: HelpCircle };
          const MetaIcon = meta.icon;
          const isSimActive = modalTab === 'simulador';

          return (
            <>
              {/* Fondo del modal */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedChallenge(null)}
                className="fixed inset-0 bg-black/85 backdrop-blur-md z-[999998]"
              />

              {/* Contenedor del Modal con tamaño dinámico según el tab activo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  maxWidth: isSimActive ? '1300px' : '820px' // Más ancho para simulación completa en pantallas grandes
                }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                className="fixed inset-0 m-auto w-[95%] h-[90vh] bg-surface-container-lowest border border-outline-variant rounded-3xl shadow-2xl overflow-hidden z-[999999] flex flex-col transition-colors"
              >
                {/* Header del Modal */}
                <div className="p-6 border-b border-outline-variant bg-surface-container-low relative flex-shrink-0 transition-colors">
                  <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                    <button 
                      onClick={() => setSelectedChallenge(null)} 
                      className="p-2 rounded-full text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="flex items-start gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md flex-shrink-0" 
                      style={{ background: meta.bg, color: meta.color }}
                    >
                      <MetaIcon className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 pr-8">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded">
                          {selectedChallenge.id}
                        </span>
                        <span className={cn("text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border", levelColors[selectedChallenge.nivel])}>
                          {selectedChallenge.nivel}
                        </span>
                        <span className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter">
                          {categoryLabels[selectedChallenge.codigo_men]}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-on-surface leading-tight truncate">
                        {selectedChallenge.titulo}
                      </h2>
                    </div>
                  </div>

                  {/* Tabs del Modal */}
                  <div className="flex gap-2 mt-4 border-t border-outline-variant/20 pt-3">
                    <button
                      onClick={() => setModalTab('pedagogico')}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                        modalTab === 'pedagogico'
                          ? "bg-primary-container text-on-primary-container font-semibold"
                          : "text-on-surface-variant hover:bg-surface-container-highest"
                      )}
                    >
                      <FileText className="w-3.5 h-3.5" /> Ficha Pedagógica
                    </button>
                    <button
                      onClick={() => {
                        setModalTab('simulador');
                        setSimCompleted(false);
                      }}
                      className={cn(
                        "px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5",
                        modalTab === 'simulador'
                          ? "bg-primary text-on-primary font-semibold shadow-md shadow-primary/10"
                          : "text-on-surface-variant hover:bg-surface-container-highest"
                      )}
                    >
                      <Play className="w-3.5 h-3.5" /> Entorno de Simulación (En Vivo)
                    </button>
                  </div>
                </div>

                {/* Contenido del Modal (Scrollable) */}
                <div className="flex-1 overflow-y-auto bg-surface-container-lowest transition-colors">
                  {modalTab === 'pedagogico' ? (
                    <div className="p-6 space-y-6">
                      {/* Ficha Técnica */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/40">
                          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block mb-1">Componente de UI</span>
                          <span className="text-sm font-bold text-on-surface block">{comp.name}</span>
                          <span className="text-[10px] text-on-surface-variant mt-0.5 block italic">{comp.type}</span>
                        </div>
                        <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/40">
                          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block mb-1">Tiempo Estimado</span>
                          <span className="text-sm font-bold text-on-surface block flex items-center gap-1">
                            <Clock className="w-4 h-4 text-primary" /> {selectedChallenge.tiempo_estimado} Minutos
                          </span>
                          <span className="text-[10px] text-on-surface-variant mt-0.5 block">Para calibración óptima</span>
                        </div>
                        <div className="p-4 bg-surface-container rounded-2xl border border-outline-variant/40">
                          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider block mb-1">Código MEN</span>
                          <span className="text-sm font-bold text-on-surface block">{selectedChallenge.codigo_men} - {selectedChallenge.sub_nivel}</span>
                          <span className="text-[10px] text-on-surface-variant mt-0.5 block truncate">{selectedChallenge.componente}</span>
                        </div>
                      </div>

                      {/* Descripción del reto */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Descripción del Reto</h4>
                        <p className="text-sm text-on-surface leading-relaxed font-medium bg-surface-container/30 p-4 rounded-2xl border border-outline-variant/20">
                          {selectedChallenge.descripcion}
                        </p>
                      </div>

                      {/* Funcionalidad del gameplay */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Funcionalidad del Gameplay</h4>
                        <p className="text-sm text-on-surface leading-relaxed bg-primary/5 p-4 rounded-2xl border border-primary/20">
                          {comp.desc}
                        </p>
                      </div>

                      {/* Criterios */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" /> Criterios de Evaluación y Rúbricas
                        </h4>
                        <div className="bg-surface-container/30 border border-outline-variant/20 rounded-2xl p-4 space-y-3">
                          {selectedChallenge.criterios.map((criterio, i) => (
                            <div key={i} className="flex items-start gap-2.5 text-sm text-on-surface">
                              <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                              <span>{criterio}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recursos */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Recursos Requeridos</h4>
                        <div 
                          className="text-xs font-mono text-on-surface-variant bg-surface-container p-4 rounded-2xl border border-outline-variant/40 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: selectedChallenge.recursos }}
                        />
                      </div>

                      {/* Metacognición JOL */}
                      <div className="space-y-3 pt-2">
                        <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Encuadre Metacognitivo (Preguntas JOL)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 bg-surface-container/50 border border-outline-variant/20 rounded-2xl">
                            <span className="px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded font-mono text-[9px] font-bold block w-fit mb-2">JOL PRE-ESTUDIO</span>
                            <p className="text-xs text-on-surface font-semibold mb-2">{selectedChallenge.jol_esp_1.pregunta}</p>
                            <span className="text-[10px] text-gray-500 font-mono">Escala: {selectedChallenge.jol_esp_1.escala}</span>
                          </div>
                          <div className="p-4 bg-surface-container/50 border border-outline-variant/20 rounded-2xl">
                            <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-500 rounded font-mono text-[9px] font-bold block w-fit mb-2">JOL POST-ESTUDIO</span>
                            <p className="text-xs text-on-surface font-semibold mb-2">{selectedChallenge.jol_esp_2.pregunta}</p>
                            <span className="text-[10px] text-gray-500 font-mono">Escala: {selectedChallenge.jol_esp_2.escala}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Entorno de Simulación Real (Gameplay) */
                    <div className="p-6 h-full flex flex-col space-y-4 min-h-[550px]">
                      {/* Cabecera del sandbox de simulación */}
                      <div className="bg-surface-container border border-outline-variant/50 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-3 transition-colors">
                        <div className="flex items-center gap-2">
                          <span className="flex h-2.5 w-2.5 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                          </span>
                          <span className="text-xs font-mono text-on-surface-variant">
                            Modo Sandbox Activo · <strong className="text-primary">{comp.name}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {simCompleted && (
                            <motion.span 
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="text-xs font-bold text-green-600 dark:text-green-400 bg-green-400/10 border border-green-400/20 px-3 py-1 rounded-full flex items-center gap-1.5"
                            >
                              <Sparkles className="w-3.5 h-3.5" /> ¡Validado Correctamente!
                            </motion.span>
                          )}
                          <button
                            onClick={restartSimulation}
                            className="px-3 py-1 bg-surface-container-lowest border border-outline-variant/60 hover:bg-surface-container-high rounded-lg text-xs font-semibold text-on-surface flex items-center gap-1.5 transition-colors"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Reiniciar Actividad
                          </button>
                        </div>
                      </div>

                      {/* Mockup de Navegador / Dispositivo que envuelve el juego */}
                      <div className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-inner flex flex-col min-h-[460px] relative transition-colors">
                        {/* Barra del Simulador (Mock browser tab) */}
                        <div className="h-9 bg-surface-container border-b border-outline-variant flex items-center px-4 gap-2 flex-shrink-0 select-none transition-colors">
                          <div className="flex gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                            <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block"></span>
                            <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block"></span>
                          </div>
                          <div className="flex-1 text-center pr-12">
                            <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container-lowest px-4 py-1 rounded-md border border-outline-variant/30 inline-block w-full max-w-sm truncate select-all transition-colors">
                              meta-pathfinder://evaluacion/reto/{selectedChallenge.id}
                            </span>
                          </div>
                        </div>

                        {/* Contenedor del Componente React Real con Scroll local */}
                        <div key={simResetKey} className="flex-1 overflow-auto p-1 md:p-4 bg-surface-container-lowest flex flex-col justify-start transition-colors">
                          <div className="w-full h-full min-h-[400px]">
                            {getLiveComponent(selectedChallenge.id, handleValidation)}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
