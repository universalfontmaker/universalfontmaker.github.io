const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.cstmpj.two";

const fonts = [
  {
    id: "andrea",
    name: "Andrea",
    script: "latin",
    scriptLabel: "Latin",
    fontClass: "font-andrea",
    author: "Andrea Geisha",
    size: "650 KB",
    glyphs: "3884 glyphs",
    preview: "The quick brown fox jumps over a lazy dog.",
    downloadUrl: "#andrea-ttf",
  },
  {
    id: "devtest",
    name: "Devtest Font",
    script: "latin",
    scriptLabel: "Latin",
    fontClass: "font-devtest",
    author: "Devs@Universal Font Maker",
    size: "56 KB",
    glyphs: "96 glyphs",
    preview: "The quick brown fox jumps over a lazy dog.",
    downloadUrl: "#devtest-ttf",
  },
  {
    id: "inwatermyanmar",
    name: "InWaterMyanmar",
    script: "burmese",
    scriptLabel: "Burmese",
    fontClass: "font-burmese",
    author: "Universal Font Maker DEV",
    size: "345 KB",
    glyphs: "112 glyphs",
    preview: "သီဟိုဠ်မှ ဉာဏ်ကြီးရှင်သည် အာယုဝဍ္ဎနသည်ကဲ့သို့...",
    downloadUrl: "#inwatermyanmar-ttf",
  },
  {
    id: "mmblocks",
    name: "MmBlocks",
    script: "burmese",
    scriptLabel: "Burmese",
    fontClass: "font-burmese",
    author: "Universal Font maker",
    size: "198 KB",
    glyphs: "62 glyphs",
    preview: "သီဟိုဠ်မှ ဉာဏ်ကြီးရှင်သည် အာယုဝဍ္ဎနသည်ကဲ့သို့...",
    downloadUrl: "#mmblocks-ttf",
  },
  {
    id: "myanmarthai",
    name: "Myanmarthai",
    script: "thai",
    scriptLabel: "Thai",
    fontClass: "font-thai",
    author: "Universal Font Maker",
    size: "210 KB",
    glyphs: "87 glyphs",
    preview: "นายสังฆภัณฑ์ เฮงพิทักษ์ฝั่ง ผู้เฒ่าซึ่งมีอาชีพเป็นฅนขาย...",
    downloadUrl: "#myanmarthai-ttf",
  },
];

const gallery = document.getElementById("gallery");
const filterButtons = document.querySelectorAll(".filter-chip");
const backButton = document.querySelector(".back-btn");

function renderCards(filter = "all") {
  gallery.innerHTML = "";

  const visible = filter === "all" ? fonts : fonts.filter((f) => f.script === filter);

  visible.forEach((font) => {
    const card = document.createElement("article");
    card.className = "font-card";
    card.setAttribute("data-script", font.script);

    card.innerHTML = `
      <div class="card-header">
        <h2 class="font-name">${escapeHtml(font.name)}</h2>
        <span class="script-badge">${escapeHtml(font.scriptLabel)}</span>
      </div>
      <p class="preview ${font.fontClass}">${escapeHtml(font.preview)}</p>
      <div class="card-footer">
        <div class="meta">
          <span>${escapeHtml(font.author)}</span>
          <span class="dot"></span>
          <span>${escapeHtml(font.size)}</span>
          <span class="dot"></span>
          <span>${escapeHtml(font.glyphs)}</span>
        </div>
        <div class="actions">
          <a class="download-btn" href="${font.downloadUrl}" download aria-label="Download ${escapeHtml(font.name)}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>TTF</span>
          </a>
          <button class="more-btn" aria-label="More options for ${escapeHtml(font.name)}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="6" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="18" r="2" />
            </svg>
          </button>
        </div>
      </div>
    `;

    gallery.appendChild(card);
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderCards(btn.dataset.filter);
  });
});

backButton.addEventListener("click", () => {
  window.location.href = PLAY_STORE_URL;
});

renderCards();
