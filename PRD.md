# 🧠 PRODUCT REQUIREMENTS DOCUMENT (PRD)
## SuperApp KIDS — Arquitectura + Nani IA

**Versión:** 2.0 — Proyecto Diana
**Stack real:** React + TypeScript + Vite / Supabase / Claude Haiku 4.5 / Vercel
**Autor:** Equipo Producto KIDS
**Fecha:** Agosto 2026 *(v1.0: Octubre 2025)*

> **Nota de la versión 2.0 — ítem C6 de `PRIORIZACION_NANI.md`**
>
> La v1.0 describía una arquitectura que **nunca se construyó**: Firebase +
> Firestore + Gemini + Flutter. Lo que existe y está desplegado es
> Supabase + Claude + React. Cualquiera que leyera la v1.0 —un socio, un
> desarrollador, tú mismo en un año— entendía mal el proyecto.
>
> En esta versión se reescribieron **solo las secciones técnicas** (2, 3, 5, 6,
> 8, 10, 11). La visión de producto, los módulos, el UI Kit, las métricas y la
> identidad de Nani se conservan con su texto original: siguen siendo válidos.
>
> Se añadió además la sección 0, que dice qué está construido y qué no. La v1.0
> describía todo como si fuera a existir, y hoy la mitad no existe.

---

## 📍 0. Estado de construcción (agosto 2026)

MVP técnico terminado y desplegado en https://kids-indol-psi.vercel.app
Sin usuarios validados. El diagnóstico completo está en `PRIORIZACION_NANI.md`.

| Módulo | Estado |
|---|---|
| Splash / Bienvenida | ✅ Construido |
| Onboarding (padre → niñ@ → hogar) | ✅ Construido |
| Home personalizado | ✅ Construido |
| **Chat con Nani + memoria persistente** | ✅ Construido — **el único diferenciador real** |
| Momentos KIDS (diario) | ✅ Construido |
| Explorar (planes) | ⚠️ Construido pero **el catálogo está vacío** (ítem B1) |
| Perfil | ✅ Construido |
| Marketplace | ❌ No construido |
| Rutinas / Agenda | ❌ No construido (ítem D1 — el mejor candidato) |
| Comunidad / foros | ❌ No construido (ítem D2) |
| Directorio Médico + "Agendar con Nani" | ❌ No construido (ítem D3) |
| Avatar animado y botón flotante de Nani | ❌ Diseñado, sin integrar (ítem D4) |
| Analítica de las métricas de la sección 9 | ❌ **No existe** (ítem B4) |

> **Principio rector vigente:** no construir funcionalidad nueva hasta saber si
> el chat con memoria le importa a alguien. Es lo único que no replica
> cualquiera. Agenda, Comunidad y Directorio Médico sí.

---

## 🎯 1. Objetivo general

Desarrollar el MVP técnico de la SuperApp KIDS, una plataforma personalizada para madres y padres primerizos, con Nani 💬 como asistente central.

Nani debe:

- Ser el núcleo de interacción entre usuario y ecosistema KIDS.
- Personalizar contenido, tono y acciones según los datos del niñ@ y la familia.
- Integrarse con los módulos: Home, Diario, Marketplace, Comunidad, Rutinas y Directorio Médico.

---

## 🧩 2. Contexto técnico

*Sección reescrita en v2.0. La v1.0 decía Firebase + Firestore + Gemini + Flutter.*

| Capa | Tecnología real |
|---|---|
| Frontend | React 18 + TypeScript + Vite + Tailwind CSS |
| Base de datos | Supabase (PostgreSQL gestionado) |
| Autenticación | Supabase Auth (correo + contraseña) |
| Seguridad de datos | Row Level Security (RLS) de PostgreSQL |
| Motor conversacional de Nani | **Claude Haiku 4.5** (`claude-haiku-4-5-20251001`) vía `@anthropic-ai/sdk` |
| Backend / API | Vercel Functions (`api/chat.ts`) |
| Hosting | Vercel |
| Diseño | Figma |

**Decisiones que conviene conocer:**

- **Por qué Haiku y no un modelo mayor.** Cada mensaje cuesta *dos* llamadas al
  modelo: una para la respuesta de Nani y otra para extraer hechos nuevos a
  memoria. Haiku mantiene ese doble costo despreciable. Modelar de nuevo al
  llegar a ~100 usuarios activos.
- **El prompt de Nani vive en un solo archivo:** `api/_nani-prompt.mjs`, que
  importan tanto producción como el servidor local. Cambiar su tono ahí lo
  cambia en los dos lados. Antes estaba duplicado (ítems A4 + C2).
- **El esquema está versionado** en `supabase/migrations/0001_initial_schema.sql`
  (ítem A1). Antes existía únicamente dentro de Supabase.
- **Sin secretos en el repo.** `.env*` está en `.gitignore`. La clave anónima de
  Supabase viaja al navegador por diseño: lo que protege los datos es el RLS,
  no el secreto de esa clave.

Todos los datos de personalización deben almacenarse en estructuras claras y escalables, con énfasis en seguridad, anonimización y control parental.

---

## 🧱 3. Arquitectura funcional

*Sección reescrita en v2.0.*

```
KIDS SuperApp
│
├── NANI IA (núcleo)
│    ├── Contexto (profiles, children, family_context)
│    ├── Memoria persistente (child_memory_facts, source='nani')
│    ├── Motor conversacional (Claude Haiku 4.5)
│    └── API (Vercel Function: api/chat.ts)
│
├── Módulos
│    ├── Home personalizado          ✅
│    ├── Diario (Momentos KIDS)      ✅
│    ├── Explorar                    ⚠️ sin catálogo
│    ├── Perfil                      ✅
│    ├── Rutinas y Agenda            ❌
│    ├── Comunidad                   ❌
│    └── Directorio Médico           ❌
│
└── Infraestructura
     ├── Supabase Auth
     ├── PostgreSQL + RLS
     ├── Vercel Functions
     └── Vercel Hosting
```

**Cómo fluye un mensaje del chat:**

```
Usuario escribe
   → Chat.tsx recoge contexto (perfil, hij@, hogar, memoria)
   → POST /api/chat
   → chatWithNani()  [api/_nani-prompt.mjs]
        ├── llamada 1 → respuesta de Nani
        └── llamada 2 → extracción de hechos nuevos
   → { reply, newFacts }
   → se guardan mensaje y hechos en Supabase
   → Nani recuerda en la siguiente sesión
```

Ese último paso —que Nani recuerde después de cerrar sesión— es **la prueba clave** que hay que validar con testers.

**No existe todavía:** almacenamiento de imágenes (los Momentos son solo texto),
integraciones externas (Maps, Weather, Payments) ni acciones ejecutables de Nani
(recordatorios, compras). Ver sección 4.

---

## 💬 4. Rol de Nani — Core IA

*Descripciones originales de v1.0. Se marcó qué función existe hoy.*

| Categoría | Descripción | Ejemplo | Estado |
|---|---|---|---|
| **Conversacional** | Interactúa con el usuario como guía afectiva. | "{{parentProfile.name}}, noté que {{childProfile.name}} durmió poco. ¿Quieres tips de sueño?" | ✅ Funciona |
| **Memoria** | Recuerda hechos concretos de la familia entre sesiones. | "Me contaste que a Antonia le da miedo la oscuridad." | ✅ Funciona *(no estaba en v1.0)* |
| **Operativa** | Crea recordatorios, agendas y acciones. | "Recuérdame la vacuna del lunes." → función calendarizada. | ❌ Requiere el módulo Agenda (D1) |
| **Predictiva** | Sugiere contenido basado en edad, clima y hábitos. | "Hoy llueve ☔️, te recomiendo un cuento tranquilo." | ❌ Requiere integrar clima (C4) |
| **Conectora** | Accede a datos de otros módulos y responde con contexto. | "Puedo mostrarte los pediatras recomendados cerca." | ❌ Requiere Directorio Médico (D3) |

**Identidad de Nani** — el texto vigente vive en `api/_nani-prompt.mjs`:

- Habla como una amiga cercana que sabe mucho de niños, no como una doctora ni una enciclopedia.
- Usa siempre el nombre del niñ@ y del padre/madre.
- Consejos cortos, concretos y accionables.
- Español latinoamericano, tono cercano y cariñoso. Emojis con moderación.
- Máximo 3–4 oraciones, salvo que el tema requiera más.

**Reglas conversacionales** *(originales de v1.0, vigentes)*:

- Nani no redirige, actúa directamente.
- Si falta un dato, pregunta con empatía.
- Si detecta intención → ejecuta acción (recordatorio, compra, sugerencia). *(pendiente: ver "Operativa" arriba)*
- Respuestas breves, tono cálido y humano.

**Barreras de seguridad clínica** *(no estaban en v1.0 y son obligatorias)*:

1. Nunca diagnostica enfermedades ni recomienda medicamentos.
2. Ante síntomas preocupantes deriva a pediatra o urgencias.
3. No contradice indicaciones de profesionales de salud.
4. Adapta el consejo a la edad del niñ@.

---

## 🧠 5. Estructura de datos (PostgreSQL / Supabase)

*Sección reescrita en v2.0. La v1.0 describía colecciones de Firestore.*

El esquema completo, con relaciones, índices y políticas RLS, está en
`supabase/migrations/0001_initial_schema.sql`.

**8 tablas.** No hay subcolecciones anidadas como en Firestore: son tablas
relacionales unidas por `user_id` y `child_id`.

| Tabla | Qué guarda |
|---|---|
| `profiles` | Padre/madre. 1:1 con `auth.users`. |
| `children` | Hijos. Un usuario puede tener varios. |
| `family_context` | Contexto del hogar. Una fila por usuario. |
| `explore_plans` | Catálogo global de planes. **Vacío** (B1). |
| `explore_plan_interactions` | Qué guardó u ocultó cada usuario. Sin consumidor (C3). |
| `chat_sessions` | Conversaciones con Nani. |
| `chat_messages` | Mensajes de cada conversación. |
| `child_memory_facts` | Memoria de Nani **+** Momentos. Sobrecargada (C1). |

```sql
-- profiles
id uuid PK → auth.users, name, email, relationship, tone, created_at

-- children
id uuid PK, user_id → auth.users, name, nickname, birthdate date,
avatar_url, favorites jsonb { color, animal }, created_at

-- family_context   (UNIQUE user_id)
id uuid PK, user_id → auth.users, home_type, city, climate,
pets jsonb[], sleep_time, meal_time, created_at

-- child_memory_facts
id uuid PK, user_id, child_id → children, key, value,
source, confidence, meta jsonb, created_at, updated_at
--   source='nani'   → hecho que Nani aprendió sola
--   key='moment'    → Momento escrito por el padre/madre
```

**Columnas fantasma** (existen, nada las usa — ítem C4): `profiles.tone`,
`children.avatar_url`, `family_context.climate`, `family_context.home_type`.

---

## ⚙️ 6. Integración IA — Nani

*Sección reescrita en v2.0. La v1.0 documentaba la API de Gemini/Vertex.*

**Modelo:** `claude-haiku-4-5-20251001` vía `@anthropic-ai/sdk`.
**Implementación:** `api/_nani-prompt.mjs`, importado por `api/chat.ts` (producción) y `api/dev-server.mjs` (local).

Cada mensaje del usuario dispara **dos** llamadas:

**1 — Respuesta de Nani** (`max_tokens: 500`, últimos 20 mensajes de historial). El contexto de la familia y la memoria se inyectan en el `system` prompt:

```
system: "Eres Nani, una asistente de crianza cálida, empática y práctica…

  Contexto de la familia:
  - Padre/madre: {parent.name} ({parent.relationship})
  - Niño/a: {child.nickname}, {edad calculada en meses}
  - Ciudad, color favorito, animal favorito, mascotas, horarios

  Cosas que ya sabes de esta familia (memoria de conversaciones anteriores):
  - miedo_oscuridad: le da miedo dormir sin luz
  …
  Reglas estrictas: 1. NUNCA diagnostiques…"
```

**2 — Extracción a memoria** (`max_tokens: 200`, últimos 4 mensajes). Devuelve JSON y recibe los hechos ya guardados para no duplicarlos:

```json
[{ "key": "rechazo_zanahoria", "value": "Desde el lunes escupe el puré de zanahoria" }]
```

Los hechos se guardan en `child_memory_facts` con `source='nani'` y
`confidence=0.9`, y se releen en cada sesión posterior. Ese ciclo es la memoria
persistente: el diferenciador del producto.

> **Deuda conocida:** la extracción a veces guarda hechos de poco valor o que
> caducan (p. ej. `edad_actual: 8 meses`, que ya está en el contexto y envejece
> mal). Afinar el prompt de extracción cuando haya feedback real.

---

## 📲 7. Módulos principales (MVP)

*Sección original de v1.0, sin cambios. Ver la sección 0 para el estado real de cada módulo.*

### 🩵 1. Splash / Bienvenida
Fondo crema. Logo KIDS grande.
Texto: "Hola, soy Nani 💬. Estoy aquí para acompañarte a ti y a tu hij@."
Ilustración de nube sonriente (Nani).
Botón pastel "Comenzar".

### 👩‍👧 2. Onboarding — Perfil del padre/madre
Campos: nombre, relación, correo.
Frase de Nani: "Encantada de conocerte 💙"
Fondo suave, tonos rosa y lavanda.
Botón "Siguiente →".

### 👶 3. Onboarding — Perfil del niñ@
Campos: nombre/apodo, fecha de nacimiento, color y animal favorito, ciudad.
Selector visual de color y animal.
Fondo azul cielo.
Frase de Nani: "¿Cómo te gusta que le diga a {{childProfile.name}}? ¿Por su nombre o apodo?"

### 🏡 4. Onboarding — Contexto del hogar
Campos: mascotas, hora de dormir y comidas.
Fondo verde menta.
Frase de Nani: "¿A qué hora suele dormirse {{childProfile.name}}? Puedo ayudarte a crear su rutina."
Botón "Finalizar configuración".

### 🏠 5. Home personalizado
Saludo: "Buenos días, {{parentProfile.name}} ☀️"
Card principal: "Hoy {{childProfile.name}} es un niñ@ hermos@ en crecimiento"
Chat "Hablar con Nani 💬": mensaje cálido de saludo.
Atajos a Diario, Agenda, Comunidad, Marketplace.

### 💬 6. Chat con Nani (núcleo central)
Layout estilo chat.
Burbujas suaves lavanda.
Avatar animado de Nani (nube con rostro amable).
Mensaje inicial: "Hola {{parentProfile.name}}, saludame a {{childProfile.name}} 💙 ¿En qué te puedo ayudar?"
Chips de acción: "Ver planes", "Tips de sueño", "Marketplace", "Agenda".

### 📸 7. Momentos KIDS — Diario emocional
Línea de tiempo vertical con fotos, etiquetas automáticas y notas.
Ejemplo: "Primer paso 🦶", "Nueva sonrisa 😊"
Fondo degradado rosa → lavanda.
Botón "Agregar recuerdo".

### 🎠 8. Explorar / Marketplace / Comunidad
Vista con tres pestañas horizontales:
- **Explorar:** planes locales por edad y clima.
- **Marketplace:** productos recomendados por Nani (cubo sensorial, mordedera, ropa infantil).
- **Comunidad:** foros activos sobre sueño, lactancia y alimentación.
- **Directorio médico / Especialistas:** buscador superior: "Buscar pediatra, psicólogo, terapeuta…"

Fondo azul y lavanda.
CTA: "Agendar con Nani", "Ver foro completo".

---

## 🎨 UI KIT PASTEL

*Sección original de v1.0, sin cambios.*

- **Paleta:** crema, rosa, lavanda, azul, menta.
- **Tipografía:** Poppins Rounded / Nunito.
- **Componentes:** botones redondeados (16px), cards flotantes con sombra suave, chips, inputs, avatar de Nani.
- **Iconografía:** Lucide Outline.
- **Emojis sugeridos:** 🌷💬🍼☀️🌙🦕🎈🩺

### ⚙️ Navegación
Splash → Onboarding 1 → 2 → 3 → Chat Nani → Home.
Desde Home → Diario, Explorar/Marketplace/Comunidad, Directorio Médico.

### 🧠 Estilo emocional
Usa ilustraciones flat 2D suaves (Headspace Kids, Spotify Kids).
Animaciones sutiles (fade-in, slide-up, respiración de Nani).
Tono visual maternal, moderno y limpio.
Nani siempre presente (como botón o asistente flotante).

> Los componentes del avatar animado y el botón flotante **ya están diseñados**
> y rescatados en `design/figma-nani/`. Falta integrarlos (ítem D4).

---

## 🔐 8. Seguridad y privacidad

*Sección reescrita en v2.0. La v1.0 decía Firebase Auth.*

- **Autenticación:** Supabase Auth (correo + contraseña).
- **Aislamiento de datos:** Row Level Security de PostgreSQL. Cada tabla exige
  `user_id = auth.uid()`, y las escrituras que involucran a un hijo verifican
  además que ese hijo pertenezca a quien hace la petición. Verificado: un
  usuario no puede leer ni escribir datos de otra familia.
- **Cifrado en tránsito y reposo:** lo provee Supabase.
- **Borrado en cascada:** al eliminar una cuenta de `auth.users` se borran
  perfil, hijos, conversaciones y memoria (`on delete cascade`).
- **Control parental:** pendiente de definir cuando existan submódulos que lo requieran.
- **Sin secretos en el repo:** `.env*` en `.gitignore`, nunca commiteados.

**Riesgo abierto:** las políticas RLS del archivo de migración se reconstruyeron
por inferencia, no se exportaron del dashboard. Conseguir la `service_role` key
y hacer diff antes de confiar en ese archivo como respaldo de seguridad.

---

## 📊 9. Métricas de éxito

*Sección original de v1.0, sin cambios.*

| Métrica | Objetivo |
|---|---|
| Activación (perfil completo) | ≥ 70% |
| Retención mensual | ≥ 50% |
| Conversaciones útiles con Nani | ≥ 80% |
| NPS de personalización | ≥ 8.5 / 10 |
| Engagement promedio (tiempo en app) | ≥ 3 min diarios |

> ⚠️ **Ninguna de estas métricas se captura hoy.** No hay instrumentación
> (ítem B4). Sin ella el feedback es anecdótico y estos objetivos son
> decorativos. Es la precondición para poder decidir la Fase 4 con datos.

---

## 🧩 10. Roadmap técnico

*Sección reescrita en v2.0: la v1.0 planeaba Firebase/Flutter/Vertex y fechas ya vencidas.*

| Fase | Entregable | Estado |
|---|---|---|
| Q4 2025 | MVP: Onboarding + Chat con Nani + memoria persistente | ✅ Hecho (Supabase + Claude, no Firebase + Gemini) |
| Q1 2026 | Momentos KIDS, Explorar, Perfil, tipos y RLS | ✅ Hecho |
| **Ago 2026** | **Blindar:** versionar esquema, unificar prompt, limpiar código muerto | ✅ Hecho |
| **Siguiente** | **Presentable:** sembrar catálogo, conectar filtros edad/ciudad, arreglar "ocultar" | ⏳ B1, B2, B3 |
| **Siguiente** | **Medir:** instrumentar 5 eventos; pasar a Supabase Pro antes de repartir cuentas | ⏳ B4, A2 |
| **Después** | **Decidir con feedback:** Agenda (D1) es el primer candidato — es el módulo más conectado a la memoria de Nani | 🔒 Bloqueado hasta tener feedback |
| Sin fecha | Marketplace, Comunidad, Directorio Médico | 🔒 Requieren masa crítica o alianzas |

El detalle de cada ítem está en `PRIORIZACION_NANI.md`.

---

## 💡 11. Filosofía de diseño

*Sección reescrita en v2.0 en su parte técnica.*

- **Arquitectura modular:** cada módulo = componente en `src/components/` + servicio en `src/services/`.
- **Conversacional por defecto:** Nani controla interacciones.
- **Personalización persistente:** el estado vive en PostgreSQL vía Supabase, protegido por RLS.
- **Una sola fuente para la voz de Nani:** su prompt está en `api/_nani-prompt.mjs` y nada más. Duplicarlo garantiza que las versiones divergan.
- **UI emocional:** componentes React con paleta pastel vía Tailwind.
- **IA integrada al flujo, no como feature aparte.**
- **No construir sin validar:** ningún módulo nuevo antes de saber si el chat con memoria le importa a alguien.
