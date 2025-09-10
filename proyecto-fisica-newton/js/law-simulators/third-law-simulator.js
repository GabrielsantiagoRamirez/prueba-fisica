/**
 * Simulador de la Tercera Ley de Newton - Acción y Reacción
 * Demuestra las fuerzas de acción y reacción en colisiones
 */

import { PhysicsEngine } from '../physics/newton-laws.js';
import { ForceSystem } from '../physics/forces.js';
import { MotionSystem } from '../physics/motion.js';
import { CanvasRenderer } from '../canvas/renderer.js';
import { AnimationSystem } from '../canvas/animations.js';

export class ThirdLawSimulator {
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
            objectAMass: 1,
            objectBMass: 2,
            collisionType: 'elastic',
            objectRadius: 20
        };

        // Objetos del simulador
        this.objectA = null;
        this.objectB = null;
        this.collisionOccurred = false;
        this.collisionForces = { forceA: { x: 0, y: 0 }, forceB: { x: 0, y: 0 } };

        this.initialize();
    }

    /**
     * Inicializar simulador
     */
    initialize() {
        this.createObjects();
        this.render();
    }

    /**
     * Crear objetos para colisión
     */
    createObjects() {
        // Objeto A (izquierda)
        this.objectA = this.physics.createObject(
            'object-a',
            { x: 200, y: 200 },
            { x: 5, y: 0 },
            this.config.objectAMass,
            this.config.objectRadius
        );

        this.objectA.color = '#f59e0b';
        this.objectA.type = 'ball';
        this.objectA.label = 'A';

        // Objeto B (derecha)
        this.objectB = this.physics.createObject(
            'object-b',
            { x: 500, y: 200 },
            { x: -3, y: 0 },
            this.config.objectBMass,
            this.config.objectRadius
        );

        this.objectB.color = '#8b5cf6';
        this.objectB.type = 'ball';
        this.objectB.label = 'B';
    }

    /**
     * Iniciar simulación
     */
    start() {
        if (this.isRunning) return;

        this.isRunning = true;
        this.lastTime = 0;
        this.collisionOccurred = false;
        this.animate();
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
        this.createObjects();
        this.collisionOccurred = false;
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
        if (!this.objectA || !this.objectB) return;

        // Verificar colisión
        if (this.physics.checkCollision('object-a', 'object-b') && !this.collisionOccurred) {
            this.handleCollision();
        }

        // Aplicar movimiento normal si no hay colisión
        if (!this.collisionOccurred) {
            this.physics.applyInertia('object-a', 0.01);
            this.physics.applyInertia('object-b', 0.01);
        }

        // Añadir puntos a la trayectoria
        this.renderer.addTrajectoryPoint(
            this.objectA.position.x,
            this.objectA.position.y
        );

        this.renderer.addTrajectoryPoint(
            this.objectB.position.x,
            this.objectB.position.y
        );
    }

    /**
     * Manejar colisión
     */
    handleCollision() {
        this.collisionOccurred = true;

        // Aplicar Tercera Ley de Newton
        const collisionResult = this.physics.applyThirdLaw(
            'object-a',
            'object-b',
            this.config.collisionType
        );

        if (collisionResult) {
            this.collisionForces = {
                forceA: collisionResult.forceA,
                forceB: collisionResult.forceB
            };

            // Crear efectos visuales
            this.animations.createCollisionEffect(
                (this.objectA.position.x + this.objectB.position.x) / 2,
                (this.objectA.position.y + this.objectB.position.y) / 2,
                2
            );

            this.animations.createExplosionParticles(
                (this.objectA.position.x + this.objectB.position.x) / 2,
                (this.objectA.position.y + this.objectB.position.y) / 2,
                15
            );
        }
    }

    /**
     * Renderizar escena
     */
    render() {
        this.renderer.clear();

        // Dibujar fondo
        this.renderer.setRenderOptions({ showGrid: true });

        // Dibujar trayectoria
        this.renderer.drawTrajectory();

        // Dibujar zona de colisión si los objetos están cerca
        if (this.objectA && this.objectB) {
            const distance = this.physics.calculateDistance(this.objectA, this.objectB);
            if (distance < 100) {
                this.renderer.drawCollisionZone(this.objectA, this.objectB);
            }
        }

        // Dibujar objetos
        if (this.objectA) {
            this.renderer.drawObject(this.objectA);
            this.renderer.drawVelocityVector(this.objectA);
        }

        if (this.objectB) {
            this.renderer.drawObject(this.objectB);
            this.renderer.drawVelocityVector(this.objectB);
        }

        // Dibujar fuerzas de acción y reacción si hay colisión
        if (this.collisionOccurred) {
            this.drawActionReactionForces();
        }

        // Renderizar efectos
        this.animations.renderEffects();
        this.animations.renderParticles();

        // Dibujar información de la ley
        this.drawLawInfo();
    }

    /**
     * Dibujar fuerzas de acción y reacción
     */
    drawActionReactionForces() {
        if (!this.objectA || !this.objectB) return;

        const ctx = this.renderer.getContext();

        // Fuerza de A sobre B (acción)
        const actionStartX = this.objectA.position.x;
        const actionStartY = this.objectA.position.y;
        const actionEndX = this.objectB.position.x;
        const actionEndY = this.objectB.position.y;

        this.renderer.drawVector(
            actionStartX, actionStartY,
            actionEndX, actionEndY,
            '#ef4444', 'F(A→B)'
        );

        // Fuerza de B sobre A (reacción)
        const reactionStartX = this.objectB.position.x;
        const reactionStartY = this.objectB.position.y;
        const reactionEndX = this.objectA.position.x;
        const reactionEndY = this.objectA.position.y;

        this.renderer.drawVector(
            reactionStartX, reactionStartY,
            reactionEndX, reactionEndY,
            '#8b5cf6', 'F(B→A)'
        );

        // Mostrar que son iguales y opuestas
        const midX = (actionStartX + actionEndX) / 2;
        const midY = (actionStartY + actionEndY) / 2;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(midX - 30, midY - 15, 60, 20);

        ctx.fillStyle = 'white';
        ctx.font = '12px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('F = -F', midX, midY + 5);
    }

    /**
     * Dibujar información de la ley
     */
    drawLawInfo() {
        const ctx = this.renderer.getContext();
        const x = 20;
        const y = 30;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(x - 10, y - 20, 250, 100);

        ctx.fillStyle = 'white';
        ctx.font = '14px Inter, sans-serif';
        ctx.textAlign = 'left';

        ctx.fillText('Tercera Ley: Acción y Reacción', x, y);
        ctx.fillText(`Tipo de colisión: ${this.config.collisionType}`, x, y + 20);

        if (this.objectA && this.objectB) {
            const momentumA = this.physics.calculateMomentum(this.objectA);
            const momentumB = this.physics.calculateMomentum(this.objectB);
            const totalMomentum = momentumA + momentumB;

            ctx.fillText(`Momentum A: ${momentumA.toFixed(1)} kg⋅m/s`, x, y + 40);
            ctx.fillText(`Momentum B: ${momentumB.toFixed(1)} kg⋅m/s`, x, y + 60);
            ctx.fillText(`Total: ${totalMomentum.toFixed(1)} kg⋅m/s`, x, y + 80);
        }
    }

    /**
     * Actualizar configuración
     */
    updateConfig(newConfig) {
        Object.assign(this.config, newConfig);

        if (this.objectA && newConfig.objectAMass !== undefined) {
            this.objectA.mass = newConfig.objectAMass;
        }

        if (this.objectB && newConfig.objectBMass !== undefined) {
            this.objectB.mass = newConfig.objectBMass;
        }
    }

    /**
     * Obtener información del simulador
     */
    getInfo() {
        if (!this.objectA || !this.objectB) return null;

        const momentumA = this.physics.calculateMomentum(this.objectA);
        const momentumB = this.physics.calculateMomentum(this.objectB);
        const totalMomentum = momentumA + momentumB;

        return {
            forceAB: this.collisionForces.forceA,
            forceBA: this.collisionForces.forceB,
            momentum: totalMomentum,
            momentumA,
            momentumB,
            collisionOccurred: this.collisionOccurred,
            collisionType: this.config.collisionType
        };
    }

    /**
     * Obtener estadísticas de momentum
     */
    getMomentumStats() {
        if (!this.objectA || !this.objectB) return {
            momentumA: 0,
            momentumB: 0,
            totalMomentum: 0
        };

        const momentumA = this.physics.calculateMomentum(this.objectA);
        const momentumB = this.physics.calculateMomentum(this.objectB);
        const totalMomentum = momentumA + momentumB;

        return {
            momentumA,
            momentumB,
            totalMomentum
        };
    }

    /**
     * Crear ejemplo predefinido
     */
    createExample(exampleType) {
        const examples = {
            'elastic-collision': {
                objectAMass: 1,
                objectBMass: 1,
                collisionType: 'elastic'
            },
            'inelastic-collision': {
                objectAMass: 2,
                objectBMass: 1,
                collisionType: 'inelastic'
            },
            'heavy-light': {
                objectAMass: 5,
                objectBMass: 1,
                collisionType: 'elastic'
            },
            'perfectly-inelastic': {
                objectAMass: 1,
                objectBMass: 2,
                collisionType: 'perfectly-inelastic'
            }
        };

        const example = examples[exampleType];
        if (example) {
            this.updateConfig(example);
            this.reset();
        }
    }

    /**
     * Simular colisión manual
     */
    simulateCollision() {
        if (this.collisionOccurred) return;

        // Mover objetos para que colisionen
        if (this.objectA && this.objectB) {
            this.objectA.position.x = this.objectB.position.x - 50;
            this.objectA.velocity.x = 10;
            this.objectB.velocity.x = -5;
        }
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
