/**
 * Sistema de Renderizado Canvas
 * Maneja el dibujado de objetos físicos y vectores
 */

export class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        // Configuración de renderizado
        this.showVectors = true;
        this.showTrajectory = true;
        this.showGrid = false;
        this.trajectoryPoints = [];
        this.maxTrajectoryPoints = 1000;

        // Colores y estilos
        this.colors = {
            background: '#f8fafc',
            grid: '#e2e8f0',
            object: '#3b82f6',
            force: '#ef4444',
            velocity: '#10b981',
            acceleration: '#f59e0b',
            trajectory: '#6b7280',
            text: '#374151'
        };
    }

    /**
     * Limpiar canvas
     */
    clear() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Dibujar fondo
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Dibujar cuadrícula si está habilitada
        if (this.showGrid) {
            this.drawGrid();
        }
    }

    /**
     * Dibujar cuadrícula
     */
    drawGrid() {
        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;

        // Líneas verticales
        for (let x = 0; x <= this.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }

        // Líneas horizontales
        for (let y = 0; y <= this.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }

    /**
     * Dibujar objeto físico
     */
    drawObject(object) {
        const x = object.position.x;
        const y = object.position.y;
        const radius = object.radius;

        // Sombra
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;

        // Cuerpo del objeto
        this.ctx.beginPath();
        this.ctx.arc(x, y, radius, 0, Math.PI * 2);

        if (object.type === 'box') {
            this.ctx.rect(x - radius, y - radius, radius * 2, radius * 2);
        }

        // Gradiente
        const gradient = this.ctx.createRadialGradient(x - radius / 3, y - radius / 3, 0, x, y, radius);
        gradient.addColorStop(0, this.lightenColor(object.color, 0.3));
        gradient.addColorStop(1, object.color);

        this.ctx.fillStyle = gradient;
        this.ctx.fill();

        // Borde
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Resetear sombra
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // Dibujar etiqueta si existe
        if (object.label) {
            this.drawLabel(x, y + radius + 15, object.label);
        }
    }

    /**
     * Dibujar vector de fuerza
     */
    drawForceVector(object, force, color = this.colors.force) {
        if (!this.showVectors || (force.x === 0 && force.y === 0)) return;

        const x = object.position.x;
        const y = object.position.y;
        const scale = 0.1; // Escala para visualización
        const endX = x + force.x * scale;
        const endY = y + force.y * scale;

        this.drawVector(x, y, endX, endY, color, 'F');
    }

    /**
     * Dibujar vector de velocidad
     */
    drawVelocityVector(object, color = this.colors.velocity) {
        if (!this.showVectors || (object.velocity.x === 0 && object.velocity.y === 0)) return;

        const x = object.position.x;
        const y = object.position.y;
        const scale = 2; // Escala para visualización
        const endX = x + object.velocity.x * scale;
        const endY = y + object.velocity.y * scale;

        this.drawVector(x, y, endX, endY, color, 'v');
    }

    /**
     * Dibujar vector de aceleración
     */
    drawAccelerationVector(object, color = this.colors.acceleration) {
        if (!this.showVectors || (object.acceleration.x === 0 && object.acceleration.y === 0)) return;

        const x = object.position.x;
        const y = object.position.y;
        const scale = 5; // Escala para visualización
        const endX = x + object.acceleration.x * scale;
        const endY = y + object.acceleration.y * scale;

        this.drawVector(x, y, endX, endY, color, 'a');
    }

    /**
     * Dibujar vector genérico
     */
    drawVector(startX, startY, endX, endY, color, label = '') {
        const dx = endX - startX;
        const dy = endY - startY;
        const length = Math.sqrt(dx * dx + dy * dy);

        if (length === 0) return;

        const angle = Math.atan2(dy, dx);
        const arrowLength = Math.min(length * 0.2, 15);
        const arrowAngle = Math.PI / 6;

        // Línea principal
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(startX, startY);
        this.ctx.lineTo(endX, endY);
        this.ctx.stroke();

        // Punta de flecha
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(endX, endY);
        this.ctx.lineTo(
            endX - arrowLength * Math.cos(angle - arrowAngle),
            endY - arrowLength * Math.sin(angle - arrowAngle)
        );
        this.ctx.lineTo(
            endX - arrowLength * Math.cos(angle + arrowAngle),
            endY - arrowLength * Math.sin(angle + arrowAngle)
        );
        this.ctx.closePath();
        this.ctx.fill();

        // Etiqueta del vector
        if (label) {
            const labelX = startX + dx * 0.5;
            const labelY = startY + dy * 0.5 - 10;
            this.drawLabel(labelX, labelY, label, color);
        }
    }

    /**
     * Dibujar trayectoria
     */
    drawTrajectory() {
        if (!this.showTrajectory || this.trajectoryPoints.length < 2) return;

        this.ctx.strokeStyle = this.colors.trajectory;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();

        this.trajectoryPoints.forEach((point, index) => {
            if (index === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        });

        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    /**
     * Añadir punto a la trayectoria
     */
    addTrajectoryPoint(x, y) {
        this.trajectoryPoints.push({ x, y });

        if (this.trajectoryPoints.length > this.maxTrajectoryPoints) {
            this.trajectoryPoints.shift();
        }
    }

    /**
     * Limpiar trayectoria
     */
    clearTrajectory() {
        this.trajectoryPoints = [];
    }

    /**
     * Dibujar superficie
     */
    drawSurface(surfaceType, y = this.height - 20) {
        const surfaceColors = {
            ice: '#e0f2fe',
            wood: '#8d6e63',
            asphalt: '#424242',
            sand: '#ffcc80'
        };

        this.ctx.fillStyle = surfaceColors[surfaceType] || surfaceColors.ice;
        this.ctx.fillRect(0, y, this.width, this.height - y);

        // Textura de la superficie
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;

        for (let x = 0; x < this.width; x += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + 10, y + 5);
            this.ctx.stroke();
        }
    }

    /**
     * Dibujar zona de colisión
     */
    drawCollisionZone(objectA, objectB) {
        const centerX = (objectA.position.x + objectB.position.x) / 2;
        const centerY = (objectA.position.y + objectB.position.y) / 2;
        const radius = Math.max(objectA.radius, objectB.radius) * 2;

        this.ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    /**
     * Dibujar etiqueta de texto
     */
    drawLabel(x, y, text, color = this.colors.text) {
        this.ctx.fillStyle = color;
        this.ctx.font = '12px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Fondo de la etiqueta
        const textWidth = this.ctx.measureText(text).width;
        const padding = 4;

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillRect(
            x - textWidth / 2 - padding,
            y - 8,
            textWidth + padding * 2,
            16
        );

        // Texto
        this.ctx.fillStyle = color;
        this.ctx.fillText(text, x, y);
    }

    /**
     * Dibujar información de energía
     */
    drawEnergyBar(x, y, kinetic, potential, maxEnergy = 100) {
        const width = 200;
        const height = 20;
        const totalEnergy = kinetic + potential;

        // Fondo
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(x, y, width, height);

        // Energía cinética
        const kineticWidth = (kinetic / maxEnergy) * width;
        this.ctx.fillStyle = this.colors.velocity;
        this.ctx.fillRect(x, y, kineticWidth, height);

        // Energía potencial
        const potentialWidth = (potential / maxEnergy) * width;
        this.ctx.fillStyle = this.colors.force;
        this.ctx.fillRect(x + kineticWidth, y, potentialWidth, height);

        // Borde
        this.ctx.strokeStyle = this.colors.text;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height);

        // Etiquetas
        this.drawLabel(x + width / 2, y - 10, 'Energía', this.colors.text);
    }

    /**
     * Aclarar color
     */
    lightenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);

        return `rgb(${Math.min(255, Math.floor(r + (255 - r) * factor))}, 
                ${Math.min(255, Math.floor(g + (255 - g) * factor))}, 
                ${Math.min(255, Math.floor(b + (255 - b) * factor))})`;
    }

    /**
     * Configurar opciones de renderizado
     */
    setRenderOptions(options) {
        if (options.showVectors !== undefined) this.showVectors = options.showVectors;
        if (options.showTrajectory !== undefined) this.showTrajectory = options.showTrajectory;
        if (options.showGrid !== undefined) this.showGrid = options.showGrid;
        if (options.maxTrajectoryPoints !== undefined) this.maxTrajectoryPoints = options.maxTrajectoryPoints;
    }

    /**
     * Redimensionar canvas
     */
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
    }

    /**
     * Obtener contexto del canvas
     */
    getContext() {
        return this.ctx;
    }

    /**
     * Obtener dimensiones del canvas
     */
    getDimensions() {
        return { width: this.width, height: this.height };
    }
}
