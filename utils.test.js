const { test } = require('node:test');
const assert = require('node:assert');
const { calcularVPD } = require('./utils.js');

test('calcularVPD - Standard conditions', (t) => {
    // 25°C, 50% humidity
    const vpd1 = calcularVPD(25, 50);
    assert.ok(vpd1 > 1.58 && vpd1 < 1.59, `Expected ~1.58, got ${vpd1}`);

    // 20°C, 60% humidity
    const vpd2 = calcularVPD(20, 60);
    assert.ok(vpd2 > 0.93 && vpd2 < 0.94, `Expected ~0.94, got ${vpd2}`);
});

test('calcularVPD - Edge cases', (t) => {
    // 100% humidity should result in 0 VPD
    const vpd100 = calcularVPD(25, 100);
    assert.strictEqual(vpd100, 0, `Expected 0, got ${vpd100}`);

    // 0°C, 0% humidity
    const vpd0 = calcularVPD(0, 0);
    assert.ok(vpd0 > 0.61 && vpd0 < 0.62, `Expected ~0.61, got ${vpd0}`);

    // Very high temperature
    const vpdHigh = calcularVPD(40, 20);
    assert.ok(vpdHigh > 5.9 && vpdHigh < 6.0, `Expected ~5.9, got ${vpdHigh}`);
});

test('calcularVPD - Error conditions (missing inputs)', (t) => {
    assert.strictEqual(calcularVPD(null, 50), null, 'Should return null if temperature is null');
    assert.strictEqual(calcularVPD(25, null), null, 'Should return null if humidity is null');
    assert.strictEqual(calcularVPD(null, null), null, 'Should return null if both are null');
});
