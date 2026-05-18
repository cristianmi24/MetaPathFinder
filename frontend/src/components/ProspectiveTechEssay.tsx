import React, { useState, useEffect, useMemo } from 'react';
import { FileText, CheckCircle2, AlertCircle, Lightbulb } from 'lucide-react';

interface ValidationResult {
  nota: number;
  nivel: string;
  palabras: number;
  tieneIntro: boolean;
  tieneConclusion: boolean;
  conectoresEncontrados: number;
  tieneTecnologias: boolean;
  mencionaColombia: boolean;
  tieneProyeccionFuturo: boolean;
  tieneArgumentos: boolean;
}

function evaluarEstructura(texto: string): ValidationResult {
  const t = texto.toLowerCase().trim();

  let nota = 0;

  const intro = [
    "hoy en día",
    "la tecnología",
    "actualmente",
    "en la actualidad",
    "en los últimos años",
    "en el futuro",
    "este artículo"
  ];
  const tieneIntro = intro.some(frase => t.includes(frase));
  if (tieneIntro) nota += 1;

  const conectores = [
    "porque", "además", "también", "por eso", "sin embargo",
    "no obstante", "por otro lado", "asimismo", "en primer lugar",
    "por ejemplo", "en cuanto a", "debido a", "es decir"
  ];
  let conectoresEncontrados = 0;
  conectores.forEach(c => {
    if (t.includes(c)) conectoresEncontrados++;
  });
  if (conectoresEncontrados >= 3) {
    nota += 2;
  } else if (conectoresEncontrados >= 2) {
    nota += 1;
  }

  const conclusion = [
    "en conclusión",
    "finalmente",
    "para terminar",
    "en resumen",
    "para concluir",
    "en definitiva"
  ];
  const tieneConclusion = conclusion.some(frase => t.includes(frase));
  if (tieneConclusion) nota += 1;

  const palabras = texto.split(/\s+/).filter(Boolean).length;
  if (palabras >= 80) {
    nota += 2;
  } else if (palabras >= 50) {
    nota += 1;
  }

  const tecnologiasClave = [
    "ia", "inteligencia artificial", "realidad aumentada", "realidad virtual",
    "nube", "cloud", "blockchain", "biometría", "gemini", "chatgpt",
    "iot", "internet de las cosas", "big data", "metaverso", "5g"
  ];
  const tieneTecnologias = tecnologiasClave.some(tech => t.includes(tech));
  if (tieneTecnologias) nota += 1;

  const mencionaColombia = /colombia|colombiano|colombiana|país|nacional|región/i.test(texto);
  if (mencionaColombia) nota += 1;

  const tieneProyeccionFuturo = /2040|futuro|próximos años|dentro de \d+|para entonces|tendencia|proyección/i.test(t);
  if (tieneProyeccionFuturo) nota += 1;

  const tieneArgumentos = /problema|inequidad|impacto|beneficio|desafío|oportunidad|mejorar|acceso|disponible|barrera/i.test(t);
  if (tieneArgumentos) nota += 1;

  let nivel = "";
  if (nota >= 8) nivel = "Excelente estructura";
  else if (nota >= 6) nivel = "Buena estructura";
  else if (nota >= 3) nivel = "Estructura básica";
  else nivel = "Debe mejorar la estructura";

  return { nota, nivel, palabras, tieneIntro, tieneConclusion, conectoresEncontrados, tieneTecnologias, mencionaColombia, tieneProyeccionFuturo, tieneArgumentos };
}

interface ProspectiveTechEssayProps {
  challengeId: string;
  onValidation: (success: boolean) => void;
}

export function ProspectiveTechEssay({ challengeId, onValidation }: ProspectiveTechEssayProps) {
  const [text, setText] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const result = useMemo(() => evaluarEstructura(text), [text]);

  const isSuccess = result.nota >= 5;

  useEffect(() => {
    onValidation(isSuccess);
  }, [isSuccess, onValidation]);

  const getNivelColor = () => {
    if (result.nota >= 8) return 'text-emerald-400';
    if (result.nota >= 5) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="flex flex-col w-full h-full bg-surface-container-lowest">
      <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-surface-container-low/50">
        <div className="flex items-center gap-2 text-on-surface-variant font-bold text-sm">
          <FileText className="w-5 h-5 text-primary" />
          Artículo prospectivo: educación en 2040
        </div>
        <div className="flex items-center gap-3">
          <div className={`text-xs font-black px-3 py-1 rounded-full transition-colors ${result.palabras >= 50 ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
            {result.palabras} palabras
          </div>
          <button
            className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all ${showFeedback ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high'}`}
            onClick={() => setShowFeedback(!showFeedback)}
          >
            {showFeedback ? 'Ocultar' : 'Verificar'} estructura
          </button>
        </div>
      </div>

      {showFeedback && (
        <div className="mx-6 mt-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold">Evaluación de estructura</span>
            <span className={`text-lg font-black ${getNivelColor()}`}>
              {result.nivel} ({result.nota}/9)
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className={`flex items-center gap-1.5 p-2 rounded-lg ${result.tieneIntro ? 'bg-emerald-400/10 text-emerald-400' : 'bg-surface-container-highest text-on-surface-variant'}`}>
              {result.tieneIntro ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              Introducción
            </div>
            <div className={`flex items-center gap-1.5 p-2 rounded-lg ${result.conectoresEncontrados >= 2 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-surface-container-highest text-on-surface-variant'}`}>
              {result.conectoresEncontrados >= 2 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              Conectores ({result.conectoresEncontrados})
            </div>
            <div className={`flex items-center gap-1.5 p-2 rounded-lg ${result.tieneConclusion ? 'bg-emerald-400/10 text-emerald-400' : 'bg-surface-container-highest text-on-surface-variant'}`}>
              {result.tieneConclusion ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              Conclusión
            </div>
            <div className={`flex items-center gap-1.5 p-2 rounded-lg ${result.tieneTecnologias ? 'bg-emerald-400/10 text-emerald-400' : 'bg-surface-container-highest text-on-surface-variant'}`}>
              {result.tieneTecnologias ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              Tecnologías
            </div>
            <div className={`flex items-center gap-1.5 p-2 rounded-lg ${result.mencionaColombia ? 'bg-emerald-400/10 text-emerald-400' : 'bg-surface-container-highest text-on-surface-variant'}`}>
              {result.mencionaColombia ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              Contexto Colombia
            </div>
            <div className={`flex items-center gap-1.5 p-2 rounded-lg ${result.tieneProyeccionFuturo ? 'bg-emerald-400/10 text-emerald-400' : 'bg-surface-container-highest text-on-surface-variant'}`}>
              {result.tieneProyeccionFuturo ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              Proyección futura
            </div>
            <div className={`flex items-center gap-1.5 p-2 rounded-lg ${result.tieneArgumentos ? 'bg-emerald-400/10 text-emerald-400' : 'bg-surface-container-highest text-on-surface-variant'}`}>
              {result.tieneArgumentos ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              Argumentos/impacto
            </div>
            <div className={`flex items-center gap-1.5 p-2 rounded-lg ${result.palabras >= 50 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-surface-container-highest text-on-surface-variant'}`}>
              {result.palabras >= 50 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {result.palabras} palabras
            </div>
            <div className={`flex items-center gap-1.5 p-2 rounded-lg ${result.nota >= 5 ? 'bg-emerald-400/10 text-emerald-400' : 'bg-surface-container-highest text-on-surface-variant'}`}>
              {result.nota >= 5 ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {result.nota >= 5 ? 'Aprobado' : 'No aprueba'}
            </div>
          </div>

          {result.nota < 5 && (
            <div className="mt-3 p-3 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-400/90">
                <strong>Sugerencia:</strong> Para aprobar necesitas: introducción, al menos 2 conectores, conclusión,
                mención de tecnologías (IA, RA, blockchain), contexto colombiano, proyección a futuro (2040),
                y argumentos de impacto/inequidad. Mínimo 50 palabras.
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 p-6">
        <textarea
          className="w-full h-full p-6 text-slate-900 bg-white border-2 border-outline-variant/30 rounded-2xl shadow-inner resize-none focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400 text-lg leading-relaxed font-medium"
          placeholder="Escribe tu artículo prospectivo sobre cómo será la educación en 2040 en Colombia. Incluye introducción, desarrollo con conectores y una conclusión. Menciona al menos 4 tecnologías (IA, realidad aumentada, nube, blockchain, etc.) y analiza su impacto."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
    </div>
  );
}
