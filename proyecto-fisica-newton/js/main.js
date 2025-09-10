/**
 * Simulador de las 3 Leyes de Newton
 * Archivo principal que coordina todos los componentes
 */

import { ControlSystem } from './ui/controls.js';
import { PanelSystem } from './ui/panels.js';
import { FirstLawSimulator } from './law-simulators/first-law-simulator.js';
import { SecondLawSimulator } from './law-simulators/second-law-simulator.js';
import { ThirdLawSimulator } from './law-simulators/third-law-simulator.js';

class NewtonLawsApp {
    constructor() {
        this.controlSystem = new ControlSystem();
        this.panelSystem = new PanelSystem();
        this.simulators = new Map();
        this.currentLaw = 'first';
        this.isInitialized = false;

        this.init();
    }

    /**
     * Inicializar aplicación
     */
    async init() {
        try {
            console.log('Inicializando Simulador de las 3 Leyes de Newton...');

            // Inicializar sistemas
            this.controlSystem.initialize();
            this.panelSystem.initialize();

            // Crear simuladores
            this.createSimulators();

            // Configurar eventos
            this.setupEventListeners();

            // Configurar controles
            this.setupControls();

            this.isInitialized = true;
            console.log('Aplicación inicializada correctamente');

            // Mostrar notificación de bienvenida
            this.panelSystem.showNotification(
                '¡Bienvenido al Simulador de las 3 Leyes de Newton!',
                'info',
                5000
            );

        } catch (error) {
            console.error('Error al inicializar la aplicación:', error);
            this.showError('Error al inicializar la aplicación. Por favor, recarga la página.');
        }
    }

    /**
     * Crear simuladores
     */
    createSimulators() {
        // Simulador de la Primera Ley
        this.simulators.set('first', new FirstLawSimulator('first-law-canvas'));

        // Simulador de la Segunda Ley
        this.simulators.set('second', new SecondLawSimulator('second-law-canvas'));

        // Simulador de la Tercera Ley
        this.simulators.set('third', new ThirdLawSimulator('third-law-canvas'));
    }

    /**
     * Configurar event listeners
     */
    setupEventListeners() {
        // Cambio de ley
        this.controlSystem.onControlChange('navigation', 'law-change', (law) => {
            this.switchLaw(law);
        });

        // Controles de la Primera Ley
        this.setupFirstLawControls();

        // Controles de la Segunda Ley
        this.setupSecondLawControls();

        // Controles de la Tercera Ley
        this.setupThirdLawControls();

        // Eventos de ventana
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Eventos de teclado
        document.addEventListener('keydown', (e) => {
            this.handleKeyPress(e);
        });
    }

    /**
     * Configurar controles de la Primera Ley
     */
    setupFirstLawControls() {
        const simulator = this.simulators.get('first');

        // Velocidad inicial
        this.controlSystem.onControlChange('first-law', 'initial-velocity', (value) => {
            simulator.updateConfig({ initialVelocity: value });
        });

        // Coeficiente de fricción
        this.controlSystem.onControlChange('first-law', 'friction-coefficient', (value) => {
            simulator.updateConfig({ frictionCoefficient: value });
        });

        // Tipo de superficie
        this.controlSystem.onControlChange('first-law', 'surface-type', (value) => {
            simulator.updateConfig({ surfaceType: value });
        });

        // Botones de control
        this.controlSystem.onControlChange('first-law', 'start', () => {
            simulator.start();
            this.updatePanelInfo('first');
        });

        this.controlSystem.onControlChange('first-law', 'reset', () => {
            simulator.reset();
            this.updatePanelInfo('first');
        });
    }

    /**
     * Configurar controles de la Segunda Ley
     */
    setupSecondLawControls() {
        const simulator = this.simulators.get('second');

        // Fuerza aplicada
        this.controlSystem.onControlChange('second-law', 'applied-force', (value) => {
            simulator.updateConfig({ appliedForce: value });
        });

        // Masa del objeto
        this.controlSystem.onControlChange('second-law', 'object-mass', (value) => {
            simulator.updateConfig({ objectMass: value });
        });

        // Dirección de la fuerza
        this.controlSystem.onControlChange('second-law', 'force-direction', (value) => {
            simulator.updateConfig({ forceDirection: value });
        });

        // Botones de control
        this.controlSystem.onControlChange('second-law', 'start', () => {
            simulator.start();
            this.updatePanelInfo('second');
        });

        this.controlSystem.onControlChange('second-law', 'reset', () => {
            simulator.reset();
            this.updatePanelInfo('second');
        });
    }

    /**
     * Configurar controles de la Tercera Ley
     */
    setupThirdLawControls() {
        const simulator = this.simulators.get('third');

        // Masa del objeto A
        this.controlSystem.onControlChange('third-law', 'object-a-mass', (value) => {
            simulator.updateConfig({ objectAMass: value });
        });

        // Masa del objeto B
        this.controlSystem.onControlChange('third-law', 'object-b-mass', (value) => {
            simulator.updateConfig({ objectBMass: value });
        });

        // Tipo de colisión
        this.controlSystem.onControlChange('third-law', 'collision-type', (value) => {
            simulator.updateConfig({ collisionType: value });
        });

        // Botones de control
        this.controlSystem.onControlChange('third-law', 'start', () => {
            simulator.start();
            this.updatePanelInfo('third');
        });

        this.controlSystem.onControlChange('third-law', 'reset', () => {
            simulator.reset();
            this.updatePanelInfo('third');
        });
    }

    /**
     * Cambiar de ley activa
     */
    switchLaw(law) {
        if (this.currentLaw === law) return;

        // Pausar simulador actual
        const currentSimulator = this.simulators.get(this.currentLaw);
        if (currentSimulator) {
            currentSimulator.pause();
        }

        // Cambiar a nueva ley
        this.currentLaw = law;

        // Actualizar información del panel
        this.updatePanelInfo(law);

        console.log(`Cambiado a la ${law} ley de Newton`);
    }

    /**
     * Actualizar información del panel
     */
    updatePanelInfo(law) {
        const simulator = this.simulators.get(law);
        if (!simulator) return;

        const info = simulator.getInfo();
        if (info) {
            this.panelSystem.updatePanelValues(law, info);
        }

        // Actualizar estadísticas específicas
        this.updateLawStats(law);
    }

    /**
     * Actualizar estadísticas específicas de cada ley
     */
    updateLawStats(law) {
        const simulator = this.simulators.get(law);
        if (!simulator) return;

        let stats = {};

        switch (law) {
            case 'first':
                stats = simulator.getEnergyStats();
                this.panelSystem.updateSystemStats(law, stats);
                break;

            case 'second':
                stats = simulator.getForceStats();
                this.panelSystem.updateSystemStats(law, stats);
                break;

            case 'third':
                stats = simulator.getMomentumStats();
                this.panelSystem.updateSystemStats(law, stats);
                break;
        }
    }

    /**
     * Configurar controles
     */
    setupControls() {
        // Crear tooltips informativos
        this.createTooltips();

        // Configurar ejemplos predefinidos
        this.setupExamples();
    }

    /**
     * Crear tooltips informativos
     */
    createTooltips() {
        const tooltips = [
            {
                selector: '#initial-velocity',
                content: 'Velocidad inicial del objeto en m/s'
            },
            {
                selector: '#friction-coefficient',
                content: 'Coeficiente de fricción de la superficie'
            },
            {
                selector: '#applied-force',
                content: 'Magnitud de la fuerza aplicada en Newtons'
            },
            {
                selector: '#object-mass',
                content: 'Masa del objeto en kilogramos'
            },
            {
                selector: '#force-direction',
                content: 'Dirección de la fuerza en grados'
            }
        ];

        tooltips.forEach(tooltip => {
            const element = document.querySelector(tooltip.selector);
            if (element) {
                this.panelSystem.createInfoTooltip(element, tooltip.content);
            }
        });
    }

    /**
     * Configurar ejemplos predefinidos
     */
    setupExamples() {
        // Ejemplos para la Primera Ley
        this.addExampleButton('first', 'Patinaje en Hielo', 'ice-skating');
        this.addExampleButton('first', 'Deslizamiento en Madera', 'wood-sliding');
        this.addExampleButton('first', 'Frenado en Asfalto', 'asphalt-stopping');

        // Ejemplos para la Segunda Ley
        this.addExampleButton('second', 'Empuje Ligero', 'light-push');
        this.addExampleButton('second', 'Empuje Fuerte', 'heavy-push');
        this.addExampleButton('second', 'Fuerza Angulada', 'angled-force');

        // Ejemplos para la Tercera Ley
        this.addExampleButton('third', 'Colisión Elástica', 'elastic-collision');
        this.addExampleButton('third', 'Colisión Inelástica', 'inelastic-collision');
        this.addExampleButton('third', 'Choque Perfecto', 'perfectly-inelastic');
    }

    /**
     * Añadir botón de ejemplo
     */
    addExampleButton(law, text, exampleType) {
        const controlsPanel = document.querySelector(`#${law}-law .controls-panel`);
        if (!controlsPanel) return;

        const button = document.createElement('button');
        button.className = 'btn btn-secondary example-btn';
        button.textContent = text;
        button.style.cssText = 'margin: 4px; font-size: 12px; padding: 8px 12px;';

        button.addEventListener('click', () => {
            const simulator = this.simulators.get(law);
            if (simulator) {
                simulator.createExample(exampleType);
                this.updatePanelInfo(law);
            }
        });

        controlsPanel.appendChild(button);
    }

    /**
     * Manejar redimensionamiento de ventana
     */
    handleResize() {
        // Redimensionar canvas si es necesario
        this.simulators.forEach(simulator => {
            if (simulator.renderer) {
                const canvas = simulator.renderer.canvas;
                const container = canvas.parentElement;
                if (container) {
                    const rect = container.getBoundingClientRect();
                    simulator.renderer.resize(rect.width, rect.height);
                }
            }
        });
    }

    /**
     * Manejar teclas presionadas
     */
    handleKeyPress(e) {
        switch (e.key) {
            case ' ':
                e.preventDefault();
                this.toggleSimulation();
                break;
            case 'r':
            case 'R':
                this.resetCurrentSimulation();
                break;
            case '1':
                this.switchLaw('first');
                break;
            case '2':
                this.switchLaw('second');
                break;
            case '3':
                this.switchLaw('third');
                break;
        }
    }

    /**
     * Alternar simulación actual
     */
    toggleSimulation() {
        const simulator = this.simulators.get(this.currentLaw);
        if (!simulator) return;

        if (simulator.isRunning) {
            simulator.pause();
        } else {
            simulator.start();
        }

        this.updatePanelInfo(this.currentLaw);
    }

    /**
     * Resetear simulación actual
     */
    resetCurrentSimulation() {
        const simulator = this.simulators.get(this.currentLaw);
        if (simulator) {
            simulator.reset();
            this.updatePanelInfo(this.currentLaw);
        }
    }

    /**
     * Mostrar error
     */
    showError(message) {
        this.panelSystem.showNotification(message, 'error', 5000);
        console.error(message);
    }

    /**
     * Obtener información de la aplicación
     */
    getAppInfo() {
        return {
            currentLaw: this.currentLaw,
            isInitialized: this.isInitialized,
            simulators: Array.from(this.simulators.keys())
        };
    }

    /**
     * Destruir aplicación
     */
    destroy() {
        this.simulators.forEach(simulator => {
            if (simulator.destroy) {
                simulator.destroy();
            }
        });

        this.simulators.clear();
        this.controlSystem = null;
        this.panelSystem = null;
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.newtonLawsApp = new NewtonLawsApp();
});

// Exportar para uso global
export default NewtonLawsApp;
