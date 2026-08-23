import { useState } from 'react';
import { X, ShieldCheck } from 'lucide-react';

interface TermsCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  dark?: boolean;
}

export function TermsCheckbox({ checked, onChange, dark }: TermsCheckboxProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <label className="flex items-start gap-2.5 text-xs leading-relaxed cursor-pointer select-none">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          required
          className="mt-0.5 w-4 h-4 shrink-0 accent-primary cursor-pointer"
        />
        <span className={dark ? 'text-white/70' : 'text-slate-600'}>
          He leído y acepto los{' '}
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); setShowModal(true); }}
            className="font-bold text-primary underline underline-offset-2 hover:opacity-80"
          >
            Términos y Condiciones y la Política de Tratamiento de Datos Personales
          </button>
          .
        </span>
      </label>

      {showModal && <TermsModal onClose={() => setShowModal(false)} onAccept={() => { onChange(true); setShowModal(false); }} />}
    </>
  );
}

function TermsModal({ onClose, onAccept }: { onClose: () => void; onAccept: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Términos y Condiciones · Tratamiento de Datos Personales</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 text-sm text-slate-700 dark:text-slate-300 space-y-4 leading-relaxed">
          <p className="text-xs text-slate-500 dark:text-slate-400">Última actualización: agosto de 2026</p>

          <section>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">1. Responsable del tratamiento</h3>
            <p>MetaPathFinder ("la Plataforma") es responsable del tratamiento de los datos personales que usted suministra al registrarse. El uso de la Plataforma tiene fines exclusivamente educativos y de investigación en aprendizaje adaptativo y metacognición.</p>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">2. Datos que recolectamos</h3>
            <p className="mb-1">Al registrarse, la Plataforma recopila únicamente:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-1">
              <li>Nombre y apellido</li>
              <li>Correo electrónico</li>
              <li>Contraseña (almacenada de forma cifrada, nunca en texto plano)</li>
              <li>Rol dentro de la Plataforma (estudiante, profesor o administrador)</li>
              <li>Datos de interacción y desempeño académico (respuestas a actividades, tiempos, intentos, pistas usadas y eventos cognitivos como pausas, distracciones o patrones de navegación) generados durante el uso de la Plataforma</li>
            </ul>
            <p className="mt-2 font-semibold text-slate-900 dark:text-white">
              La Plataforma NO solicita ni almacena documentos de identidad (cédula, tarjeta de identidad, pasaporte u otro) ni ningún otro dato sensible.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">3. Finalidad del tratamiento</h3>
            <p>Los datos se usan para: (a) crear y gestionar su cuenta y sesiones; (b) medir y retroalimentar su progreso académico y calibración metacognitiva; (c) generar estadísticas agregadas y anonimizadas para fines de investigación educativa; y (d) fines administrativos internos de la institución educativa que administra la Plataforma.</p>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">4. Marco legal</h3>
            <p>Este tratamiento se realiza conforme a la Ley 1581 de 2012, el Decreto 1377 de 2013 y demás normas concordantes sobre protección de datos personales y Habeas Data vigentes en Colombia.</p>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">5. Sus derechos</h3>
            <p className="mb-1">Como titular de los datos, usted tiene derecho a:</p>
            <ul className="list-disc list-inside space-y-0.5 ml-1">
              <li>Conocer, actualizar y rectificar sus datos personales</li>
              <li>Solicitar prueba de la autorización otorgada</li>
              <li>Ser informado sobre el uso dado a sus datos</li>
              <li>Presentar quejas ante la autoridad competente</li>
              <li>Revocar la autorización y/o solicitar la supresión de sus datos, cuando no exista un deber legal o contractual que impida eliminarlos</li>
              <li>Acceder de forma gratuita a sus datos personales tratados</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">6. Cómo ejercer sus derechos</h3>
            <p>Puede ejercer cualquiera de estos derechos, o solicitar la eliminación de su cuenta y datos asociados, contactando al administrador de la Plataforma o al docente responsable de su institución educativa.</p>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">7. Conservación y seguridad</h3>
            <p>Sus datos se almacenan en una base de datos con acceso restringido y se conservan mientras su cuenta permanezca activa o mientras sean necesarios para los fines académicos/investigativos descritos. Las contraseñas se almacenan siempre cifradas.</p>
          </section>

          <section>
            <h3 className="font-bold text-slate-900 dark:text-white mb-1">8. Aceptación</h3>
            <p>Al marcar la casilla de aceptación y crear una cuenta, usted autoriza expresamente a MetaPathFinder para el tratamiento de sus datos personales conforme a lo aquí descrito.</p>
          </section>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={onAccept}
            className="px-5 py-2 rounded-xl text-sm font-black text-on-primary bg-primary hover:opacity-90 transition-opacity shadow-lg shadow-primary/20"
          >
            Acepto
          </button>
        </div>
      </div>
    </div>
  );
}
