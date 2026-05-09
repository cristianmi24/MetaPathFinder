import { Camera, Save, BellRing, Sparkles, Palette, Monitor, Coffee } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';
import { useState } from 'react';

export function SettingsPage() {
  const [activeTheme, setActiveTheme] = useState('joyful');

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-4xl font-bold tracking-tight">Configuración de Perfil</h2>
        <p className="text-lg text-on-surface-variant mt-2 font-medium">
          Gestiona tu identidad cognitiva, preferencias de sistema y ajustes de notificaciones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Avatar Selection */}
        <section className="md:col-span-4 bento-card p-10 flex flex-col items-center text-center">
          <h3 className="text-xl font-bold self-start mb-10">Avatar Cognitivo</h3>
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-surface shadow-xl relative">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="text-white w-8 h-8" />
              </div>
            </div>
            <button className="absolute bottom-1 right-1 w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mt-8 mb-4">Selecciona un nuevo estado visual</p>
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container/30 border-2 border-primary cursor-pointer hover:scale-105 transition-transform" />
            <div className="w-12 h-12 rounded-full bg-secondary-container/30 border-2 border-transparent hover:border-secondary cursor-pointer hover:scale-105 transition-transform" />
            <div className="w-12 h-12 rounded-full bg-surface-container-highest border-2 border-transparent hover:border-outline-variant cursor-pointer hover:scale-105 transition-transform flex items-center justify-center">
              <span className="text-xl font-bold text-on-surface-variant">+</span>
            </div>
          </div>
        </section>

        {/* Account Details */}
        <section className="md:col-span-8 bento-card p-10 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl" />
          <h3 className="text-xl font-bold mb-10 pb-4 border-b border-outline-variant/20 relative z-10">Ajustes de Cuenta</h3>
          <form className="space-y-8 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-xs font-bold text-on-surface-variant tracking-widest uppercase">Nombre Completo</label>
                <input 
                  type="text" 
                  defaultValue="Dra. Elena Navarro" 
                  className="w-full bg-surface border-none rounded-xl px-5 py-4 focus:ring-4 focus:ring-primary/20 focus:bg-white text-on-surface font-medium transition-all"
                />
              </div>
              <div className="space-y-3">
                <label className="text-xs font-bold text-on-surface-variant tracking-widest uppercase">Rol Académico</label>
                <input 
                  type="text" 
                  defaultValue="Investigadora Principal" 
                  className="w-full bg-surface border-none rounded-xl px-5 py-4 focus:ring-4 focus:ring-primary/20 focus:bg-white text-on-surface font-medium transition-all"
                />
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs font-bold text-on-surface-variant tracking-widest uppercase">Correo Electrónico</label>
              <input 
                type="email" 
                defaultValue="elena.navarro@instituto.edu" 
                className="w-full bg-surface border-none rounded-xl px-5 py-4 focus:ring-4 focus:ring-primary/20 focus:bg-white text-on-surface font-medium transition-all"
              />
            </div>
            <div className="flex justify-end pt-4">
              <button className="bg-primary text-on-primary px-8 py-4 rounded-full font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                <Save className="w-4 h-4" /> Guardar Cambios
              </button>
            </div>
          </form>
        </section>

        {/* IA Notifications */}
        <section className="md:col-span-6 bento-card p-10">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="text-primary w-6 h-6" />
            <h3 className="text-xl font-bold">Notificaciones de IA</h3>
          </div>
          <p className="text-sm text-on-surface-variant mb-10 font-medium">Ajusta la frecuencia con la que el asistente genera prompts sugeridos y descubrimientos analíticos.</p>
          
          <div className="space-y-12">
            <div>
              <div className="flex justify-between items-center mb-6">
                <label className="text-sm font-bold">Frecuencia de Prompts</label>
                <span className="px-3 py-1 bg-primary-container text-on-primary-container text-[10px] font-bold rounded-full uppercase tracking-wider">Equilibrado</span>
              </div>
              <input type="range" className="w-full h-2 bg-surface-container rounded-lg appearance-none cursor-pointer accent-primary" />
              <div className="flex justify-between text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-4">
                <span>Baja</span>
                <span>Alta</span>
              </div>
            </div>

            <div className="space-y-6 pt-6 border-t border-outline-variant/20">
              <Toggle label="Alertas de Anomalías en Datos" defaultChecked />
              <Toggle label="Sugerencias de Literatura Cruzada" />
            </div>
          </div>
        </section>

        {/* Themes */}
        <section className="md:col-span-6 bento-card p-10">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="text-primary w-6 h-6" />
            <h3 className="text-xl font-bold">Entorno de Trabajo</h3>
          </div>
          <p className="text-sm text-on-surface-variant mb-10 font-medium">Selecciona la paleta que mejor se adapte a tu flujo cognitivo.</p>
          
          <div className="grid grid-cols-2 gap-6">
            <ThemeCard 
              id="joyful"
              title="Joyful Rigor" 
              desc="Modo claro, acentos lavanda y menta." 
              colors={['bg-white', 'bg-primary', 'bg-secondary-container']}
              isActive={activeTheme === 'joyful'}
              onClick={() => setActiveTheme('joyful')}
            />
            <ThemeCard 
              id="archival"
              title="Archivo Antiguo" 
              desc="Tonos sepia y terracota, alto contraste." 
              colors={['bg-tertiary-container/30', 'bg-tertiary', 'bg-on-tertiary-container']}
              isActive={activeTheme === 'archival'}
              onClick={() => setActiveTheme('archival')}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function Toggle({ label, defaultChecked }: any) {
  return (
    <label className="flex items-center justify-between cursor-pointer group">
      <span className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{label}</span>
      <div className="relative">
        <input type="checkbox" defaultChecked={defaultChecked} className="peer sr-only" />
        <div className="w-12 h-6 bg-surface-container border border-outline-variant/30 rounded-full peer-checked:bg-primary transition-colors"></div>
        <div className="absolute left-1 top-1 w-4 h-4 bg-on-surface-variant rounded-full transition-transform peer-checked:translate-x-6 peer-checked:bg-on-primary"></div>
      </div>
    </label>
  );
}

function ThemeCard({ id, title, desc, colors, isActive, onClick }: any) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-5 rounded-2xl border-2 cursor-pointer transition-all relative overflow-hidden group",
        isActive ? "border-primary bg-primary/5 shadow-lg" : "border-outline-variant/30 hover:border-primary/50"
      )}
    >
      <div className="flex gap-2 mb-4">
        {colors.map((c: string, idx: number) => (
          <div key={idx} className={cn("w-6 h-6 rounded-full shadow-sm", c)} />
        ))}
      </div>
      <h4 className="text-sm font-bold mb-1">{title}</h4>
      <p className="text-[10px] font-medium text-on-surface-variant leading-tight">{desc}</p>
      {isActive && (
        <div className="absolute top-2 right-2">
          <Monitor className="w-4 h-4 text-primary" />
        </div>
      )}
    </div>
  );
}
