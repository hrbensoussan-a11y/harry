/* ============================================================
   BACHOTE — lecture à voix haute (synthèse vocale du navigateur).
   100 % hors-ligne, aucune dépendance : on utilise SpeechSynthesis
   quand il est disponible, avec une voix adaptée à la langue.
   Si l'API ou les voix manquent, tout se désactive proprement
   (les boutons haut-parleur ne s'affichent simplement pas).
   ============================================================ */
(function () {
  "use strict";

  // Lecture paresseuse : les tests peuvent injecter un faux moteur.
  function synth() { return window.speechSynthesis || null; }
  function hasAPI() { return !!(synth() && window.SpeechSynthesisUtterance); }

  var voiceCache = [];
  function refreshVoices() {
    var s = synth();
    if (!s || !s.getVoices) return;
    try {
      var v = s.getVoices();
      if (v && v.length) voiceCache = v;
    } catch (e) { /* certains navigateurs jettent avant d'être prêts */ }
  }

  // Les voix arrivent parfois de façon asynchrone : on écoute leur chargement.
  if (hasAPI()) {
    refreshVoices();
    try {
      synth().addEventListener("voiceschanged", refreshVoices);
    } catch (e) {
      try { synth().onvoiceschanged = refreshVoices; } catch (e2) { /* rien */ }
    }
  }

  function voices() {
    if (!voiceCache.length) refreshVoices();
    return voiceCache;
  }

  /* Disponible = API présente ET au moins une voix installée. */
  function available() {
    return hasAPI() && voices().length > 0;
  }

  /* Réglage utilisateur : on parle sauf si l'option est explicitement coupée. */
  function enabled() {
    return window.Store ? window.Store.setting("speak") !== false : true;
  }

  // Étiquette BCP-47 par langue d'interface.
  var LANG_TAG = { fr: "fr-FR", en: "en-US", es: "es-ES", it: "it-IT", de: "de-DE", zh: "zh-CN", ru: "ru-RU" };

  /* Choisit une voix dont la langue partage le préfixe demandé (fr, en, …).
     Renvoie null si aucune ne correspond : le navigateur prend alors sa voix
     par défaut, ce qui reste préférable à ne rien lire. */
  function pickVoice(lang) {
    var pref = String(LANG_TAG[lang] || lang || "").toLowerCase().slice(0, 2);
    if (!pref) return null;
    var list = voices();
    for (var i = 0; i < list.length; i++) {
      if (String(list[i].lang || "").toLowerCase().slice(0, 2) === pref) return list[i];
    }
    return null;
  }

  /* Lit un texte. Un appel coupe la lecture précédente (un clic = une lecture).
     Renvoie true si la lecture a bien été lancée. */
  function say(text, lang) {
    text = String(text || "").trim();
    if (!text || !hasAPI() || !enabled()) return false;
    var s = synth();
    try {
      s.cancel();
      var u = new window.SpeechSynthesisUtterance(text.slice(0, 400));
      u.lang = LANG_TAG[lang] || lang || "fr-FR";
      var v = pickVoice(lang);
      if (v) u.voice = v;
      u.rate = 0.95;
      s.speak(u);
      return true;
    } catch (e) {
      return false;
    }
  }

  function stop() {
    if (hasAPI()) { try { synth().cancel(); } catch (e) { /* rien */ } }
  }

  window.Speak = { available: available, say: say, stop: stop };
})();
