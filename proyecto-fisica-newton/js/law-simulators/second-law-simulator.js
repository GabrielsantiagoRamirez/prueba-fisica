/**
 * Simulador de la Segunda Ley de Newton - F = ma
 * Demuestra la relación entre fuerza, masa y aceleración
 */

import { PhysicsEngine } from '../physics/newton-laws.js';
import { ForceSystem } from '../physics/forces.js';
import { MotionSystem } from '../physics/motion.js';
import { CanvasRenderer } from '../canvas/renderer.js';
import { AnimationSystem } from '../canvas/animations.js';

export class SecondLawSimulator {
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
            appliedForce: 20,
            objectMass: 1,
            forceDirection: 0, // grados
            objectRadius: 15
        };

        // Objetos del simulador
        this.object = null;
        this.forceApplicationPoint = null;
        this.currentForce = { x: 0, y: 0 };

        this.initialize();
    }

    /**
     * Inicializar simulador
     */
    initialize() {
        this.createObject();
        this.setupForceApplication();
        this.render();
    }

    /**
     * Crear objeto de prueba
     */
    createObject() {
        this.object = this.physics.createObject(
            'test-object',
            { x: 150, y: 200 },
            { x: 0, y: 0 },
            this.config.objectMass,
            this.config.objectRadius
        );

        this.object.color = '#10b981';
        this.object.type = 'box';
        this.object.label = 'Objeto';
    }

    /**
     * Configurar punto de aplicación de fuerza
     */
    setupForceApplication() {
        this.forceApplicationPoint = {
            x: this.object.position.x + 30,
            y: this.object.position.y
        };

        this.calculateForce();
    }

    /**
     * Calcular fuerza aplicada
     */
    calculateForce() {
        const angle = this.config.forceDirection * Math.PI / 180;
        this.currentForce = {
            x: this.config.appliedForce * Math.cos(angle),
            y: this.config.appliedForce * Math.sin(angle)
        };
    }

    /**
     * Iniciar simulación
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastTime = 0;
        this.animate();

        // Crear efecto de fuerza aplicada
        this.animations.createForceEffect(this.object, this.currentForce);
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
        this.createObject();
        this.setupForceApplication();
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
        if (!this.object) return;

        // Aplicar Segunda Ley de Newton: F = ma
        const acceleration = this.physics.applySecondLaw('test-object', this.currentForce);

        // Actualizar punto de aplicación de fuerza
        this.forceApplicationPoint.x = this.object.position.x + 30;
        this.forceApplicationPoint.y = this.object.position.y;

        // Añadir punto a la trayectoria
        this.renderer.addTrajectoryPoint(
            this.object.position.x,
            this.object.position.y
        );

        // Crear efecto de movimiento
        if (Math.random() < 0.05) {
            this.animations.createForceEffect(this.object, this.currentForce);
        }
    }

    /**
     * Renderizar escena
     */
    render() {
        this.renderer.clear();

        // Dibujar fondo con cuadrícula
        this.renderer.setRenderOptions({ showGrid: true });

        // Dibujar trayectoria
        this.renderer.drawTrajectory();

        // Dibujar objeto
        if (this.object) {
            this.renderer.drawObject(this.object);

            // Dibujar vectores
            this.renderer.drawForceVector(this.object, this.currentForce);
            this.renderer.drawVelocityVector(this.object);
            this.renderer.drawAccelerationVector(this.object);

            // Dibujar punto de aplicación de fuerza
            this.drawForceApplicationPoint();
        }

        // Renderizar efectos
        this.animations.renderEffects();
        this.animations.renderParticles();

        // Dibujar información de la ley
        this.drawLawInfo();
    }

    /**
     * Dibujar punto de aplicación de fuerza
     */
    drawForceApplicationPoint() {
        if (!this.forceApplicationPoint) return;

        const ctx = this.renderer.getContext();
        const x = this.forceApplicationPoint.x;
        const y = this.forceApplicationPoint.y;

        // Punto de aplicación
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Indicador de dirección
        const angle = this.config.forceDirection * Math.PI / 180;
        const arrowLength = 15;
        const arrowX = x + Math.cos(angle) * arrowLength;
        const arrowY = y + Math.sin(angle) * arrowLength;

        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(arrowX, arrowY);
        ctx.stroke();
    }

    /**
     * Dibujar información de la ley
     */
    drawLawInfo() {
        const ctx = this.renderer.getContext();
        const x = 20;
        const y = 30;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x - 10, y - 20, 200, 80);

        ctx.fillStyle = 'white';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'left';

        ctx.fillText('F = ma', x, y);
        ctx.fillText(`F = ${this.config.appliedForce} N`, x, y + 20);
        ctx.fillText(`m = ${this.config.objectMass} kg`, x, y + 40);

        if (this.object) {
            const acceleration = Math.sqrt(
                this.object.acceleration.x ** 2 + this.object.acceleration.y ** 2
            );
            ctx.fillText(`a = ${acceleration.toFixed(2)} m/s²`, x, y + 60);
        }
    }

    /**
     * Actualizar configuración
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);

        if (newConfig.appliedForce !== undefined || newConfig.forceDirection !== undefined) {
            this.calculateForce();
        }

        if (newConfig.objectMass !== undefined && this.object) {
            this.object.mass = newConfig.objectMass;
        }
    }

    /**
     * Obtener información del simulador
     */
    getInfo() {
        if (!this.object) return null;

        const speed = Math.sqrt(
            this.object.velocity.x ** 2 + this.object.velocity.y ** 2
        );

        const acceleration = Math.sqrt(
            this.object.acceleration.x ** 2 + this.object.acceleration.y ** 2
        );

        return {
            force: {
                x: this.currentForce.x,
                y: this.currentForce.y,
                magnitude: this.config.appliedForce
            },
            mass: this.object.mass,
            acceleration: {
                x: this.object.acceleration.x,
                y: this.object.acceleration.y,
                magnitude: acceleration
            },
            velocity: {
                x: this.object.velocity.x,
                y: this.object.velocity.y,
                magnitude: speed
            }
        };
    }

    /**
     * Obtener estadísticas de fuerza
     */
    getForceStats() {
        if (!this.object) return {
            forceMagnitude: 0,
            accelerationMagnitude: 0,
            velocityMagnitude: 0
        };

        const forceMagnitude = Math.sqrt(
            this.currentForce.x ** 2 + this.currentForce.y ** 2
        );

        const accelerationMagnitude = Math.sqrt(
            this.object.acceleration.x ** 2 + this.object.acceleration.y ** 2
        );

        const velocityMagnitude = Math.sqrt(
            this.object.velocity.x ** 2 + this.object.velocity.y ** 2
        );

        return {
            forceMagnitude,
            accelerationMagnitude,
            velocityMagnitude
        };
    }

    /**
     * Crear ejemplo predefinido
     */
    createExample(exampleType) {
        const examples = {
            'light-push': {
                appliedForce: 10,
                objectMass: 0.5,
                forceDirection: 0
            },
            'heavy-push': {
                appliedForce: 50,
                objectMass: 2,
                forceDirection: 0
            },
            'angled-force': {
                appliedForce: 30,
                objectMass: 1,
                forceDirection: 45
            },
            'upward-force': {
                appliedForce: 25,
                objectMass: 1,
                forceDirection: 90
            }
        };

        const example = examples[exampleType];
        if (example) {
            this.updateConfig(example);
            this.reset();
        }
    }

    /**
     * Aplicar fuerza temporal
     */
    applyTemporaryForce(force, duration = 1000) {
        const forceId = this.forces.createForce(
            'temp-force',
            force.magnitude,
            force.direction,
            'temporary'
        );

        this.forces.activateForce(forceId);

        setTimeout(() => {
            this.forces.deactivateForce(forceId);
        }, duration);
    }

    /**
     * Destruir simulador
     */
    destroy() {
        this.stop();
        this.physics.clear();
        this.forces.clear();
        this.animations.stopAllAnimations();
    }
}
