/* Métadonnées des continents et sous-régions : noms français, thèmes visuels, emojis.
   Les clés correspondent aux valeurs "region" / "subregion" de data/geo-data.js. */
window.REGIONS = {
  // Ordre d'affichage des continents sur l'accueil
  order: ["Europe", "Africa", "Asia", "Americas", "Oceania"],

  continents: {
    Europe: {
      name: "Europe",
      emoji: "🏰",
      tagline: "Châteaux, capitales et petits pays serrés.",
      theme: { c1: "#6a8bff", c2: "#a06bff", accent: "#7c6bff", deep: "#241a5c", glow: "rgba(124,107,255,.55)" },
      subOrder: ["Western Europe", "Northern Europe", "Southern Europe", "Central Europe", "Southeast Europe", "Eastern Europe"],
    },
    Africa: {
      name: "Afrique",
      emoji: "🦁",
      tagline: "Le berceau du monde, du désert à la savane.",
      theme: { c1: "#ff9d3c", c2: "#ff5b62", accent: "#ff7a3c", deep: "#5c2410", glow: "rgba(255,122,60,.55)" },
      subOrder: ["Northern Africa", "Western Africa", "Middle Africa", "Eastern Africa", "Southern Africa"],
    },
    Asia: {
      name: "Asie",
      emoji: "🐉",
      tagline: "Le plus grand continent, plein de contrastes.",
      theme: { c1: "#ff5f8f", c2: "#ffb13d", accent: "#ff4d79", deep: "#5c1030", glow: "rgba(255,77,121,.55)" },
      subOrder: ["Western Asia", "Central Asia", "Southern Asia", "Eastern Asia", "South-Eastern Asia"],
    },
    Americas: {
      name: "Amériques",
      emoji: "🌎",
      tagline: "Du Grand Nord glacé à la pointe de la Patagonie.",
      theme: { c1: "#1fd39c", c2: "#22a7ff", accent: "#12c58f", deep: "#093f45", glow: "rgba(18,197,143,.55)" },
      subOrder: ["North America", "Central America", "Caribbean", "South America"],
    },
    Oceania: {
      name: "Océanie",
      emoji: "🌊",
      tagline: "Un océan d'îles au bout du monde.",
      theme: { c1: "#2bd4c4", c2: "#9b6bff", accent: "#22c9c9", deep: "#0f4a5c", glow: "rgba(43,212,196,.55)" },
      subOrder: ["Australia and New Zealand", "Melanesia", "Micronesia", "Polynesia"],
    },
  },

  subregions: {
    // Europe
    "Western Europe": { name: "Europe de l'Ouest", emoji: "🗼", region: "Europe" },
    "Northern Europe": { name: "Europe du Nord", emoji: "❄️", region: "Europe" },
    "Southern Europe": { name: "Europe du Sud", emoji: "☀️", region: "Europe" },
    "Central Europe": { name: "Europe centrale", emoji: "🏔️", region: "Europe" },
    "Southeast Europe": { name: "Europe du Sud-Est", emoji: "⛵", region: "Europe" },
    "Eastern Europe": { name: "Europe de l'Est", emoji: "🐻", region: "Europe" },
    // Afrique
    "Northern Africa": { name: "Afrique du Nord", emoji: "🏜️", region: "Africa" },
    "Western Africa": { name: "Afrique de l'Ouest", emoji: "🥁", region: "Africa" },
    "Middle Africa": { name: "Afrique centrale", emoji: "🌳", region: "Africa" },
    "Eastern Africa": { name: "Afrique de l'Est", emoji: "🦒", region: "Africa" },
    "Southern Africa": { name: "Afrique australe", emoji: "🦓", region: "Africa" },
    // Asie
    "Western Asia": { name: "Moyen-Orient", emoji: "🕌", region: "Asia" },
    "Central Asia": { name: "Asie centrale", emoji: "🐫", region: "Asia" },
    "Southern Asia": { name: "Asie du Sud", emoji: "🐯", region: "Asia" },
    "Eastern Asia": { name: "Asie de l'Est", emoji: "🏯", region: "Asia" },
    "South-Eastern Asia": { name: "Asie du Sud-Est", emoji: "🌴", region: "Asia" },
    // Amériques
    "North America": { name: "Amérique du Nord", emoji: "🍁", region: "Americas" },
    "Central America": { name: "Amérique centrale", emoji: "🌋", region: "Americas" },
    "Caribbean": { name: "Caraïbes", emoji: "🏝️", region: "Americas" },
    "South America": { name: "Amérique du Sud", emoji: "💃", region: "Americas" },
    // Océanie
    "Australia and New Zealand": { name: "Australie & Nouvelle-Zélande", emoji: "🦘", region: "Oceania" },
    "Melanesia": { name: "Mélanésie", emoji: "🐠", region: "Oceania" },
    "Micronesia": { name: "Micronésie", emoji: "🐚", region: "Oceania" },
    "Polynesia": { name: "Polynésie", emoji: "🌺", region: "Oceania" },
  },
};
