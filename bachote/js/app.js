/* ============================================================
   BACHOTE — moteur de l'application
   ============================================================ */
(function () {
  "use strict";

  var S = window.Store, Sfx = window.Sfx;
  var LC = window.LANG_CODES || ["fr"];

  /* Langue courante (mémorisée), avec repli sur le français. */
  function curLang() { var l = S.setting("lang"); return LC.indexOf(l) >= 0 ? l : "fr"; }
  function t(k) { return window.tRaw(curLang(), k); }

  /* Lecture à voix haute : disponible (API + voix) ; active (dispo + réglage). */
  function speakSupported() { return !!(window.Speak && window.Speak.available()); }
  function speakReady() { return speakSupported() && S.setting("speak") !== false; }
  /* Lit un texte dans la langue de l'interface, si tout est prêt. */
  function speakText(txt) {
    if (speakReady() && txt && window.Speak) window.Speak.say(txt, curLang());
  }
  /* Met à jour l'affichage des boutons haut-parleur sans relancer la navigation
     (important : ne casse pas une session d'étude en cours). */
  function refreshSpeakButtons() {
    var canSpeak = speakReady();
    var sf = $("#speakFront"), sb = $("#speakBack");
    if (sf) sf.hidden = !canSpeak;
    if (sb) sb.hidden = !canSpeak;
    if (visibleScreen() === "deck" && currentDeckId) renderDeck(currentDeckId);
  }
  var tr = t; // alias sûr là où une variable locale « t » masquerait la fonction
  function sepName(sep) {
    if (sep === "\t") return tr("sep_word_tab");
    var c = String(sep).trim();
    return c ? "« " + c + " »" : tr("sep_word_space");
  }
  function tn(k, n) { return window.tnRaw(curLang(), k, n); }
  function subjLabel(k) { return window.subjectLabel(curLang(), k); }

  /* Message de confirmation de suppression, avec le nom et le nombre de cartes. */
  function delMsg(deck) {
    return "« " + deck.name + " » — " + tn("n_cards", deck.cards.length) + ".";
  }

  /* Icônes SVG de la barre (au lieu d'emoji, plus net et cohérent). */
  var IC = {
    soundOn:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a8 8 0 0 1 0 12"/></svg>',
    soundOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="m16 9 5 6M21 9l-5 6"/></svg>',
    sun:      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>',
    moon:     '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>',
    speakOn:  '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M17 8a4 4 0 0 1 0 6M19.5 6a7 7 0 0 1 0 10"/></svg>',
    speakOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.2"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="m17 8 4 6M21 8l-4 6"/></svg>'
  };

  /* ---------- raccourcis DOM ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function show(node) { node.hidden = false; }
  function hide(node) { node.hidden = true; }

  var SCREENS = ["home", "deck", "edit", "study", "result", "timer", "activity"];
  function screen(name) {
    SCREENS.forEach(function (s) {
      var n = $("#screen-" + s);
      if (n) n.hidden = (s !== name);
    });
    window.scrollTo(0, 0);
  }

  /* ---------- toast ---------- */
  var toastTimer = null;
  function toast(msg) {
    var t = $("#toast");
    t.textContent = msg;
    t.hidden = false;
    requestAnimationFrame(function () { t.classList.add("show"); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      t.classList.remove("show");
      setTimeout(function () { t.hidden = true; }, 240);
    }, 2600);
  }

  /* ---------- utilitaires ---------- */
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var tmp = a[i]; a[i] = a[j]; a[j] = tmp;
    }
    return a;
  }

  function plural(n, one, many) { return n + " " + (n > 1 ? many : one); }

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function stripArticle(s) {
    return s.replace(/^(le|la|les|l|un|une|des|du|de|d)\s+/, "");
  }

  function lev(a, b) {
    var m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    var prev = [], cur = [], i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur[0] = i;
      for (j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a.charAt(i - 1) === b.charAt(j - 1) ? 0 : 1));
      }
      prev = cur.slice();
    }
    return prev[n];
  }

  /* Compare une réponse écrite : exact, puis tolérant aux fautes de frappe. */
  function checkAnswer(given, expected) {
    var g = norm(given), e = norm(expected);
    if (!g) return "no";
    if (g === e) return "exact";
    if (stripArticle(g) === stripArticle(e)) return "exact";
    var d = lev(stripArticle(g), stripArticle(e));
    var tol = e.length > 12 ? 2 : (e.length > 5 ? 1 : 0);
    if (d <= tol) return "close";
    return "no";
  }

  /* ============================================================
     Réglages : thème et sons
     ============================================================ */
  function prefersDark() {
    return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  }

  /* Thème réellement affiché : un choix explicite, sinon ce que dit le système. */
  function effectiveTheme() {
    return document.documentElement.getAttribute("data-theme") || (prefersDark() ? "dark" : "light");
  }

  function applyTheme(mode) {
    // Sans choix enregistré on ne TOUCHE PAS à l'attribut : il peut avoir été
    // posé par la page hôte. L'effacer ferait basculer le site en clair.
    if (mode === "dark" || mode === "light") {
      document.documentElement.setAttribute("data-theme", mode);
    }
    $("#themeIcon").innerHTML = effectiveTheme() === "dark" ? IC.sun : IC.moon;
  }

  function visibleScreen() {
    for (var i = 0; i < SCREENS.length; i++) {
      var n = $("#screen-" + SCREENS[i]);
      if (n && !n.hidden) return SCREENS[i];
    }
    return "home";
  }

  function applyStaticI18n() {
    var lang = curLang();
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach(function (e) { e.textContent = window.tRaw(lang, e.getAttribute("data-i18n")); });
    $$("[data-i18n-ph]").forEach(function (e) { e.placeholder = window.tRaw(lang, e.getAttribute("data-i18n-ph")); });
    $$("[data-i18n-title]").forEach(function (e) { e.title = window.tRaw(lang, e.getAttribute("data-i18n-title")); });
    var flag = $("#langFlag");
    var cur = window.LANGS.filter(function (l) { return l.code === lang; })[0];
    if (flag && cur) flag.textContent = cur.flag;
  }

  function relabelEditor() {
    $("#editHeading").textContent = t(editState.id ? "edit_heading_edit" : "edit_heading_new");
    renderSubjectPills($("#deckSubjectInput").value);
  }

  function setLang(code) {
    if (LC.indexOf(code) < 0) return;
    S.setting("lang", code);
    applyStaticI18n();
    Sfx.play("click");
    var scr = visibleScreen();
    if (scr === "home") renderHome();
    else if (scr === "deck") renderDeck(currentDeckId);
    else if (scr === "edit") relabelEditor();
    // étude / résultat : les libellés statiques suffisent, on ne coupe pas la session
  }

  function initLangMenu() {
    var menu = $("#langMenu"), btn = $("#langBtn");
    menu.innerHTML = "";
    window.LANGS.forEach(function (l) {
      var b = el("button", "lang-opt");
      b.type = "button";
      b.setAttribute("role", "menuitem");
      b.setAttribute("data-lang", l.code);
      b.innerHTML = '<span class="lang-flag">' + l.flag + '</span><span>' + l.label + '</span>';
      b.addEventListener("click", function (e) {
        e.stopPropagation();
        setLang(l.code);
        closeLangMenu();
      });
      menu.appendChild(b);
    });
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = menu.hidden;
      if (open) openLangMenu(); else closeLangMenu();
    });
  }
  function openLangMenu() {
    var menu = $("#langMenu");
    $$(".lang-opt", menu).forEach(function (o) {
      o.setAttribute("aria-current", String(o.getAttribute("data-lang") === curLang()));
    });
    menu.hidden = false;
    $("#langBtn").setAttribute("aria-expanded", "true");
  }
  function closeLangMenu() {
    $("#langMenu").hidden = true;
    $("#langBtn").setAttribute("aria-expanded", "false");
  }

  function initSettings() {
    applyTheme(S.setting("theme"));
    $("#themeBtn").addEventListener("click", function () {
      var next = effectiveTheme() === "dark" ? "light" : "dark";
      S.setting("theme", next);
      applyTheme(next);
      Sfx.play("click");
    });

    function paintSound() {
      var on = S.setting("sound") !== false;
      $("#soundIcon").innerHTML = on ? IC.soundOn : IC.soundOff;
      $("#soundBtn").setAttribute("aria-pressed", String(on));
    }
    paintSound();
    $("#soundBtn").addEventListener("click", function () {
      S.setting("sound", S.setting("sound") === false);
      paintSound();
      Sfx.play("click");
    });

    // Lecture à voix haute : le bouton n'apparaît que si l'appareil sait parler.
    var speakBtn = $("#speakBtn");
    if (speakSupported()) {
      speakBtn.hidden = false;
      var paintSpeak = function () {
        var on = S.setting("speak") !== false;
        $("#speakIcon").innerHTML = on ? IC.speakOn : IC.speakOff;
        speakBtn.setAttribute("aria-pressed", String(on));
      };
      paintSpeak();
      speakBtn.addEventListener("click", function () {
        S.setting("speak", S.setting("speak") === false);
        if (window.Speak) window.Speak.stop();
        paintSpeak();
        Sfx.play("click");
        refreshSpeakButtons(); // met à jour les haut-parleurs de l'écran courant
      });
    } else {
      speakBtn.hidden = true;
    }
  }

  /* ============================================================
     ACCUEIL
     ============================================================ */
  var STAR = '<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" style="fill:var(--gold,#f2b01e);stroke:var(--ink);stroke-width:1.5"><path d="m12 3 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19l1-5.8L3.6 9.1l5.8-.8Z"/></svg>';

  function deckCard(deck) {
    var b = el("button", "deck-card");
    b.type = "button";
    if (deck.fav) b.classList.add("is-fav");

    // Bouton menu (⋯) — clic gauche ou clic droit ouvrent le même menu.
    var menuBtn = el("button", "card-menu");
    menuBtn.type = "button";
    menuBtn.setAttribute("aria-label", t("options_deck"));
    menuBtn.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>';
    menuBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      var r = menuBtn.getBoundingClientRect();
      openCtxMenu(deck.id, r.right, r.bottom);
    });
    b.appendChild(menuBtn);

    if (deck.fav) {
      var st = el("span", "fav-star");
      st.innerHTML = STAR;
      b.appendChild(st);
    }

    var tag = el("span", "tag tag-" + (deck.subject || "autre"), subjLabel(deck.subject));
    b.appendChild(tag);
    b.appendChild(el("h3", "deck-name", deck.name));

    var due = S.dueCount(deck);
    var prog = S.deckProgress(deck);
    b.appendChild(el("p", "deck-sub", tn("n_cards", deck.cards.length) +
      (due ? " · " + due + " " + t("to_review_word") : "")));

    var foot2 = el("div", "deck-foot");
    var bar = el("div", "mini-bar");
    var fill = el("span");
    fill.style.width = prog.pct + "%";
    bar.appendChild(fill);
    foot2.appendChild(bar);
    foot2.appendChild(el("span", "mini-num", prog.pct + "%"));
    b.appendChild(foot2);

    b.addEventListener("click", function () { go("#/d/" + deck.id); });
    b.addEventListener("contextmenu", function (e) {
      e.preventDefault();
      openCtxMenu(deck.id, e.clientX, e.clientY);
    });
    return b;
  }

  /* ---------- progression : niveau, objectif du jour, badges ---------- */
  function renderProgress() {
    var decks = S.allDecks();
    var card = $("#progCard");
    if (!decks.length) { card.hidden = true; $("#badgesBlock").hidden = true; return; }
    card.hidden = false;

    var li = S.levelInfo();
    $("#levelNum").textContent = String(li.level);
    var pct = Math.round((li.into / li.forNext) * 100);
    $("#xpFill").style.width = pct + "%";
    $("#xpText").textContent = (li.forNext - li.into) + " " + t("xp_to_next");

    var dp = S.dailyProgress();
    $("#goalCenter").textContent = dp.done + "/" + dp.goal;
    var arc = $("#goalArc"), C = 2 * Math.PI * 30;
    arc.style.strokeDasharray = C;
    arc.style.strokeDashoffset = C * (1 - dp.pct / 100);
    $("#progCard").classList.toggle("goal-reached", dp.reached);
    $("#goalBtn").title = dp.reached ? t("goal_done_today") : t("daily_goal");

    // Badges gagnés
    S.refreshBadges();
    var earned = S.earnedBadges();
    var order = window.BADGE_ORDER || [];
    var strip = $("#badgesStrip");
    strip.innerHTML = "";
    order.forEach(function (id) {
      var got = earned.indexOf(id) >= 0;
      var b = el("div", "badge" + (got ? " got" : " locked"));
      b.title = t("b_" + id + "_n") + " — " + t("b_" + id + "_d");
      b.innerHTML = '<span class="badge-medal">' + (got ? "🏅" : "🔒") + '</span>';
      b.appendChild(el("span", "badge-name", t("b_" + id + "_n")));
      strip.appendChild(b);
    });
    $("#badgesBlock").hidden = false;
  }

  /* Change l'objectif quotidien au clic (10 → 20 → 30 → 50 → 10). */
  function cycleGoal() {
    var opts = [10, 20, 30, 50];
    var cur = (S.setting("dailyGoal") | 0) || 20;
    var next = opts[(opts.indexOf(cur) + 1) % opts.length];
    S.setting("dailyGoal", next);
    Sfx.play("click");
    renderProgress();
    toast(next + " " + t("goal_cards"));
  }

  /* ---------- tuiles de matières (points de départ, sans contenu imposé) ---------- */
  function renderSubjectTiles() {
    var grid = $("#subjectGrid");
    grid.innerHTML = "";
    window.SUBJECTS.forEach(function (subj) {
      if (subj.k === "autre") return; // "Autre" est proposé dans l'éditeur, pas ici
      var tile = el("button", "subject-tile");
      tile.type = "button";
      tile.setAttribute("data-subj", subj.k);
      tile.appendChild(el("span", "tag tag-" + subj.k, subjLabel(subj.k)));
      tile.appendChild(el("span", "subject-plus", t("create_deck_tile")));
      tile.addEventListener("click", function () { go("#/new/" + subj.k); });
      grid.appendChild(tile);
    });
    // Tuile "vierge" pour une matière libre
    var blank = el("button", "subject-tile subject-blank");
    blank.type = "button";
    blank.innerHTML = '<span class="subject-plus"><b>+</b> ' + t("blank_deck") + '</span>';
    blank.addEventListener("click", function () { go("#/new"); });
    grid.appendChild(blank);
  }

  /* ============================================================
     FENÊTRES MODALES (confirmation, lien de partage)
     window.confirm / window.prompt sont bloqués dans l'iframe publiée :
     on fait donc nos propres fenêtres, qui marchent partout.
     ============================================================ */
  function closeModal() {
    var m = $("#modal");
    m.hidden = true;
    m.innerHTML = "";
  }

  function buildModal(title, bodyNode, buttons) {
    var m = $("#modal");
    m.innerHTML = "";
    var card = el("div", "modal-card");
    card.setAttribute("role", "dialog");
    card.setAttribute("aria-modal", "true");
    card.appendChild(el("h2", "modal-title", title));
    if (bodyNode) card.appendChild(bodyNode);
    var row = el("div", "modal-actions");
    buttons.forEach(function (b) {
      var btn = el("button", "btn " + (b.cls || "btn-ghost"), b.label);
      btn.type = "button";
      btn.addEventListener("click", function () { if (b.onClick) b.onClick(); });
      row.appendChild(btn);
    });
    card.appendChild(row);
    m.appendChild(card);
    m.hidden = false;
    // Fermeture au clic sur le fond
    m.onclick = function (e) { if (e.target === m) closeModal(); };
    // Met le focus sur le dernier bouton (souvent l'action principale)
    var focusables = row.querySelectorAll("button");
    if (focusables.length) focusables[focusables.length - 1].focus();
    return card;
  }

  function confirmDialog(title, message, confirmLabel, danger, onConfirm) {
    var body = el("p", "modal-msg", message);
    var card = buildModal(title, body, [
      { label: t("cancel"), cls: "btn-ghost", onClick: closeModal },
      { label: confirmLabel, cls: danger ? "btn-primary btn-confirm-danger" : "btn-primary",
        onClick: function () { closeModal(); onConfirm(); } }
    ]);
    // Sur une action destructive, on met le focus sur « Annuler » : un appui
    // sur Entrée n'efface alors rien par mégarde.
    if (danger) { var first = card.querySelector(".modal-actions .btn"); if (first) first.focus(); }
  }

  function showLinkDialog(url) {
    var wrap = el("div");
    var msg = el("p", "modal-msg", t("share_link_msg"));
    var field = el("input", "inp");
    field.type = "text"; field.value = url; field.readOnly = true;
    field.addEventListener("focus", function () { field.select(); });
    wrap.appendChild(msg);
    wrap.appendChild(field);
    buildModal(t("share_deck_title"), wrap, [
      { label: t("close"), cls: "btn-primary", onClick: closeModal }
    ]);
    setTimeout(function () { field.focus(); field.select(); }, 30);
  }

  /* ============================================================
     MENU CONTEXTUEL (clic droit / bouton ⋯) sur un paquet
     ============================================================ */
  var ctxOpenId = null;

  function closeCtxMenu() {
    var m = $("#ctxMenu");
    m.hidden = true;
    m.innerHTML = "";
    ctxOpenId = null;
  }

  function openCtxMenu(deckId, x, y) {
    var deck = S.getDeck(deckId);
    if (!deck) return;
    var m = $("#ctxMenu");
    m.innerHTML = "";
    ctxOpenId = deckId;

    function item(label, iconSvg, cls, onClick) {
      var it = el("button", "ctx-item" + (cls ? " " + cls : ""));
      it.type = "button";
      it.setAttribute("role", "menuitem");
      it.innerHTML = iconSvg + "<span>" + label + "</span>";
      it.addEventListener("click", function (e) {
        e.stopPropagation();
        closeCtxMenu();
        onClick();
      });
      m.appendChild(it);
    }

    var starIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19l1-5.8L3.6 9.1l5.8-.8Z"/></svg>';
    var shareIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.4"/><circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="19" r="2.4"/><path d="M8.1 10.9 15.9 6.1M8.1 13.1l7.8 4.8"/></svg>';
    var trashIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13"/></svg>';

    item(deck.fav ? t("fav_remove") : t("fav_add"), starIcon, "", function () {
      var nowFav = S.toggleFav(deckId);
      Sfx.play(nowFav ? "good" : "click");
      toast(nowFav ? t("t_fav_added") : t("t_fav_removed"));
      renderHome();
    });
    item(t("share"), shareIcon, "", function () { shareDeck(deckId); });
    item(t("delete"), trashIcon, "ctx-danger", function () {
      confirmDialog(
        t("confirm_del_title"), delMsg(deck), t("delete"), true,
        function () { S.deleteDeck(deckId); toast(t("t_deck_deleted")); Sfx.play("click"); renderHome(); }
      );
    });

    // Positionnement : on garde le menu dans la fenêtre.
    m.hidden = false;
    var mw = m.offsetWidth, mh = m.offsetHeight;
    var px = Math.min(x, window.innerWidth - mw - 8);
    var py = Math.min(y, window.innerHeight - mh - 8);
    m.style.left = Math.max(8, px) + "px";
    m.style.top = Math.max(8, py) + "px";
  }

  function renderHome() {
    var decks = S.allDecks();
    var grid = $("#deckGrid");
    var empty = decks.length === 0;

    // La grille et son en-tête n'apparaissent qu'une fois un paquet créé.
    $("#decksHead").hidden = empty;
    grid.hidden = empty;
    // Le titre de la section matières s'adapte à l'état.
    $("#subjectHead").textContent = empty ? t("subject_head_empty") : t("subject_head_more");

    grid.innerHTML = "";
    if (!empty) {
      decks.forEach(function (d) { grid.appendChild(deckCard(d)); });
      var add = el("button", "deck-add");
      add.type = "button";
      add.innerHTML = "<b>+</b>";
      add.appendChild(el("span", null, t("new_deck_tile")));
      add.addEventListener("click", function () { go("#/new"); });
      grid.appendChild(add);
    }

    /* Bandeau de statistiques */
    var totalCards = decks.reduce(function (n, d) { return n + d.cards.length; }, 0);
    var mastered = decks.reduce(function (n, d) { return n + S.deckProgress(d).ok; }, 0);
    var strip = $("#statsStrip");
    strip.innerHTML = "";
    if (decks.length) {
      [
        [decks.length, tn("lbl_decks", decks.length)],
        [totalCards, tn("lbl_cards", totalCards)],
        [mastered, tn("lbl_mastered", mastered)],
        [S.state().stats.streak, tn("lbl_streak", S.state().stats.streak)]
      ].forEach(function (p) {
        var s = el("div", "stat");
        s.appendChild(el("b", null, String(p[0])));
        s.appendChild(el("span", null, p[1]));
        strip.appendChild(s);
      });
    }

    /* Carte « à réviser aujourd'hui » */
    var due = S.allDueCount();
    var dueCard = $("#dueCard");
    if (due > 0) {
      dueCard.hidden = false;
      $("#dueNum").textContent = String(due);
      $("#dueLabel").textContent = window.tnRaw(curLang(), "due_label", due).replace(/^\d+\s*/, "");
    } else {
      dueCard.hidden = true;
    }

    renderProgress();
    renderSubjectTiles();
    // La sauvegarde n'a de sens qu'une fois au moins un paquet créé.
    $("#backupBlock").hidden = empty;
    $("#backupFallback").hidden = true;
    screen("home");
  }

  /* ============================================================
     PAQUET
     ============================================================ */
  var currentDeckId = null;

  function renderDeck(id) {
    var d = S.getDeck(id);
    if (!d) { toast(t("t_deck_gone")); go("#/"); return; }
    currentDeckId = id;

    $("#deckTag").textContent = subjLabel(d.subject);
    $("#deckTag").className = "tag tag-" + (d.subject || "autre");
    $("#deckTitle").textContent = d.name;

    var due = S.dueCount(d);
    $("#deckMeta").textContent = tn("n_cards", d.cards.length) +
      (due ? " · " + due + " " + t("to_review_now") : " · " + t("nothing_due_short"));

    var prog = S.deckProgress(d);
    $("#deckProgFill").style.width = prog.pct + "%";
    $("#deckProgLegend").textContent =
      prog.ok + " " + tn("lbl_mastered", prog.ok) + " · " +
      prog.learn + " " + t("in_progress_word") + " · " +
      prog.fresh + " " + tn("lbl_fresh", prog.fresh);

    $("#modeReviewBadge").textContent = due ? String(due) : "";
    $("#cardCount").textContent = tn("n_cards", d.cards.length);

    var list = $("#cardList");
    list.innerHTML = "";
    var canSpeak = speakReady();
    d.cards.forEach(function (c) {
      var li = el("li");
      li.setAttribute("data-level", S.level(c));
      li.appendChild(el("span", "cl-term", c.t));
      li.appendChild(el("span", "cl-def", c.d));
      if (canSpeak) {
        var sp = el("button", "cl-speak");
        sp.type = "button";
        sp.title = t("speak_hint");
        sp.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/></svg>';
        sp.addEventListener("click", function (e) {
          e.stopPropagation();
          speakText(c.t + ". " + c.d);
        });
        li.appendChild(sp);
      }
      list.appendChild(li);
    });

    screen("deck");
  }

  /* ============================================================
     ÉDITEUR
     ============================================================ */
  var editState = { id: null, rows: [] };

  function editRow(term, def) {
    var li = el("li");
    var t = el("input", "inp");
    t.type = "text"; t.value = term || ""; t.placeholder = tr("ph_term");
    t.maxLength = 300;
    var dd = el("input", "inp");
    dd.type = "text"; dd.value = def || ""; dd.placeholder = tr("ph_def");
    dd.maxLength = 900;
    var del = el("button", "row-del", "✕");
    del.type = "button";
    del.title = tr("row_del_title");
    del.addEventListener("click", function () {
      li.remove();
      refreshEditCount();
    });
    li.appendChild(t); li.appendChild(dd); li.appendChild(del);
    return li;
  }

  function refreshEditCount() {
    var n = $$("#editList li").length;
    $("#editCount").textContent = tn("n_cards", n);
  }

  function renderSubjectPills(selected) {
    var row = $("#subjectRow");
    row.innerHTML = "";
    $("#deckSubjectInput").value = selected || "autre";
    window.SUBJECTS.forEach(function (s) {
      var b = el("button", "subj-pill", subjLabel(s.k));
      b.type = "button";
      b.setAttribute("aria-pressed", String(s.k === (selected || "autre")));
      b.addEventListener("click", function () {
        $("#deckSubjectInput").value = s.k;
        $$(".subj-pill", row).forEach(function (o) { o.setAttribute("aria-pressed", "false"); });
        b.setAttribute("aria-pressed", "true");
      });
      row.appendChild(b);
    });
  }

  function renderEdit(id, initialSubject, openScan) {
    editState.id = id || null;
    var list = $("#editList");
    list.innerHTML = "";

    if (id) {
      var d = S.getDeck(id);
      if (!d) { go("#/"); return; }
      $("#editHeading").textContent = tr("edit_heading_edit");
      $("#deckNameInput").value = d.name;
      renderSubjectPills(d.subject);
      d.cards.forEach(function (c) { list.appendChild(editRow(c.t, c.d)); });
      $("#pasteBox").open = false;
    } else {
      $("#editHeading").textContent = tr("edit_heading_new");
      $("#deckNameInput").value = "";
      renderSubjectPills(initialSubject || "autre");
      for (var i = 0; i < 3; i++) list.appendChild(editRow("", ""));
      $("#pasteBox").open = true;
    }

    $("#pasteArea").value = "";
    $("#pastePreview").textContent = "";
    $("#pastePreview").className = "paste-preview";
    // Réinitialise le panneau scan
    if ($("#scanText")) $("#scanText").value = "";
    if ($("#scanPhotos")) {
      $$("#scanPhotos img").forEach(function (im) { try { URL.revokeObjectURL(im.src); } catch (e) {} });
      $("#scanPhotos").innerHTML = ""; $("#scanPhotos").hidden = true;
    }
    if ($("#scanStatus")) { $("#scanStatus").hidden = true; $("#scanStatus").textContent = ""; }
    if ($("#scanPreview")) $("#scanPreview").textContent = "";
    if ($("#scanBox")) $("#scanBox").open = !!openScan;
    if (openScan && $("#pasteBox")) $("#pasteBox").open = false;
    refreshEditCount();
    screen("edit");
    if (openScan && $("#scanBox")) $("#scanBox").scrollIntoView({ block: "center" });
  }

  /* ============================================================
     MINUTEUR D'ÉTUDE (Pomodoro)
     ============================================================ */
  var PRESETS = [{ work: 25, brk: 5 }, { work: 50, brk: 10 }, { work: 15, brk: 3 }];
  var timer = { running: false, phase: "work", preset: PRESETS[0], endAt: 0, remaining: PRESETS[0].work * 60000, cycles: 0 };
  var timerLoop = null;
  var TC = 2 * Math.PI * 98;

  function phaseTotalMs() { return (timer.phase === "work" ? timer.preset.work : timer.preset.brk) * 60000; }

  function fmtClock(ms) {
    var s = Math.max(0, Math.round(ms / 1000));
    var m = Math.floor(s / 60);
    return (m < 10 ? "0" : "") + m + ":" + ((s % 60) < 10 ? "0" : "") + (s % 60);
  }

  function updateTimerUI() {
    var rem = timer.running ? Math.max(0, timer.endAt - Date.now()) : timer.remaining;
    $("#timerClock").textContent = fmtClock(rem);
    $("#timerPhase").textContent = t(timer.phase === "work" ? "timer_work" : "timer_break");
    var arc = $("#timerArc");
    arc.style.strokeDasharray = TC;
    arc.style.strokeDashoffset = TC * (1 - rem / phaseTotalMs());
    $("#timerCard").classList.toggle("is-break", timer.phase === "break");
    $("#timerCard").classList.toggle("running", timer.running);
    $("#timerStart").textContent = timer.running ? t("timer_pause") : (timer.remaining < phaseTotalMs() ? t("timer_resume") : t("timer_start"));
    $("#timerCycles").textContent = timer.cycles ? tn("n_cycles", timer.cycles) : "";
  }

  function timerTick() {
    if (!timer.running) return;
    if (Date.now() >= timer.endAt) { advancePhase(); return; }
    updateTimerUI();
  }

  function advancePhase() {
    var wasWork = timer.phase === "work";
    if (wasWork) {
      Sfx.play("chime");
      timer.cycles += 1;
      var lvlBefore = S.levelInfo().level;
      S.focusDone();
      var fresh = S.refreshBadges();
      toast(t("timer_done_work"));
      if (S.levelInfo().level > lvlBefore) {
        setTimeout(function () { toast(t("level_up").replace("{n}", S.levelInfo().level)); Sfx.play("levelup"); }, 2900);
      }
      fresh.forEach(function (id, i) {
        setTimeout(function () { toast(t("badge_new") + " " + t("b_" + id + "_n")); Sfx.play("badge"); }, 2900 * (i + 2));
      });
      timer.phase = "break";
    } else {
      Sfx.play("good");
      toast(t("timer_done_break"));
      timer.phase = "work";
    }
    timer.remaining = phaseTotalMs();
    timer.endAt = Date.now() + timer.remaining;
    updateTimerUI();
  }

  function startTimer() {
    if (timer.running) { pauseTimer(); return; }
    timer.running = true;
    timer.endAt = Date.now() + timer.remaining;
    if (!timerLoop) timerLoop = setInterval(timerTick, 250);
    Sfx.play("click");
    updateTimerUI();
  }
  function stopLoop() { if (timerLoop) { clearInterval(timerLoop); timerLoop = null; } }
  function pauseTimer() {
    if (!timer.running) return;
    timer.remaining = Math.max(0, timer.endAt - Date.now());
    timer.running = false;
    stopLoop();
    updateTimerUI();
  }
  function resetTimer() {
    timer.running = false;
    timer.phase = "work";
    timer.remaining = phaseTotalMs();
    stopLoop();
    updateTimerUI();
  }
  function setPreset(idx) {
    timer.preset = PRESETS[idx] || PRESETS[0];
    timer.running = false;
    timer.phase = "work";
    timer.remaining = phaseTotalMs();
    $$("#timerPresets .preset").forEach(function (b, i) { b.setAttribute("aria-pressed", String(i === idx)); });
    updateTimerUI();
  }

  function initTimer() {
    var pres = $("#timerPresets");
    PRESETS.forEach(function (pr, i) {
      var b = el("button", "preset", pr.work + " / " + pr.brk);
      b.type = "button";
      b.setAttribute("aria-pressed", String(i === 0));
      b.addEventListener("click", function () { setPreset(i); Sfx.play("click"); });
      pres.appendChild(b);
    });
    $("#timerStart").addEventListener("click", startTimer);
    $("#timerReset").addEventListener("click", function () { resetTimer(); Sfx.play("click"); });
    $("#timerBack").addEventListener("click", function () { pauseTimer(); go("#/"); });
  }

  function renderTimer() {
    updateTimerUI();
    screen("timer");
  }

  function collectRows() {
    var out = [];
    $$("#editList li").forEach(function (li) {
      var ins = $$("input", li);
      var t = ins[0].value.trim(), d = ins[1].value.trim();
      if (t && d) out.push([t, d]);
    });
    return out;
  }

  /* Import partagé (collage ET scan) : texte → lignes de cartes dans l'éditeur. */
  function importTextToRows(text, forcedSep, clearSel, previewSel, boxSel) {
    var r = S.parsePaste(text, forcedSep || null);
    if (!r.pairs.length) { toast(tr("t_no_card")); return; }
    var list = $("#editList");
    $$("#editList li").forEach(function (li) {
      var ins = $$("input", li);
      if (!ins[0].value.trim() && !ins[1].value.trim()) li.remove();
    });
    r.pairs.forEach(function (p) { list.appendChild(editRow(p[0], p[1])); });
    if (clearSel && $(clearSel)) $(clearSel).value = "";
    if (previewSel && $(previewSel)) { $(previewSel).textContent = ""; $(previewSel).className = "paste-preview"; }
    if (boxSel && $(boxSel)) $(boxSel).open = false;
    refreshEditCount();
    Sfx.play("good");
    toast(tn("n_added", r.pairs.length));
  }

  /* ---------- méthode « Scanner une photo » ---------- */
  function initScan() {
    var input = $("#scanInput"), photos = $("#scanPhotos"), status = $("#scanStatus"), area = $("#scanText");
    if (!input) return;

    $("#scanPick").addEventListener("click", function () { input.click(); });

    input.addEventListener("change", function () {
      var files = Array.prototype.slice.call(input.files || []);
      input.value = ""; // permet de re-choisir le même fichier
      files.forEach(handleScanFile);
    });

    $("#scanApply").addEventListener("click", function () {
      importTextToRows(area.value, null, "#scanText", "#scanPreview", "#scanBox");
    });

    function handleScanFile(file) {
      if (!file || !/^image\//.test(file.type || "")) { toast(tr("scan_not_image")); return; }
      // Miniature de la photo (toujours visible, même si la lecture échoue).
      photos.hidden = false;
      var url = URL.createObjectURL(file);
      var fig = el("figure", "scan-photo");
      var img = document.createElement("img");
      img.src = url; img.alt = "";
      var rm = el("button", "scan-photo-rm", "✕");
      rm.type = "button"; rm.title = tr("scan_remove_photo");
      rm.addEventListener("click", function (e) {
        e.stopPropagation();
        URL.revokeObjectURL(url);
        fig.remove();
        if (!photos.children.length) photos.hidden = true;
      });
      fig.appendChild(img); fig.appendChild(rm);
      photos.appendChild(fig);

      status.hidden = false;
      status.textContent = tr("scan_reading");
      status.className = "scan-status busy";

      window.Scan.recognize(file, {
        lang: curLang(),
        onProgress: function (engine, p) {
          status.textContent = tr("scan_reading") + (p ? " " + Math.round(p * 100) + "%" : "");
        }
      }).then(function (res) {
        if (res.text) {
          area.value = (area.value ? area.value.replace(/\s*$/, "") + "\n" : "") + res.text;
          status.textContent = tr(res.engine === "ai" ? "scan_engine_ai" : "scan_engine_ocr");
          status.className = "scan-status ok";
          Sfx.play("good");
        } else {
          status.textContent = tr("scan_failed");
          status.className = "scan-status warn";
          Sfx.play("click");
          area.focus();
        }
      }).catch(function () {
        status.textContent = tr("scan_failed");
        status.className = "scan-status warn";
      });
    }
  }

  function initEditor() {
    $("#addCardBtn").addEventListener("click", function () {
      var li = editRow("", "");
      $("#editList").appendChild(li);
      $$("input", li)[0].focus();
      refreshEditCount();
    });

    $("#editBack").addEventListener("click", function () {
      go(editState.id ? "#/d/" + editState.id : "#/");
    });

    /* Aperçu en direct du collage */
    function previewPaste() {
      var txt = $("#pasteArea").value;
      var sep = $("#sepSelect").value;
      var p = $("#pastePreview");
      if (!txt.trim()) { p.textContent = ""; p.className = "paste-preview"; return; }
      var r = S.parsePaste(txt, sep === "auto" ? null : sep);
      if (!r.pairs.length) {
        p.textContent = tr("paste_none");
        p.className = "paste-preview warn";
      } else {
        var sepTxt = r.seps.length > 1 ? tr("sep_mixed") : (tr("sep_which") + sepName(r.seps[0]));
        p.textContent = "✓ " + tn("n_cards", r.pairs.length) + " · " + sepTxt +
          (r.skipped ? " · " + tn("n_skipped", r.skipped) : "");
        p.className = "paste-preview ok";
      }
    }
    $("#pasteArea").addEventListener("input", previewPaste);
    $("#sepSelect").addEventListener("change", previewPaste);

    $("#pasteApply").addEventListener("click", function () {
      var sep = $("#sepSelect").value;
      importTextToRows($("#pasteArea").value, sep === "auto" ? null : sep, "#pasteArea", "#pastePreview", "#pasteBox");
    });

    initScan();

    $("#saveDeckBtn").addEventListener("click", function () {
      var name = $("#deckNameInput").value.trim();
      var subject = $("#deckSubjectInput").value || "autre";
      var pairs = collectRows();
      if (!name) { toast(tr("t_need_name")); $("#deckNameInput").focus(); return; }
      if (!pairs.length) { toast(tr("t_need_card")); return; }

      if (editState.id) {
        var d = S.getDeck(editState.id);
        // On conserve la progression des cartes dont le terme n'a pas changé.
        var byTerm = {};
        d.cards.forEach(function (c) { byTerm[c.t] = c; });
        var cards = pairs.map(function (p) {
          var old = byTerm[p[0]];
          if (old) { old.d = p[1]; return old; }
          return S.newCard(p[0], p[1]);
        });
        S.updateDeck(editState.id, { name: name, subject: subject, cards: cards });
        toast(tr("t_saved"));
        go("#/d/" + editState.id);
      } else {
        var nd = S.createDeck(name, subject, pairs);
        Sfx.play("done");
        toast(tr("t_created"));
        go("#/d/" + nd.id);
      }
    });
  }

  /* ============================================================
     SESSION D'ÉTUDE
     ============================================================ */
  var sess = null;

  function paneOnly(name) {
    ["flash", "mcq", "write", "match", "tf", "sheet"].forEach(function (p) {
      $("#pane-" + p).hidden = (p !== name);
    });
  }

  function studyProgress() {
    if (!sess) return;
    var total = sess.total || sess.queue.length || 1;
    var done = Math.min(sess.i, total);
    $("#studyProgFill").style.width = Math.round((done / total) * 100) + "%";
    $("#studyCount").textContent = Math.min(sess.i + 1, total) + " / " + total;
  }

  function startStudy(deckId, mode) {
    var deck = deckId === "all" ? null : S.getDeck(deckId);
    var items;

    if (mode === "review") {
      items = deck ? S.dueCards(deck).slice() : S.globalQueue().map(function (q) { return q.card; });
      if (!items.length) {
        toast(tr("t_nothing_due"));
        go(deck ? "#/d/" + deckId : "#/");
        return;
      }
      items = shuffle(items);
    } else {
      if (!deck) { go("#/"); return; }
      items = shuffle(deck.cards.slice());
    }

    if (!items.length) { toast(tr("t_empty_deck")); go("#/d/" + deckId); return; }

    if ((mode === "mcq" || mode === "match") && items.length < 4) {
      toast(tr("t_need_4"));
      go("#/d/" + deckId);
      return;
    }
    if (mode === "truefalse" && items.length < 2) {
      toast(tr("t_need_more"));
      go("#/d/" + deckId);
      return;
    }

    sess = {
      mode: mode,
      deckId: deckId,
      deckName: deck ? deck.name : tr("all_cards"),
      queue: items,
      total: items.length,
      i: 0,
      right: 0,
      wrong: 0,
      missed: [],
      answered: false,
      goalWasReached: S.dailyProgress().reached,
      levelBefore: S.levelInfo().level,
      startedAt: Date.now()
    };

    screen("study");
    // En mode Fiche (lecture), on masque la progression mais on garde le bouton Quitter.
    $("#screen-study").classList.toggle("is-sheet", mode === "sheet");
    if (mode === "review" || mode === "flash") startFlash();
    else if (mode === "mcq") startMcq();
    else if (mode === "write") startWrite();
    else if (mode === "match") startMatch();
    else if (mode === "truefalse") startTF();
    else if (mode === "sheet") startSheet();
  }

  function endStudy() {
    if (!sess) { go("#/"); return; }
    S.save();
    var secs = Math.round((Date.now() - sess.startedAt) / 1000);
    var total = sess.mode === "match" ? sess.total : sess.right + sess.wrong;
    var pct = total ? Math.round((sess.right / total) * 100) : 0;

    var emoji, title;
    if (sess.mode === "flash") { emoji = "📚"; title = tr("done_flash"); }
    else if (sess.mode === "review") { emoji = "🧠"; title = tr("done_review"); }
    else if (pct >= 90) { emoji = "🏆"; title = tr("res_excellent"); }
    else if (pct >= 70) { emoji = "👏"; title = tr("res_good"); }
    else if (pct >= 45) { emoji = "💪"; title = tr("res_progress"); }
    else { emoji = "🌱"; title = tr("res_retry"); }

    $("#resultEmoji").textContent = emoji;
    $("#resultTitle").textContent = title;
    $("#resultSub").textContent = sess.deckName;

    var stats = $("#resultStats");
    stats.innerHTML = "";
    function stat(v, l) {
      var s = el("div", "stat");
      s.appendChild(el("b", null, String(v)));
      s.appendChild(el("span", null, l));
      stats.appendChild(s);
    }
    if (sess.mode === "flash") {
      stat(sess.total, tr("cards_seen"));
    } else if (sess.mode === "review") {
      stat(sess.total, tr("cards_reviewed"));
      stat(sess.right, tr("known"));
      stat(sess.wrong, tr("to_revise"));
    } else {
      stat(sess.right, tr("correct_answers"));
      stat(sess.wrong, tr("errors"));
      stat(pct + "%", tr("success_rate"));
    }
    stat(secs < 60 ? secs + " " + tr("unit_sec") : Math.floor(secs / 60) + " " + tr("unit_min") + " " + (secs % 60) + " " + tr("unit_sec"), tr("work_time"));
    if (sess.mode !== "flash") {
      var earnedXP = sess.right * 10 + sess.wrong * 3;
      if (earnedXP > 0) stat("+" + earnedXP, tr("xp_gain"));
    }

    var missedBox = $("#resultMissed"), missedList = $("#missedList");
    missedList.innerHTML = "";
    if (sess.missed.length) {
      missedBox.hidden = false;
      var seen = {};
      sess.missed.forEach(function (c) {
        if (seen[c.id]) return;
        seen[c.id] = 1;
        var li = el("li");
        li.appendChild(el("b", null, c.t));
        li.appendChild(el("span", null, c.d));
        missedList.appendChild(li);
      });
    } else {
      missedBox.hidden = true;
    }

    // Récompenses : montée de niveau + objectif du jour + nouveaux badges.
    var goalNow = S.dailyProgress().reached;
    var freshBadges = S.refreshBadges();
    var levelNow = S.levelInfo().level;
    var celebrations = [];
    if (levelNow > (sess.levelBefore || 1)) celebrations.push({ msg: t("level_up").replace("{n}", levelNow), sfx: "levelup" });
    if (!sess.goalWasReached && goalNow) celebrations.push({ msg: t("goal_today_reached"), sfx: "good" });
    freshBadges.forEach(function (id) { celebrations.push({ msg: t("badge_new") + " " + t("b_" + id + "_n"), sfx: "badge" }); });

    Sfx.play("done");
    screen("result");

    // On enchaîne les petits messages (et leur son) après l'arrivée sur le résultat.
    celebrations.forEach(function (c, i) {
      setTimeout(function () { toast(c.msg); Sfx.play(c.sfx); }, 800 + i * 2900);
    });
  }

  /* ---------- Flashcards / révision ---------- */
  function startFlash() {
    paneOnly("flash");
    var grading = sess.mode === "review";
    $("#gradeRow").hidden = !grading;
    $("#simpleRow").hidden = grading;
    renderFlash();
  }

  function renderFlash() {
    if (sess.i >= sess.queue.length) { endStudy(); return; }
    var c = sess.queue[sess.i];
    $("#flip").classList.remove("flipped");
    $("#flashFront").textContent = c.t;
    $("#flashBack").textContent = c.d;
    var canSpeak = speakReady();
    $("#speakFront").hidden = !canSpeak;
    $("#speakBack").hidden = !canSpeak;
    if (sess.mode === "review") {
      $("#gradeRow").hidden = true;
      $("#gHard").textContent = S.previewInterval(c, 3, curLang());
      $("#gGood").textContent = S.previewInterval(c, 4, curLang());
      $("#gEasy").textContent = S.previewInterval(c, 5, curLang());
    }
    studyProgress();
  }

  function flipCard() {
    var f = $("#flip");
    var was = f.classList.contains("flipped");
    f.classList.toggle("flipped");
    Sfx.play("flip");
    if (!was && sess && sess.mode === "review") $("#gradeRow").hidden = false;
  }

  function initFlash() {
    $("#flip").addEventListener("click", flipCard);

    // Haut-parleurs : lisent le terme / la définition sans retourner la carte.
    $("#speakFront").addEventListener("click", function (e) {
      e.stopPropagation();
      if (sess && sess.queue[sess.i]) speakText(sess.queue[sess.i].t);
    });
    $("#speakBack").addEventListener("click", function (e) {
      e.stopPropagation();
      if (sess && sess.queue[sess.i]) speakText(sess.queue[sess.i].d);
    });

    $$("#gradeRow .btn-grade").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!sess) return;
        var q = parseInt(b.getAttribute("data-q"), 10);
        var c = sess.queue[sess.i];
        S.grade(c, q);
        if (q < 3) {
          sess.wrong++; S.award(false);
          sess.missed.push(c);
          // La carte ratée repasse plus loin dans la même session.
          sess.queue.push(c);
          sess.total = sess.queue.length;
        } else {
          sess.right++; S.award(true);
        }
        Sfx.play(q < 3 ? "bad" : "good");
        sess.i++;
        renderFlash();
      });
    });

    $("#flashNext").addEventListener("click", function () {
      if (!sess) return;
      sess.i++;
      renderFlash();
    });
    $("#flashPrev").addEventListener("click", function () {
      if (!sess || sess.i === 0) return;
      sess.i--;
      renderFlash();
    });
  }

  /* ---------- QCM ---------- */
  function startMcq() { paneOnly("mcq"); renderMcq(); }

  function renderMcq() {
    if (sess.i >= sess.queue.length) { endStudy(); return; }
    sess.answered = false;
    var c = sess.queue[sess.i];
    var deck = S.getDeck(sess.deckId);
    var pool = deck.cards.filter(function (x) { return x.id !== c.id && x.d; });
    var wrong = shuffle(pool).slice(0, 3);
    var opts = shuffle([c].concat(wrong));

    $("#mcqPrompt").textContent = c.t;
    var box = $("#mcqOpts");
    box.innerHTML = "";
    opts.forEach(function (o, idx) {
      var b = el("button", "opt", o.d);
      b.type = "button";
      b.setAttribute("data-key", String(idx + 1));
      b.setAttribute("data-id", o.id);
      b.addEventListener("click", function () { answerMcq(b, o.id === c.id, c); });
      box.appendChild(b);
    });
    studyProgress();
  }

  function answerMcq(btn, correct, card) {
    if (sess.answered) return;
    sess.answered = true;
    var opts = $$("#mcqOpts .opt");
    opts.forEach(function (o) {
      o.disabled = true;
      if (o.getAttribute("data-id") === card.id) o.classList.add("good");
      else if (o !== btn) o.classList.add("dim");
    });
    if (correct) {
      sess.right++; S.award(true);
      S.grade(card, 4);
      Sfx.play("good");
    } else {
      btn.classList.add("bad");
      sess.wrong++; S.award(false);
      sess.missed.push(card);
      S.grade(card, 1);
      Sfx.play("bad");
    }
    setTimeout(function () {
      if (!sess) return;
      sess.i++;
      renderMcq();
    }, correct ? 620 : 1550);
  }

  /* ---------- Écrire ---------- */
  function startWrite() {
    paneOnly("write");
    renderWrite();
  }

  function renderWrite() {
    if (sess.i >= sess.queue.length) { endStudy(); return; }
    sess.answered = false;
    var c = sess.queue[sess.i];
    $("#writePrompt").textContent = c.d;
    var inp = $("#writeInput");
    inp.value = "";
    inp.disabled = false;
    $("#writeSubmit").disabled = false;
    $("#writeFeedback").hidden = true;
    $("#writeSkip").hidden = false;
    studyProgress();
    setTimeout(function () { inp.focus(); }, 40);
  }

  function resolveWrite(verdict, card) {
    sess.answered = true;
    var fb = $("#writeFeedback");
    $("#writeInput").disabled = true;
    $("#writeSubmit").disabled = true;
    $("#writeSkip").hidden = true;
    fb.hidden = false;
    fb.innerHTML = "";

    if (verdict === "exact" || verdict === "close") {
      fb.className = "write-feedback good";
      fb.appendChild(el("b", null, verdict === "close" ? tr("fb_almost") : tr("fb_correct")));
      fb.appendChild(document.createTextNode(card.t));
      sess.right++; S.award(true);
      S.grade(card, verdict === "close" ? 3 : 5);
      Sfx.play("good");
    } else {
      fb.className = "write-feedback bad";
      fb.appendChild(el("b", null, tr("fb_wrong")));
      fb.appendChild(document.createTextNode(card.t));
      sess.wrong++; S.award(false);
      sess.missed.push(card);
      S.grade(card, 1);
      Sfx.play("bad");
    }

    setTimeout(function () {
      if (!sess) return;
      sess.i++;
      renderWrite();
    }, verdict === "no" ? 1900 : 950);
  }

  function initWrite() {
    $("#writeForm").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!sess || sess.answered) return;
      var c = sess.queue[sess.i];
      var v = checkAnswer($("#writeInput").value, c.t);
      if (v === "no" && !$("#writeInput").value.trim()) return;
      resolveWrite(v, c);
    });
    $("#writeSkip").addEventListener("click", function () {
      if (!sess || sess.answered) return;
      resolveWrite("no", sess.queue[sess.i]);
    });
  }

  /* ---------- Associer ---------- */
  function startMatch() {
    paneOnly("match");
    sess.round = 0;
    sess.matched = 0;
    renderMatchRound();
  }

  /* Sur un écran étroit, 12 tuiles obligent à faire défiler pendant la
     manche : on descend à 4 paires pour que tout tienne à l'écran. */
  function perRound() { return window.innerWidth < 620 ? 4 : 6; }

  function renderMatchRound() {
    var per = sess.per || (sess.per = perRound());
    var start = sess.round * per;
    var chunk = sess.queue.slice(start, start + per);
    if (chunk.length < 2) { endStudy(); return; }

    sess.pending = null;
    sess.left = chunk.length;

    var grid = $("#matchGrid");
    grid.innerHTML = "";

    var tiles = [];
    chunk.forEach(function (c) {
      tiles.push({ id: c.id, kind: "term", text: c.t, card: c });
      tiles.push({ id: c.id, kind: "def", text: c.d, card: c });
    });

    shuffle(tiles).forEach(function (t) {
      var b = el("button", "mtile " + t.kind, t.text);
      b.type = "button";
      b.setAttribute("data-id", t.id);
      b.setAttribute("data-kind", t.kind);
      b.addEventListener("click", function () { pickTile(b, t); });
      grid.appendChild(b);
    });

    sess.i = start;
    sess.total = sess.queue.length;
    studyProgress();
  }

  function pickTile(btn, tile) {
    if (btn.classList.contains("gone") || btn.disabled) return;

    if (!sess.pending) {
      sess.pending = { btn: btn, tile: tile };
      btn.classList.add("sel");
      Sfx.play("click");
      return;
    }

    if (sess.pending.btn === btn) {
      btn.classList.remove("sel");
      sess.pending = null;
      return;
    }

    var a = sess.pending;
    a.btn.classList.remove("sel");

    // Deux tuiles de même nature : on bascule simplement la sélection.
    if (a.tile.kind === tile.kind) {
      sess.pending = { btn: btn, tile: tile };
      btn.classList.add("sel");
      Sfx.play("click");
      return;
    }

    if (a.tile.id === tile.id) {
      [a.btn, btn].forEach(function (n) {
        n.classList.add("gone");
        n.disabled = true;
      });
      sess.right++; S.award(true);
      sess.left--;
      sess.i++;
      Sfx.play("pair");
      studyProgress();
      sess.pending = null;
      if (sess.left <= 0) {
        setTimeout(function () {
          if (!sess) return;
          sess.round++;
          if (sess.round * sess.per >= sess.queue.length) endStudy();
          else renderMatchRound();
        }, 420);
      }
      return;
    }

    sess.wrong++; S.award(false);
    sess.missed.push(tile.kind === "term" ? tile.card : a.tile.card);
    Sfx.play("bad");
    [a.btn, btn].forEach(function (n) {
      n.classList.add("wrong");
      setTimeout(function () { n.classList.remove("wrong"); }, 360);
    });
    sess.pending = null;
  }

  /* ---------- Vrai ou faux ---------- */
  function startTF() { paneOnly("tf"); renderTF(); }

  function renderTF() {
    if (sess.i >= sess.queue.length) { endStudy(); return; }
    sess.answered = false;
    var c = sess.queue[sess.i];
    var deck = S.getDeck(sess.deckId);
    // Une fois sur deux : on montre la vraie définition ; sinon celle d'une autre carte.
    var showTrue = Math.random() < 0.5;
    var shownDef = c.d;
    if (!showTrue) {
      var others = deck.cards.filter(function (x) { return x.id !== c.id && x.d && x.d !== c.d; });
      if (!others.length) { showTrue = true; }
      else { shownDef = shuffle(others)[0].d; }
    }
    sess.tfTruth = showTrue;
    $("#tfTerm").textContent = c.t;
    $("#tfDef").textContent = shownDef;
    $("#tfTrue").disabled = false;
    $("#tfFalse").disabled = false;
    $("#tfTrue").classList.remove("good", "bad");
    $("#tfFalse").classList.remove("good", "bad");
    studyProgress();
  }

  function answerTF(saidTrue) {
    if (!sess || sess.answered) return;
    sess.answered = true;
    var c = sess.queue[sess.i];
    var correct = (saidTrue === sess.tfTruth);
    $("#tfTrue").disabled = true;
    $("#tfFalse").disabled = true;
    // On marque en vert le bon choix (Vrai/Faux), en rouge l'erreur.
    $(sess.tfTruth ? "#tfTrue" : "#tfFalse").classList.add("good");
    if (!correct) $(saidTrue ? "#tfTrue" : "#tfFalse").classList.add("bad");
    if (correct) { sess.right++; S.award(true); S.grade(c, 4); Sfx.play("good"); }
    else { sess.wrong++; S.award(false); sess.missed.push(c); S.grade(c, 1); Sfx.play("bad"); }
    setTimeout(function () { if (!sess) return; sess.i++; renderTF(); }, correct ? 640 : 1300);
  }

  function initTF() {
    $("#tfTrue").addEventListener("click", function () { answerTF(true); });
    $("#tfFalse").addEventListener("click", function () { answerTF(false); });
  }

  /* ---------- Fiche de révision (lecture) ---------- */
  function startSheet() {
    paneOnly("sheet");
    sess.hidden = false;
    var list = $("#sheetList");
    list.innerHTML = "";
    sess.queue.forEach(function (c) {
      var li = el("li", "sheet-row");
      li.appendChild(el("span", "sheet-term", c.t));
      var def = el("span", "sheet-def", c.d);
      li.appendChild(def);
      // Quand les définitions sont masquées, un clic révèle celle de la ligne.
      li.addEventListener("click", function () {
        if (sess.hidden) li.classList.toggle("revealed");
      });
      list.appendChild(li);
    });
    updateSheetToggle();
  }

  function updateSheetToggle() {
    var list = $("#sheetList");
    list.classList.toggle("masked", sess.hidden);
    $$(".sheet-row.revealed", list).forEach(function (r) { r.classList.remove("revealed"); });
    $("#sheetToggle").textContent = t(sess.hidden ? "sheet_show" : "sheet_hide");
    $("#sheetHint").hidden = !sess.hidden;
  }

  function initSheet() {
    $("#sheetToggle").addEventListener("click", function () {
      if (!sess) return;
      sess.hidden = !sess.hidden;
      updateSheetToggle();
      Sfx.play("click");
    });
  }

  /* ============================================================
     CLAVIER
     ============================================================ */
  function initKeys() {
    document.addEventListener("keydown", function (e) {
      if ($("#screen-study").hidden) return;
      var tag = (e.target.tagName || "").toLowerCase();
      var typing = tag === "input" || tag === "textarea";

      if (e.key === "Escape") { e.preventDefault(); quitStudy(); return; }
      if (typing) return;
      if (!sess) return;

      if (sess.mode === "review" || sess.mode === "flash") {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          if (sess.mode === "flash" && $("#flip").classList.contains("flipped")) {
            sess.i++; renderFlash();
          } else {
            flipCard();
          }
          return;
        }
        if (sess.mode === "review" && !$("#gradeRow").hidden && /^[1-4]$/.test(e.key)) {
          e.preventDefault();
          $$("#gradeRow .btn-grade")[parseInt(e.key, 10) - 1].click();
          return;
        }
        if (sess.mode === "flash") {
          if (e.key === "ArrowRight") { e.preventDefault(); sess.i++; renderFlash(); }
          if (e.key === "ArrowLeft" && sess.i > 0) { e.preventDefault(); sess.i--; renderFlash(); }
        }
      }

      if (sess.mode === "mcq" && /^[1-4]$/.test(e.key)) {
        e.preventDefault();
        var opts = $$("#mcqOpts .opt");
        var b = opts[parseInt(e.key, 10) - 1];
        if (b && !b.disabled) b.click();
      }

      if (sess.mode === "truefalse") {
        if (e.key === "ArrowLeft" || e.key.toLowerCase() === "v") { e.preventDefault(); if (!$("#tfTrue").disabled) $("#tfTrue").click(); }
        else if (e.key === "ArrowRight" || e.key.toLowerCase() === "f") { e.preventDefault(); if (!$("#tfFalse").disabled) $("#tfFalse").click(); }
      }
    });
  }

  function quitStudy() {
    var back = sess && sess.deckId && sess.deckId !== "all" ? "#/d/" + sess.deckId : "#/";
    S.save();
    sess = null;
    go(back);
  }

  /* ============================================================
     PARTAGE
     ============================================================ */
  function shareDeck(id) {
    var d = S.getDeck(id);
    if (!d) return;
    var code = S.encodeDeck(d);
    var url = location.origin + location.pathname + "#/s/" + code;

    if (url.length > 7500) {
      toast(tr("t_too_big"));
      return;
    }

    function fallback() {
      showLinkDialog(url);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        toast(tr("t_link_copied"));
        Sfx.play("good");
      }).catch(fallback);
    } else {
      fallback();
    }
  }

  function importShared(code) {
    var parsed = S.decodeDeck(code);
    if (!parsed) {
      toast(tr("t_link_invalid"));
      go("#/");
      return;
    }
    var d = S.createDeck(parsed.name, parsed.subject, parsed.pairs);
    Sfx.play("done");
    toast(tr("t_imported"));
    go("#/d/" + d.id);
  }

  /* ============================================================
     SAUVEGARDE — exporter / importer toutes les fiches (fichier .json)
     ============================================================ */
  function exportBackup() {
    var json = S.exportAll();
    var name = "bachote-" + new Date().toISOString().slice(0, 10) + ".json";
    var ok = false;
    try {
      var blob = new Blob([json], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url; a.download = name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { try { URL.revokeObjectURL(url); } catch (e) {} }, 4000);
      ok = true;
    } catch (e) { ok = false; }
    Sfx.play("click");
    if (ok) {
      toast(t("backup_exported"));
      $("#backupFallback").hidden = true;
    } else {
      // Téléchargement bloqué (aperçu / bac à sable) : on affiche le texte à copier.
      $("#backupText").value = json;
      $("#backupFallback").hidden = false;
      $("#backupFallback").scrollIntoView({ block: "center" });
    }
  }

  function importBackup(file) {
    if (!file) return;
    var r = new FileReader();
    r.onload = function () {
      var obj;
      try { obj = JSON.parse(String(r.result || "")); }
      catch (e) { toast(t("backup_bad_file")); Sfx.play("bad"); return; }
      var res;
      try { res = S.importAll(obj); }
      catch (e) { toast(t("backup_bad_file")); Sfx.play("bad"); return; }
      if (!res || !res.decks) { toast(t("backup_nothing")); Sfx.play("bad"); return; }
      Sfx.play("done");
      toast(t("backup_added") + " " + res.decks + " " + tn("lbl_decks", res.decks) +
            ", " + res.cards + " " + tn("lbl_cards", res.cards));
      renderHome();
    };
    r.onerror = function () { toast(t("backup_bad_file")); Sfx.play("bad"); };
    r.readAsText(file);
  }

  function initBackup() {
    $("#exportBtn").addEventListener("click", exportBackup);
    $("#importBtn").addEventListener("click", function () { $("#importFile").click(); });
    $("#importFile").addEventListener("change", function () {
      var f = this.files && this.files[0];
      importBackup(f);
      this.value = ""; // permet de réimporter le même fichier
    });
    $("#backupCopy").addEventListener("click", function () {
      var ta = $("#backupText");
      ta.select();
      var done = false;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ta.value).then(function () {
          toast(t("backup_copied")); Sfx.play("good");
        }).catch(function () { try { document.execCommand("copy"); toast(t("backup_copied")); } catch (e) {} });
        done = true;
      }
      if (!done) { try { document.execCommand("copy"); toast(t("backup_copied")); Sfx.play("good"); } catch (e) {} }
    });
  }

  /* ============================================================
     ACTIVITÉ — carte de chaleur des jours d'étude (façon calendrier)
     ============================================================ */
  var HM_WEEKS = 26; // ≈ 6 mois d'historique

  function heatBucket(n) {
    if (!n) return 0;
    if (n < 5) return 1;
    if (n < 15) return 2;
    if (n < 30) return 3;
    return 4;
  }

  function renderActivity() {
    var sum = S.activitySummary();
    var hist = sum.history || {};

    // Bandeau : série en cours, jours actifs, meilleur jour.
    var stats = $("#activityStats");
    stats.innerHTML = "";
    [
      [sum.streak, tn("lbl_streak", sum.streak)],
      [sum.total, t("activity_days")],
      [sum.best, t("activity_best")]
    ].forEach(function (p) {
      var s = el("div", "stat");
      s.appendChild(el("b", null, String(p[0])));
      s.appendChild(el("span", null, p[1]));
      stats.appendChild(s);
    });

    $("#activityEmpty").hidden = sum.total > 0;

    // Grille : HM_WEEKS colonnes (semaines) × 7 lignes (lundi → dimanche),
    // la dernière colonne se terminant sur la semaine courante.
    var box = $("#heatmap");
    box.innerHTML = "";
    var today = new Date();
    today.setHours(12, 0, 0, 0); // midi : évite les surprises de changement d'heure
    var todayKey = S.dayStamp(today.getTime());
    var dowMon = (today.getDay() + 6) % 7;              // 0 = lundi
    var startOffset = (HM_WEEKS - 1) * 7 + dowMon;      // recule au lundi de la 1re semaine
    var cursor = new Date(today);
    cursor.setDate(cursor.getDate() - startOffset);

    for (var col = 0; col < HM_WEEKS; col++) {
      var colEl = el("div", "hm-col");
      for (var row = 0; row < 7; row++) {
        var key = S.dayStamp(cursor.getTime());
        var future = cursor.getTime() > today.getTime();
        var n = hist[key] | 0;
        var cell = el("span", future ? "hm-cell hm-future" : "hm-cell l" + heatBucket(n));
        if (key === todayKey) cell.classList.add("hm-today");
        cell.title = future ? "" : (key + " · " + n + " " + tn("lbl_cards", n));
        colEl.appendChild(cell);
        cursor.setDate(cursor.getDate() + 1);
      }
      box.appendChild(colEl);
    }

    screen("activity");
    var scroll = $(".heatmap-scroll");
    if (scroll) scroll.scrollLeft = scroll.scrollWidth; // montre la période récente
  }

  /* ============================================================
     ROUTEUR
     ============================================================ */
  function go(hash) {
    if (location.hash === hash) route();
    else location.hash = hash;
  }

  function route() {
    var h = location.hash || "#/";
    var parts = h.replace(/^#\/?/, "").split("/");

    // On quitte proprement une session en cours si on change d'écran.
    if (parts[0] !== "study" && parts[0] !== "review" && sess) {
      S.save();
      sess = null;
    }
    // On met le minuteur en pause quand on quitte son écran.
    if (parts[0] !== "timer" && timer.running) pauseTimer();

    if (parts[0] === "" || parts[0] === undefined) { renderHome(); return; }
    if (parts[0] === "d" && parts[1]) { renderDeck(parts[1]); return; }
    if (parts[0] === "new") { renderEdit(null, parts[1] || null); return; }
    if (parts[0] === "scan") { renderEdit(null, null, true); return; }
    if (parts[0] === "timer") { renderTimer(); return; }
    if (parts[0] === "activity") { renderActivity(); return; }
    if (parts[0] === "edit" && parts[1]) { renderEdit(parts[1]); return; }
    if (parts[0] === "study" && parts[1] && parts[2]) { startStudy(parts[1], parts[2]); return; }
    if (parts[0] === "review") { startStudy("all", "review"); return; }
    if (parts[0] === "s" && parts[1]) { importShared(parts.slice(1).join("/")); return; }
    renderHome();
  }

  /* ============================================================
     DÉMARRAGE
     ============================================================ */
  function init() {
    initSettings();
    initLangMenu();
    applyStaticI18n();
    initEditor();
    initFlash();
    initWrite();
    initTF();
    initSheet();
    initKeys();

    $("#newDeckBtn").addEventListener("click", function () { go("#/new"); });
    $("#dueStart").addEventListener("click", function () { go("#/review"); });
    $("#goalBtn").addEventListener("click", cycleGoal);
    initTimer();
    initBackup();
    $("#toolScan").addEventListener("click", function () { go("#/scan"); });
    $("#toolTimer").addEventListener("click", function () { go("#/timer"); });
    $("#toolActivity").addEventListener("click", function () { go("#/activity"); });
    $("#activityBack").addEventListener("click", function () { go("#/"); });
    $("#toolCards").addEventListener("click", function () {
      var h = $("#decksHead"); var g = $("#deckGrid");
      var target = (h && !h.hidden) ? h : (g || null);
      if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
    $("#quitStudy").addEventListener("click", quitStudy);

    $$("[data-nav]").forEach(function (b) {
      b.addEventListener("click", function () { go(b.getAttribute("data-nav")); });
    });

    $$("#modeGrid .mode-card").forEach(function (b) {
      b.addEventListener("click", function () {
        go("#/study/" + currentDeckId + "/" + b.getAttribute("data-mode"));
      });
    });

    $("#editDeckBtn").addEventListener("click", function () { go("#/edit/" + currentDeckId); });
    $("#shareDeckBtn").addEventListener("click", function () { shareDeck(currentDeckId); });
    $("#delDeckBtn").addEventListener("click", function () {
      var d = S.getDeck(currentDeckId);
      if (!d) return;
      confirmDialog(
        tr("confirm_del_title"), delMsg(d), tr("delete"), true,
        function () { S.deleteDeck(currentDeckId); toast(tr("t_deck_deleted")); go("#/"); }
      );
    });

    $("#againBtn").addEventListener("click", function () {
      var m = sess ? sess.mode : "flash";
      var id = sess ? sess.deckId : currentDeckId;
      sess = null;
      go("#/study/" + id + "/" + m);
    });
    $("#backDeckBtn").addEventListener("click", function () {
      var id = sess && sess.deckId !== "all" ? sess.deckId : null;
      sess = null;
      go(id ? "#/d/" + id : "#/");
    });

    document.addEventListener("click", function (e) {
      if (ctxOpenId && !e.target.closest("#ctxMenu")) closeCtxMenu();
      if (!$("#langMenu").hidden && !e.target.closest(".lang-wrap")) closeLangMenu();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeCtxMenu(); closeModal(); closeLangMenu(); } });
    window.addEventListener("resize", closeCtxMenu);
    window.addEventListener("hashchange", function () { closeCtxMenu(); route(); });
    route();

    if (location.search.indexOf("debug") >= 0) {
      window.__bc = {
        Store: S, go: go, getSess: function () { return sess; },
        checkAnswer: checkAnswer, norm: norm,
        Speak: window.Speak, speakReady: speakReady,
        exportBackup: exportBackup, importBackup: importBackup,
        renderActivity: renderActivity
      };
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
