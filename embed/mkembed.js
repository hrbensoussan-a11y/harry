/* Régénère embed/bachote.html à partir du dossier ../bachote (source de vérité).
   Concatène index.html + css/style.css + js/*.js en UN seul fichier autonome.
   Lancer :  node embed/mkembed.js   (depuis la racine du dépôt)
*/
const fs = require("fs"), path = require("path");
const SRC = path.join(__dirname, "..", "bachote");
const OUT = path.join(__dirname, "bachote.html");

let html = fs.readFileSync(path.join(SRC, "index.html"), "utf8");

// Inline la feuille de style.
const css = fs.readFileSync(path.join(SRC, "css/style.css"), "utf8");
html = html.replace('<link rel="stylesheet" href="css/style.css">', "<style>\n" + css + "\n</style>");

// Inline chaque <script src="js/X.js"> dans l'ordre du HTML.
html = html.replace(/<script src="js\/([\w-]+)\.js"><\/script>/g, function (_, name) {
  const js = fs.readFileSync(path.join(SRC, "js", name + ".js"), "utf8");
  return "<script>\n/* ===== " + name + ".js ===== */\n" + js + "\n</script>";
});

// Bannière.
html = html.replace(/<title>[\s\S]*?<\/title>/, function (m) {
  return m + "\n<!-- Bachote — build autonome (CSS + JS inlinés). Généré par embed/mkembed.js depuis bachote/. Ne pas éditer à la main. -->";
});

fs.writeFileSync(OUT, html);
const leftScripts = (html.match(/<script src=/g) || []).length;
const leftCss = (html.match(/<link rel="stylesheet" href="css/g) || []).length;
console.log("écrit " + OUT + " — " + (Buffer.byteLength(html) / 1024).toFixed(0) + " KB");
if (leftScripts || leftCss) { console.error("⚠ références externes restantes:", { leftScripts, leftCss }); process.exitCode = 1; }
else console.log("✓ aucun fichier externe requis");
