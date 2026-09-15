/* ============================================================
   CONJUGO — interface : accueil, leçons, entraînement, progression
   ============================================================ */

(function () {
  'use strict';

  const $  = function (s, r) { return (r || document).querySelector(s); };
  const $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Met en valeur les {mots} des exemples. */
  function hl(t) { return String(t).replace(/\{([^}]+)\}/g, '<b>$1</b>'); }

  /* Une forme conjuguée, terminaison ou participe mis en couleur. */
  function partsHTML(c) {
    return c.parts.kind === 'compound'
      ? c.parts.aux + ' <span class="pp">' + c.parts.pp + '</span>'
      : c.parts.stem + '<span class="end">' + c.parts.ending + '</span>';
  }
  function displayHTML(c) {
    return (/^j’/.test(c.display) ? 'j’' : c.pronoun + ' ') + partsHTML(c);
  }

  /* ---------- sons ---------- */
  const Sound = (function () {
    let ctx = null;
    function ac() {
      if (!ctx) { const C = window.AudioContext || window.webkitAudioContext; if (C) ctx = new C(); }
      return ctx;
    }
    function tone(freq, start, dur, type, vol) {
      const a = ac(); if (!a) return;
      const o = a.createOscillator(), g = a.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, a.currentTime + start);
      g.gain.exponentialRampToValueAtTime(vol || 0.18, a.currentTime + start + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + dur);
      o.connect(g); g.connect(a.destination);
      o.start(a.currentTime + start); o.stop(a.currentTime + start + dur + 0.02);
    }
    function play(kind) {
      if (!Store.get().sound) return;
      try {
        if (kind === 'good')  { tone(660, 0, .12, 'triangle'); tone(990, .08, .16, 'triangle'); }
        if (kind === 'bad')   { tone(190, 0, .2, 'sawtooth', .1); tone(140, .09, .22, 'sawtooth', .08); }
        if (kind === 'near')  { tone(520, 0, .1, 'triangle'); tone(600, .07, .12, 'triangle'); }
        if (kind === 'badge') { [523, 659, 784, 1046].forEach(function (f, i) { tone(f, i * .08, .2, 'triangle', .14); }); }
        if (kind === 'click') { tone(420, 0, .05, 'square', .05); }
      } catch (e) { /* audio indisponible : on continue en silence */ }
    }
    return { play: play };
  })();

  /* ---------- confettis ---------- */
  function confetti() {
    if (REDUCED) return;
    const cv = $('#confetti'), ctx = cv.getContext('2d');
    cv.width = innerWidth; cv.height = innerHeight; cv.style.display = 'block';
    const colors = ['#7C6CFF', '#FF9142', '#24D8C4', '#FF5C9D', '#A8E053', '#FFC24B'];
    const bits = [];
    for (let i = 0; i < 110; i++) {
      bits.push({
        x: innerWidth / 2 + (Math.random() - .5) * 260, y: innerHeight * .34,
        vx: (Math.random() - .5) * 11, vy: -7 - Math.random() * 9,
        s: 4 + Math.random() * 6, r: Math.random() * 6,
        vr: (Math.random() - .5) * .3, c: colors[i % colors.length], life: 1
      });
    }
    let frames = 0;
    (function tick() {
      ctx.clearRect(0, 0, cv.width, cv.height);
      bits.forEach(function (b) {
        b.vy += .32; b.x += b.vx; b.y += b.vy; b.r += b.vr; b.life -= .0075;
        ctx.save(); ctx.globalAlpha = Math.max(0, b.life);
        ctx.translate(b.x, b.y); ctx.rotate(b.r);
        ctx.fillStyle = b.c; ctx.fillRect(-b.s / 2, -b.s / 2, b.s, b.s * .6);
        ctx.restore();
      });
      if (++frames < 140) requestAnimationFrame(tick);
      else { ctx.clearRect(0, 0, cv.width, cv.height); cv.style.display = 'none'; }
    })();
  }

  /* ---------- couleur active ---------- */
  function setAccent(tenseId) {
    document.documentElement.style.setProperty('--accent', 'var(--t-' + (tenseId || 'imparfait') + ')');
  }

  /* ---------- bandeau du haut ---------- */
  function renderHud() {
    const s = Store.get();
    $('#hudXpVal').textContent = s.xp;
    $('#hudStreakVal').textContent = s.streak;
    $('#soundBtn').textContent = s.sound ? '🔊' : '🔇';
  }

  /* ---------- routeur ---------- */
  let showcaseTimer = null;
  const NAV_FOR = { home: 'home', lessons: 'lessons', lesson: 'lessons', train: 'train', progress: 'progress' };

  function go(view, arg) {
    if (showcaseTimer) { clearInterval(showcaseTimer); showcaseTimer = null; }
    $$('.view').forEach(function (v) { v.classList.remove('active'); });
    $$('.nav button').forEach(function (b) {
      if (NAV_FOR[view] === b.dataset.go) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });

    if (view === 'home')     { setAccent('imparfait'); renderHome(); }
    if (view === 'lessons')  { setAccent('imparfait'); renderLessons(); }
    if (view === 'lesson')   { startLesson(arg); }
    if (view === 'train')    { setAccent('condPresent'); renderTrainMenu(); }
    if (view === 'progress') { setAccent('plusQueParfait'); renderProgress(); }

    const target = view === 'lesson' ? 'lesson' : view;
    $('#view-' + target).classList.add('active');
    window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    renderHud();
  }

  /* ============================================================
     ACCUEIL
     ============================================================ */
  const SHOWCASE = [
    { verb: 'prendre', tense: 'imparfait',      person: 2 },
    { verb: 'finir',   tense: 'passeSimple',    person: 5 },
    { verb: 'pouvoir', tense: 'condPresent',    person: 1 },
    { verb: 'venir',   tense: 'condPasse',      person: 0 },
    { verb: 'partir',  tense: 'plusQueParfait', person: 3 }
  ];

  function difficultyBars(n) {
    let out = '';
    for (let i = 1; i <= 3; i++) out += '<i class="' + (i <= n ? 'on' : '') + '"></i>';
    return out;
  }
  const DIFF_WORD = { 1: 'Accessible', 2: 'Intermédiaire', 3: 'Exigeant' };

  function tenseCard(id) {
    const T = TENSES[id], L = LESSONS[id], s = Store.get();
    const m = s.mastery[id];
    return '<article class="tcard" style="--c: var(--t-' + id + ')">' +
      '<div class="tcard-top">' +
        '<div><h3>' + T.name + '</h3><div class="tagline">' + T.tagline + '</div></div>' +
        '<div class="tcard-ico" aria-hidden="true">' + L.icon + '</div>' +
      '</div>' +
      '<p class="blurb">' + T.blurb + '</p>' +
      '<div class="diff"><span class="diff-bars" aria-hidden="true">' + difficultyBars(T.difficulty) + '</span>' +
        '<span class="diff-label">' + DIFF_WORD[T.difficulty] + '</span></div>' +
      '<div><div class="meter-row"><span>Maîtrise</span><span>' + m + ' %</span></div>' +
        '<div class="meter"><i style="width:' + m + '%"></i></div></div>' +
      '<div class="tcard-actions">' +
        '<button class="btn btn-primary" data-lesson="' + id + '">' + (s.lessons[id] ? 'Revoir' : 'Commencer') + '</button>' +
        '<button class="btn btn-ghost btn-sm" data-quiz="' + id + '">S’entraîner</button>' +
      '</div></article>';
  }

  function renderHome() {
    const s = Store.get(), lv = Store.level();
    const mastered = TENSE_IDS.filter(function (t) { return s.mastery[t] >= 85; }).length;

    $('#view-home').innerHTML =
      '<section class="hero">' +
        '<div>' +
          '<span class="eyebrow">5 temps · 68 verbes · 0 blabla</span>' +
          '<h1>Maîtrise tes <span class="glow">conjugaisons.</span></h1>' +
          '<p class="hero-sub">5 temps. Des défis. Zéro prise de tête.</p>' +
          '<div class="hero-cta">' +
            '<button class="btn btn-primary" id="ctaStart">Commencer à apprendre</button>' +
            '<button class="btn btn-ghost" id="ctaQuick">Défi rapide · 10 questions</button>' +
          '</div>' +
          '<div class="hero-stats">' +
            '<div class="hero-stat"><div class="n">' + lv.level + '</div><div class="l">Niveau</div></div>' +
            '<div class="hero-stat"><div class="n">' + s.xp + '</div><div class="l">XP</div></div>' +
            '<div class="hero-stat"><div class="n">' + mastered + '/5</div><div class="l">Temps maîtrisés</div></div>' +
            '<div class="hero-stat"><div class="n">' + s.bestStreak + '</div><div class="l">Meilleure série</div></div>' +
          '</div>' +
        '</div>' +
        '<div class="showcase" id="showcase"></div>' +
      '</section>' +

      '<div class="section-head">' +
        '<div><h2>Les 5 temps du programme</h2>' +
        '<p>Chaque temps a sa leçon, ses défis et sa barre de maîtrise. Commence par celui que tu veux.</p></div>' +
      '</div>' +
      '<div class="cards">' + TENSE_IDS.map(tenseCard).join('') + '</div>' +

      '<div class="section-head"><div><h2>Comment ça marche</h2></div></div>' +
      '<div class="steps3">' +
        '<div class="step3"><div class="k">ÉTAPE 1</div><h4>Tu comprends</h4><p>Une leçon courte : à quoi sert le temps, comment le former, et le piège classique.</p></div>' +
        '<div class="step3"><div class="k">ÉTAPE 2</div><h4>Tu pratiques</h4><p>Un défi arrive tout de suite après chaque explication. On apprend en faisant.</p></div>' +
        '<div class="step3"><div class="k">ÉTAPE 3</div><h4>Tu progresses</h4><p>Séries, XP, niveaux, trophées et une barre de maîtrise par temps.</p></div>' +
      '</div>';

    $('#ctaStart').onclick = function () { Sound.play('click'); go('lessons'); };
    $('#ctaQuick').onclick = function () { Sound.play('click'); startQuiz({ tense: 'all', count: 10 }); };
    wireCards($('#view-home'));
    runShowcase();
  }

  function wireCards(root) {
    $$('[data-lesson]', root).forEach(function (b) {
      b.onclick = function () { Sound.play('click'); go('lesson', b.dataset.lesson); };
    });
    $$('[data-quiz]', root).forEach(function (b) {
      b.onclick = function () { Sound.play('click'); startQuiz({ tense: b.dataset.quiz, count: 10 }); };
    });
  }

  function runShowcase() {
    const host = $('#showcase');
    if (!host) return;
    let i = 0;
    function draw() {
      const it = SHOWCASE[i % SHOWCASE.length];
      const c = conjugate(it.verb, it.tense, it.person);
      setAccent(it.tense);
      const pieces = c.parts.kind === 'compound'
        ? '<span class="piece aux">' + c.parts.aux + '</span><span class="op">+</span><span class="piece pp">' + c.parts.pp + '</span>'
        : '<span class="piece stem">' + c.parts.stem + '-</span><span class="op">+</span><span class="piece end">-' + c.parts.ending + '</span>';
      host.innerHTML =
        '<div class="showcase-head">' +
          '<span class="showcase-tense">' + TENSES[it.tense].name + '</span>' +
          '<span class="showcase-verb">' + it.verb + '</span>' +
        '</div>' +
        '<div class="assembler">' + pieces + '</div>' +
        '<div class="showcase-out">' + displayHTML(c) + '</div>';
      i++;
    }
    draw();
    if (!REDUCED) showcaseTimer = setInterval(draw, 2800);
  }

  /* ============================================================
     LISTE DES LEÇONS
     ============================================================ */
  function renderLessons() {
    const s = Store.get();
    const done = Object.keys(s.lessons).length;
    $('#view-lessons').innerHTML =
      '<span class="eyebrow">Apprendre</span>' +
      '<div class="section-head" style="margin-top:10px">' +
        '<div><h2>Choisis ton temps</h2>' +
        '<p>Chaque leçon dure quelques minutes : on explique, puis on te fait pratiquer tout de suite.</p></div>' +
        '<span class="chip">' + done + '/5 terminées</span>' +
      '</div>' +
      '<div class="cards">' + TENSE_IDS.map(tenseCard).join('') + '</div>';
    wireCards($('#view-lessons'));
  }

  /* ============================================================
     LEÇON
     ============================================================ */
  let lesson = null;

  function startLesson(tenseId) {
    lesson = { id: tenseId, step: 0 };
    setAccent(tenseId);
    renderLessonStep();
  }

  function renderLessonStep() {
    const id = lesson.id, T = TENSES[id], L = LESSONS[id];
    const steps = L.steps, i = lesson.step, step = steps[i];

    let dots = '';
    steps.forEach(function (_, k) { dots += '<i class="' + (k < i ? 'done' : k === i ? 'now' : '') + '"></i>'; });

    let body = '';
    if (step.type === 'usage')  body = renderUsage(step);
    if (step.type === 'build')  body = renderBuild(step);
    if (step.type === 'table')  body = renderTable(step, id);
    if (step.type === 'trap')   body = renderTrap(step);
    if (step.type === 'recap')  body = renderRecap(step);
    if (step.type === 'defi')   body = '<span class="qtype">Mini-défi</span>';

    const last = i === steps.length - 1;
    $('#view-lesson').innerHTML =
      '<div class="lesson-head">' +
        '<button class="icon-btn" id="lessonBack" aria-label="Retour aux leçons">←</button>' +
        '<div><h2>' + T.name + '</h2><div class="tagline">' + T.tagline + '</div></div>' +
        '<div class="dots" aria-label="Étape ' + (i + 1) + ' sur ' + steps.length + '">' + dots + '</div>' +
      '</div>' +
      '<div class="panel" id="lessonPanel">' + body +
        '<div class="panel-nav" id="lessonNav"></div>' +
      '</div>';

    $('#lessonBack').onclick = function () { go('lessons'); };

    const nav = $('#lessonNav');
    const prevBtn = i > 0 ? '<button class="btn btn-ghost btn-sm" id="lPrev">Précédent</button>' : '';
    const nextLabel = last ? 'Terminer la leçon' : 'Continuer';

    if (step.type === 'defi') {
      const q = lessonChallenge(step, id);
      const host = document.createElement('div');
      host.id = 'qHost';
      $('#lessonPanel').insertBefore(host, nav);
      nav.innerHTML = prevBtn + '<span class="spacer"></span>' +
        '<button class="btn btn-primary" id="lNext" disabled>' + nextLabel + '</button>';
      /* Un mini-défi compte comme une vraie réponse : XP, maîtrise, objectif du jour. */
      renderQ(q, host, function (verdict) {
        const near = verdict === 'accent';
        const res = Store.record(q.tense, verdict === 'correct' || near, near ? 0.5 : 1);
        xpPop(res.xp);
        if (res.badges.length) Sound.play('badge');
        renderHud();
        $('#lNext').disabled = false;
        $('#lNext').focus();
      });
    } else {
      nav.innerHTML = prevBtn + '<span class="spacer"></span>' +
        '<button class="btn btn-primary" id="lNext">' + nextLabel + '</button>';
    }

    if ($('#lPrev')) $('#lPrev').onclick = function () { lesson.step--; renderLessonStep(); };
    $('#lNext').onclick = function () {
      Sound.play('click');
      if (!last) { lesson.step++; renderLessonStep(); return; }
      const badges = Store.completeLesson(id);
      renderLessonDone(id, badges);
    };
  }

  function renderUsage(step) {
    return '<span class="qtype">À quoi ça sert</span>' +
      '<h3 style="margin-top:14px">' + step.title + '</h3>' +
      '<p class="lead">' + step.lead + '</p>' +
      '<div class="usages">' + step.items.map(function (it) {
        return '<div class="usage"><span class="tag">' + it.tag + '</span>' +
          '<span class="txt">' + it.text + '</span>' +
          '<span class="ex">' + hl(it.ex) + '</span></div>';
      }).join('') + '</div>' +
      (step.note ? '<div class="note">' + step.note + '</div>' : '');
  }

  function renderBuild(step) {
    let out = '<span class="qtype">La formation</span>' +
      '<h3 style="margin-top:14px">' + step.title + '</h3>' +
      '<p class="lead">' + step.lead + '</p>';

    if (step.formula) {
      out += '<div class="formula"><b>' + step.formula.left + '</b>' +
        '<span class="plus">+</span><b>' + step.formula.right + '</b></div>';
    }
    if (step.recipe) {
      out += '<div class="recipe"><div class="recipe-steps">' +
        step.recipe.steps.map(function (s, i) { return '<span><b>' + (i + 1) + '</b> ' + s + '</span>'; }).join('') +
        '</div>' +
        step.recipe.demos.map(function (d) {
          const cut = d.arrow.indexOf(d.stem);
          const to = cut < 0 ? d.arrow
            : d.arrow.slice(0, cut + d.stem.length) + '<span class="end">' + d.arrow.slice(cut + d.stem.length) + '</span>';
          return '<div class="demo-row"><span class="from">' + d.from + '</span>' +
            '<span class="op">→</span><span class="piece stem">' + d.stem + '-</span>' +
            '<span class="to">' + to + '</span></div>';
        }).join('') + '</div>';
    }
    if (step.endings) {
      out += '<div class="endings">' + step.endings.map(function (e, i) {
        return '<div class="ending-chip"><div class="p">' + PRONOUNS[i] + '</div><div class="e">' + e + '</div></div>';
      }).join('') + '</div>';
    }
    if (step.families) {
      out += '<div class="families">' + step.families.map(function (f) {
        return '<div class="family"><div class="lab">' + f.label + '</div>' +
          '<div class="ends">' + f.ends.map(function (e) { return '<span>' + e + '</span>'; }).join('') + '</div>' +
          '<div class="ex">' + f.ex + '</div></div>';
      }).join('') + '</div>';
    }
    if (step.irregulars) {
      out += '<div class="eyebrow" style="margin-top:22px">Radicaux à connaître</div><div class="irregulars">' +
        step.irregulars.map(function (p) { return '<div class="irr"><span>' + p[0] + '</span><b>' + p[1] + '</b></div>'; }).join('') +
        '</div>';
    }
    if (step.auxTable) {
      out += '<div class="aux-block">' + step.auxTable.map(function (a) {
        return '<div class="aux-line"><div class="nm">' + a.aux + '</div><div class="fs">' +
          a.forms.map(function (f) { return '<span>' + f + '</span>'; }).join('') + '</div></div>';
      }).join('') + '</div>';
    }
    if (step.auxRule) {
      out += '<div class="eyebrow" style="margin-top:22px">Les verbes qui prennent être</div>' +
        '<div class="etre-list">' + step.auxRule.etre.map(function (v) { return '<span>' + v + '</span>'; }).join('') + '</div>' +
        '<p class="lead" style="margin-top:12px;font-size:.9rem">' + step.auxRule.note + '</p>';
    }
    if (step.note) out += '<div class="note">' + step.note + '</div>';
    return out;
  }

  function renderTable(step, tenseId) {
    const diag = step.diagonal.map(function (v, i) {
      const c = conjugate(v, tenseId, i);
      return '<div class="diag-cell"><div class="vb">' + v + '</div><div class="fm">' + displayHTML(c) + '</div></div>';
    }).join('');
    const rows = fullTable(step.full, tenseId).map(function (c) {
      return '<div class="row"><span class="pr">' + PRONOUNS[c.person] + '</span><span class="fm">' + partsHTML(c) + '</span></div>';
    }).join('');
    return '<span class="qtype">Exemples</span>' +
      '<h3 style="margin-top:14px">' + step.title + '</h3>' +
      '<p class="lead">' + step.lead + '</p>' +
      '<div class="diag">' + diag + '</div>' +
      '<div class="conj-table"><div class="cap">' + step.full + ' · ' + TENSES[tenseId].name.toLowerCase() + '</div>' + rows + '</div>';
  }

  function renderTrap(step) {
    return '<span class="qtype">Le piège</span>' +
      '<h3 style="margin-top:14px">' + step.title + '</h3>' +
      '<div class="trap-pair">' +
        '<div class="trap-line bad"><span class="mk">✗</span><span class="s">' + step.wrong + '</span></div>' +
        '<div class="trap-line good"><span class="mk">✓</span><span>' + step.right + '</span></div>' +
      '</div>' +
      '<p class="lead" style="margin-top:18px">' + step.why + '</p>';
  }

  function renderRecap(step) {
    return '<span class="qtype">Récap</span>' +
      '<h3 style="margin-top:14px">' + step.title + '</h3>' +
      '<div class="recap-list">' + step.points.map(function (p) { return '<div>' + p + '</div>'; }).join('') + '</div>';
  }

  function renderLessonDone(tenseId, badges) {
    Sound.play('badge');
    confetti();
    const T = TENSES[tenseId];
    $('#view-lesson').innerHTML =
      '<div class="panel" style="text-align:center">' +
        '<div style="font-size:3rem">' + LESSONS[tenseId].icon + '</div>' +
        '<h3 style="margin-top:12px">Leçon terminée : ' + T.name + '</h3>' +
        '<p class="lead" style="margin:10px auto 0">+40 XP. Le meilleur moment pour enchaîner, c’est maintenant.</p>' +
        (badges.length ? '<div class="badge-pop" style="justify-content:center">' + badges.map(badgeNewHTML).join('') + '</div>' : '') +
        '<div class="panel-nav" style="justify-content:center">' +
          '<button class="btn btn-primary" id="dQuiz">S’entraîner sur ce temps</button>' +
          '<button class="btn btn-ghost" id="dBack">Autres leçons</button>' +
        '</div>' +
      '</div>';
    $('#dQuiz').onclick = function () { startQuiz({ tense: tenseId, count: 10 }); };
    $('#dBack').onclick = function () { go('lessons'); };
    renderHud();
  }

  function badgeNewHTML(b) {
    return '<div class="badge-new"><span class="bi">' + b.icon + '</span>' +
      '<span><span class="bn">' + b.name + '</span><br><span class="bd">' + b.desc + '</span></span></div>';
  }

  /* Convertit un mini-défi de leçon en question standard. */
  function lessonChallenge(step, tenseId) {
    if (step.format === 'mcq') {
      return {
        format: 'mcq', tense: tenseId, prompt: step.prompt, sentence: step.sentence,
        options: step.options, answer: step.answer, explain: step.explain
      };
    }
    const c = conjugate(step.verb, step.tense, step.person);
    return {
      format: 'write', tense: tenseId, prompt: step.prompt, hint: c.pronoun,
      tenseLabel: TENSES[step.tense].name,
      expect: acceptedForms(step.verb, step.tense, step.person),
      solution: c.display, explain: step.explain
    };
  }

  /* ============================================================
     RENDU D'UNE QUESTION (leçon et entraînement)
     ============================================================ */
  const TYPE_LABEL = { fill: 'Trouve la forme', mcq: 'Mini-défi', identify: 'Identifie le temps', write: 'Conjugue', fix: 'Corrige l’erreur' };
  const KEYS = ['A', 'B', 'C', 'D'];

  function sentenceHTML(q) {
    if (q.format === 'fix') {
      return '<div class="q-sentence">' + q.before + '<span class="err">' + q.wrong + '</span>' + q.after + '</div>';
    }
    if (q.format === 'identify') {
      const i = q.sentence.indexOf(q.highlight);
      const s = i < 0 ? q.sentence
        : q.sentence.slice(0, i) + '<mark>' + q.highlight + '</mark>' + q.sentence.slice(i + q.highlight.length);
      return '<div class="q-sentence">' + s + '</div>';
    }
    if (!q.sentence) return '';
    return '<div class="q-sentence">' + q.sentence.replace('___', '<span class="blank">&nbsp;</span>') + '</div>';
  }

  /**
   * Affiche une question dans `host` et appelle `done(verdict)` après la réponse.
   * `done` reçoit 'correct' | 'accent' | 'wrong'.
   */
  function renderQ(q, host, done) {
    const isChoice = q.format === 'fill' || q.format === 'identify' || q.format === 'mcq';
    setAccent(q.tense);

    host.innerHTML =
      '<span class="qtype">' + TYPE_LABEL[q.format] + '</span>' +
      '<p class="q-prompt">' + q.prompt + '</p>' +
      sentenceHTML(q) +
      (q.format === 'write' && q.tenseLabel ? '<p class="eyebrow" style="margin-top:12px">' + q.tenseLabel + '</p>' : '') +
      (isChoice
        ? '<div class="options">' + q.options.map(function (o, i) {
            return '<button class="opt" data-i="' + i + '"><span class="key">' + KEYS[i] + '</span><span>' + o + '</span></button>';
          }).join('') + '</div>'
        : '<div class="answer-row"><label class="input-wrap" id="iw">' +
            (q.hint ? '<span class="pron">' + q.hint + '</span>' : '') +
            '<input id="qInput" type="text" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="ta réponse" aria-label="Ta réponse" />' +
          '</label><button class="btn btn-primary" id="qCheck">Valider</button></div>') +
      '<div id="qFb" aria-live="polite"></div>';

    let settled = false;

    function settle(verdict, givenLabel) {
      if (settled) return;
      settled = true;
      const good = verdict === 'correct', near = verdict === 'accent';
      Sound.play(good ? 'good' : near ? 'near' : 'bad');

      if (isChoice) {
        $$('.opt', host).forEach(function (b) {
          const i = +b.dataset.i;
          b.disabled = true;
          if (i === q.answer) b.classList.add('correct');
          else if (String(i) === String(givenLabel)) b.classList.add('wrong');
          else b.classList.add('dim');
        });
      } else {
        $('#iw', host).classList.add(good || near ? 'ok' : 'ko');
        $('#qInput', host).disabled = true;
        $('#qCheck', host).disabled = true;
      }

      const cls = good ? 'ok' : near ? 'mid' : 'ko';
      const ico = good ? '✅' : near ? '⚠️' : '❌';
      const title = good ? pickPraise() : near ? 'Presque !' : 'Pas tout à fait.';
      const extra = near
        ? '<div class="detail">Les accents font partie de la conjugaison. On écrit <b>' + (q.solution || q.expect[0]) + '</b>.</div>'
        : '';
      const sol = (!good && !near && q.solution)
        ? '<div class="sol">→ ' + q.solution + '</div>' : '';

      $('#qFb', host).innerHTML =
        '<div class="feedback ' + cls + '"><span class="ico">' + ico + '</span><div>' +
          '<div class="verdict">' + title + '</div>' + extra +
          '<div class="detail">' + q.explain + '</div>' + sol +
        '</div></div>';

      done(verdict);
    }

    if (isChoice) {
      $$('.opt', host).forEach(function (b) {
        b.onclick = function () { settle(+b.dataset.i === q.answer ? 'correct' : 'wrong', b.dataset.i); };
      });
    } else {
      const input = $('#qInput', host);
      const check = function () {
        if (settled) return;
        const val = input.value.trim();
        if (!val) { input.focus(); return; }
        settle(checkForm(val, q.expect), val);
      };
      $('#qCheck', host).onclick = check;
      input.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); check(); } });
      setTimeout(function () { input.focus(); }, 60);
    }

    host._keyHandler = function (e) {
      if (settled || !isChoice) return;
      const idx = KEYS.indexOf(e.key.toUpperCase());
      const num = parseInt(e.key, 10);
      const i = idx >= 0 ? idx : (num >= 1 && num <= q.options.length ? num - 1 : -1);
      if (i >= 0 && i < q.options.length) { e.preventDefault(); settle(i === q.answer ? 'correct' : 'wrong', String(i)); }
    };
    document.addEventListener('keydown', host._keyHandler);
  }

  const PRAISES = ['Exact !', 'Parfait.', 'Bien joué !', 'Nickel.', 'Impeccable.', 'Tu gères.'];
  function pickPraise() { return PRAISES[Math.floor(Math.random() * PRAISES.length)]; }

  function xpPop(n) {
    if (!n) return;
    const d = document.createElement('div');
    d.className = 'xp-pop'; d.textContent = '+' + n + ' XP';
    document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 1100);
  }

  /* ============================================================
     ENTRAÎNEMENT
     ============================================================ */
  function renderTrainMenu() {
    const s = Store.get();
    const modes = TENSE_IDS.map(function (id) {
      return '<button class="mode" data-quiz="' + id + '" style="--c: var(--t-' + id + ')">' +
        '<span class="mi">' + LESSONS[id].icon + '</span>' +
        '<span class="mn">' + TENSES[id].name + '</span>' +
        '<span class="md">10 questions ciblées</span>' +
        '<span class="mm">MAÎTRISE ' + s.mastery[id] + ' %</span></button>';
    }).join('');

    const goalPct = Math.min(100, Math.round(s.dayCount / Store.DAILY_GOAL * 100));
    $('#view-train').innerHTML =
      '<span class="eyebrow">Entraînement</span>' +
      '<div class="section-head" style="margin-top:10px">' +
        '<div><h2>Choisis ton défi</h2>' +
        '<p>Quatre formats mélangés : compléter, conjuguer, identifier le temps, corriger une erreur.</p></div>' +
      '</div>' +
      '<div class="panel">' +
        '<div class="meter-row"><span>Objectif du jour</span><span>' + s.dayCount + ' / ' + Store.DAILY_GOAL + ' questions</span></div>' +
        '<div class="meter" style="--c: var(--accent)"><i style="width:' + goalPct + '%;background:var(--accent)"></i></div>' +
        '<div class="panel-nav">' +
          '<button class="btn btn-primary" data-quiz="all">Mélange des 5 temps · 10 questions</button>' +
          '<button class="btn btn-ghost" id="marathon">Marathon · 20 questions</button>' +
        '</div>' +
      '</div>' +
      '<div class="section-head"><div><h2>Un temps en particulier</h2></div></div>' +
      '<div class="mode-grid">' + modes + '</div>';

    wireCards($('#view-train'));
    $('#marathon').onclick = function () { startQuiz({ tense: 'all', count: 20 }); };
  }

  let quiz = null;

  function startQuiz(opts) {
    quiz = {
      qs: Quiz.build(opts), i: 0, score: 0, near: 0, xp: 0, badges: [],
      opts: opts, best: 0
    };
    Store.resetStreak();
    $$('.view').forEach(function (v) { v.classList.remove('active'); });
    $$('.nav button').forEach(function (b) {
      if (b.dataset.go === 'train') b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
    });
    $('#view-train').classList.add('active');
    window.scrollTo({ top: 0, behavior: REDUCED ? 'auto' : 'smooth' });
    renderQuizStep();
  }

  function renderQuizStep() {
    const q = quiz.qs[quiz.i];
    const s = Store.get();
    const pct = Math.max(3, Math.round(quiz.i / quiz.qs.length * 100));

    $('#view-train').innerHTML =
      '<div class="quiz-bar">' +
        '<button class="icon-btn" id="qQuit" aria-label="Quitter l’entraînement">✕</button>' +
        '<div class="quiz-progress"><i style="width:' + pct + '%"></i></div>' +
        '<span class="qcount">' + (quiz.i + 1) + ' / ' + quiz.qs.length + '</span>' +
        '<span class="streak-pill" id="qStreak">🔥 ' + s.streak + '</span>' +
      '</div>' +
      '<div class="panel"><div id="qHost"></div>' +
        '<div class="panel-nav"><span class="spacer"></span>' +
          '<button class="btn btn-primary" id="qNext" disabled>' +
            (quiz.i === quiz.qs.length - 1 ? 'Voir mon score' : 'Continuer') + '</button>' +
        '</div>' +
      '</div>';

    $('#qQuit').onclick = function () { cleanupQ(); go('train'); };

    const host = $('#qHost');
    renderQ(q, host, function (verdict) {
      const good = verdict === 'correct', near = verdict === 'accent';
      if (good) quiz.score++;
      if (near) quiz.near++;
      const res = Store.record(q.tense, good || near, near ? 0.5 : 1);
      quiz.xp += res.xp;
      quiz.badges = quiz.badges.concat(res.badges);
      if (res.streak > quiz.best) quiz.best = res.streak;

      const pill = $('#qStreak');
      pill.textContent = '🔥 ' + res.streak;
      if (good && res.streak > 1) { pill.classList.add('bump'); setTimeout(function () { pill.classList.remove('bump'); }, 460); }
      xpPop(res.xp);
      renderHud();

      if (res.badges.length) Sound.play('badge');
      const next = $('#qNext');
      next.disabled = false;
      next.focus();
    });

    $('#qNext').onclick = function () {
      cleanupQ();
      quiz.i++;
      if (quiz.i >= quiz.qs.length) renderResults();
      else renderQuizStep();
    };

    /* Entrée = question suivante, une fois la réponse validée. */
    document.addEventListener('keydown', nextOnEnter);
  }

  function nextOnEnter(e) {
    if (e.key !== 'Enter') return;
    const b = $('#qNext');
    if (b && !b.disabled && document.activeElement !== $('#qInput')) { e.preventDefault(); b.click(); }
  }

  function cleanupQ() {
    const host = $('#qHost');
    if (host && host._keyHandler) document.removeEventListener('keydown', host._keyHandler);
    document.removeEventListener('keydown', nextOnEnter);
  }

  function renderResults() {
    const total = quiz.qs.length;
    const counted = quiz.score + quiz.near;
    const pct = Math.round(counted / total * 100);
    const extra = Store.finishSession(quiz.score, total);
    const badges = quiz.badges.concat(extra);
    const perfect = quiz.score === total;

    if (pct >= 80) { confetti(); Sound.play('badge'); }

    const verdict = perfect ? 'Sans-faute. Respect.'
      : pct >= 80 ? 'Solide. Tu tiens le rythme.'
      : pct >= 50 ? 'Ça progresse. Encore un tour ?'
      : 'On refait une série : c’est comme ça que ça rentre.';

    const label = quiz.opts.tense === 'all' ? 'Mélange des 5 temps' : TENSES[quiz.opts.tense].name;

    $('#view-train').innerHTML =
      '<div class="panel" style="text-align:center">' +
        '<span class="eyebrow">' + label + '</span>' +
        '<div class="result-score" style="margin-top:14px">' + counted + '<span class="of"> / ' + total + '</span></div>' +
        '<h3 style="margin-top:14px">' + verdict + '</h3>' +
        '<div class="result-grid">' +
          '<div class="result-tile"><div class="n">' + pct + ' %</div><div class="l">Réussite</div></div>' +
          '<div class="result-tile"><div class="n">+' + quiz.xp + '</div><div class="l">XP gagnée</div></div>' +
          '<div class="result-tile"><div class="n">' + quiz.best + '</div><div class="l">Meilleure série</div></div>' +
          '<div class="result-tile"><div class="n">' + Store.level().level + '</div><div class="l">Niveau</div></div>' +
        '</div>' +
        (badges.length ? '<div class="badge-pop" style="justify-content:center">' + badges.map(badgeNewHTML).join('') + '</div>' : '') +
        '<div class="panel-nav" style="justify-content:center">' +
          '<button class="btn btn-primary" id="rAgain">Rejouer</button>' +
          '<button class="btn btn-ghost" id="rMenu">Changer de défi</button>' +
          '<button class="btn btn-ghost" id="rProg">Ma progression</button>' +
        '</div>' +
      '</div>';

    $('#rAgain').onclick = function () { startQuiz(quiz.opts); };
    $('#rMenu').onclick  = function () { go('train'); };
    $('#rProg').onclick  = function () { go('progress'); };
    renderHud();
  }

  /* ============================================================
     PROGRESSION
     ============================================================ */
  function renderProgress() {
    const s = Store.get(), lv = Store.level();
    const acc = s.answered ? Math.round(s.correct / s.answered * 100) : 0;
    const goalPct = Math.min(100, s.dayCount / Store.DAILY_GOAL);
    const R = 32, C = 2 * Math.PI * R;

    const mastery = TENSE_IDS.map(function (id) {
      const m = s.mastery[id];
      return '<div class="mastery" style="--c: var(--t-' + id + ')">' +
        '<span class="mi">' + LESSONS[id].icon + '</span>' +
        '<div><div class="mn">' + TENSES[id].name + '</div>' +
          '<div class="meter" style="margin-top:7px"><i style="width:' + m + '%;background:var(--c)"></i></div></div>' +
        '<span class="mp">' + m + ' %</span></div>';
    }).join('');

    const badges = Store.BADGES.map(function (b) {
      const on = !!s.badges[b.id];
      return '<div class="badge' + (on ? '' : ' locked') + '"><span class="bi">' + b.icon + '</span>' +
        '<div><div class="bn">' + b.name + '</div><div class="bd">' + b.desc + '</div></div></div>';
    }).join('');

    $('#view-progress').innerHTML =
      '<span class="eyebrow">Progression</span>' +
      '<div class="section-head" style="margin-top:10px"><div><h2>Où tu en es</h2></div></div>' +

      '<div class="level-card">' +
        '<div class="level-badge">' + lv.level + '</div>' +
        '<div class="level-info">' +
          '<div class="t">' + lv.title + '</div>' +
          '<div class="x">' + lv.into + ' / ' + lv.need + ' XP vers le niveau ' + (lv.level + 1) + '</div>' +
          '<div class="meter" style="margin-top:9px"><i style="width:' + lv.pct + '%;background:var(--accent)"></i></div>' +
        '</div>' +
        '<div class="goal-ring">' +
          '<svg width="76" height="76" viewBox="0 0 76 76">' +
            '<circle cx="38" cy="38" r="' + R + '" fill="none" stroke="var(--raised)" stroke-width="7"></circle>' +
            '<circle cx="38" cy="38" r="' + R + '" fill="none" stroke="var(--accent)" stroke-width="7" stroke-linecap="round"' +
              ' stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + (C * (1 - goalPct)).toFixed(1) + '"></circle>' +
          '</svg>' +
          '<div class="gv">' + s.dayCount + '/' + Store.DAILY_GOAL + '</div>' +
        '</div>' +
      '</div>' +

      '<div class="stat-grid">' +
        '<div class="result-tile"><div class="n">' + s.answered + '</div><div class="l">Questions</div></div>' +
        '<div class="result-tile"><div class="n">' + acc + ' %</div><div class="l">Réussite</div></div>' +
        '<div class="result-tile"><div class="n">' + s.bestStreak + '</div><div class="l">Meilleure série</div></div>' +
        '<div class="result-tile"><div class="n">' + s.dayStreak + '</div><div class="l">Jours d’affilée</div></div>' +
      '</div>' +

      '<div class="section-head"><div><h2>Maîtrise par temps</h2>' +
        '<p>Chaque bonne réponse fait monter la barre, chaque erreur la fait descendre un peu.</p></div></div>' +
      '<div class="mastery-list">' + mastery + '</div>' +

      '<div class="section-head"><div><h2>Trophées</h2></div>' +
        '<span class="chip">' + Object.keys(s.badges).length + '/' + Store.BADGES.length + '</span></div>' +
      '<div class="badges">' + badges + '</div>';
  }

  /* ============================================================
     DÉMARRAGE
     ============================================================ */
  $$('[data-go]').forEach(function (b) {
    b.onclick = function () { Sound.play('click'); cleanupQ(); go(b.dataset.go); };
  });
  $('#soundBtn').onclick = function () { Store.toggleSound(); renderHud(); Sound.play('click'); };
  $('#resetBtn').onclick = function () {
    if (confirm('Effacer toute ta progression (XP, niveaux, trophées, maîtrise) ?')) {
      Store.reset(); renderHud(); go('home');
    }
  };
  Store.onChange(renderHud);

  go('home');
})();
