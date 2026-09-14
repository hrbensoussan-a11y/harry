/* ============================================================
   BACHOTE — couche de données
   Tout est stocké dans localStorage. Rien ne part sur un serveur.
   ============================================================ */
(function () {
  "use strict";

  var KEY = "bachote.v1";
  var DAY = 86400000;

  /* ---------- état par défaut ---------- */
  function blank() {
    return {
      v: 1,
      decks: {},
      settings: { sound: true, theme: null },
      stats: { streak: 0, lastDay: null, reviews: 0 }
    };
  }

  var state = blank();

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return;
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object" && parsed.decks) {
        state = Object.assign(blank(), parsed);
        state.settings = Object.assign(blank().settings, parsed.settings || {});
        state.stats = Object.assign(blank().stats, parsed.stats || {});
      }
    } catch (e) {
      // Sauvegarde illisible : on repart proprement plutôt que de planter.
      console.warn("Bachote : sauvegarde illisible, réinitialisation.", e);
      state = blank();
    }
  }

  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.warn("Bachote : impossible d'enregistrer.", e);
      return false;
    }
  }

  /* ---------- identifiants ---------- */
  var idSeed = 0;
  function uid(prefix) {
    idSeed += 1;
    return (prefix || "x") + Date.now().toString(36) + idSeed.toString(36) +
           Math.floor(Math.random() * 1296).toString(36);
  }

  /* ---------- cartes ---------- */
  function newCard(term, def) {
    return {
      id: uid("c"),
      t: String(term || "").trim(),
      d: String(def || "").trim(),
      ef: 2.5,      // facteur de facilité (SM-2)
      iv: 0,        // intervalle courant, en jours
      reps: 0,      // répétitions réussies d'affilée
      due: 0,       // date de prochaine révision (timestamp, 0 = jamais vue)
      lapses: 0     // nombre d'oublis
    };
  }

  /* Un vieux paquet peut manquer des champs SM-2 : on complète. */
  function healCard(c) {
    if (typeof c.ef !== "number" || !isFinite(c.ef)) c.ef = 2.5;
    if (typeof c.iv !== "number" || !isFinite(c.iv)) c.iv = 0;
    if (typeof c.reps !== "number" || !isFinite(c.reps)) c.reps = 0;
    if (typeof c.due !== "number" || !isFinite(c.due)) c.due = 0;
    if (typeof c.lapses !== "number" || !isFinite(c.lapses)) c.lapses = 0;
    if (!c.id) c.id = uid("c");
    return c;
  }

  /* ---------- paquets ---------- */
  function createDeck(name, subject, pairs) {
    var d = {
      id: uid("d"),
      name: String(name || "Sans titre").trim().slice(0, 70) || "Sans titre",
      subject: subject || "autre",
      created: Date.now(),
      updated: Date.now(),
      cards: (pairs || []).map(function (p) { return newCard(p[0], p[1]); })
    };
    state.decks[d.id] = d;
    save();
    return d;
  }

  function getDeck(id) {
    var d = state.decks[id];
    if (d && d.cards) d.cards.forEach(healCard);
    return d || null;
  }

  function allDecks() {
    return Object.keys(state.decks)
      .map(function (k) { return getDeck(k); })
      .sort(function (a, b) { return (b.updated || 0) - (a.updated || 0); });
  }

  function updateDeck(id, patch) {
    var d = state.decks[id];
    if (!d) return null;
    Object.assign(d, patch, { updated: Date.now() });
    save();
    return d;
  }

  function deleteDeck(id) {
    delete state.decks[id];
    save();
  }

  /* ============================================================
     SM-2 — l'algorithme de répétition espacée de SuperMemo.
     q = qualité de la réponse, de 0 à 5. On expose 1/3/4/5.
     ============================================================ */
  /* Prochain intervalle, en jours. Une seule source de vérité : les
     boutons annoncent exactement ce que grade() appliquera. */
  function nextInterval(card, q) {
    if (q < 3) return 0;
    var iv;
    if (card.reps === 0) {
      iv = (q === 3 ? 1 : (q === 4 ? 2 : 4));
    } else if (card.reps === 1) {
      iv = (q === 3 ? 4 : (q === 4 ? 6 : 10));
    } else {
      if (q === 3)      iv = card.iv * 1.25;          // difficile : on ralentit
      else if (q === 4) iv = card.iv * card.ef;        // SM-2 standard
      else              iv = card.iv * card.ef * 1.3;  // facile : on accélère
    }
    iv = Math.round(iv);
    return iv < 1 ? 1 : iv;
  }

  function grade(card, q) {
    healCard(card);

    if (q < 3) {
      // Échec : on repart de zéro, la carte revient dans la même session.
      card.reps = 0;
      card.iv = 0;
      card.lapses += 1;
      card.due = Date.now() + 60000;
    } else {
      card.iv = nextInterval(card, q);
      card.reps += 1;
      card.due = Date.now() + card.iv * DAY;
    }

    // Ajustement du facteur de facilité (formule SM-2 d'origine).
    card.ef = card.ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (card.ef < 1.3) card.ef = 1.3;

    state.stats.reviews += 1;
    touchStreak();
    return card;
  }

  function fmtDays(iv) {
    if (iv === 1) return "1 jour";
    if (iv < 30) return iv + " jours";
    if (iv < 365) {
      var m = Math.round(iv / 30);
      return m + (m > 1 ? " mois" : " mois");
    }
    var y = Math.round(iv / 36.5) / 10;
    return y + (y > 1 ? " ans" : " an");
  }

  /* Prévisualise sans rien modifier (pour l'étiquette des boutons). */
  function previewInterval(card, q) {
    healCard(card);
    if (q < 3) return "< 1 min";
    return fmtDays(nextInterval(card, q));
  }

  function dueCards(deck, now) {
    now = now || Date.now();
    return deck.cards.filter(function (c) { return healCard(c).due <= now; });
  }

  function dueCount(deck) { return dueCards(deck).length; }

  function allDueCount() {
    return allDecks().reduce(function (n, d) { return n + dueCount(d); }, 0);
  }

  /* Toutes les cartes à réviser, tous paquets confondus. */
  function globalQueue() {
    var out = [];
    allDecks().forEach(function (d) {
      dueCards(d).forEach(function (c) { out.push({ card: c, deckId: d.id, deckName: d.name }); });
    });
    out.sort(function (a, b) { return a.card.due - b.card.due; });
    return out;
  }

  /* Niveau de maîtrise d'une carte, pour l'affichage. */
  function level(card) {
    healCard(card);
    if (card.reps === 0) return "new";
    if (card.reps < 3 || card.iv < 7) return "learn";
    return "ok";
  }

  function deckProgress(deck) {
    var n = deck.cards.length;
    if (!n) return { pct: 0, ok: 0, learn: 0, fresh: 0, total: 0 };
    var ok = 0, learn = 0, fresh = 0;
    deck.cards.forEach(function (c) {
      var l = level(c);
      if (l === "ok") ok++; else if (l === "learn") learn++; else fresh++;
    });
    return { pct: Math.round(((ok + learn * 0.4) / n) * 100), ok: ok, learn: learn, fresh: fresh, total: n };
  }

  /* ---------- série de jours ---------- */
  function dayStamp(t) {
    var d = new Date(t || Date.now());
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  function touchStreak() {
    var today = dayStamp();
    if (state.stats.lastDay === today) return;
    var yesterday = dayStamp(Date.now() - DAY);
    state.stats.streak = (state.stats.lastDay === yesterday) ? (state.stats.streak + 1) : 1;
    state.stats.lastDay = today;
  }

  /* ---------- réglages ---------- */
  function setting(k, v) {
    if (arguments.length === 1) return state.settings[k];
    state.settings[k] = v;
    save();
    return v;
  }

  /* ============================================================
     Partage par lien — format compact : ["nom","matière",[[t,d],…]]
     encodé en base64 sûr pour les URL.
     ============================================================ */
  function b64enc(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }

  function b64dec(s) {
    s = s.replace(/-/g, "+").replace(/_/g, "/");
    while (s.length % 4) s += "=";
    var bin = atob(s);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function encodeDeck(deck) {
    var payload = [deck.name, deck.subject, deck.cards.map(function (c) { return [c.t, c.d]; })];
    return b64enc(JSON.stringify(payload));
  }

  function decodeDeck(code) {
    try {
      var p = JSON.parse(b64dec(code));
      if (!Array.isArray(p) || !Array.isArray(p[2])) return null;
      var pairs = p[2]
        .filter(function (x) { return Array.isArray(x) && String(x[0] || "").trim(); })
        .map(function (x) { return [String(x[0]).slice(0, 300), String(x[1] || "").slice(0, 900)]; });
      if (!pairs.length) return null;
      return { name: String(p[0] || "Paquet partagé").slice(0, 70), subject: String(p[1] || "autre"), pairs: pairs };
    } catch (e) {
      return null;
    }
  }

  /* ============================================================
     Import par collage — c'est la fonction clé du produit.
     ============================================================ */
  /* Ordre = priorité. Les variantes espacées passent avant les nues,
     pour que « mitose : division » coupe au bon endroit. */
  var SEPS = ["\t", " : ", " — ", " – ", " - ", " = ", " => ", " : ", ":", "="];

  /* Marqueur de liste en début de ligne : « - », « • », « 3. », « 2) »…
     Volontairement restrictif : « 1789 : … » ne doit PAS perdre son terme. */
  var BULLET = /^(?:[-–—•*▪]|\d{1,2}[.)])\s+/;

  function stripBullet(s) {
    var out = s.replace(BULLET, "").trim();
    return out || s.trim();   // on ne rend jamais une chaîne vide
  }

  /* Trouve où couper UNE ligne. Chaque ligne est traitée indépendamment :
     un même collage mélange souvent « : », « — » et « = ». */
  function splitLine(line, forced) {
    if (forced) {
      var fi = line.indexOf(forced);
      return (fi > 0 && fi < line.length - forced.length) ? { i: fi, sep: forced } : null;
    }
    // Une tabulation est sans ambiguïté (tableur, Word) : elle gagne toujours.
    var ti = line.indexOf("\t");
    if (ti > 0 && ti < line.length - 1) return { i: ti, sep: "\t" };

    var best = null;
    for (var k = 0; k < SEPS.length; k++) {
      var sep = SEPS[k];
      if (sep === "\t") continue;
      var idx = line.indexOf(sep);
      // On coupe au plus tôt : le terme est avant, la définition après.
      if (idx > 0 && idx < line.length - sep.length && (!best || idx < best.i)) {
        best = { i: idx, sep: sep };
      }
    }
    return best;
  }

  function sepLabel(sep) {
    if (sep === "\t") return "tabulation";
    var t = sep.trim();
    return t ? "« " + t + " »" : "espace";
  }

  function parsePaste(text, forced) {
    if (forced === "tab") forced = "\t";

    var lines = String(text || "")
      .split(/\r?\n/)
      .map(function (l) { return l.replace(/\s+$/, "").trim(); })
      .filter(function (l) { return l.length > 0; });

    if (!lines.length) return { pairs: [], seps: [], skipped: 0 };

    var pairs = [], skipped = 0, used = {};

    lines.forEach(function (line) {
      var cut = splitLine(line, forced);
      if (!cut) { skipped++; return; }
      var term = stripBullet(line.slice(0, cut.i));
      var def = line.slice(cut.i + cut.sep.length).trim();
      if (!term || !def) { skipped++; return; }
      used[cut.sep] = true;
      pairs.push([term.slice(0, 300), def.slice(0, 900)]);
    });

    return { pairs: pairs, seps: Object.keys(used), skipped: skipped };
  }

  /* ---------- export ---------- */
  function exportDeck(deck) {
    return JSON.stringify({
      bachote: 1, name: deck.name, subject: deck.subject,
      cards: deck.cards.map(function (c) { return { t: c.t, d: c.d }; })
    }, null, 2);
  }

  load();

  window.Store = {
    state: function () { return state; },
    save: save,
    uid: uid,
    newCard: newCard,
    createDeck: createDeck,
    getDeck: getDeck,
    allDecks: allDecks,
    updateDeck: updateDeck,
    deleteDeck: deleteDeck,
    grade: grade,
    previewInterval: previewInterval,
    dueCards: dueCards,
    dueCount: dueCount,
    allDueCount: allDueCount,
    globalQueue: globalQueue,
    level: level,
    deckProgress: deckProgress,
    setting: setting,
    encodeDeck: encodeDeck,
    decodeDeck: decodeDeck,
    parsePaste: parsePaste,
    sepLabel: sepLabel,
    exportDeck: exportDeck
  };
})();
