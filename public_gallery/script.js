/* Public Gallery — loads real fonts from the public_gallery/ folder of your
 * GitHub repo, parses each file with opentype.js and renders live previews. */

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.cstmpj.two";

/* ↓ Change these if your repo ever moves */
const REPO = "universalfontmaker/universalfontmaker.github.io";
const BRANCH = "main";
const DIR = "public_gallery";

const FONT_RE = /\.(ttf|otf|woff2?)$/i;

const SCRIPT_RANGES = [
  [0x0041, 0x024f, "latin", "Latin"],
  [0x1000, 0x109f, "burmese", "Burmese"],
  [0x0900, 0x097f, "devanagari", "Devanagari"],
  [0x0e00, 0x0e7f, "thai", "Thai"],
  [0x0400, 0x04ff, "cyrillic", "Cyrillic"],
  [0x0600, 0x06ff, "arabic", "Arabic"],
  [0x0980, 0x09ff, "bengali", "Bengali"],
  [0x0b80, 0x0bff, "tamil", "Tamil"],
  [0x0c00, 0x0c7f, "telugu", "Telugu"],
  [0x0c80, 0x0cff, "kannada", "Kannada"],
  [0x0d00, 0x0d7f, "malayalam", "Malayalam"],
  [0x0590, 0x05ff, "hebrew", "Hebrew"],
  [0x0370, 0x03ff, "greek", "Greek"],
  [0x10a0, 0x10ff, "georgian", "Georgian"],
  [0x1780, 0x17ff, "khmer", "Khmer"],
];

const PANGRAMS = {
  latin: "The quick brown fox jumps over a lazy dog.",
  burmese: "သီဟိုဠ်မှ ဉာဏ်ကြီးရှင်သည် အာယုဝဍ္ဎနသည်ကဲ့သို့ ရှိနေသည်။",
  thai: "นายสังฆภัณฑ์ เฮงพิทักษ์ฝั่ง ผู้เฒ่าซึ่งมีอาชีพเป็นฅนขายฃวด",
  arabic: "نص حكيم له سر قاطع وذو شأن عظيم مكتوب على ثوب أخضر",
  hebrew: "דג סקרן שט בים מאוכזב ולפתע מצא חברה",
  greek: "Ταχίστη αλώπηξ βαφής ψημένη γη, δρασκελίζει υπέρ νωθρού κυνός",
  cyrillic: "Съешь же ещё этих мягких французских булок, да выпей чаю",
  devanagari: "ऋषियों को सताने वाले दुष्ट राक्षसों के राजा रावण का सर्वनाश",
  bengali: "আমার সোনার বাংলা, আমি তোমায় ভালোবাসি",
  tamil: "தமிழ் மொழி இனிமையான மொழி",
  telugu: "తెలుగు భాష అందమైన భాష",
  kannada: "ಕನ್ನಡ ನಮ್ಮ ಮಾತೃಭಾಷೆ",
  malayalam: "മലയാളം എന്റെ മാതൃഭാഷ",
  georgian: "ქართული დამწერლობა მსოფლიოს ერთ-ერთი უძველესია",
  khmer: "ខ្ញុំស្រឡាញ់ភាសាខ្មែរ",
};

const gallery = document.getElementById("gallery");
const filterButtons = document.querySelectorAll(".filter-chip");
const backButton = document.querySelector(".back-btn");

const state = { fonts: [], filter: "all" };

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/* List every font file inside public_gallery/ (GitHub API, jsDelivr fallback). */
async function listFontFiles() {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO}/contents/${DIR}?ref=${BRANCH}&t=${Date.now()}`,
      { cache: "no-store", headers: { Accept: "application/vnd.github+json" } }
    );
    if (res.ok) {
      const entries = await res.json();
      if (Array.isArray(entries)) {
        return entries
          .filter((e) => e.type === "file" && FONT_RE.test(e.name) && e.download_url)
          .map((e) => ({ name: e.name, size: e.size, url: e.download_url }))
          .sort((a, b) => a.name.localeCompare(b.name));
      }
    }
  } catch (_) {
    /* fall through */
  }

  const res = await fetch(
    `https://data.jsdelivr.com/v1/packages/gh/${REPO}@${BRANCH}?structure=flat`
  );
  if (!res.ok) throw new Error("Could not reach the gallery");
  const data = await res.json();
  const prefix = `/${DIR}/`;
  return (data.files || [])
    .filter((f) => f.name.startsWith(prefix) && FONT_RE.test(f.name))
    .map((f) => ({
      name: f.name.slice(prefix.length),
      size: f.size,
      url: `https://cdn.jsdelivr.net/gh/${REPO}@${BRANCH}${f.name}`,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

function pickName(record) {
  if (!record) return undefined;
  return record.en || Object.values(record)[0];
}

function flattenNames(names) {
  const out = {};
  for (const platform of Object.values(names || {})) {
    if (!platform || typeof platform !== "object") continue;
    for (const [key, value] of Object.entries(platform)) {
      if (!out[key] && value && typeof value === "object" && !Array.isArray(value)) {
        out[key] = value;
      }
    }
  }
  return out;
}

/* Download + parse a font file, register it for live preview. */
async function loadFont(file, index) {
  const buf = await fetch(file.url).then((r) => {
    if (!r.ok) throw new Error("download failed");
    return r.arrayBuffer();
  });

  const font = opentype.parse(buf);
  const names = flattenNames(font.names);

  const counts = new Map();
  for (let i = 0; i < font.glyphs.length; i++) {
    const g = font.glyphs.get(i);
    const u = g && g.unicode;
    if (!u || u <= 0x20) continue;
    const idx = SCRIPT_RANGES.findIndex(([a, b]) => u >= a && u <= b);
    if (idx >= 0) counts.set(idx, (counts.get(idx) || 0) + 1);
  }
  const best = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  const hit = best ? SCRIPT_RANGES[best[0]] : SCRIPT_RANGES[0];

  const family = `GalleryFont-${index}`;
  const face = await new FontFace(family, buf).load();
  document.fonts.add(face);

  return {
    fileName: file.name,
    url: file.url,
    size: file.size,
    family,
    name: pickName(names.fontFamily) || file.name.replace(/\.[a-z0-9]+$/i, ""),
    author: pickName(names.designer) || pickName(names.manufacturer) || "Community",
    glyphs: font.glyphs.length,
    script: hit[2],
    scriptLabel: hit[3],
    preview: PANGRAMS[hit[2]] || PANGRAMS.latin,
  };
}

function renderCards() {
  gallery.innerHTML = "";

  const visible =
    state.filter === "all" ? state.fonts : state.fonts.filter((f) => f.script === state.filter);

  if (visible.length === 0) {
    gallery.innerHTML = `<p class="empty-note">No fonts in this category yet.</p>`;
    return;
  }

  for (const font of visible) {
    const card = document.createElement("article");
    card.className = "font-card";

    card.innerHTML = `
      <div class="card-header">
        <h2 class="font-name">${escapeHtml(font.name)}</h2>
        <span class="script-badge">${escapeHtml(font.scriptLabel)}</span>
      </div>
      <p class="preview" style="font-family:'${font.family}',sans-serif">${escapeHtml(font.preview)}</p>
      <div class="card-footer">
        <div class="meta">
          <span>${escapeHtml(font.author)}</span>
          <span class="dot"></span>
          <span>${formatBytes(font.size)}</span>
          <span class="dot"></span>
          <span>${font.glyphs} glyphs</span>
        </div>
        <div class="actions">
          <a class="download-btn" href="${font.url}" download="${escapeHtml(font.fileName)}" aria-label="Download ${escapeHtml(font.name)}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>${escapeHtml(font.fileName.split(".").pop().toUpperCase())}</span>
          </a>
        </div>
      </div>
    `;

    gallery.appendChild(card);
  }
}

function renderSkeleton() {
  gallery.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    const card = document.createElement("article");
    card.className = "font-card skeleton";
    card.innerHTML = `<div class="card-header"><div class="sk-line w-40"></div><div class="sk-line w-16"></div></div><div class="sk-line w-full h-20"></div>`;
    gallery.appendChild(card);
  }
}

function renderError(message) {
  gallery.innerHTML = `
    <div class="empty-note">
      <p>${escapeHtml(message)}</p>
      <button class="retry-btn" id="retry-btn">Try again</button>
    </div>`;
  document.getElementById("retry-btn").addEventListener("click", init);
}

async function init() {
  renderSkeleton();
  try {
    const files = await listFontFiles();
    if (files.length === 0) {
      gallery.innerHTML = `<p class="empty-note">No fonts published yet — be the first!</p>`;
      return;
    }

    const results = await Promise.allSettled(files.map((f, i) => loadFont(f, i)));
    state.fonts = results
      .filter((r) => r.status === "fulfilled")
      .map((r) => r.value);

    if (state.fonts.length === 0) {
      renderError("Fonts could not be loaded. Check your connection.");
      return;
    }
    renderCards();
  } catch (err) {
    renderError("Could not reach the gallery. Check your connection.");
  }
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.filter = btn.dataset.filter;
    renderCards();
  });
});

backButton.addEventListener("click", () => {
  window.location.href = PLAY_STORE_URL;
});

init();
