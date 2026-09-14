/* ============================================================
   GéoQuest — logique du jeu
   ============================================================ */
(function () {
  "use strict";

  if (!window.GEO || !window.REGIONS) {
    document.body.innerHTML = "<p style='padding:40px;font-family:sans-serif'>Erreur : données non chargées.</p>";
    return;
  }

  const GEO = window.GEO;
  const REG = window.REGIONS;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const shuffle = (a) => { const r = a.slice(); for (let i = r.length - 1; i > 0; i--) { const j = (Math.random() * (i + 1)) | 0; [r[i], r[j]] = [r[j], r[i]]; } return r; };

  /* ---------- Index géographique ---------- */
  const featById = {};                 // cca3 -> feature (jouables seulement, id renseigné)
  for (const f of GEO.world.features) { if (f.id) featById[f.id] = f; }
  const bySub = {};                    // subregion(EN) -> [cca3]
  for (const [id, c] of Object.entries(GEO.countries)) { (bySub[c.subregion] || (bySub[c.subregion] = [])).push(id); }
  const TOTAL_COUNTRIES = Object.keys(GEO.countries).length;
  const TOTAL_SUBS = Object.keys(REG.subregions).length;
  const TOTAL_STARS = TOTAL_SUBS * 3;

  /* ---------- Point dans polygone ---------- */
  function pointInRing(x, y, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = ring[i][0], yi = ring[i][1], xj = ring[j][0], yj = ring[j][1];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }
  function pointInPoly(x, y, poly) {
    if (!pointInRing(x, y, poly[0])) return false;
    for (let i = 1; i < poly.length; i++) if (pointInRing(x, y, poly[i])) return false;
    return true;
  }
  function pointInFeature(x, y, geom) {
    if (geom.type === "Polygon") return pointInPoly(x, y, geom.coordinates);
    if (geom.type === "MultiPolygon") { for (const p of geom.coordinates) if (pointInPoly(x, y, p)) return true; }
    return false;
  }

  /* ---------- Sauvegarde ---------- */
  const SAVE_KEY = "geoquest.v1";
  const defaultSave = () => ({ totalXP: 0, best: {}, mastered: [], longestStreak: 0, regionsDone: [], badges: [], sound: true, timer: true });
  let save = defaultSave();
  try { const raw = localStorage.getItem(SAVE_KEY); if (raw) save = Object.assign(defaultSave(), JSON.parse(raw)); } catch (e) {}
  const masteredSet = new Set(save.mastered);
  function persist() {
    save.mastered = Array.from(masteredSet);
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) {}
  }

  /* ---------- Niveaux / XP ---------- */
  function levelFromXP(xp) {
    let lvl = 1, need = 100, floor = 0;
    while (xp >= floor + need) { floor += need; lvl++; need = Math.round(need * 1.18); }
    return { level: lvl, into: xp - floor, need };
  }
  function levelTitle(l) {
    if (l >= 18) return "Légende vivante";
    if (l >= 13) return "Maître du monde";
    if (l >= 10) return "Globe-trotter";
    if (l >= 7) return "Cartographe";
    if (l >= 5) return "Navigateur·rice";
    if (l >= 3) return "Aventurier·ère";
    return "Explorateur·rice";
  }

  /* ---------- Son (Web Audio) ---------- */
  const Sound = (() => {
    let ctx = null, on = save.sound !== false;
    const ensure = () => { if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (ctx && ctx.state === "suspended") ctx.resume(); };
    function tone(freq, start, dur, type, vol) {
      if (!ctx) return;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || "sine"; o.frequency.value = freq;
      const t = ctx.currentTime + start;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol || 0.18, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(ctx.destination);
      o.start(t); o.stop(t + dur + 0.03);
    }
    const seq = (notes) => { ensure(); if (!on || !ctx) return; notes.forEach(n => tone(n[0], n[1], n[2], n[3], n[4])); };
    return {
      isOn: () => on,
      toggle() { on = !on; save.sound = on; persist(); if (on) { ensure(); this.click(); } return on; },
      unlock: ensure,
      correct() { seq([[660, 0, .12, "triangle", .2], [880, .09, .16, "triangle", .2]]); },
      wrong() { seq([[220, 0, .18, "sawtooth", .16], [160, .1, .22, "sawtooth", .14]]); },
      reveal() { seq([[420, 0, .14, "sine", .16], [520, .1, .16, "sine", .14]]); },
      star() { seq([[720, 0, .1, "triangle", .2], [900, .09, .1, "triangle", .2], [1180, .18, .22, "triangle", .2]]); },
      level() { seq([[523, 0, .12, "triangle", .2], [659, .12, .12, "triangle", .2], [784, .24, .12, "triangle", .2], [1046, .36, .3, "triangle", .22]]); },
      click() { seq([[520, 0, .05, "square", .08]]); },
    };
  })();

  /* ---------- Chrono (optionnel) ---------- */
  const timerOn = () => save.timer !== false;
  function applyTimerClass() { document.body.classList.toggle("timer-off", !timerOn()); }

  /* ---------- Effets : confettis ---------- */
  const FX = (() => {
    const cv = $("#fx"), cx = cv.getContext("2d");
    let parts = [], raf = null, dpr = 1;
    function resize() { dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    resize(); addEventListener("resize", resize);
    function loop() {
      cx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter(p => p.life > 0);
      for (const p of parts) {
        p.vy += 0.16; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.rot += p.vr; p.life -= 1;
        cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.globalAlpha = clamp(p.life / 30, 0, 1);
        cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); cx.restore();
      }
      if (parts.length) raf = requestAnimationFrame(loop); else { raf = null; cx.clearRect(0, 0, innerWidth, innerHeight); }
    }
    function burst(x, y, n, colors, power) {
      n = n || 26; power = power || 7;
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2, sp = Math.random() * power + 2;
        parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3, s: Math.random() * 8 + 4, c: colors[(Math.random() * colors.length) | 0], rot: Math.random() * 6, vr: (Math.random() - .5) * .4, life: 60 + Math.random() * 30 });
      }
      if (!raf) raf = requestAnimationFrame(loop);
    }
    return { burst };
  })();

  const themeColors = () => {
    const s = getComputedStyle(document.documentElement);
    return [s.getPropertyValue("--c1").trim(), s.getPropertyValue("--c2").trim(), "#ffd453", "#ffffff", s.getPropertyValue("--accent").trim()];
  };

  /* ---------- Thème ---------- */
  function applyTheme(t) {
    const r = document.documentElement.style;
    r.setProperty("--c1", t.c1); r.setProperty("--c2", t.c2); r.setProperty("--accent", t.accent);
    r.setProperty("--deep", t.deep); r.setProperty("--glow", t.glow);
  }
  const DEFAULT_THEME = { c1: "#ff5a3c", c2: "#ff5a3c", accent: "#ff5a3c", deep: "#14304a", glow: "rgba(255,90,60,.30)" };

  // Couleurs de la carte (thème « atlas » clair)
  const MAP = { ink: "#14304a", land: "#e6dcc6", landFaint: "#efe7d4", landStroke: "#c3b795", gold: "#f2b01e", reveal: "#9db0be", bad: "#e23d3d" };

  /* ---------- Navigation ---------- */
  let currentContinent = null, currentSub = null;
  function showScreen(name) {
    $$(".screen").forEach(s => s.classList.remove("active"));
    $("#screen-" + name).classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* ---------- Helpers meta ---------- */
  const subFR = (k) => REG.subregions[k] ? REG.subregions[k].name : k;
  function starsForSub(k) { const b = save.best[k]; return b ? b.stars : 0; }
  function continentStars(contKey) {
    let s = 0; for (const k of REG.continents[contKey].subOrder) s += starsForSub(k); return s;
  }
  function continentMax(contKey) { return REG.continents[contKey].subOrder.length * 3; }
  function animateNumber(el, to, dur) {
    const from = parseInt((el.textContent || "0").replace(/\D/g, ""), 10) || 0;
    const suffix = /🔥/.test(el.textContent) ? " 🔥" : "";
    to = Math.round(to); dur = dur || 500; const t0 = performance.now();
    (function step(t) {
      const k = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(from + (to - from) * e) + suffix;
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- Barre de profil ---------- */
  function renderProfile() {
    const lv = levelFromXP(save.totalXP);
    $("#lvlBadge").textContent = lv.level;
    $("#lvlLabel").textContent = levelTitle(lv.level);
    $("#xpTxt").textContent = lv.into + " / " + lv.need + " XP";
    $("#xpFill").style.width = clamp((lv.into / lv.need) * 100, 3, 100) + "%";
    $("#soundBtn").textContent = Sound.isOn() ? "🔊" : "🔇";
    $("#soundBtn").classList.toggle("off", !Sound.isOn());
    const tb = $("#timerBtn");
    if (tb) { tb.textContent = timerOn() ? "⏱️" : "⏱"; tb.classList.toggle("off", !timerOn()); tb.title = timerOn() ? "Chrono activé" : "Chrono coupé"; }
  }

  /* ---------- Accueil ---------- */
  function renderHome() {
    applyTheme(DEFAULT_THEME);
    const lv = levelFromXP(save.totalXP);
    const totalStars = Object.keys(REG.continents).reduce((a, c) => a + continentStars(c), 0);
    const stats = [
      ["Niveau", lv.level],
      ["Pays maîtrisés", masteredSet.size + "/" + TOTAL_COUNTRIES],
      ["Record de série", save.longestStreak + " 🔥"],
      ["Régions finies", save.regionsDone.length + "/" + TOTAL_SUBS],
      ["Étoiles", totalStars + "/" + TOTAL_STARS],
    ];
    $("#heroStats").innerHTML = stats.map(s => `<div class="hero-stat"><b>${s[1]}</b><span>${s[0]}</span></div>`).join("");

    $("#continentGrid").innerHTML = REG.order.map(key => {
      const c = REG.continents[key], t = c.theme;
      const count = c.subOrder.reduce((a, k) => a + (bySub[k] ? bySub[k].length : 0), 0);
      const s = continentStars(key), max = continentMax(key);
      return `<button class="cont-card" data-cont="${key}" style="--cc1:${t.c1};--cc2:${t.c2};--ccg:${t.glow}">
        <span class="cont-ghost" aria-hidden="true" style="position:absolute;right:-14px;top:-24px;font-size:150px;opacity:.14;z-index:-1;pointer-events:none">${c.emoji}</span>
        <div class="cont-emoji">${c.emoji}</div>
        <div class="cont-name">${c.name}</div>
        <div class="cont-tag">${c.tagline}</div>
        <div class="cont-meta">
          <span class="cont-pill">${count} pays</span>
          <span class="cont-pill">${c.subOrder.length} régions</span>
          <span class="cont-stars">⭐ ${s}/${max}</span>
        </div>
      </button>`;
    }).join("");
    $$(".cont-card").forEach(el => el.addEventListener("click", () => { Sound.click(); openContinent(el.dataset.cont); }));

    // Défi du monde
    const wc = $("#worldChallenge");
    if (wc) {
      const wb = save.best["WORLD"];
      wc.innerHTML = `<button class="mode-banner mode-world" id="worldBtn">
        <span class="mb-ic">🌐</span>
        <span class="mb-tx"><b>Tour du monde</b><span>Les <span class="mb-hl">193 pays</span> du monde en une seule partie. ${wb ? "Record : " + wb.score + " " + starStr(wb.stars) : "Le défi ultime."}</span></span>
        <span class="mb-go">Jouer ▸</span>
      </button>`;
      $("#worldBtn").onclick = () => { Sound.click(); startWorld(); };
    }

    renderBadges();
  }
  const starStr = (n) => "★★★".slice(0, n) + "☆☆☆".slice(0, 3 - n);

  /* ---------- Trophées ---------- */
  const BADGES = [
    { id: "first", ic: "🧭", name: "Premiers pas", desc: "Termine ta 1ʳᵉ région", has: () => save.regionsDone.length >= 1 },
    { id: "perfect", ic: "💎", name: "Sans faute", desc: "Une région 3 étoiles", has: () => Object.values(save.best).some(b => b.stars === 3) },
    { id: "streak10", ic: "🔥", name: "En feu", desc: "Série de 10", has: () => save.longestStreak >= 10 },
    { id: "streak25", ic: "☄️", name: "Météore", desc: "Série de 25", has: () => save.longestStreak >= 25 },
    { id: "c50", ic: "🎒", name: "Bourlingueur", desc: "50 pays maîtrisés", has: () => masteredSet.size >= 50 },
    { id: "c100", ic: "💯", name: "Centenaire", desc: "100 pays maîtrisés", has: () => masteredSet.size >= 100 },
    { id: "cont", ic: "👑", name: "Roi du continent", desc: "Un continent tout en or", has: () => REG.order.some(k => continentStars(k) === continentMax(k)) },
    { id: "world", ic: "🌐", name: "Tour du monde", desc: "Les 193 pays", has: () => masteredSet.size >= TOTAL_COUNTRIES },
  ];
  function renderBadges() {
    $("#badgeGrid").innerHTML = BADGES.map(b => {
      const has = b.has();
      return `<div class="badge ${has ? "" : "locked"}"><div class="badge-ic">${has ? b.ic : "🔒"}</div><div class="badge-tx"><b>${b.name}</b><span>${b.desc}</span></div></div>`;
    }).join("");
  }
  function checkBadges() {
    let earned = [];
    for (const b of BADGES) if (b.has() && !save.badges.includes(b.id)) { save.badges.push(b.id); earned.push(b); }
    if (earned.length) { persist(); }
    return earned;
  }

  /* ---------- Écran continent ---------- */
  function openContinent(key) {
    currentContinent = key;
    const c = REG.continents[key];
    applyTheme(c.theme);
    $("#continentHead").innerHTML = `
      <div class="ch-emoji">${c.emoji}</div>
      <div class="ch-text"><h2>${c.name}</h2><p>${c.tagline}</p></div>
      <div class="ch-prog"><b>⭐ ${continentStars(key)}/${continentMax(key)}</b><span>étoiles gagnées</span></div>`;

    // Défi continent (toutes les régions d'un coup)
    const cc = $("#continentChallenge");
    if (cc) {
      const count = c.subOrder.reduce((a, k) => a + (bySub[k] ? bySub[k].length : 0), 0);
      const cb = save.best["CONT:" + key];
      cc.innerHTML = `<button class="mode-banner mode-cont" id="contChalBtn" style="background:${c.theme.accent}">
        <span class="mb-ic">${c.emoji}</span>
        <span class="mb-tx"><b>Défi ${c.name}</b><span>Les ${count} pays du continent en une partie. ${cb ? "Record : " + cb.score + " " + starStr(cb.stars) : ""}</span></span>
        <span class="mb-go">Jouer ▸</span>
      </button>`;
      $("#contChalBtn").onclick = () => { Sound.click(); startContinent(key); };
    }

    $("#subregionGrid").innerHTML = c.subOrder.map(k => {
      const list = bySub[k] || [], best = save.best[k];
      const stars = best ? best.stars : 0;
      const done = save.regionsDone.includes(k);
      const starHtml = [1, 2, 3].map(n => `<i class="${n <= stars ? "on" : ""}">★</i>`).join("");
      return `<button class="sub-card" data-sub="${k}">
        ${done ? '<div class="ribbon">FINI</div>' : ""}
        <div class="sc-top"><div class="sc-emoji">${REG.subregions[k].emoji}</div>
          <div><div class="sc-name">${subFR(k)}</div><div class="sc-count">${list.length} pays</div></div></div>
        <div class="sc-foot">
          <div class="sc-stars">${starHtml}</div>
          ${best ? `<span class="sc-best">🏆 ${best.score}</span>` : `<span class="sc-play">Jouer ▸</span>`}
        </div>
      </button>`;
    }).join("");
    $$(".sub-card").forEach(el => el.addEventListener("click", () => { Sound.click(); startRegion(el.dataset.sub); }));
    showScreen("continent");
  }

  /* ============================================================
     MOTEUR DE JEU
     ============================================================ */
  let map = null, worldLayer = null, layerByCca3 = {}, dotByCca3 = {}, dots = [];
  const ROUND_TIME = 9000;
  const SMALL_AREA = 22000; // km² : en-dessous, on ajoute un point lumineux pour bien voir le pays
  let game = null;

  function ensureMap() {
    if (map) return;
    map = L.map("map", {
      zoomControl: true, attributionControl: true, worldCopyJump: false,
      minZoom: 1, maxZoom: 8, zoomSnap: 0.25, maxBoundsViscosity: 0.6,
    });
    map.attributionControl.setPrefix(false);
    map.attributionControl.addAttribution("Frontières © Natural Earth");
    map.setView([20, 0], 2); // vue initiale : la carte a toujours un centre/zoom
    map.on("click", onMapClick);
    addEventListener("resize", () => { if (map) map.invalidateSize(); });
  }

  // Couleur d'un pays actif : sa couleur de continent en mode monde, sinon celle du continent courant
  function countryColor(id) {
    if (game && game.colorByContinent) {
      const r = GEO.countries[id] && GEO.countries[id].region;
      return REG.continents[r] ? REG.continents[r].theme.accent : DEFAULT_THEME.accent;
    }
    return REG.continents[currentContinent].theme.accent;
  }

  function styleFor(feature) {
    const active = game && game.activeSet.has(feature.id);
    if (active) return { fillColor: countryColor(feature.id), fillOpacity: 0.85, color: MAP.ink, weight: 1.3, opacity: 1 };
    return { fillColor: feature.properties.region ? MAP.land : MAP.landFaint, fillOpacity: 1, color: MAP.landStroke, weight: 0.7, opacity: 1 };
  }

  function livesFor(kind, n) {
    if (kind === "world") return clamp(Math.ceil(n / 12), 12, 20);
    if (kind === "continent") return clamp(Math.ceil(n / 5), 6, 14);
    return clamp(Math.ceil(n / 3), 3, 6);
  }

  // Point d'entrée générique : une partie = une liste de pays
  function startSession(opts) {
    currentSub = opts.sub;
    currentContinent = opts.continent || currentContinent;
    applyTheme(opts.kind === "world" ? DEFAULT_THEME : REG.continents[opts.continent || currentContinent].theme);
    showScreen("game");
    ensureMap();

    const active = shuffle(opts.countries.slice());
    game = {
      sub: opts.sub, kind: opts.kind, title: opts.title, continent: opts.continent || null,
      colorByContinent: opts.kind === "world",
      activeSet: new Set(active), queue: active.slice(), idx: 0,
      total: active.length, done: 0, score: 0, streak: 0,
      lives: livesFor(opts.kind, active.length),
      firstTryCorrect: 0, roundMisses: 0, roundActive: false, roundStart: 0, target: null,
      maxLives: 0, streakMax: 0,
    };
    game.maxLives = game.lives;

    // (Re)construction de la couche carte
    if (worldLayer) { map.removeLayer(worldLayer); worldLayer = null; }
    dots.forEach(d => map.removeLayer(d)); dots = []; dotByCca3 = {};
    layerByCca3 = {};
    worldLayer = L.geoJSON(GEO.world, {
      style: styleFor,
      onEachFeature: (f, layer) => { if (f.id) layerByCca3[f.id] = layer; },
    }).addTo(map);

    // Points lumineux pour les tout petits pays (îles, micro-États) : visibles et faciles à viser
    for (const id of active) {
      const c = GEO.countries[id];
      if (c.area < SMALL_AREA) {
        const dot = L.circleMarker([c.lat, c.lng], { radius: 6, color: MAP.ink, weight: 2, fillColor: countryColor(id), fillOpacity: 1, interactive: false, className: "dot-pulse" }).addTo(map);
        dotByCca3[id] = dot; dots.push(dot);
      }
    }

    // Cadrage sur la zone (centroïdes + marge — évite les soucis d'antiméridien)
    const lats = active.map(id => GEO.countries[id].lat), lngs = active.map(id => GEO.countries[id].lng);
    const minLat = Math.min(...lats), maxLat = Math.max(...lats), minLng = Math.min(...lngs), maxLng = Math.max(...lngs);
    const pLat = Math.max(3, (maxLat - minLat) * 0.4), pLng = Math.max(3, (maxLng - minLng) * 0.4);
    const bounds = [[minLat - pLat, minLng - pLng], [maxLat + pLat, maxLng + pLng]];
    map.fitBounds(bounds, { padding: [20, 20], maxZoom: 6, animate: false });
    setTimeout(() => { map.invalidateSize(); map.fitBounds(bounds, { padding: [20, 20], maxZoom: 6, animate: false }); }, 60);

    // HUD
    $("#hudScore").textContent = "0";
    $("#hudStreak").textContent = "0 🔥";
    $("#hudProg").textContent = "0/" + game.total;
    renderHearts();
    nextRound();
  }

  function startRegion(subKey) {
    startSession({ countries: bySub[subKey] || [], kind: "region", continent: REG.subregions[subKey].region, sub: subKey, title: subFR(subKey) });
  }
  function startContinent(contKey) {
    const list = [];
    for (const sk of REG.continents[contKey].subOrder) if (bySub[sk]) list.push.apply(list, bySub[sk]);
    startSession({ countries: list, kind: "continent", continent: contKey, sub: "CONT:" + contKey, title: "Défi " + REG.continents[contKey].name });
  }
  function startWorld() {
    startSession({ countries: Object.keys(GEO.countries), kind: "world", continent: null, sub: "WORLD", title: "Tour du monde" });
  }
  function replaySession(g) {
    if (g.kind === "world") startWorld();
    else if (g.kind === "continent") startContinent(g.continent || currentContinent);
    else startRegion(g.sub);
  }

  function renderHearts() {
    const el = $("#hudHearts");
    if (game.maxLives > 7) { // trop de vies pour des cœurs : affichage compact
      el.innerHTML = `<span class="heart-compact">❤️ <b>${game.lives}</b><i>/${game.maxLives}</i></span>`;
      return;
    }
    let h = "";
    for (let i = 0; i < game.maxLives; i++) h += `<span class="heart ${i < game.lives ? "" : "lost"}">❤️</span>`;
    el.innerHTML = h;
  }

  function nextRound() {
    if (game.idx >= game.queue.length) { endRegion(true); return; }
    game.target = game.queue[game.idx];
    game.roundMisses = 0; game.roundActive = true; game.roundStart = performance.now();
    const c = GEO.countries[game.target];
    $("#promptFlag").textContent = c.flag || "🏳️";
    const nameEl = $("#promptName"); nameEl.textContent = c.name;
    nameEl.classList.remove("pop"); void nameEl.offsetWidth; nameEl.classList.add("pop");
    $("#promptHint").textContent = "";
    // Barre de temps (seulement si le chrono est activé)
    const tf = $("#timerFill");
    tf.style.transition = "none"; tf.style.transform = "scaleX(1)"; void tf.offsetWidth;
    if (timerOn()) { tf.style.transition = `transform ${ROUND_TIME}ms linear`; tf.style.transform = "scaleX(0)"; }
    $("#hudProg").textContent = game.done + "/" + game.total;
  }

  function centroidPx(id) { return map.latLngToContainerPoint([GEO.countries[id].lat, GEO.countries[id].lng]); }

  function onMapClick(e) {
    if (!game || !game.roundActive) return;
    const x = e.latlng.lng, y = e.latlng.lat;
    // 1) pays de la région sous le clic
    let hit = null;
    for (const id of game.activeSet) { const f = featById[id]; if (f && pointInFeature(x, y, f.geometry)) { hit = id; break; } }
    // 2) sinon, n'importe quel pays (pour nommer le pays cliqué)
    if (!hit) { for (const f of GEO.world.features) { if (f.id && pointInFeature(x, y, f.geometry)) { hit = f.id; break; } } }
    // 3) sinon, pays actif le plus proche (aide pour les micro-pays)
    if (!hit || !game.activeSet.has(hit)) {
      const cp = e.containerPoint; let best = null, bd = 34;
      for (const id of game.activeSet) { const p = centroidPx(id); const d = Math.hypot(p.x - cp.x, p.y - cp.y); if (d < bd) { bd = d; best = id; } }
      if (best) hit = best;
    }

    if (!hit) { toast("Vise un pays 🌊", ""); return; }
    if (hit === game.target) { onCorrect(e.containerPoint); }
    else if (game.activeSet.has(hit)) { onWrong(hit); }
    else { toast(`« ${GEO.countries[hit] ? GEO.countries[hit].name : (featById[hit] ? featById[hit].properties.name : "Ce pays")} » n'est pas dans cette zone`, ""); }
  }

  function markFound(id, kind) {
    const layer = layerByCca3[id]; if (!layer) return;
    const col = kind === "reveal" ? MAP.reveal : MAP.gold;
    layer.setStyle({ fillColor: col, fillOpacity: 1, color: MAP.ink, weight: 1.5, opacity: 1 });
    layer.bindTooltip(GEO.countries[id].name, { permanent: true, direction: "center", className: "country-label" }).openTooltip();
    if (layer.bringToFront) layer.bringToFront();
    if (dotByCca3[id]) dotByCca3[id].setStyle({ fillColor: col, fillOpacity: 1 });
  }

  function onCorrect(pt) {
    game.roundActive = false;
    const first = game.roundMisses === 0;
    const elapsed = performance.now() - game.roundStart;
    const speed = timerOn() ? Math.round(50 * clamp(1 - elapsed / ROUND_TIME, 0, 1)) : 0;
    const streakBonus = Math.min(game.streak * 10, 120);
    const base = first ? 100 : 40;
    const pts = first ? base + streakBonus + speed : base;
    game.score += pts;
    game.streak += 1;
    if (game.streak > game.streakMax) game.streakMax = game.streak;
    if (game.streak > save.longestStreak) save.longestStreak = game.streak;
    if (first) game.firstTryCorrect += 1;
    game.done += 1;
    masteredSet.add(game.target);

    markFound(game.target, "found");
    animateNumber($("#hudScore"), game.score);
    $("#hudStreak").textContent = game.streak + " 🔥";
    $("#hudProg").textContent = game.done + "/" + game.total;

    Sound.correct();
    FX.burst(pt.x + $("#map").getBoundingClientRect().left, pt.y + $("#map").getBoundingClientRect().top, 22, themeColors(), 7);
    if (game.streak >= 3) comboPop(`+${pts}  🔥 x${game.streak}`);
    else toast(first ? pick(["Bravo !", "Parfait !", "Nickel !", "Trouvé !"]) : "Bien rattrapé !", "good");

    persist();
    setTimeout(() => { game.idx += 1; nextRound(); }, 650);
  }

  function onWrong(clickedId) {
    game.lives -= 1; game.roundMisses += 1; game.streak = 0;
    renderHearts();
    const layer = layerByCca3[clickedId];
    if (layer) {
      const prev = styleFor({ id: clickedId, properties: {} });
      layer.setStyle({ fillColor: MAP.bad, fillOpacity: 0.9, color: MAP.ink, weight: 1.5 });
      setTimeout(() => { if (game && game.activeSet.has(clickedId) && !masteredSet.has(clickedId)) layer.setStyle(prev); }, 700);
    }
    $("#hudStreak").textContent = "0 🔥";
    Sound.wrong();
    const nm = GEO.countries[clickedId] ? GEO.countries[clickedId].name : "?";
    toast(`Non ! Ça, c'est ${nm}`, "bad");
    shake($("#promptBar"));
    const cap = GEO.countries[game.target].capital;
    if (cap) $("#promptHint").textContent = "Indice : capitale " + cap;
    if (game.lives <= 0) { game.roundActive = false; setTimeout(() => endRegion(false), 800); }
  }

  function onSkip() {
    if (!game || !game.roundActive) return;
    game.roundActive = false; game.streak = 0;
    $("#hudStreak").textContent = "0 🔥";
    markFound(game.target, "reveal");
    Sound.reveal();
    toast(`C'était ${GEO.countries[game.target].name}`, "");
    game.done += 1;
    $("#hudProg").textContent = game.done + "/" + game.total;
    persist();
    setTimeout(() => { game.idx += 1; nextRound(); }, 950);
  }

  /* ---------- Fin de région ---------- */
  function endRegion(win) {
    const g = game;
    const acc = g.total ? g.firstTryCorrect / g.total : 0;
    let stars = 0;
    if (win) { stars = acc >= 0.999 ? 3 : acc >= 0.7 ? 2 : 1; }

    // XP + record
    const oldLevel = levelFromXP(save.totalXP).level;
    save.totalXP += g.score;
    const newLevel = levelFromXP(save.totalXP).level;

    const prev = save.best[g.sub] || { stars: 0, score: 0, accuracy: 0 };
    save.best[g.sub] = {
      stars: Math.max(prev.stars, stars),
      score: Math.max(prev.score, g.score),
      accuracy: Math.max(prev.accuracy || 0, Math.round(acc * 100)),
    };
    if (win && g.kind === "region" && !save.regionsDone.includes(g.sub)) save.regionsDone.push(g.sub);
    persist();
    const newBadges = checkBadges();

    showResult(win, g, stars, { levelUp: newLevel > oldLevel, newLevel, newBadges });
  }

  function showResult(win, g, stars, extra) {
    showScreen("result");
    const acc = Math.round((g.total ? g.firstTryCorrect / g.total : 0) * 100);
    const doneWord = g.kind === "region" ? "Région terminée !" : (g.kind === "continent" ? "Continent conquis !" : "Monde conquis !");
    $("#resultEmoji").textContent = win ? (stars === 3 ? "🏆" : "🎉") : "💪";
    $("#resultTitle").textContent = win ? (stars === 3 ? "Sans-faute légendaire !" : doneWord) : "Presque !";
    $("#resultSub").textContent = win
      ? `${g.title} · ${g.firstTryCorrect}/${g.total} du premier coup`
      : `Tu as trouvé ${g.done}/${g.total} pays. Réessaie, tu vas y arriver !`;

    // Étoiles animées
    $$("#resultStars i").forEach((el, i) => {
      el.classList.remove("on");
      if (i < stars) setTimeout(() => { el.classList.add("on"); Sound.star(); }, 250 + i * 320);
    });

    $("#resultStats").innerHTML = [
      ["Score", "+" + g.score],
      ["Précision", acc + "%"],
      ["Meilleure série", g.streakMax + ""],
    ].map(s => `<div><b>${s[1]}</b><span>${s[0]}</span></div>`).join("");

    // Confettis
    if (win) {
      const cx = innerWidth / 2, cols = themeColors();
      setTimeout(() => FX.burst(cx, innerHeight * 0.35, 70, cols, 11), 150);
      if (stars === 3) { setTimeout(() => FX.burst(cx - 120, innerHeight * 0.4, 40, cols, 9), 500); setTimeout(() => FX.burst(cx + 120, innerHeight * 0.4, 40, cols, 9), 750); }
    }

    // Montée de niveau / trophées
    setTimeout(() => {
      if (extra.levelUp) { Sound.level(); toast(`⭐ Niveau ${extra.newLevel} — ${levelTitle(extra.newLevel)} !`, "good"); }
      if (extra.newBadges && extra.newBadges.length) {
        extra.newBadges.forEach((b, i) => setTimeout(() => { toast(`${b.ic} Trophée : ${b.name} !`, "good"); Sound.star(); }, 900 + i * 1300));
      }
    }, 1100);

    // Boutons selon le mode
    const backBtn = $("#resultBackBtn"), nextBtn = $("#nextBtn");
    nextBtn.hidden = false;
    const goHome = () => { Sound.click(); renderHome(); showScreen("home"); };
    if (g.kind === "region") {
      backBtn.textContent = "Régions"; backBtn.onclick = () => { Sound.click(); openContinent(g.continent || currentContinent); };
      const order = REG.continents[g.continent || currentContinent].subOrder;
      const pos = order.indexOf(g.sub);
      const nextSub = pos >= 0 && pos < order.length - 1 ? order[pos + 1] : null;
      if (nextSub) { nextBtn.textContent = subFR(nextSub) + " →"; nextBtn.onclick = () => { Sound.click(); startRegion(nextSub); }; }
      else { nextBtn.textContent = "Continent ✓"; nextBtn.onclick = () => { Sound.click(); openContinent(g.continent || currentContinent); }; }
    } else if (g.kind === "continent") {
      backBtn.textContent = "Accueil"; backBtn.onclick = goHome;
      nextBtn.textContent = "Régions →"; nextBtn.onclick = () => { Sound.click(); openContinent(g.continent || currentContinent); };
    } else { // world
      backBtn.textContent = "Accueil"; backBtn.onclick = goHome;
      nextBtn.hidden = true;
    }
    $("#replayBtn").onclick = () => { Sound.click(); replaySession(g); };

    renderProfile();
  }

  /* ---------- UI utilitaires ---------- */
  let toastTimer = null;
  function toast(msg, kind) {
    const t = $("#toast"); t.textContent = msg; t.className = "toast show " + (kind || "");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 1600);
  }
  let comboTimer = null;
  function comboPop(txt) {
    const c = $("#comboPop"); c.textContent = txt; c.classList.remove("show"); void c.offsetWidth; c.classList.add("show");
    clearTimeout(comboTimer); comboTimer = setTimeout(() => c.classList.remove("show"), 1000);
  }
  function shake(el) { el.style.animation = "none"; void el.offsetWidth; el.style.animation = "shakeX .4s"; }
  const pick = (a) => a[(Math.random() * a.length) | 0];

  // keyframe shake injecté
  const st = document.createElement("style");
  st.textContent = "@keyframes shakeX{0%,100%{transform:translateX(0)}20%{transform:translateX(-8px)}40%{transform:translateX(8px)}60%{transform:translateX(-5px)}80%{transform:translateX(5px)}}";
  document.head.appendChild(st);

  /* ---------- Câblage global ---------- */
  document.addEventListener("click", () => Sound.unlock(), { once: true });
  $("#brand").addEventListener("click", () => { Sound.click(); renderHome(); showScreen("home"); });
  $("#soundBtn").addEventListener("click", () => { Sound.toggle(); renderProfile(); });
  { const tb = $("#timerBtn"); if (tb) tb.addEventListener("click", () => { save.timer = !timerOn(); persist(); applyTimerClass(); renderProfile(); Sound.click(); toast(timerOn() ? "⏱️ Chrono activé" : "⏱️ Chrono coupé", ""); }); }
  $("#skipBtn").addEventListener("click", () => { Sound.click(); onSkip(); });
  $$("[data-nav]").forEach(el => el.addEventListener("click", () => {
    Sound.click();
    const dest = el.dataset.nav;
    if (dest === "home") { renderHome(); showScreen("home"); }
    else if (dest === "continent") { openContinent(currentContinent || REG.order[0]); }
  }));

  /* ---------- Démarrage ---------- */
  applyTimerClass();
  renderProfile();
  renderHome();

  // Hook de test/debug (activé uniquement avec ?debug dans l'URL)
  if (location.search.indexOf("debug") >= 0) {
    window.__gq = { getMap: () => map, getGame: () => game, GEO, startRegion, startContinent, startWorld, openContinent };
  }
})();
