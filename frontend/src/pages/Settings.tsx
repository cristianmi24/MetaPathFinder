import { Save, Check, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { useCognitiveStore } from '../stores/useCognitiveStore';
import { useTheme } from '../ThemeContext';

const roleLabel: Record<string, string> = {
  student: 'Estudiante',
  admin: 'Administrador',
  teacher: 'Docente',
};

export function SettingsPage() {
  const { user, role, setUser } = useCognitiveStore();
  const { theme, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.name ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saved, setSaved] = useState(false);

  const dirty =
    name !== (user?.name ?? '') ||
    lastName !== (user?.lastName ?? '') ||
    email !== (user?.email ?? '');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    setUser({ name: name.trim(), lastName: lastName.trim(), email: email.trim() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inputClass =
    'ui-sans w-full bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors';
  const labelClass = 'ui-sans text-xs font-semibold text-on-surface-variant tracking-wide uppercase';

  return (
    <div className="max-w-3xl mx-auto py-10 px-5 space-y-8">
      <div>
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-on-surface">Configuración de perfil</h2>
        <p className="ui-sans text-on-surface-variant mt-1">Tus datos y las preferencias de la app.</p>
      </div>

      {!user ? (
        <div className="bento-card p-8 ui-sans text-on-surface-variant">
          Inicia sesión para ver y editar tu perfil.
        </div>
      ) : (
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSave}
          className="bento-card p-6 md:p-8 space-y-6"
        >
          <h3 className="text-lg font-semibold text-on-surface">Tus datos</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className={labelClass}>Nombre</label>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label className={labelClass}>Apellido</label>
              <input className={inputClass} value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Correo electrónico</label>
            <input type="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Rol</label>
            <input
              className={`${inputClass} opacity-70 cursor-not-allowed`}
              value={roleLabel[role ?? ''] ?? '—'}
              readOnly
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            {saved && (
              <span className="ui-sans text-sm text-secondary flex items-center gap-1">
                <Check className="w-4 h-4" /> Guardado
              </span>
            )}
            <button
              type="submit"
              disabled={!dirty || !name.trim() || !email.trim()}
              className="ui-sans bg-primary text-on-primary px-6 py-3 rounded-md font-semibold text-sm hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Guardar cambios
            </button>
          </div>
        </motion.form>
      )}

      {/* Tema */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bento-card p-6 md:p-8"
      >
        <h3 className="text-lg font-semibold text-on-surface mb-1">Apariencia</h3>
        <p className="ui-sans text-sm text-on-surface-variant mb-5">Elige cómo se ve la app.</p>
        <div className="flex gap-3">
          <button
            onClick={() => theme !== 'light' && toggleTheme()}
            className={`ui-sans flex-1 flex items-center justify-center gap-2 py-3 rounded-md border text-sm font-medium transition-colors ${
              theme === 'light'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-outline-variant text-on-surface-variant hover:border-primary/50'
            }`}
          >
            <Sun className="w-4 h-4" /> Claro
          </button>
          <button
            onClick={() => theme !== 'dark' && toggleTheme()}
            className={`ui-sans flex-1 flex items-center justify-center gap-2 py-3 rounded-md border text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-outline-variant text-on-surface-variant hover:border-primary/50'
            }`}
          >
            <Moon className="w-4 h-4" /> Oscuro
          </button>
        </div>
      </motion.div>
    </div>
  );
}
