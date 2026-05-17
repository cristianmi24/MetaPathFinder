import React, { useState, useCallback, useEffect } from 'react';
import { UploadCloud, File, CheckCircle2 } from 'lucide-react';

interface UploadBoardProps {
  challengeId: string;
  onValidation: (success: boolean) => void;
}

export function UploadBoard({ challengeId, onValidation }: UploadBoardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0].name);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0].name);
    }
  };

  useEffect(() => {
    // Es válido en cuanto haya un archivo subido
    onValidation(uploadedFile !== null);
  }, [uploadedFile, onValidation]);

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-8 bg-surface-container-lowest">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h4 className="text-2xl font-black text-on-surface mb-2">Sube tu Archivo</h4>
          <p className="text-on-surface-variant font-medium">
            Adjunta el documento, hoja de cálculo, presentación o exportación gráfica que completaste en tu herramienta externa (Excel, Tinkercad, PowerPoint, etc).
          </p>
        </div>

        {!uploadedFile ? (
          <div
            className={`relative flex flex-col items-center justify-center w-full h-64 border-4 border-dashed rounded-[2rem] transition-all duration-300 bg-white ${
              isDragging ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-outline-variant/30 hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileSelect}
            />
            <div className={`p-6 rounded-full mb-4 ${isDragging ? 'bg-primary/20 text-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
              <UploadCloud className="w-12 h-12" />
            </div>
            <p className="text-lg font-bold text-on-surface mb-1">
              Arrastra tu archivo aquí o <span className="text-primary underline">explora</span>
            </p>
            <p className="text-xs text-on-surface-variant uppercase tracking-widest font-black">
              PDF, XLSX, PNG, JPG, IPYNB, APK
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center w-full h-64 border-2 border-primary/20 bg-primary/5 rounded-[2rem] p-8 text-center animate-in zoom-in duration-300">
            <div className="relative">
              <div className="p-6 bg-white rounded-2xl shadow-xl border border-primary/10">
                <File className="w-16 h-16 text-primary" />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-secondary text-white p-1 rounded-full shadow-lg">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <h5 className="mt-6 text-xl font-black text-on-surface">{uploadedFile}</h5>
            <p className="text-sm font-bold text-primary mt-2">Carga simulada con éxito</p>
            
            <button 
              onClick={() => setUploadedFile(null)}
              className="mt-6 text-xs font-bold text-on-surface-variant hover:text-error transition-colors"
            >
              Quitar archivo y subir otro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
