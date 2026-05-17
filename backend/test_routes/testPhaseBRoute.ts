import express from 'express';
import phaseB from './phaseBChallenges.json';

const router = express.Router();

// Ruta de prueba que devuelve los retos de la Fase B
router.get('/test-phase-b', (_req, res) => {
  res.json({ count: Array.isArray(phaseB) ? phaseB.length : 0, retos: phaseB });
});

export default router;
