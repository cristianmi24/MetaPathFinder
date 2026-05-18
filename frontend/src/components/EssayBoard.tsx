import { useState, useEffect, useMemo } from 'react';

interface EssayBoardProps {
  challengeId: string;
  onValidation: (success: boolean) => void;
}

interface ValidationConfig {
  minWords: number;
  idealWords: number;
  keywords: string[];
  minKeywords: number;
  sections: string[];
  minSections: number;
  criteria: string[];
  referenceAnswer: string;
}

const essayConfigs: Record<string, ValidationConfig> = {
  'RM-C4-N1': {
    minWords: 30,
    idealWords: 80,
    keywords: ['huella digital', 'datos', 'privacidad', 'informacion personal', 'contraseña', '2fa', 'seguridad', 'permisos', 'ubicacion', 'camara', 'microfono', 'rastro digital', 'google', 'actividad', 'cuentas'],
    minKeywords: 3,
    sections: ['inventario', 'cuentas', 'permisos', 'medidas', 'seguridad', 'privacidad', 'recomendacion'],
    minSections: 2,
    criteria: [
      'Inventario completo de cuentas y permisos',
      'Analisis de datos recopilados por categoria',
      'Minimo 5 medidas de seguridad aplicadas',
      'Documentacion del antes y despues',
      'Informe coherente con recomendaciones'
    ],
    referenceAnswer: 'Mi auditoria de huella digital comenzo listando todas mis cuentas activas: Google (Gmail, Drive, Fotos), Instagram, Facebook, WhatsApp, TikTok, Netflix, Spotify y GitHub. En total 9 cuentas. Revise los permisos concedidos en mi telefono: la camara estaba activada para Instagram, TikTok y WhatsApp; el microfono para WhatsApp y TikTok; la ubicacion para Google Maps, Instagram y clima; los contactos para WhatsApp y Telegram. Desactive permisos innecesarios: quite camara a TikTok, quite ubicacion a Instagram, quite microfono a Telegram. Aplique 5 medidas de seguridad: (1) cambie mi contraseña de Google por una de 16 caracteres con mayusculas, numeros y simbolos usando Bitwarden, (2) active 2FA en Google, Instagram y GitHub con Google Authenticator, (3) revise la configuracion de privacidad de Instagram y Facebook limitando quien ve mi informacion a solo amigos, (4) elimine cuentas que no uso como Myspace y Tumblr, (5) configure alertas de inicio de sesion en Google. Antes tenia 0 medidas activas, ahora tengo 5. Mi recomendacion principal es hacer esta auditoria cada 6 meses y usar un gestor de contraseñas.'
  },
  'RM-C4-N2': {
    minWords: 30,
    idealWords: 100,
    keywords: ['ia', 'inteligencia artificial', 'regular', 'regulacion', 'debate', 'argumento', 'etico', 'contraargumento', 'estado', 'politica', 'colombia', 'minotic', 'conpes', 'ley', 'derechos', 'riesgo'],
    minKeywords: 3,
    sections: ['postura', 'argumento', 'regulacion', 'colombia', 'contraargumento', 'conclusion'],
    minSections: 2,
    criteria: [
      'Postura clara y definida',
      'Minimo 4 argumentos con evidencia',
      'Referencia a regulaciones reales (UE, EEUU o China)',
      'Analisis del contexto colombiano',
      'Contraargumento abordado honestamente'
    ],
    referenceAnswer: 'Mi postura es que el Estado colombiano SI debe regular la IA, pero con un enfoque equilibrado que fomente la innovacion mientras protege derechos fundamentales. Primer argumento: la regulacion es necesaria para evitar sesgos discriminatorios en decisiones automatizadas, como ocurrio con sistemas de contratacion en EEUU que discriminaban por genero (estudio de la UE 2023). Segundo argumento: la UE aprobo el AI Act en 2024, que clasifica los sistemas de IA por nivel de riesgo y exige transparencia. Tercer argumento: Colombia ya dio un paso con el Conpes de Transformacion Digital y la mision de expertos en IA del MinTIC, pero falta una ley especifica. Cuarto argumento: sin regulacion, las empresas pueden usar datos personales sin consentimiento, violando la Ley 1581 de Proteccion de Datos. Contraargumento: algunos dicen que regular muy temprano frena la innovacion. Respondo que una regulacion basada en riesgos, como la de la UE, no prohibe la innovacion sino que la encausa eticamente. En Colombia, ademas, tenemos una oportunidad unica de aprender de los errores de otros paises y disenar una regulacion contextualizada a nuestra realidad.'
  },
  'RM-C4-N3': {
    minWords: 30,
    idealWords: 120,
    keywords: ['politica', 'institucion', 'ia', 'inteligencia artificial', 'uso', 'permitido', 'prohibido', 'estudiante', 'docente', 'derechos', 'responsabilidad', 'etico', 'privacidad', 'autoria', 'revision', 'sancion'],
    minKeywords: 3,
    sections: ['proposito', 'alcance', 'permitido', 'prohibido', 'derechos', 'responsabilidad', 'sancion', 'revision'],
    minSections: 2,
    criteria: [
      'Politica completa con 6 secciones minimas',
      'Justificacion etica de prohibiciones',
      'Derechos y responsabilidades diferenciados',
      'Mecanismo de revision incluido',
      'Lenguaje institucional apropiado',
      'Referencias a politicas reales existentes'
    ],
    referenceAnswer: 'POLITICA DE USO DE INTELIGENCIA ARTIFICIAL EN EL COLEGIO SANTA MARIA. Proposito: Esta politica establece los lineamientos para el uso etico, seguro y responsable de herramientas de IA (ChatGPT, Copilot, Gemini) en los procesos de ensenanza y aprendizaje del colegio. Alcance: Aplica a todos los estudiantes, docentes y personal administrativo. Usos permitidos: (1) los docentes pueden usar IA para preparar materiales educativos, disenar evaluaciones y personalizar contenidos, (2) los estudiantes pueden usar IA como tutoria complementaria, para generar ideas iniciales en proyectos y para practicar idiomas, (3) el personal administrativo puede usar IA para optimizar procesos de registro y comunicacion. Usos prohibidos: (1) los estudiantes no pueden usar IA para generar respuestas completas en examenes o trabajos calificados sin autorizacion explicita del docente (justificacion etica: esto vulnera la autoria y la evaluacion autentica), (2) no se permite subir datos personales de estudiantes a plataformas de IA sin consentimiento (justificacion: viola la proteccion de datos segun la Ley 1581), (3) no se permite usar IA para tomar decisiones academicas sin supervision humana. Derechos de los estudiantes: privacidad de sus datos, autoria de sus trabajos, acceso equitativo a las herramientas. Responsabilidades de los docentes: capacitarse en uso etico de IA, verificar la originalidad de los trabajos, informar sobre los usos permitidos. Consecuencias del incumplimiento: amonestacion verbal en primera falta, suspension del uso de herramientas por un mes en segunda falta, y remision a coordinacion academica en tercera falta. Revision anual: esta politica se revisara cada ano lectivo incorporando los avances tecnologicos y las recomendaciones de la UNESCO y el MinTIC.'
  }
};

export function EssayBoard({ challengeId, onValidation }: EssayBoardProps) {
  const [text, setText] = useState('');
  const [showExample, setShowExample] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const config = essayConfigs[challengeId];
  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

  const validation = useMemo(() => {
    if (!config) {
      return { score: 0, success: false, details: [], wordScore: 0, keywordScore: 0, sectionScore: 0, minReqScore: 0, matchedKeywords: 0, matchedSections: 0, meetsMinWords: wordCount >= 30 };
    }

    const t = text.toLowerCase();
    const matchedKeywords = config.keywords.filter(k => t.includes(k)).length;
    const matchedSections = config.sections.filter(s => t.includes(s)).length;

    const meetsMinWords = wordCount >= config.minWords;
    const meetsMinKeywords = matchedKeywords >= config.minKeywords;
    const meetsMinSections = matchedSections >= config.minSections;

    const wordScore = Math.min(30, Math.round((wordCount / config.idealWords) * 30));
    const keywordScore = Math.min(40, Math.round((matchedKeywords / config.keywords.length) * 40));
    const sectionScore = Math.min(20, Math.round((matchedSections / config.sections.length) * 20));
    const minReqScore = (meetsMinWords && meetsMinKeywords && meetsMinSections) ? 10 : 0;
    const total = wordScore + keywordScore + sectionScore + minReqScore;

    const details = config.criteria.map((c, i) => {
      const wordsOk = wordCount >= config.minWords;
      const kwsOk = matchedKeywords >= Math.ceil(config.keywords.length * 0.2);
      return { label: c, ok: wordsOk && kwsOk };
    });

    return {
      score: total,
      success: total >= 60,
      details,
      wordScore,
      keywordScore,
      sectionScore,
      minReqScore,
      matchedKeywords,
      matchedSections,
      meetsMinWords,
      meetsMinKeywords,
      meetsMinSections,
      totalKeywords: config.keywords.length,
      totalSections: config.sections.length,
    };
  }, [text, wordCount, config]);

  useEffect(() => {
    onValidation(validation.success);
  }, [validation.success, onValidation]);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  return (
    <div className="flex flex-col w-full h-full bg-surface-container-lowest overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-outline-variant/20 bg-surface-container-low/50 flex-shrink-0">
        <div className="flex items-center gap-2 text-on-surface-variant font-bold text-sm">
          <i className="ti ti-file-text text-primary" style={{ fontSize: 18 }}></i>
          Editor de Texto
        </div>
        <div className="flex items-center gap-3">
          <button
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-outline-variant/30 hover:bg-surface-container-highest transition-colors flex items-center gap-1.5"
            onClick={() => setShowExample(!showExample)}
          >
            <i className="ti ti-eye" style={{ fontSize: 12 }}></i>
            {showExample ? 'Ocultar ejemplo' : 'Ver ejemplo'}
          </button>
          <div className={`text-xs font-black px-3 py-1.5 rounded-full transition-colors ${wordCount >= (config?.minWords ?? 30) ? 'bg-primary/20 text-primary' : 'bg-surface-container-highest text-on-surface-variant'}`}>
            <i className="ti ti-abc" style={{ fontSize: 11, marginRight: 4 }}></i>
            {wordCount} palabras
          </div>
        </div>
      </div>

      {showExample && config && (
        <div className="mx-4 mt-3 p-4 bg-primary/5 border border-primary/20 rounded-xl text-xs leading-relaxed text-on-surface-variant max-h-40 overflow-y-auto flex-shrink-0">
          <div className="font-bold text-primary text-xs mb-2 flex items-center gap-1.5">
            <i className="ti ti-template" style={{ fontSize: 12 }}></i>
            Respuesta de referencia:
          </div>
          {config.referenceAnswer}
        </div>
      )}

      <div className="flex-1 p-4 min-h-0">
        <textarea
          className="w-full h-full p-5 text-slate-900 bg-white border-2 border-outline-variant/30 rounded-2xl shadow-inner resize-none focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-400 text-base leading-relaxed"
          placeholder="Escribe tu ensayo, reporte o analisis aqui..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between px-4 py-3 border-t border-outline-variant/20 bg-surface-container-low/50 flex-shrink-0">
        <div className="flex items-center gap-4 text-xs">
          {config && (
            <>
              <span className={`flex items-center gap-1 ${validation.meetsMinWords ? 'text-green-600' : 'text-on-surface-variant'}`}>
                <i className={`ti ${validation.meetsMinWords ? 'ti-circle-check' : 'ti-circle-minus'}`} style={{ fontSize: 12 }}></i>
                {config.minWords}+ palabras
              </span>
              <span className={`flex items-center gap-1 ${validation.meetsMinKeywords ? 'text-green-600' : 'text-on-surface-variant'}`}>
                <i className={`ti ${validation.meetsMinKeywords ? 'ti-circle-check' : 'ti-circle-minus'}`} style={{ fontSize: 12 }}></i>
                {config.minKeywords}+ conceptos clave
              </span>
              <span className={`flex items-center gap-1 ${validation.meetsMinSections ? 'text-green-600' : 'text-on-surface-variant'}`}>
                <i className={`ti ${validation.meetsMinSections ? 'ti-circle-check' : 'ti-circle-minus'}`} style={{ fontSize: 12 }}></i>
                {config.minSections}+ secciones
              </span>
            </>
          )}
        </div>
        <button
          className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${submitted ? 'bg-primary/20 text-primary cursor-default' : 'bg-primary text-on-primary hover:bg-primary/90 shadow-md hover:shadow-lg'}`}
          onClick={handleSubmit}
          disabled={submitted}
        >
          {submitted ? 'Enviado' : 'Enviar'}
        </button>
      </div>

      {submitted && config && (
        <div className="mx-4 mb-4 p-4 bg-surface-container-highest rounded-xl border border-outline-variant/20 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-sm flex items-center gap-2">
              <i className="ti ti-chart-bar" style={{ fontSize: 14 }}></i>
              Resultado de validacion
            </span>
            <div className={`text-lg font-black ${validation.success ? 'text-green-600' : 'text-red-500'}`}>
              {validation.score}/100
              {validation.success && ' - Aprobado'}
            </div>
          </div>

          <div className="w-full h-2 bg-outline-variant/20 rounded-full mb-4 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${validation.success ? 'bg-green-500' : 'bg-amber-500'}`}
              style={{ width: `${validation.score}%` }}
            ></div>
          </div>

          <div className="grid grid-cols-4 gap-2 mb-4 text-center text-xs">
            <div className="p-2 rounded-lg bg-surface-container-low">
              <div className="font-bold text-sm">{validation.wordScore}/30</div>
              <div className="text-on-surface-variant">Palabras</div>
            </div>
            <div className="p-2 rounded-lg bg-surface-container-low">
              <div className="font-bold text-sm">{validation.keywordScore}/40</div>
              <div className="text-on-surface-variant">Conceptos</div>
            </div>
            <div className="p-2 rounded-lg bg-surface-container-low">
              <div className="font-bold text-sm">{validation.sectionScore}/20</div>
              <div className="text-on-surface-variant">Estructura</div>
            </div>
            <div className="p-2 rounded-lg bg-surface-container-low">
              <div className="font-bold text-sm">{validation.minReqScore}/10</div>
              <div className="text-on-surface-variant">Minimos</div>
            </div>
          </div>

          <div className="space-y-1.5">
            {config.criteria.map((c, i) => (
              <div key={i} className={`flex items-center gap-2 text-xs p-1.5 rounded-lg ${validation.details[i]?.ok ? 'bg-green-500/10 text-green-700' : 'bg-red-500/5 text-on-surface-variant'}`}>
                <i className={`ti ${validation.details[i]?.ok ? 'ti-circle-check text-green-600' : 'ti-circle-x text-red-400'}`} style={{ fontSize: 13 }}></i>
                {c}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
