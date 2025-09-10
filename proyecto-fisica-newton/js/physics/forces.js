/**
 * Sistema de Fuerzas
 * Maneja diferentes tipos de fuerzas en el simulador
 */

export class ForceSystem {
    constructor() {
        this.forces = new Map();
        this.gravity = 9.81; // m/s²
    }

    /**
     * Crear una fuerza
     */
    createForce(id, magnitude, direction, type = 'constant') {
        const force = {
            id,
            magnitude,
            direction: direction * Math.PI / 180, // Convertir a radianes
            type,
            active: true,
            duration: Infinity, // Duración infinita por defecto
            startTime: Date.now()
        };

        this.forces.set(id, force);
        return force;
    }

    /**
     * Calcular componentes de una fuerza
     */
    calculateForceComponents(force) {
        return {
            x: force.magnitude * Math.cos(force.direction),
            y: force.magnitude * Math.sin(force.direction)
        };
    }

    /**
     * Aplicar gravedad a un objeto
     */
    applyGravity(object) {
        return {
            x: 0,
            y: object.mass * this.gravity
        };
    }

    /**
     * Aplicar fricción a un objeto
     */
    applyFriction(object, coefficient) {
        const speed = Math.sqrt(object.velocity.x ** 2 + object.velocity.y ** 2);
        if (speed === 0) return { x: 0, y: 0 };

        const frictionMagnitude = coefficient * object.mass * this.gravity;
        const frictionX = -(object.velocity.x / speed) * frictionMagnitude;
        const frictionY = -(object.velocity.y / speed) * frictionMagnitude;

        return { x: frictionX, y: frictionY };
    }

    /**
     * Aplicar resistencia del aire
     */
    applyAirResistance(object, coefficient = 0.01) {
        const speed = Math.sqrt(object.velocity.x ** 2 + object.velocity.y ** 2);
        if (speed === 0) return { x: 0, y: 0 };

        const dragMagnitude = coefficient * speed * speed;
        const dragX = -(object.velocity.x / speed) * dragMagnitude;
        const dragY = -(object.velocity.y / speed) * dragMagnitude;

        return { x: dragX, y: dragY };
    }

    /**
     * Aplicar fuerza elástica (resorte)
     */
    applySpringForce(object, anchor, springConstant, restLength) {
        const dx = object.position.x - anchor.x;
        const dy = object.position.y - anchor.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return { x: 0, y: 0 };

        const displacement = distance - restLength;
        const forceMagnitude = -springConstant * displacement;

        return {
            x: (dx / distance) * forceMagnitude,
            y: (dy / distance) * forceMagnitude
        };
    }

    /**
     * Aplicar fuerza centrípeta
     */
    applyCentripetalForce(object, center, angularVelocity) {
        const dx = object.position.x - center.x;
        const dy = object.position.y - center.y;
        const radius = Math.sqrt(dx * dx + dy * dy);

        if (radius === 0) return { x: 0, y: 0 };

        const forceMagnitude = object.mass * radius * angularVelocity * angularVelocity;

        return {
            x: -(dx / radius) * forceMagnitude,
            y: -(dy / radius) * forceMagnitude
        };
    }

    /**
     * Calcular fuerza neta sobre un objeto
     */
    calculateNetForce(object, activeForces = []) {
        let netForce = { x: 0, y: 0 };

        // Aplicar gravedad
        const gravity = this.applyGravity(object);
        netForce.x += gravity.x;
        netForce.y += gravity.y;

        // Aplicar fuerzas activas
        activeForces.forEach(forceId => {
            const force = this.forces.get(forceId);
            if (force && force.active) {
                const components = this.calculateForceComponents(force);
                netForce.x += components.x;
                netForce.y += components.y;
            }
        });

        return netForce;
    }

    /**
     * Actualizar fuerzas temporales
     */
    updateTemporaryForces() {
        const currentTime = Date.now();

        this.forces.forEach((force, id) => {
            if (force.type === 'temporary' && force.duration !== Infinity) {
                const elapsed = currentTime - force.startTime;
                if (elapsed >= force.duration) {
                    force.active = false;
                }
            }
        });
    }

    /**
     * Obtener información de una fuerza
     */
    getForceInfo(forceId) {
        const force = this.forces.get(forceId);
        if (!force) return null;

        const components = this.calculateForceComponents(force);

        return {
            ...force,
            components,
            magnitude: force.magnitude,
            direction: force.direction * 180 / Math.PI // Convertir a grados
        };
    }

    /**
     * Desactivar una fuerza
     */
    deactivateForce(forceId) {
        const force = this.forces.get(forceId);
        if (force) {
            force.active = false;
        }
    }

    /**
     * Activar una fuerza
     */
    activateForce(forceId) {
        const force = this.forces.get(forceId);
        if (force) {
            force.active = true;
            force.startTime = Date.now();
        }
    }

    /**
     * Eliminar una fuerza
     */
    removeForce(forceId) {
        this.forces.delete(forceId);
    }

    /**
     * Limpiar todas las fuerzas
     */
    clear() {
        this.forces.clear();
    }

    /**
     * Obtener todas las fuerzas activas
     */
    getActiveForces() {
        return Array.from(this.forces.values()).filter(force => force.active);
    }
}
