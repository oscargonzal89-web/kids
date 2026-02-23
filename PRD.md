🧠 PRODUCT REQUIREMENTS DOCUMENT (PRD)
SuperApp KIDS — Arquitectura + Nani IA

Versión: 1.0 – Proyecto Diana
Entorno: Cursor / Firebase / Gemini
Autor: Equipo Producto KIDS
Fecha: Octubre 2025

🎯 1. Objetivo general

Desarrollar el MVP técnico de la SuperApp KIDS, una plataforma personalizada para madres y padres primerizos, con Nani 💬 como asistente central.
Nani debe:

Ser el núcleo de interacción entre usuario y ecosistema KIDS.

Personalizar contenido, tono y acciones según los datos del niñ@ y la familia.

Integrarse con los módulos: Home, Diario, Marketplace, Comunidad, Rutinas y Directorio Médico.

🧩 2. Contexto técnico

La app será construida en Firebase + React / Flutter, con Firestore como base de datos principal.

Gemini 2.5 / Vertex AI se usará para el modelo conversacional de Nani.

Figma AI + Cursor Copilot serán los entornos de diseño y desarrollo colaborativo.

Todos los datos de personalización deben almacenarse en estructuras claras y escalables, con énfasis en seguridad, anonimización y control parental.

🧱 3. Arquitectura funcional
3.1 Estructura general
KIDS SuperApp
│
├── NANI IA (núcleo)
│    ├── Contexto (childProfile, parentProfile, homeContext)
│    ├── Motor conversacional (Gemini)
│    └── Acciones (Firebase Functions)
│
├── Módulos
│    ├── Home personalizado
│    ├── Diario (Momentos KIDS)
│    ├── Explorar / Marketplace
│    ├── Rutinas y Agenda
│    ├── Comunidad
│    └── Directorio Médico
│
└── Infraestructura
     ├── Firebase Auth
     ├── Firestore DB
     ├── Cloud Functions
     ├── Storage (imágenes y recuerdos)
     └── APIs externas (Maps, Weather, Payments)

💬 4. Rol de Nani — Core IA
Funciones clave:
Categoría	Descripción	Ejemplo
Conversacional	Interactúa con el usuario como guía afectiva.	“{{parentProfile.name}}, noté que {{childProfile.name}} durmió poco. ¿Quieres tips de sueño?”
Operativa	Crea recordatorios, agendas y acciones Firebase.	“Recuérdame la vacuna del lunes.” → función calendarizada.
Predictiva	Sugiere contenido basado en edad, clima y hábitos.	“Hoy llueve ☔️, te recomiendo un cuento tranquilo.”
Conectora	Accede a datos de otros módulos y responde con contexto.	“Puedo mostrarte los pediatras recomendados cerca.”
🧠 5. Estructura de datos en Firestore
Colección: users
{
  "uid": "abc123",
  "name": "Laura Gómez",
  "email": "laura@gmail.com",
  "tone": "cercano",
  "created_at": "2025-10-20"
}

Subcolección: children
{
  "child_id": "sofi01",
  "name": "Sofi",
  "nickname": "Sofi",
  "birth_date": "2024-02-10",
  "age_months": 20,
  "city": "Bogotá",
  "favorites": { "color": "azul", "animal": "dinosaurio" },
  "routines": { "sleep": "20:00", "meals": "12:30" },
  "avatar": "sofi_avatar.png"
}

Subcolección: context
{
  "home_type": "apartamento",
  "climate": "lluvioso",
  "has_pets": true,
  "last_update": "2025-10-27"
}

⚙️ 6. Integraciones IA — Nani
Modelo base:

Gemini 2.5 Chat API

POST https://vertex.googleapis.com/v1beta/models/gemini-pro:generateContent
{
  "contents": [
    {
      "parts": [
        {"text": "Eres Nani, asistente cálida y personalizada. Usa el contexto:"},
        {"text": "ParentProfile: {{data.parentProfile}}"},
        {"text": "ChildProfile: {{data.childProfile}}"},
        {"text": "HomeContext: {{data.homeContext}}"},
        {"text": "UserQuery: {{input.text}}"}
      ]
    }
  ]
}

Reglas conversacionales

Nani no redirige, actúa directamente.

Si falta un dato, pregunta con empatía.

Si detecta intención → ejecuta acción (recordatorio, compra, sugerencia).

Respuestas limitadas a 250 tokens, tono cálido y humano.

📲 7. Módulos principales (MVP)


🩵 1. Splash / Bienvenida
Fondo crema. Logo KIDS grande.


Texto: “Hola, soy Nani 💬. Estoy aquí para acompañarte a ti y a tu hij@.”


Ilustración de nube sonriente (Nani).


Botón pastel “Comenzar”.



👩‍👧 2. Onboarding — Perfil del padre/madre
Campos: nombre, relación, correo,


Frase de Nani: “Encantada de conocerte 💙


Fondo suave, tonos rosa y lavanda.


Botón “Siguiente →”.



👶 3. Onboarding — Perfil del niñ@
Campos: nombre/apodo, fecha de nacimiento, color y animal favorito, ciudad.


Selector visual de color y animal.


Fondo azul cielo.


Frase de Nani: “¿Cómo te gusta que le diga a {{childProfile.name}}? ¿Por su nombre o apodo?”



🏡 4. Onboarding — Contexto del hogar
Campos:  mascotas, hora de dormir y comidas.


Fondo verde menta.


Frase de Nani: “¿A qué hora suele dormirse {{childProfile.name}}? Puedo ayudarte a crear su rutina.”


Botón “Finalizar configuración”.


🏠 5. Home personalizado
Saludo: “Buenos días, {{parentProfile.name}} ☀️”


Card principal: “Hoy {{childProfile.name}} es un niñ@ hermos@ en crecimiento”


Chat  “Hablar con Nani 💬”.: Mensaje cálido de saludo

Atajos a Diario, Agenda, Comunidad, Marketplace.




💬 6. Chat con Nani (núcleo central)
Layout estilo chat.


Burbujas suaves lavanda.


Avatar animado de Nani (nube con rostro amable).


Mensaje inicial:
Hola “{{parentProfile.name}}, Saludame a {{childProfile.name}} 💙 ¿En que te puedo ayudar?”


Chips de acción: “Ver planes”, “Tips de sueño”, “Marketplace”, “Agenda”.




📸 7. Momentos KIDS — Diario emocional
Línea de tiempo vertical con fotos, etiquetas automáticas y notas.


Ejemplo: “Primer paso 🦶”, “Nueva sonrisa 😊”


Fondo degradado rosa → lavanda.


Botón “Agregar recuerdo”.



🎠 8. Explorar / Marketplace / Comunidad
Vista con tres pestañas horizontales:


Explorar: planes locales por edad y clima.


Marketplace: productos recomendados por Nani (cubo sensorial, mordedera, ropa infantil).


Comunidad: foros activos sobre sueño, lactancia y alimentación.
Directorio médico / Especialistas: Buscador superior: “Buscar pediatra, psicólogo, terapeuta…”


Fondo azul y lavanda.


CTA: “Agendar con Nani”, “Ver foro completo”.






🎨 UI KIT PASTEL
Incluye:
Paleta: crema, rosa, lavanda, azul, menta.


Tipografía: Poppins Rounded / Nunito.


Componentes: botones redondeados (16px), cards flotantes con sombra suave, chips, inputs, avatar de Nani.


Iconografía: Lucide Outline.


Emojis sugeridos: 🌷💬🍼☀️🌙🦕🎈🩺



⚙️ Navegación
Splash → Onboarding 1 → 2 → 3 → Chat Nani → Home.


Desde Home → Diario, Explorar/Marketplace/Comunidad, Directorio Médico.



🧠 Estilo emocional
Usa ilustraciones flat 2D suaves (Headspace Kids, Spotify Kids).


Animaciones sutiles (fade-in, slide-up, respiración de Nani).


Tono visual maternal, moderno y limpio.


Nani siempre presente (como botón o asistente flotante).



✅ Instrucción final:
Genera los 9 frames con este flujo, aplica la paleta pastel, tipografía redondeada, íconos suaves, y crea un mini UI Kit emocional.
 La app debe sentirse como una guía confiable y cariñosa para madres y padres, con Nani como alma del diseño.


🔐 8. Seguridad y privacidad

Autenticación con Firebase Auth.

Control parental en todos los submódulos.

Datos del niño cifrados en tránsito y reposo.

Política de eliminación simple (borrado por usuario).

📊 9. Métricas de éxito
Métrica	Objetivo
Activación (perfil completo)	≥ 70%
Retención mensual	≥ 50%
Conversaciones útiles con Nani	≥ 80%
NPS de personalización	≥ 8.5 / 10
Engagement promedio (tiempo en app)	≥ 3 min diarios
🧩 10. Roadmap técnico
Fase	Entregable	Tecnología
Q4 2025	MVP: Onboarding + Nani básico + Chat integrado	Firebase + Gemini
Q1 2026	Diario + Marketplace + Rutinas	Flutter + Cloud Functions
Q2 2026	Comunidad + Directorio Médico + Aprendizaje IA	Firestore + Vertex Fine-tuning
💡 11. Filosofía de diseño (para Cursor)

Arquitectura modular: cada módulo = carpeta + componente.

Conversacional por defecto: Nani controla interacciones.

Personalización persistente: todo estado vive en Firestore.

UI emocional: componentes React con props pastel.

IA integrada al flujo, no como feature aparte.