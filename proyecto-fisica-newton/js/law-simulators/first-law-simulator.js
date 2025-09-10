/**
 * Simulador de la Primera Ley de Newton - Ley de Inercia
 * Demuestra cómo los objetos mantienen su estado de movimiento
 */

import { PhysicsEngine } from '../physics/newton-laws.js';
import { ForceSystem } from '../physics/forces.js';
import { MotionSystem } from '../physics/motion.js';
import { CanvasRenderer } from '../canvas/renderer.js';
import { AnimationSystem } from '../canvas/animations.js';

export class FirstLawSimulator {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.physics = new PhysicsEngine();
        this.forces = new ForceSystem();
        this.motion = new MotionSystem();
        this.renderer = new CanvasRenderer(canvasId);
        this.animations = new AnimationSystem(this.renderer);

        this.isRunning = false;
        this.animationId = null;
        this.lastTime = 0;

        // Configuración del simulador
        this.config = {
            initialVelocity: 10,
            frictionCoefficient: 0.1,
            surfaceType: 'ice',
            objectMass: 1,
            objectRadius: 15
        };

        // Objetos del simulador
        this.skatingObject = null;
        this.surfaceLevel = 350;

        this.initialize();
    }

    /**
     * Inicializar simulador
     */
    initialize() {
        this.createSkatingObject();
        this.setupSurface();
        this.render();
    }

    /**
     * Crear objeto patinador
     */
    createSkatingObject() {
        this.skatingObject = this.physics.createObject(
            'skater',
            { x: 100, y: this.surfaceLevel - this.config.objectRadius },
            { x: this.config.initialVelocity, y: 0 },
            this.config.objectMass,
            this.config.objectRadius
        );

        this.skatingObject.color = '#3b82f6';
        this.skatingObject.type = 'ball';
        this.skatingObject.label = 'Patinador';
    }

    /**
     * Configurar superficie
     */
    setupSurface() {
        const surfaceFriction = {
            ice: 0.01,
            wood: 0.2,
            asphalt: 0.7,
            sand: 0.9
        };

        this.config.frictionCoefficient = surfaceFriction[this.config.surfaceType] || 0.01;
    }

    /**
     * Iniciar simulación
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastTime = 0;
        this.animate();

        // Crear efecto de inicio
        this.animations.createSlidingEffect(this.skatingObject, this.config.surfaceType);
    }

    /**
     * Pausar simulación
     */
    pause() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Detener simulación
     */
    stop() {
        this.pause();
        this.reset();
    }

    /**
     * Resetear simulador
     */
    reset() {
        this.pause();
        this.physics.clear();
        this.animations.stopAllAnimations();
        this.renderer.clearTrajectory();
        this.createSkatingObject();
        this.setupSurface();
        this.render();
    }

    /**
     * Bucle de animación
     */
    animate() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        const deltaTime = this.motion.updateTime(currentTime);

        if (deltaTime > 0) {
            this.update(deltaTime);
            this.render();
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Actualizar simulación
     */
    update(deltaTime) {
        if (!this.skatingObject) return;

        // Aplicar Primera Ley de Newton con fricción
        this.physics.applyInertia('skater', this.config.frictionCoefficient);

        // Añadir punto a la trayectoria
        this.renderer.addTrajectoryPoint(
            this.skatingObject.position.x,
            this.skatingObject.position.y
        );

        // Crear partículas de deslizamiento
        if (Math.random() < 0.1) {
            this.animations.createSlidingEffect(this.skatingObject, this.config.surfaceType);
        }

        // Detener si la velocidad es muy baja
        const speed = Math.sqrt(
            this.skatingObject.velocity.x ** 2 + this.skatingObject.velocity.y ** 2
        );

        if (speed < 0.1) {
            this.skatingObject.velocity.x = 0;
            this.skatingObject.velocity.y = 0;
        }
    }

    /**
     * Renderizar escena
     */
    render() {
        this.renderer.clear();

        // Dibujar superficie
        this.renderer.drawSurface(this.config.surfaceType, this.surfaceLevel);

        // Dibujar trayectoria
        this.renderer.drawTrajectory();

        // Dibujar objeto
        if (this.skatingObject) {
            this.renderer.drawObject(this.skatingObject);

            // Dibujar vectores
            this.renderer.drawVelocityVector(this.skatingObject);

            // Dibujar indicador de fricción
            this.drawFrictionIndicator();
        }

        // Renderizar efectos
        this.animations.renderEffects();
        this.animations.renderParticles();
    }

    /**
     * Dibujar indicador de fricción
     */
    drawFrictionIndicator() {
        const ctx = this.renderer.getContext();
        const x = 20;
        const y = this.surfaceLevel + 30;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x - 5, y - 15, 120, 20);

        ctx.fillStyle = 'white';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`Fricción: ${this.config.frictionCoefficient.toFixed(2)}`, x, y);
    }

    /**
     * Actualizar configuración
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);

        if (newConfig.surfaceType) {
            this.setupSurface();
        }

        if (newConfig.initialVelocity !== undefined && this.skatingObject) {
            this.skatingObject.velocity.x = newConfig.initialVelocity;
        }

        if (newConfig.objectMass !== undefined && this.skatingObject) {
            this.skatingObject.mass = newConfig.objectMass;
        }
    }

    /**
     * Obtener información del simulador
     */
    getInfo() {
        if (!this.skatingObject) return null;

        const speed = Math.sqrt(
            this.skatingObject.velocity.x ** 2 + this.skatingObject.velocity.y ** 2
        );

        const distance = Math.abs(this.skatingObject.position.x - 100);

        return {
            velocity: {
                x: this.skatingObject.velocity.x,
                y: this.skatingObject.velocity.y,
                magnitude: speed
            },
            friction: this.config.frictionCoefficient,
            distance: distance,
            surfaceType: this.config.surfaceType,
            isMoving: speed > 0.1
        };
    }

    /**
     * Obtener estadísticas de energía
     */
    getEnergyStats() {
        if (!this.skatingObject) return { kinetic: 0, potential: 0, total: 0 };

        const kinetic = this.physics.calculateKineticEnergy(this.skatingObject);
        const potential = this.physics.calculatePotentialEnergy(this.skatingObject, this.surfaceLevel);

        return {
            kinetic,
            potential,
            total: kinetic + potential
        };
    }

    /**
     * Crear ejemplo predefinido
     */
    createExample(exampleType) {
        const examples = {
            'ice-skating': {
                surfaceType: 'ice',
                initialVelocity: 15,
                frictionCoefficient: 0.01
            },
            'wood-sliding': {
                surfaceType: 'wood',
                initialVelocity: 12,
                frictionCoefficient: 0.2
            },
            'asphalt-stopping': {
                surfaceType: 'asphalt',
                initialVelocity: 8,
                frictionCoefficient: 0.7
            },
            'sand-dragging': {
                surfaceType: 'sand',
                initialVelocity: 5,
                frictionCoefficient: 0.9
            }
        };

        const example = examples[exampleType];
        if (example) {
            this.updateConfig(example);
            this.reset();
        }
    }

    /**
     * Destruir simulador
     */
    destroy() {
        this.stop();
        this.physics.clear();
        this.animations.stopAllAnimations();
    }
}
