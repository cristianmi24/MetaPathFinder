import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Eraser, RotateCcw, Download } from 'lucide-react';

interface CanvasBoardProps {
  challengeId: string;
  onValidation: (success: boolean) => void;
}

export function CanvasBoard({ challengeId, onValidation }: CanvasBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#238636');
  const [lineWidth, setLineWidth] = useState(3);
  const [mode, setMode] = useState<'draw' | 'erase'>('draw');
  const [hasContent, setHasContent] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  useEffect(() => {
    // Si el usuario hace al menos un trazo, lo damos como válido
    onValidation(hasContent);
  }, [hasContent, onValidation]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setHasContent(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineWidth = mode === 'erase' ? 20 : lineWidth;
    ctx.strokeStyle = mode === 'erase' ? '#ffffff' : color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        setHasContent(false);
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-full bg-surface-container-lowest">
      <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-surface-container-low/50">
        <div className="flex items-center gap-2 text-on-surface-variant font-bold text-sm">
          <PenTool className="w-5 h-5 text-primary" />
          Pizarra Digital
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <button 
              onClick={() => setMode('draw')}
              className={`p-2 rounded-lg transition-colors ${mode === 'draw' ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}
              title="Dibujar"
            >
              <PenTool className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setMode('erase')}
              className={`p-2 rounded-lg transition-colors ${mode === 'erase' ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}
              title="Borrar"
            >
              <Eraser className="w-4 h-4" />
            </button>
          </div>
          
          {mode === 'draw' && (
            <input 
              type="color" 
              value={color} 
              onChange={(e) => setColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0 p-0"
              title="Color"
            />
          )}

          <div className="w-[1px] h-6 bg-outline-variant/30"></div>

          <button 
            onClick={clearCanvas}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Limpiar
          </button>
        </div>
      </div>
      
      <div className="flex-1 p-6 flex justify-center items-center bg-surface-container-lowest">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onMouseMove={draw}
          onTouchStart={startDrawing}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
          className="bg-white border-2 border-outline-variant/30 rounded-xl shadow-sm cursor-crosshair touch-none"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
    </div>
  );
}
