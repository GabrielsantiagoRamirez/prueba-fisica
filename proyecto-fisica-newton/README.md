# Simulador de las 3 Leyes de Newton

Un simulador interactivo y educativo que demuestra las tres leyes fundamentales de Newton a través de animaciones en tiempo real y controles interactivos.

## 🚀 Características

### Primera Ley de Newton - Ley de Inercia
- **Simulador de deslizamiento** con diferentes superficies (hielo, madera, asfalto, arena)
- **Control de fricción** en tiempo real
- **Visualización de trayectoria** y efectos de partículas
- **Diferentes coeficientes de fricción** para cada superficie

### Segunda Ley de Newton - F = ma
- **Aplicación de fuerzas** con magnitud y dirección controlables
- **Variación de masa** del objeto
- **Vectores de fuerza, velocidad y aceleración** en tiempo real
- **Cálculos automáticos** de aceleración basados en F = ma

### Tercera Ley de Newton - Acción y Reacción
- **Simulador de colisiones** entre dos objetos
- **Diferentes tipos de colisión** (elástica, inelástica, perfectamente inelástica)
- **Visualización de fuerzas de acción y reacción**
- **Conservación del momentum** del sistema

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Diseño moderno y responsive
- **JavaScript ES6+** - Lógica de simulación y interactividad
- **Canvas API** - Renderizado de gráficos y animaciones
- **Arquitectura Modular** - Código organizado y mantenible

## 📁 Estructura del Proyecto

```
proyecto-fisica-newton/
├── index.html              # Página principal
├── css/
│   ├── styles.css          # Estilos principales
│   ├── components.css      # Estilos de componentes
│   └── laws.css           # Estilos específicos por ley
├── js/
│   ├── main.js            # Lógica principal de la aplicación
│   ├── physics/
│   │   ├── newton-laws.js  # Motor de física - 3 leyes de Newton
│   │   ├── forces.js       # Sistema de fuerzas
│   │   └── motion.js       # Sistema de movimiento
│   ├── canvas/
│   │   ├── renderer.js     # Sistema de renderizado Canvas
│   │   └── animations.js   # Sistema de animaciones
│   ├── ui/
│   │   ├── controls.js     # Controles de interfaz
│   │   └── panels.js       # Paneles de información
│   └── law-simulators/
│       ├── first-law-simulator.js   # Simulador Primera Ley
│       ├── second-law-simulator.js  # Simulador Segunda Ley
│       └── third-law-simulator.js   # Simulador Tercera Ley
└── assets/
    └── images/             # Recursos visuales
```

## 🎮 Controles y Navegación

### Navegación
- **Pestañas** - Cambiar entre las 3 leyes
- **Teclas 1, 2, 3** - Acceso rápido a cada ley
- **Espacio** - Pausar/reanudar simulación
- **R** - Resetear simulación actual

### Primera Ley
- **Velocidad Inicial** - Control deslizante (0-20 m/s)
- **Coeficiente de Fricción** - Control deslizante (0-1)
- **Tipo de Superficie** - Selector con valores predefinidos
- **Ejemplos** - Patinaje en hielo, deslizamiento en madera, etc.

### Segunda Ley
- **Fuerza Aplicada** - Control deslizante (0-100 N)
- **Masa del Objeto** - Control deslizante (0.1-10 kg)
- **Dirección de Fuerza** - Control deslizante (0-360°)
- **Ejemplos** - Empuje ligero, empuje fuerte, fuerza angulada

### Tercera Ley
- **Masa Objeto A** - Control deslizante (0.1-5 kg)
- **Masa Objeto B** - Control deslizante (0.1-5 kg)
- **Tipo de Colisión** - Selector (elástica, inelástica, perfectamente inelástica)
- **Ejemplos** - Diferentes tipos de colisiones

## 🔬 Física Implementada

### Ecuaciones Físicas
- **Primera Ley**: `v = v₀ - μgt` (con fricción)
- **Segunda Ley**: `F = ma` y `a = F/m`
- **Tercera Ley**: `F₁₂ = -F₂₁` (fuerzas de acción-reacción)

### Características Físicas
- **Gravedad**: 9.81 m/s²
- **Fricción**: Coeficientes realistas por superficie
- **Colisiones**: Conservación de momentum y energía
- **Vectores**: Visualización de fuerzas, velocidades y aceleraciones

## 🎨 Características Visuales

- **Diseño Moderno** - Interfaz limpia y profesional
- **Animaciones Suaves** - Transiciones fluidas y efectos visuales
- **Responsive** - Adaptable a diferentes tamaños de pantalla
- **Efectos de Partículas** - Colisiones, deslizamiento, explosiones
- **Gráficos en Tiempo Real** - Barras de energía, momentum, fuerzas

## 🚀 Instalación y Uso

1. **Clonar o descargar** el proyecto
2. **Abrir** `index.html` en un navegador web moderno
3. **Navegar** entre las pestañas para explorar cada ley
4. **Ajustar controles** para experimentar con diferentes parámetros
5. **Presionar "Iniciar"** para comenzar la simulación

## 📱 Compatibilidad

- **Navegadores**: Chrome, Firefox, Safari, Edge (versiones modernas)
- **Dispositivos**: Escritorio, tablet, móvil
- **Resoluciones**: 320px - 1920px+ (responsive)

## 🎓 Uso Educativo

Este simulador es ideal para:
- **Estudiantes de física** - Visualizar conceptos abstractos
- **Profesores** - Demostrar las leyes de Newton en clase
- **Autodidactas** - Aprender física de manera interactiva
- **Desarrolladores** - Ejemplo de simulación física en JavaScript

## 🔧 Personalización

El código está estructurado modularmente para facilitar:
- **Añadir nuevas leyes** de física
- **Modificar parámetros** físicos
- **Crear nuevos ejemplos** y escenarios
- **Extender funcionalidades** de visualización

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso educativo y personal.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📞 Contacto

Para preguntas o sugerencias sobre este simulador, por favor abre un issue en el repositorio.

---

**¡Disfruta explorando las maravillas de la física con este simulador interactivo!** 🚀⚡🔬
