# Task: Conectar front con todo el back de Supabase

Documento de tareas para conectar la app KIDS (frontend React) con todas las tablas y flujos del backend en Supabase.

**Protocolo:** Seguir las reglas de `process_task.md`: una sub-tarea a la vez, pedir confirmación al usuario antes de continuar, marcar `[x]` al completar, commit cuando todos los sub-tasks de un padre estén listos.

**Después de cada push:** Actualizar siempre este archivo: marcar tareas completadas, mantener "Relevant Files" y el "Resumen de estado" al día.

---

## 1. Auth y cliente Supabase

- [x] **1.1** Cliente Supabase en el front con `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
- [x] **1.2** Servicio de auth: `signUp`, `signIn`, `signOut` usando Supabase Auth
- [x] **1.3** Pantalla AuthGate (login/registro) que llama al servicio y dispara `onAuthed`
- [x] **1.4** Cerrar sesión real: llamar `signOut()` de Supabase en logout y volver a AuthGate

---

## 2. Perfil (tabla `profiles`)

- [x] **2.1** Servicio `profile.service.ts`: `getProfile()`, `upsertProfile()` con `auth.getUser()`
- [x] **2.2** Persistir en onboarding padre: nombre, email, relación (`relationship`) en `profiles`
- [x] **2.3** Al iniciar sesión, cargar perfil y rellenar estado; si existe perfil, saltar a la pantalla correcta (onboarding hijo, hogar o home)
- [x] **2.4** Columna `relationship` en BD (migración) y mapeo en front

---

## 3. Hijos (tabla `children`)

- [x] **3.1** Servicio `children.service.ts`: `getChildren()`, `insertChild()` con `user_id` del usuario autenticado
- [x] **3.2** Persistir en onboarding hijo: nombre, apodo, fecha nacimiento, favoritos (color/animal) en `children`; ciudad se guarda en `family_context`
- [x] **3.3** Al cargar sesión, rellenar `userData.child` desde `children` (y ciudad desde `family_context`)

---

## 4. Contexto familiar (tabla `family_context`)

- [x] **4.1** Servicio `familyContext.service.ts`: `getFamilyContext()`, `upsertFamilyContext()`
- [x] **4.2** Persistir en onboarding hogar: ciudad, mascotas (`pets`), `sleep_time`, `meal_time`
- [x] **4.3** Migración con columnas `sleep_time`, `meal_time` en `family_context`
- [x] **4.4** Al cargar sesión, rellenar `userData.home` desde `family_context`

---

## 5. Flujo de carga inicial y navegación

- [x] **5.1** Tras login: cargar en paralelo `getProfile()`, `getChildren()`, `getFamilyContext()`
- [x] **5.2** Decidir pantalla inicial: sin perfil → splash; sin hijos → onboarding hijo; sin family_context → onboarding hogar; sino → home
- [x] **5.3** Manejo de errores al guardar (onboarding): mostrar mensaje y no cambiar de pantalla
- [x] **5.4** Estado de carga (“Cargando…”) mientras se resuelve la sesión y los datos iniciales

---

## 6. Explorar – Planes (tablas `explore_plans`, `explore_plan_interactions`)

- [x] **6.1** Servicio `explorePlans.service.ts`: listar planes (`explore_plans`), con filtros opcionales (edad, ciudad, categoría, etc.)
- [x] **6.2** En pantalla Explorar, reemplazar contenido estático por lista de planes desde Supabase
- [x] **6.3** Servicio para interacciones: guardar “guardado”/“oculto” en `explore_plan_interactions` (user_id, child_id, plan_id, status)
- [x] **6.4** UI en Explorar: botón “Guardar”/“Ocultar” por plan y reflejar estado desde `explore_plan_interactions`

---

## 7. Chat con Nani (tablas `chat_sessions`, `chat_messages`)

- [x] **7.1** Servicio `chat.service.ts`: crear/obtener sesión activa (`chat_sessions`) por user_id + child_id; listar mensajes de una sesión (`chat_messages`)
- [x] **7.2** Al abrir Chat: cargar o crear sesión y cargar mensajes desde Supabase (sustituir estado local inicial)
- [x] **7.3** Al enviar mensaje usuario: insertar en `chat_messages` (role `user`) y opcionalmente respuesta Nani (role `assistant`) cuando se integre IA
- [x] **7.4** Tipos/mapeo: `role` (user/assistant), `content`, `meta` si se usa; sincronizar con el tipo `Message` del componente Chat

---

## 8. Momentos KIDS / memoria (tabla `child_memory_facts`)

- [x] **8.1** Decidir modelo: usar `child_memory_facts` para “momentos” (key = `moment`, value = título, meta = date/emoji/note)
- [x] **8.2** Servicio `moments.service.ts`: getMoments(childId), addMoment(childId, input)
- [x] **8.3** Pantalla Momentos KIDS: listar datos desde Supabase (getMoments), loading y estado vacío
- [x] **8.4** “Agregar recuerdo”: formulario inline, guardar con addMoment y refrescar lista

---

## 9. Perfil de usuario (lectura/edición desde `profiles`)

- [x] **9.1** Pantalla Perfil: mostrar nombre, correo, relación e hij@ desde estado cargado (`profiles` + `children`)
- [x] **9.2** Editar perfil: formulario (nombre, correo, relación) que llama `upsertProfile` y `onProfileUpdated` para actualizar estado en App

---

## 10. RLS y seguridad

- [x] **10.1** Verificar que existan políticas RLS para `profiles`, `children`, `family_context` (select/insert/update por usuario)
- [x] **10.2** Revisar RLS para `explore_plan_interactions`, `chat_sessions`, `chat_messages`, `child_memory_facts`: políticas select/insert/update/delete por usuario ya existen; INSERT con WITH CHECK (user_id = auth.uid() y child_id del usuario)

---

## 11. Tipos y mantenibilidad

- [ ] **11.1** Generar tipos TypeScript desde Supabase (`supabase gen types typescript`) y guardar en repo (ej. `src/lib/supabase/database.types.ts`)
- [ ] **11.2** Usar esos tipos en servicios y componentes en lugar de interfaces locales donde aplique

---

## Relevant Files

| Archivo | Propósito |
|---------|-----------|
| `src/lib/supabase/client.ts` | Cliente Supabase (URL + anon key) |
| `src/vite-env.d.ts` | Tipos de Vite (`import.meta.env`) para que el build pase |
| `src/services/auth.service.ts` | signUp, signIn, signOut |
| `src/services/profile.service.ts` | getProfile, upsertProfile (profiles) |
| `src/services/children.service.ts` | getChildren, insertChild (children) |
| `src/services/familyContext.service.ts` | getFamilyContext, upsertFamilyContext (family_context) |
| `src/App.tsx` | Carga inicial (profile, children, family_context), handlers de onboarding, logout, errores |
| `src/pages/AuthGate.tsx` | UI login/registro, onAuthed |
| `src/components/OnboardingParent.tsx` | Formulario padre → ParentData |
| `src/components/OnboardingChild.tsx` | Formulario hijo → ChildData |
| `src/components/OnboardingHome.tsx` | Formulario hogar → HomeData |
| `src/components/Explore.tsx` | Tab Explorar: lista de planes desde Supabase, Guardar/Ocultar por plan |
| `src/services/explorePlans.service.ts` | listPlans (filtros), getInteractions, setInteraction, removeInteraction |
| `src/services/chat.service.ts` | getOrCreateSession, getMessages, addMessage (chat_sessions, chat_messages) |
| `src/services/moments.service.ts` | getMoments, addMoment (child_memory_facts key=moment) |
| `src/components/MomentsKids.tsx` | Lista momentos desde Supabase, formulario Agregar recuerdo |
| `src/components/Profile.tsx` | Muestra perfil (nombre, correo, relación, hij@), formulario Editar perfil + upsertProfile |
| *(pendiente)* `src/lib/supabase/database.types.ts` | Tipos generados de Supabase |

---

## Resumen de estado

- **Hecho:** Auth, perfiles, hijos, contexto familiar, flujo de carga y onboarding, campos extra (relationship, sleep_time, meal_time), RLS básico, **Explorar**, **Chat**, **Momentos KIDS**, **Perfil (lectura + edición)**.
- **Pendiente:** Tipos generados desde Supabase (punto 11).
