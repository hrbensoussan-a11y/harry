/* Continents et sous-régions — noms/taglines dans 5 langues (fr, en, es, it, ru).
   Les clés correspondent aux valeurs "region" / "subregion" de data/geo-data.js. */
window.REGIONS = {
  order: ["Europe", "Africa", "Asia", "Americas", "Oceania"],

  continents: {
    Europe: {
      names: { fr: "Europe", en: "Europe", es: "Europa", it: "Europa", ru: "Европа" },
      emoji: "🏰",
      taglines: {
        fr: "Châteaux, capitales et petits pays serrés.",
        en: "Castles, capitals and tightly-packed countries.",
        es: "Castillos, capitales y países muy juntos.",
        it: "Castelli, capitali e paesi tutti vicini.",
        ru: "Замки, столицы и множество небольших стран.",
      },
      theme: { c1: "#3B6FE0", c2: "#3B6FE0", accent: "#3B6FE0", deep: "#14304A", glow: "rgba(59,111,224,.30)" },
      subOrder: ["Western Europe", "Northern Europe", "Southern Europe", "Central Europe", "Southeast Europe", "Eastern Europe"],
    },
    Africa: {
      names: { fr: "Afrique", en: "Africa", es: "África", it: "Africa", ru: "Африка" },
      emoji: "🦁",
      taglines: {
        fr: "Le berceau du monde, du désert à la savane.",
        en: "The cradle of humankind, from desert to savanna.",
        es: "La cuna de la humanidad, del desierto a la sabana.",
        it: "La culla dell'umanità, dal deserto alla savana.",
        ru: "Колыбель человечества: от пустынь до саванн.",
      },
      theme: { c1: "#F0870F", c2: "#F0870F", accent: "#F0870F", deep: "#14304A", glow: "rgba(240,135,15,.30)" },
      subOrder: ["Northern Africa", "Western Africa", "Middle Africa", "Eastern Africa", "Southern Africa"],
    },
    Asia: {
      names: { fr: "Asie", en: "Asia", es: "Asia", it: "Asia", ru: "Азия" },
      emoji: "🐉",
      taglines: {
        fr: "Le plus grand continent, plein de contrastes.",
        en: "The largest continent, full of contrasts.",
        es: "El continente más grande, lleno de contrastes.",
        it: "Il continente più grande, pieno di contrasti.",
        ru: "Самый большой континент, полный контрастов.",
      },
      theme: { c1: "#E23D3D", c2: "#E23D3D", accent: "#E23D3D", deep: "#14304A", glow: "rgba(226,61,61,.30)" },
      subOrder: ["Western Asia", "Central Asia", "Southern Asia", "Eastern Asia", "South-Eastern Asia"],
    },
    Americas: {
      names: { fr: "Amériques", en: "Americas", es: "América", it: "Americhe", ru: "Америка" },
      emoji: "🌎",
      taglines: {
        fr: "Du Grand Nord glacé à la pointe de la Patagonie.",
        en: "From the frozen North to the tip of Patagonia.",
        es: "Del gélido Gran Norte a la punta de la Patagonia.",
        it: "Dal Grande Nord ghiacciato alla punta della Patagonia.",
        ru: "От ледяного Севера до края Патагонии.",
      },
      theme: { c1: "#1FA35F", c2: "#1FA35F", accent: "#1FA35F", deep: "#14304A", glow: "rgba(31,163,95,.30)" },
      subOrder: ["North America", "Central America", "Caribbean", "South America"],
    },
    Oceania: {
      names: { fr: "Océanie", en: "Oceania", es: "Oceanía", it: "Oceania", ru: "Океания" },
      emoji: "🌊",
      taglines: {
        fr: "Un océan d'îles au bout du monde.",
        en: "An ocean of islands at the end of the world.",
        es: "Un océano de islas en el fin del mundo.",
        it: "Un oceano di isole in capo al mondo.",
        ru: "Океан островов на краю света.",
      },
      theme: { c1: "#0FA0B0", c2: "#0FA0B0", accent: "#0FA0B0", deep: "#14304A", glow: "rgba(15,160,176,.30)" },
      subOrder: ["Australia and New Zealand", "Melanesia", "Micronesia", "Polynesia"],
    },
  },

  subregions: {
    // Europe
    "Western Europe": { emoji: "🗼", region: "Europe", names: { fr: "Europe de l'Ouest", en: "Western Europe", es: "Europa Occidental", it: "Europa occidentale", ru: "Западная Европа" } },
    "Northern Europe": { emoji: "❄️", region: "Europe", names: { fr: "Europe du Nord", en: "Northern Europe", es: "Europa del Norte", it: "Europa settentrionale", ru: "Северная Европа" } },
    "Southern Europe": { emoji: "☀️", region: "Europe", names: { fr: "Europe du Sud", en: "Southern Europe", es: "Europa del Sur", it: "Europa meridionale", ru: "Южная Европа" } },
    "Central Europe": { emoji: "🏔️", region: "Europe", names: { fr: "Europe centrale", en: "Central Europe", es: "Europa Central", it: "Europa centrale", ru: "Центральная Европа" } },
    "Southeast Europe": { emoji: "⛵", region: "Europe", names: { fr: "Europe du Sud-Est", en: "Southeast Europe", es: "Europa Sudoriental", it: "Europa sud-orientale", ru: "Юго-Восточная Европа" } },
    "Eastern Europe": { emoji: "🐻", region: "Europe", names: { fr: "Europe de l'Est", en: "Eastern Europe", es: "Europa Oriental", it: "Europa orientale", ru: "Восточная Европа" } },
    // Afrique
    "Northern Africa": { emoji: "🏜️", region: "Africa", names: { fr: "Afrique du Nord", en: "Northern Africa", es: "África del Norte", it: "Africa settentrionale", ru: "Северная Африка" } },
    "Western Africa": { emoji: "🥁", region: "Africa", names: { fr: "Afrique de l'Ouest", en: "Western Africa", es: "África Occidental", it: "Africa occidentale", ru: "Западная Африка" } },
    "Middle Africa": { emoji: "🌳", region: "Africa", names: { fr: "Afrique centrale", en: "Central Africa", es: "África Central", it: "Africa centrale", ru: "Центральная Африка" } },
    "Eastern Africa": { emoji: "🦒", region: "Africa", names: { fr: "Afrique de l'Est", en: "Eastern Africa", es: "África Oriental", it: "Africa orientale", ru: "Восточная Африка" } },
    "Southern Africa": { emoji: "🦓", region: "Africa", names: { fr: "Afrique australe", en: "Southern Africa", es: "África Austral", it: "Africa australe", ru: "Южная Африка" } },
    // Asie
    "Western Asia": { emoji: "🕌", region: "Asia", names: { fr: "Moyen-Orient", en: "Western Asia", es: "Asia Occidental", it: "Asia occidentale", ru: "Западная Азия" } },
    "Central Asia": { emoji: "🐫", region: "Asia", names: { fr: "Asie centrale", en: "Central Asia", es: "Asia Central", it: "Asia centrale", ru: "Центральная Азия" } },
    "Southern Asia": { emoji: "🐯", region: "Asia", names: { fr: "Asie du Sud", en: "Southern Asia", es: "Asia del Sur", it: "Asia meridionale", ru: "Южная Азия" } },
    "Eastern Asia": { emoji: "🏯", region: "Asia", names: { fr: "Asie de l'Est", en: "Eastern Asia", es: "Asia Oriental", it: "Asia orientale", ru: "Восточная Азия" } },
    "South-Eastern Asia": { emoji: "🌴", region: "Asia", names: { fr: "Asie du Sud-Est", en: "Southeast Asia", es: "Sudeste Asiático", it: "Sud-est asiatico", ru: "Юго-Восточная Азия" } },
    // Amériques
    "North America": { emoji: "🍁", region: "Americas", names: { fr: "Amérique du Nord", en: "North America", es: "América del Norte", it: "America settentrionale", ru: "Северная Америка" } },
    "Central America": { emoji: "🌋", region: "Americas", names: { fr: "Amérique centrale", en: "Central America", es: "América Central", it: "America centrale", ru: "Центральная Америка" } },
    "Caribbean": { emoji: "🏝️", region: "Americas", names: { fr: "Caraïbes", en: "Caribbean", es: "Caribe", it: "Caraibi", ru: "Карибы" } },
    "South America": { emoji: "💃", region: "Americas", names: { fr: "Amérique du Sud", en: "South America", es: "América del Sur", it: "America meridionale", ru: "Южная Америка" } },
    // Océanie
    "Australia and New Zealand": { emoji: "🦘", region: "Oceania", names: { fr: "Australie & Nouvelle-Zélande", en: "Australia & New Zealand", es: "Australia y Nueva Zelanda", it: "Australia e Nuova Zelanda", ru: "Австралия и Новая Зеландия" } },
    "Melanesia": { emoji: "🐠", region: "Oceania", names: { fr: "Mélanésie", en: "Melanesia", es: "Melanesia", it: "Melanesia", ru: "Меланезия" } },
    "Micronesia": { emoji: "🐚", region: "Oceania", names: { fr: "Micronésie", en: "Micronesia", es: "Micronesia", it: "Micronesia", ru: "Микронезия" } },
    "Polynesia": { emoji: "🌺", region: "Oceania", names: { fr: "Polynésie", en: "Polynesia", es: "Polinesia", it: "Polinesia", ru: "Полинезия" } },
  },
};
