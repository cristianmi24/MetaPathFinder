/**
 * Créditos que se muestran en la ventana «Créditos» del inicio.
 * Completa `team` con los nombres reales; si queda vacío, esa sección no se muestra.
 */
export interface CreditPerson {
  name: string;
  role: string;
}

export const CREDITS = {
  team: [] as CreditPerson[],
  tools: [
    { name: 'React · Vite · Tailwind CSS', role: 'Interfaz web' },
    { name: 'FastAPI · PostgreSQL', role: 'Servidor y base de datos' },
    { name: 'Sora · IBM Plex Mono', role: 'Tipografías (Google Fonts)' },
    { name: 'Lucide · Tabler Icons', role: 'Iconografía' },
  ] as CreditPerson[],
};
