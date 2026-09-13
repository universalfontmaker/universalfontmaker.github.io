/* Universal Font Maker — landing page
 * Renders the supported-language list (searchable) and a keyword phrase block
 * so "<language> font maker / creator / designer" queries can match this page.
 */

/** [English name, native name, script] */
const LANGUAGES = [
  ["Myanmar (Burmese)", "မြန်မာ", "Myanmar"],
  ["Shan", "လိၵ်ႈတႆး", "Myanmar"],
  ["Mon", "ဘာသာမန်", "Myanmar"],
  ["Karen (S'gaw)", "ကညီ", "Myanmar"],
  ["Rakhine", "ရခိုင်", "Myanmar"],
  ["Pali", "पालि", "Myanmar"],
  ["Thai", "ไทย", "Thai"],
  ["Lao", "ລາວ", "Lao"],
  ["Khmer", "ខ្មែរ", "Khmer"],
  ["Vietnamese", "Tiếng Việt", "Latin"],
  ["Hindi", "हिन्दी", "Devanagari"],
  ["Marathi", "मराठी", "Devanagari"],
  ["Nepali", "नेपाली", "Devanagari"],
  ["Sanskrit", "संस्कृतम्", "Devanagari"],
  ["Konkani", "कोंकणी", "Devanagari"],
  ["Maithili", "मैथिली", "Devanagari"],
  ["Bhojpuri", "भोजपुरी", "Devanagari"],
  ["Dogri", "डोगरी", "Devanagari"],
  ["Bengali", "বাংলা", "Bengali"],
  ["Assamese", "অসমীয়া", "Bengali"],
  ["Manipuri", "মেইতেই", "Bengali"],
  ["Tamil", "தமிழ்", "Tamil"],
  ["Telugu", "తెలుగు", "Telugu"],
  ["Kannada", "ಕನ್ನಡ", "Kannada"],
  ["Malayalam", "മലയാളം", "Malayalam"],
  ["Gujarati", "ગુજરાતી", "Gujarati"],
  ["Punjabi (Gurmukhi)", "ਪੰਜਾਬੀ", "Gurmukhi"],
  ["Odia", "ଓଡ଼ିଆ", "Odia"],
  ["Sinhala", "සිංහල", "Sinhala"],
  ["Dhivehi", "ދިވެހި", "Thaana"],
  ["Tibetan", "བོད་ཡིག", "Tibetan"],
  ["Dzongkha", "རྫོང་ཁ", "Tibetan"],
  ["Urdu", "اردو", "Arabic"],
  ["Arabic", "العربية", "Arabic"],
  ["Persian (Farsi)", "فارسی", "Arabic"],
  ["Pashto", "پښتو", "Arabic"],
  ["Kurdish (Sorani)", "کوردی", "Arabic"],
  ["Sindhi", "سنڌي", "Arabic"],
  ["Uyghur", "ئۇيغۇرچە", "Arabic"],
  ["Kashmiri", "کٲشُر", "Arabic"],
  ["Balochi", "بلوچی", "Arabic"],
  ["Hebrew", "עברית", "Hebrew"],
  ["Yiddish", "ייִדיש", "Hebrew"],
  ["Syriac", "ܣܘܪܝܝܐ", "Syriac"],
  ["Amharic", "አማርኛ", "Ethiopic"],
  ["Tigrinya", "ትግርኛ", "Ethiopic"],
  ["Oromo", "Oromoo", "Latin"],
  ["Somali", "Soomaali", "Latin"],
  ["Swahili", "Kiswahili", "Latin"],
  ["Hausa", "Harshen Hausa", "Latin"],
  ["Yoruba", "Yorùbá", "Latin"],
  ["Igbo", "Igbo", "Latin"],
  ["Zulu", "isiZulu", "Latin"],
  ["Xhosa", "isiXhosa", "Latin"],
  ["Afrikaans", "Afrikaans", "Latin"],
  ["Shona", "chiShona", "Latin"],
  ["Wolof", "Wolof", "Latin"],
  ["Fula (Adlam)", "𞤆𞤵𞤤𞤢𞤪", "Adlam"],
  ["N'Ko", "ߒߞߏ", "NKo"],
  ["Tifinagh (Tamazight)", "ⵜⴰⵎⴰⵣⵉⵖⵜ", "Tifinagh"],
  ["Coptic", "ⲘⲉⲧⲢⲉⲙ̀ⲛⲭⲏⲙⲓ", "Coptic"],
  ["Greek", "Ελληνικά", "Greek"],
  ["Russian", "Русский", "Cyrillic"],
  ["Ukrainian", "Українська", "Cyrillic"],
  ["Belarusian", "Беларуская", "Cyrillic"],
  ["Bulgarian", "Български", "Cyrillic"],
  ["Serbian", "Српски", "Cyrillic"],
  ["Macedonian", "Македонски", "Cyrillic"],
  ["Kazakh", "Қазақша", "Cyrillic"],
  ["Kyrgyz", "Кыргызча", "Cyrillic"],
  ["Tajik", "Тоҷикӣ", "Cyrillic"],
  ["Mongolian", "Монгол", "Cyrillic"],
  ["Bashkir", "Башҡортса", "Cyrillic"],
  ["Tatar", "Татарча", "Cyrillic"],
  ["Chuvash", "Чӑвашла", "Cyrillic"],
  ["Yakut (Sakha)", "Саха тыла", "Cyrillic"],
  ["Armenian", "Հայերեն", "Armenian"],
  ["Georgian", "ქართული", "Georgian"],
  ["Chinese (Traditional)", "繁體中文", "Han"],
  ["Chinese (Simplified)", "简体中文", "Han"],
  ["Cantonese", "廣東話", "Han"],
  ["Japanese", "日本語", "Japanese"],
  ["Korean", "한국어", "Hangul"],
  ["Yi (Nuosu)", "ꆈꌠ", "Yi"],
  ["Lisu", "ꓡꓲ‑ꓢꓴ", "Lisu"],
  ["Cham", "ꨌꩌ", "Cham"],
  ["Javanese", "ꦧꦱꦗꦮ", "Javanese"],
  ["Balinese", "ᬅᬓ᭄ᬱᬭᬩᬮᬶ", "Balinese"],
  ["Sundanese", "ᮘᮞ ᮞᮥᮔ᮪ᮓ", "Sundanese"],
  ["Indonesian", "Bahasa Indonesia", "Latin"],
  ["Malay", "Bahasa Melayu", "Latin"],
  ["Filipino (Tagalog)", "Filipino", "Latin"],
  ["Cebuano", "Bisaya", "Latin"],
  ["Cherokee", "ᏣᎳᎩ", "Cherokee"],
  ["Inuktitut", "ᐃᓄᒃᑎᑐᑦ", "Canadian Aboriginal"],
  ["Cree", "ᓀᐦᐃᔭᐍᐏᐣ", "Canadian Aboriginal"],
  ["Osage", "𐒰𐓪𐓘", "Osage"],
  ["Navajo", "Diné bizaad", "Latin"],
  ["Hawaiian", "ʻŌlelo Hawaiʻi", "Latin"],
  ["Maori", "Te Reo Māori", "Latin"],
  ["Samoan", "Gagana Sāmoa", "Latin"],
  ["Tongan", "Lea faka‑Tonga", "Latin"],
  ["Fijian", "Na Vosa Vakaviti", "Latin"],
  ["Guarani", "Avañe'ẽ", "Latin"],
  ["Quechua", "Runa Simi", "Latin"],
  ["Aymara", "Aymar aru", "Latin"],
  ["Nahuatl", "Nāhuatl", "Latin"],
  ["English", "English", "Latin"],
  ["Spanish", "Español", "Latin"],
  ["Portuguese", "Português", "Latin"],
  ["French", "Français", "Latin"],
  ["German", "Deutsch", "Latin"],
  ["Italian", "Italiano", "Latin"],
  ["Dutch", "Nederlands", "Latin"],
  ["Danish", "Dansk", "Latin"],
  ["Swedish", "Svenska", "Latin"],
  ["Norwegian", "Norsk", "Latin"],
  ["Icelandic", "Íslenska", "Latin"],
  ["Faroese", "Føroyskt", "Latin"],
  ["Finnish", "Suomi", "Latin"],
  ["Estonian", "Eesti", "Latin"],
  ["Latvian", "Latviešu", "Latin"],
  ["Lithuanian", "Lietuvių", "Latin"],
  ["Polish", "Polski", "Latin"],
  ["Czech", "Čeština", "Latin"],
  ["Slovak", "Slovenčina", "Latin"],
  ["Slovenian", "Slovenščina", "Latin"],
  ["Croatian", "Hrvatski", "Latin"],
  ["Bosnian", "Bosanski", "Latin"],
  ["Albanian", "Shqip", "Latin"],
  ["Romanian", "Română", "Latin"],
  ["Hungarian", "Magyar", "Latin"],
  ["Turkish", "Türkçe", "Latin"],
  ["Azerbaijani", "Azərbaycan", "Latin"],
  ["Turkmen", "Türkmençe", "Latin"],
  ["Uzbek", "Oʻzbek", "Latin"],
  ["Maltese", "Malti", "Latin"],
  ["Welsh", "Cymraeg", "Latin"],
  ["Irish", "Gaeilge", "Latin"],
  ["Scottish Gaelic", "Gàidhlig", "Latin"],
  ["Breton", "Brezhoneg", "Latin"],
  ["Basque", "Euskara", "Latin"],
  ["Catalan", "Català", "Latin"],
  ["Galician", "Galego", "Latin"],
  ["Occitan", "Occitan", "Latin"],
  ["Corsican", "Corsu", "Latin"],
  ["Luxembourgish", "Lëtzebuergesch", "Latin"],
  ["Frisian", "Frysk", "Latin"],
  ["Esperanto", "Esperanto", "Latin"],
  ["Latin", "Latina", "Latin"],
  ["Ogham", "ᚑᚌᚐᚋ", "Ogham"],
  ["Runic (Old Norse)", "ᚱᚢᚾᛁᚱ", "Runic"],
  ["Old English", "Ænglisc", "Latin"],
  ["Haitian Creole", "Kreyòl Ayisyen", "Latin"],
  ["Papiamento", "Papiamentu", "Latin"],
  ["Malagasy", "Malagasy", "Latin"],
  ["Chichewa", "Chichewa", "Latin"],
  ["Kinyarwanda", "Ikinyarwanda", "Latin"],
  ["Luganda", "Luganda", "Latin"],
  ["Tswana", "Setswana", "Latin"],
  ["Sesotho", "Sesotho", "Latin"],
  ["Bambara", "Bamanankan", "Latin"],
  ["Akan (Twi)", "Twi", "Latin"],
  ["Ewe", "Eʋegbe", "Latin"],
  ["Kongo", "Kikongo", "Latin"],
  ["Lingala", "Lingála", "Latin"],
  ["Tsonga", "Xitsonga", "Latin"],
  ["Venda", "Tshivenḓa", "Latin"],
  ["Sango", "Sängö", "Latin"],
  ["Tetum", "Tetun", "Latin"],
  ["Chamorro", "Chamoru", "Latin"],
  ["Marshallese", "Kajin M̧ajeļ", "Latin"],
  ["Palauan", "Tekoi ra Belau", "Latin"],
];

const ROLE_WORDS = ["font maker", "font creator", "font designer", "typeface maker", "font generator"];

function chip([name, native, script]) {
  const li = document.createElement("li");
  const b = document.createElement("b");
  b.textContent = native;
  const s = document.createElement("span");
  s.textContent = ` · ${name} (${script})`;
  li.append(b, s);
  li.dataset.q = `${name} ${native} ${script}`.toLowerCase();
  return li;
}

function render() {
  const list = document.getElementById("langList");
  const count = document.getElementById("langCount");
  const phrases = document.getElementById("langPhrases");
  const input = document.getElementById("langSearch");
  if (!list || !count || !phrases || !input) return;

  const frag = document.createDocumentFragment();
  LANGUAGES.forEach((l) => frag.appendChild(chip(l)));
  list.appendChild(frag);

  // Crawler- and AI-readable keyword phrases for every supported language.
  phrases.textContent = LANGUAGES.map(
    ([name], i) => `${name} ${ROLE_WORDS[i % ROLE_WORDS.length]}`,
  ).join(" · ");

  const total = LANGUAGES.length;
  const items = Array.from(list.children);

  const say = (n) =>
    (count.textContent =
      n === total
        ? `${total} languages and scripts supported`
        : `${n} of ${total} languages match`);
  say(total);

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    items.forEach((li) => {
      const hit = !q || li.dataset.q.includes(q);
      li.hidden = !hit;
      if (hit) shown++;
    });
    say(shown);
  });
}

document.addEventListener("DOMContentLoaded", render);
