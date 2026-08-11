export type JolType = 'escala' | 'tiempo' | 'capacidad';

export interface JolInput {
  tipo: JolType;
  valor: number | string;
  tiempo_maximo?: number;
}

const CAPACITY_MAP: Record<string, number> = {
  'nunca lo he hecho': 1,
  'he leído sobre ello': 3.3,
  'lo he practicado poco': 6.6,
  'lo domino': 10,
  'entender qué me piden': 2.5,
  'encontrar la información necesaria': 5,
  'organizar mis ideas': 7.5,
  'redactar o presentar el resultado': 10,
  'no tengo experiencia previa relevante': 1,
  'tengo algo de experiencia pero no estoy seguro/a de aplicarla': 3.3,
  'mi experiencia previa me da buena base': 6.6,
  'mi experiencia previa me prepara completamente': 10,
  'muy capaz': 10,
  capaz: 8,
  'algo capaz': 6,
  'poco capaz': 4,
  'no muy capaz': 3,
  'no me siento capaz': 1,
  'no capaz': 0,
};

export function normalizeJol(jol: JolInput): number {
  const { tipo, valor: raw, tiempo_maximo } = jol;

  let confidence: number;

  if (tipo === 'escala') {
    confidence = raw as number;
    if (confidence > 10) confidence = confidence / 10;
  } else if (tipo === 'tiempo') {
    const maxTime = tiempo_maximo ?? 15;
    confidence = 10 - ((raw as number) / maxTime) * 10;
  } else if (tipo === 'capacidad') {
    if (typeof raw === 'string') {
      const numMatch = raw.match(/^(\d+)=/);
      if (numMatch) {
        const n = parseInt(numMatch[1]);
        const maxOpts = 4;
        confidence = ((n - 1) / (maxOpts - 1)) * 10;
      } else {
        confidence = CAPACITY_MAP[raw.toLowerCase().trim()] ?? 5;
      }
    } else {
      confidence = raw as number;
    }
  } else {
    throw new Error(`Unsupported JOL type: ${tipo}`);
  }

  return Math.max(0, Math.min(10, confidence));
}

export function normalizePerformance(value: number): number {
  if (value > 10) return value / 10;
  return value;
}

export function computePredictedConfidence(jols: JolInput[]): {
  confianzas_normalizadas: number[];
  nivel_confianza_predicho: number;
  etiqueta: string;
} {
  const confidences = jols.map(normalizeJol);
  const avg = confidences.reduce((a, b) => a + b, 0) / confidences.length;

  return {
    confianzas_normalizadas: confidences.map((c) => Math.round(c * 100) / 100),
    nivel_confianza_predicho: Math.round(avg * 100) / 100,
    etiqueta: classifyConfidence(avg),
  };
}

export function computeCalibration(
  jols: JolInput[],
  actualScores: number[],
): {
  confianzas_normalizadas: number[];
  resultados_normalizados: number[];
  diferencias_por_item: number[];
  error_promedio: number;
  calibracion: number;
  nivel: string;
} {
  if (jols.length !== actualScores.length) {
    throw new Error('JOLs and actual scores must have the same length');
  }

  const confidences = jols.map(normalizeJol);
  const performances = actualScores.map(normalizePerformance);

  const diffs = confidences.map((c, i) => Math.abs(c - performances[i]));
  const avgError = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  const calibration = Math.max(0, Math.min(10, 10 - avgError));

  return {
    confianzas_normalizadas: confidences.map((c) => Math.round(c * 100) / 100),
    resultados_normalizados: performances.map((p) => Math.round(p * 100) / 100),
    diferencias_por_item: diffs.map((d) => Math.round(d * 100) / 100),
    error_promedio: Math.round(avgError * 100) / 100,
    calibracion: Math.round(calibration * 100) / 100,
    nivel: classifyCalibration(calibration),
  };
}

function classifyConfidence(avg: number): string {
  if (avg >= 9) return 'Confianza muy alta';
  if (avg >= 7) return 'Confianza alta';
  if (avg >= 5) return 'Confianza media';
  if (avg >= 3) return 'Confianza baja';
  return 'Confianza muy baja';
}

function classifyCalibration(cal: number): string {
  if (cal >= 9) return 'Excelente calibración';
  if (cal >= 7) return 'Buena calibración';
  if (cal >= 5) return 'Calibración regular';
  if (cal >= 3) return 'Baja calibración (sobreconfianza o subconfianza)';
  return 'Muy baja calibración';
}
