const turbineTypes = {
    pelton: { efficiency: 90, color: '#3b82f6' },
    francis: { efficiency: 92, color: '#10b981' },
    kaplan: { efficiency: 93, color: '#8b5cf6' },
    crossflow: { efficiency: 85, color: '#f59e0b' }
};

let powerFlowChart, lossesChart, historyChart;
let historyData = [];

function initCharts() {
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: true,
                position: 'bottom'
            }
        }
    };

    powerFlowChart = new Chart(document.getElementById('powerFlowChart'), {
        type: 'bar',
        data: {
            labels: ['Hidráulica', 'Turbina', 'Generador', 'Real'],
            datasets: [{
                label: 'Potencia (kW)',
                data: [0, 0, 0, 0],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Potencia (kW)'
                    }
                }
            }
        }
    });

    lossesChart = new Chart(document.getElementById('lossesChart'), {
        type: 'pie',
        data: {
            labels: ['Turbina', 'Generador', 'Transmisión'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#ef4444', '#f59e0b', '#fbbf24']
            }]
        },
        options: commonOptions
    });

    historyChart = new Chart(document.getElementById('historyChart'), {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Eficiencia (%)',
                data: [],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            ...commonOptions,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Eficiencia (%)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Simulación #'
                    }
                }
            }
        }
    });
}

function calculate() {
    const caudal = parseFloat(document.getElementById('caudal').value);
    const altura = parseFloat(document.getElementById('altura').value);
    const turbineType = document.getElementById('turbineType').value;
    const generatorEff = parseFloat(document.getElementById('generatorEff').value);
    const transmissionEff = parseFloat(document.getElementById('transmissionEff').value);

    const g = 9.81;
    const rhoWater = 1000;

    const potenciaHidraulica = (rhoWater * g * caudal * altura) / 1000;
    const turbineEff = turbineTypes[turbineType].efficiency / 100;
    const potenciaTurbina = potenciaHidraulica * turbineEff;
    const potenciaGenerador = potenciaTurbina * (generatorEff / 100);
    const potenciaReal = potenciaGenerador * (transmissionEff / 100);

    const eficienciaTotal = (potenciaReal / potenciaHidraulica) * 100;

    const perdidasTurbina = potenciaHidraulica - potenciaTurbina;
    const perdidasGenerador = potenciaTurbina - potenciaGenerador;
    const perdidasTransmision = potenciaGenerador - potenciaReal;
    const perdidasTotales = perdidasTurbina + perdidasGenerador + perdidasTransmision;

    const energiaAnual = potenciaReal * 24 * 365 / 1000 * 0.75;

    document.getElementById('eficienciaTotal').textContent = eficienciaTotal.toFixed(2);
    document.getElementById('potenciaReal').textContent = potenciaReal.toFixed(2);
    document.getElementById('energiaAnual').textContent = energiaAnual.toFixed(2);
    document.getElementById('potenciaHidraulica').textContent = potenciaHidraulica.toFixed(2);
    document.getElementById('eficienciaTurbina').textContent = (turbineEff * 100).toFixed(2);
    document.getElementById('perdidasTotales').textContent = perdidasTotales.toFixed(2);

    const recomendacion = eficienciaTotal >= 80 
        ? '✓ Sistema operando en rango óptimo'
        : eficienciaTotal >= 70
        ? '⚠ Considere mantenimiento preventivo'
        : '⚠ Requiere revisión urgente del sistema';
    document.getElementById('recomendacion').textContent = recomendacion;

    powerFlowChart.data.datasets[0].data = [
        potenciaHidraulica.toFixed(2),
        potenciaTurbina.toFixed(2),
        potenciaGenerador.toFixed(2),
        potenciaReal.toFixed(2)
    ];
    powerFlowChart.update();

    lossesChart.data.datasets[0].data = [
        perdidasTurbina.toFixed(2),
        perdidasGenerador.toFixed(2),
        perdidasTransmision.toFixed(2)
    ];
    lossesChart.update();

    if (historyData.length < 20) {
        historyData.push(eficienciaTotal.toFixed(2));
        historyChart.data.labels = historyData.map((_, i) => i + 1);
        historyChart.data.datasets[0].data = historyData;
        historyChart.update();
    }
}

function setupEventListeners() {
    const inputs = ['caudal', 'altura', 'generatorEff', 'transmissionEff'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        element.addEventListener('input', (e) => {
            document.getElementById(id + 'Value').textContent = 
                e.target.value + (id === 'caudal' ? ' m³/s' : id === 'altura' ? ' m' : '%');
            historyData = [];
            calculate();
        });
    });

    document.getElementById('turbineType').addEventListener('change', () => {
        historyData = [];
        calculate();
    });
}

window.addEventListener('load', () => {
    initCharts();
    setupEventListeners();
    calculate();
});