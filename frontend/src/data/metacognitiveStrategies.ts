export interface Estrategia {
  id: string; color: string; iconBg: string; icon: string;
  badge: string; badgeBg: string; badgeColor: string;
  nombre: string; teoria: string; desc: string;
  pasos: string[]; pasoColor: string; pasoBg: string;
  teoriaDetail: string;
}

export interface PerfilData {
  label: string; chipStyle: React.CSSProperties; chipIcon: string;
  dim1: { w: string; color: string; score: string };
  dim2: { w: string; color: string; score: string };
  estrategias: Estrategia[];
}

export const nuevasEstrategias: Estrategia[] = [
  { id:'est1', color:'#f2cc60', iconBg:'rgba(242,204,96,0.1)', icon:'ti-list', badge:'Planificación', badgeBg:'rgba(242,204,96,0.1)', badgeColor:'#f2cc60', nombre:'Descomposición previa del problema', teoria:'Monitoreo: Si el estudiante planifica antes de empezar', desc:'Evidencias: Número de subtareas creadas, uso de checklist, tiempo antes de escribir código.', pasos:['Dibuja el flujo general en papel','Identifica los componentes mínimos','Estima el tiempo de cada componente'], pasoColor:'#f2cc60', pasoBg:'rgba(242,204,96,0.15)', teoriaDetail:'El sistema monitoreará si existe planificación previa antes de iniciar la escritura de código.' },
  { id:'est2', color:'#388bfd', iconBg:'rgba(56,139,253,0.1)', icon:'ti-adjustments-horizontal', badge:'Monitoreo', badgeBg:'rgba(56,139,253,0.1)', badgeColor:'#388bfd', nombre:'Control de confianza en puntos de control', teoria:'Monitoreo: Cambios en la seguridad del estudiante', desc:'Evidencias: JOL inicial/final, actualizaciones de confianza durante la actividad.', pasos:['Pon un temporizador','Al sonar: ¿sigo tan seguro como al inicio?','Ajusta tu expectativa (JOL)'], pasoColor:'#388bfd', pasoBg:'rgba(56,139,253,0.15)', teoriaDetail:'El sistema verificará las fluctuaciones de confianza (JOL) reportadas a lo largo de la prueba.' },
  { id:'est3', color:'#d2a8ff', iconBg:'rgba(210,168,255,0.1)', icon:'ti-message-question', badge:'Autoevaluación', badgeBg:'rgba(210,168,255,0.1)', badgeColor:'#d2a8ff', nombre:'Verificación de supuestos antes de ejecutar', teoria:'Monitoreo: Si piensa antes de ejecutar', desc:'Evidencias: Predicción escrita antes de correr el código, comparación con resultado real.', pasos:['Escribe "Espero que esto haga: ___"','Ejecuta y observa la diferencia','Anota la causa de la discrepancia'], pasoColor:'#d2a8ff', pasoBg:'rgba(210,168,255,0.15)', teoriaDetail:'El sistema evaluará si formulas hipótesis o predicciones claras antes de cada ejecución.' },
  { id:'est4', color:'#5dcaa5', iconBg:'rgba(93,202,165,0.1)', icon:'ti-clock', badge:'Regulación temporal', badgeBg:'rgba(93,202,165,0.1)', badgeColor:'#5dcaa5', nombre:'Estimación segmentada del tiempo', teoria:'Monitoreo: Precisión en la percepción temporal', desc:'Evidencias: Tiempo estimado vs tiempo real.', pasos:['Fase de análisis: ___ min','Fase de implementación: ___ min','Fase de prueba y corrección: ___ min'], pasoColor:'#5dcaa5', pasoBg:'rgba(93,202,165,0.15)', teoriaDetail:'El sistema contrastará tus tiempos estimados con los tiempos de ejecución reales.' },
  { id:'est5', color:'#ff7b72', iconBg:'rgba(255,123,114,0.1)', icon:'ti-zoom-question', badge:'Conocimiento', badgeBg:'rgba(255,123,114,0.1)', badgeColor:'#ff7b72', nombre:'Mapeo explícito de lo que no sé', teoria:'Monitoreo: Reconocimiento de dudas reales', desc:'Evidencias: Lista de dudas iniciales y solicitudes de ayuda.', pasos:['Sé que ___ (certeza alta)','Creo que ___ (podría equivocarme)','No sé cómo ___ (necesito verificar)'], pasoColor:'#ff7b72', pasoBg:'rgba(255,123,114,0.15)', teoriaDetail:'El sistema buscará que enuncies tus dudas de forma clara mediante solicitudes de ayuda o notas.' },
  { id:'est6', color:'#388bfd', iconBg:'rgba(56,139,253,0.1)', icon:'ti-trophy', badge:'Autoeficacia', badgeBg:'rgba(56,139,253,0.1)', badgeColor:'#388bfd', nombre:'Registro de evidencias de competencia', teoria:'Monitoreo: Reconocimiento de avances logrados', desc:'Evidencias: Errores corregidos, tareas completadas, hitos alcanzados.', pasos:['Abre un bloc de notas junto al editor','Anota cada cosa que funcione','Al final, lee la lista antes de calificarte'], pasoColor:'#388bfd', pasoBg:'rgba(56,139,253,0.15)', teoriaDetail:'El sistema observará si logras reconocer y registrar progresivamente tus propios avances.' },
  { id:'est7', color:'#5dcaa5', iconBg:'rgba(93,202,165,0.1)', icon:'ti-stairs', badge:'Graduación', badgeBg:'rgba(93,202,165,0.1)', badgeColor:'#5dcaa5', nombre:'Submetas visibles y celebrables', teoria:'Monitoreo: Persistencia y progreso gradual', desc:'Evidencias: Porcentaje de pasos completados y continuidad de trabajo.', pasos:['Define hitos mínimos del reto','Marca cada uno al completarlo','Antes de rendirte, cuenta cuántos lograste'], pasoColor:'#5dcaa5', pasoBg:'rgba(93,202,165,0.15)', teoriaDetail:'El sistema registrará la continuidad y porcentaje de compleción paso a paso.' },
  { id:'est8', color:'#ffa657', iconBg:'rgba(255,166,87,0.1)', icon:'ti-message-share', badge:'Atribución', badgeBg:'rgba(255,166,87,0.1)', badgeColor:'#ffa657', nombre:'Reencuadre de errores como datos', teoria:'Monitoreo: Forma de interpretar los errores', desc:'Evidencias: Respuestas cortas después de errores y acciones tomadas tras fallar.', pasos:['Al recibir un error, respira y anota','"Este error indica que ___ necesita revisión"','Busca exactamente esa cosa'], pasoColor:'#ffa657', pasoBg:'rgba(255,166,87,0.15)', teoriaDetail:'El sistema medirá el tiempo de reacción tras un fallo y los ajustes inmediatos que apliques.' }
];

export const perfilesData: Record<string, PerfilData> = {
  over: {
    label: 'Sobreconfianza crítica',
    chipStyle: { background:'rgba(255,123,114,0.1)', border:'0.5px solid rgba(255,123,114,0.35)', color:'#ff7b72' },
    chipIcon: 'ti-alert-triangle',
    dim1: { w: '30%', color: '#ff7b72', score: 'Nivel bajo · principal área de intervención' },
    dim2: { w: '25%', color: '#f2cc60', score: 'Nivel muy bajo · ensayo-error sin monitoreo' },
    estrategias: nuevasEstrategias
  },
  sub: {
    label: 'Subestimación · baja autoeficacia',
    chipStyle: { background:'rgba(56,139,253,0.1)', border:'0.5px solid rgba(56,139,253,0.35)', color:'#388bfd' },
    chipIcon: 'ti-trending-down',
    dim1: { w: '65%', color: '#388bfd', score: 'Nivel medio · conoce pero no se reconoce' },
    dim2: { w: '45%', color: '#f2cc60', score: 'Nivel medio-bajo · monitoreo ansioso, no regulado' },
    estrategias: nuevasEstrategias
  },
  cal: {
    label: 'Perfil calibrado · alta metacognición',
    chipStyle: { background:'rgba(93,202,165,0.1)', border:'0.5px solid rgba(93,202,165,0.35)', color:'#5dcaa5' },
    chipIcon: 'ti-circle-check',
    dim1: { w: '82%', color: '#5dcaa5', score: 'Nivel alto · conciencia metacognitiva sólida' },
    dim2: { w: '85%', color: '#5dcaa5', score: 'Nivel alto · monitoreo y regulación activos' },
    estrategias: nuevasEstrategias
  }
};
