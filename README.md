# 無雙 DW3 Remastered · Códice Supremo

Guía **interactiva y no oficial** de **DYNASTY WARRIORS 3: Complete Edition Remastered** (KOEI TECMO / Omega Force), en español.

- **Oficiales**: los 40+ guerreros jugables (incluidos Ziluan, Fu Xi y Nu Wa), cómo desbloquear a cada uno, sus armas 1ª–5ª, Musou, estilo, fortalezas y debilidades.
- **Armas legendarias**: tabla completa de 4ª armas (Hard+) y 5ª armas (Chaos) con etapa, bando, condición y ubicación, y el sistema de **Fusión**.
- **Ítems, elementos de arma (DW3 no tiene orbes ni runas), caballos, guardias y poderes**: efectos y cómo conseguirlos.
- **Etapas, logros/trofeos, modos, dificultades, controles y secretos**.
- **Forja del guerrero**: combina oficial + arma + ítems + elemento + caballo + guardia y mira sus atributos y para qué objetivo rinde mejor.
- **Combinaciones maestras**: builds generadas automáticamente por objetivo (Chaos, multitudes, jefes/Lu Bu, speedrun, Musou infinito, principiante, caza de armas), duplas co-op y matriz «mejor oficial por objetivo».
- **Progreso** guardado en tu navegador (armas, ítems, logros y oficiales desbloqueados).

Todas las imágenes son **ilustraciones SVG originales generadas por código** (no se usa arte con copyright). Cada dato enlaza sus fuentes; lo que solo está confirmado para el PS2 original aparece como «PS2 · por confirmar».

## Estructura

```
index.html            SPA estática (sin build)
assets/js/app.js      vistas, filtros, router, búsqueda
assets/js/art.js      generador de ilustraciones SVG
assets/js/builds.js   motor de combinaciones y puntuaciones
assets/css/styles.css estilos
data/*.json           datos investigados (personajes, armas, ítems, secretos)
PROMPT.md             el mega-prompt que generó todo
```

## Uso local

```bash
python -m http.server 5173
```

y abre `http://localhost:5173`.

## Aviso

Proyecto de fans sin afiliación con KOEI TECMO. *DYNASTY WARRIORS* es marca registrada de KOEI TECMO GAMES CO., LTD.
