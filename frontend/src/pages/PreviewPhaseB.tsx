import React, { useMemo, useState } from 'react';
import { useTheme } from '../ThemeContext';
import { dynamicChallengeBank } from '../data/dynamicChallengeBank';
import TimelineGame from '../components/TimelineGame';
import MatchImageTerms from '../components/MatchImageTerms';
import MatchTechSituations from '../components/MatchTechSituations';
import DriveFileSorter from '../components/DriveFileSorter';
import { DragAndDropBoard } from '../components/DragAndDropBoard';
import { EssayBoard } from '../components/EssayBoard';
import { UploadBoard } from '../components/UploadBoard';
import { CanvasBoard } from '../components/CanvasBoard';
import { SpreadsheetBoard } from '../components/SpreadsheetBoard';
import AttendanceSimulator from '../components/AttendanceSimulator';
import DigitalAccessQuiz from '../components/DigitalAccessQuiz';
import SocialMediaQuiz from '../components/SocialMediaQuiz';
import { SmartphoneAnatomyQuiz } from '../components/SmartphoneAnatomyQuiz';
import { ComputingEvolutionQuiz } from '../components/ComputingEvolutionQuiz';
import { ProspectiveTechEssay } from '../components/ProspectiveTechEssay';
import { SqlBlockBoard } from '../components/SqlBlockBoard';
import { ArduinoBlockBoard } from '../components/ArduinoBlockBoard';
import { CodeBlockBoard } from '../components/CodeBlockBoard';
import { PhoneDismantlingBoard } from '../components/PhoneDismantlingBoard';
import { CodingIDEBoard } from '../components/CodingIDEBoard';
import './CognitiveChallenge.css';

const getBoardType = (id: string): 'drag_drop' | 'text' | 'upload' | 'code' | 'canvas' | 'spreadsheet' | 'phone_dismantle' => {
  const mappings: Record<string, 'drag_drop' | 'text' | 'upload' | 'code' | 'canvas' | 'spreadsheet' | 'phone_dismantle'> = {
    // Básico
    "RB-C1-N1": "drag_drop", "RB-C2-N1": "drag_drop", "RB-C3-N1": "drag_drop", "RB-C4-N1": "drag_drop",
    "RB-C1-N2": "upload", "RB-C2-N2": "upload", "RB-C3-N2": "code", "RB-C4-N2": "drag_drop",
    "RB-C1-N3": "text", "RB-C2-N3": "spreadsheet", "RB-C3-N3": "drag_drop", "RB-C4-N3": "drag_drop",
    // Medio
    "RM-C1-N1": "canvas", "RM-C1-N2": "text", "RM-C1-N3": "text", 
    "RM-C2-N1": "spreadsheet", "RM-C2-N2": "canvas", "RM-C2-N3": "spreadsheet", 
    "RM-C3-N1": "upload", "RM-C3-N2": "code", "RM-C3-N3": "code", 
    "RM-C4-N1": "text", "RM-C4-N2": "text", "RM-C4-N3": "text",
    // Avanzado
    "RA-C1-N1": "phone_dismantle", "RA-C1-N2": "text", "RA-C1-N3": "text", 
    "RA-C2-N1": "code", "RA-C2-N2": "upload", "RA-C2-N3": "code",
    "RA-C3-N1": "upload", "RA-C3-N2": "upload", "RA-C3-N3": "upload", 
    "RA-C4-N1": "text", "RA-C4-N2": "upload", "RA-C4-N3": "upload"
  };
  return mappings[id] || 'code';
};

export default function PreviewPhaseB() {
  const { theme } = useTheme();
  const retos = useMemo(() =>
    dynamicChallengeBank.slice().sort((a, b) => {
      const nivelOrder = { 'Básico': 1, 'Medio': 2, 'Avanzado': 3 };
      if (nivelOrder[a.nivel] !== nivelOrder[b.nivel]) return nivelOrder[a.nivel] - nivelOrder[b.nivel];
      if (a.codigo_men !== b.codigo_men) return a.codigo_men.localeCompare(b.codigo_men, undefined, { numeric: true });
      return a.sub_nivel.localeCompare(b.sub_nivel, undefined, { numeric: true });
    }),
  []);

  const initialIndex = useMemo(() => {
    const firstC1 = retos.findIndex(reto => reto.nivel === 'Básico' && reto.codigo_men === 'C1');
    return firstC1 >= 0 ? firstC1 : 0;
  }, [retos]);

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const currentReto = retos[currentIndex];

  const renderBoard = (reto: any) => {
    const id = reto.id;
    
    if (id === 'RB-C1-N1') return <TimelineGame />;
    if (id === 'RB-C1-N2') return <MatchImageTerms />;
    if (id === 'RB-C1-N3') return <MatchTechSituations />;
    if (id === 'RB-C2-N1') return <DriveFileSorter />;
    
    if (id === 'RB-C2-N2' || id === 'RB-C2-N3' || id === 'RB-C3-N1') {
      return <DragAndDropBoard challengeId={id} onValidation={() => null} />;
    }
    
    if (id === 'RB-C4-N1') return <DigitalAccessQuiz onValidation={() => null} />;
    if (id === 'RB-C4-N2') return <SocialMediaQuiz onValidation={() => null} />;
    if (id === 'RB-C3-N2') return <AttendanceSimulator onValidation={() => null} />;
    
    if (id === 'RM-C1-N1') return <SmartphoneAnatomyQuiz onValidation={() => null} />;
    if (id === 'RM-C1-N2') return <ComputingEvolutionQuiz onValidation={() => null} />;
    if (id === 'RM-C1-N3') return <ProspectiveTechEssay challengeId="RM-C1-N3" onValidation={() => null} />;
    if (id === 'RM-C2-N3') return <SqlBlockBoard challengeId="RM-C2-N3" onValidation={() => null} />;
    if (id === 'RM-C3-N1') return <ArduinoBlockBoard challengeId="RM-C3-N1" onValidation={() => null} />;
    
    if (id === 'RM-C3-N2' || id === 'RM-C3-N3') {
      return <CodeBlockBoard id={id} onValidation={() => null} />;
    }
    
    if (['RA-C2-N1', 'RA-C2-N2', 'RA-C2-N3', 'RA-C3-N2', 'RA-C3-N3'].includes(id)) {
      return <CodingIDEBoard challengeId={id} onValidation={() => null} />;
    }
    
    const boardType = getBoardType(id);
    if (boardType === 'drag_drop') {
      return <DragAndDropBoard challengeId={id} onValidation={() => null} />;
    }
    if (boardType === 'text') {
      return <EssayBoard challengeId={id} onValidation={() => null} />;
    }
    if (boardType === 'phone_dismantle') {
      return <PhoneDismantlingBoard challengeId={id} onValidation={() => null} />;
    }
    if (boardType === 'upload') {
      return <UploadBoard challengeId={id} onValidation={() => null} />;
    }
    if (boardType === 'canvas') {
      return <CanvasBoard challengeId={id} onValidation={() => null} />;
    }
    if (boardType === 'spreadsheet') {
      return <SpreadsheetBoard challengeId={id} onValidation={() => null} />;
    }
    
    return (
      <div style={{margin: 24, padding: 24, background: 'var(--fb-card)', borderRadius: 12, border: '1px solid var(--fb-border)', width: '100%'}}>
        <h3 style={{marginTop: 0, color: 'var(--fb-text)'}}>Entorno de Codificación Simulado ({id})</h3>
        <textarea 
          style={{width: '100%', height: '250px', fontFamily: 'monospace', padding: 12, borderRadius: 8, border: '1px solid var(--fb-border)', background: 'var(--fb-bg)', color: 'var(--fb-text)', boxSizing: 'border-box'}}
          placeholder="// Escribe tu código aquí para resolver el reto..."
        />
      </div>
    );
  };

  return (
    <div className={`fb-root ${theme} clean-ui`}>
      {/* Header Minimalista */}
      <div className="fb-header-clean">
        <div className="fb-header-left">
          <div className="fb-logo-mini">MP</div>
          <div className="fb-header-info">
            <span className="fb-level-tag">Entorno de Pruebas</span>
            <h1 className="fb-task-name">Vista Previa de Retos (Fase B)</h1>
          </div>
        </div>
        <div className="fb-header-right">
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="fb-tab-btn active"
              style={{ border: '1px solid var(--fb-border)', background: 'var(--fb-bg)', cursor: 'pointer' }}
              onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
              disabled={currentIndex === 0}
            >
              ← Anterior
            </button>
            <span className="fb-timer-minimal" style={{ padding: '0 12px', display: 'flex', alignItems: 'center' }}>
              {currentIndex + 1} / {retos.length}
            </span>
            <button
              className="fb-tab-btn active"
              style={{ border: '1px solid var(--fb-border)', background: 'var(--fb-bg)', cursor: 'pointer' }}
              onClick={() => setCurrentIndex(i => Math.min(retos.length - 1, i + 1))}
              disabled={currentIndex === retos.length - 1}
            >
              Siguiente →
            </button>
          </div>
        </div>
      </div>

      <div className="fb-main-container">
        {/* Left Sidebar: Challenge List */}
        <div className="fb-sidebar-l">
          <div className="fb-panel-title">
            <i className="ti ti-list" style={{ fontSize: 13 }}></i>
            Catálogo ({retos.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '12px' }}>
            {retos.map((reto, idx) => {
              const isSelected = idx === currentIndex;
              return (
                <div
                  key={reto.id}
                  onClick={() => setCurrentIndex(idx)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    background: isSelected ? 'var(--fb-accent)' : 'transparent',
                    color: isSelected ? '#ffffff' : 'var(--fb-text)',
                    border: isSelected ? '1px solid var(--fb-accent)' : '1px solid transparent',
                    transition: 'all 0.2s ease',
                    fontSize: 12,
                    fontWeight: isSelected ? '600' : 'normal'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'var(--fb-card)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <div style={{ fontSize: 10, opacity: isSelected ? 0.9 : 0.6, textTransform: 'uppercase', marginBottom: 2, fontFamily: '"IBM Plex Mono", monospace' }}>
                    {reto.nivel}
                  </div>
                  <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {reto.id} — {reto.titulo}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: The Active Challenge Board */}
        <div className="fb-editor-container">
          <div className="fb-board-cell">
            {renderBoard(currentReto)}
          </div>
        </div>

        {/* Right Sidebar: Challenge Details */}
        <div className="fb-sidebar-r">
          <div className="fb-panel-title">
            <i className="ti ti-target" style={{ fontSize: 13 }}></i>
            Detalles del Reto
          </div>

          <div className="fb-reto-card">
            <div className="fb-reto-tag">{currentReto.nivel} &middot; {currentReto.componente}</div>
            <div className="fb-reto-title">{currentReto.titulo}</div>
            <div className="fb-reto-desc" dangerouslySetInnerHTML={{ __html: currentReto.descripcion }} />
          </div>

          <div className="fb-criteria">
            <div className="fb-criteria-title">Criterios de Evaluación</div>
            {currentReto.criterios.map((c, i) => (
              <div key={i} className="fb-criterion">
                <span className="fb-criterion-dot"></span>
                {c}
              </div>
            ))}
          </div>

          <div className="fb-criteria" style={{ marginTop: 24 }}>
            <div className="fb-criteria-title">Métricas Base</div>
            <div style={{ fontSize: 12, color: 'var(--fb-text)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <i className="ti ti-clock" style={{ color: 'var(--fb-text-muted)' }}></i>
              Tiempo estimado: <strong>{currentReto.tiempo_estimado} min</strong>
            </div>

            {currentReto.jol_esp_1?.pregunta && (
              <div style={{ background: 'var(--fb-card)', border: '0.5px solid var(--fb-border)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: 'var(--fb-accent)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4, fontFamily: '"IBM Plex Mono", monospace' }}>JOL 1</div>
                <div style={{ fontSize: 11, color: 'var(--fb-text)', lineHeight: 1.4, marginBottom: 6 }}>
                  {currentReto.jol_esp_1.pregunta}
                </div>
                <div style={{ fontSize: 10, color: 'var(--fb-text-muted)', fontFamily: '"IBM Plex Mono", monospace' }}>
                  [{currentReto.jol_esp_1.escala}]
                </div>
              </div>
            )}

            {currentReto.jol_esp_2?.pregunta && (
              <div style={{ background: 'var(--fb-card)', border: '0.5px solid var(--fb-border)', borderRadius: 8, padding: 12 }}>
                <div style={{ fontSize: 10, color: 'var(--fb-accent)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 4, fontFamily: '"IBM Plex Mono", monospace' }}>JOL 2</div>
                <div style={{ fontSize: 11, color: 'var(--fb-text)', lineHeight: 1.4, marginBottom: 6 }}>
                  {currentReto.jol_esp_2.pregunta}
                </div>
                <div style={{ fontSize: 10, color: 'var(--fb-text-muted)', fontFamily: '"IBM Plex Mono", monospace' }}>
                  [{currentReto.jol_esp_2.escala}]
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
