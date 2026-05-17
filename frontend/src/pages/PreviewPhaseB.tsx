import React, { useMemo, useState } from 'react';
import { dynamicChallengeBank } from '../data/dynamicChallengeBank';
import TimelineGame from '../components/TimelineGame';
import MatchImageTerms from '../components/MatchImageTerms';
import MatchTechSituations from '../components/MatchTechSituations';
import DriveFileSorter from '../components/DriveFileSorter';
import { DragAndDropBoard } from '../components/DragAndDropBoard';

export default function PreviewPhaseB() {
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

  return (
    <div style={{padding:24,fontFamily:'Inter, system-ui, sans-serif',background:'var(--color-surface)',color:'var(--color-on-surface)'}}>
      <h1 style={{marginBottom:12}}>Vista previa — Fase B</h1>
      <p style={{color:'var(--color-on-surface-variant)',marginBottom:20}}>
        Esta ruta muestra los retos de Fase B uno por uno. Usa los botones para avanzar y revisar cada reto como se vería en la prueba.
      </p>

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,flexWrap:'wrap',gap:10}}>
        <div>
          <strong>{currentReto.nivel}</strong> · {currentReto.componente} · {currentReto.sub_nivel}
        </div>
        <div style={{display:'flex',gap:10}}>
          <button
            style={{padding:'10px 16px',borderRadius:8,border:'1px solid #d0d7de',background:'#fff',cursor:'pointer'}}
            onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
            disabled={currentIndex === 0}
          >
            Anterior
          </button>
          <button
            style={{padding:'10px 16px',borderRadius:8,border:'1px solid #d0d7de',background:'#fff',cursor:'pointer'}}
            onClick={() => setCurrentIndex(i => Math.min(retos.length - 1, i + 1))}
            disabled={currentIndex === retos.length - 1}
          >
            Siguiente
          </button>
        </div>
      </div>

      <section style={{border:'1px solid #e6e6e6',borderRadius:8,padding:16,marginBottom:14}}>
        <h2 style={{margin:0,fontSize:18}}>{currentReto.id} — {currentReto.titulo}</h2>
        <div style={{color:'#444',marginTop:8}} dangerouslySetInnerHTML={{__html:currentReto.descripcion}} />

        <div style={{marginTop:10}}>
          <strong>Criterios:</strong>
          <ul>
            {currentReto.criterios.map((c,i) => <li key={i}>{c}</li>)}
          </ul>
        </div>

        <div style={{display:'flex',flexWrap:'wrap',gap:12,marginTop:8}}>
          <div>
            <strong>Tiempo estimado:</strong>
            <div>{currentReto.tiempo_estimado} min</div>
          </div>
          <div>
            <strong>JOL Específica 1:</strong>
            <div>{currentReto.jol_esp_1?.pregunta}</div>
            <div style={{color:'#666'}}>{currentReto.jol_esp_1?.escala}</div>
          </div>
          <div>
            <strong>JOL Específica 2:</strong>
            <div>{currentReto.jol_esp_2?.pregunta}</div>
            <div style={{color:'#666'}}>{currentReto.jol_esp_2?.escala}</div>
          </div>
        </div>

        {currentReto.id === 'RB-C1-N1' && (
          <div style={{marginTop:24}}>
            <TimelineGame />
          </div>
        )}

        {currentReto.id === 'RB-C1-N2' && (
          <div style={{marginTop:24}}>
            <MatchImageTerms />
          </div>
        )}

        {currentReto.id === 'RB-C1-N3' && (
          <div style={{marginTop:24}}>
            <MatchTechSituations />
          </div>
        )}

        {currentReto.id === 'RB-C2-N1' && (
          <div style={{marginTop:24}}>
            <DriveFileSorter />
          </div>
        )}

        {currentReto.id === 'RB-C2-N2' && (
          <div style={{marginTop:24}}>
            <DragAndDropBoard challengeId="RB-C2-N2" onValidation={() => null} />
          </div>
        )}

        {currentReto.id === 'RB-C2-N3' && (
          <div style={{marginTop:24}}>
            <DragAndDropBoard challengeId="RB-C2-N3" onValidation={() => null} />
          </div>
        )}
      </section>

      <p style={{color:'#666',marginTop:18}}>
        Nota: la ruta está registrada como `/preview-phase-b` y no aparece en el menú de la aplicación.
      </p>
    </div>
  );
}
