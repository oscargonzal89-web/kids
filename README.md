# 🧠 KIDS SuperApp

SuperApp KIDS — Plataforma personalizada para madres y padres primerizos con Nani 💬 como asistente central.

## 📋 Descripción

KIDS SuperApp es una plataforma diseñada para acompañar a madres y padres en el crecimiento de sus hijos, con **Nani** como asistente de IA personalizado que se integra con todos los módulos de la aplicación.

## 🎯 Características Principales

- **Nani IA**: Asistente conversacional central que personaliza contenido según el perfil del niño y la familia
- **Onboarding completo**: Configuración de perfiles de padre/madre, hijo y contexto del hogar
- **Home personalizado**: Dashboard con información relevante y accesos rápidos
- **Chat con Nani**: Interfaz conversacional para interactuar con el asistente de IA
- **Momentos KIDS**: Diario emocional para registrar momentos especiales
- **Explorar**: Marketplace, Comunidad y Directorio Médico en un solo lugar
- **Perfil**: Gestión de información del usuario

## 🛠️ Tecnologías

- **React 18** + **TypeScript**
- **Vite** como bundler
- **Tailwind CSS** para estilos
- **Lucide React** para iconos
- Componentes UI basados en shadcn/ui

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Preview de producción
npm run preview
```

## 📁 Estructura del Proyecto

```
kids/
├── src/
│   ├── components/
│   │   ├── ui/              # Componentes UI base (Button, Input, Card, etc.)
│   │   ├── SplashScreen.tsx
│   │   ├── OnboardingParent.tsx
│   │   ├── OnboardingChild.tsx
│   │   ├── OnboardingHome.tsx
│   │   ├── Home.tsx
│   │   ├── ChatWithNani.tsx
│   │   ├── MomentsKids.tsx
│   │   ├── Explore.tsx
│   │   ├── BottomNav.tsx
│   │   └── Profile.tsx
│   ├── styles/
│   │   └── globals.css      # Estilos globales con paleta pastel
│   ├── App.tsx              # Componente principal con routing
│   └── main.tsx             # Punto de entrada
├── PRD.md                   # Documento de requerimientos del producto
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── vite.config.ts
```

## 🎨 Paleta de Colores

La aplicación utiliza una paleta pastel según el PRD:

- **Cream**: `#FFF8E7` - Fondo principal
- **Pink**: `#FF9F9F` - Acentos principales
- **Lavender**: `#9B85FF` - Botones y elementos interactivos
- **Blue**: `#38BDF8` - Elementos informativos
- **Mint**: `#4FD1C7` - Acentos secundarios

## 🚀 Flujo de la Aplicación

1. **Splash Screen** → Pantalla de bienvenida con Nani
2. **Onboarding Parent** → Configuración del perfil del padre/madre
3. **Onboarding Child** → Configuración del perfil del hijo
4. **Onboarding Home** → Configuración del contexto del hogar
5. **Home** → Dashboard principal con atajos y saludo personalizado
6. **Chat con Nani** → Interfaz conversacional (futura integración con Gemini API)
7. **Momentos KIDS** → Diario emocional
8. **Explorar** → Marketplace, Comunidad y Directorio Médico
9. **Perfil** → Configuración del usuario

## 🔌 Integraciones Futuras

- **Firebase Auth**: Autenticación de usuarios
- **Firestore**: Base de datos para perfiles y datos
- **Gemini 2.5 API**: Motor conversacional de Nani
- **Firebase Functions**: Backend serverless
- **Firebase Storage**: Almacenamiento de imágenes y recuerdos

## 📝 Notas de Desarrollo

- Los componentes están diseñados siguiendo el PRD para el MVP
- La integración con Firebase y Gemini API está pendiente
- Los datos de ejemplo se reemplazarán con llamadas a Firestore
- El diseño es responsive y sigue las mejores prácticas de UX

## 👥 Equipo

Equipo Producto KIDS - Proyecto Diana

## 📄 Licencia

Proyecto privado - Todos los derechos reservados


