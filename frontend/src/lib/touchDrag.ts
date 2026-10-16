/**
 * Arrastrar y soltar con el dedo en celulares y tabletas.
 *
 * Varios tableros usan el arrastre nativo de HTML5 (draggable / onDragStart / onDrop), que los
 * navegadores móviles no disparan con el toque: en el celular esas actividades no se podían
 * hacer. El polyfill `mobile-drag-drop` traduce el toque a esos eventos. Con holdToDrag hay que
 * mantener el dedo un instante para empezar a arrastrar, así el desplazamiento normal sigue
 * funcionando.
 */
import { polyfill } from 'mobile-drag-drop';
import { scrollBehaviourDragImageTranslateOverride } from 'mobile-drag-drop/scroll-behaviour';
import 'mobile-drag-drop/default.css';
import polyfillSource from 'mobile-drag-drop/index.min.js?raw';

const HOLD_TO_DRAG_MS = 180;

/**
 * Con holdToDrag la librería busca el elemento con `event.composedPath()` después de la espera,
 * cuando el navegador ya lo devuelve vacío: nunca encontraba qué arrastrar. Se busca desde
 * `event.target` (que sí se conserva) el primer ancestro con draggable="true" explícito
 * (no las imágenes, que son arrastrables por defecto).
 */
function findDraggable(event: TouchEvent): HTMLElement | undefined {
  let el = event.target as HTMLElement | null;
  while (el && el !== document.body) {
    if (el.getAttribute?.('draggable') === 'true') return el;
    el = el.parentElement;
  }
  return undefined;
}

let installed = false;
export function installTouchDrag() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  const applied = polyfill({ holdToDrag: HOLD_TO_DRAG_MS, tryFindDraggableTarget: findDraggable,
    dragImageTranslateOverride: scrollBehaviourDragImageTranslateOverride });
  // El polyfill sigue la especificación: un destino solo acepta si también cancela dragenter,
  // y los tableros solo cancelan dragover (Chrome de escritorio lo tolera). Se cancela dragenter
  // en todos y dragover decide.
  if (applied) document.addEventListener('dragenter', (e) => e.preventDefault());
  // iOS Safari: sin un touchmove no pasivo, la página se desplaza en lugar de arrastrar.
  window.addEventListener('touchmove', () => {}, { passive: false });
}

/** Lo mismo dentro de los tableros en <iframe srcDoc> (se inyecta en su <head>). */
export const IFRAME_TOUCH_DRAG_SCRIPT = `<script>${polyfillSource}
;try{MobileDragDrop.polyfill({holdToDrag:${HOLD_TO_DRAG_MS},tryFindDraggableTarget:function(e){var el=e.target;while(el&&el!==document.body){if(el.getAttribute&&el.getAttribute('draggable')==='true')return el;el=el.parentElement;}}});window.addEventListener('touchmove',function(){},{passive:false});document.addEventListener('dragenter',function(e){e.preventDefault();});}catch(e){}</script>
<style>.dnd-poly-drag-image{opacity:.85!important;pointer-events:none}.dnd-poly-drag-image.dnd-poly-snapback{transition:transform .25s ease-out!important}</style>`;
