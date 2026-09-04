/* Public Gallery — vanilla JS, no build step. Works on GitHub Pages.
   Fonts are discovered live from the GitHub folder, so uploading a new
   .ttf/.otf there makes it appear here automatically. */

const REPO = "universalfontmaker/universalfontmaker.github.io";
const BRANCH = "main";
const FOLDER = "public_gallery";
const API = `https://api.github.com/repos/${REPO}/contents/${FOLDER}?ref=${BRANCH}`;
const POLL_MS = 60000;

const SAMPLES = {
  Latin: "The quick brown fox jumps over a lazy dog.",
  Burmese: "သီဟိုဠ်မှ ဉာဏ်ကြီးရှင်သည် အာယုဝဍ္ဎနဆေးညွှန်းစာကို ဇလွန်ဆေးသွေးဘေးဗာဒံပင်...",
  Thai: "เป็นมนุษย์สุดประเสริฐเลิศคุณค่า กว่าบรรดาฝูงสัตว์เดรัจฉาน",
};

const listEl = document.getElementById("list");
const overlay = document.getElementById("overlay");
const sheets = {
  actions: document.getElementById("sheet-actions"),
  preview: document.getElementById("sheet-preview"),
  meta: document.getElementById("sheet-meta"),
};

let FONTS = [];
let OVERRIDES = {};
let filter = "all";
let current = null;
let signature = "";

/* ---------- helpers ---------- */
const fmtKB = (bytes) => (bytes ? Math.round(bytes / 1024) + " KB" : "—");
const cssName = (f) => "gal_" + f.file.replace(/[^a-z0-9]/gi, "_");
const prettyName = (file) =>
  file.replace(/\.(ttf|otf|woff2?)$/i, "").replace(/[_-]+/g, " ").trim();

function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => (t.hidden = true), 1600);
}

/* ---------- font binary parsing (name / head / maxp / cmap) ---------- */
function parseFont(buf) {
  const dv = new DataView(buf);
  const out = { unitsPerEm: null, numGlyphs: null, names: {}, has: () => false };
  const numTables = dv.getUint16(4);
  const tables = {};
  for (let i = 0; i < numTables; i++) {
    const p = 12 + i * 16;
    const tag = String.fromCharCode(dv.getUint8(p), dv.getUint8(p + 1), dv.getUint8(p + 2), dv.getUint8(p + 3));
    tables[tag] = { off: dv.getUint32(p + 8), len: dv.getUint32(p + 12) };
  }
  if (tables.head) out.unitsPerEm = dv.getUint16(tables.head.off + 18);
  if (tables.maxp) out.numGlyphs = dv.getUint16(tables.maxp.off + 4);

  if (tables.name) {
    const base = tables.name.off;
    const count = dv.getUint16(base + 2);
    const strOff = base + dv.getUint16(base + 4);
    for (let i = 0; i < count; i++) {
      const r = base + 6 + i * 12;
      const platform = dv.getUint16(r);
      const nameId = dv.getUint16(r + 6);
      const len = dv.getUint16(r + 8);
      const off = dv.getUint16(r + 10);
      const bytes = new Uint8Array(buf, strOff + off, len);
      let str = "";
      if (platform === 3 || platform === 0) {
        for (let k = 0; k + 1 < len; k += 2) str += String.fromCharCode((bytes[k] << 8) | bytes[k + 1]);
      } else {
        for (let k = 0; k < len; k++) str += String.fromCharCode(bytes[k]);
      }
      if (out.names[nameId] === undefined) out.names[nameId] = str;
    }
  }

  if (tables.cmap) {
    const ranges = readCmapRanges(dv, tables.cmap.off);
    out.has = (cp) => ranges.some((r) => cp >= r[0] && cp <= r[1]);
  }
  return out;
}

function readCmapRanges(dv, base) {
  const n = dv.getUint16(base + 2);
  let best = null;
  for (let i = 0; i < n; i++) {
    const rec = base + 4 + i * 8;
    const platform = dv.getUint16(rec);
    const encoding = dv.getUint16(rec + 2);
    const off = base + dv.getUint32(rec + 4);
    const format = dv.getUint16(off);
    const unicode = platform === 3 && (encoding === 1 || encoding === 10);
    if (format === 12 && unicode) {
      best = { off, format };
      break;
    }
    if (format === 4 && unicode && !best) best = { off, format };
  }
  if (!best) return [];
  const ranges = [];
  if (best.format === 4) {
    const segX2 = dv.getUint16(best.off + 6);
    const endBase = best.off + 14;
    const startBase = endBase + segX2 + 2;
    for (let s = 0; s < segX2 / 2; s++) {
      const end = dv.getUint16(endBase + s * 2);
      const start = dv.getUint16(startBase + s * 2);
      if (start <= end && start !== 0xffff) ranges.push([start, end]);
    }
  } else {
    const groups = dv.getUint32(best.off + 12);
    for (let g = 0; g < groups; g++) {
      const p = best.off + 16 + g * 12;
      ranges.push([dv.getUint32(p), dv.getUint32(p + 4)]);
    }
  }
  return ranges;
}

function detectLanguage(info) {
  if (info.has(0x1000) || info.has(0x1021)) return "Burmese";
  if (info.has(0x0e01)) return "Thai";
  return "Latin";
}

async function loadFont(f) {
  if (f._loaded) return f;
  f._loaded = true;
  try {
    const res = await fetch(f.url);
    if (!res.ok) throw new Error(res.status);
    const buf = await res.arrayBuffer();
    f.size = buf.byteLength;
    const info = parseFont(buf);
    f.family = info.names[16] || info.names[1] || f.name;
    f.name = f.override.name || f.family || f.name;
    f.designer = f.override.designer || info.names[9] || "—";
    f.version = info.names[5] || "—";
    f.copyright = info.names[0] || "—";
    f.glyphs = info.numGlyphs;
    f.unitsPerEm = info.unitsPerEm;
    f.language = f.override.language || detectLanguage(info);
    const face = new FontFace(cssName(f), buf);
    await face.load();
    document.fonts.add(face);
    f.ok = true;
  } catch (e) {
    f.ok = false;
  }
  return f;
}

/* ---------- rendering ---------- */
function icon(kind) {
  if (kind === "dl")
    return '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M12 3v11m0 0 4-4m-4 4-4-4M4 19h16" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  return '<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg>';
}

function render() {
  const items = FONTS.filter((f) => filter === "all" || f.language === filter);
  listEl.innerHTML = "";
  if (!items.length) {
    listEl.innerHTML = '<p class="empty">No fonts in this category yet.</p>';
    return;
  }
  items.forEach((f) => {
    const card = document.createElement("article");
    card.className = "card";
    const ext = f.file.split(".").pop().toUpperCase();
    card.innerHTML = `
      <div class="card-top">
        <div class="card-name">${f.name}</div>
        <div class="card-lang">${f.language}</div>
      </div>
      <div class="sample" style="font-family:'${cssName(f)}', serif">${SAMPLES[f.language] || SAMPLES.Latin}</div>
      <div class="card-foot">
        <div class="card-meta">${f.designer || "—"} &middot; ${fmtKB(f.size)}${f.glyphs ? " &middot; " + f.glyphs + " glyphs" : ""}</div>
        <button class="dl" type="button" data-dl="1">${icon("dl")}<span>${ext}</span></button>
        <button class="kebab" type="button" data-kebab="1" aria-label="More options">${icon("kebab")}</button>
      </div>`;
    card.querySelector("[data-dl]").addEventListener("click", () => download(f));
    card.querySelector("[data-kebab]").addEventListener("click", () => openActions(f));
    listEl.appendChild(card);
  });
}

/* ---------- actions ---------- */
function showSheet(key) {
  Object.values(sheets).forEach((s) => (s.hidden = true));
  sheets[key].hidden = false;
  overlay.hidden = false;
}
function closeSheet() {
  overlay.hidden = true;
  Object.values(sheets).forEach((s) => (s.hidden = true));
}

function download(f) {
  const a = document.createElement("a");
  a.href = f.url;
  a.download = f.file;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function openActions(f) {
  current = f;
  document.getElementById("as-title").textContent = f.name;
  document.getElementById("as-sub").textContent =
    f.file.split(".").pop().toUpperCase() + " · " + fmtKB(f.size);
  showSheet("actions");
}

function openPreview(f) {
  document.getElementById("pv-title").textContent = f.name;
  const input = document.getElementById("pv-input");
  const stage = document.getElementById("pv-stage");
  const range = document.getElementById("pv-range");
  const size = document.getElementById("pv-size");
  input.value = SAMPLES[f.language] || SAMPLES.Latin;
  stage.style.fontFamily = `'${cssName(f)}', serif`;
  const sync = () => {
    stage.textContent = input.value;
    stage.style.fontSize = range.value + "px";
    size.textContent = range.value + "px";
  };
  input.oninput = sync;
  range.oninput = sync;
  sync();
  showSheet("preview");
}

function openMeta(f) {
  document.getElementById("mt-file").textContent = f.file;
  const rows = [
    ["Family", f.family || f.name],
    ["Language", f.language],
    ["Designer", f.designer || "—"],
    ["Version", f.version || "—"],
    ["Glyphs", f.glyphs != null ? String(f.glyphs) : "—"],
    ["Units/em", f.unitsPerEm != null ? String(f.unitsPerEm) : "—"],
    ["Size", fmtKB(f.size)],
    ["Copyright", f.copyright || "—"],
  ];
  document.getElementById("mt-table").innerHTML = rows
    .map((r) => `<dl class="meta-row"><dt>${r[0]}</dt><dd>${r[1]}</dd></dl>`)
    .join("");
  showSheet("meta");
}

overlay.addEventListener("click", (e) => {
  const act = e.target.closest("[data-act]");
  if (e.target === overlay) return closeSheet();
  if (!act) return;
  const kind = act.dataset.act;
  if (kind === "close") return closeSheet();
  if (!current) return;
  if (kind === "preview") return openPreview(current);
  if (kind === "metadata") return openMeta(current);
  if (kind === "download") {
    download(current);
    return closeSheet();
  }
  if (kind === "copy") {
    const url = current.url;
    (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject())
      .then(() => toast("Link copied"))
      .catch(() => toast(url));
    closeSheet();
  }
});

document.getElementById("chips").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  document.querySelectorAll(".chip").forEach((c) => c.classList.toggle("is-active", c === chip));
  filter = chip.dataset.lang;
  render();
});

/* ---------- live folder listing ---------- */
async function fetchListing() {
  const res = await fetch(API, {
    cache: "no-store",
    headers: { Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error("GitHub API " + res.status);
  const data = await res.json();
  return data
    .filter((e) => e.type === "file" && /\.(ttf|otf|woff2?)$/i.test(e.name))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((e) => ({
      file: e.name,
      sha: e.sha,
      size: e.size,
      url:
        e.download_url ||
        `https://raw.githubusercontent.com/${REPO}/${BRANCH}/${FOLDER}/${encodeURIComponent(e.name)}`,
    }));
}

async function sync(firstRun) {
  let entries;
  try {
    entries = await fetchListing();
  } catch (e) {
    if (firstRun && !FONTS.length)
      listEl.innerHTML =
        '<p class="empty">Could not reach the font folder right now. It will retry automatically.</p>';
    return;
  }

  const sig = entries.map((e) => e.file + ":" + e.sha).join("|");
  if (sig === signature) return;
  signature = sig;

  const prev = new Map(FONTS.map((f) => [f.file + ":" + f.sha, f]));
  FONTS = entries.map((e) => {
    const kept = prev.get(e.file + ":" + e.sha);
    if (kept) return kept;
    const override = OVERRIDES[e.file] || {};
    return {
      ...e,
      override,
      name: override.name || prettyName(e.file),
      language: override.language || "Latin",
      designer: override.designer || "",
    };
  });
  render();
  for (const f of FONTS) {
    await loadFont(f);
    render();
  }
}

(async function init() {
  listEl.innerHTML = '<p class="empty">Loading fonts…</p>';
  try {
    const r = await fetch("./fonts.json", { cache: "no-store" });
    if (r.ok) {
      const arr = await r.json();
      arr.forEach((o) => o.file && (OVERRIDES[o.file] = o));
    }
  } catch (e) {
    /* overrides are optional */
  }
  await sync(true);
  setInterval(() => sync(false), POLL_MS);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) sync(false);
  });
})();
