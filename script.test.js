/**
 * @jest-environment jsdom
 */

// Mock global Chart
global.Chart = class {
    constructor() {
        this.data = { datasets: [{}] };
        this.options = { scales: { y: {} }, plugins: { annotation: { annotations: { zonaIdeal: {} } } } };
    }
    update() {}
};

// Mock canvas
HTMLCanvasElement.prototype.getContext = () => ({
    createLinearGradient: () => ({ addColorStop: () => {} })
});

describe('atualizarDashboard error path', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <button id="btn-theme"></button>
            <button id="btn-export"></button>
            <button id="btn-settings"></button>
            <div id="status-conexao">Conectando...</div>
            <div id="txt-temp"></div>
            <div id="card-temp"></div>
            <span id="max-temp"></span>
            <span id="min-temp"></span>
            <div id="txt-umid"></div>
            <div id="card-umid"></div>
            <span id="max-umid"></span>
            <span id="min-umid"></span>
            <div id="txt-vpd"></div>
            <div id="card-vpd"></div>
            <span id="max-vpd"></span>
            <span id="min-vpd"></span>
            <div id="txt-co2"></div>
            <div id="card-co2"></div>
            <span id="max-co2"></span>
            <span id="min-co2"></span>
            <div id="loading-overlay" class="ativo"></div>
            <canvas id="meuGrafico"></canvas>
            <div id="ultima-att"></div>
            <div id="modal-settings"></div>
            <button id="btn-modal-cancel"></button>
            <button id="btn-modal-save"></button>
            <input id="input-vpd-min" />
            <input id="input-vpd-max" />
            <input id="input-co2-min" />
            <input id="input-co2-max" />
            <button class="btn-grafico"></button>
            <button class="btn-tempo"></button>
        `;

        // Mock fetch to simulate an error
        global.fetch = jest.fn(() => Promise.reject(new Error('Network error')));

        // Suppress console.error in tests
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        jest.restoreAllMocks();
        // delete required module cache to re-evaluate it
        delete require.cache[require.resolve('./script.js')];
    });

    test('should update UI to reflect offline status and remove loading overlay on fetch error', async () => {

        // We mock setInterval to be a no-op just for the test to avoid infinite loop
        const originalSetInterval = global.setInterval;
        global.setInterval = jest.fn();

        // Require script to run initialization
        require('./script.js');

        // Allow promises to resolve
        for (let i = 0; i < 10; i++) {
            await Promise.resolve();
        }

        const badge = document.getElementById('status-conexao');
        const loadingOverlay = document.getElementById('loading-overlay');

        expect(badge.innerText).toBe('Offline');
        expect(badge.className).toBe('status-badge erro');
        expect(loadingOverlay.classList.contains('ativo')).toBe(false);
        expect(console.error).toHaveBeenCalledWith('Erro ao atualizar:', expect.any(Error));

        global.setInterval = originalSetInterval;
    });
});
