import { Compass, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-violet-400 flex items-center justify-center text-white mb-6">
        <Compass size={28} />
      </div>
      <h1 className="text-5xl font-bold text-on-background mb-2">404</h1>
      <p className="text-lg text-on-background mb-1">Esta página no existe</p>
      <p className="text-sm text-on-surface-variant max-w-md mb-8">
        La ruta que intentaste abrir no está disponible. Puede que el enlace esté roto o que la página se haya movido.
      </p>
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        <ArrowLeft size={16} /> Volver al inicio
      </button>
    </div>
  );
}
