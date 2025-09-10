/**
 * Sistema de Animaciones
 * Maneja efectos visuales y animaciones del simulador
 */

export class AnimationSystem {
    constructor(renderer) {
        this.renderer = renderer;
        this.animations = new Map();
        this.particles = [];
        this.effects = [];
        this.isRunning = false;
        this.animationId = null;
    }

    /**
     * Crear efecto de colisión
     */
    createCollisionEffect(x, y, intensity = 1) {
        const effect = {
            id: Date.now() + Math.random(),
            x,
            y,
            radius: 0,
            maxRadius: 30 * intensity,
            alpha: 1,
            color: '#ef4444',
            duration: 500,
            startTime: Date.now()
        };

        this.effects.push(effect);
        return effect.id;
    }

    /**
     * Crear partículas de explosión
     */
    createExplosionParticles(x, y, count = 10) {
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = 2 + Math.random() * 3;

            const particle = {
                id: Date.now() + Math.random(),
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1,
                decay: 0.02,
                size: 2 + Math.random() * 3,
                color: `hsl(${Math.random() * 60 + 15}, 70%, 50%)` // Colores cálidos
            };

            this.particles.push(particle);
        }
    }

    /**
     * Crear efecto de deslizamiento
     */
    createSlidingEffect(object, surfaceType) {
        const effect = {
            id: `sliding_${object.id}`,
            objectId: object.id,
            type: 'sliding',
            surfaceType,
            intensity: Math.sqrt(object.velocity.x ** 2 + object.velocity.y ** 2),
            startTime: Date.now()
        };

        this.effects.push(effect);
        return effect.id;
    }

    /**
     * Crear efecto de fuerza aplicada
     */
    createForceEffect(object, force) {
        const effect = {
            id: `force_${object.id}_${Date.now()}`,
            objectId: object.id,
            type: 'force',
            force: { ...force },
            duration: 300,
            startTime: Date.now()
        };

        this.effects.push(effect);
        return effect.id;
    }

    /**
     * Actualizar animaciones
     */
    update(deltaTime) {
        this.updateParticles(deltaTime);
        this.updateEffects(deltaTime);
        this.cleanup();
    }

    /**
     * Actualizar partículas
     */
    updateParticles(deltaTime) {
        this.particles.forEach(particle => {
            // Actualizar posición
            particle.x += particle.vx * deltaTime * 60;
            particle.y += particle.vy * deltaTime * 60;

            // Aplicar gravedad
            particle.vy += 0.1 * deltaTime * 60;

            // Reducir vida
            particle.life -= particle.decay * deltaTime * 60;
        });
    }

    /**
     * Actualizar efectos
     */
    updateEffects(deltaTime) {
        this.effects.forEach(effect => {
            const elapsed = Date.now() - effect.startTime;

            switch (effect.type) {
                case 'collision':
                    this.updateCollisionEffect(effect, elapsed);
                    break;
                case 'sliding':
                    this.updateSlidingEffect(effect, elapsed);
                    break;
                case 'force':
                    this.updateForceEffect(effect, elapsed);
                    break;
            }
        });
    }

    /**
     * Actualizar efecto de colisión
     */
    updateCollisionEffect(effect, elapsed) {
        const progress = elapsed / effect.duration;

        if (progress >= 1) {
            effect.alpha = 0;
            return;
        }

        effect.radius = effect.maxRadius * progress;
        effect.alpha = 1 - progress;
    }

    /**
     * Actualizar efecto de deslizamiento
     */
    updateSlidingEffect(effect, elapsed) {
        // El efecto de deslizamiento se mantiene mientras el objeto se mueve
        // Se actualiza en el renderizado
    }

    /**
     * Actualizar efecto de fuerza
     */
    updateForceEffect(effect, elapsed) {
        const progress = elapsed / effect.duration;

        if (progress >= 1) {
            effect.alpha = 0;
            return;
        }

        effect.alpha = 1 - progress;
    }

    /**
     * Renderizar partículas
     */
    renderParticles() {
        this.particles.forEach(particle => {
            if (particle.life <= 0) return;

            const ctx = this.renderer.getContext();
            ctx.save();
            ctx.globalAlpha = particle.life;
            ctx.fillStyle = particle.color;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    /**
     * Renderizar efectos
     */
    renderEffects() {
        this.effects.forEach(effect => {
            if (effect.alpha <= 0) return;

            const ctx = this.renderer.getContext();
            ctx.save();
            ctx.globalAlpha = effect.alpha;

            switch (effect.type) {
                case 'collision':
                    this.renderCollisionEffect(effect, ctx);
                    break;
                case 'sliding':
                    this.renderSlidingEffect(effect, ctx);
                    break;
                case 'force':
                    this.renderForceEffect(effect, ctx);
                    break;
            }

            ctx.restore();
        });
    }

    /**
     * Renderizar efecto de colisión
     */
    renderCollisionEffect(effect, ctx) {
        ctx.strokeStyle = effect.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
        ctx.stroke();
    }

    /**
     * Renderizar efecto de deslizamiento
     */
    renderSlidingEffect(effect, ctx) {
        // Crear partículas de deslizamiento
        if (Math.random() < 0.3) {
            const particle = {
                x: effect.x + (Math.random() - 0.5) * 20,
                y: effect.y + (Math.random() - 0.5) * 20,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                life: 0.5,
                decay: 0.05,
                size: 1 + Math.random() * 2,
                color: '#6b7280'
            };
            this.particles.push(particle);
        }
    }

    /**
     * Renderizar efecto de fuerza
     */
    renderForceEffect(effect, ctx) {
        // Dibujar ondas de fuerza
        const waveRadius = effect.radius || 20;
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(effect.x, effect.y, waveRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    /**
     * Limpiar animaciones completadas
     */
    cleanup() {
        // Limpiar partículas muertas
        this.particles = this.particles.filter(particle => particle.life > 0);

        // Limpiar efectos completados
        this.effects = this.effects.filter(effect => effect.alpha > 0);
    }

    /**
     * Crear animación de rebote
     */
    createBounceAnimation(object, intensity = 1) {
        const animation = {
            id: `bounce_${object.id}`,
            objectId: object.id,
            type: 'bounce',
            intensity,
            duration: 200,
            startTime: Date.now(),
            originalScale: 1,
            targetScale: 1 + intensity * 0.2
        };

        this.animations.set(animation.id, animation);
        return animation.id;
    }

    /**
     * Crear animación de pulso
     */
    createPulseAnimation(object, color = '#3b82f6') {
        const animation = {
            id: `pulse_${object.id}`,
            objectId: object.id,
            type: 'pulse',
            color,
            duration: 1000,
            startTime: Date.now(),
            phase: 0
        };

        this.animations.set(animation.id, animation);
        return animation.id;
    }

    /**
     * Crear animación de rotación
     */
    createRotationAnimation(object, angularVelocity = 0.1) {
        const animation = {
            id: `rotation_${object.id}`,
            objectId: object.id,
            type: 'rotation',
            angularVelocity,
            angle: 0,
            startTime: Date.now()
        };

        this.animations.set(animation.id, animation);
        return animation.id;
    }

    /**
     * Aplicar animación a objeto
     */
    applyAnimation(object, animationId) {
        const animation = this.animations.get(animationId);
        if (!animation) return;

        const elapsed = Date.now() - animation.startTime;
        const progress = elapsed / animation.duration;

        switch (animation.type) {
            case 'bounce':
                this.applyBounceAnimation(object, animation, progress);
                break;
            case 'pulse':
                this.applyPulseAnimation(object, animation, progress);
                break;
            case 'rotation':
                this.applyRotationAnimation(object, animation, elapsed);
                break;
        }
    }

    /**
     * Aplicar animación de rebote
     */
    applyBounceAnimation(object, animation, progress) {
        if (progress >= 1) {
            object.scale = animation.originalScale;
            this.animations.delete(animation.id);
            return;
        }

        const bounce = Math.sin(progress * Math.PI);
        object.scale = animation.originalScale + bounce * (animation.targetScale - animation.originalScale);
    }

    /**
     * Aplicar animación de pulso
     */
    applyPulseAnimation(object, animation, progress) {
        if (progress >= 1) {
            this.animations.delete(animation.id);
            return;
        }

        const pulse = Math.sin(progress * Math.PI * 2);
        object.pulseIntensity = Math.abs(pulse);
    }

    /**
     * Aplicar animación de rotación
     */
    applyRotationAnimation(object, animation, elapsed) {
        animation.angle += animation.angularVelocity * elapsed / 1000;
        object.rotation = animation.angle;
    }

    /**
     * Detener animación
     */
    stopAnimation(animationId) {
        this.animations.delete(animationId);
    }

    /**
     * Detener todas las animaciones
     */
    stopAllAnimations() {
        this.animations.clear();
        this.particles = [];
        this.effects = [];
    }

    /**
     * Obtener estadísticas de animaciones
     */
    getStats() {
        return {
            particles: this.particles.length,
            effects: this.effects.length,
            animations: this.animations.size
        };
    }
}
