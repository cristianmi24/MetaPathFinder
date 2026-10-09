/**
 * Datos legales de la plataforma — fuente única para los Términos y Condiciones,
 * la Política de Privacidad, el registro y el footer.
 *
 * IMPORTANTE: antes de publicar, completar con los datos oficiales del responsable
 * del tratamiento (Decreto 1377 de 2013, art. 13): razón social/NIT, correo y teléfono
 * de contacto. Los campos vacíos simplemente no se muestran.
 */
export const LEGAL = {
  /** Subir la versión cada vez que cambien los textos; se guarda junto a cada aceptación. */
  version: '1.0',
  updatedAt: '1 de octubre de 2026',
  platform: 'MetaPathFinder',
  institution: 'Universidad de Córdoba',
  institutionLocation: 'Montería, Córdoba, Colombia',
  controllerNit: '',
  contactEmail: '',
  contactPhone: '',
} as const;

export const LEGAL_ROUTES = {
  terms: '/terminos',
  privacy: '/privacidad',
} as const;
