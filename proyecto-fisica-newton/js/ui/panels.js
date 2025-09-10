/**
 * Sistema de Paneles de Información
 * Maneja la visualización de datos en tiempo real
 */

export class PanelSystem {
    constructor() {
        this.panels = new Map();
        this.isInitialized = false;
    }

    /**
     * Inicializar paneles
     */
    initialize() {
        if (this.isInitialized) return;

        this.setupInfoPanels();
        this.setupDataVisualization();
        this.isInitialized = true;
    }

    /**
     * Configurar paneles de información
     */
    setupInfoPanels() {
        // Panel de la Primera Ley
        this.createInfoPanel('first-law', {
            title: 'Información de Movimiento',
            metrics: [
                { id: 'velocity', label: 'Velocidad', unit: 'm/s', color: '#10b981' },
                { id: 'friction', label: 'Fricción', unit: '', color: '#6b7280' },
                { id: 'distance', label: 'Distancia', unit: 'm', color: '#3b82f6' }
            ]
        });

        // Panel de la Segunda Ley
        this.createInfoPanel('second-law', {
            title: 'Información de Fuerza',
            metrics: [
                { id: 'force', label: 'Fuerza', unit: 'N', color: '#ef4444' },
                { id: 'mass', label: 'Masa', unit: 'kg', color: '#6b7280' },
                { id: 'acceleration', label: 'Aceleración', unit: 'm/s²', color: '#f59e0b' }
            ]
        });

        // Panel de la Tercera Ley
        this.createInfoPanel('third-law', {
            title: 'Información de Colisión',
            metrics: [
                { id: 'force-ab', label: 'Fuerza A→B', unit: 'N', color: '#ef4444' },
                { id: 'force-ba', label: 'Fuerza B→A', unit: 'N', color: '#8b5cf6' },
                { id: 'momentum', label: 'Momentum Total', unit: 'kg⋅m/s', color: '#10b981' }
            ]
        });
    }

    /**
     * Crear panel de información
     */
    createInfoPanel(law, config) {
        const panel = {
            law,
            title: config.title,
            metrics: config.metrics,
            values: {},
            charts: new Map()
        };

        this.panels.set(law, panel);
        return panel;
    }

    /**
     * Actualizar valores del panel
     */
    updatePanelValues(law, values) {
        const panel = this.panels.get(law);
        if (!panel) return;

        // Actualizar valores
        Object.assign(panel.values, values);

        // Actualizar display
        this.updateDisplay(law);
    }

    /**
     * Actualizar display visual
     */
    updateDisplay(law) {
        const panel = this.panels.get(law);
        if (!panel) return;

        panel.metrics.forEach(metric => {
            const value = panel.values[metric.id];
            if (value === undefined) return;

            const displayElement = document.getElementById(`${metric.id}-display`);
            if (!displayElement) return;

            let displayValue = value;
            if (typeof value === 'object' && value.x !== undefined && value.y !== undefined) {
                // Es un vector, mostrar magnitud
                displayValue = Math.sqrt(value.x ** 2 + value.y ** 2);
            }

            if (typeof displayValue === 'number') {
                displayValue = displayValue.toFixed(2);
            }

            displayElement.textContent = displayValue + ' ' + metric.unit;
        });
    }

    /**
     * Configurar visualización de datos
     */
    setupDataVisualization() {
        // Crear gráficos de barras para cada ley
        this.createBarChart('first-law', 'energy-chart', {
            title: 'Energía del Sistema',
            bars: [
                { id: 'kinetic', label: 'Cinética', color: '#10b981' },
                { id: 'potential', label: 'Potencial', color: '#3b82f6' }
            ]
        });

        this.createBarChart('second-law', 'force-chart', {
            title: 'Magnitudes Físicas',
            bars: [
                { id: 'force', label: 'Fuerza', color: '#ef4444' },
                { id: 'acceleration', label: 'Aceleración', color: '#f59e0b' },
                { id: 'velocity', label: 'Velocidad', color: '#10b981' }
            ]
        });

        this.createBarChart('third-law', 'momentum-chart', {
            title: 'Momentum y Fuerzas',
            bars: [
                { id: 'momentum-a', label: 'Momentum A', color: '#ef4444' },
                { id: 'momentum-b', label: 'Momentum B', color: '#8b5cf6' },
                { id: 'total-momentum', label: 'Total', color: '#10b981' }
            ]
        });
    }

    /**
     * Crear gráfico de barras
     */
    createBarChart(law, chartId, config) {
        const chartContainer = document.createElement('div');
        chartContainer.className = 'data-chart';
        chartContainer.id = chartId;

        const title = document.createElement('div');
        title.className = 'chart-title';
        title.textContent = config.title;
        chartContainer.appendChild(title);

        config.bars.forEach(bar => {
            const barElement = this.createBarElement(bar);
            chartContainer.appendChild(barElement);
        });

        // Insertar en el panel de controles
        const controlsPanel = document.querySelector(`#${law}-law .controls-panel`);
        if (controlsPanel) {
            controlsPanel.appendChild(chartContainer);
        }

        // Registrar en el panel
        const panel = this.panels.get(law);
        if (panel) {
            panel.charts.set(chartId, {
                container: chartContainer,
                bars: config.bars,
                values: {}
            });
        }
    }

    /**
     * Crear elemento de barra
     */
    createBarElement(bar) {
        const barContainer = document.createElement('div');
        barContainer.className = 'chart-bar';

        const label = document.createElement('div');
        label.className = 'chart-label';
        label.textContent = bar.label;
        barContainer.appendChild(label);

        const valueContainer = document.createElement('div');
        valueContainer.className = 'chart-value';

        const fill = document.createElement('div');
        fill.className = `chart-fill chart-fill-${bar.id}`;
        fill.style.width = '0%';
        valueContainer.appendChild(fill);

        barContainer.appendChild(valueContainer);

        const number = document.createElement('div');
        number.className = 'chart-number';
        number.textContent = '0';
        barContainer.appendChild(number);

        return barContainer;
    }

    /**
     * Actualizar gráfico de barras
     */
    updateBarChart(law, chartId, values) {
        const panel = this.panels.get(law);
        if (!panel) return;

        const chart = panel.charts.get(chartId);
        if (!chart) return;

        // Actualizar valores
        Object.assign(chart.values, values);

        // Encontrar valor máximo para escalar
        const maxValue = Math.max(...Object.values(chart.values).filter(v => typeof v === 'number'));

        // Actualizar cada barra
        chart.bars.forEach(bar => {
            const value = chart.values[bar.id] || 0;
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

            const barElement = chart.container.querySelector(`.chart-fill-${bar.id}`);
            const numberElement = chart.container.querySelector(`.chart-fill-${bar.id}`).parentElement.nextElementSibling;

            if (barElement) {
                barElement.style.width = percentage + '%';
            }

            if (numberElement) {
                numberElement.textContent = typeof value === 'number' ? value.toFixed(1) : value;
            }
        });
    }

    /**
     * Crear indicador de estado
     */
    createStatusIndicator(law, status = 'stopped') {
        const statusElement = document.createElement('div');
        statusElement.className = `status-indicator status-${status}`;

        const icon = document.createElement('span');
        icon.textContent = this.getStatusIcon(status);
        statusElement.appendChild(icon);

        const text = document.createElement('span');
        text.textContent = this.getStatusText(status);
        statusElement.appendChild(text);

        return statusElement;
    }

    /**
     * Obtener icono de estado
     */
    getStatusIcon(status) {
        const icons = {
            running: '▶️',
            paused: '⏸️',
            stopped: '⏹️'
        };
        return icons[status] || icons.stopped;
    }

    /**
     * Obtener texto de estado
     */
    getStatusText(status) {
        const texts = {
            running: 'Ejecutando',
            paused: 'Pausado',
            stopped: 'Detenido'
        };
        return texts[status] || texts.stopped;
    }

    /**
     * Mostrar notificación
     */
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Estilos
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 12px 16px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animar entrada
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 10);

        // Remover después de la duración
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, duration);
    }

    /**
     * Crear tooltip informativo
     */
    createInfoTooltip(element, content) {
        const tooltip = document.createElement('div');
        tooltip.className = 'info-tooltip';
        tooltip.innerHTML = content;

        // Estilos
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            max-width: 200px;
            z-index: 1000;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease;
        `;

        document.body.appendChild(tooltip);

        element.addEventListener('mouseenter', (e) => {
            const rect = element.getBoundingClientRect();
            tooltip.style.left = rect.left + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
            tooltip.style.opacity = '1';
        });

        element.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });

        element.addEventListener('mousemove', (e) => {
            tooltip.style.left = e.clientX + 10 + 'px';
            tooltip.style.top = e.clientY - tooltip.offsetHeight - 5 + 'px';
        });
    }

    /**
     * Actualizar estadísticas del sistema
     */
    updateSystemStats(law, stats) {
        const panel = this.panels.get(law);
        if (!panel) return;

        // Actualizar gráficos con estadísticas
        if (law === 'first') {
            this.updateBarChart(law, 'energy-chart', {
                kinetic: stats.kineticEnergy || 0,
                potential: stats.potentialEnergy || 0
            });
        } else if (law === 'second') {
            this.updateBarChart(law, 'force-chart', {
                force: stats.forceMagnitude || 0,
                acceleration: stats.accelerationMagnitude || 0,
                velocity: stats.velocityMagnitude || 0
            });
        } else if (law === 'third') {
            this.updateBarChart(law, 'momentum-chart', {
                'momentum-a': stats.momentumA || 0,
                'momentum-b': stats.momentumB || 0,
                'total-momentum': stats.totalMomentum || 0
            });
        }
    }

    /**
     * Limpiar paneles
     */
    clear() {
        this.panels.clear();
    }

    /**
     * Obtener información del panel
     */
    getPanelInfo(law) {
        return this.panels.get(law);
    }
}
