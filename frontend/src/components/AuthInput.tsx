import { useState, type ComponentType, type InputHTMLAttributes } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  icon: ComponentType<{ className?: string }>;
  value: string;
  onChange: (value: string) => void;
}

/** Campo de los formularios de acceso (estudiante y admin). En contraseñas muestra el botón de ver/ocultar. */
export function AuthInput({ icon: Icon, type = 'text', value, onChange, ...props }: AuthInputProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';

  return (
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
        <Icon className="h-5 w-5" />
      </div>
      <input
        type={isPassword && visible ? 'text' : type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`block w-full pl-12 ${isPassword ? 'pr-12' : 'pr-4'} py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all hover:bg-white`}
        {...props}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          title={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-primary transition-colors"
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      )}
    </div>
  );
}
