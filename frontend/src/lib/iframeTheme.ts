import { useEffect, useMemo, useRef } from 'react';
import { useTheme } from '../ThemeContext';

/**
 * Tema para los tableros que viven en un <iframe srcDoc>.
 *
 * El iframe no hereda el CSS de la app, así que se le pasan los tokens del tema
 * (--color-*, --font-*) como variables en :root y se carga Sora / IBM Plex Mono.
 * Al cambiar de tema se envían los valores nuevos por postMessage, sin recargar
 * el iframe (el estudiante no pierde lo que lleva hecho).
 */

const TOKENS = [
  'surface', 'surface-dim', 'surface-bright',
  'surface-container-lowest', 'surface-container-low', 'surface-container',
  'surface-container-high', 'surface-container-highest', 'surface-variant',
  'on-surface', 'on-surface-variant', 'inverse-surface', 'inverse-on-surface',
  'outline', 'outline-variant',
  'primary', 'on-primary', 'primary-container', 'on-primary-container', 'inverse-primary',
  'secondary', 'on-secondary', 'secondary-container', 'on-secondary-container',
  'tertiary', 'on-tertiary', 'tertiary-container', 'on-tertiary-container',
  'warning', 'on-warning', 'warning-container', 'on-warning-container',
  'error', 'on-error', 'error-container', 'on-error-container',
  'background', 'on-background',
].map(t => `--color-${t}`);

const FONT_LINK =
  '<link rel="preconnect" href="https://fonts.googleapis.com">' +
  '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>' +
  '<link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet">';

function readVars(): Record<string, string> {
  const cs = getComputedStyle(document.documentElement);
  const out: Record<string, string> = {};
  for (const name of TOKENS) {
    const v = cs.getPropertyValue(name).trim();
    if (v) out[name] = v;
  }
  return out;
}

function headFor(theme: 'light' | 'dark'): string {
  const vars = readVars();
  const decl = Object.entries(vars).map(([k, v]) => `${k}:${v};`).join('');
  return `${FONT_LINK}
<style id="mp-theme">
:root{${decl}
  --font-sans:"Sora",ui-sans-serif,system-ui,sans-serif;
  --font-mono:"IBM Plex Mono",ui-monospace,"SFMono-Regular",monospace;
  color-scheme:${theme};
}
html,body{font-family:var(--font-sans);-webkit-font-smoothing:antialiased;}
code,kbd,pre,samp{font-family:var(--font-mono);}
::selection{background:color-mix(in srgb,var(--color-primary) 24%,transparent);}
</style>
<script>
window.addEventListener('message',function(e){
  var d=e.data; if(!d||d.type!=='MP_THEME')return;
  var r=document.documentElement;
  for(var k in d.vars) r.style.setProperty(k,d.vars[k]);
  r.style.colorScheme=d.theme; r.classList.toggle('dark',d.theme==='dark');
});
</script>`;
}

/**
 * Devuelve el srcDoc con el tema inyectado al inicio de <head> y una ref para el iframe.
 * El srcDoc se calcula una sola vez; los cambios de tema llegan por postMessage.
 */
export function useThemedSrcDoc(html: string) {
  const { theme } = useTheme();
  const ref = useRef<HTMLIFrameElement>(null);
  const initialTheme = useRef(theme).current;

  const srcDoc = useMemo(
    () => html
      .replace(/<link[^>]+fonts\.googleapis\.com[^>]*>/g, '')
      .replace(/<head>/i, `<head>${headFor(initialTheme)}`)
      .replace(/<html([^>]*)>/i, `<html$1 class="${initialTheme === 'dark' ? 'dark' : ''}">`),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [html],
  );

  useEffect(() => {
    // La clase .dark ya se aplicó en <html> (efecto del ThemeProvider); se leen los valores nuevos.
    const id = requestAnimationFrame(() => {
      ref.current?.contentWindow?.postMessage({ type: 'MP_THEME', theme, vars: readVars() }, '*');
    });
    return () => cancelAnimationFrame(id);
  }, [theme]);

  return { ref, srcDoc };
}
