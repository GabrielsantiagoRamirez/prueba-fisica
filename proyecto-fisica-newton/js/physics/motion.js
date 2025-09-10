/**
 * Sistema de Movimiento
 * Maneja la integración temporal y cálculos de movimiento
 */

export class MotionSystem {
    constructor() {
        this.timeStep = 1 / 60; // 60 FPS
        this.timeScale = 1.0; // Escala de tiempo
        this.isPaused = false;
        this.lastTime = 0;
        this.accumulator = 0;
    }

    /**
     * Integrar movimiento usando el método de Verlet
     */
    integrateMotion(object, netForce, deltaTime) {
        const dt = deltaTime * this.timeScale;

        // Calcular aceleración: a = F/m
        const acceleration = {
            x: netForce.x / object.mass,
            y: netForce.y / object.mass
        };

        // Almacenar posición anterior para Verlet
        const prevPosition = { ...object.position };

        // Actualizar posición: x = x + v*dt + 0.5*a*dt²
        object.position.x += object.velocity.x * dt + 0.5 * acceleration.x * dt * dt;
        object.position.y += object.velocity.y * dt + 0.5 * acceleration.y * dt * dt;

        // Actualizar velocidad: v = v + a*dt
        object.velocity.x += acceleration.x * dt;
        object.velocity.y += acceleration.y * dt;

        // Actualizar aceleración
        object.acceleration = acceleration;

        return {
            acceleration,
            displacement: {
                x: object.position.x - prevPosition.x,
                y: object.position.y - prevPosition.y
            }
        };
    }

    /**
     * Integrar movimiento usando el método de Euler
     */
    integrateEuler(object, netForce, deltaTime) {
        const dt = deltaTime * this.timeScale;

        // Calcular aceleración
        const acceleration = {
            x: netForce.x / object.mass,
            y: netForce.y / object.mass
        };

        // Actualizar velocidad
        object.velocity.x += acceleration.x * dt;
        object.velocity.y += acceleration.y * dt;

        // Actualizar posición
        object.position.x += object.velocity.x * dt;
        object.position.y += object.velocity.y * dt;

        // Actualizar aceleración
        object.acceleration = acceleration;

        return acceleration;
    }

    /**
     * Calcular velocidad instantánea
     */
    calculateInstantaneousVelocity(object, prevPosition, deltaTime) {
        return {
            x: (object.position.x - prevPosition.x) / deltaTime,
            y: (object.position.y - prevPosition.y) / deltaTime
        };
    }

    /**
     * Calcular aceleración instantánea
     */
    calculateInstantaneousAcceleration(object, prevVelocity, deltaTime) {
        return {
            x: (object.velocity.x - prevVelocity.x) / deltaTime,
            y: (object.velocity.y - prevVelocity.y) / deltaTime
        };
    }

    /**
     * Aplicar límites de velocidad
     */
    applyVelocityLimits(object, maxSpeed) {
        const speed = Math.sqrt(object.velocity.x ** 2 + object.velocity.y ** 2);

        if (speed > maxSpeed) {
            const scale = maxSpeed / speed;
            object.velocity.x *= scale;
            object.velocity.y *= scale;
        }
    }

    /**
     * Aplicar amortiguamiento
     */
    applyDamping(object, dampingFactor) {
        object.velocity.x *= dampingFactor;
        object.velocity.y *= dampingFactor;
    }

    /**
     * Detener objeto si la velocidad es muy pequeña
     */
    stopIfSlow(object, threshold = 0.01) {
        if (Math.abs(object.velocity.x) < threshold) {
            object.velocity.x = 0;
        }
        if (Math.abs(object.velocity.y) < threshold) {
            object.velocity.y = 0;
        }
    }

    /**
     * Calcular energía total del sistema
     */
    calculateSystemEnergy(objects, groundLevel = 400) {
        let totalKinetic = 0;
        let totalPotential = 0;

        objects.forEach(object => {
            const speed = Math.sqrt(object.velocity.x ** 2 + object.velocity.y ** 2);
            totalKinetic += 0.5 * object.mass * speed ** 2;

            const height = groundLevel - object.position.y;
            totalPotential += object.mass * 9.81 * height;
        });

        return {
            kinetic: totalKinetic,
            potential: totalPotential,
            total: totalKinetic + totalPotential
        };
    }

    /**
     * Calcular momentum total del sistema
     */
    calculateSystemMomentum(objects) {
        let totalMomentumX = 0;
        let totalMomentumY = 0;

        objects.forEach(object => {
            totalMomentumX += object.mass * object.velocity.x;
            totalMomentumY += object.mass * object.velocity.y;
        });

        return {
            x: totalMomentumX,
            y: totalMomentumY,
            magnitude: Math.sqrt(totalMomentumX ** 2 + totalMomentumY ** 2)
        };
    }

    /**
     * Actualizar sistema de tiempo
     */
    updateTime(currentTime) {
        if (this.isPaused) return 0;

        if (this.lastTime === 0) {
            this.lastTime = currentTime;
            return 0;
        }

        const deltaTime = (currentTime - this.lastTime) / 1000; // Convertir a segundos
        this.lastTime = currentTime;

        return Math.min(deltaTime, 0.1); // Limitar deltaTime para evitar saltos grandes
    }

    /**
     * Pausar simulación
     */
    pause() {
        this.isPaused = true;
    }

    /**
     * Reanudar simulación
     */
    resume() {
        this.isPaused = false;
        this.lastTime = 0; // Resetear tiempo para evitar saltos
    }

    /**
     * Establecer escala de tiempo
     */
    setTimeScale(scale) {
        this.timeScale = Math.max(0.1, Math.min(scale, 5.0)); // Limitar entre 0.1x y 5x
    }

    /**
     * Obtener información del sistema de tiempo
     */
    getTimeInfo() {
        return {
            timeStep: this.timeStep,
            timeScale: this.timeScale,
            isPaused: this.isPaused,
            fps: this.timeScale / this.timeStep
        };
    }

    /**
     * Interpolar posición para animaciones suaves
     */
    interpolatePosition(object, targetPosition, alpha = 0.1) {
        object.position.x += (targetPosition.x - object.position.x) * alpha;
        object.position.y += (targetPosition.y - object.position.y) * alpha;
    }

    /**
     * Interpolar velocidad para transiciones suaves
     */
    interpolateVelocity(object, targetVelocity, alpha = 0.1) {
        object.velocity.x += (targetVelocity.x - object.velocity.x) * alpha;
        object.velocity.y += (targetVelocity.y - object.velocity.y) * alpha;
    }

    /**
     * Calcular distancia entre dos objetos
     */
    calculateDistance(objectA, objectB) {
        const dx = objectB.position.x - objectA.position.x;
        const dy = objectB.position.y - objectA.position.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /**
     * Calcular ángulo entre dos vectores
     */
    calculateAngle(vectorA, vectorB) {
        const dot = vectorA.x * vectorB.x + vectorA.y * vectorB.y;
        const magA = Math.sqrt(vectorA.x ** 2 + vectorA.y ** 2);
        const magB = Math.sqrt(vectorB.x ** 2 + vectorB.y ** 2);

        if (magA === 0 || magB === 0) return 0;

        const cosAngle = dot / (magA * magB);
        return Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI;
    }

    /**
     * Normalizar vector
     */
    normalizeVector(vector) {
        const magnitude = Math.sqrt(vector.x ** 2 + vector.y ** 2);
        if (magnitude === 0) return { x: 0, y: 0 };

        return {
            x: vector.x / magnitude,
            y: vector.y / magnitude
        };
    }

    /**
     * Calcular producto escalar
     */
    dotProduct(vectorA, vectorB) {
        return vectorA.x * vectorB.x + vectorA.y * vectorB.y;
    }

    /**
     * Calcular producto vectorial (magnitud en 2D)
     */
    crossProduct(vectorA, vectorB) {
        return vectorA.x * vectorB.y - vectorA.y * vectorB.x;
    }
}
