/* ============================================================
   BACHOTE — reconnaissance de texte à partir d'une photo
   Cascade de moteurs, du meilleur au plus universel :
     1) IA de vision (fonction Netlify)  → idéal pour le manuscrit
     2) Tesseract.js (navigateur)        → bon pour l'imprimé/net
     3) Manuel                            → la photo reste affichée
   Tout est optionnel : si rien ne lit l'image, on renvoie "" et
   l'utilisateur recopie en regardant sa photo.
   ============================================================ */
(function () {
  "use strict";

  // Point d'entrée de la fonction serverless (activée sur le site déployé).
  var AI_ENDPOINT = "/.netlify/functions/scan";
  var aiState = "unknown"; // unknown | ok | absent

  // Permet aux tests d'injecter un faux moteur : window.__scanEngine(file) → Promise<string>
  function injected() {
    return (typeof window.__scanEngine === "function") ? window.__scanEngine : null;
  }

  function fileToDataURL(file) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(r.result); };
      r.onerror = function () { reject(r.error || new Error("read")); };
      r.readAsDataURL(file);
    });
  }

  /* ---------- Moteur 1 : IA de vision (Netlify) ---------- */
  function tryAI(file, onProgress) {
    if (aiState === "absent") return Promise.resolve(null);
    onProgress && onProgress("ai");
    return fileToDataURL(file).then(function (dataUrl) {
      return fetch(AI_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl })
      }).then(function (res) {
        if (res.status === 404 || res.status === 501) { aiState = "absent"; return null; }
        if (!res.ok) return null;
        return res.json().then(function (j) {
          aiState = "ok";
          return (j && typeof j.text === "string") ? { text: j.text, engine: "ai" } : null;
        });
      });
    }).catch(function () {
      // Pas de réseau / pas de fonction (aperçu, hors-ligne) : on abandonne ce moteur.
      aiState = "absent";
      return null;
    });
  }

  /* ---------- Moteur 2 : Tesseract.js (navigateur) ---------- */
  var tesLoading = null;
  function loadTesseract() {
    if (window.Tesseract) return Promise.resolve(window.Tesseract);
    if (tesLoading) return tesLoading;
    tesLoading = new Promise(function (resolve, reject) {
      var sc = document.createElement("script");
      sc.src = "https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.1.1/tesseract.min.js";
      sc.async = true;
      sc.onload = function () { resolve(window.Tesseract || null); };
      sc.onerror = function () { reject(new Error("tesseract-load")); };
      document.head.appendChild(sc);
    }).catch(function () { return null; });
    return tesLoading;
  }

  function tryTesseract(file, onProgress, lang) {
    return loadTesseract().then(function (T) {
      if (!T || !T.recognize) return null;
      onProgress && onProgress("ocr");
      // Langues Tesseract selon la langue de l'interface (fra/eng/spa/ita/deu/chi_sim/rus).
      var map = { fr: "fra+eng", en: "eng", es: "spa+eng", it: "ita+eng", de: "deu+eng", zh: "chi_sim+eng", ru: "rus+eng" };
      var langs = map[lang] || "eng";
      return T.recognize(file, langs, {
        logger: function (m) {
          if (m && m.status === "recognizing text" && onProgress) onProgress("ocr", m.progress || 0);
        }
      }).then(function (out) {
        var text = out && out.data && out.data.text ? out.data.text : "";
        return { text: cleanup(text), engine: "ocr" };
      }).catch(function () { return null; });
    });
  }

  /* Nettoyage léger du texte OCR : espaces multiples, lignes vides superflues. */
  function cleanup(text) {
    return String(text || "")
      .replace(/\r/g, "")
      .split("\n")
      .map(function (l) { return l.replace(/[ \t]+/g, " ").trim(); })
      .filter(function (l, i, a) { return l.length || (i > 0 && a[i - 1].length); })
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  /* ---------- Orchestrateur ---------- */
  /* recognize(file, {lang, onProgress}) → Promise<{text, engine}>
     engine ∈ "ai" | "ocr" | "manual"  (manual = rien lu, texte vide) */
  function recognize(file, opts) {
    opts = opts || {};
    var onProgress = opts.onProgress || function () {};
    var lang = opts.lang || "fr";

    var inj = injected();
    if (inj) {
      return Promise.resolve(inj(file)).then(function (t) {
        return { text: cleanup(t || ""), engine: (t ? "ocr" : "manual") };
      });
    }

    if (!file || !/^image\//.test(file.type || "")) {
      return Promise.reject(new Error("not-image"));
    }

    return tryAI(file, onProgress).then(function (ai) {
      if (ai && ai.text && ai.text.trim()) return { text: cleanup(ai.text), engine: "ai" };
      return tryTesseract(file, onProgress, lang).then(function (ocr) {
        if (ocr && ocr.text && ocr.text.trim()) return ocr;
        return { text: "", engine: "manual" };
      });
    }).catch(function () {
      return { text: "", engine: "manual" };
    });
  }

  window.Scan = { recognize: recognize, fileToDataURL: fileToDataURL };
})();
