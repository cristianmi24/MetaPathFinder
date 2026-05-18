import React, { useState, useEffect, useMemo } from 'react';
import { FileText, CheckCircle2, AlertCircle, Sparkles, AlertTriangle } from 'lucide-react';

interface EssayBoardProps {
  challengeId: string;
  onValidation: (success: boolean) => void;
}

interface CriterionCheck {
  label: string;
  matched: boolean;
  help: string;
}

interface GradeResult {
  score: number; // Calificación de 1.0 a 5.0
  approved: boolean;
  wordCount: number;
  checks: CriterionCheck[];
  missingTip: string;
}

export function EssayBoard({ challengeId, onValidation }: EssayBoardProps) {
  const [text, setText] = useState('');

  // Configuración de rúbricas y palabras clave específicas por reto
  const challengeRubric = useMemo(() => {
    switch (challengeId) {
      case 'RB-C4-N3':
        return {
          title: 'Propuesta de solución tecnológica local',
          placeholder: 'Identifica un problema de tu barrio o vereda (ej. basura, agua, internet) y propón una solución...',
          minWords: 40,
          criteria: [
            {
              id: 'problema',
              label: 'Problema Identificado',
              help: 'Menciona el problema (usa palabras como: problema, basura, residuos, agua, internet, señal, barrio, vereda).',
              check: (t: string) => /problema|conectividad|señal|basura|residuos|agua|internet|colegio|barrio|vereda|comunidad/i.test(t)
            },
            {
              id: 'solucion',
              label: 'Solución Tecnológica',
              help: 'Propón una tecnología (usa palabras como: tecnología, solución, dispositivo, antena, fibra, satélite, router, wifi, panel).',
              check: (t: string) => /tecnología|solución|dispositivo|antena|fibra|satelital|satélite|router|wifi|cable|sistema/i.test(t)
            },
            {
              id: 'impacto',
              label: 'Impacto Comunitario',
              help: 'Explica los impactos en la gente (usa palabras como: impacto, beneficio, positivo, negativo, ético, mejorar).',
              check: (t: string) => /impacto|beneficio|riesgo|positivo|negativo|ético|mejorar|ayudar/i.test(t)
            }
          ]
        };

      case 'RM-C4-N1':
        return {
          title: 'Auditoría de huella digital personal',
          placeholder: 'Haz un inventario de tus redes sociales y apps, analiza qué datos recopilan y define cómo protegerlos...',
          minWords: 50,
          criteria: [
            {
              id: 'cuentas',
              label: 'Inventario de Cuentas',
              help: 'Lista tus redes o permisos (usa palabras como: cuenta, redes, instagram, tiktok, google, whatsapp, celular, fotos).',
              check: (t: string) => /cuenta|redes|instagram|tiktok|google|whatsapp|celular|permiso|cámara|micrófono|fotos/i.test(t)
            },
            {
              id: 'riesgos',
              label: 'Riesgos Detectados',
              help: 'Explica los peligros (usa palabras como: riesgo, seguridad, privacidad, datos, filtración, clave, contraseña, hacker).',
              check: (t: string) => /riesgo|seguridad|privacidad|datos|filtración|clave|contraseña|hacker|plantilla/i.test(t)
            },
            {
              id: 'medidas',
              label: 'Medidas de Protección',
              help: 'Propón cómo protegerte (usa palabras como: proteger, 2fa, doble factor, cambiar, configuración, seguridad, borrar).',
              check: (t: string) => /proteger|2fa|doble factor|cambiar|configurar|seguridad|ajustes|borrar|eliminar/i.test(t)
            }
          ]
        };

      case 'RM-C4-N2':
        return {
          title: 'Postura sobre regulación de la IA',
          placeholder: 'Escribe tu postura argumentada (a favor o en contra) sobre si el Estado debe regular la IA en Colombia...',
          minWords: 50,
          criteria: [
            {
              id: 'postura',
              label: 'Postura Definida',
              help: 'Define tu opinión (usa palabras como: a favor, en contra, opino, considero, regulación, regular, ley).',
              check: (t: string) => /a favor|en contra|opino|considero|regulación|regular|ley|estado|gobierno/i.test(t)
            },
            {
              id: 'contexto',
              label: 'Contexto y Ejemplos',
              help: 'Menciona a Colombia o casos (usa palabras como: colombia, mintic, europa, estados unidos, china, ley).',
              check: (t: string) => /colombia|mintic|conpes|europa|eeuu|china|ley|país|nacional/i.test(t)
            },
            {
              id: 'argumento',
              label: 'Argumento Ético / Desafío',
              help: 'Sustenta con base ética (usa palabras como: ética, sesgo, desafío, beneficio, impacto, monopolio, IA).',
              check: (t: string) => /ética|sesgo|desafío|beneficio|impacto|monopolio|algoritmo|futuro/i.test(t)
            }
          ]
        };

      case 'RM-C4-N3':
        return {
          title: 'Política escolar de uso ético de IA',
          placeholder: 'Diseña las pautas éticas para que estudiantes y profesores usen IAs en tu institución educativa...',
          minWords: 50,
          criteria: [
            {
              id: 'normas',
              label: 'Normas de Uso',
              help: 'Establece qué está permitido o no (usa palabras como: permitido, prohibido, tareas, clase, estudiantes, docente).',
              check: (t: string) => /permitido|prohibido|usar|tareas|clase|estudiantes|docente|profesor|aula/i.test(t)
            },
            {
              id: 'plagio',
              label: 'Ética y Honestidad Académica',
              help: 'Aborda la copia o autoría (usa palabras como: honestidad, plagio, copia, autoría, original, citar, transparente).',
              check: (t: string) => /honestidad|plagio|copia|autoría|original|citar|transparencia|responsable/i.test(t)
            },
            {
              id: 'consecuencias',
              label: 'Consecuencias y Límites',
              help: 'Explica qué pasa si se incumple (usa palabras como: sanción, consecuencia, límite, nota, evaluación, revisión).',
              check: (t: string) => /sanción|consecuencia|límite|nota|evaluación|revisión|medida/i.test(t)
            }
          ]
        };

      case 'RA-C1-N3':
        return {
          title: 'Patentes de tecnología emergente',
          placeholder: 'Analiza una patente de tecnología emergente y cómo impacta en el desarrollo social y económico colombiano...',
          minWords: 50,
          criteria: [
            {
              id: 'concepto',
              label: 'Concepto de Patente',
              help: 'Identifica la propiedad (usa palabras como: patente, propiedad, intelectual, registro, inventor, derecho).',
              check: (t: string) => /patente|propiedad|intelectual|registro|inventor|derecho|exclusivo/i.test(t)
            },
            {
              id: 'emergente',
              label: 'Caso de Tecnología Emergente',
              help: 'Menciona el caso técnico (usa palabras como: emergente, tecnología, software, salud, sic, wipo, invento).',
              check: (t: string) => /emergente|tecnología|software|salud|sic|wipo|invento|ia|nube/i.test(t)
            },
            {
              id: 'impacto',
              label: 'Reflexión en Colombia',
              help: 'Vincula al contexto nacional (usa palabras como: colombia, impacto, desarrollo, social, económico, monopolio).',
              check: (t: string) => /colombia|impacto|desarrollo|social|económico|monopolio|acceso|beneficio/i.test(t)
            }
          ]
        };

      case 'RA-C4-N1':
        return {
          title: 'Privacidad de datos en plataformas escolares',
          placeholder: 'Analiza qué datos manejan las plataformas del colegio (ej. notas, fotos) y propone pautas de seguridad...',
          minWords: 50,
          criteria: [
            {
              id: 'datos',
              label: 'Datos Sensibles de Menores',
              help: 'Identifica la información (usa palabras como: privacidad, protección, datos, personales, menores, estudiantes).',
              check: (t: string) => /privacidad|protección|datos|personales|menores|estudiantes|seguridad|colegio/i.test(t)
            },
            {
              id: 'riesgos',
              label: 'Riesgos en Plataformas',
              help: 'Enumera debilidades (usa palabras como: plataforma, filtración, venta, perfil, rastreo, terceros, robo).',
              check: (t: string) => /plataforma|colegio|filtración|venta|perfil|rastreo|terceros|seguridad|nube/i.test(t)
            },
            {
              id: 'ley',
              label: 'Medidas y Ley de Datos',
              help: 'Plantea marcos (usa palabras como: ley 1581, habeas data, cifrado, consentimiento, política, medida).',
              check: (t: string) => /ley 1581|habeas data|cifrado|consentimiento|política|medida|prevenir|proteger/i.test(t)
            }
          ]
        };

      default:
        // Configuración genérica por defecto
        return {
          title: 'Editor de análisis y redacción',
          placeholder: 'Escribe tu respuesta analítica aquí...',
          minWords: 40,
          criteria: [
            {
              id: 'analisis',
              label: 'Análisis Crítico',
              help: 'Contiene un desarrollo argumentado de tu idea (mínimo 40 palabras).',
              check: (t: string) => t.split(/\s+/).filter(Boolean).length >= 40
            }
          ]
        };
    }
  }, [challengeId]);

  // Motor evaluador en tiempo real
  const evaluationResult = useMemo((): GradeResult => {
    const cleanText = text.trim();
    const words = cleanText.split(/\s+/).filter(w => w.length > 0).length;

    // Verificar cada criterio
    const checks: CriterionCheck[] = challengeRubric.criteria.map(c => ({
      label: c.label,
      matched: cleanText.length > 0 && c.check(cleanText),
      help: c.help
    }));

    // Calcular nota
    // Nota base = 1.0. Por cada criterio cumplido sumamos un porcentaje proporcional.
    // Además, si cumple el mínimo de palabras, se añade puntuación.
    let score = 1.0;
    const checksCount = checks.filter(c => c.matched).length;
    const totalCriteria = checks.length;
    
    if (totalCriteria > 0) {
      // 3.0 puntos distribuidos entre criterios
      score += (checksCount / totalCriteria) * 3.0;
    }
    
    // 1.0 punto por la longitud mínima de palabras
    if (words >= challengeRubric.minWords) {
      score += 1.0;
    } else if (words > 0) {
      score += (words / challengeRubric.minWords) * 0.8;
    }

    // Limitar puntuación a 5.0 y formatear a 1 decimal
    score = Math.min(Math.round(score * 10) / 10, 5.0);

    // Se aprueba con 3.8 o más, y cumpliendo el mínimo de palabras
    const approved = score >= 3.8 && words >= challengeRubric.minWords;

    // Buscar sugerencia de qué falta
    let missingTip = '';
    const missingCriterion = checks.find(c => !c.matched);
    if (words < challengeRubric.minWords) {
      missingTip = `Escribe un poco más. Faltan ${challengeRubric.minWords - words} palabras para el mínimo de ${challengeRubric.minWords} palabras (texto corto).`;
    } else if (missingCriterion) {
      missingTip = `Sugerencia: ${missingCriterion.help}`;
    } else if (!approved) {
      missingTip = 'Amplía tu análisis para mejorar el vocabulario y la calificación.';
    }

    return {
      score,
      approved,
      wordCount: words,
      checks,
      missingTip
    };
  }, [text, challengeRubric]);

  // Notificar al componente superior sobre la validación del reto
  useEffect(() => {
    onValidation(evaluationResult.approved);
  }, [evaluationResult.approved, onValidation]);

  return (
    <div className="flex flex-col lg:flex-row w-full h-full bg-surface-container-lowest rounded-3xl overflow-hidden border border-outline-variant/30 transition-colors">
      
      {/* Columna Izquierda: Área de escritura */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-outline-variant/20">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-surface-container-low">
          <div className="flex items-center gap-2 text-on-surface-variant font-bold text-sm">
            <FileText className="w-5 h-5 text-primary" />
            <span className="text-on-surface">{challengeRubric.title}</span>
          </div>
          <div className={`text-xs font-black px-3 py-1 rounded-full transition-all ${
            evaluationResult.wordCount >= challengeRubric.minWords 
              ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' 
              : 'bg-surface-container-highest text-on-surface-variant'
          }`}>
            {evaluationResult.wordCount} / {challengeRubric.minWords} palabras mín.
          </div>
        </div>
        
        <div className="flex-1 p-4 relative bg-surface-container-lowest">
          <textarea
            className="w-full h-full min-h-[300px] p-5 text-on-surface bg-surface-container border border-outline-variant/40 rounded-2xl shadow-inner resize-none focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-on-surface-variant/50 text-base leading-relaxed font-medium"
            placeholder={challengeRubric.placeholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
      </div>

      {/* Columna Derecha: Verificador de estructura & Calificación */}
      <div className="w-full lg:w-[350px] bg-surface-container p-5 flex flex-col justify-between flex-shrink-0 border-l border-outline-variant/10">
        
        {/* Sección superior: Calificación en vivo */}
        <div className="space-y-5">
          <div className="text-center p-4 bg-surface-container-lowest rounded-2xl border border-outline-variant/30 relative overflow-hidden shadow-sm">
            <span className="text-[10px] font-mono text-on-surface-variant/70 uppercase tracking-widest block mb-1">Calificación en Vivo</span>
            <div className="flex justify-center items-baseline gap-1">
              <span className={`text-4xl font-black ${evaluationResult.approved ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {evaluationResult.score.toFixed(1)}
              </span>
              <span className="text-xs text-on-surface-variant font-bold">/ 5.0</span>
            </div>
            
            <div className="mt-2.5">
              {evaluationResult.approved ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-full">
                  <Sparkles className="w-3 h-3" /> Reto Aprobado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  <AlertTriangle className="w-3 h-3" /> Falta Estructura
                </span>
              )}
            </div>
          </div>

          {/* Checklist de Estructura */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Estructura Requerida</h4>
            <div className="space-y-2">
              {evaluationResult.checks.map((check, idx) => (
                <div 
                  key={idx} 
                  className={`p-3 rounded-xl border transition-all ${
                    check.matched 
                      ? 'bg-green-500/5 border-green-500/25 text-on-surface' 
                      : 'bg-surface-container-lowest/50 border-outline-variant/30 text-on-surface-variant'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {check.matched ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-on-surface-variant/40 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-xs font-bold ${check.matched ? 'text-green-600 dark:text-green-300' : 'text-on-surface'}`}>
                        {check.label}
                      </p>
                      <p className="text-[10px] text-on-surface-variant leading-snug mt-1 font-medium">
                        {check.help}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sección inferior: Sugerencias en tiempo real */}
        <div className="mt-5 pt-4 border-t border-outline-variant/20">
          <div className={`p-3.5 rounded-xl text-xs font-semibold leading-relaxed border transition-colors ${
            evaluationResult.approved 
              ? 'bg-green-500/5 text-green-600 dark:text-green-400 border-green-500/20' 
              : 'bg-amber-500/5 text-amber-600 dark:text-amber-400 border-amber-500/20'
          }`}>
            {evaluationResult.missingTip}
          </div>
        </div>

      </div>
    </div>
  );
}
