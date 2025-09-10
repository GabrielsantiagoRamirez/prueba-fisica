/**
 * Motor de Física - Las 3 Leyes de Newton
 * Implementa las ecuaciones fundamentales de la mecánica clásica
 */

export class PhysicsEngine {
    constructor() {
        this.gravity = 9.81; // m/s²
        this.drag = 0.01; // Coeficiente de resistencia del aire
        this.timeStep = 1 / 60; // 60 FPS
        this.isRunning = false;
        this.objects = new Map();
        this.forces = new Map();
    }

    /**
     * Primera Ley de Newton - Ley de Inercia
     * Un objeto en reposo permanece en reposo, y un objeto en movimiento
     * permanece en movimiento a velocidad constante, a menos que actúe sobre él una fuerza neta.
     */
    applyInertia(objectId, friction = 0) {
        const object = this.objects.get(objectId);
        if (!object) return;

        // Aplicar fricción (fuerza opuesta al movimiento)
        const frictionForce = {
            x: -object.velocity.x * friction * object.mass,
            y: -object.velocity.y * friction * object.mass
        };

        // Actualizar velocidad con fricción
        object.velocity.x += frictionForce.x / object.mass * this.timeStep;
        object.velocity.y += frictionForce.y / object.mass * this.timeStep;

        // Detener el objeto si la velocidad es muy pequeña
        if (Math.abs(object.velocity.x) < 0.01) object.velocity.x = 0;
        if (Math.abs(object.velocity.y) < 0.01) object.velocity.y = 0;

        // Actualizar posición
        object.position.x += object.velocity.x * this.timeStep;
        object.position.y += object.velocity.y * this.timeStep;

        // Aplicar límites del canvas
        this.applyBoundaries(object);
    }

    /**
     * Segunda Ley de Newton - F = ma
     * La aceleración de un objeto es directamente proporcional a la fuerza neta aplicada
     * e inversamente proporcional a su masa.
     */
    applySecondLaw(objectId, force) {
        const object = this.objects.get(objectId);
        if (!object) return;

        // Calcular aceleración: a = F/m
        const acceleration = {
            x: force.x / object.mass,
            y: force.y / object.mass
        };

        // Actualizar velocidad: v = v₀ + at
        object.velocity.x += acceleration.x * this.timeStep;
        object.velocity.y += acceleration.y * this.timeStep;

        // Actualizar posición: x = x₀ + vt
        object.position.x += object.velocity.x * this.timeStep;
        object.position.y += object.velocity.y * this.timeStep;

        // Aplicar límites del canvas
        this.applyBoundaries(object);

        return acceleration;
    }

    /**
     * Tercera Ley de Newton - Acción y Reacción
     * Para cada acción, hay una reacción igual y opuesta.
     */
    applyThirdLaw(objectAId, objectBId, collisionType = 'elastic') {
        const objectA = this.objects.get(objectAId);
        const objectB = this.objects.get(objectBId);

        if (!objectA || !objectB) return;

        // Calcular vector de separación
        const dx = objectB.position.x - objectA.position.x;
        const dy = objectB.position.y - objectA.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return;

        // Normalizar vector de separación
        const nx = dx / distance;
        const ny = dy / distance;

        // Calcular velocidad relativa
        const relativeVelocityX = objectB.velocity.x - objectA.velocity.x;
        const relativeVelocityY = objectB.velocity.y - objectA.velocity.y;
        const relativeSpeed = relativeVelocityX * nx + relativeVelocityY * ny;

        // No procesar colisión si los objetos se están separando
        if (relativeSpeed > 0) return;

        // Calcular coeficiente de restitución según el tipo de colisión
        let restitution = 1.0; // Elástica
        if (collisionType === 'inelastic') {
            restitution = 0.5;
        } else if (collisionType === 'perfectly-inelastic') {
            restitution = 0.0;
        }

        // Calcular impulso
        const impulse = -(1 + restitution) * relativeSpeed /
            (1 / objectA.mass + 1 / objectB.mass);

        // Aplicar fuerzas de acción y reacción
        const impulseA = {
            x: impulse * nx,
            y: impulse * ny
        };

        const impulseB = {
            x: -impulse * nx,
            y: -impulse * ny
        };

        // Actualizar velocidades
        objectA.velocity.x += impulseA.x / objectA.mass;
        objectA.velocity.y += impulseA.y / objectA.mass;
        objectB.velocity.x += impulseB.x / objectB.mass;
        objectB.velocity.y += impulseB.y / objectB.mass;

        // Separar objetos si están superpuestos
        const overlap = (objectA.radius + objectB.radius) - distance;
        if (overlap > 0) {
            const separationX = nx * overlap * 0.5;
            const separationY = ny * overlap * 0.5;

            objectA.position.x -= separationX;
            objectA.position.y -= separationY;
            objectB.position.x += separationX;
            objectB.position.y += separationY;
        }

        return {
            forceA: impulseA,
            forceB: impulseB,
            momentum: this.calculateMomentum(objectA) + this.calculateMomentum(objectB)
        };
    }

    /**
     * Crear un objeto físico
     */
    createObject(id, position, velocity = { x: 0, y: 0 }, mass = 1, radius = 10) {
        const object = {
            id,
            position: { ...position },
            velocity: { ...velocity },
            acceleration: { x: 0, y: 0 },
            mass,
            radius,
            color: '#3b82f6',
            type: 'ball'
        };

        this.objects.set(id, object);
        return object;
    }

    /**
     * Aplicar una fuerza a un objeto
     */
    applyForce(objectId, force) {
        const object = this.objects.get(objectId);
        if (!object) return;

        // Calcular aceleración
        const acceleration = {
            x: force.x / object.mass,
            y: force.y / object.mass
        };

        // Actualizar aceleración del objeto
        object.acceleration.x = acceleration.x;
        object.acceleration.y = acceleration.y;

        return acceleration;
    }

    /**
     * Calcular momentum de un objeto
     */
    calculateMomentum(object) {
        const speed = Math.sqrt(object.velocity.x ** 2 + object.velocity.y ** 2);
        return object.mass * speed;
    }

    /**
     * Calcular energía cinética
     */
    calculateKineticEnergy(object) {
        const speed = Math.sqrt(object.velocity.x ** 2 + object.velocity.y ** 2);
        return 0.5 * object.mass * speed ** 2;
    }

    /**
     * Calcular energía potencial gravitacional
     */
    calculatePotentialEnergy(object, groundLevel = 400) {
        const height = groundLevel - object.position.y;
        return object.mass * this.gravity * height;
    }

    /**
     * Aplicar límites del canvas
     */
    applyBoundaries(object, canvasWidth = 800, canvasHeight = 400) {
        // Límites horizontales
        if (object.position.x - object.radius < 0) {
            object.position.x = object.radius;
            object.velocity.x = -object.velocity.x * 0.8; // Rebote con pérdida de energía
        }
        if (object.position.x + object.radius > canvasWidth) {
            object.position.x = canvasWidth - object.radius;
            object.velocity.x = -object.velocity.x * 0.8;
        }

        // Límites verticales
        if (object.position.y - object.radius < 0) {
            object.position.y = object.radius;
            object.velocity.y = -object.velocity.y * 0.8;
        }
        if (object.position.y + object.radius > canvasHeight) {
            object.position.y = canvasHeight - object.radius;
            object.velocity.y = -object.velocity.y * 0.8;
        }
    }

    /**
     * Detectar colisión entre dos objetos
     */
    checkCollision(objectAId, objectBId) {
        const objectA = this.objects.get(objectAId);
        const objectB = this.objects.get(objectBId);

        if (!objectA || !objectB) return false;

        const dx = objectB.position.x - objectA.position.x;
        const dy = objectB.position.y - objectA.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        return distance < (objectA.radius + objectB.radius);
    }

    /**
     * Obtener información de un objeto
     */
    getObjectInfo(objectId) {
        const object = this.objects.get(objectId);
        if (!object) return null;

        const speed = Math.sqrt(object.velocity.x ** 2 + object.velocity.y ** 2);
        const momentum = this.calculateMomentum(object);
        const kineticEnergy = this.calculateKineticEnergy(object);

        return {
            position: { ...object.position },
            velocity: { ...object.velocity },
            acceleration: { ...object.acceleration },
            speed,
            momentum,
            kineticEnergy,
            mass: object.mass
        };
    }

    /**
     * Resetear un objeto a su estado inicial
     */
    resetObject(objectId, initialPosition, initialVelocity = { x: 0, y: 0 }) {
        const object = this.objects.get(objectId);
        if (!object) return;

        object.position = { ...initialPosition };
        object.velocity = { ...initialVelocity };
        object.acceleration = { x: 0, y: 0 };
    }

    /**
     * Limpiar todos los objetos
     */
    clear() {
        this.objects.clear();
        this.forces.clear();
    }

    /**
     * Obtener todos los objetos
     */
    getAllObjects() {
        return Array.from(this.objects.values());
    }
}
