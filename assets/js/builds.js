// Motor de combinaciones: calcula perfiles de guerrero (oficial + arma + ítems + orbe + caballo + guardia)
// y genera builds óptimas según el objetivo del jugador.
import { elementKey } from "./art.js";

export const STATS = [
  { key: "power", label: "Poder" },
  { key: "speed", label: "Velocidad" },
  { key: "range", label: "Alcance" },
  { key: "crowd", label: "Multitudes" },
  { key: "defense", label: "Defensa" },
  { key: "musou", label: "Musou" },
];
export const MAX_STAT = 14;

export const OBJECTIVES = [
  { id: "chaos", name: "Sobrevivir en Chaos", icon: "guard", desc: "Máxima resistencia y Musou de emergencia para la dificultad más alta.",
    w: { power: 0.15, speed: 0.05, range: 0.1, crowd: 0.15, defense: 0.35, musou: 0.2 }, orb: ["vorpal", "fuego"], cats: ["vida", "defensa", "musou"] },
  { id: "multitudes", name: "Arrasar multitudes", icon: "musou", desc: "KOs masivos: farmeo de 1000 KO, logros y limpieza de mapas.",
    w: { power: 0.15, speed: 0.05, range: 0.25, crowd: 0.4, defense: 0.0, musou: 0.15 }, orb: ["rayo", "fuego"], cats: ["ataque", "elemental", "musou"] },
  { id: "jefes", name: "Cazar oficiales y a Lu Bu", icon: "counter", desc: "Daño concentrado para duelos, generales enemigos y Lu Bu.",
    w: { power: 0.4, speed: 0.1, range: 0.1, crowd: 0.0, defense: 0.2, musou: 0.2 }, orb: ["vorpal", "fuego"], cats: ["ataque", "defensa", "musou"] },
  { id: "speedrun", name: "Speedrun", icon: "evasion", desc: "Cruzar el mapa y cerrar etapas lo más rápido posible.",
    w: { power: 0.2, speed: 0.45, range: 0.1, crowd: 0.15, defense: 0.0, musou: 0.1 }, orb: ["rayo", "viento"], cats: ["velocidad", "caballo", "ataque"] },
  { id: "musou", name: "Musou infinito", icon: "power", desc: "Recargar y lanzar Musou sin parar (True Musou con poca vida).",
    w: { power: 0.15, speed: 0.0, range: 0.0, crowd: 0.2, defense: 0.2, musou: 0.45 }, orb: ["fuego", "rayo"], cats: ["musou", "vida", "defensa"] },
  { id: "novato", name: "Principiante", icon: "tip", desc: "Perdona errores: alcance amplio, defensa alta y controles simples.",
    w: { power: 0.15, speed: 0.0, range: 0.25, crowd: 0.2, defense: 0.3, musou: 0.1 }, orb: ["fuego", "viento"], cats: ["vida", "defensa", "ataque"] },
  { id: "armas", name: "Cazar 4ª y 5ª armas", icon: "strategy", desc: "Cumplir condiciones de etapa rápido y sin morir en Hard/Chaos.",
    w: { power: 0.3, speed: 0.3, range: 0.0, crowd: 0.1, defense: 0.2, musou: 0.1 }, orb: ["vorpal", "rayo"], cats: ["velocidad", "ataque", "defensa"] },
];

export const AVAILABILITY = [
  { id: "inicio", name: "Desde el inicio", desc: "Solo oficiales iniciales, armas 1-3 e ítems de Easy/Normal.", maxTier: 3, startersOnly: true, maxDiff: 1 },
  { id: "medio", name: "Partida avanzada", desc: "Todos los oficiales, hasta 4ª arma e ítems hasta Hard.", maxTier: 4, startersOnly: false, maxDiff: 2 },
  { id: "endgame", name: "Endgame (Chaos)", desc: "Todo desbloqueado: 5ª arma, todos los ítems y elementos vía Fusión.", maxTier: 5, startersOnly: false, maxDiff: 3 },
];

const zero = () => ({ power: 0, speed: 0, range: 0, crowd: 0, defense: 0, musou: 0 });
const add = (a, b, k = 1) => { for (const s in a) a[s] += (b[s] || 0) * k; return a; };

export function diffLevel(d) {
  const t = `${d || ""}`.toLowerCase();
  if (/chaos|caos/.test(t)) return 3;
  if (/very hard|muy dif|hard|dif[ií]cil/.test(t)) return 2;
  if (/normal|easy|f[aá]cil|any|cualquier/.test(t)) return 1;
  return 1;
}

// Vector de stats que aporta un ítem a partir de su categoría y del texto de su efecto.
export function itemVector(item) {
  const v = zero();
  const mag = 0.6 + ((Number(item.rating) || 3) / 5) * 1.4;
  const cat = item.category;
  const map = {
    vida: { defense: 1.2 }, ataque: { power: 1.3 }, defensa: { defense: 1.3 }, musou: { musou: 1.3 },
    velocidad: { speed: 1.3 }, elemental: { crowd: 1, power: 0.4 }, caballo: { speed: 0.9 },
    guardia: { defense: 0.5, crowd: 0.5 }, utilidad: { speed: 0.3, defense: 0.3 }, especial: { power: 0.6, musou: 0.6 },
  };
  add(v, map[cat] || {}, mag);
  const t = `${item.effect || ""} ${item.name || ""}`.toLowerCase();
  const kw = [
    [/alcance|range|reach/, "range"], [/ataque|attack|da[ñn]o|damage|fuerza/, "power"], [/defensa|defense|armor|armadura/, "defense"],
    [/musou/, "musou"], [/velocidad|speed|r[aá]pid|movimiento/, "speed"], [/vida|life|salud|health|hp\b/, "defense"],
    [/fuego|fire|hielo|ice|rayo|lightning|vorpal|elemento|multitud|crowd/, "crowd"],
  ];
  for (const [re, k] of kw) if (re.test(t)) v[k] += 0.35 * mag;
  return v;
}

export function orbVector(orb) {
  if (!orb) return zero();
  const k = elementKey(`${orb.element || ""} ${orb.name || ""}`);
  return {
    fuego: { power: 0.8, crowd: 1.6 }, hielo: { defense: 1.0, crowd: 1.0 }, rayo: { crowd: 2.0, range: 0.4 },
    vorpal: { power: 2.2 }, veneno: { crowd: 1.0, power: 0.6 }, viento: { range: 1.2, crowd: 0.8 },
  }[k] || { crowd: 1 };
}

export function horseVector(h) {
  if (!h) return zero();
  const s = Number(h.speed) || 6;
  const v = zero();
  v.speed = s / 4;
  if (/elephant|elefante/i.test(h.name || "")) { v.defense += 1; v.crowd += 0.6; v.speed -= 0.6; }
  return v;
}

export function guardVector(g) {
  if (!g) return zero();
  const t = `${g.name || ""} ${g.role || ""}`.toLowerCase();
  const v = zero();
  if (/arquer|archer|arco|bow|crossbow|ballest|distancia/.test(t)) v.range += 0.8;
  if (/escudo|shield|defens|protec/.test(t)) v.defense += 0.9;
  if (/ataque|ofens|asalt|fuerza|power/.test(t)) v.power += 0.7;
  if (/caball|cavalry|jinete|r[aá]pid/.test(t)) v.speed += 0.6;
  if (/musou|apoyo|support|sanad|heal/.test(t)) v.musou += 0.6;
  if (!Object.values(v).some(Boolean)) v.crowd += 0.5;
  return v;
}

export function weaponBonus(tier) {
  return { power: [0, 0.7, 1.4, 2.4, 3.4][tier - 1] || 0, range: tier >= 4 ? 0.5 : 0, crowd: tier >= 5 ? 0.6 : 0 };
}

export function baseStats(ch) {
  const r = ch?.ratings || {};
  const v = zero();
  for (const s of STATS) v[s.key] = Number(r[s.key]) || 5;
  return v;
}

export function computeBuild(b, data) {
  const ch = data.characters.find((c) => c.id === b.character);
  const base = baseStats(ch);
  const bonus = zero();
  add(bonus, weaponBonus(b.tier || 1));
  const items = (b.items || []).map((id) => data.items.find((i) => i.id === id)).filter(Boolean);
  // Rendimiento decreciente: el mismo tipo de bono rinde menos al acumularse.
  const acc = zero();
  for (const it of items) {
    const v = itemVector(it);
    for (const s in v) { const eff = v[s] / (1 + acc[s] * 0.25); bonus[s] += eff; acc[s] += v[s]; }
  }
  add(bonus, orbVector(data.orbs.find((o) => o.id === b.orb)));
  add(bonus, horseVector(data.horses.find((h) => h.id === b.horse)));
  add(bonus, guardVector((data.bodyguards?.types || []).find((g) => g.name === b.guard)));
  const total = zero();
  for (const s in total) total[s] = Math.min(MAX_STAT, Math.max(0, base[s] + bonus[s]));
  return { ch, base, bonus, total, items };
}

export const score = (total, obj) => STATS.reduce((sum, s) => sum + (total[s.key] || 0) * (obj.w[s.key] || 0), 0);

export function scoreAll(total) {
  return OBJECTIVES.map((o) => ({ obj: o, value: score(total, o) }));
}

function maxTierFor(ch, data, cap) {
  let t = 3;
  if ((data.weapons?.fourth || []).some((w) => w.character_id === ch.id)) t = 4;
  if ((data.weapons?.fifth || []).some((w) => w.character_id === ch.id)) t = 5;
  if ((ch.weapons || []).filter((w) => w && w.name).length >= 5) t = Math.max(t, 5);
  return Math.min(t, cap);
}

// Construye la mejor build posible para un oficial y un objetivo.
export function bestBuildFor(ch, obj, avail, data, slots) {
  const itemPool = data.items.filter((i) => i.equippable !== false && diffLevel(i.difficulty) <= avail.maxDiff && (i.category !== "caballo" || obj.id === "speedrun"));
  const chosen = [];
  const acc = zero();
  const ranked = itemPool.map((it) => ({ it, v: itemVector(it) }));
  for (let n = 0; n < slots && ranked.length; n++) {
    let best = null, bestVal = -1;
    for (const r of ranked) {
      if (chosen.includes(r.it.id)) continue;
      let val = 0;
      for (const s in r.v) val += (r.v[s] / (1 + acc[s] * 0.25)) * (obj.w[s] || 0);
      if (obj.cats.includes(r.it.category)) val *= 1.15;
      if (val > bestVal) { bestVal = val; best = r; }
    }
    if (!best) break;
    chosen.push(best.it.id);
    for (const s in best.v) acc[s] += best.v[s];
  }
  const orbs = data.orbs.slice().sort((a, b) => score(orbVector(b), obj) - score(orbVector(a), obj));
  const orb = orbs.find((o) => obj.orb.includes(elementKey(`${o.element} ${o.name}`))) || orbs[0];
  const horse = data.horses.slice().sort((a, b) => score(horseVector(b), obj) - score(horseVector(a), obj))[0];
  const guards = data.bodyguards?.types || [];
  const guard = guards.slice().sort((a, b) => score(guardVector(b), obj) - score(guardVector(a), obj))[0];
  const build = { character: ch.id, tier: maxTierFor(ch, data, avail.maxTier), items: chosen, orb: orb?.id, horse: horse?.id, guard: guard?.name };
  const res = computeBuild(build, data);
  return { build, ...res, value: score(res.total, obj) };
}

export function topBuilds(obj, avail, data, { slots = 4, n = 6, kingdom = "all" } = {}) {
  return data.characters
    .filter((c) => (!avail.startersOnly || c.starter) && (kingdom === "all" || c.kingdom === kingdom))
    .map((c) => bestBuildFor(c, obj, avail, data, slots))
    .sort((a, b) => b.value - a.value)
    .slice(0, n);
}

// Duplas para co-op: maximiza la cobertura combinada (el mejor de los dos en cada stat).
export function bestDuos(obj, avail, data, { slots = 4, n = 5 } = {}) {
  const pool = topBuilds(obj, avail, data, { slots, n: 14 });
  const duos = [];
  for (let i = 0; i < pool.length; i++) for (let j = i + 1; j < pool.length; j++) {
    const a = pool[i], b = pool[j];
    const cover = zero();
    for (const s in cover) cover[s] = Math.max(a.total[s], b.total[s]);
    const diversity = new Set([a.ch.kingdom, b.ch.kingdom]).size === 2 ? 0.15 : 0;
    duos.push({ a, b, cover, value: score(cover, obj) + (a.value + b.value) * 0.15 + diversity });
  }
  return duos.sort((x, y) => y.value - x.value).slice(0, n);
}

export function explain(res, obj) {
  const tips = [];
  const t = res.total;
  const top = STATS.slice().sort((a, b) => t[b.key] - t[a.key]);
  tips.push(`Fortalezas: ${top.slice(0, 2).map((s) => s.label.toLowerCase()).join(" y ")}.`);
  const weakest = top[top.length - 1];
  if ((obj.w[weakest.key] || 0) >= 0.15) tips.push(`Ojo: ${weakest.label.toLowerCase()} es su punto débil para este objetivo; compénsalo con ítems de esa categoría.`);
  if (res.items.some((i) => i.category === "musou") && t.musou >= 10) tips.push("Combina la barra de Musou alta con True Musou (vida en rojo) para daño extra.");
  if (t.speed >= 10) tips.push("Velocidad alta: ideal para llegar primero a los eventos que activan armas 4ª/5ª.");
  if (t.defense >= 11) tips.push("Defensa muy alta: puedes priorizar ataque en los espacios restantes.");
  return tips;
}

export const encodeBuild = (b) => btoa(unescape(encodeURIComponent(JSON.stringify(b)))).replace(/=+$/, "");
export const decodeBuild = (s) => { try { return JSON.parse(decodeURIComponent(escape(atob(s)))); } catch { return null; } };
