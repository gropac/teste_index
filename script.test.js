const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const vm = require('vm');

// Setup mock environment
const mockContext = {
    localStorage: {
        getItem: () => null,
        setItem: () => {}
    },
    document: {
        getElementById: (id) => ({
            getContext: () => ({
                createLinearGradient: () => ({ addColorStop: () => {} })
            }),
            addEventListener: () => {},
            value: '',
            style: {},
            classList: { add: () => {}, remove: () => {}, toggle: () => {}, contains: () => false },
        }),
        querySelectorAll: () => ({
            forEach: () => {}
        }),
        body: {
            classList: { add: () => {}, toggle: () => {}, contains: () => false },
            appendChild: () => {},
            removeChild: () => {}
        },
        createElement: () => ({ setAttribute: () => {}, click: () => {} })
    },
    Chart: class { constructor() { this.data = {datasets: [{}]}; this.options = {scales: {y: {}}, plugins: {annotation: {annotations: {zonaIdeal: {}}}}}; } },
    fetch: () => Promise.resolve({ ok: true, json: () => Promise.resolve({ feeds: [] }) }),
    alert: () => {},
    console: console,
    Math: Math,
    Date: Date,
    isNaN: isNaN,
    parseFloat: parseFloat,
    parseInt: parseInt,
    setInterval: () => {},
    encodeURI: encodeURI,
    JSON: JSON
};

vm.createContext(mockContext);
const scriptContent = fs.readFileSync('./script.js', 'utf8');
vm.runInContext(scriptContent, mockContext);

test('avaliarStatus should evaluate temperature correctly', (t) => {
    // Temp has min 20, max 29
    assert.strictEqual(mockContext.avaliarStatus(25, 'temp'), 'ideal');
    assert.strictEqual(mockContext.avaliarStatus(19, 'temp'), 'cold');
    assert.strictEqual(mockContext.avaliarStatus(30, 'temp'), 'danger');
    assert.strictEqual(mockContext.avaliarStatus(20, 'temp'), 'ideal');
    assert.strictEqual(mockContext.avaliarStatus(29, 'temp'), 'ideal');
});

test('avaliarStatus should evaluate humidity correctly', (t) => {
    // Umid has min 40, max 70
    assert.strictEqual(mockContext.avaliarStatus(50, 'umid'), 'ideal');
    assert.strictEqual(mockContext.avaliarStatus(39, 'umid'), 'warning');
    assert.strictEqual(mockContext.avaliarStatus(71, 'umid'), 'warning');
    assert.strictEqual(mockContext.avaliarStatus(40, 'umid'), 'ideal');
    assert.strictEqual(mockContext.avaliarStatus(70, 'umid'), 'ideal');
});

test('avaliarStatus should evaluate vpd correctly', (t) => {
    // VPD has min 0.8, max 1.2
    assert.strictEqual(mockContext.avaliarStatus(1.0, 'vpd'), 'ideal');
    assert.strictEqual(mockContext.avaliarStatus(0.7, 'vpd'), 'warning');
    assert.strictEqual(mockContext.avaliarStatus(1.3, 'vpd'), 'warning');
    assert.strictEqual(mockContext.avaliarStatus(0.8, 'vpd'), 'ideal');
    assert.strictEqual(mockContext.avaliarStatus(1.2, 'vpd'), 'ideal');
});

test('avaliarStatus should evaluate co2 correctly', (t) => {
    // CO2 has min 400, max 1500
    assert.strictEqual(mockContext.avaliarStatus(1000, 'co2'), 'ideal');
    assert.strictEqual(mockContext.avaliarStatus(399, 'co2'), 'warning');
    assert.strictEqual(mockContext.avaliarStatus(1501, 'co2'), 'warning');
    assert.strictEqual(mockContext.avaliarStatus(400, 'co2'), 'ideal');
    assert.strictEqual(mockContext.avaliarStatus(1500, 'co2'), 'ideal');
});

test('avaliarStatus should handle null values', (t) => {
    assert.strictEqual(mockContext.avaliarStatus(null, 'temp'), 'default');
    assert.strictEqual(mockContext.avaliarStatus(null, 'umid'), 'default');
    assert.strictEqual(mockContext.avaliarStatus(null, 'vpd'), 'default');
    assert.strictEqual(mockContext.avaliarStatus(null, 'co2'), 'default');
});

test('avaliarStatus edge cases', (t) => {
    // Invalid numeric inputs shouldn't error out, maybe evaluated as per operators
    assert.strictEqual(mockContext.avaliarStatus(undefined, 'temp'), 'default');
    // Using default mock context, if not null or undefined, standard < > ops apply
});
