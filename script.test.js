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

describe('script.js functions', () => {
    test('avaliarStatus should evaluate temperature correctly', () => {
        expect(mockContext.avaliarStatus(25, 'temp')).toBe('ideal');
        expect(mockContext.avaliarStatus(19, 'temp')).toBe('cold');
        expect(mockContext.avaliarStatus(30, 'temp')).toBe('danger');
        expect(mockContext.avaliarStatus(20, 'temp')).toBe('ideal');
        expect(mockContext.avaliarStatus(29, 'temp')).toBe('ideal');
    });

    test('avaliarStatus should evaluate humidity correctly', () => {
        expect(mockContext.avaliarStatus(50, 'umid')).toBe('ideal');
        expect(mockContext.avaliarStatus(39, 'umid')).toBe('warning');
        expect(mockContext.avaliarStatus(71, 'umid')).toBe('warning');
        expect(mockContext.avaliarStatus(40, 'umid')).toBe('ideal');
        expect(mockContext.avaliarStatus(70, 'umid')).toBe('ideal');
    });

    test('avaliarStatus should evaluate vpd correctly', () => {
        expect(mockContext.avaliarStatus(1.0, 'vpd')).toBe('ideal');
        expect(mockContext.avaliarStatus(0.7, 'vpd')).toBe('warning');
        expect(mockContext.avaliarStatus(1.3, 'vpd')).toBe('warning');
        expect(mockContext.avaliarStatus(0.8, 'vpd')).toBe('ideal');
        expect(mockContext.avaliarStatus(1.2, 'vpd')).toBe('ideal');
    });

    test('avaliarStatus should evaluate co2 correctly', () => {
        expect(mockContext.avaliarStatus(1000, 'co2')).toBe('ideal');
        expect(mockContext.avaliarStatus(399, 'co2')).toBe('warning');
        expect(mockContext.avaliarStatus(1501, 'co2')).toBe('warning');
        expect(mockContext.avaliarStatus(400, 'co2')).toBe('ideal');
        expect(mockContext.avaliarStatus(1500, 'co2')).toBe('ideal');
    });

    test('avaliarStatus should handle null values', () => {
        expect(mockContext.avaliarStatus(null, 'temp')).toBe('default');
        expect(mockContext.avaliarStatus(null, 'umid')).toBe('default');
        expect(mockContext.avaliarStatus(null, 'vpd')).toBe('default');
        expect(mockContext.avaliarStatus(null, 'co2')).toBe('default');
    });

    test('avaliarStatus edge cases', () => {
        expect(mockContext.avaliarStatus(undefined, 'temp')).toBe('default');
    });
});
