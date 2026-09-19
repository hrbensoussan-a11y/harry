/* ============================================================
   <bachote-study> — intègre le système d'étude Bachote dans
   N'IMPORTE QUEL projet (HTML, React, Vue, Svelte, Angular…).

   Fonctionne par isolation totale : le composant charge
   « bachote.html » (build autonome) dans un iframe, donc les
   styles, le routage (#/…) et le stockage de Bachote ne
   touchent jamais à ceux de ton application hôte.

   Utilisation :
     <script src="bachote-study.js"></script>
     <bachote-study src="bachote.html" height="720"></bachote-study>

   Attributs :
     src     chemin vers bachote.html         (défaut "bachote.html")
             — tu peux viser un écran précis, ex. src="bachote.html#/timer"
     height  hauteur CSS                        (défaut "720px" ; "720" → "720px")
   ============================================================ */
(function () {
  "use strict";
  if (window.customElements && customElements.get("bachote-study")) return;

  function px(v) { return /^\d+$/.test(v || "") ? v + "px" : (v || "720px"); }

  var BachoteStudy = function () {}; // remplacé ci-dessous par la vraie classe

  try {
    BachoteStudy = class extends HTMLElement {
      connectedCallback() {
        if (this._mounted) return;
        this._mounted = true;
        var src = this.getAttribute("src") || "bachote.html";
        var frame = document.createElement("iframe");
        frame.src = src;
        frame.setAttribute("title", "Bachote");
        frame.setAttribute("loading", "lazy");
        frame.allow = "clipboard-write";
        frame.style.cssText =
          "width:100%;height:" + px(this.getAttribute("height")) +
          ";border:0;border-radius:14px;display:block;background:transparent;";
        // Shadow DOM = double isolation (le style de l'hôte n'atteint pas l'iframe).
        var root = this.attachShadow ? this.attachShadow({ mode: "open" }) : this;
        root.appendChild(frame);
        this._frame = frame;
      }
      static get observedAttributes() { return ["height", "src"]; }
      attributeChangedCallback(name, _old, val) {
        if (!this._frame) return;
        if (name === "height") this._frame.style.height = px(val);
        if (name === "src" && val) this._frame.src = val;
      }
    };
    customElements.define("bachote-study", BachoteStudy);
  } catch (e) {
    // Très vieux navigateur sans customElements : rien, l'hôte peut utiliser un <iframe> à la main.
    if (window.console) console.warn("bachote-study : Custom Elements non supporté, utilise un <iframe src=\"bachote.html\">.", e);
  }
})();
