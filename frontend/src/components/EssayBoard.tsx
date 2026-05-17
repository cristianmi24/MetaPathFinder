import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';

interface EssayBoardProps {
  challengeId: string;
  onValidation: (success: boolean) => void;
}

export function EssayBoard({ challengeId, onValidation }: EssayBoardProps) {
  const [text, setText] = useState('');
  
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  
  // Consideramos válido si escribe más de 30 palabras (validación simulada)
  const isSuccess = wordCount >= 30;

  useEffect(() => {
    onValidation(isSuccess);
  }, [isSuccess, onValidation]);

  return (
    <div className="flex flex-col w-full h-full bg-surface-container-lowest">
      <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-surface-container-low/50">
        <div className="flex items-center gap-2 text-on-surface-variant font-bold text-sm">
          <FileText className="w-5 h-5 text-primary" />
          Editor de Texto Enriquecido
        </div>
        <div className={`text-xs font-black px-3 py-1 rounded-full transition-colors ${isSuccess ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
          {wordCount} palabras {isSuccess && '(Mínimo alcanzado)'}
        </div>
      </div>
      
      <div className="flex-1 p-6">
        <textarea
          className="w-full h-full p-6 text-slate-900 bg-white border-2 border-outline-variant/30 rounded-2xl shadow-inner resize-none focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400 text-lg leading-relaxed font-medium"
          placeholder="Escribe tu ensayo, reporte o análisis aquí..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
    </div>
  );
}
