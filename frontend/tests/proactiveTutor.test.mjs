import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shouldOfferEarlySupport } from '../src/lib/proactiveTutor.ts';

test('ofrece una pregunta de apoyo ante una pausa prolongada, aunque aún no haya errores', () => {
  assert.equal(shouldOfferEarlySupport({ pausa_larga: true, ediciones_sin_exito: false }), true);
});

test('ofrece apoyo después de muchos cambios sin verificar, antes de acumular fallos', () => {
  assert.equal(shouldOfferEarlySupport({ pausa_larga: false, ediciones_sin_exito: true }), true);
});

test('no interrumpe ante señales neutras o cuando el reto ya terminó', () => {
  assert.equal(shouldOfferEarlySupport({ pausa_larga: false, ediciones_sin_exito: false }), false);
  assert.equal(shouldOfferEarlySupport({ pausa_larga: true }, true), false);
});
