export interface CustomQuestion {
  id: string;
  category: string;
  difficulty: number;
  text: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  metacognitivePrompt?: string;
  context?: string;
  type?: string;
}

export const levelColors = {
  basico: '#10b981',
  intermedio: '#f59e0b',
  experto: '#ef4444',
} as const;
