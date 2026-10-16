// Pruebas del umbral de pausa larga (npm run test:unit).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { longPauseThreshold, recordFinishedPause, MIN_PAUSE_SECS } from '../src/lib/pauseModel.ts';

test('una pausa en curso ya no eleva su propio umbral: a los 101 s es pausa larga', () => {
  // Sin pausas terminadas: umbral por defecto de 30 s, y la pausa en curso no se registra.
  let samples = [];
  assert.equal(longPauseThreshold(samples), 30);
  assert.ok(101 > longPauseThreshold(samples));
  // El esquema anterior (una muestra cada 15 s de la misma pausa) dejaba el umbral por encima.
  assert.ok(longPauseThreshold([15, 30, 45, 60, 75, 90]) > 101);
});

test('solo cuentan las pausas terminadas y se ignoran las micro-pausas', () => {
  let s = [];
  s = recordFinishedPause(s, 1.2);
  s = recordFinishedPause(s, MIN_PAUSE_SECS - 0.1);
  assert.deepEqual(s, []);
  for (const p of [8, 12, 10]) s = recordFinishedPause(s, p);
  assert.deepEqual(s, [8, 12, 10]);
  assert.equal(longPauseThreshold(s), 20);          // 2 × media de su ritmo
  assert.ok(25 > longPauseThreshold(s));            // 25 s ya es larga para este estudiante
});

test('el umbral tiene un mínimo de 10 s y la ventana guarda las 20 últimas', () => {
  assert.equal(longPauseThreshold([5, 5, 5]), 10);
  let s = [];
  for (let i = 0; i < 30; i++) s = recordFinishedPause(s, 6 + i);
  assert.equal(s.length, 20);
  assert.equal(s[0], 16);
  assert.equal(recordFinishedPause(s, NaN), s);
});
