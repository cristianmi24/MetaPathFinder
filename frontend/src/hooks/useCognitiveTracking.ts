import { useEffect, useRef } from 'react';
import { useCognitiveStore } from '../stores/useCognitiveStore';

export function useCognitiveTracking(isEnabled: boolean) {
  const { addEvent } = useCognitiveStore();
  const lastScrollPos = useRef(0);
  const scrollCount = useRef(0);
  const lastActivity = useRef(Date.now());
  const mouseDistance = useRef(0);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const pauseThreshold = 30000; // 30 seconds for a "long pause"

  useEffect(() => {
    if (!isEnabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        addEvent('COGNITIVE_BIAS', {
          interpretation: 'Distracción',
          trigger: 'Tab change',
          type: 'visibility_change'
        });
      }
    };

    const handleScroll = () => {
      const currentScroll = window.scrollY;
      const diff = Math.abs(currentScroll - lastScrollPos.current);
      
      if (diff > 50) { // Significant scroll
        scrollCount.current += 1;
        if (scrollCount.current > 20) { // Arbitrary threshold for "excessive"
          addEvent('COGNITIVE_BIAS', {
            interpretation: 'Desorientación',
            trigger: 'Excessive scrolling',
            type: 'scroll_pattern'
          });
          scrollCount.current = 0;
        }
      }
      lastScrollPos.current = currentScroll;
      lastActivity.current = Date.now();
    };

    const checkPauses = setInterval(() => {
      const now = Date.now();
      if (now - lastActivity.current > pauseThreshold) {
        addEvent('COGNITIVE_BIAS', {
          interpretation: 'Reflexión o fatiga',
          trigger: 'Long inactivity',
          duration_ms: now - lastActivity.current,
          type: 'idle_long'
        });
        lastActivity.current = now; // Prevent duplicate events
      }
    }, 5000);

    const handleInteraction = (e: MouseEvent) => {
      lastActivity.current = Date.now();
      
      const dist = Math.sqrt(
        Math.pow(e.clientX - lastMousePos.current.x, 2) + 
        Math.pow(e.clientY - lastMousePos.current.y, 2)
      );
      
      if (dist < 1000) { // Filter out jumps
        mouseDistance.current += dist;
      }
      
      lastMousePos.current = { x: e.clientX, y: e.clientY };

      if (mouseDistance.current > 15000) { // Threshold for "mouse circling" behavior
        addEvent('COGNITIVE_BIAS', {
          interpretation: 'Desorientación',
          trigger: 'Erratic mouse movement',
          type: 'mouse_pattern'
        });
        mouseDistance.current = 0;
      }
    };

    const handleKeydown = () => {
      lastActivity.current = Date.now();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleInteraction as any);
    window.addEventListener('keydown', handleKeydown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleInteraction as any);
      window.removeEventListener('keydown', handleKeydown);
      clearInterval(checkPauses);
    };
  }, [isEnabled, addEvent]);
}
