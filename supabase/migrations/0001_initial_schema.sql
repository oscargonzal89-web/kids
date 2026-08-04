-- ============================================================================
-- KIDS SuperApp — esquema inicial
-- Ítem A1 de PRIORIZACION_NANI.md
-- ============================================================================
--
-- POR QUÉ EXISTE ESTE ARCHIVO
-- El esquema vivía únicamente dentro del proyecto Supabase. Cuando el proyecto
-- se pausó por inactividad, la app entera dependía de que no se borrara. Este
-- archivo permite reconstruirla desde cero.
--
-- CÓMO SE RECONSTRUYÓ Y QUÉ TAN CONFIABLE ES
-- No se pudo exportar el DDL real: hacerlo requiere la `service_role` key, que
-- no está disponible (el endpoint OpenAPI de PostgREST responde
-- "Secret API key required" con la anon key). Cada objeto lleva una marca:
--
--   [VERIFICADO]  Comprobado contra la base en vivo o contra código que corre.
--   [INFERIDO]    Deducido de database.types.ts o de los servicios. Muy
--                 probable, pero no leído del catálogo de Postgres.
--   [INCIERTO]    No se pudo determinar. Revisar antes de confiar en él.
--
-- Fuentes usadas:
--   1. src/lib/supabase/database.types.ts  (generado desde Supabase — columnas
--      y nulabilidad; `Insert` opcional ⇒ la columna tiene DEFAULT)
--   2. Los servicios en src/services/     (constraints reales vía `onConflict`)
--   3. Consultas REST a la base en vivo con un JWT de usuario (tipos y valores)
--   4. "AI tools/process_task_supabase_front_back.md" punto 10 (patrón RLS
--      verificado en su momento por Oscar)
--
-- CÓMO RESTAURAR
--   psql "$DATABASE_URL" -f supabase/migrations/0001_initial_schema.sql
--   psql "$DATABASE_URL" -f supabase/seeds/explore_plans.sql   -- cuando exista (B1)
--
-- PENDIENTE: sustituir este archivo por el export real del dashboard en cuanto
-- se tenga la service_role key. Ver "DISCREPANCIAS CONOCIDAS" al final.
-- ============================================================================

-- gen_random_uuid() es nativo desde PostgreSQL 13; Supabase ya lo trae.
-- Se deja explícito para que el script funcione en un Postgres pelado.
create extension if not exists pgcrypto;


-- ============================================================================
-- 1. profiles — datos del padre/madre. 1:1 con auth.users.
-- ============================================================================
-- [VERIFICADO] Fila real leída de la base:
--   id, name=null, email, tone='calido', created_at (con offset +00:00 ⇒ timestamptz),
--   relationship=null. El orden de columnas en la respuesta pone `relationship`
--   al final, lo que indica que se añadió después con ALTER TABLE.
create table if not exists public.profiles (
  id            uuid        primary key references auth.users (id) on delete cascade,
  name          text,
  email         text,
  tone          text        not null default 'calido',   -- [VERIFICADO] valor 'calido' en vivo
  created_at    timestamptz not null default now(),
  relationship  text                                     -- 'papá' | 'mamá' | otro (texto libre)
);

comment on table  public.profiles is 'Perfil del padre/madre. La PK es el id de auth.users.';
comment on column public.profiles.tone is 'Tono preferido para Nani. COLUMNA FANTASMA: nada la lee todavía (ítem C4).';


-- ============================================================================
-- 2. children — hijos. Un usuario puede tener varios.
-- ============================================================================
create table if not exists public.children (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users (id) on delete cascade,
  name        text        not null,
  nickname    text,
  birthdate   date,                                      -- [INFERIDO] se usa para calcular edad en meses
  avatar_url  text,                                      -- [INFERIDO] COLUMNA FANTASMA (C4)
  favorites   jsonb       not null default '{}'::jsonb,   -- { color?: string, animal?: string }
  created_at  timestamptz not null default now()
);

create index if not exists children_user_id_idx on public.children (user_id);

comment on column public.children.favorites is 'Objeto JSON: { color, animal }. Lo consume el system prompt de Nani.';
comment on column public.children.avatar_url is 'COLUMNA FANTASMA: nada la escribe ni la lee (ítem C4).';


-- ============================================================================
-- 3. family_context — contexto del hogar. Una fila por usuario.
-- ============================================================================
-- [VERIFICADO] UNIQUE(user_id): familyContext.service.ts:46 hace
--   .upsert(..., { onConflict: 'user_id' }), que exige un índice único ahí.
--   getFamilyContext() además usa .single(), coherente con una fila por usuario.
create table if not exists public.family_context (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null unique references auth.users (id) on delete cascade,
  home_type   text,                                      -- [INFERIDO] COLUMNA FANTASMA (C4)
  city        text,
  climate     text,                                      -- [INFERIDO] COLUMNA FANTASMA (C4)
  pets        jsonb       not null default '[]'::jsonb,   -- [VERIFICADO] array (service línea 42)
  sleep_time  text,                                       -- [INCIERTO] ver discrepancias
  meal_time   text,                                       -- [INCIERTO] ver discrepancias
  created_at  timestamptz not null default now()
);

comment on column public.family_context.climate   is 'COLUMNA FANTASMA: implicaría integrar un servicio de clima (ítem C4).';
comment on column public.family_context.home_type is 'COLUMNA FANTASMA: nada la lee (ítem C4).';
comment on column public.family_context.sleep_time is 'Hora de dormir, ej. "19:30". TIPO SIN CONFIRMAR: text o time.';


-- ============================================================================
-- 4. explore_plans — catálogo público de planes. NO es propiedad de un usuario.
-- ============================================================================
-- [VERIFICADO] La tabla existe y responde 200, pero está VACÍA: 0 filas con
--   sesión autenticada. Es la causa de la pantalla Explorar en blanco (ítem B1).
create table if not exists public.explore_plans (
  id                uuid        primary key default gen_random_uuid(),
  title             text        not null,
  description       text,
  age_min_months    integer     not null,
  age_max_months    integer,                             -- null = sin límite superior
  city              text,                                -- null = aplica a cualquier ciudad
  climate           text,
  category          text,
  duration_minutes  integer,
  cost_level        text,                                -- 'gratis' | 'bajo' | 'medio' | 'alto' (sin CHECK en la base)
  location_type     text,                                -- 'casa' | 'exterior' | ... (sin CHECK)
  is_active         boolean     not null default true,
  created_at        timestamptz not null default now()
);

create index if not exists explore_plans_age_idx
  on public.explore_plans (age_min_months, age_max_months)
  where is_active;

comment on table public.explore_plans is
  'Catálogo global de planes. VACÍA en producción: sembrar con supabase/seeds/explore_plans.sql (ítem B1).';


-- ============================================================================
-- 5. explore_plan_interactions — qué hizo cada usuario con cada plan.
-- ============================================================================
-- [VERIFICADO] UNIQUE(user_id, child_id, plan_id): explorePlans.service.ts:85
--   hace .upsert(..., { onConflict: 'user_id,child_id,plan_id' }).
-- [VERIFICADO] status toma 'saved' | 'hidden' en el código. No se sabe si la
--   base tiene un CHECK; no se añade uno para no divergir de producción.
create table if not exists public.explore_plan_interactions (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users (id) on delete cascade,
  child_id    uuid        not null references public.children (id) on delete cascade,
  plan_id     uuid        not null references public.explore_plans (id) on delete cascade,
  status      text        not null,                       -- 'saved' | 'hidden'
  notes       text,
  created_at  timestamptz not null default now(),
  unique (user_id, child_id, plan_id)
);

create index if not exists explore_plan_interactions_child_idx
  on public.explore_plan_interactions (child_id, status);

comment on table public.explore_plan_interactions is
  'Señal de preferencias. SIN CONSUMIDOR: nadie la lee todavía, ni Nani (ítem C3).';


-- ============================================================================
-- 6. chat_sessions — conversaciones con Nani.
-- ============================================================================
create table if not exists public.chat_sessions (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users (id) on delete cascade,
  child_id    uuid        not null references public.children (id) on delete cascade,
  title       text,
  is_active   boolean     not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists chat_sessions_active_idx
  on public.chat_sessions (user_id, child_id)
  where is_active;


-- ============================================================================
-- 7. chat_messages — mensajes de cada sesión.
-- ============================================================================
-- [VERIFICADO] role toma 'user' | 'assistant' (chat.service.ts:55).
create table if not exists public.chat_messages (
  id          uuid        primary key default gen_random_uuid(),
  session_id  uuid        not null references public.chat_sessions (id) on delete cascade,
  user_id     uuid        not null references auth.users (id) on delete cascade,
  child_id    uuid        not null references public.children (id) on delete cascade,
  role        text        not null,                       -- 'user' | 'assistant'
  content     text        not null,
  meta        jsonb,
  created_at  timestamptz not null default now()
);

create index if not exists chat_messages_session_idx
  on public.chat_messages (session_id, created_at);


-- ============================================================================
-- 8. child_memory_facts — memoria de Nani + Momentos. DOS ENTIDADES EN UNA.
-- ============================================================================
-- Guarda dos cosas distintas (ítem C1):
--   source = 'nani'  → hechos que Nani extrajo sola (memory.service.ts)
--   key    = 'moment'→ Momentos que el padre/madre escribió (moments.service.ts)
--
-- OJO: NO hay unique constraint sobre (user_id, child_id, key, source), y eso
-- es deliberado aquí porque la app no depende de una: upsertMemoryFact()
-- (memory.service.ts:42-67) hace SELECT y luego INSERT o UPDATE en dos pasos.
-- Añadir el índice único cambiaría el comportamiento respecto a producción.
-- Ver "DISCREPANCIAS CONOCIDAS": ese patrón tiene una condición de carrera.
create table if not exists public.child_memory_facts (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users (id) on delete cascade,
  child_id    uuid        not null references public.children (id) on delete cascade,
  key         text        not null,                       -- categoría snake_case, o 'moment'
  value       text        not null,
  source      text,                                      -- 'nani' | null
  confidence  numeric,                                   -- [INFERIDO] 0.9 al extraer (memory.service.ts:65)
  meta        jsonb,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Sostiene el lookup de upsertMemoryFact() y el listado de momentos.
create index if not exists child_memory_facts_lookup_idx
  on public.child_memory_facts (user_id, child_id, key, source);

comment on table public.child_memory_facts is
  'SOBRECARGADA: memoria de Nani (source=nani) + Momentos (key=moment). Separar en el ítem C1.';


-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
-- [VERIFICADO como patrón, INFERIDO como texto exacto]
-- El punto 10 de "AI tools/process_task_supabase_front_back.md" registra que
-- Oscar verificó estas políticas en la base:
--   10.1 profiles, children, family_context → select/insert/update por usuario
--   10.2 explore_plan_interactions, chat_sessions, chat_messages,
--        child_memory_facts → select/insert/update/delete por usuario, con
--        INSERT ... WITH CHECK (user_id = auth.uid() y child_id del usuario)
-- Los nombres de política y el SQL literal son reconstrucción, no un export.
-- ============================================================================

-- ---------- Permisos de tabla ----------
-- IMPRESCINDIBLE Y FÁCIL DE OLVIDAR: RLS filtra filas, pero primero hace falta
-- el permiso sobre la tabla. Sin estos GRANT, un usuario logueado recibe
-- "permission denied for table children" y ninguna política llega a evaluarse.
--
-- En el proyecto Supabase real esto no se nota: Supabase concede privilegios a
-- `anon` y `authenticated` por defecto. Al restaurar en un Postgres limpio no
-- hay nada de eso, así que se declara aquí para que el archivo se sostenga solo.
-- Se conceden solo los verbos que la app usa, que es más estrecho que el
-- `grant all` por defecto de Supabase.
grant usage on schema public to anon, authenticated;

grant select, insert, update          on public.profiles                  to authenticated;
grant select, insert, update, delete  on public.children                  to authenticated;
grant select, insert, update          on public.family_context            to authenticated;
grant select                          on public.explore_plans             to authenticated;
grant select, insert, update, delete  on public.explore_plan_interactions to authenticated;
grant select, insert, update, delete  on public.chat_sessions             to authenticated;
grant select, insert, update, delete  on public.chat_messages             to authenticated;
grant select, insert, update, delete  on public.child_memory_facts        to authenticated;

alter table public.profiles                  enable row level security;
alter table public.children                  enable row level security;
alter table public.family_context            enable row level security;
alter table public.explore_plans             enable row level security;
alter table public.explore_plan_interactions enable row level security;
alter table public.chat_sessions             enable row level security;
alter table public.chat_messages             enable row level security;
alter table public.child_memory_facts        enable row level security;

-- Verdadero si el hijo indicado pertenece a quien hace la petición.
-- Centraliza la comprobación de "child_id del usuario" del punto 10.2.
create or replace function public.owns_child (target_child_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.children c
    where c.id = target_child_id
      and c.user_id = auth.uid()
  );
$$;

-- Es SECURITY DEFINER a propósito: tiene que poder leer `children` sin que las
-- políticas de esa tabla se apliquen de nuevo (evita recursión de RLS). El
-- search_path fijo evita que alguien la secuestre con un esquema propio.
grant execute on function public.owns_child(uuid) to authenticated;

-- ---------- profiles: cada quien ve y edita solo el suyo ----------
create policy profiles_select_own on public.profiles
  for select using (id = auth.uid());
create policy profiles_insert_own on public.profiles
  for insert with check (id = auth.uid());
create policy profiles_update_own on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---------- children ----------
create policy children_select_own on public.children
  for select using (user_id = auth.uid());
create policy children_insert_own on public.children
  for insert with check (user_id = auth.uid());
create policy children_update_own on public.children
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy children_delete_own on public.children
  for delete using (user_id = auth.uid());

-- ---------- family_context ----------
create policy family_context_select_own on public.family_context
  for select using (user_id = auth.uid());
create policy family_context_insert_own on public.family_context
  for insert with check (user_id = auth.uid());
create policy family_context_update_own on public.family_context
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ---------- explore_plans: catálogo de solo lectura ----------
-- Cualquier usuario autenticado lee los planes activos. Nadie escribe desde el
-- cliente: sembrar con SQL o con la service_role key.
create policy explore_plans_select_active on public.explore_plans
  for select to authenticated using (is_active);

-- ---------- explore_plan_interactions ----------
create policy epi_select_own on public.explore_plan_interactions
  for select using (user_id = auth.uid());
create policy epi_insert_own on public.explore_plan_interactions
  for insert with check (user_id = auth.uid() and public.owns_child(child_id));
create policy epi_update_own on public.explore_plan_interactions
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid() and public.owns_child(child_id));
create policy epi_delete_own on public.explore_plan_interactions
  for delete using (user_id = auth.uid());

-- ---------- chat_sessions ----------
create policy chat_sessions_select_own on public.chat_sessions
  for select using (user_id = auth.uid());
create policy chat_sessions_insert_own on public.chat_sessions
  for insert with check (user_id = auth.uid() and public.owns_child(child_id));
create policy chat_sessions_update_own on public.chat_sessions
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy chat_sessions_delete_own on public.chat_sessions
  for delete using (user_id = auth.uid());

-- ---------- chat_messages ----------
create policy chat_messages_select_own on public.chat_messages
  for select using (user_id = auth.uid());
create policy chat_messages_insert_own on public.chat_messages
  for insert with check (user_id = auth.uid() and public.owns_child(child_id));
create policy chat_messages_update_own on public.chat_messages
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy chat_messages_delete_own on public.chat_messages
  for delete using (user_id = auth.uid());

-- ---------- child_memory_facts ----------
create policy cmf_select_own on public.child_memory_facts
  for select using (user_id = auth.uid());
create policy cmf_insert_own on public.child_memory_facts
  for insert with check (user_id = auth.uid() and public.owns_child(child_id));
create policy cmf_update_own on public.child_memory_facts
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy cmf_delete_own on public.child_memory_facts
  for delete using (user_id = auth.uid());


-- ============================================================================
-- DISCREPANCIAS CONOCIDAS  (no arreglar aquí: este archivo debe reflejar
-- producción, no mejorarla. Son candidatos para una migración 0002_.)
-- ============================================================================
--
-- 1. sleep_time / meal_time: tipo sin confirmar (`text` vs `time`). Las tres
--    cuentas de prueba tienen family_context vacío, así que no se pudo observar
--    un valor real. Si en la base son `time`, PostgREST devuelve "19:30:00" y
--    el prompt de Nani mostrará los segundos. Se asumió `text`.
--
-- 2. child_memory_facts sin índice único: upsertMemoryFact() hace SELECT y
--    después INSERT/UPDATE. Dos mensajes concurrentes pueden no encontrar nada
--    los dos e insertar la misma `key` dos veces. Arreglo real:
--        create unique index child_memory_facts_key_uniq
--          on public.child_memory_facts (user_id, child_id, key, source);
--    y cambiar el servicio a un upsert nativo con onConflict. Va con el ítem C1.
--
-- 3. Sin CHECK constraints en los campos de dominio (`status`, `role`,
--    `cost_level`, `location_type`). Se desconoce si producción los tiene. Se
--    dejaron fuera para no fallar al restaurar sobre datos existentes.
--
-- 4. El texto exacto de las políticas RLS es reconstrucción. Conseguir el
--    export del dashboard y hacer diff contra este archivo antes de confiar en
--    él como respaldo de seguridad. Es el riesgo abierto #1 del documento de
--    priorización.
--
-- 5. Triggers de updated_at: `chat_sessions.updated_at` y
--    `child_memory_facts.updated_at` los escribe la aplicación a mano. No se
--    sabe si además existe un trigger en la base; no se creó ninguno.
-- ============================================================================
