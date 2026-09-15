/* ============================================================
   BACHOTE — moteur de l'application
   ============================================================ */
(function () {
  "use strict";

  var S = window.Store, Sfx = window.Sfx;

  /* Icônes SVG de la barre (au lieu d'emoji, plus net et cohérent). */
  var IC = {
    soundOn:  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 6a8 8 0 0 1 0 12"/></svg>',
    soundOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z"/><path d="m16 9 5 6M21 9l-5 6"/></svg>',
    sun:      '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>',
    moon:     '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>'
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

  var SCREENS = ["home", "deck", "edit", "study", "result"];
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
    menuBtn.setAttribute("aria-label", "Options du paquet");
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

    var tag = el("span", "tag tag-" + (deck.subject || "autre"), window.SUBJECT_LABEL(deck.subject));
    b.appendChild(tag);
    b.appendChild(el("h3", "deck-name", deck.name));

    var due = S.dueCount(deck);
    var prog = S.deckProgress(deck);
    b.appendChild(el("p", "deck-sub", plural(deck.cards.length, "carte", "cartes") +
      (due ? " · " + due + " à réviser" : "")));

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

  /* ---------- tuiles de matières (points de départ, sans contenu imposé) ---------- */
  function renderSubjectTiles() {
    var grid = $("#subjectGrid");
    grid.innerHTML = "";
    window.SUBJECTS.forEach(function (subj) {
      if (subj.k === "autre") return; // "Autre" est proposé dans l'éditeur, pas ici
      var t = el("button", "subject-tile");
      t.type = "button";
      t.setAttribute("data-subj", subj.k);
      var tag = el("span", "tag tag-" + subj.k, subj.label);
      t.appendChild(tag);
      t.appendChild(el("span", "subject-plus", "+ Créer un paquet"));
      t.addEventListener("click", function () { go("#/new/" + subj.k); });
      grid.appendChild(t);
    });
    // Tuile "vierge" pour une matière libre
    var blank = el("button", "subject-tile subject-blank");
    blank.type = "button";
    blank.innerHTML = '<span class="subject-plus"><b>+</b> Paquet vierge</span>';
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
      { label: "Annuler", cls: "btn-ghost", onClick: closeModal },
      { label: confirmLabel, cls: danger ? "btn-primary btn-confirm-danger" : "btn-primary",
        onClick: function () { closeModal(); onConfirm(); } }
    ]);
    // Sur une action destructive, on met le focus sur « Annuler » : un appui
    // sur Entrée n'efface alors rien par mégarde.
    if (danger) { var first = card.querySelector(".modal-actions .btn"); if (first) first.focus(); }
  }

  function showLinkDialog(url) {
    var wrap = el("div");
    var msg = el("p", "modal-msg", "Copie ce lien et envoie-le à qui tu veux :");
    var field = el("input", "inp");
    field.type = "text"; field.value = url; field.readOnly = true;
    field.addEventListener("focus", function () { field.select(); });
    wrap.appendChild(msg);
    wrap.appendChild(field);
    buildModal("Partager le paquet", wrap, [
      { label: "Fermer", cls: "btn-primary", onClick: closeModal }
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

    item(deck.fav ? "Retirer des favoris" : "Mettre en favori", starIcon, "", function () {
      var nowFav = S.toggleFav(deckId);
      Sfx.play(nowFav ? "good" : "click");
      toast(nowFav ? "Ajouté aux favoris." : "Retiré des favoris.");
      renderHome();
    });
    item("Partager", shareIcon, "", function () { shareDeck(deckId); });
    item("Supprimer", trashIcon, "ctx-danger", function () {
      confirmDialog(
        "Supprimer ce paquet ?",
        "« " + deck.name + " » et ses " + deck.cards.length + " carte" + (deck.cards.length > 1 ? "s" : "") + " seront définitivement supprimés.",
        "Supprimer", true,
        function () { S.deleteDeck(deckId); toast("Paquet supprimé."); Sfx.play("click"); renderHome(); }
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
    $("#subjectHead").textContent = empty ? "Commence par une matière" : "Créer un nouveau paquet";

    grid.innerHTML = "";
    if (!empty) {
      decks.forEach(function (d) { grid.appendChild(deckCard(d)); });
      var add = el("button", "deck-add");
      add.type = "button";
      add.innerHTML = "<b>+</b>";
      add.appendChild(el("span", null, "Nouveau paquet"));
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
        [decks.length, decks.length > 1 ? "paquets" : "paquet"],
        [totalCards, totalCards > 1 ? "cartes" : "carte"],
        [mastered, "maîtrisées"],
        [S.state().stats.streak, S.state().stats.streak > 1 ? "jours d'affilée" : "jour d'affilée"]
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
      $("#dueLabel").textContent = due > 1 ? "cartes à réviser" : "carte à réviser";
    } else {
      dueCard.hidden = true;
    }

    renderSubjectTiles();
    screen("home");
  }

  /* ============================================================
     PAQUET
     ============================================================ */
  var currentDeckId = null;

  function renderDeck(id) {
    var d = S.getDeck(id);
    if (!d) { toast("Ce paquet n'existe plus."); go("#/"); return; }
    currentDeckId = id;

    $("#deckTag").textContent = window.SUBJECT_LABEL(d.subject);
    $("#deckTag").className = "tag tag-" + (d.subject || "autre");
    $("#deckTitle").textContent = d.name;

    var due = S.dueCount(d);
    $("#deckMeta").textContent = plural(d.cards.length, "carte", "cartes") +
      (due ? " · " + due + " à réviser maintenant" : " · rien à réviser pour l'instant");

    var prog = S.deckProgress(d);
    $("#deckProgFill").style.width = prog.pct + "%";
    $("#deckProgLegend").textContent =
      prog.ok + " maîtrisée" + (prog.ok > 1 ? "s" : "") + " · " +
      prog.learn + " en cours · " + prog.fresh + " jamais vue" + (prog.fresh > 1 ? "s" : "");

    $("#modeReviewBadge").textContent = due ? String(due) : "";
    $("#cardCount").textContent = plural(d.cards.length, "carte", "cartes");

    var list = $("#cardList");
    list.innerHTML = "";
    d.cards.forEach(function (c) {
      var li = el("li");
      li.setAttribute("data-level", S.level(c));
      li.appendChild(el("span", "cl-term", c.t));
      li.appendChild(el("span", "cl-def", c.d));
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
    t.type = "text"; t.value = term || ""; t.placeholder = "Mot ou terme";
    t.maxLength = 300;
    var dd = el("input", "inp");
    dd.type = "text"; dd.value = def || ""; dd.placeholder = "Sa définition";
    dd.maxLength = 900;
    var del = el("button", "row-del", "✕");
    del.type = "button";
    del.title = "Supprimer cette carte";
    del.addEventListener("click", function () {
      li.remove();
      refreshEditCount();
    });
    li.appendChild(t); li.appendChild(dd); li.appendChild(del);
    return li;
  }

  function refreshEditCount() {
    var n = $$("#editList li").length;
    $("#editCount").textContent = plural(n, "carte", "cartes");
  }

  function renderSubjectPills(selected) {
    var row = $("#subjectRow");
    row.innerHTML = "";
    $("#deckSubjectInput").value = selected || "autre";
    window.SUBJECTS.forEach(function (s) {
      var b = el("button", "subj-pill", s.label);
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

  function renderEdit(id, initialSubject) {
    editState.id = id || null;
    var list = $("#editList");
    list.innerHTML = "";

    if (id) {
      var d = S.getDeck(id);
      if (!d) { go("#/"); return; }
      $("#editHeading").textContent = "Modifier le paquet";
      $("#deckNameInput").value = d.name;
      renderSubjectPills(d.subject);
      d.cards.forEach(function (c) { list.appendChild(editRow(c.t, c.d)); });
      $("#pasteBox").open = false;
    } else {
      $("#editHeading").textContent = "Nouveau paquet";
      $("#deckNameInput").value = "";
      renderSubjectPills(initialSubject || "autre");
      for (var i = 0; i < 3; i++) list.appendChild(editRow("", ""));
      $("#pasteBox").open = true;
    }

    $("#pasteArea").value = "";
    $("#pastePreview").textContent = "";
    $("#pastePreview").className = "paste-preview";
    refreshEditCount();
    screen("edit");
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
        p.textContent = "Aucune ligne reconnue. Chaque ligne doit contenir un séparateur entre le mot et sa définition, par exemple « mitose : division cellulaire ».";
        p.className = "paste-preview warn";
      } else {
        var many = r.pairs.length > 1 ? "s" : "";
        var sepTxt = r.seps.length > 1
          ? "séparateurs mélangés, c'est géré"
          : "séparateur : " + S.sepLabel(r.seps[0]);
        p.textContent = r.pairs.length + " carte" + many + " détectée" + many +
          " (" + sepTxt + ")" +
          (r.skipped ? " · " + r.skipped + " ligne" + (r.skipped > 1 ? "s" : "") + " sans séparateur, ignorée" + (r.skipped > 1 ? "s" : "") : "");
        p.className = "paste-preview ok";
      }
    }
    $("#pasteArea").addEventListener("input", previewPaste);
    $("#sepSelect").addEventListener("change", previewPaste);

    $("#pasteApply").addEventListener("click", function () {
      var sep = $("#sepSelect").value;
      var r = S.parsePaste($("#pasteArea").value, sep === "auto" ? null : sep);
      if (!r.pairs.length) { toast("Aucune carte détectée dans ce texte."); return; }
      var list = $("#editList");
      // On enlève les lignes vides laissées par défaut.
      $$("#editList li").forEach(function (li) {
        var ins = $$("input", li);
        if (!ins[0].value.trim() && !ins[1].value.trim()) li.remove();
      });
      r.pairs.forEach(function (p) { list.appendChild(editRow(p[0], p[1])); });
      $("#pasteArea").value = "";
      $("#pastePreview").textContent = "";
      $("#pastePreview").className = "paste-preview";
      $("#pasteBox").open = false;
      refreshEditCount();
      Sfx.play("good");
      toast(r.pairs.length + " carte" + (r.pairs.length > 1 ? "s" : "") + " créée" + (r.pairs.length > 1 ? "s" : "") + ".");
    });

    $("#saveDeckBtn").addEventListener("click", function () {
      var name = $("#deckNameInput").value.trim();
      var subject = $("#deckSubjectInput").value || "autre";
      var pairs = collectRows();
      if (!name) { toast("Donne un nom à ton paquet."); $("#deckNameInput").focus(); return; }
      if (!pairs.length) { toast("Il faut au moins une carte complète (mot + définition)."); return; }

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
        toast("Paquet enregistré.");
        go("#/d/" + editState.id);
      } else {
        var nd = S.createDeck(name, subject, pairs);
        Sfx.play("done");
        toast("Paquet créé : " + plural(pairs.length, "carte", "cartes") + ".");
        go("#/d/" + nd.id);
      }
    });
  }

  /* ============================================================
     SESSION D'ÉTUDE
     ============================================================ */
  var sess = null;

  function paneOnly(name) {
    ["flash", "mcq", "write", "match"].forEach(function (p) {
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
        toast("Rien à réviser pour l'instant. Reviens plus tard, ou choisis un autre mode.");
        go(deck ? "#/d/" + deckId : "#/");
        return;
      }
      items = shuffle(items);
    } else {
      if (!deck) { go("#/"); return; }
      items = shuffle(deck.cards.slice());
    }

    if (!items.length) { toast("Ce paquet est vide."); go("#/d/" + deckId); return; }

    if ((mode === "mcq" || mode === "match") && items.length < 4) {
      toast("Il faut au moins 4 cartes pour ce mode.");
      go("#/d/" + deckId);
      return;
    }

    sess = {
      mode: mode,
      deckId: deckId,
      deckName: deck ? deck.name : "Toutes tes cartes",
      queue: items,
      total: items.length,
      i: 0,
      right: 0,
      wrong: 0,
      missed: [],
      answered: false,
      startedAt: Date.now()
    };

    screen("study");
    if (mode === "review" || mode === "flash") startFlash();
    else if (mode === "mcq") startMcq();
    else if (mode === "write") startWrite();
    else if (mode === "match") startMatch();
  }

  function endStudy() {
    if (!sess) { go("#/"); return; }
    S.save();
    var secs = Math.round((Date.now() - sess.startedAt) / 1000);
    var total = sess.mode === "match" ? sess.total : sess.right + sess.wrong;
    var pct = total ? Math.round((sess.right / total) * 100) : 0;

    var emoji, title;
    if (sess.mode === "flash") { emoji = "📚"; title = "Paquet parcouru"; }
    else if (sess.mode === "review") { emoji = "🧠"; title = "Révision terminée"; }
    else if (pct >= 90) { emoji = "🏆"; title = "Excellent !"; }
    else if (pct >= 70) { emoji = "👏"; title = "Bien joué"; }
    else if (pct >= 45) { emoji = "💪"; title = "Ça progresse"; }
    else { emoji = "🌱"; title = "On recommence ?"; }

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
      stat(sess.total, "cartes vues");
    } else if (sess.mode === "review") {
      stat(sess.total, "cartes revues");
      stat(sess.right, "sues");
      stat(sess.wrong, "à revoir");
    } else {
      stat(sess.right, "bonnes réponses");
      stat(sess.wrong, "erreurs");
      stat(pct + "%", "de réussite");
    }
    stat(secs < 60 ? secs + " s" : Math.floor(secs / 60) + " min " + (secs % 60) + " s", "de travail");

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

    Sfx.play("done");
    screen("result");
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
    if (sess.mode === "review") {
      $("#gradeRow").hidden = true;
      $("#gHard").textContent = S.previewInterval(c, 3);
      $("#gGood").textContent = S.previewInterval(c, 4);
      $("#gEasy").textContent = S.previewInterval(c, 5);
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

    $$("#gradeRow .btn-grade").forEach(function (b) {
      b.addEventListener("click", function () {
        if (!sess) return;
        var q = parseInt(b.getAttribute("data-q"), 10);
        var c = sess.queue[sess.i];
        S.grade(c, q);
        if (q < 3) {
          sess.wrong++;
          sess.missed.push(c);
          // La carte ratée repasse plus loin dans la même session.
          sess.queue.push(c);
          sess.total = sess.queue.length;
        } else {
          sess.right++;
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
      sess.right++;
      S.grade(card, 4);
      Sfx.play("good");
    } else {
      btn.classList.add("bad");
      sess.wrong++;
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
      fb.appendChild(el("b", null, verdict === "close" ? "Presque — on accepte : " : "Correct : "));
      fb.appendChild(document.createTextNode(card.t));
      sess.right++;
      S.grade(card, verdict === "close" ? 3 : 5);
      Sfx.play("good");
    } else {
      fb.className = "write-feedback bad";
      fb.appendChild(el("b", null, "La réponse était : "));
      fb.appendChild(document.createTextNode(card.t));
      sess.wrong++;
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
      sess.right++;
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

    sess.wrong++;
    sess.missed.push(tile.kind === "term" ? tile.card : a.tile.card);
    Sfx.play("bad");
    [a.btn, btn].forEach(function (n) {
      n.classList.add("wrong");
      setTimeout(function () { n.classList.remove("wrong"); }, 360);
    });
    sess.pending = null;
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
      toast("Ce paquet est trop gros pour un lien. Réduis-le ou partage-le en deux paquets.");
      return;
    }

    function fallback() {
      showLinkDialog(url);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(function () {
        toast("Lien copié ! Colle-le dans ton groupe de classe.");
        Sfx.play("good");
      }).catch(fallback);
    } else {
      fallback();
    }
  }

  function importShared(code) {
    var parsed = S.decodeDeck(code);
    if (!parsed) {
      toast("Ce lien de partage est invalide ou abîmé.");
      go("#/");
      return;
    }
    var d = S.createDeck(parsed.name, parsed.subject, parsed.pairs);
    Sfx.play("done");
    toast("Paquet importé : " + plural(parsed.pairs.length, "carte", "cartes") + ".");
    go("#/d/" + d.id);
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

    if (parts[0] === "" || parts[0] === undefined) { renderHome(); return; }
    if (parts[0] === "d" && parts[1]) { renderDeck(parts[1]); return; }
    if (parts[0] === "new") { renderEdit(null, parts[1] || null); return; }
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
    initEditor();
    initFlash();
    initWrite();
    initKeys();

    $("#newDeckBtn").addEventListener("click", function () { go("#/new"); });
    $("#dueStart").addEventListener("click", function () { go("#/review"); });
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
        "Supprimer ce paquet ?",
        "« " + d.name + " » et ses " + d.cards.length + " carte" + (d.cards.length > 1 ? "s" : "") + " seront définitivement supprimés.",
        "Supprimer", true,
        function () { S.deleteDeck(currentDeckId); toast("Paquet supprimé."); go("#/"); }
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
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") { closeCtxMenu(); closeModal(); } });
    window.addEventListener("scroll", closeCtxMenu, true);
    window.addEventListener("resize", closeCtxMenu);
    window.addEventListener("hashchange", function () { closeCtxMenu(); route(); });
    route();

    if (location.search.indexOf("debug") >= 0) {
      window.__bc = {
        Store: S, go: go, getSess: function () { return sess; },
        checkAnswer: checkAnswer, norm: norm
      };
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
