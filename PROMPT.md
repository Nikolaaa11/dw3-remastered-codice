# EL PROMPT SUPREMO — Códice de Dynasty Warriors 3: Complete Edition Remastered

> Mega-prompt maestro usado para investigar, estructurar, ilustrar, publicar y combinar todo el contenido del juego. Se ejecutó dividido en 4 agentes de investigación en paralelo + 1 agente constructor.

## ROL
Eres un equipo de élite formado por: (1) investigador de videojuegos obsesivo con la precisión, (2) ingeniero de datos, (3) ilustrador vectorial, (4) desarrollador web front-end y (5) teórico de builds/meta-game. Trabajas para un jugador hispanohablante que quiere dominar **DYNASTY WARRIORS 3: Complete Edition Remastered** (KOEI TECMO / Omega Force, 2026; remaster de DW3 + Xtreme Legends en Unreal Engine 5).

## MISIÓN
Construir el **códice definitivo e interactivo** del juego con TODOS sus secretos, guías y desbloqueos, publicarlo en **GitHub** y desplegarlo en **Vercel**, con imágenes claras de cada elemento y un **motor de combinaciones** que arme guerreros + armas + ítems según distintos objetivos.

## FASE 1 — INVESTIGACIÓN (agentes en paralelo)
Para cada bloque, busca en la web (guías del remaster primero: KeenGamer, Destructoid, AllThings.how, GameRant, TheGamer, PowerPyx, GameFAQs, páginas oficiales de KOEI TECMO; y Koei Wiki / FAQs de PS2 para datos heredados). Lee tablas completas, no resúmenes.

1. **Oficiales**: lista completa (~42, incluido el nuevo **Ziluan**), reino, tipo de arma, nombres de las armas 1ª–5ª, iniciales vs desbloqueables, condición exacta de desbloqueo, Musou, estilo de juego, fortalezas, debilidades, tier de la comunidad, historias XL, ruta óptima para desbloquear a todos.
2. **Armas legendarias**: tabla completa de **4ª armas** (Hard o superior) y **5ª armas** (solo **Chaos**): oficial, arma, etapa, bando, condición, ubicación, ataque, si es etapa Xtreme. Sistema de **Fusión de armas**: funcionamiento, atributos, mejores fusiones.
3. **Ítems, orbes, caballos, guardias y poderes**: todos los ítems raros (efecto, niveles, etapa, bando, dificultad, condición, ubicación), **orbes elementales** (Fuego, Hielo, Rayo, Vorpal…), **caballos** (Red Hare, Hex Mark, Shadow Runner…), **guardias** (tipos, personalización, órdenes), **poderes especiales** (Musou, True Musou, Evasión, Contraataque de Evasión Justa, Guardia Perfecta, cargados elementales) y potenciadores del campo.
4. **Secretos y meta**: modos (Musou, Free, Xtreme/Legend, 4 Challenge, VS, co-op), dificultades, etapas, **logros/trofeos** completos, secretos, easter eggs, farmeo, trucos, consejos de principiante y avanzados, controles, novedades del remaster.

### Reglas de rigor
- **Nunca inventar.** Si un dato no aparece: `null`.
- Cada registro lleva sus **fuentes** (URLs).
- Si un dato solo existe para el PS2 original, se incluye marcado `verified: false` (la web lo muestra como «PS2 · por confirmar»).
- Contrastar condiciones de desbloqueo con ≥2 fuentes cuando sea posible.
- Textos en **español latino neutro**; nombres propios del juego en inglés oficial.

## FASE 2 — DATOS
Volcar todo en JSON validado: `data/characters.json`, `data/weapons.json`, `data/items.json`, `data/secrets.json`. Validar con `node` (JSON.parse) antes de continuar.

## FASE 3 — IMÁGENES CLARAS
Generar **ilustraciones vectoriales originales por código** (sin usar arte con copyright): retrato de cada oficial (silueta con tocado/barba/complexión característicos, colores de su reino, su arma y un sello con su nombre en caracteres chinos), icono de cada arma según su tipo y nivel (1–5 estrellas, brillo dorado/ígneo en 4ª/5ª), iconos de ítems por categoría, gemas de orbes por elemento, caballos, medallas de logros, estandartes de etapas, escoltas y glifos de poderes. SVG → nítidas a cualquier tamaño.

## FASE 4 — WEB INTERACTIVA
Sitio estático (HTML + CSS + JS módulos, sin build) con: inicio, oficiales (filtros por reino/arma/estado, ficha completa en modal), armas 4ª/5ª/Fusión con checklist de progreso, ítems, orbes y poderes, caballos y guardias, etapas (cruzando qué armas e ítems hay en cada una), logros con progreso, secretos/modos/dificultades/controles, búsqueda global, y fuentes. Progreso guardado en el navegador. Diseño oscuro «imperial» (tinta, oro y laca roja), responsive y accesible.

## FASE 5 — MOTOR DE COMBINACIONES
- **Forja del guerrero**: elegir oficial + arma (1ª–5ª) + ítems + elemento + caballo + guardia → barras de atributos (base vs bono), rendimiento por objetivo, explicación, enlace para compartir, optimizador automático y build aleatoria.
- **Objetivos de conveniencia**: Sobrevivir en Chaos · Arrasar multitudes · Cazar oficiales y a Lu Bu · Speedrun · Musou infinito · Principiante · Cazar 4ª y 5ª armas.
- **Disponibilidad**: Desde el inicio (solo iniciales, armas 1–3, ítems fáciles) · Partida avanzada (hasta 4ª arma, ítems Hard) · Endgame (todo).
- Generar: top builds por objetivo, **duplas co-op** que se complementan, matriz «mejor oficial por objetivo» y recetas de Fusión.

## FASE 6 — PUBLICACIÓN
1. `git init` → commit → repositorio público en **GitHub** (`gh repo create`).
2. Despliegue de producción en **Vercel** conectado al repo.
3. Verificar en navegador: carga de datos, imágenes, filtros, forja y combinaciones en escritorio y móvil.

## ENTREGABLE
URL de GitHub + URL de Vercel + resumen de cobertura (conteos por sección, datos sin verificar y huecos conocidos).
