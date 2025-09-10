/**
 * Sistema de Controles de Interfaz
 * Maneja la interacción con los controles de usuario
 */

export class ControlSystem {
    constructor() {
        this.controls = new Map();
        this.callbacks = new Map();
        this.isInitialized = false;
    }

    /**
     * Inicializar controles
     */
    initialize() {
        if (this.isInitialized) return;

        this.setupFirstLawControls();
        this.setupSecondLawControls();
        this.setupThirdLawControls();
        this.setupTabNavigation();

        this.isInitialized = true;
    }

    /**
     * Configurar controles de la Primera Ley
     */
    setupFirstLawControls() {
        // Velocidad inicial
        const initialVelocitySlider = document.getElementById('initial-velocity');
        const initialVelocityValue = document.getElementById('initial-velocity-value');

        if (initialVelocitySlider && initialVelocityValue) {
            initialVelocitySlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                initialVelocityValue.textContent = value;
                this.triggerCallback('first-law', 'initial-velocity', value);
            });
        }

        // Coeficiente de fricción
        const frictionSlider = document.getElementById('friction-coefficient');
        const frictionValue = document.getElementById('friction-coefficient-value');

        if (frictionSlider && frictionValue) {
            frictionSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                frictionValue.textContent = value.toFixed(2);
                this.triggerCallback('first-law', 'friction-coefficient', value);
            });
        }

        // Tipo de superficie
        const surfaceSelect = document.getElementById('surface-type');

        if (surfaceSelect) {
            surfaceSelect.addEventListener('change', (e) => {
                const surfaceType = e.target.value;
                const frictionValues = {
                    ice: 0.01,
                    wood: 0.2,
                    asphalt: 0.7,
                    sand: 0.9
                };

                const frictionValue = frictionValues[surfaceType];
                frictionSlider.value = frictionValue;
                frictionValue.textContent = frictionValue.toFixed(2);

                this.triggerCallback('first-law', 'surface-type', surfaceType);
                this.triggerCallback('first-law', 'friction-coefficient', frictionValue);
            });
        }

        // Botones de control
        const startBtn = document.getElementById('start-first');
        const resetBtn = document.getElementById('reset-first');

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.triggerCallback('first-law', 'start');
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.triggerCallback('first-law', 'reset');
            });
        }
    }

    /**
     * Configurar controles de la Segunda Ley
     */
    setupSecondLawControls() {
        // Fuerza aplicada
        const appliedForceSlider = document.getElementById('applied-force');
        const appliedForceValue = document.getElementById('applied-force-value');

        if (appliedForceSlider && appliedForceValue) {
            appliedForceSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                appliedForceValue.textContent = value;
                this.triggerCallback('second-law', 'applied-force', value);
            });
        }

        // Masa del objeto
        const objectMassSlider = document.getElementById('object-mass');
        const objectMassValue = document.getElementById('object-mass-value');

        if (objectMassSlider && objectMassValue) {
            objectMassSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                objectMassValue.textContent = value;
                this.triggerCallback('second-law', 'object-mass', value);
            });
        }

        // Dirección de la fuerza
        const forceDirectionSlider = document.getElementById('force-direction');
        const forceDirectionValue = document.getElementById('force-direction-value');

        if (forceDirectionSlider && forceDirectionValue) {
            forceDirectionSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                forceDirectionValue.textContent = value + '°';
                this.triggerCallback('second-law', 'force-direction', value);
            });
        }

        // Botones de control
        const startBtn = document.getElementById('start-second');
        const resetBtn = document.getElementById('reset-second');

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.triggerCallback('second-law', 'start');
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.triggerCallback('second-law', 'reset');
            });
        }
    }

    /**
     * Configurar controles de la Tercera Ley
     */
    setupThirdLawControls() {
        // Masa del objeto A
        const objectAMassSlider = document.getElementById('object-a-mass');
        const objectAMassValue = document.getElementById('object-a-mass-value');

        if (objectAMassSlider && objectAMassValue) {
            objectAMassSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                objectAMassValue.textContent = value;
                this.triggerCallback('third-law', 'object-a-mass', value);
            });
        }

        // Masa del objeto B
        const objectBMassSlider = document.getElementById('object-b-mass');
        const objectBMassValue = document.getElementById('object-b-mass-value');

        if (objectBMassSlider && objectBMassValue) {
            objectBMassSlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                objectBMassValue.textContent = value;
                this.triggerCallback('third-law', 'object-b-mass', value);
            });
        }

        // Tipo de colisión
        const collisionSelect = document.getElementById('collision-type');

        if (collisionSelect) {
            collisionSelect.addEventListener('change', (e) => {
                const collisionType = e.target.value;
                this.triggerCallback('third-law', 'collision-type', collisionType);
            });
        }

        // Botones de control
        const startBtn = document.getElementById('start-third');
        const resetBtn = document.getElementById('reset-third');

        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.triggerCallback('third-law', 'start');
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.triggerCallback('third-law', 'reset');
            });
        }
    }

    /**
     * Configurar navegación por pestañas
     */
    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-button');
        const lawSections = document.querySelectorAll('.law-section');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const law = button.dataset.law;

                // Actualizar botones activos
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');

                // Mostrar sección correspondiente
                lawSections.forEach(section => {
                    section.classList.remove('active');
                    if (section.id === `${law}-law`) {
                        section.classList.add('active');
                    }
                });

                // Notificar cambio de ley
                this.triggerCallback('navigation', 'law-change', law);
            });
        });
    }

    /**
     * Registrar callback para un control
     */
    onControlChange(law, control, callback) {
        const key = `${law}-${control}`;
        this.callbacks.set(key, callback);
    }

    /**
     * Ejecutar callback
     */
    triggerCallback(law, control, value) {
        const key = `${law}-${control}`;
        const callback = this.callbacks.get(key);

        if (callback) {
            callback(value);
        }
    }

    /**
     * Obtener valor de un control
     */
    getControlValue(law, control) {
        const element = document.getElementById(`${control}-${law}`);
        if (!element) return null;

        if (element.type === 'range' || element.type === 'number') {
            return parseFloat(element.value);
        }

        return element.value;
    }

    /**
     * Establecer valor de un control
     */
    setControlValue(law, control, value) {
        const element = document.getElementById(`${control}-${law}`);
        if (!element) return;

        if (element.type === 'range' || element.type === 'number') {
            element.value = value;
            // Actualizar display del valor
            const valueDisplay = document.getElementById(`${control}-${law}-value`);
            if (valueDisplay) {
                valueDisplay.textContent = value;
            }
        } else {
            element.value = value;
        }
    }

    /**
     * Habilitar/deshabilitar controles
     */
    setControlsEnabled(law, enabled) {
        const controls = document.querySelectorAll(`#${law}-law input, #${law}-law select, #${law}-law button`);
        controls.forEach(control => {
            control.disabled = !enabled;
        });
    }

    /**
     * Actualizar información en tiempo real
     */
    updateInfo(law, info) {
        const infoElement = document.getElementById(`${law}-law-info`);
        if (!infoElement) return;

        // Actualizar valores específicos según la ley
        switch (law) {
            case 'first':
                this.updateFirstLawInfo(info, infoElement);
                break;
            case 'second':
                this.updateSecondLawInfo(info, infoElement);
                break;
            case 'third':
                this.updateThirdLawInfo(info, infoElement);
                break;
        }
    }

    /**
     * Actualizar información de la Primera Ley
     */
    updateFirstLawInfo(info, infoElement) {
        const velocityDisplay = infoElement.querySelector('#velocity-display');
        const frictionDisplay = infoElement.querySelector('#friction-display');

        if (velocityDisplay && info.velocity !== undefined) {
            const speed = Math.sqrt(info.velocity.x ** 2 + info.velocity.y ** 2);
            velocityDisplay.textContent = speed.toFixed(2) + ' m/s';
        }

        if (frictionDisplay && info.friction !== undefined) {
            frictionDisplay.textContent = info.friction.toFixed(2);
        }
    }

    /**
     * Actualizar información de la Segunda Ley
     */
    updateSecondLawInfo(info, infoElement) {
        const forceDisplay = infoElement.querySelector('#force-display');
        const massDisplay = infoElement.querySelector('#mass-display');
        const accelerationDisplay = infoElement.querySelector('#acceleration-display');

        if (forceDisplay && info.force !== undefined) {
            const forceMagnitude = Math.sqrt(info.force.x ** 2 + info.force.y ** 2);
            forceDisplay.textContent = forceMagnitude.toFixed(1) + ' N';
        }

        if (massDisplay && info.mass !== undefined) {
            massDisplay.textContent = info.mass.toFixed(1) + ' kg';
        }

        if (accelerationDisplay && info.acceleration !== undefined) {
            const accMagnitude = Math.sqrt(info.acceleration.x ** 2 + info.acceleration.y ** 2);
            accelerationDisplay.textContent = accMagnitude.toFixed(1) + ' m/s²';
        }
    }

    /**
     * Actualizar información de la Tercera Ley
     */
    updateThirdLawInfo(info, infoElement) {
        const forceABDisplay = infoElement.querySelector('#force-ab-display');
        const forceBADisplay = infoElement.querySelector('#force-ba-display');
        const momentumDisplay = infoElement.querySelector('#momentum-display');

        if (forceABDisplay && info.forceAB !== undefined) {
            const forceMagnitude = Math.sqrt(info.forceAB.x ** 2 + info.forceAB.y ** 2);
            forceABDisplay.textContent = forceMagnitude.toFixed(1) + ' N';
        }

        if (forceBADisplay && info.forceBA !== undefined) {
            const forceMagnitude = Math.sqrt(info.forceBA.x ** 2 + info.forceBA.y ** 2);
            forceBADisplay.textContent = forceMagnitude.toFixed(1) + ' N';
        }

        if (momentumDisplay && info.momentum !== undefined) {
            momentumDisplay.textContent = info.momentum.toFixed(1) + ' kg⋅m/s';
        }
    }

    /**
     * Crear tooltip para un control
     */
    createTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);

        element.addEventListener('mouseenter', (e) => {
            const rect = element.getBoundingClientRect();
            tooltip.style.left = rect.left + rect.width / 2 + 'px';
            tooltip.style.top = rect.top - 10 + 'px';
            tooltip.classList.add('show');
        });

        element.addEventListener('mouseleave', () => {
            tooltip.classList.remove('show');
        });

        element.addEventListener('mousemove', (e) => {
            tooltip.style.left = e.clientX + 'px';
            tooltip.style.top = e.clientY - 30 + 'px';
        });
    }

    /**
     * Obtener configuración actual de controles
     */
    getCurrentConfiguration(law) {
        const config = {};

        switch (law) {
            case 'first':
                config.initialVelocity = this.getControlValue('first', 'initial-velocity');
                config.frictionCoefficient = this.getControlValue('first', 'friction-coefficient');
                config.surfaceType = this.getControlValue('first', 'surface-type');
                break;
            case 'second':
                config.appliedForce = this.getControlValue('second', 'applied-force');
                config.objectMass = this.getControlValue('second', 'object-mass');
                config.forceDirection = this.getControlValue('second', 'force-direction');
                break;
            case 'third':
                config.objectAMass = this.getControlValue('third', 'object-a-mass');
                config.objectBMass = this.getControlValue('third', 'object-b-mass');
                config.collisionType = this.getControlValue('third', 'collision-type');
                break;
        }

        return config;
    }

    /**
     * Resetear controles a valores por defecto
     */
    resetControls(law) {
        const defaultValues = {
            first: {
                'initial-velocity': 10,
                'friction-coefficient': 0.1,
                'surface-type': 'ice'
            },
            second: {
                'applied-force': 20,
                'object-mass': 1,
                'force-direction': 0
            },
            third: {
                'object-a-mass': 1,
                'object-b-mass': 2,
                'collision-type': 'elastic'
            }
        };

        const values = defaultValues[law];
        if (!values) return;

        Object.entries(values).forEach(([control, value]) => {
            this.setControlValue(law, control, value);
        });
    }
}
