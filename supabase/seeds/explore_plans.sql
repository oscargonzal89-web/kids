-- ============================================================================
-- Semilla del catálogo de planes — Bogotá
-- Ítem B1 de PRIORIZACION_NANI.md
-- ============================================================================
--
-- POR QUÉ EXISTE
-- `explore_plans` estaba vacía en producción, así que la pantalla Explorar se
-- veía en blanco. Cualquier feedback de un tester habría hablado de la pantalla
-- vacía en lugar del producto.
--
-- ALCANCE (decidido por Oscar)
--   · Solo Bogotá.
--   · Solo lugares que existen de verdad — nada inventado ni genérico.
--
-- ⚠️ VERIFICAR ANTES DE REPARTIR CUENTAS
-- Los lugares son reales, pero **horarios, tarifas y programación cambian**, y
-- este archivo no los afirma: `cost_level` es una categoría aproximada
-- ('gratis' | 'bajo' | 'medio'), no un precio, y no hay horarios en ninguna
-- parte. Aun así conviene que Oscar dé un repaso rápido a los 18 registros
-- antes de que un tester los vea, sobre todo a los de museos y parques de
-- diversiones. Si alguno ya no aplica: `update explore_plans set is_active =
-- false where title = '…';` — no hace falta borrarlo.
--
-- COBERTURA POR EDAD
-- Se cubrió a propósito el rango bajo (0–12 meses) con sitios que sí admiten
-- bebés —caminatas en coche, jardines, bibliotecas con primera infancia— porque
-- de lo contrario un tester con un hijo de pocos meses vería la lista casi
-- vacía, que es justo el problema que B1 viene a resolver.
--
-- CÓMO EJECUTARLO
-- Las políticas RLS solo permiten LEER `explore_plans` desde el cliente; nadie
-- puede escribir con la clave anónima (es un catálogo, no datos de usuario).
-- Así que corre desde el SQL Editor del panel de Supabase, o con psql:
--     psql "$DATABASE_URL" -f supabase/seeds/explore_plans.sql
--
-- Es idempotente: se puede correr varias veces sin duplicar (filtra por título).
-- ============================================================================

insert into public.explore_plans
  (title, description, age_min_months, age_max_months, city, category, duration_minutes, cost_level, location_type)
select * from (values
  -- ---------- 0 meses en adelante: sitios donde un bebé en coche está bien ----------
  (
    'Caminata por el Jardín Botánico José Celestino Mutis',
    'Senderos amplios y planos, ideales para recorrer con coche. La variedad de verdes, texturas y sonidos es estímulo visual y auditivo suficiente para un bebé, y hay sombra y zonas para sentarse a alimentarlo.',
    0, null, 'Bogotá', 'naturaleza', 90, 'bajo', 'exterior'
  ),
  (
    'Ciclovía dominical',
    'Los domingos y festivos la ciudad cierra varias vías principales. Es de los planes más cómodos con un bebé: piso liso para el coche, sin carros, y puedes cortar el paseo en cualquier momento. Gratis.',
    0, null, 'Bogotá', 'aire libre', 60, 'gratis', 'exterior'
  ),
  (
    'Vuelta por el Parque El Virrey',
    'Parque lineal que sigue el canal, con sendero continuo y arborizado. Corto, tranquilo y fácil de encajar en una tarde sin desarmar la rutina de siestas.',
    0, null, 'Bogotá', 'aire libre', 45, 'gratis', 'exterior'
  ),
  (
    'Parque Nacional Enrique Olaya Herrera',
    'Uno de los parques más antiguos de la ciudad, con árboles grandes y zonas de césped. Buen sitio para una manta en el pasto con un bebé y, más adelante, para que gatee y camine.',
    0, null, 'Bogotá', 'aire libre', 60, 'gratis', 'exterior'
  ),
  (
    'Primera infancia en las bibliotecas de BibloRed',
    'La red pública de bibliotecas de Bogotá tiene espacios y actividades de lectura dedicados a primera infancia. Es un plan bajo techo, gratuito y pensado para bebés y niños pequeños — útil para los días de lluvia. Conviene consultar la programación de la sede más cercana.',
    0, 60, 'Bogotá', 'educativo', 60, 'gratis', 'interior'
  ),

  -- ---------- 6 meses en adelante: ya se sienta, mira y agarra ----------
  (
    'Humedal Santa María del Lago',
    'Humedal urbano con sendero perimetral y avistamiento de aves. Los patos y garzas funcionan muy bien a esta edad, cuando ya sigue con la mirada y señala.',
    6, null, 'Bogotá', 'naturaleza', 60, 'gratis', 'exterior'
  ),
  (
    'Parque Simón Bolívar',
    'El parque más grande de la ciudad: lago, praderas y muchísimo espacio. Sirve igual para una manta en el pasto a los 6 meses que para correr a los 3 años, así que es un plan que no se le queda chico.',
    6, null, 'Bogotá', 'aire libre', 120, 'gratis', 'exterior'
  ),
  (
    'Parque de la 93',
    'Parque pequeño y bien cuidado, rodeado de cafés y restaurantes. Práctico cuando quieres un rato al aire libre pero con baño, cambiador y comida a un minuto.',
    6, null, 'Bogotá', 'aire libre', 60, 'gratis', 'exterior'
  ),
  (
    'Parque Metropolitano El Tunal',
    'Parque grande del sur de la ciudad, con zonas verdes, canchas y biblioteca. Buena opción si viven por ese lado y quieren evitar el desplazamiento al norte.',
    6, null, 'Bogotá', 'aire libre', 90, 'gratis', 'exterior'
  ),

  -- ---------- 12 meses en adelante: camina ----------
  (
    'Zona de juegos del Parque El Country',
    'Parque de barrio con juegos infantiles y prado. Escala adecuada para un niño que apenas empieza a caminar: no se pierde de vista y no hay que caminar mucho para llegar a los juegos.',
    12, 72, 'Bogotá', 'juego', 60, 'gratis', 'exterior'
  ),
  (
    'Humedal Córdoba',
    'Sendero entre juncos y agua, con más aves que gente. A esta edad el plan es señalar pájaros y caminar sin apuro; es más tranquilo que los parques grandes.',
    12, null, 'Bogotá', 'naturaleza', 75, 'gratis', 'exterior'
  ),

  -- ---------- 24 meses en adelante: juego simbólico, más atención ----------
  (
    'Museo de los Niños',
    'Museo diseñado para tocar y manipular, no para mirar de lejos. A partir de los 2 años ya aprovecha varias salas, aunque las secciones más elaboradas le servirán más adelante.',
    24, null, 'Bogotá', 'educativo', 150, 'medio', 'interior'
  ),
  (
    'Teleférico a Monserrate',
    'El viaje en teleférico suele ser el verdadero plan para un niño pequeño: subida corta, vista amplia y algo que contar después. Arriba hay explanada para caminar. Abrigo obligatorio.',
    24, null, 'Bogotá', 'aire libre', 120, 'medio', 'exterior'
  ),
  (
    'Parque Mundo Aventura',
    'Parque de diversiones con una zona de atracciones para los más pequeños. Verificar qué atracciones tienen mínimo de estatura antes de ir, para no llegar a una decepción.',
    24, null, 'Bogotá', 'juego', 180, 'medio', 'exterior'
  ),
  (
    'Museo Nacional de Colombia',
    'Salas amplias, pisos de piedra y objetos grandes que llaman la atención a esta edad. Funciona como visita corta y suelta, sin intentar recorrerlo completo.',
    24, null, 'Bogotá', 'cultural', 90, 'bajo', 'interior'
  ),

  -- ---------- 36 meses en adelante: pregunta "por qué" ----------
  (
    'Maloka',
    'Centro interactivo de ciencia y tecnología, con experimentos que se accionan y salas de proyección. Es el momento en que las explicaciones ya enganchan y la pregunta "¿por qué?" tiene con qué alimentarse.',
    36, null, 'Bogotá', 'educativo', 180, 'medio', 'interior'
  ),
  (
    'Planetario de Bogotá',
    'La cúpula y las proyecciones del cielo tienen un efecto notable a esta edad. Conviene revisar la programación: no todas las funciones están pensadas para niños pequeños.',
    36, null, 'Bogotá', 'educativo', 90, 'bajo', 'interior'
  ),
  (
    'Museo del Oro',
    'Piezas pequeñas y brillantes en salas oscuras: más atractivo para un niño de lo que suena. Ir con la idea de ver poco y bien, no de recorrerlo todo.',
    36, null, 'Bogotá', 'cultural', 75, 'bajo', 'interior'
  )
) as nuevos (title, description, age_min_months, age_max_months, city, category, duration_minutes, cost_level, location_type)
where not exists (
  select 1 from public.explore_plans p where p.title = nuevos.title
);

-- ============================================================================
-- Comprobación: correr después de la inserción.
-- ============================================================================
-- select count(*) as total, min(age_min_months) as edad_min from public.explore_plans;
--   → esperado: 18 planes, edad mínima 0
--
-- Cuántos planes vería un niño de N meses (el filtro real que aplica la app):
--   select age.m as meses, count(*) as planes_visibles
--   from (values (0),(6),(12),(24),(36),(60)) as age(m)
--   left join public.explore_plans p
--     on p.is_active
--    and p.age_min_months <= age.m
--    and (p.age_max_months is null or p.age_max_months >= age.m)
--   group by age.m order by age.m;
-- ============================================================================
