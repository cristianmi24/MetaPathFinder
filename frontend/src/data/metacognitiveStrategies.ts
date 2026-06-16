export interface HerramientaEstrategia {
  id: string;
  nombre: string;
  descripcion: string;
  icon: string;
}

export interface Estrategia {
  id: string; color: string; iconBg: string; icon: string;
  badge: string; badgeBg: string; badgeColor: string;
  nombre: string; teoria: string; desc: string;
  pasos: string[]; pasoColor: string; pasoBg: string;
  teoriaDetail: string;
  herramientas: HerramientaEstrategia[];
}

export interface PerfilData {
  label: string; chipStyle: React.CSSProperties; chipIcon: string;
  dim1: { w: string; color: string; score: string };
  dim2: { w: string; color: string; score: string };
  estrategias: Estrategia[];
}

export const nuevasEstrategias: Estrategia[] = [
  { id:'est1', color:'#f2cc60', iconBg:'rgba(242,204,96,0.1)', icon:'ti-list', badge:'Planificación', badgeBg:'rgba(242,204,96,0.1)', badgeColor:'#f2cc60', nombre:'Descomposición previa del problema', teoria:'Monitoreo: Si el estudiante planifica antes de empezar', desc:'Evidencias: Número de subtareas creadas, uso de checklist, tiempo antes de escribir código.', pasos:['Dibuja el flujo general en papel','Identifica los componentes mínimos','Estima el tiempo de cada componente'], pasoColor:'#f2cc60', pasoBg:'rgba(242,204,96,0.15)', teoriaDetail:'El sistema monitoreará si existe planificación previa antes de iniciar la escritura de código.', herramientas:[{id:'h1',nombre:'Lista de subtareas',descripcion:'Agrega pasos pequeños antes de tocar la actividad. Escribe y pulsa +.',icon:'ti-list-check'},{id:'h2',nombre:'Cronómetro de planificación',descripcion:'Mide cuántos segundos pasas planificando antes de tu primera acción.',icon:'ti-clock-pause'}] },
  { id:'est2', color:'#388bfd', iconBg:'rgba(56,139,253,0.1)', icon:'ti-adjustments-horizontal', badge:'Monitoreo', badgeBg:'rgba(56,139,253,0.1)', badgeColor:'#388bfd', nombre:'Control de confianza en puntos de control', teoria:'Monitoreo: Cambios en la seguridad del estudiante', desc:'Evidencias: JOL inicial/final, actualizaciones de confianza durante la actividad.', pasos:['Pon un temporizador','Al sonar: ¿sigo tan seguro como al inicio?','Ajusta tu expectativa (JOL)'], pasoColor:'#388bfd', pasoBg:'rgba(56,139,253,0.15)', teoriaDetail:'El sistema verificará las fluctuaciones de confianza (JOL) reportadas a lo largo de la prueba.', herramientas:[{id:'h1',nombre:'Checkpoint de confianza',descripcion:'Cada 3 min te recordará registrar tu nivel de seguridad (1–10).',icon:'ti-bell-ringing'},{id:'h2',nombre:'Comparador JOL',descripcion:'Compara tu confianza inicial de la Fase A con la actual en tiempo real.',icon:'ti-arrows-left-right'}] },
  { id:'est3', color:'#d2a8ff', iconBg:'rgba(210,168,255,0.1)', icon:'ti-message-question', badge:'Autodiagnóstico', badgeBg:'rgba(210,168,255,0.1)', badgeColor:'#d2a8ff', nombre:'Verificación de supuestos antes de ejecutar', teoria:'Monitoreo: Si piensa antes de ejecutar', desc:'Evidencias: Predicción escrita antes de correr el código, comparación con resultado real.', pasos:['Escribe "Espero que esto haga: ___"','Ejecuta y observa la diferencia','Anota la causa de la discrepancia'], pasoColor:'#d2a8ff', pasoBg:'rgba(210,168,255,0.15)', teoriaDetail:'El sistema registrará si formulas hipótesis o predicciones claras antes de cada ejecución.', herramientas:[{id:'h1',nombre:'Cuaderno de predicciones',descripcion:'Escribe qué esperas que ocurra antes de ejecutar o validar.',icon:'ti-notebook'},{id:'h2',nombre:'Verificador sí/no',descripcion:'Tras ejecutar, indica si coincidió con tu predicción.',icon:'ti-circle-check'}] },
  { id:'est4', color:'#5dcaa5', iconBg:'rgba(93,202,165,0.1)', icon:'ti-clock', badge:'Regulación temporal', badgeBg:'rgba(93,202,165,0.1)', badgeColor:'#5dcaa5', nombre:'Estimación segmentada del tiempo', teoria:'Monitoreo: Precisión en la percepción temporal', desc:'Evidencias: Tiempo estimado vs tiempo real.', pasos:['Fase de análisis: ___ min','Fase de implementación: ___ min','Fase de prueba y corrección: ___ min'], pasoColor:'#5dcaa5', pasoBg:'rgba(93,202,165,0.15)', teoriaDetail:'El sistema contrastará tus tiempos estimados con los tiempos de ejecución reales.', herramientas:[{id:'h1',nombre:'Reloj vs estimado',descripcion:'Barra que compara el tiempo real con lo que estimaste en la Fase A.',icon:'ti-hourglass'},{id:'h2',nombre:'Alerta de desfase',descripcion:'Te avisa si llevas más tiempo del planificado.',icon:'ti-alert-circle'}] },
  { id:'est5', color:'#ff7b72', iconBg:'rgba(255,123,114,0.1)', icon:'ti-zoom-question', badge:'Conocimiento', badgeBg:'rgba(255,123,114,0.1)', badgeColor:'#ff7b72', nombre:'Mapeo explícito de lo que no sé', teoria:'Monitoreo: Reconocimiento de dudas reales', desc:'Evidencias: Lista de dudas iniciales y solicitudes de ayuda.', pasos:['Sé que ___ (certeza alta)','Creo que ___ (podría equivocarme)','No sé cómo ___ (necesito verificar)'], pasoColor:'#ff7b72', pasoBg:'rgba(255,123,114,0.15)', teoriaDetail:'El sistema buscará que enuncies tus dudas de forma clara mediante solicitudes de ayuda o notas.', herramientas:[{id:'h1',nombre:'Registro de dudas',descripcion:'Anota explícitamente lo que no sabes con «No sé cómo…».',icon:'ti-help'},{id:'h2',nombre:'Mapa sé/creo/no sé',descripcion:'Clasifica ideas en tres niveles de certeza.',icon:'ti-map'}] },
  { id:'est6', color:'#388bfd', iconBg:'rgba(56,139,253,0.1)', icon:'ti-trophy', badge:'Autoeficacia', badgeBg:'rgba(56,139,253,0.1)', badgeColor:'#388bfd', nombre:'Registro de evidencias de competencia', teoria:'Monitoreo: Reconocimiento de avances logrados', desc:'Evidencias: Errores corregidos, tareas completadas, hitos alcanzados.', pasos:['Abre un bloc de notas junto al editor','Anota cada cosa que funcione','Al final, lee la lista antes de calificarte'], pasoColor:'#388bfd', pasoBg:'rgba(56,139,253,0.15)', teoriaDetail:'El sistema observará si logras reconocer y registrar progresivamente tus propios avances.', herramientas:[{id:'h1',nombre:'Bloc de avances',descripcion:'Registra cada logro pequeño: «Logré que…» o «Ya entiendo…».',icon:'ti-trophy'},{id:'h2',nombre:'Contador de victorias',descripcion:'Lleva la cuenta de avances que vas anotando.',icon:'ti-star'}] },
  { id:'est7', color:'#5dcaa5', iconBg:'rgba(93,202,165,0.1)', icon:'ti-stairs', badge:'Graduación', badgeBg:'rgba(93,202,165,0.1)', badgeColor:'#5dcaa5', nombre:'Submetas visibles y celebrables', teoria:'Monitoreo: Persistencia y progreso gradual', desc:'Evidencias: Porcentaje de pasos completados y continuidad de trabajo.', pasos:['Define hitos mínimos del reto','Marca cada uno al completarlo','Antes de rendirte, cuenta cuántos lograste'], pasoColor:'#5dcaa5', pasoBg:'rgba(93,202,165,0.15)', teoriaDetail:'El sistema registrará la continuidad y porcentaje de compleción paso a paso.', herramientas:[{id:'h1',nombre:'Checklist de hitos',descripcion:'Marca cada criterio del reto al completarlo.',icon:'ti-checkbox'},{id:'h2',nombre:'Barra de progreso',descripcion:'Visualiza el % de hitos que ya lograste.',icon:'ti-progress'}] },
  { id:'est8', color:'#ffa657', iconBg:'rgba(255,166,87,0.1)', icon:'ti-message-share', badge:'Atribución', badgeBg:'rgba(255,166,87,0.1)', badgeColor:'#ffa657', nombre:'Reencuadre de errores como datos', teoria:'Monitoreo: Forma de interpretar los errores', desc:'Evidencias: Respuestas cortas después de errores y acciones tomadas tras fallar.', pasos:['Al recibir un error, respira y anota','"Este error indica que ___ necesita revisión"','Busca exactamente esa cosa'], pasoColor:'#ffa657', pasoBg:'rgba(255,166,87,0.15)', teoriaDetail:'El sistema medirá el tiempo de reacción tras un fallo y los ajustes inmediatos que apliques.', herramientas:[{id:'h1',nombre:'Diario de errores',descripcion:'Tras cada fallo, escribe qué te indica el error.',icon:'ti-writing'},{id:'h2',nombre:'Guía de reencuadre',descripcion:'Plantilla: «Este error me dice que ___ necesita revisión».',icon:'ti-message-share'}] }
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
