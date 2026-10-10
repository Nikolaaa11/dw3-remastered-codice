import * as Art from "./art.js";
import * as B from "./builds.js";

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s = "") => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const arr = (x) => (Array.isArray(x) ? x : x ? [x] : []);
const K_ORDER = ["Wei", "Shu", "Wu", "Other"];

// ---------------- Progreso local (checklists) ----------------
const PKEY = "dw3r-progress-v1";
function loadProgress() {
  try { return JSON.parse(localStorage.getItem(PKEY)) || {}; } catch { return {}; }
}
const progress = loadProgress();
function toggleProgress(group, id, on) {
  progress[group] = progress[group] || {};
  if (on) progress[group][id] = 1; else delete progress[group][id];
  try { localStorage.setItem(PKEY, JSON.stringify(progress)); } catch { /* almacenamiento no disponible */ }
}
const isDone = (group, id) => !!(progress[group] && progress[group][id]);

// ---------------- Datos ----------------
function normKingdom(k = "") {
  const t = `${k}`.toLowerCase();
  if (t.includes("wei")) return "Wei";
  if (t.includes("shu")) return "Shu";
  if (t === "wu" || t.includes("wu ")) return "Wu";
  return "Other";
}
const ITEM_CAT_ALIASES = { life: "vida", attack: "ataque", defense: "defensa", speed: "velocidad", horse: "caballo", bodyguard: "guardia", utility: "utilidad", special: "especial", element: "elemental" };

function normalize(c, w, i, s) {
  const characters = arr(c.characters).map((ch) => ({
    ...ch,
    id: ch.id || Art.slug(ch.name),
    kingdom: normKingdom(ch.kingdom),
    weapons: arr(ch.weapons),
    strengths: arr(ch.strengths), weaknesses: arr(ch.weaknesses), sources: arr(ch.sources),
  })).sort((a, b) => K_ORDER.indexOf(a.kingdom) - K_ORDER.indexOf(b.kingdom) || (b.starter - a.starter) || a.name.localeCompare(b.name));
  // Une IDs escritos distinto ("zhenji" / "zhen-ji", "Sun Shangxiang" / "Sun Shang Xiang").
  const key = (x = "") => Art.slug(x).replace(/-/g, "");
  const byKey = new Map();
  characters.forEach((x) => { byKey.set(key(x.id), x.id); byKey.set(key(x.name), x.id); });
  const fixW = (list, tier) => arr(list).map((x) => {
    const cid = byKey.get(key(x.character_id)) || byKey.get(key(x.character)) || x.character_id || Art.slug(x.character);
    return { ...x, tier, character_id: cid, id: `${tier}-${cid}-${Art.slug(x.weapon)}`, sources: arr(x.sources) };
  });
  const items = arr(i.items).map((it) => {
    let cat = `${it.category || ""}`.toLowerCase();
    cat = ITEM_CAT_ALIASES[cat] || cat;
    return { ...it, id: it.id || Art.slug(it.name), category: Art.ITEM_CATS[cat] ? cat : "especial", sources: arr(it.sources) };
  });
  const withId = (list) => arr(list).map((x) => ({ ...x, id: x.id || Art.slug(x.name), sources: arr(x.sources) }));
  return {
    meta: { c, w, i, s },
    characters,
    weapons: { ...w, fourth: fixW(w.fourth, 4), fifth: fixW(w.fifth, 5), fusion: w.fusion || null },
    items, orbs: withId(i.orbs), horses: withId(i.horses), bodyguards: i.bodyguards || null,
    powers: arr(i.special_powers), pickups: arr(i.stat_pickups), itemRules: arr(i.items_rules),
    game: s.game_info || {}, modes: arr(s.modes), difficulties: arr(s.difficulties), stages: arr(s.stages),
    achievements: withId(s.achievements), secrets: arr(s.secrets).map((x, n) => ({ ...x, id: Art.slug(x.title) || `s${n}` })),
    beginner: arr(s.beginner_tips), advanced: arr(s.advanced_tips), controls: arr(s.controls),
  };
}

let D = null;
let SLOTS = 4;

// ---------------- Piezas de UI ----------------
const pill = (t, cls = "") => (t ? `<span class="pill ${cls}">${esc(t)}</span>` : "");
const kPill = (k) => `<span class="pill k k-${k}">${Art.KINGDOMS[k]?.hanzi || ""} ${esc(Art.KINGDOMS[k]?.es || k)}</span>`;
const verifiedTag = (x) => (x.verified === false ? `<span class="tag warn" title="Dato del juego original de PS2: puede variar en el remaster">PS2 · por confirmar</span>` : x.verified ? `<span class="tag ok">Verificado</span>` : "");
const sourcesHTML = (list) => {
  const l = arr(list).filter(Boolean);
  if (!l.length) return "";
  return `<details class="sources"><summary>Fuentes (${l.length})</summary><ul>${l.map((u) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u.replace(/^https?:\/\/(www\.)?/, "").slice(0, 80))}</a></li>`).join("")}</ul></details>`;
};
const chips = (name, opts, active) => `<div class="chips" role="group" data-chips="${name}">${opts.map((o) => `<button class="chip ${o.v === active ? "on" : ""}" data-v="${esc(o.v)}" aria-pressed="${o.v === active}">${o.html || esc(o.label)}</button>`).join("")}</div>`;
const sectionHead = (title, sub, hanzi = "") => `<header class="sec-head">${hanzi ? `<span class="sec-hanzi" aria-hidden="true">${hanzi}</span>` : ""}<div><h1>${title}</h1>${sub ? `<p>${sub}</p>` : ""}</div></header>`;
const empty = (what) => `<div class="empty">${Art.glyphSVG("tip", { size: 64 })}<p>Aún no hay datos de <b>${esc(what)}</b>. La investigación se publica en <code>data/</code>.</p></div>`;

function statBars(stats, max = 10) {
  return `<div class="bars" role="table" aria-label="Atributos">${B.STATS.map((s) => {
    const v = Number(stats?.[s.key]) || 0;
    return `<div class="bar-row" role="row"><span class="bar-label" role="rowheader">${s.label}</span><span class="bar-track" role="cell" title="${s.label}: ${v}/${max}"><span class="bar-fill" style="width:${(v / max) * 100}%"></span></span><span class="bar-val" role="cell">${v}</span></div>`;
  }).join("")}</div>`;
}

function stackedBars(base, bonus) {
  const max = B.MAX_STAT;
  return `<div class="legend"><span><i class="sw sw-base"></i>Base del oficial</span><span><i class="sw sw-bonus"></i>Bono de arma + equipo</span></div>
  <div class="bars stacked" role="table" aria-label="Atributos de la build">${B.STATS.map((s) => {
    const b0 = Math.max(0, base[s.key]); const b1 = Math.max(0, Math.min(max - b0, bonus[s.key]));
    const tot = (b0 + b1).toFixed(1);
    return `<div class="bar-row" role="row"><span class="bar-label" role="rowheader">${s.label}</span>
      <span class="bar-track" role="cell" data-tip="${s.label}: base ${b0.toFixed(1)} + bono ${b1.toFixed(1)} = ${tot}">
        <span class="seg seg-base" style="width:${(b0 / max) * 100}%"></span>${b1 > 0.05 ? `<span class="seg seg-bonus" style="width:${(b1 / max) * 100}%"></span>` : ""}
      </span><span class="bar-val" role="cell">${tot}</span></div>`;
  }).join("")}</div>`;
}

// ---------------- Modal ----------------
function openModal(html) {
  const m = $("#modal");
  $("#modal-body").innerHTML = html;
  m.hidden = false;
  document.body.classList.add("noscroll");
  $("#modal-close").focus();
}
function closeModal() {
  $("#modal").hidden = true;
  document.body.classList.remove("noscroll");
}

// ---------------- Vistas ----------------
function viewHome(root) {
  const g = D.game;
  const tiles = [
    ["Oficiales", D.characters.length, "personajes"], ["4ª armas", D.weapons.fourth.length, "armas"], ["5ª armas", D.weapons.fifth.length, "armas?t=5"],
    ["Ítems", D.items.length, "items"], ["Elementos", D.orbs.length, "orbes"], ["Caballos", D.horses.length, "caballos"],
    ["Etapas", D.stages.length, "etapas"], ["Logros", D.achievements.length, "logros"], ["Secretos", D.secrets.length, "secretos"],
  ];
  const route = arr(D.meta.c.recommended_unlock_route);
  root.innerHTML = `
  <section class="hero">${Art.heroSVG()}
    <div class="hero-text">
      <p class="eyebrow">Códice supremo · guía interactiva no oficial</p>
      <h1>Dynasty Warriors 3<br><span>Complete Edition Remastered</span></h1>
      <p class="lead">Todos los oficiales, armas 4ª y 5ª, ítems, elementos, caballos, guardias, poderes, etapas, logros y secretos, con ilustraciones propias y un forjador de combinaciones.</p>
      <div class="cta"><a class="btn primary" href="#/combos">Generar combinaciones</a><a class="btn" href="#/forja">Forjar mi guerrero</a></div>
    </div>
  </section>
  <section class="tiles">${tiles.map(([l, n, href]) => `<a class="tile" href="#/${href}"><span class="tile-n">${n}</span><span class="tile-l">${l}</span></a>`).join("")}</section>
  ${arr(g.what_is_new).length ? `<section class="panel"><h2>Novedades del remaster</h2><ul class="ticks">${g.what_is_new.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    <p class="muted small">${esc([g.developer, g.publisher].filter(Boolean).join(" · "))} ${arr(g.platforms).length ? "· " + esc(g.platforms.join(", ")) : ""}</p>
    ${arr(g.release_dates).length ? `<p class="muted small">${g.release_dates.map(esc).join(" · ")}</p>` : ""}</section>` : ""}
  <section class="grid-2">
    <div class="panel"><h2>Ruta rápida para desbloquear a todos</h2>
      ${D.meta.c.starting_roster_note ? `<p>${esc(D.meta.c.starting_roster_note)}</p>` : ""}
      ${route.length ? `<ol class="steps">${route.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>` : `<p class="muted">Consulta cada oficial en <a href="#/personajes">Personajes</a>.</p>`}
    </div>
    <div class="panel"><h2>Consejos de inicio</h2>
      ${D.beginner.length ? `<ul class="ticks">${D.beginner.slice(0, 8).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : `<p class="muted">Ver <a href="#/secretos">Secretos</a>.</p>`}
      <a class="btn small" href="#/secretos">Todos los secretos →</a>
    </div>
  </section>
  <section class="panel"><h2>Ejércitos</h2><div class="kingdoms">${K_ORDER.map((k) => {
    const list = D.characters.filter((c) => c.kingdom === k);
    return `<a class="kingdom-card k-${k}" href="#/personajes?k=${k}"><span class="kc-hanzi">${Art.KINGDOMS[k].hanzi}</span><span class="kc-name">${Art.KINGDOMS[k].es}</span><span class="kc-n">${list.length} oficiales</span>
      <span class="kc-faces">${list.slice(0, 5).map((c) => `<span class="face">${Art.portraitSVG(c)}</span>`).join("")}</span></a>`;
  }).join("")}</div></section>`;
}

function charCard(c) {
  const k = Art.kingdomOf(c.kingdom);
  return `<button class="card char-card" data-char="${esc(c.id)}" style="--k:${k.main}" aria-label="Ver ficha de ${esc(c.name)}">
    <div class="card-art">${Art.portraitSVG(c)}</div>
    <div class="card-body">
      <div class="card-title">${esc(c.name)}</div>
      <div class="card-meta">${kPill(c.kingdom)}${pill(c.weapon_type)}</div>
      <div class="card-foot">${c.starter ? `<span class="tag ok">Inicial</span>` : `<span class="tag lock">Desbloqueable</span>`}
        ${c.community_tier ? `<span class="tier tier-${esc(c.community_tier)}" title="Tier ${c.tier_estimated ? "estimado" : "de la comunidad"}">${esc(c.community_tier)}</span>` : ""}
        ${isDone("chars", c.id) ? `<span class="tag ok">✓</span>` : ""}</div>
    </div></button>`;
}

function viewCharacters(root, params) {
  let st = { k: params.get("k") || "all", q: "", f: "all", sort: "kingdom" };
  const types = [...new Set(D.characters.map((c) => c.weapon_type).filter(Boolean))].sort();
  root.innerHTML = sectionHead("Oficiales", `${D.characters.length} guerreros jugables: cómo desbloquearlos, sus armas, Musou y estilo de juego.`, "將") + `
    <div class="toolbar">
      ${chips("k", [{ v: "all", label: "Todos" }, ...K_ORDER.map((k) => ({ v: k, html: `${Art.KINGDOMS[k].hanzi} ${Art.KINGDOMS[k].es}` }))], st.k)}
      ${chips("f", [{ v: "all", label: "Todos" }, { v: "starter", label: "Iniciales" }, { v: "locked", label: "Desbloqueables" }, { v: "new", label: "Nuevos/XL" }], st.f)}
      <select id="wt" aria-label="Tipo de arma"><option value="">Cualquier arma</option>${types.map((t) => `<option>${esc(t)}</option>`).join("")}</select>
      <select id="sort" aria-label="Ordenar"><option value="kingdom">Por reino</option><option value="name">A–Z</option><option value="tier">Por tier</option><option value="power">Más poder</option><option value="crowd">Mejor vs multitudes</option></select>
      <input id="q" type="search" placeholder="Buscar oficial…" aria-label="Buscar oficial">
    </div>
    <div id="grid" class="grid chars"></div>`;
  const draw = () => {
    const wt = $("#wt").value;
    let list = D.characters.filter((c) => (st.k === "all" || c.kingdom === st.k)
      && (st.f === "all" || (st.f === "starter" ? c.starter : st.f === "locked" ? !c.starter : c.new_in_remaster || c.xl_story))
      && (!wt || c.weapon_type === wt)
      && (!st.q || `${c.name} ${c.weapon_type} ${c.unlock}`.toLowerCase().includes(st.q)));
    const tierV = { S: 0, A: 1, B: 2, C: 3 };
    if (st.sort === "name") list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
    if (st.sort === "tier") list = list.slice().sort((a, b) => (tierV[a.community_tier] ?? 9) - (tierV[b.community_tier] ?? 9));
    if (st.sort === "power" || st.sort === "crowd") list = list.slice().sort((a, b) => (b.ratings?.[st.sort] || 0) - (a.ratings?.[st.sort] || 0));
    $("#grid").innerHTML = list.length ? list.map(charCard).join("") : empty("oficiales con ese filtro");
  };
  bindChips(root, (n, v) => { st[n] = v; draw(); });
  $("#wt").onchange = draw;
  $("#sort").onchange = (e) => { st.sort = e.target.value; draw(); };
  $("#q").oninput = (e) => { st.q = e.target.value.toLowerCase().trim(); draw(); };
  draw();
}

function charDetail(id) {
  const c = D.characters.find((x) => x.id === id);
  if (!c) return;
  const special = [...D.weapons.fourth, ...D.weapons.fifth].filter((w) => w.character_id === c.id);
  const weapons = [1, 2, 3, 4, 5].map((t) => {
    const named = c.weapons.find((w) => w.tier === t)?.name || special.find((w) => w.tier === t)?.weapon;
    return { t, name: named, element: special.find((w) => w.tier === t)?.element };
  }).filter((w) => w.name || w.t <= 3);
  openModal(`<div class="detail k-${c.kingdom}">
    <div class="detail-art">${Art.portraitSVG(c)}</div>
    <div class="detail-info">
      <h2>${esc(c.name)}</h2>
      <div class="card-meta">${kPill(c.kingdom)}${pill(c.weapon_type)}${c.starter ? `<span class="tag ok">Inicial</span>` : `<span class="tag lock">Desbloqueable</span>`}${c.xl_story ? `<span class="tag">Historia XL</span>` : ""}${c.new_in_remaster ? `<span class="tag gold">Nuevo en el remaster</span>` : ""}${verifiedTag(c)}</div>
      <div class="callout"><b>Cómo desbloquear:</b> ${esc(c.unlock || "Sin datos")}</div>
      ${c.playstyle ? `<p>${esc(c.playstyle)}</p>` : ""}
      ${c.musou ? `<p><b>Musou:</b> ${esc(c.musou)}</p>` : ""}
      <div class="grid-2 tight">
        ${c.strengths.length ? `<div><h4>Fortalezas</h4><ul class="ticks">${c.strengths.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
        ${c.weaknesses.length ? `<div><h4>Debilidades</h4><ul class="crosses">${c.weaknesses.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
      </div>
      <h4>Atributos (estimación relativa)</h4>${statBars(B.baseStats(c))}
      <h4>Armas</h4>
      <div class="weapon-row">${weapons.map((w) => `<div class="wcell">${Art.weaponSVG(c.weapon_type, { tier: w.t, name: w.name || "", kingdom: c.kingdom, element: w.element })}<b>${w.t}ª</b><span>${esc(w.name || "—")}</span></div>`).join("")}</div>
      ${special.map((w) => `<div class="callout ${w.tier === 5 ? "fire" : ""}"><b>${w.tier}ª arma · ${esc(w.weapon || "")}</b>${w.attack ? ` · ATK ${esc(w.attack)}` : ""}${ELEMENT_ES[`${w.element || ""}`.toLowerCase()] ? ` · ${ELEMENT_ES[`${w.element}`.toLowerCase()]}` : ""} — ${esc(w.stage || "?")} (${esc(w.side || "?")}, ${esc(w.difficulty || (w.tier === 5 ? "Chaos" : "Hard+"))})<br>${esc(w.condition || "")}${w.location ? `<br><i>Ubicación:</i> ${esc(w.location)}` : ""}</div>`).join("")}
      ${c.voice_or_trivia ? `<p class="muted"><i>${esc(c.voice_or_trivia)}</i></p>` : ""}
      <div class="cta"><a class="btn primary" href="#/forja?c=${esc(c.id)}">Forjar build con ${esc(c.name)}</a>${dlBtn("char", c.id)}
        <label class="check"><input type="checkbox" data-prog="chars" data-id="${esc(c.id)}" ${isDone("chars", c.id) ? "checked" : ""}> Ya lo desbloqueé</label></div>
      ${sourcesHTML(c.sources)}
    </div></div>`);
}

const ELEMENT_ES = { fire: "Fuego", lightning: "Rayo", death: "Muerte (Vorpal)", wind: "Viento", ice: "Hielo", none: "" };
const DELIVERY_ES = { precious_item: "Cofre / Precious Item", transport_unit: "Unidad de transporte", dropped_by_officer: "Lo suelta un oficial" };
const elementPill = (e) => { const t = ELEMENT_ES[`${e || ""}`.toLowerCase()]; return t ? pill(t, "el el-" + Art.elementKey(e)) : ""; };

function weaponCard(w) {
  const c = D.characters.find((x) => x.id === w.character_id) || { name: w.character, kingdom: "Other", id: w.character_id };
  return `<article class="card wcard k-${c.kingdom} ${isDone("weapons", w.id) ? "done" : ""}">
    <div class="wcard-top">
      <div class="wcard-icon">${Art.weaponSVG(c.weapon_type || "", { tier: w.tier, name: w.weapon, kingdom: c.kingdom, element: w.element })}</div>
      <div><div class="card-title">${esc(w.weapon || "¿?")}</div>
        <button class="linklike" data-char="${esc(c.id)}"><span class="mini-face">${Art.portraitSVG(c)}</span>${esc(c.name)}</button>
        <div class="card-meta">${pill(w.tier + "ª arma", w.tier === 5 ? "fire" : "gold")}${pill(w.difficulty || (w.tier === 5 ? "Chaos" : "Hard+"))}${w.xtreme_stage ? pill("Etapa Xtreme", "fire") : ""}${w.attack ? pill("ATK " + w.attack) : ""}${elementPill(w.element)}</div></div>
    </div>
    <dl class="kv"><dt>Etapa</dt><dd>${esc(w.stage || "—")}</dd><dt>Bando</dt><dd>${esc(w.side || "—")}</dd>
      <dt>Condición</dt><dd>${esc(w.condition || "—")}</dd><dt>Ubicación</dt><dd>${esc(w.location || "—")}</dd>
      ${DELIVERY_ES[w.delivery] ? `<dt>Entrega</dt><dd>${DELIVERY_ES[w.delivery]}</dd>` : ""}${w.notes ? `<dt>Nota</dt><dd class="muted">${esc(w.notes)}</dd>` : ""}</dl>
    <div class="card-foot"><label class="check"><input type="checkbox" data-prog="weapons" data-id="${esc(w.id)}" ${isDone("weapons", w.id) ? "checked" : ""}> Obtenida</label>${verifiedTag(w)}</div>
  </article>`;
}

function viewWeapons(root, params) {
  let st = { t: params.get("t") === "5" ? "5" : params.get("t") === "fusion" ? "fusion" : "4", k: "all", q: "" };
  const W = D.weapons;
  root.innerHTML = sectionHead("Armas legendarias", "4ª armas (Hard o superior), 5ª armas (solo Chaos) y el nuevo sistema de Fusión.", "兵") + `
    <div class="toolbar">${chips("t", [{ v: "4", label: `4ª armas (${W.fourth.length})` }, { v: "5", label: `5ª armas (${W.fifth.length})` }, { v: "fusion", label: "Fusión de armas" }], st.t)}
      ${chips("k", [{ v: "all", label: "Todos" }, ...K_ORDER.map((k) => ({ v: k, html: `${Art.KINGDOMS[k].hanzi} ${Art.KINGDOMS[k].es}` }))], st.k)}
      <input id="q" type="search" placeholder="Buscar arma, oficial o etapa…" aria-label="Buscar arma"></div>
    <div id="wbody"></div>`;
  const draw = () => {
    const body = $("#wbody");
    if (st.t === "fusion") {
      const f = W.fusion;
      body.innerHTML = !f ? empty("Fusión de armas") : `<section class="panel"><h2>Fusión de armas</h2><p>${esc(f.summary || "")}</p>
        ${arr(f.how_it_works).length ? `<h3>Cómo funciona</h3><ol class="steps">${f.how_it_works.map((x) => `<li>${esc(x)}</li>`).join("")}</ol>` : ""}
        ${arr(f.attributes).length ? `<h3>Atributos</h3><div class="grid mini">${f.attributes.map((a) => `<div class="card pad">${Art.glyphSVG(a.name, { size: 40 })}<b>${esc(a.name)}</b><p class="small">${esc(a.effect || "")}</p></div>`).join("")}</div>` : ""}
        ${arr(f.best_combos).length ? `<h3>Mejores fusiones</h3><div class="grid mini">${f.best_combos.map((r) => `<div class="card pad recipe"><b>${esc(r.name)}</b><p>${esc(r.recipe || "")}</p><p class="small muted">${esc(r.why || "")}</p></div>`).join("")}</div>` : ""}
        ${arr(f.tips).length ? `<h3>Consejos</h3><ul class="ticks">${f.tips.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}
        ${sourcesHTML(f.sources)}</section>`;
      return;
    }
    const list = (st.t === "5" ? W.fifth : W.fourth).filter((w) => {
      const c = D.characters.find((x) => x.id === w.character_id);
      return (st.k === "all" || c?.kingdom === st.k) && (!st.q || `${w.weapon} ${w.character} ${w.stage} ${w.condition}`.toLowerCase().includes(st.q));
    });
    const all = st.t === "5" ? W.fifth : W.fourth;
    const got = all.filter((w) => isDone("weapons", w.id)).length;
    const rules = st.t === "5" ? arr(W.rules_5th) : arr(W.rules_4th);
    body.innerHTML = `<div class="progress-line"><b>${got}</b> de ${all.length} obtenidas<span class="pbar"><span style="width:${all.length ? (got / all.length) * 100 : 0}%"></span></span></div>
      ${rules.length ? `<details class="panel rules"><summary>Reglas para conseguir ${st.t}ª armas (${rules.length})</summary><ul class="ticks">${rules.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
        ${W.weapon_tiers_note ? `<p class="small muted">${esc(W.weapon_tiers_note)}</p>` : ""}${arr(W.notes).length ? `<h4>Notas de la investigación</h4><ul class="ticks small">${W.notes.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</details>` : ""}
      <div class="grid weapons">${list.length ? list.map(weaponCard).join("") : empty("armas con ese filtro")}</div>`;
  };
  bindChips(root, (n, v) => { st[n] = v; draw(); });
  $("#q").oninput = (e) => { st.q = e.target.value.toLowerCase().trim(); draw(); };
  draw();
}

function itemCard(it) {
  const cat = Art.ITEM_CATS[it.category];
  return `<button class="card icard ${isDone("items", it.id) ? "done" : ""}" data-item="${esc(it.id)}" style="--c:${cat.color}">
    <div class="icard-icon">${Art.itemSVG(it)}</div>
    <div class="card-body"><div class="card-title">${esc(it.name)}</div>
      <div class="card-meta">${pill(cat.label, "cat")}${it.difficulty && it.difficulty.length < 22 ? pill(it.difficulty) : ""}${it.verified === false ? `<span class="tag warn">PS2</span>` : ""}</div>
      <p class="small clamp">${esc(it.effect || "")}</p></div></button>`;
}

function viewItems(root) {
  let st = { cat: "all", q: "", sort: "rating" };
  const cats = Object.entries(Art.ITEM_CATS).filter(([k]) => D.items.some((i) => i.category === k));
  root.innerHTML = sectionHead("Ítems y tesoros", "Efecto, etapa, bando, condición y ubicación exacta de cada ítem raro.", "寶") + `
    ${D.itemRules.length ? `<details class="panel rules"><summary>Reglas de ítems</summary><ul class="ticks">${D.itemRules.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></details>` : ""}
    <div class="toolbar">${chips("cat", [{ v: "all", label: "Todos" }, ...cats.map(([k, v]) => ({ v: k, html: `<i class="dot" style="background:${v.color}"></i>${v.label}` }))], st.cat)}
      <select id="sort" aria-label="Ordenar"><option value="rating">Más útiles</option><option value="name">A–Z</option></select>
      <input id="q" type="search" placeholder="Buscar ítem o etapa…" aria-label="Buscar ítem"></div>
    <div id="grid" class="grid items"></div>`;
  const draw = () => {
    let list = D.items.filter((i) => (st.cat === "all" || i.category === st.cat) && (!st.q || `${i.name} ${i.effect} ${i.stage} ${i.how_to_get}`.toLowerCase().includes(st.q)));
    list = list.slice().sort(st.sort === "name" ? (a, b) => a.name.localeCompare(b.name) : (a, b) => (b.rating || 0) - (a.rating || 0));
    $("#grid").innerHTML = list.length ? list.map(itemCard).join("") : empty("ítems");
  };
  bindChips(root, (n, v) => { st[n] = v; draw(); });
  $("#sort").onchange = (e) => { st.sort = e.target.value; draw(); };
  $("#q").oninput = (e) => { st.q = e.target.value.toLowerCase().trim(); draw(); };
  draw();
}

function itemDetail(id) {
  const it = D.items.find((x) => x.id === id);
  if (!it) return;
  const cat = Art.ITEM_CATS[it.category];
  openModal(`<div class="detail">
    <div class="detail-art square">${Art.itemSVG(it)}</div>
    <div class="detail-info"><h2>${esc(it.name)}</h2>
      <div class="card-meta">${pill(cat.label, "cat")}${it.rating ? pill("Utilidad " + "★".repeat(Math.round(it.rating))) : ""}${verifiedTag(it)}</div>
      <div class="callout"><b>Efecto:</b> ${esc(it.effect || "—")}${it.levels ? `<br><b>Niveles:</b> ${esc(it.levels)}` : ""}</div>
      <dl class="kv"><dt>Cómo conseguirlo</dt><dd>${esc(it.how_to_get || "—")}</dd><dt>Etapa</dt><dd>${esc(it.stage || "—")}</dd><dt>Bando</dt><dd>${esc(it.side || "—")}</dd>
        <dt>Dificultad</dt><dd>${esc(it.difficulty || "—")}</dd><dt>Condición</dt><dd>${esc(it.condition || "—")}</dd><dt>Ubicación</dt><dd>${esc(it.location || "—")}</dd></dl>
      ${arr(it.recommended_for).length ? `<p>${arr(it.recommended_for).map((x) => pill(x)).join("")}</p>` : ""}
      <div class="cta"><label class="check"><input type="checkbox" data-prog="items" data-id="${esc(it.id)}" ${isDone("items", it.id) ? "checked" : ""}> Ya lo tengo</label>${dlBtn("item", it.id)}</div>
      ${sourcesHTML(it.sources)}</div></div>`);
}

function viewPowers(root) {
  root.innerHTML = sectionHead("Elementos, gemas y poderes", "DW3 no tiene orbes ni runas: los elementos van ligados a las armas (4ª/5ª) y en el remaster se transfieren con Fusión. Aquí están, junto a todas las técnicas especiales y potenciadores.", "力") + `
    <section class="panel"><h2>Elementos de arma</h2><p class="small muted">Equivalente a los «orbes/gemas» de otros Dynasty Warriors. Se obtienen con las armas 4ª/5ª y se pasan a otra arma con Weapon Fusion.</p>${D.orbs.length ? `<div class="grid orbs">${D.orbs.map((o) => `
      <article class="card pad orb"><div class="orb-art">${Art.orbSVG(o)}</div><h3>${esc(o.name)}</h3>${pill(o.element)}${verifiedTag(o)}
        <p>${esc(o.effect || "")}</p><p class="small"><b>Cómo conseguirlo:</b> ${esc(o.how_to_get || "—")}</p>
        ${arr(o.best_users).length ? `<p class="small"><b>Mejores usuarios:</b> ${o.best_users.map(esc).join(", ")}</p>` : ""}${sourcesHTML(o.sources)}</article>`).join("")}</div>` : empty("elementos")}</section>
    <section class="panel"><h2>Poderes y técnicas especiales</h2>${D.powers.length ? `<div class="grid powers">${D.powers.map((p) => `
      <article class="card pad power">${Art.glyphSVG(p.name, { size: 52 })}<h3>${esc(p.name)}</h3><p>${esc(p.effect || "")}</p>${p.how ? `<p class="small"><b>Cómo:</b> ${esc(p.how)}</p>` : ""}${sourcesHTML(p.sources)}</article>`).join("")}</div>` : empty("poderes")}</section>
    ${D.pickups.length ? `<section class="panel"><h2>Potenciadores en el campo de batalla</h2><table class="table"><thead><tr><th>Objeto</th><th>Efecto</th><th>Notas</th></tr></thead><tbody>
      ${D.pickups.map((p) => `<tr><td><b>${esc(p.name)}</b></td><td>${esc(p.effect || "")}</td><td class="muted">${esc(p.notes || "")}</td></tr>`).join("")}</tbody></table></section>` : ""}`;
}

function viewHorses(root) {
  const bg = D.bodyguards;
  root.innerHTML = sectionHead("Caballos y guardias", "Monturas legendarias y cómo personalizar a tu escolta.", "馬") + `
    <section class="panel"><h2>Caballos</h2>${D.horses.length ? `<div class="grid horses">${D.horses.map((h) => `
      <article class="card horse">${Art.horseSVG(h)}<div class="pad"><h3>${esc(h.name)}</h3>${h.speed ? pill("Velocidad " + h.speed + "/10", "gold") : ""}${verifiedTag(h)}
      <p>${esc(h.traits || "")}</p><p class="small"><b>Cómo conseguirlo:</b> ${esc(h.how_to_get || "—")}</p>${sourcesHTML(h.sources)}</div></article>`).join("")}</div>` : empty("caballos")}</section>
    <section class="panel"><h2>Guardias (Bodyguards)</h2>${!bg ? empty("guardias") : `
      <p>${esc(bg.summary || "")}</p>${bg.how_to_unlock ? `<div class="callout"><b>Cómo desbloquear:</b> ${esc(bg.how_to_unlock)}</div>` : ""}
      ${arr(bg.types).length ? `<div class="grid guards">${bg.types.map((t) => `<article class="card guard">${Art.bodyguardSVG(t)}<div class="pad"><h3>${esc(t.name)}</h3><p>${esc(t.role || "")}</p><p class="small muted">${esc(t.notes || "")}</p></div></article>`).join("")}</div>` : ""}
      <div class="grid-2">${arr(bg.commands).length ? `<div><h3>Órdenes</h3><ul class="ticks">${bg.commands.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
      ${arr(bg.tips).length ? `<div><h3>Consejos</h3><ul class="ticks">${bg.tips.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}</div>${sourcesHTML(bg.sources)}`}</section>`;
}

function viewStages(root) {
  let st = { t: "all", q: "" };
  const types = [...new Set(D.stages.map((s) => s.type).filter(Boolean))];
  const tName = { musou: "Musou", xtreme: "Xtreme", ziluan: "Ziluan", other: "Otras" };
  root.innerHTML = sectionHead("Etapas", "Campos de batalla, oficiales clave y eventos importantes.", "戰") + `
    <div class="toolbar">${chips("t", [{ v: "all", label: "Todas" }, ...types.map((t) => ({ v: t, label: tName[t] || t }))], st.t)}<input id="q" type="search" placeholder="Buscar etapa u oficial…" aria-label="Buscar etapa"></div>
    <div id="grid" class="grid stages"></div>`;
  const draw = () => {
    const list = D.stages.filter((s) => (st.t === "all" || s.type === st.t) && (!st.q || `${s.name} ${arr(s.key_officers).join(" ")} ${s.notes}`.toLowerCase().includes(st.q)));
    $("#grid").innerHTML = list.length ? list.map((s) => {
      const items = D.items.filter((i) => i.stage && s.name && i.stage.toLowerCase().includes(s.name.toLowerCase()));
      const weps = [...D.weapons.fourth, ...D.weapons.fifth].filter((w) => w.stage && s.name && w.stage.toLowerCase().includes(s.name.toLowerCase()));
      return `<article class="card stage">${Art.stageSVG(s)}<div class="pad"><h3>${esc(s.name)}</h3>
        <div class="card-meta">${arr(s.kingdoms).map((k) => kPill(normKingdom(k))).join("")}${pill(tName[s.type] || s.type)}</div>
        ${arr(s.key_officers).length ? `<p class="small"><b>Oficiales clave:</b> ${s.key_officers.map(esc).join(", ")}</p>` : ""}
        ${s.notes ? `<p class="small">${esc(s.notes)}</p>` : ""}
        ${weps.length ? `<p class="small"><b>Armas aquí:</b> ${weps.map((w) => `${esc(w.weapon)} (${w.tier}ª, ${esc(w.character)})`).join(", ")}</p>` : ""}
        ${items.length ? `<p class="small"><b>Ítems aquí:</b> ${items.map((i) => `<button class="linklike" data-item="${esc(i.id)}">${esc(i.name)}</button>`).join(", ")}</p>` : ""}</div></article>`;
    }).join("") : empty("etapas");
  };
  bindChips(root, (n, v) => { st[n] = v; draw(); });
  $("#q").oninput = (e) => { st.q = e.target.value.toLowerCase().trim(); draw(); };
  draw();
}

function viewAchievements(root) {
  let st = { t: "all", q: "" };
  root.innerHTML = sectionHead("Logros y trofeos", "Lista completa con requisitos y consejos. Marca los que ya conseguiste.", "功") + `
    <div class="toolbar">${chips("t", [{ v: "all", label: "Todos" }, { v: "pending", label: "Pendientes" }, { v: "done", label: "Conseguidos" }], st.t)}<input id="q" type="search" placeholder="Buscar logro…" aria-label="Buscar logro"></div>
    <div id="list"></div>`;
  const draw = () => {
    const all = D.achievements;
    const got = all.filter((a) => isDone("ach", a.id)).length;
    const list = all.filter((a) => (st.t === "all" || (st.t === "done" ? isDone("ach", a.id) : !isDone("ach", a.id))) && (!st.q || `${a.name} ${a.description} ${a.tips}`.toLowerCase().includes(st.q)));
    $("#list").innerHTML = `<div class="progress-line"><b>${got}</b> de ${all.length} conseguidos<span class="pbar"><span style="width:${all.length ? (got / all.length) * 100 : 0}%"></span></span></div>
      ${list.length ? `<div class="ach-list">${list.map((a) => `<article class="ach ${isDone("ach", a.id) ? "done" : ""}"><div class="ach-medal">${Art.medalSVG(a)}</div>
        <div><h3>${esc(a.name)}</h3><p>${esc(a.description || "")}</p>${a.tips ? `<p class="small muted">💡 ${esc(a.tips)}</p>` : ""}</div>
        <label class="check"><input type="checkbox" data-prog="ach" data-id="${esc(a.id)}" ${isDone("ach", a.id) ? "checked" : ""}><span class="sr">Conseguido</span></label></article>`).join("")}</div>` : empty("logros")}`;
  };
  bindChips(root, (n, v) => { st[n] = v; draw(); });
  $("#q").oninput = (e) => { st.q = e.target.value.toLowerCase().trim(); draw(); };
  root.addEventListener("change", (e) => { if (e.target.matches('[data-prog="ach"]')) setTimeout(draw, 0); });
  draw();
}

function viewSecrets(root) {
  let st = { c: "all", q: "" };
  const cats = [...new Set(D.secrets.map((s) => s.category).filter(Boolean))];
  root.innerHTML = sectionHead("Secretos, modos y trucos", "Desbloqueos ocultos, estrategias, farmeo y todo lo que el juego no te cuenta.", "秘") + `
    <div class="toolbar">${chips("c", [{ v: "all", label: "Todos" }, ...cats.map((c) => ({ v: c, label: c }))], st.c)}<input id="q" type="search" placeholder="Buscar secreto…" aria-label="Buscar secreto"></div>
    <div id="grid" class="grid secrets"></div>
    <section class="grid-2">
      <div class="panel"><h2>Modos de juego</h2>${D.modes.length ? D.modes.map((m) => `<div class="mode">${Art.glyphSVG("modo", { size: 36 })}<div><h4>${esc(m.name)}</h4><p class="small">${esc(m.description || "")}</p>${m.unlock ? `<p class="small"><b>Desbloqueo:</b> ${esc(m.unlock)}</p>` : ""}${arr(m.tips).length ? `<ul class="ticks small">${m.tips.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}</div></div>`).join("") : empty("modos")}</div>
      <div class="panel"><h2>Dificultades</h2>${D.difficulties.length ? `<table class="table"><thead><tr><th>Dificultad</th><th>Cómo se desbloquea</th><th>Notas</th></tr></thead><tbody>${D.difficulties.map((d) => `<tr><td><b>${esc(d.name)}</b></td><td>${esc(d.unlock || "")}</td><td class="muted">${esc(d.notes || "")}</td></tr>`).join("")}</tbody></table>` : empty("dificultades")}
        ${D.controls.length ? `<h2>Controles y técnicas</h2><table class="table"><thead><tr><th>Acción</th><th>Entrada</th></tr></thead><tbody>${D.controls.map((c) => `<tr><td><b>${esc(c.action)}</b>${c.notes ? `<div class="small muted">${esc(c.notes)}</div>` : ""}</td><td>${esc(c.input || "")}</td></tr>`).join("")}</tbody></table>` : ""}</div>
    </section>
    <section class="grid-2">
      <div class="panel"><h2>Consejos para principiantes</h2>${D.beginner.length ? `<ul class="ticks">${D.beginner.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : empty("consejos")}</div>
      <div class="panel"><h2>Consejos avanzados</h2>${D.advanced.length ? `<ul class="ticks">${D.advanced.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>` : empty("consejos")}</div>
    </section>`;
  const draw = () => {
    const list = D.secrets.filter((s) => (st.c === "all" || s.category === st.c) && (!st.q || `${s.title} ${s.description} ${s.how}`.toLowerCase().includes(st.q)));
    $("#grid").innerHTML = list.length ? list.map((s) => `<article class="card pad secret">${Art.glyphSVG(s.category || "", { size: 44 })}<h3>${esc(s.title)}</h3>
      <div class="card-meta">${pill(s.category)}${verifiedTag(s)}</div><p>${esc(s.description || "")}</p>${s.how ? `<div class="callout small"><b>Cómo:</b> ${esc(s.how)}</div>` : ""}${sourcesHTML(s.sources)}</article>`).join("") : empty("secretos");
  };
  bindChips(root, (n, v) => { st[n] = v; draw(); });
  $("#q").oninput = (e) => { st.q = e.target.value.toLowerCase().trim(); draw(); };
  draw();
}

// ---------------- Forja (builder) ----------------
function defaultBuild(cid) {
  const ch = D.characters.find((c) => c.id === cid) || D.characters[0];
  return { character: ch?.id, tier: 1, items: [], orb: "", horse: "", guard: "" };
}

function buildSummary(res, b) {
  const c = res.ch;
  const wname = c?.weapons.find((w) => w.tier === b.tier)?.name || [...D.weapons.fourth, ...D.weapons.fifth].find((w) => w.character_id === c?.id && w.tier === b.tier)?.weapon || `${b.tier}ª arma`;
  const orb = D.orbs.find((o) => o.id === b.orb), horse = D.horses.find((h) => h.id === b.horse);
  return { wname, orb, horse };
}

function viewForge(root, params) {
  const shared = params.get("b") ? B.decodeBuild(params.get("b")) : null;
  let b = shared || defaultBuild(params.get("c"));
  b.items = arr(b.items).slice(0, 8);
  const optsChar = K_ORDER.map((k) => `<optgroup label="${Art.KINGDOMS[k].es}">${D.characters.filter((c) => c.kingdom === k).map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join("")}</optgroup>`).join("");
  const optsItems = `<option value="">— vacío —</option>` + Object.keys(Art.ITEM_CATS).map((cat) => {
    const l = D.items.filter((i) => i.category === cat);
    return l.length ? `<optgroup label="${Art.ITEM_CATS[cat].label}">${l.map((i) => `<option value="${esc(i.id)}">${esc(i.name)}</option>`).join("")}</optgroup>` : "";
  }).join("");
  root.innerHTML = sectionHead("Forja del guerrero", "Combina oficial, arma, ítems, elemento, caballo y guardia. Mira cómo cambian sus atributos y para qué objetivo rinde mejor.", "鍛") + `
  <div class="forge">
    <form class="panel forge-form" id="forge" autocomplete="off">
      <label>Oficial<select name="character">${optsChar}</select></label>
      <fieldset><legend>Arma</legend><div class="tiers" id="tiers"></div></fieldset>
      <fieldset><legend>Ítems equipados</legend><div class="slots">${Array.from({ length: SLOTS }, (_, n) => `<select name="item${n}" aria-label="Ítem ${n + 1}">${optsItems}</select>`).join("")}</div></fieldset>
      <label>Elemento del arma (vía Fusión)<select name="orb"><option value="">— sin elemento —</option>${D.orbs.map((o) => `<option value="${esc(o.id)}">${esc(o.name)}</option>`).join("")}</select></label>
      <label>Caballo<select name="horse"><option value="">— a pie —</option>${D.horses.map((h) => `<option value="${esc(h.id)}">${esc(h.name)}</option>`).join("")}</select></label>
      <label>Guardia<select name="guard"><option value="">— sin escolta —</option>${arr(D.bodyguards?.types).map((t) => `<option>${esc(t.name)}</option>`).join("")}</select></label>
      <div class="row-btns">
        <select id="optObj" aria-label="Objetivo para optimizar">${B.OBJECTIVES.map((o) => `<option value="${o.id}">${o.name}</option>`).join("")}</select>
        <button type="button" class="btn primary" id="optimize">Optimizar equipo</button>
        <button type="button" class="btn" id="random">🎲 Aleatorio</button>
        <button type="button" class="btn" id="share">🔗 Copiar enlace</button>
      </div>
    </form>
    <div class="panel forge-out" id="out" aria-live="polite"></div>
  </div>`;
  const f = $("#forge");
  const fill = () => {
    f.character.value = b.character;
    const ch = D.characters.find((c) => c.id === b.character);
    $("#tiers").innerHTML = [1, 2, 3, 4, 5].map((t) => {
      const nm = ch?.weapons.find((w) => w.tier === t)?.name || [...D.weapons.fourth, ...D.weapons.fifth].find((w) => w.character_id === ch?.id && w.tier === t)?.weapon || `${t}ª arma`;
      return `<label class="tier-opt ${b.tier === t ? "on" : ""}"><input type="radio" name="tier" value="${t}" ${b.tier === t ? "checked" : ""}>${Art.weaponSVG(ch?.weapon_type || "", { tier: t, kingdom: ch?.kingdom })}<span>${esc(nm)}</span></label>`;
    }).join("");
    for (let n = 0; n < SLOTS; n++) f[`item${n}`].value = b.items[n] || "";
    f.orb.value = b.orb || ""; f.horse.value = b.horse || ""; f.guard.value = b.guard || "";
  };
  const read = () => {
    b = { character: f.character.value, tier: Number((f.querySelector('input[name="tier"]:checked') || {}).value || b.tier || 1),
      items: Array.from({ length: SLOTS }, (_, n) => f[`item${n}`].value).filter(Boolean), orb: f.orb.value, horse: f.horse.value, guard: f.guard.value };
  };
  const draw = () => {
    const res = B.computeBuild(b, D);
    const scores = B.scoreAll(res.total).sort((x, y) => y.value - x.value);
    const { wname, orb, horse } = buildSummary(res, b);
    const maxScore = B.MAX_STAT;
    $("#out").innerHTML = `<div class="build-head">
        <div class="build-face">${Art.portraitSVG(res.ch || {})}</div>
        <div><h2>${esc(res.ch?.name || "")}</h2><p class="muted">${esc(wname)} · ${b.items.length}/${SLOTS} ítems${orb ? " · " + esc(orb.name) : ""}${horse ? " · " + esc(horse.name) : ""}${b.guard ? " · " + esc(b.guard) : ""}</p>
        <div class="equip-row">${Art.weaponSVG(res.ch?.weapon_type || "", { tier: b.tier, kingdom: res.ch?.kingdom })}${res.items.map((i) => `<span title="${esc(i.name)}">${Art.itemSVG(i)}</span>`).join("")}${orb ? `<span title="${esc(orb.name)}">${Art.orbSVG(orb)}</span>` : ""}</div></div></div>
      <h3>Atributos</h3>${stackedBars(res.base, res.bonus)}
      <h3>Rendimiento por objetivo</h3>
      <div class="bars" role="table" aria-label="Puntuación por objetivo">${scores.map((s, n) => `<div class="bar-row ${n === 0 ? "best" : ""}" role="row"><span class="bar-label" role="rowheader">${s.obj.name}</span><span class="bar-track" role="cell" data-tip="${s.obj.desc}"><span class="bar-fill" style="width:${(s.value / maxScore) * 100}%"></span></span><span class="bar-val" role="cell">${s.value.toFixed(1)}</span></div>`).join("")}</div>
      <div class="callout"><b>Mejor uso:</b> ${esc(scores[0].obj.name)} — ${esc(scores[0].obj.desc)}<ul class="ticks small">${B.explain(res, scores[0].obj).map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`;
    history.replaceState(null, "", `#/forja?b=${B.encodeBuild(b)}`);
  };
  fill(); draw();
  f.addEventListener("change", (e) => {
    if (e.target.name === "character") { b.character = e.target.value; b.tier = 1; fill(); }
    read(); if (e.target.name === "tier") fill(); draw();
  });
  $("#optimize").onclick = () => {
    read();
    const obj = B.OBJECTIVES.find((o) => o.id === $("#optObj").value);
    const ch = D.characters.find((c) => c.id === b.character);
    const best = B.bestBuildFor(ch, obj, B.AVAILABILITY[2], D, SLOTS);
    b = best.build; fill(); draw();
  };
  $("#random").onclick = () => {
    const pick = (l) => l[Math.floor(Math.random() * l.length)];
    const ch = pick(D.characters);
    const pool = D.items.slice().sort(() => Math.random() - 0.5);
    b = { character: ch.id, tier: 1 + Math.floor(Math.random() * 5), items: pool.slice(0, SLOTS).map((i) => i.id), orb: pick(D.orbs)?.id || "", horse: pick(D.horses)?.id || "", guard: pick(arr(D.bodyguards?.types))?.name || "" };
    fill(); draw();
  };
  $("#share").onclick = async () => {
    const url = location.href;
    try { await navigator.clipboard.writeText(url); toast("Enlace copiado: compártelo para mostrar esta build."); } catch { prompt("Copia este enlace:", url); }
  };
}

// ---------------- Combinaciones ----------------
function buildCard(r, rank, obj) {
  const b = r.build;
  const { wname, orb, horse } = buildSummary(r, b);
  return `<article class="card build k-${r.ch.kingdom}">
    <div class="rank">#${rank}</div>
    <div class="build-top"><div class="build-face">${Art.portraitSVG(r.ch)}</div>
      <div><h3>${esc(r.ch.name)}</h3><div class="card-meta">${kPill(r.ch.kingdom)}${pill(`Puntuación ${r.value.toFixed(1)}`, "gold")}</div>
      <p class="small"><b>Arma:</b> ${esc(wname)} (${b.tier}ª)</p></div></div>
    <div class="equip-row">${Art.weaponSVG(r.ch.weapon_type || "", { tier: b.tier, kingdom: r.ch.kingdom })}${r.items.map((i) => `<button class="eq" data-item="${esc(i.id)}" title="${esc(i.name)}">${Art.itemSVG(i)}</button>`).join("")}${orb ? `<span class="eq" title="${esc(orb.name)}">${Art.orbSVG(orb)}</span>` : ""}</div>
    <ul class="small kv-list"><li><b>Ítems:</b> ${r.items.map((i) => esc(i.name)).join(", ") || "—"}</li><li><b>Elemento:</b> ${esc(orb?.name || "—")}</li><li><b>Caballo:</b> ${esc(horse?.name || "—")}</li><li><b>Guardia:</b> ${esc(b.guard || "—")}</li></ul>
    <ul class="ticks small">${B.explain(r, obj).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
    <a class="btn small" href="#/forja?b=${B.encodeBuild(b)}">Abrir en la Forja →</a></article>`;
}

function viewCombos(root) {
  let st = { o: "chaos", a: "endgame", k: "all" };
  root.innerHTML = sectionHead("Combinaciones maestras", "Builds generadas automáticamente según tu objetivo y lo que tengas desbloqueado: guerrero + arma + ítems + elemento + caballo + guardia.", "策") + `
    <div class="objectives" data-chips="o">${B.OBJECTIVES.map((o) => `<button class="obj ${o.id === st.o ? "on" : ""}" data-v="${o.id}" aria-pressed="${o.id === st.o}">${Art.glyphSVG(o.icon, { size: 34 })}<b>${o.name}</b><span>${o.desc}</span></button>`).join("")}</div>
    <div class="toolbar">${chips("a", B.AVAILABILITY.map((a) => ({ v: a.id, label: a.name })), st.a)}
      ${chips("k", [{ v: "all", label: "Todos los reinos" }, ...K_ORDER.map((k) => ({ v: k, html: `${Art.KINGDOMS[k].hanzi} ${Art.KINGDOMS[k].es}` }))], st.k)}</div>
    <p class="muted small" id="availDesc"></p>
    <div id="combos"></div>`;
  const draw = () => {
    const obj = B.OBJECTIVES.find((o) => o.id === st.o);
    const avail = B.AVAILABILITY.find((a) => a.id === st.a);
    $("#availDesc").textContent = `${avail.name}: ${avail.desc} Ítems por build: ${SLOTS} (límite del PS2; el remaster no lo ha confirmado).`;
    if (!D.characters.length) { $("#combos").innerHTML = empty("oficiales"); return; }
    const top = B.topBuilds(obj, avail, D, { slots: SLOTS, n: 6, kingdom: st.k });
    const duos = B.bestDuos(obj, avail, D, { slots: SLOTS, n: 4 });
    const matrix = B.OBJECTIVES.map((o) => ({ o, top: B.topBuilds(o, avail, D, { slots: SLOTS, n: 3 }) }));
    $("#combos").innerHTML = `<h2 class="h2-line">Top builds · ${esc(obj.name)}</h2>
      <div class="grid builds">${top.map((r, n) => buildCard(r, n + 1, obj)).join("") || empty("builds")}</div>
      <h2 class="h2-line">Duplas para co-op (pantalla dividida)</h2>
      <div class="grid duos">${duos.map((d) => `<article class="card pad duo"><div class="duo-faces"><span class="build-face">${Art.portraitSVG(d.a.ch)}</span><span class="plus">+</span><span class="build-face">${Art.portraitSVG(d.b.ch)}</span></div>
        <h3>${esc(d.a.ch.name)} & ${esc(d.b.ch.name)}</h3><p class="small">Cubren: ${B.STATS.filter((s) => d.cover[s.key] >= 9).map((s) => s.label.toLowerCase()).join(", ") || "equilibrio general"}.</p>
        <div class="row-btns"><a class="btn small" href="#/forja?b=${B.encodeBuild(d.a.build)}">${esc(d.a.ch.name)}</a><a class="btn small" href="#/forja?b=${B.encodeBuild(d.b.build)}">${esc(d.b.ch.name)}</a></div></article>`).join("")}</div>
      <h2 class="h2-line">Mejor oficial para cada objetivo</h2>
      <div class="table-wrap"><table class="table"><thead><tr><th>Objetivo</th><th>1º</th><th>2º</th><th>3º</th></tr></thead><tbody>
        ${matrix.map((m) => `<tr><td><b>${m.o.name}</b></td>${m.top.map((r) => `<td><a href="#/forja?b=${B.encodeBuild(r.build)}" class="mtx"><span class="mini-face">${Art.portraitSVG(r.ch)}</span>${esc(r.ch.name)} <span class="muted">${r.value.toFixed(1)}</span></a></td>`).join("")}</tr>`).join("")}
      </tbody></table></div>
      ${arr(D.weapons.fusion?.best_combos).length ? `<h2 class="h2-line">Recetas de Fusión de armas</h2><div class="grid mini">${D.weapons.fusion.best_combos.map((r) => `<div class="card pad recipe">${Art.glyphSVG("combo", { size: 36 })}<b>${esc(r.name)}</b><p>${esc(r.recipe || "")}</p><p class="small muted">${esc(r.why || "")}</p></div>`).join("")}</div>` : ""}
      <p class="muted small">Las puntuaciones son un modelo propio: combinan los atributos relativos de cada oficial con los efectos de su equipo y ponderan según el objetivo. Úsalas como guía, no como datos oficiales del juego.</p>`;
  };
  root.addEventListener("click", (e) => {
    const o = e.target.closest(".obj");
    if (o) { st.o = o.dataset.v; $$(".obj", root).forEach((x) => { x.classList.toggle("on", x === o); x.setAttribute("aria-pressed", x === o); }); draw(); }
  });
  bindChips(root, (n, v) => { if (n !== "o") { st[n] = v; draw(); } });
  draw();
}


// ---------------- Galería ----------------
function svgFor(kind, id) {
  if (kind === "char") { const c = D.characters.find((x) => x.id === id); return c && [c.name, Art.portraitSVG(c)]; }
  if (kind === "item") { const i = D.items.find((x) => x.id === id); return i && [i.name, Art.itemSVG(i)]; }
  if (kind === "weapon") { const w = [...D.weapons.fourth, ...D.weapons.fifth].find((x) => x.id === id); const c = w && D.characters.find((x) => x.id === w.character_id); return w && [w.weapon, Art.weaponSVG(c?.weapon_type || "", { tier: w.tier, name: w.weapon, kingdom: c?.kingdom, element: w.element })]; }
  if (kind === "orb") { const o = D.orbs.find((x) => x.id === id); return o && [o.name, Art.orbSVG(o)]; }
  if (kind === "horse") { const h = D.horses.find((x) => x.id === id); return h && [h.name, Art.horseSVG(h)]; }
  if (kind === "ach") { const a = D.achievements.find((x) => x.id === id); return a && [a.name, Art.medalSVG(a)]; }
  return null;
}
function downloadSVG(kind, id) {
  const r = svgFor(kind, id);
  if (!r) return;
  const [name, svg] = r;
  const xml = svg.replace("<svg ", '<svg xmlns="http://www.w3.org/2000/svg" ');
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml" }));
  a.download = `dw3r-${Art.slug(name)}.svg`;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
const dlBtn = (kind, id) => `<button class="btn small" data-dl="${kind}:${esc(id)}">⬇ Descargar imagen (SVG)</button>`;

function viewGallery(root, params) {
  let st = { g: params.get("g") || "char" };
  const groups = [
    { v: "char", label: `Oficiales (${D.characters.length})` }, { v: "weapon", label: `Armas 4ª/5ª (${D.weapons.fourth.length + D.weapons.fifth.length})` },
    { v: "item", label: `Ítems (${D.items.length})` }, { v: "orb", label: `Elementos (${D.orbs.length})` },
    { v: "horse", label: `Caballos (${D.horses.length})` }, { v: "ach", label: `Logros (${D.achievements.length})` },
  ];
  root.innerHTML = sectionHead("Galería", "Todas las ilustraciones en grande. Toca una para ver su ficha o descárgala en SVG (nítida a cualquier tamaño).", "畫") +
    `<div class="toolbar">${chips("g", groups, st.g)}</div><div id="gal" class="gallery"></div>`;
  const draw = () => {
    const list = st.g === "char" ? D.characters.map((c) => ({ id: c.id, name: c.name, sub: c.kingdom, open: `data-char="${esc(c.id)}"` }))
      : st.g === "item" ? D.items.map((i) => ({ id: i.id, name: i.name, sub: Art.ITEM_CATS[i.category].label, open: `data-item="${esc(i.id)}"` }))
      : st.g === "weapon" ? [...D.weapons.fourth, ...D.weapons.fifth].map((w) => ({ id: w.id, name: w.weapon, sub: `${w.tier}ª · ${w.character}`, open: `data-char="${esc(w.character_id)}"` }))
      : st.g === "orb" ? D.orbs.map((o) => ({ id: o.id, name: o.name, sub: o.element, open: "" }))
      : st.g === "horse" ? D.horses.map((h) => ({ id: h.id, name: h.name, sub: "", open: "" }))
      : D.achievements.map((a) => ({ id: a.id, name: a.name, sub: a.type || "", open: "" }));
    $("#gal").innerHTML = list.length ? list.map((x) => `<figure class="gal-item ${st.g}"><button class="gal-img" ${x.open} aria-label="${esc(x.name)}">${svgFor(st.g, x.id)?.[1] || ""}</button>
      <figcaption><b>${esc(x.name)}</b><span>${esc(x.sub || "")}</span><button class="dl" data-dl="${st.g}:${esc(x.id)}" title="Descargar SVG" aria-label="Descargar ${esc(x.name)}">⬇</button></figcaption></figure>`).join("") : empty("imágenes");
  };
  bindChips(root, (n, v) => { st[n] = v; draw(); });
  draw();
}

// ---------------- Prompt + fuentes ----------------
function md(text) {
  const lines = text.split(/\r?\n/);
  let html = "", inList = false, inCode = false;
  for (const raw of lines) {
    if (raw.startsWith("```")) { html += inCode ? "</code></pre>" : "<pre><code>"; inCode = !inCode; continue; }
    if (inCode) { html += esc(raw) + "\n"; continue; }
    const l = raw.trimEnd();
    const li = l.match(/^\s*(?:[-*]|\d+\.)\s+(.*)/);
    if (li) { if (!inList) { html += "<ul>"; inList = true; } html += `<li>${inline(li[1])}</li>`; continue; }
    if (inList) { html += "</ul>"; inList = false; }
    const h = l.match(/^(#{1,4})\s+(.*)/);
    if (h) html += `<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`;
    else if (l.startsWith(">")) html += `<blockquote>${inline(l.replace(/^>\s?/, ""))}</blockquote>`;
    else if (l) html += `<p>${inline(l)}</p>`;
  }
  return html + (inList ? "</ul>" : "");
  function inline(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>").replace(/`(.+?)`/g, "<code>$1</code>"); }
}

async function viewPrompt(root) {
  const all = new Set();
  const walk = (o) => { if (!o || typeof o !== "object") return; if (Array.isArray(o.sources)) o.sources.forEach((u) => all.add(u)); for (const v of Object.values(o)) if (typeof v === "object") walk(v); };
  walk(D.meta);
  const byDomain = {};
  [...all].filter((u) => /^https?:/.test(u)).forEach((u) => { const d = u.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]; (byDomain[d] ||= []).push(u); });
  root.innerHTML = sectionHead("El Prompt Supremo", "El mega-prompt que generó esta guía, y todas las fuentes consultadas.", "令") + `<article class="panel prose" id="prompt">Cargando…</article>
    <section class="panel"><h2>Fuentes (${all.size})</h2>${Object.entries(byDomain).sort((a, b) => b[1].length - a[1].length).map(([d, l]) => `<details><summary><b>${esc(d)}</b> · ${l.length}</summary><ul>${l.map((u) => `<li><a href="${esc(u)}" target="_blank" rel="noopener">${esc(u)}</a></li>`).join("")}</ul></details>`).join("")}</section>`;
  try { const t = await (await fetch("PROMPT.md")).text(); $("#prompt").innerHTML = md(t); } catch { $("#prompt").textContent = "No se pudo cargar PROMPT.md"; }
}

// ---------------- Búsqueda global ----------------
function viewSearch(root, params) {
  const q = (params.get("q") || "").toLowerCase().trim();
  const has = (...xs) => xs.join(" ").toLowerCase().includes(q);
  const groups = !q ? [] : [
    ["Oficiales", D.characters.filter((c) => has(c.name, c.weapon_type, c.unlock)).map((c) => `<button class="res" data-char="${esc(c.id)}"><span class="mini-face">${Art.portraitSVG(c)}</span>${esc(c.name)}<small>${esc(c.unlock || "")}</small></button>`)],
    ["Armas", [...D.weapons.fourth, ...D.weapons.fifth].filter((w) => has(w.weapon, w.character, w.stage, w.condition)).map((w) => `<a class="res" href="#/armas?t=${w.tier}">${Art.weaponSVG("", { tier: w.tier, name: w.weapon })}${esc(w.weapon)} · ${esc(w.character)}<small>${esc(w.stage || "")}</small></a>`)],
    ["Ítems", D.items.filter((i) => has(i.name, i.effect, i.stage, i.how_to_get)).map((i) => `<button class="res" data-item="${esc(i.id)}">${Art.itemSVG(i)}${esc(i.name)}<small>${esc(i.effect || "")}</small></button>`)],
    ["Elementos, caballos y poderes", [...D.orbs.map((o) => [o.name, o.effect, "orbes"]), ...D.horses.map((h) => [h.name, h.traits, "caballos"]), ...D.powers.map((p) => [p.name, p.effect, "orbes"])].filter(([n, e]) => has(n, e)).map(([n, e, r]) => `<a class="res" href="#/${r}">${Art.glyphSVG(n, { size: 36 })}${esc(n)}<small>${esc(e || "")}</small></a>`)],
    ["Secretos", D.secrets.filter((s) => has(s.title, s.description, s.how)).map((s) => `<a class="res" href="#/secretos">${Art.glyphSVG(s.category || "", { size: 36 })}${esc(s.title)}<small>${esc(s.description || "")}</small></a>`)],
    ["Logros", D.achievements.filter((a) => has(a.name, a.description)).map((a) => `<a class="res" href="#/logros">${Art.medalSVG(a)}${esc(a.name)}<small>${esc(a.description || "")}</small></a>`)],
    ["Etapas", D.stages.filter((s) => has(s.name, arr(s.key_officers).join(" "), s.notes)).map((s) => `<a class="res" href="#/etapas">${Art.glyphSVG("estrategia", { size: 36 })}${esc(s.name)}<small>${esc(s.notes || "")}</small></a>`)],
  ].filter((g) => g[1].length);
  root.innerHTML = sectionHead(`Resultados para “${esc(params.get("q") || "")}”`, `${groups.reduce((n, g) => n + g[1].length, 0)} coincidencias`, "尋")
    + (groups.length ? groups.map(([t, l]) => `<section class="panel"><h2>${t} (${l.length})</h2><div class="results">${l.slice(0, 40).join("")}</div></section>`).join("") : empty("resultados para esa búsqueda"));
}

// ---------------- Router y eventos globales ----------------
function bindChips(root, cb) {
  root.addEventListener("click", (e) => {
    const c = e.target.closest(".chip");
    if (!c) return;
    const g = c.closest("[data-chips]");
    $$(".chip", g).forEach((x) => { x.classList.toggle("on", x === c); x.setAttribute("aria-pressed", x === c); });
    cb(g.dataset.chips, c.dataset.v);
  });
}

function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 2600);
}

const ROUTES = {
  "": viewHome, personajes: viewCharacters, armas: viewWeapons, items: viewItems, orbes: viewPowers, caballos: viewHorses,
  etapas: viewStages, logros: viewAchievements, secretos: viewSecrets, forja: viewForge, combos: viewCombos, galeria: viewGallery, prompt: viewPrompt, buscar: viewSearch,
};

let lastPath = null;
function router() {
  const [path, query] = location.hash.replace(/^#\/?/, "").split("?");
  const params = new URLSearchParams(query || "");
  const view = ROUTES[path] ?? viewHome;
  if (path === "forja" && lastPath === "forja" && params.get("b")) return; // la forja actualiza su propio hash
  lastPath = path;
  const old = $("#app");
  const root = old.cloneNode(false); // elimina listeners de la vista anterior
  old.replaceWith(root);
  view(root, params);
  $$(".nav a").forEach((a) => a.classList.toggle("active", a.getAttribute("href").replace("#/", "") === path));
  $(".nav")?.classList.remove("open");
  window.scrollTo({ top: 0 });
  const TITLES = { personajes: "Oficiales", armas: "Armas", items: "Ítems", orbes: "Elementos y poderes", caballos: "Caballos y guardias", etapas: "Etapas", logros: "Logros", secretos: "Secretos", forja: "Forja", combos: "Combinaciones", galeria: "Galería", prompt: "Prompt Supremo", buscar: "Búsqueda" };
  document.title = `${TITLES[path] ? TITLES[path] + " · " : ""}DW3 Remastered · Códice Supremo`;
}

document.addEventListener("click", (e) => {
  if (e.target.closest("[data-dl]")) { const [k, id] = e.target.closest("[data-dl]").dataset.dl.split(":"); downloadSVG(k, id); return; }
  const ch = e.target.closest("[data-char]");
  if (ch) { e.preventDefault(); charDetail(ch.dataset.char); return; }
  const it = e.target.closest("[data-item]");
  if (it) { e.preventDefault(); itemDetail(it.dataset.item); return; }
  if (e.target.closest("#modal-close") || e.target.id === "modal") closeModal();
  if (e.target.closest("#menu")) $(".nav").classList.toggle("open");
});
document.addEventListener("change", (e) => {
  const p = e.target.closest("[data-prog]");
  if (p) { toggleProgress(p.dataset.prog, p.dataset.id, p.checked); p.closest(".card,.ach")?.classList.toggle("done", p.checked); toast(p.checked ? "Progreso guardado en este navegador." : "Marcado como pendiente."); }
});
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#modal").hidden) closeModal(); });
// Tooltip para barras
document.addEventListener("pointerover", (e) => {
  const t = e.target.closest("[data-tip]"); const tip = $("#tip");
  if (!t) { tip.hidden = true; return; }
  tip.textContent = t.dataset.tip; tip.hidden = false;
  const r = t.getBoundingClientRect();
  tip.style.left = `${Math.min(window.innerWidth - tip.offsetWidth - 8, Math.max(8, r.left + r.width / 2 - tip.offsetWidth / 2))}px`;
  tip.style.top = `${r.top + window.scrollY - tip.offsetHeight - 8}px`;
});

$("#search").addEventListener("submit", (e) => {
  e.preventDefault();
  const q = $("#search input").value.trim();
  if (q) location.hash = `#/buscar?q=${encodeURIComponent(q)}`;
});

(async function init() {
  const files = ["characters", "weapons", "items", "secrets"];
  const res = await Promise.allSettled(files.map((f) => fetch(`data/${f}.json`, { cache: "no-cache" }).then((r) => (r.ok ? r.json() : Promise.reject(r.status)))));
  const [c, w, i, s] = res.map((r) => (r.status === "fulfilled" ? r.value : {}));
  D = normalize(c, w, i, s);
  const slotRule = D.itemRules.join(" ").match(/(\d+)\s*(?:espacios|ranuras|slots|huecos|tipos de objetos)/i);
  SLOTS = slotRule ? Math.min(8, Math.max(2, Number(slotRule[1]))) : 5;
  window.addEventListener("hashchange", router);
  router();
})();
