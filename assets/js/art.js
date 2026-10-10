// Generador de ilustraciones SVG originales (sin arte con copyright de Koei Tecmo).
// Cada personaje, arma, ítem, orbe, caballo y logro recibe una imagen vectorial nítida
// que escala a cualquier tamaño.

let UID = 0;
const uid = (p) => `${p}${++UID}`;

export function hashStr(s = "") {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const slug = (s = "") =>
  s.toString().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const esc = (s = "") => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

export const KINGDOMS = {
  Wei:   { main: "#2a5cb3", dark: "#0c1a3a", light: "#5f93ec", accent: "#9cc3ff", hanzi: "魏", es: "Wei" },
  Shu:   { main: "#2b8a4c", dark: "#0b2a17", light: "#4fc47a", accent: "#9ff0b8", hanzi: "蜀", es: "Shu" },
  Wu:    { main: "#bf3a2a", dark: "#3d0f09", light: "#ef6a52", accent: "#ffb3a2", hanzi: "吳", es: "Wu" },
  Other: { main: "#7a49b6", dark: "#21103b", light: "#a77ae6", accent: "#e0c4ff", hanzi: "他", es: "Otros" },
};
export const kingdomOf = (k) => KINGDOMS[k] || KINGDOMS.Other;

// Nombres en caracteres chinos tradicionales para el sello de cada retrato.
const HANZI = {
  "zhao-yun": "趙雲", "guan-yu": "關羽", "zhang-fei": "張飛", "zhuge-liang": "諸葛亮", "liu-bei": "劉備",
  "ma-chao": "馬超", "huang-zhong": "黃忠", "jiang-wei": "姜維", "wei-yan": "魏延", "pang-tong": "龐統",
  "yue-ying": "月英", "guan-ping": "關平", "xing-cai": "星彩", "ma-dai": "馬岱", "pang-de": "龐德",
  "cao-cao": "曹操", "xiahou-dun": "夏侯惇", "xiahou-yuan": "夏侯淵", "dian-wei": "典韋", "xu-zhu": "許褚",
  "zhang-liao": "張遼", "sima-yi": "司馬懿", "xu-huang": "徐晃", "zhang-he": "張郃", "zhen-ji": "甄姬",
  "cao-ren": "曹仁", "cao-pi": "曹丕", "sun-jian": "孫堅", "sun-ce": "孫策", "sun-quan": "孫權",
  "zhou-yu": "周瑜", "lu-xun": "陸遜", "gan-ning": "甘寧", "lu-meng": "呂蒙", "taishi-ci": "太史慈",
  "sun-shang-xiang": "孫尚香", "da-qiao": "大喬", "xiao-qiao": "小喬", "huang-gai": "黃蓋", "zhou-tai": "周泰",
  "ling-tong": "凌統", "lu-bu": "呂布", "diao-chan": "貂蟬", "dong-zhuo": "董卓", "yuan-shao": "袁紹",
  "zhang-jiao": "張角", "meng-huo": "孟獲", "zhu-rong": "祝融", "ziluan": "紫鸞", "zuo-ci": "左慈",
  "fu-xi": "伏羲", "nu-wa": "女媧",
};

const FEMALE = new Set(["zhen-ji", "sun-shang-xiang", "da-qiao", "xiao-qiao", "diao-chan", "zhu-rong", "yue-ying", "xing-cai", "nu-wa"].map((x) => x.replace(/-/g, "")));

// Rasgos visuales por oficial: tocado, barba, complexión, vestimenta.
const LOOKS = {
  "zhao-yun": { head: "plume" }, "guan-yu": { head: "cap", beard: "long", build: 1.12 },
  "zhang-fei": { head: "headband", beard: "spiky", build: 1.22 }, "zhuge-liang": { head: "scholar", body: "robe", build: 0.86 },
  "liu-bei": { head: "crown", beard: "short" }, "ma-chao": { head: "lionhelm" }, "huang-zhong": { head: "helmet", beard: "long" },
  "jiang-wei": { head: "plume" }, "wei-yan": { head: "mask", build: 1.12 }, "pang-tong": { head: "hood", body: "robe", build: 0.9 },
  "cao-cao": { head: "crown", beard: "short" }, "xiahou-dun": { head: "helmet", patch: true }, "xiahou-yuan": { head: "helmet", beard: "short" },
  "dian-wei": { head: "bald", band: true, build: 1.28 }, "xu-zhu": { head: "bald", build: 1.4 }, "zhang-liao": { head: "helmet", beard: "short" },
  "sima-yi": { head: "scholar", body: "robe", build: 0.86 }, "xu-huang": { head: "helmet", build: 1.12 }, "zhang-he": { head: "longhair", build: 0.92 },
  "zhen-ji": { head: "bun", body: "robe" }, "sun-jian": { head: "crown", beard: "short" }, "sun-ce": { head: "headband" },
  "sun-quan": { head: "crown", beard: "short" }, "zhou-yu": { head: "crown" }, "lu-xun": { head: "cap", build: 0.92 },
  "gan-ning": { head: "spiky", feather: true }, "lu-meng": { head: "helmet", beard: "short" }, "taishi-ci": { head: "headband" },
  "sun-shang-xiang": { head: "bun" }, "da-qiao": { head: "twinbuns", body: "robe" }, "xiao-qiao": { head: "twinbuns", body: "robe" },
  "huang-gai": { head: "bald", beard: "short", build: 1.2 }, "zhou-tai": { head: "longhair" }, "lu-bu": { head: "feathers", build: 1.16 },
  "diao-chan": { head: "bun", body: "robe" }, "dong-zhuo": { head: "crown", beard: "short", build: 1.45 }, "yuan-shao": { head: "crown", beard: "short" },
  "zhang-jiao": { head: "turban", beard: "long", body: "robe" }, "meng-huo": { head: "tribal", beard: "spiky", body: "bare", build: 1.38 },
  "zhu-rong": { head: "tribal" }, "ziluan": { head: "ponytail" }, "cao-ren": { head: "helmet", build: 1.15 }, "cao-pi": { head: "crown" },
  "guan-ping": { head: "headband" }, "xing-cai": { head: "bun" }, "yue-ying": { head: "bun", body: "robe" }, "ling-tong": { head: "ponytail" },
  "fu-xi": { head: "longhair", build: 1.12 }, "nu-wa": { head: "bun", body: "robe" },
};
const compact = (id = "") => id.replace(/-/g, "");
const HANZI_C = Object.fromEntries(Object.entries(HANZI).map(([k, v]) => [compact(k), v]));
const LOOKS_C = Object.fromEntries(Object.entries(LOOKS).map(([k, v]) => [compact(k), v]));

// ---------- ARMAS (dibujadas en vertical: punta en y=-48, mango en y=+46) ----------
export function weaponKind(type = "", name = "") {
  const t = ` ${(type || name || "").toLowerCase()} `;
  const rules = [
    [/twin (sword|sabre|saber|blade)s?|dual sword|espadas gemelas/, "twinswords"],
    [/serpent|viper|snake|serpiente/, "serpent"],
    [/halberd|\bji\b|alabarda/, "halberd"],
    [/glaive|guan dao|crescent|\bblade\b|pole.?arm|podao|cuchilla/, "glaive"],
    [/trident|spear|lance|lanza|pike/, "spear"],
    [/dancing fans?|twin fans?|\bfans\b|abanicos/, "fans"],
    [/feather fan|\bfan\b|abanico/, "fan"],
    [/flute|flauta/, "flute"],
    [/claws?\b|garras?/, "claws"],
    [/tonfa/, "tonfa"],
    [/chakram|\brings?\b|anillos?/, "chakram"],
    [/twin rods?|\brods\b|iron rods?|varas|whips?/, "rods"],
    [/\bmace|maza/, "mace"],
    [/\bclub|garrote|morning star|cudgel|bludgeon/, "club"],
    [/\baxe|hacha/, "axe"],
    [/staff|\brod\b|b[aá]culo|cetro|scepter|wand/, "staff"],
    [/fist|gauntlet|knuckle|pu[ñn]o|guantelete/, "fist"],
    [/\bbow\b|\barco\b/, "bow"],
    [/boomerang|knife|knives|cuchillos|throwing/, "boomerang"],
    [/nodachi|long sword|longsword|katana|great sword|espad[oó]n/, "longsword"],
    [/broadsword|sabre|saber|\bdao\b|scimitar|sable|cleaver/, "broadsword"],
    [/sword|espada/, "sword"],
  ];
  for (const [re, k] of rules) if (re.test(t)) return k;
  return "sword";
}

function weaponShapes(kind, metal, accent, ink) {
  const S = `stroke="${ink}" stroke-width="1.6" stroke-linejoin="round"`;
  const shaft = (y1 = -30, y2 = 46, w = 2.2) => `<rect x="${-w}" y="${y1}" width="${w * 2}" height="${y2 - y1}" rx="${w}" fill="#6b4a2b" ${S}/>`;
  const tassel = (y) => `<path d="M-2 ${y} C-10 ${y + 4} -13 ${y + 12} -9 ${y + 19} L-2 ${y + 7} C2 ${y + 12} 6 ${y + 16} 9 ${y + 18} C10 ${y + 10} 6 ${y + 4} 2 ${y}Z" fill="${accent}"/>`;
  const sword = (dx = 0, rot = 0) => `<g transform="translate(${dx} 0) rotate(${rot})">
      <path d="M-4 16 L-4 -38 L0 -48 L4 -38 L4 16Z" fill="${metal}" ${S}/>
      <path d="M0 -44 L0 14" stroke="#fff" stroke-opacity=".55" stroke-width="1"/>
      <rect x="-13" y="15" width="26" height="6" rx="3" fill="${accent}" ${S}/>
      <rect x="-2.6" y="21" width="5.2" height="19" rx="2" fill="#3a2a1c" ${S}/>
      <circle cx="0" cy="43" r="4" fill="${accent}" ${S}/></g>`;
  switch (kind) {
    case "spear":
      return shaft(-30) + `<path d="M0 -50 L7 -33 L0 -27 L-7 -33Z" fill="${metal}" ${S}/>` + tassel(-27);
    case "glaive":
      return shaft(-22) + `<path d="M2 -20 L2 -50 C16 -42 21 -28 12 -14 C9 -18 6 -20 2 -20Z" fill="${metal}" ${S}/>
        <path d="M-2 -24 L-9 -30 L-2 -34Z" fill="${metal}" ${S}/>` + tassel(-20);
    case "halberd":
      return shaft(-28) + `<path d="M0 -52 L5 -36 L0 -30 L-5 -36Z" fill="${metal}" ${S}/>
        <path d="M2 -32 C16 -40 21 -26 14 -16 C11 -22 7 -25 2 -24Z" fill="${metal}" ${S}/>
        <path d="M-2 -32 C-16 -40 -21 -26 -14 -16 C-11 -22 -7 -25 -2 -24Z" fill="${metal}" ${S}/>` + tassel(-22);
    case "serpent":
      return shaft(-20) + `<path d="M0 -52 C8 -46 -5 -40 5 -34 C-3 -30 7 -25 2 -20 L-2 -20 C2 -26 -7 -30 0 -35 C-9 -41 3 -47 0 -52Z" fill="${metal}" ${S}/>` + tassel(-20);
    case "sword":
      return sword();
    case "broadsword":
      return `<path d="M-6 16 L-7 -28 C-7 -42 6 -50 11 -46 C6 -32 7 -6 6 16Z" fill="${metal}" ${S}/>
        <rect x="-13" y="15" width="26" height="6" rx="3" fill="${accent}" ${S}/>
        <rect x="-2.6" y="21" width="5.2" height="20" rx="2" fill="#3a2a1c" ${S}/><circle cx="0" cy="44" r="4" fill="${accent}" ${S}/>`;
    case "longsword":
      return `<path d="M-3 12 C-4 -12 -2 -36 5 -52 C6 -32 4 -12 3 12Z" fill="${metal}" ${S}/>
        <ellipse cx="0" cy="14" rx="9" ry="3.5" fill="${accent}" ${S}/>
        <rect x="-2.4" y="17" width="4.8" height="29" rx="2" fill="#2a2030" ${S}/>`;
    case "twinswords":
      return sword(-7, -12) + sword(7, 12);
    case "fan":
      return `<rect x="-2.5" y="10" width="5" height="36" rx="2" fill="#6b4a2b" ${S}/>
        <path d="M0 12 C-27 -2 -29 -34 -15 -47 C-6 -52 6 -52 15 -47 C29 -34 27 -2 0 12Z" fill="${metal}" ${S}/>
        ${[-30, -15, 0, 15, 30].map((a) => `<path d="M0 10 L${(Math.sin(a * Math.PI / 180) * 40).toFixed(1)} ${(10 - Math.cos(a * Math.PI / 180) * 54).toFixed(1)}" stroke="${ink}" stroke-opacity=".5" stroke-width="1.2"/>`).join("")}
        <circle cx="0" cy="10" r="4" fill="${accent}" ${S}/>`;
    case "fans": {
      const fan = (dx, rot) => `<g transform="translate(${dx} 6) rotate(${rot})"><path d="M0 18 L-30 -8 A40 40 0 0 1 30 -8Z" fill="${metal}" ${S}/>
        ${[-36, -18, 0, 18, 36].map((a) => `<path d="M0 18 L${(Math.sin(a * Math.PI / 180) * 38).toFixed(1)} ${(18 - Math.cos(a * Math.PI / 180) * 38).toFixed(1)}" stroke="${ink}" stroke-opacity=".45" stroke-width="1.1"/>`).join("")}
        <circle cx="0" cy="18" r="3.5" fill="${accent}"/></g>`;
      return fan(-10, -20) + fan(10, 20);
    }
    case "staff":
      return shaft(-38, 46, 2) + `<circle cx="0" cy="-42" r="8" fill="none" stroke="${metal}" stroke-width="3.2"/>
        <circle cx="-6" cy="-36" r="3" fill="${metal}" ${S}/><circle cx="6" cy="-36" r="3" fill="${metal}" ${S}/><circle cx="0" cy="-42" r="3" fill="${accent}"/>`;
    case "club":
      return shaft(-8) + `<path d="M-9 -8 L-11 -40 C-11 -52 11 -52 11 -40 L9 -8Z" fill="${metal}" ${S}/>
        ${[-40, -30, -20].map((y) => `<path d="M-11 ${y} L-17 ${y - 3} L-11 ${y - 6}Z M11 ${y} L17 ${y - 3} L11 ${y - 6}Z" fill="${metal}" ${S}/>`).join("")}`;
    case "mace":
      return `<g transform="translate(-7 0) rotate(-10)"><rect x="-2" y="-8" width="4" height="50" rx="2" fill="#6b4a2b" ${S}/><circle cx="0" cy="-18" r="10" fill="${metal}" ${S}/></g>
        <g transform="translate(7 0) rotate(10)"><rect x="-2" y="-8" width="4" height="50" rx="2" fill="#6b4a2b" ${S}/><circle cx="0" cy="-18" r="10" fill="${metal}" ${S}/></g>`;
    case "rods":
      return `<g transform="translate(-8 0) rotate(-9)"><rect x="-3" y="-46" width="6" height="90" rx="3" fill="${metal}" ${S}/><rect x="-4" y="22" width="8" height="5" fill="${accent}"/></g>
        <g transform="translate(8 0) rotate(9)"><rect x="-3" y="-46" width="6" height="90" rx="3" fill="${metal}" ${S}/><rect x="-4" y="22" width="8" height="5" fill="${accent}"/></g>`;
    case "axe":
      return shaft(-40) + `<path d="M2 -44 C26 -52 36 -30 30 -10 C21 -19 11 -21 2 -19Z" fill="${metal}" ${S}/>
        <path d="M-2 -36 L-12 -30 L-2 -24Z" fill="${metal}" ${S}/><path d="M0 -52 L3 -42 L-3 -42Z" fill="${metal}" ${S}/>`;
    case "claws":
      return `<rect x="-11" y="2" width="22" height="34" rx="6" fill="${accent}" ${S}/>
        ${[-7, 0, 7].map((x) => `<path d="M${x - 2} 4 C${x - 4} -18 ${x + 2} -36 ${x + 9} -50 C${x + 6} -32 ${x + 4} -14 ${x + 3} 4Z" fill="${metal}" ${S}/>`).join("")}`;
    case "flute":
      return `<rect x="-4" y="-48" width="8" height="94" rx="4" fill="${metal}" ${S}/>
        ${[-30, -18, -6, 6, 18].map((y) => `<circle cx="0" cy="${y}" r="1.8" fill="${ink}"/>`).join("")}` + tassel(36);
    case "tonfa": {
      const tf = (dx, rot) => `<g transform="translate(${dx} 0) rotate(${rot})"><rect x="-3" y="-46" width="6" height="84" rx="3" fill="${metal}" ${S}/><rect x="2" y="14" width="14" height="6" rx="3" fill="#6b4a2b" ${S}/></g>`;
      return tf(-8, -8) + tf(8, 8);
    }
    case "chakram":
      return `<circle cx="0" cy="-4" r="30" fill="none" stroke="${metal}" stroke-width="9"/>
        <circle cx="0" cy="-4" r="30" fill="none" stroke="${ink}" stroke-width="1.2"/>
        ${[0, 60, 120, 180, 240, 300].map((a) => `<path d="M0 -38 L5 -48 L-1 -34Z" transform="rotate(${a} 0 -4)" fill="${metal}" ${S}/>`).join("")}
        <rect x="-10" y="-8" width="20" height="8" rx="4" fill="${accent}" ${S}/>`;
    case "fist":
      return `<path d="M-16 -10 C-16 -26 16 -26 16 -10 L16 22 C16 30 -16 30 -16 22Z" fill="${metal}" ${S}/>
        ${[-11, -4, 3, 10].map((x) => `<rect x="${x - 3}" y="-28" width="7" height="12" rx="3.5" fill="${metal}" ${S}/>`).join("")}
        <rect x="-18" y="26" width="36" height="12" rx="4" fill="${accent}" ${S}/>`;
    case "bow":
      return `<path d="M-6 -46 C26 -26 26 26 -6 46" fill="none" stroke="#6b4a2b" stroke-width="5"/><path d="M-6 -46 L-6 46" stroke="${ink}" stroke-width="1.2"/>
        <path d="M-20 0 L22 0" stroke="${metal}" stroke-width="2"/><path d="M22 0 L14 -4 L14 4Z" fill="${metal}"/>`;
    case "boomerang":
      return `<path d="M-28 30 C-20 -10 0 -40 26 -44 C10 -30 -2 -6 -10 34Z" fill="${metal}" ${S}/>`;
    default:
      return sword();
  }
}

export function weaponSVG(type, { tier = 1, size, name = "", kingdom, element } = {}) {
  const kind = weaponKind(type, name);
  const k = kingdomOf(kingdom);
  const metals = ["#c9ced6", "#d9dde4", "#e8d9a8", "#f2c94c", "#f6a35b"];
  const metal = metals[Math.max(0, Math.min(4, tier - 1))];
  const g = uid("wg");
  const ek = element && !/none|ninguno/i.test(element) ? elementKey(element) : null;
  const glowC = ek && ek !== "default" ? ELEMENTS[ek].c : tier >= 5 ? "#ffb347" : "#ffe08a";
  const glow = tier >= 4 || ek ? `<circle cx="50" cy="50" r="44" fill="url(#${g})"/>` : "";
  return `<svg class="art" viewBox="0 0 100 100" ${size ? `width="${size}" height="${size}"` : ""} role="img" aria-label="${esc(name || type)}">
    <defs><radialGradient id="${g}"><stop offset="0" stop-color="${glowC}" stop-opacity=".6"/><stop offset="1" stop-color="${k.main}" stop-opacity="0"/></radialGradient></defs>
    ${glow}
    <g transform="translate(50 50) rotate(45) scale(1.16)">${weaponShapes(kind, metal, tier >= 5 ? "#ff7a2f" : k.light, "#1a1414")}</g>
    ${tier ? `<g transform="translate(${92 - tier * 9} 94)">${Array.from({ length: tier }, (_, i) => `<path transform="translate(${i * 9} 0)" d="M4 -7 L5.2 -3.6 L8.6 -3.6 L5.9 -1.5 L7 2 L4 0 L1 2 L2.1 -1.5 L-0.6 -3.6 L2.8 -3.6Z" fill="${tier >= 5 ? "#ff9f43" : "#f2c94c"}" stroke="#1a1414" stroke-width=".6"/>`).join("")}</g>` : ""}
  </svg>`;
}

// ---------- RETRATOS ----------
function headgear(kind, ink, rim, accent, female) {
  const P = (d, fill = ink, extra = "") => `<path d="${d}" fill="${fill}" stroke="${rim}" stroke-width="1.6" stroke-linejoin="round" ${extra}/>`;
  const helmet = P("M73 115 C72 86 128 86 127 115 L133 120 L67 120Z") + P("M100 87 L95 70 L105 70Z", accent);
  switch (kind) {
    case "plume": return helmet + P("M100 80 C92 58 108 42 134 36 C120 52 114 64 106 80Z", accent);
    case "feathers":
      return `<path d="M92 98 C72 44 44 22 14 8" stroke="${accent}" stroke-width="5" fill="none" stroke-linecap="round"/>
        <path d="M108 98 C128 44 156 22 186 8" stroke="${accent}" stroke-width="5" fill="none" stroke-linecap="round"/>` + helmet;
    case "lionhelm":
      return [...Array(7)].map((_, i) => P(`M${70 + i * 10} 118 C${62 + i * 12} 100 ${66 + i * 11} 84 ${74 + i * 9} 74 L${80 + i * 8} 112Z`, accent)).join("") + helmet;
    case "helmet": return helmet;
    case "mask": return helmet + P("M80 120 L120 120 L116 140 L84 140Z", accent, 'opacity=".9"');
    case "scholar": return P("M76 122 C74 100 126 100 124 122Z") + P("M84 106 L84 82 Q100 74 116 82 L116 106Z") + `<rect x="82" y="100" width="36" height="5" fill="${accent}"/>`;
    case "hood": return P("M72 132 C66 92 134 92 128 132Z") + `<ellipse cx="100" cy="102" rx="46" ry="9" fill="${ink}" stroke="${rim}" stroke-width="1.6"/>` + P("M78 102 Q100 66 122 102Z");
    case "crown": return P("M75 122 C74 96 126 96 125 122Z") + P("M88 102 L90 84 L100 93 L110 84 L112 102Z", accent);
    case "cap": return P("M74 120 C72 92 128 92 126 120Z") + P("M80 104 C84 84 116 84 120 104Z", accent);
    case "bun": return P("M74 124 C70 94 130 94 126 124Z") + `<circle cx="100" cy="92" r="13" fill="${ink}" stroke="${rim}" stroke-width="1.6"/>`
      + `<path d="M84 84 L118 98 M88 98 L116 82" stroke="${accent}" stroke-width="2.4"/>`
      + P("M76 122 C68 150 72 172 64 190 L80 184 C82 162 80 142 82 126Z") + P("M124 122 C132 150 128 172 136 190 L120 184 C118 162 120 142 118 126Z");
    case "twinbuns": return P("M74 124 C70 96 130 96 126 124Z") + `<circle cx="80" cy="98" r="11" fill="${ink}" stroke="${rim}" stroke-width="1.6"/><circle cx="120" cy="98" r="11" fill="${ink}" stroke="${rim}" stroke-width="1.6"/>`
      + `<circle cx="80" cy="98" r="4" fill="${accent}"/><circle cx="120" cy="98" r="4" fill="${accent}"/>`;
    case "headband": return P("M74 122 L70 100 L83 108 L85 90 L95 104 L101 86 L107 104 L116 90 L118 108 L130 100 L126 122Z")
      + `<rect x="74" y="111" width="52" height="6" rx="2" fill="${accent}"/><path d="M126 114 C140 118 150 128 162 122 C152 132 140 128 126 120Z" fill="${accent}"/>`;
    case "spiky": return P("M74 122 L66 96 L82 106 L84 84 L96 100 L104 80 L110 100 L122 86 L120 106 L136 98 L126 122Z")
      + `<path d="M120 100 C134 80 150 70 166 66 C152 80 140 92 124 106Z" fill="${accent}"/>`;
    case "longhair": return P("M74 122 C70 96 128 92 126 118 C134 132 142 162 154 194 L138 190 C130 162 126 142 124 126Z") + `<path d="M100 96 L100 88" stroke="${accent}" stroke-width="4"/>`;
    case "ponytail": return P("M74 122 C70 96 128 92 126 120Z") + P("M118 100 C140 96 152 112 156 136 C146 124 136 116 122 112Z") + `<circle cx="120" cy="104" r="4" fill="${accent}"/>`;
    case "turban": return `<ellipse cx="100" cy="104" rx="30" ry="18" fill="#d8ac2a" stroke="${rim}" stroke-width="1.6"/><path d="M74 104 Q100 88 126 104" stroke="#8a6a12" stroke-width="2" fill="none"/>`;
    case "tribal": return [...Array(7)].map((_, i) => { const a = (-60 + i * 20) * Math.PI / 180; const x = 100 + Math.sin(a) * 52, y = 112 - Math.cos(a) * 52; return `<path d="M100 112 L${(x - 5).toFixed(1)} ${y.toFixed(1)} L${(x + 5).toFixed(1)} ${y.toFixed(1)}Z" fill="${i % 2 ? accent : "#d8ac2a"}" stroke="${ink}" stroke-width="1"/>`; }).join("")
      + P("M74 122 C72 98 128 98 126 122Z");
    case "bald": return "";
    default: return P("M74 122 C70 96 128 96 126 122Z");
  }
}

export function portraitSVG(ch = {}, { size } = {}) {
  const id = ch.id || slug(ch.name || "x");
  const k = kingdomOf(ch.kingdom);
  const look = LOOKS_C[compact(id)] || {};
  const female = FEMALE.has(compact(id)) || ch.gender === "female";
  const h = hashStr(id);
  const heads = ["helmet", "plume", "crown", "headband", "ponytail", "cap"];
  const head = look.head || (female ? "bun" : heads[h % heads.length]);
  const body = look.body || (female ? "robe" : "armor");
  const b = look.build || (female ? 0.82 : 1);
  const ink = "#0d0b10";
  const rim = k.accent;
  const g = uid("bg"), r = uid("rm"), m = uid("mt");
  const sw = 60 * b;
  const kind = weaponKind(ch.weapon_type || "", "");
  const seal = (HANZI_C[compact(id)] || (ch.name || "?").slice(0, 1)).split("");
  const sealH = 16 + seal.length * 19;
  const beard = look.beard === "long" ? `<path d="M88 140 C88 172 98 198 104 214 C108 196 114 170 112 140Z" fill="${ink}" stroke="${rim}" stroke-width="1.4"/><path d="M96 150 L100 196 M104 150 L104 190" stroke="${rim}" stroke-opacity=".35"/>`
    : look.beard === "spiky" ? `<path d="M80 136 L84 160 L90 150 L94 168 L100 154 L106 168 L110 150 L116 160 L120 136Z" fill="${ink}" stroke="${rim}" stroke-width="1.4"/>`
    : look.beard === "short" ? `<path d="M90 146 C92 162 108 162 110 146Z" fill="${ink}" stroke="${rim}" stroke-width="1.2"/>` : "";
  const patch = look.patch ? `<path d="M74 118 L126 132" stroke="${rim}" stroke-width="1.6"/><circle cx="89" cy="126" r="6" fill="#b3241b" stroke="${rim}" stroke-width="1"/>` : "";
  const band = look.band ? `<rect x="76" y="110" width="48" height="6" rx="2" fill="${k.light}"/>` : "";
  const pauldrons = body === "armor" ? `<ellipse cx="${100 - sw * 0.74}" cy="192" rx="${24 * b}" ry="14" transform="rotate(-18 ${100 - sw * 0.74} 192)" fill="${ink}" stroke="${rim}" stroke-width="1.6"/>
      <ellipse cx="${100 + sw * 0.74}" cy="192" rx="${24 * b}" ry="14" transform="rotate(18 ${100 + sw * 0.74} 192)" fill="${ink}" stroke="${rim}" stroke-width="1.6"/>
      <path d="M${100 - sw * 0.74 - 16} 190 l32 -5 M${100 + sw * 0.74 - 16} 185 l32 5" stroke="${k.light}" stroke-opacity=".6"/>` : "";
  const robe = body === "robe" ? `<path d="M84 180 L100 214 L116 180" fill="none" stroke="${k.light}" stroke-width="3"/><path d="M78 184 L100 236 L122 184" fill="none" stroke="${rim}" stroke-opacity=".4"/>` : "";
  const bare = body === "bare" ? `<path d="M70 206 C84 216 116 216 130 206" stroke="${rim}" stroke-opacity=".5" fill="none"/><circle cx="100" cy="200" r="6" fill="#d8ac2a"/>` : "";
  const emblem = body === "armor" ? `<circle cx="100" cy="214" r="11" fill="${k.main}" stroke="${rim}" stroke-width="1.6"/><text x="100" y="219" text-anchor="middle" font-size="13" font-family="'Ma Shan Zheng','Noto Serif SC',serif" fill="#fff">${k.hanzi}</text>` : "";
  return `<svg class="art portrait" viewBox="0 0 200 250" ${size ? `width="${size}"` : ""} role="img" aria-label="Retrato ilustrado de ${esc(ch.name || "")}">
  <defs>
    <radialGradient id="${g}" cx="50%" cy="36%" r="78%"><stop offset="0" stop-color="${k.light}"/><stop offset=".5" stop-color="${k.main}"/><stop offset="1" stop-color="${k.dark}"/></radialGradient>
    <linearGradient id="${r}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>
    <linearGradient id="${m}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${k.dark}" stop-opacity=".2"/><stop offset="1" stop-color="${k.dark}" stop-opacity=".95"/></linearGradient>
  </defs>
  <rect width="200" height="250" fill="url(#${g})"/>
  <circle cx="${70 + (h % 60)}" cy="92" r="58" fill="#fff4d6" opacity=".16"/>
  ${[0, 1, 2].map((i) => `<path d="M${-20 + i * 70} ${60 + i * 14} q18 -12 36 0 t36 0" stroke="#fff" stroke-opacity=".12" stroke-width="2" fill="none"/>`).join("")}
  <path d="M0 196 L26 160 L48 178 L84 136 L116 170 L148 146 L200 186 V250 H0Z" fill="url(#${m})"/>
  <g transform="translate(10 18) scale(1.8)" opacity=".95"><g transform="translate(50 50) rotate(${look.head === "feathers" ? -45 : 45})">${weaponShapes(kind, "#e3c873", k.light, "#1a1414")}</g></g>
  <path d="M${100 - sw} 252 C${100 - sw} 206 ${100 - sw * 0.8} 184 76 177 L124 177 C${100 + sw * 0.8} 184 ${100 + sw} 206 ${100 + sw} 252Z" fill="${ink}" stroke="${rim}" stroke-width="1.8"/>
  ${pauldrons}${robe}${bare}${emblem}
  <rect x="89" y="146" width="22" height="34" fill="${ink}"/>
  <ellipse cx="100" cy="128" rx="${female ? 22 : 24}" ry="${female ? 27 : 29}" fill="${ink}" stroke="${rim}" stroke-width="1.8"/>
  ${beard}${band}
  ${headgear(head, ink, rim, k.light, female)}
  <path d="M88 127 L96 128 M104 128 L112 127" stroke="${rim}" stroke-width="2.4" stroke-linecap="round"/>
  ${patch}
  <rect width="200" height="250" fill="url(#${r})"/>
  <g transform="translate(158 10)"><rect width="32" height="${sealH}" rx="4" fill="#b3241b" stroke="#ffd9c9" stroke-opacity=".5"/>
    ${seal.map((c, i) => `<text x="16" y="${27 + i * 19}" text-anchor="middle" font-size="18" font-family="'Ma Shan Zheng','Noto Serif SC',serif" fill="#fff6ea">${esc(c)}</text>`).join("")}</g>
  ${ch.new_in_remaster ? `<g transform="translate(8 10)"><rect width="52" height="18" rx="9" fill="#f2c94c"/><text x="26" y="13" text-anchor="middle" font-size="10" font-weight="700" font-family="system-ui,sans-serif" fill="#1a1414">NUEVO</text></g>` : ""}
</svg>`;
}

// ---------- ÍTEMS ----------
export const ITEM_CATS = {
  vida: { color: "#3fa463", label: "Vida" }, ataque: { color: "#d24a3a", label: "Ataque" },
  defensa: { color: "#4a7fd1", label: "Defensa" }, musou: { color: "#e0912a", label: "Musou" },
  velocidad: { color: "#2fb5b5", label: "Velocidad" }, elemental: { color: "#9a5ad6", label: "Elemental" },
  caballo: { color: "#b07a3c", label: "Caballo" }, guardia: { color: "#7d8a99", label: "Guardia" },
  utilidad: { color: "#c9b26a", label: "Utilidad" }, especial: { color: "#d4af37", label: "Especial" },
};

function itemGlyph(cat, c) {
  const ink = "#160f0a";
  const S = `stroke="${ink}" stroke-width="2" stroke-linejoin="round"`;
  switch (cat) {
    case "vida": return `<path d="M50 32 C30 30 22 54 32 68 C40 80 60 80 68 68 C78 54 70 30 50 32Z" fill="#ffb4a2" ${S}/><path d="M50 34 C47 50 47 64 50 76" stroke="#e07a6a" stroke-width="2" fill="none"/>
      <path d="M50 32 C54 20 66 16 72 22 C66 28 58 30 50 32Z" fill="#5fcf7f" ${S}/>`;
    case "ataque": return [0, 1, 2].map((i) => `<path d="M${30 + i * 12} 78 C${36 + i * 12} 56 ${48 + i * 12} 36 ${62 + i * 10} 22 C${56 + i * 12} 40 ${48 + i * 12} 60 ${38 + i * 12} 80Z" fill="#fff0e8" ${S}/>`).join("");
    case "defensa": return `<path d="M50 18 L78 28 C78 56 66 74 50 84 C34 74 22 56 22 28Z" fill="#dce8ff" ${S}/>
      <path d="M50 34 L60 40 L60 52 L50 58 L40 52 L40 40Z" fill="none" stroke="${c}" stroke-width="3"/>`;
    case "musou": return `<path d="M50 14 C58 30 76 40 72 62 C70 78 60 86 50 86 C38 86 28 78 28 62 C28 50 38 44 40 32 C46 42 48 46 50 48 C55 40 55 28 50 14Z" fill="#ffd27a" ${S}/>
      <path d="M50 52 C56 60 60 66 58 74 C56 80 44 80 42 74 C40 66 46 62 50 52Z" fill="#ff7a2f"/>`;
    case "velocidad": return `<path d="M24 64 C40 40 64 26 84 24 C74 34 70 40 62 44 C70 44 74 46 78 48 C66 56 56 58 46 58 C52 62 56 64 60 66 C48 72 36 72 24 64Z" fill="#e4fffb" ${S}/>`;
    case "elemental": return `<circle cx="50" cy="50" r="24" fill="${c}" ${S}/><circle cx="42" cy="42" r="8" fill="#fff" opacity=".6"/>`;
    case "caballo": return `<path d="M30 28 C28 72 72 72 70 28 L58 28 C60 58 40 58 42 28Z" fill="#e8d6b8" ${S}/>${[34, 46, 58].map((y) => `<circle cx="${y < 50 ? 36 : 35}" cy="${y}" r="2.4" fill="${ink}"/><circle cx="64" cy="${y}" r="2.4" fill="${ink}"/>`).join("")}`;
    case "guardia": return `<rect x="30" y="16" width="4" height="70" fill="#6b4a2b" ${S}/><path d="M34 20 L74 24 L66 38 L74 52 L34 50Z" fill="#f5f0e6" ${S}/><text x="52" y="44" font-size="16" text-anchor="middle" font-family="'Ma Shan Zheng',serif" fill="${c}">衛</text>`;
    case "utilidad": return `<rect x="28" y="30" width="44" height="40" fill="#f5ecd6" ${S}/><rect x="22" y="24" width="10" height="52" rx="5" fill="#a0703c" ${S}/><rect x="68" y="24" width="10" height="52" rx="5" fill="#a0703c" ${S}/>
      ${[40, 48, 56].map((y) => `<path d="M36 ${y} L64 ${y}" stroke="${ink}" stroke-opacity=".5" stroke-width="2"/>`).join("")}`;
    case "especial": return `<rect x="28" y="46" width="44" height="34" rx="4" fill="#9fe0b5" ${S}/><path d="M36 46 C36 30 64 30 64 46Z" fill="#7fd09b" ${S}/><circle cx="50" cy="36" r="5" fill="#fff" opacity=".6"/>
      <text x="50" y="72" font-size="18" text-anchor="middle" font-family="'Ma Shan Zheng',serif" fill="#1d5a33">璽</text>`;
    default: return `<path d="M50 20 L72 42 L50 82 L28 42Z" fill="#fff" ${S}/>`;
  }
}

// Iconos específicos según el nombre del ítem (si no hay coincidencia se usa el de su categoría).
function itemGlyphByName(name = "", c) {
  const n = name.toLowerCase();
  const ink = "#160f0a";
  const S = `stroke="${ink}" stroke-width="2" stroke-linejoin="round"`;
  const hz = (t, x = 50, y = 58, fs = 22, fill = ink) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="${fs}" font-family="'Ma Shan Zheng','Noto Serif SC',serif" fill="${fill}">${t}</text>`;
  const amulet = (t) => `<path d="M38 16 Q50 30 62 16" stroke="#c9a14a" stroke-width="3" fill="none"/><circle cx="50" cy="52" r="24" fill="#f1e2b8" ${S}/><circle cx="50" cy="52" r="18" fill="none" stroke="${c}" stroke-width="3"/>` + hz(t, 50, 61, 22);
  const scroll = (t) => `<rect x="30" y="24" width="40" height="52" fill="#f5ecd6" ${S}/><rect x="24" y="18" width="52" height="9" rx="4.5" fill="#a0703c" ${S}/><rect x="24" y="73" width="52" height="9" rx="4.5" fill="#a0703c" ${S}/>` + hz(t, 50, 59, 24, "#7a1d12");
  const book = (t) => `<path d="M24 22 H72 C76 22 78 24 78 28 V80 H28 C25 80 24 78 24 76Z" fill="#7a1d12" ${S}/><rect x="30" y="22" width="44" height="54" fill="#f5ecd6" ${S}/><rect x="40" y="30" width="24" height="38" fill="#fff" stroke="${c}" stroke-width="2"/>` + hz(t, 52, 56, t.length > 1 ? 13 : 20, "#7a1d12");
  const armor = (deco) => `<path d="M30 26 L42 20 Q50 28 58 20 L70 26 L74 46 L66 48 L66 80 H34 L34 48 L26 46Z" fill="#c9ced6" ${S}/><path d="M38 52 H62 M38 60 H62 M38 68 H62" stroke="${ink}" stroke-opacity=".45" stroke-width="2"/>${deco || ""}`;
  const helm = (horns) => `${horns ? `<path d="M30 46 C18 36 18 22 26 14 C28 26 34 34 40 38Z M70 46 C82 36 82 22 74 14 C72 26 66 34 60 38Z" fill="#f1e2b8" ${S}/>` : `<path d="M50 14 L46 26 H54Z" fill="${c}" ${S}/>`}<path d="M28 60 C26 34 74 34 72 60 L78 66 L22 66Z" fill="#c9ced6" ${S}/><rect x="36" y="64" width="28" height="14" rx="3" fill="#8a919c" ${S}/>`;
  const saddle = (col) => `<path d="M18 56 C22 40 34 38 42 46 C50 52 58 50 64 40 C70 32 82 36 84 48 C86 62 74 70 50 70 C30 70 16 66 18 56Z" fill="${col}" ${S}/><path d="M44 70 L40 84 M58 70 L62 84" stroke="${ink}" stroke-width="3"/><rect x="34" y="80" width="12" height="6" rx="2" fill="#c9a14a" ${S}/><rect x="56" y="80" width="12" height="6" rx="2" fill="#c9a14a" ${S}/>`;
  const bow = (bolt) => `<path d="M34 16 C70 34 70 66 34 84" fill="none" stroke="#a0703c" stroke-width="6" stroke-linecap="round"/><path d="M34 16 L34 84" stroke="${ink}" stroke-width="1.5"/><path d="M24 50 H78" stroke="#c9ced6" stroke-width="3"/><path d="M80 50 L70 44 L70 56Z" fill="#c9ced6" ${S}/>${bolt ? `<path d="M64 18 L54 36 L62 36 L54 54 L72 30 L64 30Z" fill="#ffd23a" ${S}/>` : ""}`;
  const flaskCol = /bronze/.test(n) ? "#c47a3a" : "#e0b45a";
  if (/amulet|amuleto/.test(n)) return amulet(/tiger|tigre/.test(n) ? "虎" : /tortoise|tortuga/.test(n) ? "龜" : /dragon/.test(n) ? "龍" : "符");
  if (/survival|guide|manual|art of war|teaching|way of musou|book|libro/.test(n)) return book(/art of war/.test(n) ? "孫子" : /six secret/.test(n) ? "六韜" : /way of musou/.test(n) ? "無雙" : /bodyguard/.test(n) ? "衛" : /survival/.test(n) ? "生" : "書");
  if (/scroll|pergamino/.test(n)) return scroll(/speed/.test(n) ? "速" : /wind/.test(n) ? "風" : /power/.test(n) ? "力" : /accuracy/.test(n) ? "準" : /legend/.test(n) ? "傳" : /heal/.test(n) ? "癒" : "巻");
  if (/horned helm/.test(n)) return helm(true);
  if (/helm|casco/.test(n)) return helm(false);
  if (/armor|armadura/.test(n)) return armor(/musou/.test(n) ? `<circle cx="50" cy="40" r="7" fill="#ff7a2f" ${S}/>` : /shell/.test(n) ? `<path d="M42 30 h16 l-8 10z" fill="${c}"/>` : "");
  if (/buckler/.test(n)) return `<circle cx="50" cy="50" r="30" fill="#c9ced6" ${S}/><circle cx="50" cy="50" r="20" fill="none" stroke="${c}" stroke-width="4"/><circle cx="50" cy="50" r="7" fill="#f2c94c" ${S}/>`;
  if (/defender|shield|escudo/.test(n)) return `<path d="M50 16 L78 26 C78 54 66 72 50 84 C34 72 22 54 22 26Z" fill="#dce8ff" ${S}/>` + hz("守", 50, 60, 24, c);
  if (/lightning bow/.test(n)) return bow(true);
  if (/\bbow\b|\barco\b/.test(n)) return bow(false);
  if (/arrow|flecha/.test(n)) return [0, 1, 2].map((i) => `<path d="M${26 + i * 10} 82 L${56 + i * 10} 26" stroke="#a0703c" stroke-width="3"/><path d="M${56 + i * 10} 22 l-6 8 l8 2z" fill="#c9ced6" ${S}/>`).join("") + `<path d="M58 14 C64 22 70 24 68 32 C66 38 58 38 56 32 C54 26 58 22 58 14Z" fill="#ff7a2f" ${S}/>`;
  if (/boot|bota/.test(n)) return `<path d="M36 18 H54 V58 L74 64 C80 66 80 80 74 80 H32 Z" fill="#a0703c" ${S}/><path d="M54 30 C66 18 80 16 88 20 C80 26 74 30 66 34 C74 34 80 36 84 40 C72 44 62 44 54 42Z" fill="#e4fffb" ${S}/>`;
  if (/\burn\b|vase|jarr/.test(n)) return `<path d="M40 18 H60 V26 C72 32 76 48 70 62 C66 74 58 82 50 82 C42 82 34 74 30 62 C24 48 28 32 40 26Z" fill="#3fa463" ${S}/><path d="M34 46 C44 40 56 52 66 46" stroke="#f2c94c" stroke-width="3" fill="none"/><circle cx="50" cy="60" r="6" fill="#4a7fd1" ${S}/>`;
  if (/flask|elixir|gourd|frasco/.test(n) || /丹/.test(name)) return `<circle cx="50" cy="36" r="12" fill="${flaskCol}" ${S}/><circle cx="50" cy="62" r="20" fill="${flaskCol}" ${S}/><rect x="45" y="16" width="10" height="10" rx="2" fill="#7a1d12" ${S}/><path d="M40 36 C30 40 30 54 36 58" stroke="#7a1d12" stroke-width="3" fill="none"/>` + (/丹/.test(name) ? hz("丹", 50, 70, 18, "#7a1d12") : "");
  if (/quiver|carcaj/.test(n)) return `<path d="M34 34 L58 24 L72 74 L48 84Z" fill="#a0703c" ${S}/>${[0, 1, 2].map((i) => `<path d="M${42 + i * 6} ${30 - i * 3} L${34 + i * 6} 12" stroke="#c9ced6" stroke-width="2.5"/><path d="M${34 + i * 6} 12 l-3 6 l6 0z" fill="#ff7a2f"/>`).join("")}`;
  if (/pouch|bolsa/.test(n)) return `<path d="M36 34 C24 48 24 80 50 82 C76 80 76 48 64 34Z" fill="#a0703c" ${S}/><path d="M36 34 C42 28 58 28 64 34" stroke="${ink}" stroke-width="3" fill="none"/><path d="M40 30 L34 20 M60 30 L66 20" stroke="#c9a14a" stroke-width="3"/>` + hz("山", 50, 66, 18, "#f5ecd6");
  if (/red hare/.test(n)) return saddle(/retro/.test(n) ? "#d26a4a" : "#b8342a");
  if (/hex mark/.test(n)) return saddle("#e9e2d0");
  if (/imperial saddle/.test(n)) return saddle("#d4af37");
  if (/harness|arn[eé]s/.test(n)) return `<path d="M28 30 C28 72 72 72 72 30" fill="none" stroke="${/gold|imperial/.test(n) ? "#d4af37" : /beast/.test(n) ? "#7a4e2b" : "#a0703c"}" stroke-width="9" stroke-linecap="round"/><circle cx="28" cy="30" r="7" fill="#c9ced6" ${S}/><circle cx="72" cy="30" r="7" fill="#c9ced6" ${S}/><rect x="40" y="58" width="20" height="14" rx="3" fill="#c9ced6" ${S}/>`;
  if (/drum|tambor/.test(n)) return `<ellipse cx="50" cy="34" rx="28" ry="10" fill="#f5ecd6" ${S}/><path d="M22 34 V66 C22 80 78 80 78 66 V34" fill="#b3241b" ${S}/><path d="M30 40 L40 74 M50 44 V78 M70 40 L60 74" stroke="#f2c94c" stroke-width="2"/><path d="M68 16 L84 8 M74 22 L90 18" stroke="#a0703c" stroke-width="4" stroke-linecap="round"/>`;
  if (/cloak|capa|manto/.test(n)) return `<path d="M38 18 H62 L80 82 C64 76 36 76 20 82Z" fill="#4a3aa7" ${S}/><circle cx="50" cy="22" r="5" fill="#f2c94c" ${S}/><path d="M50 26 V74" stroke="#9085e9" stroke-width="2"/>`;
  if (/seal|sello/.test(n)) return `<rect x="28" y="46" width="44" height="34" rx="3" fill="#2a1446" ${S}/><path d="M38 46 C38 26 62 26 62 46Z" fill="#4a2a6e" ${S}/>` + hz("闇", 50, 72, 20, "#e0c4ff");
  if (/seven star orb/.test(n)) return `<circle cx="50" cy="50" r="28" fill="#2a5cb3" ${S}/>${[[38, 36], [50, 32], [62, 38], [66, 52], [56, 62], [44, 64], [36, 54]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.2" fill="#fff6c4"/>`).join("")}<path d="M38 36 L50 32 L62 38 L66 52 L56 62 L44 64 L36 54" stroke="#fff6c4" stroke-opacity=".6" fill="none"/>`;
  if (/blade|sword|espada/.test(n)) return `<g transform="translate(50 50) rotate(45) scale(.78)">${weaponShapes("sword", "#e3e8ee", "#d4af37", ink)}</g>`;
  if (/gauntlet|guantelete/.test(n)) return `<g transform="translate(50 52) scale(1.1)">${weaponShapes("fist", "#c9ced6", "#d4af37", ink)}</g>`;
  return null;
}

export function itemSVG(item = {}, { size } = {}) {
  const cat = ITEM_CATS[item.category] ? item.category : "especial";
  const c = ITEM_CATS[cat].color;
  const g = uid("ig");
  const rating = Math.max(0, Math.min(5, Math.round(item.rating || 0)));
  return `<svg class="art" viewBox="0 0 100 100" ${size ? `width="${size}" height="${size}"` : ""} role="img" aria-label="${esc(item.name || "")}">
    <defs><radialGradient id="${g}" cx="50%" cy="40%" r="65%"><stop offset="0" stop-color="${c}" stop-opacity=".95"/><stop offset="1" stop-color="#140f0c"/></radialGradient></defs>
    <path d="M30 4 H70 L96 30 V70 L70 96 H30 L4 70 V30Z" fill="url(#${g})" stroke="${c}" stroke-width="3"/>
    <path d="M32 10 H68 L90 32 V68 L68 90 H32 L10 68 V32Z" fill="none" stroke="#f2c94c" stroke-opacity=".35" stroke-width="1.5"/>
    ${itemGlyphByName(item.name, c) || itemGlyph(cat, c)}
    ${rating ? `<g transform="translate(${50 - rating * 5} 88)">${Array.from({ length: rating }, (_, i) => `<circle cx="${i * 10 + 5}" cy="0" r="3.2" fill="#f2c94c" stroke="#140f0c"/>`).join("")}</g>` : ""}
  </svg>`;
}

// ---------- ORBES ----------
const ELEMENTS = {
  fuego: { c: "#ff5a2a", d: "#7a1606" }, hielo: { c: "#71d6ff", d: "#0b4766" }, rayo: { c: "#ffd23a", d: "#7a5a00" },
  vorpal: { c: "#c05cff", d: "#3a0b5a" }, veneno: { c: "#7ad94a", d: "#1f4a0b" }, viento: { c: "#9be3c0", d: "#165440" },
  default: { c: "#cfd6e0", d: "#3a414c" },
};
export function elementKey(s = "") {
  const t = s.toLowerCase();
  if (/fire|fuego|llama/.test(t)) return "fuego";
  if (/ice|hielo|frost/.test(t)) return "hielo";
  if (/light|rayo|thunder|bolt|trueno/.test(t)) return "rayo";
  if (/vorpal|muerte|death|instant|decap/.test(t)) return "vorpal";
  if (/poison|veneno/.test(t)) return "veneno";
  if (/wind|viento|tornado/.test(t)) return "viento";
  return "default";
}
function elementGlyph(k) {
  switch (k) {
    case "fuego": return `<path d="M50 26 C56 38 68 44 64 58 C62 68 56 72 50 72 C42 72 36 66 36 58 C36 50 42 46 44 38 C47 44 48 48 50 50 C53 44 53 34 50 26Z" fill="#fff3c4"/>`;
    case "hielo": return [0, 60, 120].map((a) => `<path d="M50 28 L50 72 M44 34 L50 40 L56 34 M44 66 L50 60 L56 66" transform="rotate(${a} 50 50)" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round"/>`).join("");
    case "rayo": return `<path d="M56 24 L36 54 L50 54 L42 76 L64 44 L50 44Z" fill="#fff8d6" stroke="#5a4200" stroke-width="1.5"/>`;
    case "vorpal": return `<path d="M30 60 C40 34 62 26 74 30 C60 34 50 46 46 62 C54 56 62 56 68 60 C56 66 42 68 30 60Z" fill="#f4e4ff"/>`;
    case "veneno": return `<path d="M50 26 C58 40 66 50 66 58 C66 68 58 74 50 74 C42 74 34 68 34 58 C34 50 42 40 50 26Z" fill="#eaffd8"/><circle cx="45" cy="58" r="4" fill="${ELEMENTS.veneno.d}"/>`;
    case "viento": return `<path d="M30 44 C46 44 60 40 62 32 C64 26 56 24 54 30 M30 54 C54 54 70 54 70 62 C70 70 60 70 60 64 M30 64 C42 64 48 64 50 70" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
    default: return `<circle cx="50" cy="50" r="10" fill="#fff"/>`;
  }
}
export function orbSVG(orb = {}, { size } = {}) {
  const k = elementKey(`${orb.element || ""} ${orb.name || ""}`);
  const e = ELEMENTS[k];
  const g = uid("og"), h = uid("oh");
  return `<svg class="art" viewBox="0 0 100 100" ${size ? `width="${size}" height="${size}"` : ""} role="img" aria-label="${esc(orb.name || "")}">
    <defs><radialGradient id="${g}" cx="38%" cy="32%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset=".25" stop-color="${e.c}"/><stop offset="1" stop-color="${e.d}"/></radialGradient>
    <radialGradient id="${h}"><stop offset=".6" stop-color="${e.c}" stop-opacity=".45"/><stop offset="1" stop-color="${e.c}" stop-opacity="0"/></radialGradient></defs>
    <circle cx="50" cy="50" r="48" fill="url(#${h})"/>
    <circle cx="50" cy="50" r="34" fill="url(#${g})" stroke="#140f0c" stroke-width="2"/>
    ${elementGlyph(k)}
    <path d="M28 40 C32 28 42 22 52 21" stroke="#fff" stroke-opacity=".7" stroke-width="3" fill="none" stroke-linecap="round"/>
  </svg>`;
}

// ---------- CABALLOS ----------
const HORSE_PATH = "M42 58 C50 46 90 44 104 50 C110 40 118 26 128 18 L132 10 L136 18 C143 21 151 30 154 38 C155 43 150 46 145 43 C138 40 131 40 125 44 C121 52 119 60 117 66 C119 72 125 80 131 84 L137 97 L131 99 L124 87 C118 83 113 81 110 79 L108 101 L101 102 L101 81 C89 85 70 85 60 81 C56 87 50 95 40 101 L35 98 C43 91 45 85 46 79 C43 85 37 93 29 97 L26 93 C35 87 37 77 40 71 C34 73 24 81 10 86 C19 74 30 62 42 58Z";
const ELEPHANT_PATH = "M30 50 C30 30 60 22 90 26 C110 20 132 26 138 44 C144 56 142 70 136 78 C134 86 136 94 140 98 L132 100 C126 94 126 84 128 78 C126 72 122 70 118 72 L118 100 L106 100 L104 80 L66 82 L64 100 L52 100 L50 80 C40 78 32 68 30 50Z";
export function horseSVG(horse = {}, { size } = {}) {
  const name = `${horse.name || ""}`.toLowerCase();
  const palette = /red hare|liebre roja|chitu/.test(name) ? ["#b8342a", "#ffcf6e"]
    : /shadow|sombra|jueying/.test(name) ? ["#1f1a24", "#a77ae6"]
    : /hex|dilu|marca/.test(name) ? ["#e9e2d0", "#d24a3a"]
    : /storm|tormenta|thunder/.test(name) ? ["#6b7387", "#9cc3ff"]
    : /elephant|elefante/.test(name) ? ["#7d8a99", "#f2c94c"]
    : [["#7a4e2b", "#f2c94c"], ["#5a3a22", "#e0c4ff"], ["#a8814f", "#9ff0b8"], ["#3a2a20", "#ffb3a2"]][hashStr(name) % 4];
  const isEle = /elephant|elefante/.test(name);
  const g = uid("hg");
  const spd = Math.max(0, Math.min(10, Number(horse.speed) || 0));
  return `<svg class="art" viewBox="0 0 160 120" ${size ? `width="${size}"` : ""} role="img" aria-label="${esc(horse.name || "")}">
    <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b2216"/><stop offset="1" stop-color="#120c09"/></linearGradient></defs>
    <rect width="160" height="120" rx="10" fill="url(#${g})"/>
    <circle cx="118" cy="34" r="26" fill="${palette[1]}" opacity=".18"/>
    ${[0, 1, 2, 3].map((i) => `<path d="M${4 + i * 3} ${50 + i * 12} L${30 - i * 2} ${50 + i * 12}" stroke="${palette[1]}" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/>`).join("")}
    <path d="M0 106 H160" stroke="#f2c94c" stroke-opacity=".25"/>
    <path d="${isEle ? ELEPHANT_PATH : HORSE_PATH}" fill="${palette[0]}" stroke="${palette[1]}" stroke-width="1.8" stroke-linejoin="round"/>
    ${isEle ? `<path d="M136 78 C150 86 152 100 146 108" stroke="${palette[0]}" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="124" cy="46" r="2.5" fill="#140f0c"/>`
      : `<path d="M106 48 C112 38 118 28 126 20 C120 34 116 44 112 52Z" fill="${palette[1]}" opacity=".85"/><circle cx="140" cy="27" r="2" fill="#140f0c"/>
         ${/hex|dilu|marca/.test(name) ? `<circle cx="138" cy="21" r="3.5" fill="#d24a3a"/>` : ""}`}
    ${spd ? `<g transform="translate(8 112)">${Array.from({ length: 10 }, (_, i) => `<rect x="${i * 6}" y="-4" width="4.5" height="4" rx="1" fill="${i < spd ? "#f2c94c" : "#3b2a20"}"/>`).join("")}</g>` : ""}
  </svg>`;
}

// ---------- MEDALLAS / LOGROS ----------
export function medalSVG(a = {}, { size } = {}) {
  const t = (a.type || "").toLowerCase();
  const col = t.includes("plat") ? ["#bfe6f2", "#4a8aa3"] : t.includes("gold") || t.includes("oro") ? ["#ffd65a", "#9a6a00"]
    : t.includes("silver") || t.includes("plata") ? ["#e3e8ee", "#6d7784"] : ["#e2995a", "#7a3f12"];
  const g = uid("md");
  const glyph = (a.name || "?").trim().charAt(0).toUpperCase();
  return `<svg class="art" viewBox="0 0 100 100" ${size ? `width="${size}" height="${size}"` : ""} role="img" aria-label="${esc(a.name || "")}">
    <defs><radialGradient id="${g}" cx="40%" cy="35%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset=".35" stop-color="${col[0]}"/><stop offset="1" stop-color="${col[1]}"/></radialGradient></defs>
    <path d="M34 4 L46 40 L38 44 L24 8Z" fill="#b3241b"/><path d="M66 4 L54 40 L62 44 L76 8Z" fill="#2a5cb3"/>
    <circle cx="50" cy="60" r="34" fill="url(#${g})" stroke="#140f0c" stroke-width="2"/>
    <circle cx="50" cy="60" r="26" fill="none" stroke="#140f0c" stroke-opacity=".35" stroke-width="1.5" stroke-dasharray="3 3"/>
    <text x="50" y="70" text-anchor="middle" font-size="28" font-weight="800" font-family="Cinzel, Georgia, serif" fill="#140f0c" fill-opacity=".8">${esc(glyph)}</text>
    ${a.hidden ? `<circle cx="80" cy="34" r="9" fill="#140f0c"/><text x="80" y="38.5" text-anchor="middle" font-size="12" fill="#f2c94c" font-family="system-ui">?</text>` : ""}
  </svg>`;
}

// ---------- ETAPAS ----------
export function stageSVG(st = {}, { size } = {}) {
  const ks = (st.kingdoms && st.kingdoms.length ? st.kingdoms : ["Other"]).slice(0, 4);
  const h = hashStr(st.name || "");
  const g = uid("sg");
  const xtreme = /xtreme|extrem/.test(st.type || "");
  return `<svg class="art" viewBox="0 0 200 120" ${size ? `width="${size}"` : ""} role="img" aria-label="${esc(st.name || "")}">
    <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${xtreme ? "#4a0f2a" : "#3b2a1a"}"/><stop offset="1" stop-color="#f0d9a8"/></linearGradient></defs>
    <rect width="200" height="120" rx="8" fill="url(#${g})"/>
    <circle cx="${40 + (h % 120)}" cy="32" r="16" fill="#ffe7a8" opacity=".55"/>
    <path d="M0 80 L${30 + (h % 20)} ${50 + (h % 14)} L70 72 L${100 + (h % 30)} ${40 + (h % 18)} L150 70 L180 56 L200 66 V120 H0Z" fill="#2a1d14" opacity=".75"/>
    <path d="M0 96 C40 88 80 104 120 94 C150 88 180 98 200 92 V120 H0Z" fill="#140f0c" opacity=".85"/>
    <path d="M${60 + (h % 50)} 88 l8 -14 l8 14Z M${68 + (h % 50)} 74 v-6 h10" fill="#140f0c" stroke="#f2c94c" stroke-opacity=".6"/>
    ${ks.map((k, i) => { const kk = kingdomOf(k); const x = 18 + i * 40; return `<g transform="translate(${x} 70)"><rect x="0" y="-44" width="2.5" height="46" fill="#d8c08a"/><path d="M2.5 -44 h26 l-5 9 l5 9 h-26Z" fill="${kk.main}" stroke="#140f0c"/><text x="14" y="-30" text-anchor="middle" font-size="11" font-family="'Ma Shan Zheng',serif" fill="#fff">${kk.hanzi}</text></g>`; }).join("")}
    ${xtreme ? `<text x="192" y="16" text-anchor="end" font-size="10" font-weight="700" font-family="system-ui" fill="#ffb3a2">XTREME</text>` : ""}
  </svg>`;
}

// ---------- ICONOS GENERALES (secretos, poderes, guardias, modos) ----------
export function glyphSVG(kind = "", { size = 56, color = "#f2c94c" } = {}) {
  const k = kind.toLowerCase();
  const ink = "#140f0c";
  let body;
  if (/desbloq|unlock|lock/.test(k)) body = `<rect x="28" y="44" width="44" height="36" rx="6" fill="${color}" stroke="${ink}" stroke-width="2"/><path d="M38 44 V34 C38 20 62 20 62 34" fill="none" stroke="${color}" stroke-width="6"/><circle cx="50" cy="60" r="5" fill="${ink}"/><rect x="48" y="62" width="4" height="10" fill="${ink}"/>`;
  else if (/easter|huevo/.test(k)) body = `<path d="M50 18 C32 18 24 50 26 62 C28 76 38 84 50 84 C62 84 72 76 74 62 C76 50 68 18 50 18Z" fill="${color}" stroke="${ink}" stroke-width="2"/><path d="M28 54 L38 48 L46 56 L54 48 L62 56 L72 50" stroke="${ink}" stroke-width="2.5" fill="none"/>`;
  else if (/farm|oro|coin/.test(k)) body = [0, 1, 2].map((i) => `<ellipse cx="${36 + i * 14}" cy="${64 - i * 10}" rx="18" ry="8" fill="${color}" stroke="${ink}" stroke-width="2"/>`).join("") + `<rect x="58" y="22" width="12" height="12" fill="none" stroke="${ink}" stroke-width="2"/>`;
  else if (/estrateg|strategy|map/.test(k)) body = `<path d="M20 24 L40 18 L60 26 L80 20 V76 L60 82 L40 74 L20 80Z" fill="#f5ecd6" stroke="${ink}" stroke-width="2"/><path d="M40 18 V74 M60 26 V82" stroke="${ink}" stroke-opacity=".4"/><path d="M28 60 C36 44 52 56 68 36" stroke="#b3241b" stroke-width="3" fill="none" stroke-dasharray="4 3"/><path d="M64 32 L72 34 L68 40Z" fill="#b3241b"/>`;
  else if (/personaje|secret|mask/.test(k)) body = `<path d="M22 34 C22 24 78 24 78 34 C78 60 66 80 50 82 C34 80 22 60 22 34Z" fill="${color}" stroke="${ink}" stroke-width="2"/><path d="M32 44 L44 48 L34 52Z M68 44 L56 48 L66 52Z" fill="${ink}"/><path d="M40 66 Q50 72 60 66" stroke="${ink}" stroke-width="2.5" fill="none"/>`;
  else if (/bug|error/.test(k)) body = `<ellipse cx="50" cy="56" rx="16" ry="22" fill="${color}" stroke="${ink}" stroke-width="2"/><circle cx="50" cy="30" r="9" fill="${color}" stroke="${ink}" stroke-width="2"/>${[44, 56, 68].map((y) => `<path d="M34 ${y} L22 ${y - 6} M66 ${y} L78 ${y - 6}" stroke="${ink}" stroke-width="2.5"/>`).join("")}<path d="M50 36 V78" stroke="${ink}" stroke-width="2"/>`;
  else if (/musou|power|poder/.test(k)) body = `<circle cx="50" cy="50" r="30" fill="none" stroke="${color}" stroke-width="5"/>${[...Array(8)].map((_, i) => `<path d="M50 10 L54 22 L46 22Z" transform="rotate(${i * 45} 50 50)" fill="${color}"/>`).join("")}<path d="M50 30 C58 40 62 48 58 58 C54 66 46 66 42 58 C38 48 44 40 50 30Z" fill="#ff7a2f"/>`;
  else if (/evas|evasion|esquiv/.test(k)) body = `<path d="M62 22 C48 30 40 46 46 60 C50 70 60 74 70 72 C56 82 34 76 28 58 C22 40 40 22 62 22Z" fill="${color}" stroke="${ink}" stroke-width="2"/>${[0, 1, 2].map((i) => `<path d="M${64 + i * 4} ${36 + i * 12} L${86 - i * 2} ${36 + i * 12}" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`).join("")}`;
  else if (/guard|defens|bloque/.test(k)) body = `<path d="M50 16 L80 28 C80 58 68 76 50 86 C32 76 20 58 20 28Z" fill="${color}" stroke="${ink}" stroke-width="2"/><path d="M38 50 L48 60 L64 40" stroke="${ink}" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  else if (/counter|contra/.test(k)) body = `<path d="M24 64 L62 26 M62 26 L48 26 M62 26 L62 40" stroke="${color}" stroke-width="6" stroke-linecap="round" fill="none"/><path d="M76 36 L38 74 M38 74 L52 74 M38 74 L38 60" stroke="#ff7a2f" stroke-width="6" stroke-linecap="round" fill="none"/>`;
  else if (/charge|cargad|combo/.test(k)) body = `<path d="M50 50 m-4 0 a4 4 0 1 1 8 0 a10 10 0 1 1 -20 0 a16 16 0 1 1 32 0 a22 22 0 1 1 -44 0 a28 28 0 1 1 56 0" stroke="${color}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  else if (/modo|mode|truco|tip/.test(k)) body = `<rect x="26" y="20" width="48" height="62" rx="4" fill="#f5ecd6" stroke="${ink}" stroke-width="2"/>${[34, 44, 54, 64].map((y) => `<path d="M34 ${y} H66" stroke="${ink}" stroke-opacity=".5" stroke-width="2.5"/>`).join("")}<circle cx="70" cy="74" r="10" fill="#b3241b"/>`;
  else body = `<circle cx="50" cy="50" r="30" fill="${color}" stroke="${ink}" stroke-width="2"/><path d="M50 20 A15 15 0 0 1 50 50 A15 15 0 0 0 50 80 A30 30 0 0 1 50 20Z" fill="${ink}"/><circle cx="50" cy="35" r="4.5" fill="${color}"/><circle cx="50" cy="65" r="4.5" fill="${ink}" stroke="${color}"/>`;
  return `<svg class="art glyph" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${body}</svg>`;
}

export function bodyguardSVG(type = {}, { size } = {}) {
  const k = `${type.name || ""} ${type.role || ""}`.toLowerCase();
  const kind = /arquer|archer|arco|bow|crossbow|ballesta/.test(k) ? "bow" : /caball|cavalry|horse|jinete/.test(k) ? "spear"
    : /escudo|shield|defens|tank/.test(k) ? "club" : /maza|hacha|axe|power|fuerza/.test(k) ? "axe" : /espad|sword/.test(k) ? "sword" : "spear";
  const g = uid("bgd");
  return `<svg class="art" viewBox="0 0 120 120" ${size ? `width="${size}"` : ""} role="img" aria-label="${esc(type.name || "")}">
    <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a3424"/><stop offset="1" stop-color="#140f0c"/></linearGradient></defs>
    <rect width="120" height="120" rx="12" fill="url(#${g})"/>
    ${[-26, 0, 26].map((dx, i) => `<g transform="translate(${60 + dx} ${i === 1 ? 0 : 8}) scale(${i === 1 ? 1 : 0.85})" opacity="${i === 1 ? 1 : 0.7}">
      <g transform="translate(14 22) scale(.6)"><g transform="translate(50 50) rotate(20)">${weaponShapes(kind, "#d9dde4", "#b3241b", "#140f0c")}</g></g>
      <path d="M-16 112 C-16 86 -10 76 0 74 C10 76 16 86 16 112Z" fill="#0d0b10" stroke="#f2c94c" stroke-opacity=".6"/>
      <circle cx="0" cy="62" r="11" fill="#0d0b10" stroke="#f2c94c" stroke-opacity=".6"/><path d="M-12 58 C-10 44 10 44 12 58Z" fill="#7d8a99"/></g>`).join("")}
  </svg>`;
}

export function heroSVG() {
  const g = uid("hs"), s = uid("hsun");
  const spears = Array.from({ length: 46 }, (_, i) => { const x = i * 27 + (i % 3) * 5; const y = 300 + Math.sin(i * 0.7) * 10; return `<path d="M${x} ${y} L${x} ${y - 70}" stroke="#140c0a" stroke-width="2.4"/><path d="M${x} ${y - 78} l-3 9 h6Z" fill="#140c0a"/>`; }).join("");
  const flag = (x, y, k) => `<g transform="translate(${x} ${y})"><rect x="0" y="0" width="5" height="190" fill="#2a1a10"/><path d="M5 6 H96 L84 44 L96 82 H5Z" fill="${KINGDOMS[k].main}" stroke="#140c0a" stroke-width="3"/><text x="48" y="62" text-anchor="middle" font-size="46" font-family="'Ma Shan Zheng','Noto Serif SC',serif" fill="#fff6ea">${KINGDOMS[k].hanzi}</text></g>`;
  return `<svg class="hero-art" viewBox="0 0 1200 420" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
    <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a0a0a"/><stop offset=".45" stop-color="#7a1d12"/><stop offset=".8" stop-color="#e0822c"/><stop offset="1" stop-color="#f6c66b"/></linearGradient>
    <radialGradient id="${s}"><stop offset="0" stop-color="#fff2c4"/><stop offset=".5" stop-color="#ffb347" stop-opacity=".8"/><stop offset="1" stop-color="#ff7a2f" stop-opacity="0"/></radialGradient></defs>
    <rect width="1200" height="420" fill="url(#${g})"/>
    <circle cx="860" cy="250" r="190" fill="url(#${s})"/>
    <circle cx="860" cy="250" r="88" fill="#fff0c2" opacity=".9"/>
    <path d="M0 270 L120 190 L220 240 L360 150 L480 230 L600 170 L720 240 L860 160 L1000 230 L1100 180 L1200 220 V420 H0Z" fill="#3a130c" opacity=".7"/>
    <path d="M0 320 L160 250 L300 300 L460 240 L640 310 L800 260 L980 320 L1200 270 V420 H0Z" fill="#1f0a07" opacity=".9"/>
    ${spears}
    <path d="M0 330 C300 300 600 350 900 320 C1050 305 1150 320 1200 315 V420 H0Z" fill="#0d0605"/>
    ${flag(760, 160, "Wei")}${flag(960, 120, "Wu")}${flag(1080, 170, "Shu")}
  </svg>`;
}
