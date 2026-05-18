import React, { useMemo } from 'react';
import { dynamicChallengeBank } from '../data/dynamicChallengeBank';

// Importación de todos los componentes interactivos disponibles
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
import MiniExcelBoard from '../components/MiniExcelBoard';

const componentMap: Record<string, React.ReactNode> = {
  // Nivel Básico (RB)
  'RB-C1-N1': <TimelineGame />,
  'RB-C1-N2': <MatchImageTerms />,
  'RB-C1-N3': <MatchTechSituations />,
  'RB-C2-N1': <DriveFileSorter />,
  'RB-C2-N2': <DragAndDropBoard challengeId="RB-C2-N2" onValidation={() => {}} />,
  'RB-C2-N3': <DragAndDropBoard challengeId="RB-C2-N3" onValidation={() => {}} />,
  'RB-C3-N1': <CanvasBoard challengeId="RB-C3-N1" onValidation={() => {}} />,
  'RB-C3-N2': <AttendanceSimulator />,
  'RB-C3-N3': <CanvasBoard challengeId="RB-C3-N3" onValidation={() => {}} />,
  'RB-C4-N1': <DigitalAccessQuiz />,
  'RB-C4-N2': <SocialMediaQuiz />,
  'RB-C4-N3': <EssayBoard challengeId="RB-C4-N3" onValidation={() => {}} />,

  // Nivel Medio (RM)
  'RM-C1-N1': <SmartphoneAnatomyQuiz />,
  'RM-C1-N2': <ComputingEvolutionQuiz />,
  'RM-C1-N3': <ProspectiveTechEssay challengeId="RM-C1-N3" onValidation={() => {}} />,
  'RM-C2-N1': <SpreadsheetBoard challengeId="RM-C2-N1" onValidation={() => {}} />,
  'RM-C2-N2': <MiniExcelBoard challengeId="RM-C2-N2" onValidation={() => {}} />,
  'RM-C2-N3': <SqlBlockBoard challengeId="RM-C2-N3" onValidation={() => {}} />,
  'RM-C3-N1': <ArduinoBlockBoard challengeId="RM-C3-N1" onValidation={() => {}} />,
  'RM-C3-N2': <CodingIDEBoard challengeId="RM-C3-N2" onValidation={() => {}} />,
  'RM-C3-N3': <CodeBlockBoard challengeId="RM-C3-N3" onValidation={() => {}} />,
  'RM-C4-N1': <EssayBoard challengeId="RM-C4-N1" onValidation={() => {}} />,
  'RM-C4-N2': <EssayBoard challengeId="RM-C4-N2" onValidation={() => {}} />,
  'RM-C4-N3': <EssayBoard challengeId="RM-C4-N3" onValidation={() => {}} />,

  // Nivel Avanzado (RA)
  'RA-C1-N1': <PhoneDismantlingBoard challengeId="RA-C1-N1" onValidation={() => {}} />,
  'RA-C1-N2': <EssayBoard challengeId="RA-C1-N2" onValidation={() => {}} />,
  'RA-C1-N3': <EssayBoard challengeId="RA-C1-N3" onValidation={() => {}} />,
  'RA-C2-N1': <CodingIDEBoard challengeId="RA-C2-N1" onValidation={() => {}} />,
  'RA-C2-N2': <CodingIDEBoard challengeId="RA-C2-N2" onValidation={() => {}} />,
  'RA-C2-N3': <CodingIDEBoard challengeId="RA-C2-N3" onValidation={() => {}} />,
  'RA-C3-N1': <UploadBoard challengeId="RA-C3-N1" onValidation={() => {}} />,
  'RA-C3-N2': <CodingIDEBoard challengeId="RA-C3-N2" onValidation={() => {}} />,
  'RA-C3-N3': <CodingIDEBoard challengeId="RA-C3-N3" onValidation={() => {}} />,
  'RA-C4-N1': <CodingIDEBoard challengeId="RA-C4-N1" onValidation={() => {}} />,
  'RA-C4-N2': <CodingIDEBoard challengeId="RA-C4-N2" onValidation={() => {}} />,
  'RA-C4-N3': <CodingIDEBoard challengeId="RA-C4-N3" onValidation={() => {}} />,
};

export default function PreviewPhaseB() {
  const retos = useMemo(() =>
    dynamicChallengeBank
      .slice()
      .sort((a, b) => {
        const nivelOrder = { 'Básico': 1, 'Medio': 2, 'Avanzado': 3 };
        if (nivelOrder[a.nivel] !== nivelOrder[b.nivel])
          return nivelOrder[a.nivel] - nivelOrder[b.nivel];
        if (a.codigo_men !== b.codigo_men)
          return a.codigo_men.localeCompare(b.codigo_men, undefined, {
            numeric: true,
          });
        return a.sub_nivel.localeCompare(b.sub_nivel, undefined, {
          numeric: true,
        });
      }),
    []
  );

  return (
    <div
      style={{
        padding: 32,
        fontFamily: 'Inter, system-ui, sans-serif',
        background: '#0f172a',
        color: '#e2e8f0',
        minHeight: '100vh',
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: '1.875rem', fontWeight: 700, color: '#38bdf8' }}>
          🎯 Vista de Pruebas de Retos — Fase B
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#94a3b8' }}>
          Aquí se muestran todos los retos de la plataforma con su componente interactivo asignado de forma directa.
        </p>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 32 }}>
        {retos.map((reto) => (
          <li
            key={reto.id}
            style={{
              border: '1px solid #334155',
              borderRadius: 12,
              overflow: 'hidden',
              background: '#1e293b',
            }}
          >
            <div
              style={{
                background: '#0f172a',
                padding: '16px 20px',
                borderBottom: '1px solid #334155',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              <div>
                <span
                  style={{
                    background: '#38bdf8',
                    color: '#0f172a',
                    padding: '2px 8px',
                    borderRadius: 4,
                    fontWeight: 700,
                    fontSize: 12,
                    marginRight: 8,
                  }}
                >
                  {reto.id}
                </span>
                <strong style={{ fontSize: 16 }}>{reto.titulo}</strong>
              </div>
              <div style={{ display: 'flex', gap: 8, fontSize: 12 }}>
                <span style={{ background: '#334155', padding: '2px 8px', borderRadius: 4 }}>
                  Nivel: {reto.nivel}
                </span>
                <span style={{ background: '#334155', padding: '2px 8px', borderRadius: 4 }}>
                  Componente: {reto.componente}
                </span>
              </div>
            </div>

            <div style={{ padding: 24, background: '#0f172a/50' }}>
              <div
                style={{
                  fontSize: 14,
                  color: '#cbd5e1',
                  marginBottom: 20,
                  lineHeight: 1.5,
                }}
                dangerouslySetInnerHTML={{ __html: reto.descripcion }}
              />

              <div
                style={{
                  background: '#1e293b',
                  borderRadius: 8,
                  padding: 20,
                  border: '1px solid #334155',
                }}
              >
                {componentMap[reto.id] ?? (
                  <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                    No hay un componente interactivo asignado para este reto.
                  </div>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>

      <p style={{ marginTop: 48, textAlign: 'center', color: '#64748b', fontSize: 13 }}>
        Ruta del archivo: <code>src/pages/PreviewPhaseB.tsx</code> · Acceso vía: <code>/preview-phase-b</code>
      </p>
    </div>
  );
}
