const CHANNEL_ID = '3321343';
const READ_API_KEY = ''; 
let intervaloAtual = 288; // Default 24h

// Variáveis globais para armazenar os dados processados
let historicoHorarios = [];
let historicoTemp = [];
let historicoUmid = [];
let historicoVpd = [];
let historicoCo2 = [];

// Definições de Zonas Ideais (buscando do localStorage se existir)
let ZONAS = JSON.parse(localStorage.getItem('growbox_zonas')) || {
    temp: { min: 20, max: 29, config: { min: 0, max: 50, step: 10 } },
    umid: { min: 40, max: 70, config: { min: 0, max: 100, step: 20 } },
    vpd:  { min: 0.8, max: 1.2, config: { min: 0, max: 3, step: 0.5 } },
    co2:  { min: 400, max: 1500, config: { min: 300, max: 2000, step: 200 } }
};

let metricaAtual = 'temp'; // 'temp', 'umid', ou 'vpd'

// 1. FUNÇÕES AUXILIARES
function avaliarStatus(valor, tipo) {
    if (valor == null) return 'default';
    const min = ZONAS[tipo].min;
    const max = ZONAS[tipo].max;
    
    if (tipo === 'temp') {
        if (valor < min) return 'cold';
        if (valor > max) return 'danger';
        return 'ideal';
    } else {
        if (valor >= min && valor <= max) return 'ideal';
        return 'warning';
    }
}

function atualizarCardUI(tipo, valor, max, min) {
    const txtElement = document.getElementById(`txt-${tipo}`);
    const cardElement = document.getElementById(`card-${tipo}`);
    const maxElement = document.getElementById(`max-${tipo}`);
    const minElement = document.getElementById(`min-${tipo}`);

    if (valor !== null) {
        txtElement.innerText = valor.toFixed(1);
        maxElement.innerText = `↑ ${max.toFixed(1)}`;
        minElement.innerText = `↓ ${min.toFixed(1)}`;

        // Limpa classes antigas
        cardElement.className = 'card-valor';
        txtElement.className = 'valor-principal';

        const status = avaliarStatus(valor, tipo);
        if (status !== 'default') {
            cardElement.classList.add(`status-${status}`);
            txtElement.classList.add(`text-${status}`);
        }
    } else {
        txtElement.innerText = '--';
    }
}

function obterMaxMin(array) {
    const validos = array.filter(v => v !== null && !isNaN(v));
    if (validos.length === 0) return { max: 0, min: 0 };
    return {
        max: Math.max(...validos),
        min: Math.min(...validos)
    };
}

// 2. INICIALIZAÇÃO DO GRÁFICO (Chart.js)
const ctx = document.getElementById('meuGrafico').getContext('2d');

// Gradiente para a linha
const gradient = ctx.createLinearGradient(0, 0, 0, 400);
gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

const meuGrafico = new Chart(ctx, {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Temperatura (°C)',
            data: [],
            borderColor: '#10b981',
            backgroundColor: gradient,
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            pointRadius: 0,
            pointHitRadius: 10,
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: { family: 'Inter', size: 13 },
                bodyFont: { family: 'Inter', size: 14, weight: 'bold' },
                padding: 10,
                cornerRadius: 8,
                displayColors: false
            },
            annotation: {
                annotations: {
                    zonaIdeal: {
                        type: 'box',
                        yMin: ZONAS.temp.min,
                        yMax: ZONAS.temp.max,
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        borderWidth: 0,
                    }
                }
            }
        },
        scales: {
            x: {
                grid: { display: false, drawBorder: false },
                ticks: { color: '#94a3b8', font: { family: 'Inter' }, maxTicksLimit: 8 }
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                ticks: { color: '#94a3b8', font: { family: 'Inter' } },
                min: ZONAS.temp.config.min,
                max: ZONAS.temp.config.max
            }
        }
    }
});

// 3. CONTROLES DO GRÁFICO (Botões)
document.querySelectorAll('.btn-grafico').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Atualiza UI dos botões e aria-pressed
        document.querySelectorAll('.btn-grafico').forEach(b => {
            b.classList.remove('ativo');
            b.setAttribute('aria-pressed', 'false');
        });
        e.target.classList.add('ativo');
        e.target.setAttribute('aria-pressed', 'true');

        // Pega o tipo de dado selecionado
        metricaAtual = e.target.getAttribute('data-tipo');
        atualizarGraficoVisualizacao();
    });
});

document.querySelectorAll('.btn-tempo').forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Atualiza UI dos botões e aria-pressed
        document.querySelectorAll('.btn-tempo').forEach(b => {
            b.classList.remove('ativo');
            b.setAttribute('aria-pressed', 'false');
        });
        e.target.classList.add('ativo');
        e.target.setAttribute('aria-pressed', 'true');

        // Pega a resolução de tempo
        intervaloAtual = parseInt(e.target.getAttribute('data-res'));
        atualizarDashboard(); // Recarrega os dados com a nova URL
    });
});

function atualizarGraficoVisualizacao() {
    let dados, cor, label;
    const zona = ZONAS[metricaAtual];

    if (metricaAtual === 'temp') {
        dados = historicoTemp;
        cor = '#10b981'; // Verde
        label = 'Temperatura (°C)';
    } else if (metricaAtual === 'umid') {
        dados = historicoUmid;
        cor = '#3b82f6'; // Azul
        label = 'Umidade (%)';
    } else if (metricaAtual === 'vpd') {
        dados = historicoVpd;
        cor = '#f59e0b'; // Amarelo
        label = 'VPD (kPa)';
    } else if (metricaAtual === 'co2') {
        dados = historicoCo2;
        cor = '#a855f7'; // Roxo
        label = 'CO2 (ppm)';
    }

    // Atualiza dataset
    meuGrafico.data.datasets[0].data = dados;
    meuGrafico.data.datasets[0].label = label;
    meuGrafico.data.datasets[0].borderColor = cor;
    
    // Atualiza gradiente
    const newGradient = ctx.createLinearGradient(0, 0, 0, 400);
    newGradient.addColorStop(0, cor + '66'); // Adiciona transparência hex (aprox 40%)
    newGradient.addColorStop(1, cor + '00');
    meuGrafico.data.datasets[0].backgroundColor = newGradient;

    // Atualiza escalas e anotações (Zona Ideal)
    meuGrafico.options.scales.y.min = zona.config.min;
    meuGrafico.options.scales.y.max = zona.config.max;
    meuGrafico.options.plugins.annotation.annotations.zonaIdeal.yMin = zona.min;
    meuGrafico.options.plugins.annotation.annotations.zonaIdeal.yMax = zona.max;

    meuGrafico.update();
}


// 4. BUSCA E PROCESSAMENTO DE DADOS
async function atualizarDashboard() {
    let url = `https://api.thingspeak.com/channels/${CHANNEL_ID}/feeds.json?results=${intervaloAtual}`;
    if (READ_API_KEY !== '') url += `&api_key=${READ_API_KEY}`;

    const loadingOverlay = document.getElementById('loading-overlay');
    if(loadingOverlay) loadingOverlay.classList.add('ativo');

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro na requisição');

        const data = await response.json();
        const feeds = data.feeds;

        if (feeds && feeds.length > 0) {
            // Processa arrays de histórico
            historicoHorarios = [];
            historicoTemp = [];
            historicoUmid = [];
            historicoVpd = [];
            historicoCo2 = [];

            feeds.forEach(feed => {
                const dataHora = new Date(feed.created_at);
                historicoHorarios.push(dataHora.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }));
                
                const t = parseFloat(feed.field1);
                const u = parseFloat(feed.field2);
                const c = parseFloat(feed.field3); // Assumindo field3 para CO2
                
                historicoTemp.push(isNaN(t) ? null : t);
                historicoUmid.push(isNaN(u) ? null : u);
                historicoVpd.push(calcularVPD(t, u));
                historicoCo2.push(isNaN(c) ? null : c);
            });

            // Atualiza Card Temperatura
            const mmTemp = obterMaxMin(historicoTemp);
            const atualTemp = historicoTemp[historicoTemp.length - 1];
            atualizarCardUI('temp', atualTemp, mmTemp.max, mmTemp.min);

            // Atualiza Card Umidade
            const mmUmid = obterMaxMin(historicoUmid);
            const atualUmid = historicoUmid[historicoUmid.length - 1];
            atualizarCardUI('umid', atualUmid, mmUmid.max, mmUmid.min);

            // Atualiza Card VPD
            const mmVpd = obterMaxMin(historicoVpd);
            const atualVpd = historicoVpd[historicoVpd.length - 1];
            atualizarCardUI('vpd', atualVpd, mmVpd.max, mmVpd.min);

            // Atualiza Card CO2
            const mmCo2 = obterMaxMin(historicoCo2);
            const atualCo2 = historicoCo2[historicoCo2.length - 1];
            atualizarCardUI('co2', atualCo2, mmCo2.max, mmCo2.min);

            // Atualiza Labels do Gráfico e re-renderiza o dataset atual selecionado
            meuGrafico.data.labels = historicoHorarios;
            atualizarGraficoVisualizacao();

            // Atualiza status de conexão
            const ultimoRegistro = feeds[feeds.length - 1];
            const ultimaAtualizacao = new Date(ultimoRegistro.created_at).toLocaleTimeString('pt-BR');
            document.getElementById('ultima-att').innerText = `Última atualização: ${ultimaAtualizacao}`;
            
            const badge = document.getElementById('status-conexao');
            badge.innerText = 'Online';
            badge.className = 'status-badge';
            
            if(loadingOverlay) loadingOverlay.classList.remove('ativo');

        }
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        const badge = document.getElementById('status-conexao');
        badge.innerText = 'Offline';
        badge.className = 'status-badge erro';
        if(loadingOverlay) loadingOverlay.classList.remove('ativo');
    }
}

// Inicia
atualizarDashboard();
setInterval(atualizarDashboard, 15000);

// ==========================================
// 5. NOVAS FUNCIONALIDADES (UI/UX)
// ==========================================

// --- TEMA CLARO/ESCURO ---
const btnTheme = document.getElementById('btn-theme');
const temaSalvo = localStorage.getItem('growbox_theme');
if (temaSalvo === 'light') document.body.classList.add('light-theme');

btnTheme.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('growbox_theme', isLight ? 'light' : 'dark');
});

// --- EXPORTAR CSV ---
const btnExport = document.getElementById('btn-export');
btnExport.addEventListener('click', () => {
    if (historicoHorarios.length === 0) return alert('Sem dados para exportar!');
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Horario,Temperatura,Umidade,VPD,CO2\n";
    
    for (let i = 0; i < historicoHorarios.length; i++) {
        const row = [
            historicoHorarios[i],
            historicoTemp[i] || '',
            historicoUmid[i] || '',
            historicoVpd[i] ? historicoVpd[i].toFixed(2) : '',
            historicoCo2[i] || ''
        ].join(",");
        csvContent += row + "\n";
    }
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `growbox_dados_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
});

// --- MODAL DE CONFIGURAÇÕES ---
const btnSettings = document.getElementById('btn-settings');
const modal = document.getElementById('modal-settings');
const btnCancel = document.getElementById('btn-modal-cancel');
const btnSave = document.getElementById('btn-modal-save');

btnSettings.addEventListener('click', () => {
    // Preenche inputs com dados atuais
    document.getElementById('input-vpd-min').value = ZONAS.vpd.min;
    document.getElementById('input-vpd-max').value = ZONAS.vpd.max;
    document.getElementById('input-co2-min').value = ZONAS.co2.min;
    document.getElementById('input-co2-max').value = ZONAS.co2.max;
    modal.style.display = 'flex';
});

btnCancel.addEventListener('click', () => modal.style.display = 'none');

btnSave.addEventListener('click', () => {
    ZONAS.vpd.min = parseFloat(document.getElementById('input-vpd-min').value);
    ZONAS.vpd.max = parseFloat(document.getElementById('input-vpd-max').value);
    ZONAS.co2.min = parseFloat(document.getElementById('input-co2-min').value);
    ZONAS.co2.max = parseFloat(document.getElementById('input-co2-max').value);
    
    localStorage.setItem('growbox_zonas', JSON.stringify(ZONAS));
    modal.style.display = 'none';
    
    // Atualiza imediatamente a visualização
    atualizarGraficoVisualizacao();
    atualizarDashboard();
});
