/* ============================================================
   GÉNÉRATEUR DE QUESTIONS
   4 formats : trouver la forme · conjuguer · identifier · corriger
   ============================================================ */

const Quiz = (function () {

  /* Rappel de règle affiché dans le retour après chaque réponse. */
  const RULE_HINT = {
    imparfait:      'Habitude, description ou action en cours dans le passé → imparfait.',
    passeSimple:    'Action ponctuelle et terminée dans un récit écrit → passé simple.',
    condPresent:    'Hypothèse (si + imparfait), politesse ou souhait → conditionnel présent.',
    condPasse:      'Ce qui aurait pu arriver, regret ou reproche → conditionnel passé.',
    plusQueParfait: 'Action déjà terminée avant une autre action passée → plus-que-parfait.'
  };

  /* --- Formes « pièges » : jamais enseignées, uniquement en mauvaise réponse.
         Ce sont exactement les confusions que les leçons mettent en garde. --- */
  const FUT_END = ['ai', 'as', 'a', 'ons', 'ez', 'ont'];
  const AUX_PRESENT = {
    avoir: ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
    'être': ['suis', 'es', 'est', 'sommes', 'êtes', 'sont']
  };
  function trapFutur(verbKey, person) {
    return VERBS[verbKey].fut + FUT_END[person];
  }
  function trapPasseCompose(verbKey, person) {
    const v = VERBS[verbKey];
    let pp = v.pp;
    if (v.aux === 'être' && person >= 3) pp += 's';
    return AUX_PRESENT[v.aux][person] + ' ' + pp;
  }

  /* ---------- utilitaires ---------- */
  function shuffle(a) {
    const r = a.slice();
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = r[i]; r[i] = r[j]; r[j] = t;
    }
    return r;
  }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }

  /* Insère la forme dans la phrase, en gérant « je » + voyelle. */
  function fillSentence(text, form) {
    if (/[Jj]e ___/.test(text) && /^[aeiouyâàéèêëîïôöûü]/i.test(form)) {
      return text.replace(/([Jj])e ___/, function (m, c) { return c + '’' + form; });
    }
    return text.replace('___', form);
  }

  /* ---------- 1. Trouver la bonne forme ---------- */
  function makeFill(item) {
    const good = conjugate(item.v, item.t, item.p).form;
    const pool = [];
    TENSE_IDS.forEach(function (t) {
      if (t === item.t) return;
      pool.push(conjugate(item.v, t, item.p).form);
    });
    pool.push(item.t === 'condPresent' || item.t === 'imparfait'
      ? trapFutur(item.v, item.p)
      : trapPasseCompose(item.v, item.p));

    const seen = {}; seen[good] = true;
    const distractors = [];
    shuffle(pool).forEach(function (f) {
      if (!seen[f] && distractors.length < 3) { seen[f] = true; distractors.push(f); }
    });

    const options = shuffle([good].concat(distractors));
    return {
      format: 'fill', tense: item.t, verb: item.v,
      prompt: 'Complète la phrase.',
      sentence: item.s, blank: true,
      options: options, answer: options.indexOf(good),
      solution: fillSentence(item.s, good),
      explain: RULE_HINT[item.t] + ' Ici : <b>' + good + '</b> (' + TENSES[item.t].name.toLowerCase() + ' de <i>' + item.v + '</i>).'
    };
  }

  /* ---------- 2. Conjuguer (saisie libre) ---------- */
  function makeWrite(tenseId) {
    const verb = Math.random() < 0.65 ? pick(CORE_VERBS) : pick(VERB_KEYS);
    const person = Math.floor(Math.random() * 6);
    const c = conjugate(verb, tenseId, person);
    return {
      format: 'write', tense: tenseId, verb: verb, person: person,
      prompt: 'Conjugue le verbe <b>' + verb + '</b> à la ' + PERSON_LABELS[person] + '.',
      tenseLabel: TENSES[tenseId].name,
      hint: c.pronoun,
      expect: acceptedForms(verb, tenseId, person),
      solution: c.display,
      explain: c.parts.kind === 'compound'
        ? 'Auxiliaire <b>' + c.parts.auxVerb + '</b> (' + c.parts.aux + ') + participe passé <b>' + c.parts.pp + '</b>.'
        : 'Radical <b>' + c.parts.stem + '-</b> + terminaison <b>-' + c.parts.ending + '</b>.'
    };
  }

  /* ---------- 3. Identifier le temps ---------- */
  function makeIdentify(item) {
    const good = conjugate(item.v, item.t, item.p).form;
    const others = shuffle(TENSE_IDS.filter(function (t) { return t !== item.t; })).slice(0, 3);
    const ids = shuffle([item.t].concat(others));
    return {
      format: 'identify', tense: item.t, verb: item.v,
      prompt: 'Quel est le temps du verbe en évidence ?',
      sentence: fillSentence(item.s, good), highlight: good,
      options: ids.map(function (t) { return TENSES[t].name; }),
      answer: ids.indexOf(item.t),
      explain: RULE_HINT[item.t] + ' <b>' + good + '</b> = ' + TENSES[item.t].name.toLowerCase() + ' de <i>' + item.v + '</i>.'
    };
  }

  /* ---------- 4. Corriger l'erreur ---------- */
  function makeFix(item) {
    return {
      format: 'fix', tense: item.t,
      prompt: 'Cette phrase contient une erreur. Réécris <b>seulement</b> le verbe corrigé.',
      before: item.before, wrong: item.wrong, after: item.after,
      expect: item.answer,
      solution: item.before + (item.d || item.answer[0]) + item.after,
      explain: item.why
    };
  }

  /* ---------- Construction d'une session ---------- */
  function build(opts) {
    const tenseFilter = (opts && opts.tense) || 'all';
    const count = (opts && opts.count) || 10;
    const inScope = function (t) { return tenseFilter === 'all' || t === tenseFilter; };

    const sentences = shuffle(SENTENCES.filter(function (x) { return inScope(x.t); }));
    const fixes = shuffle(CORRECTIONS.filter(function (x) { return inScope(x.t); }));
    const tenses = TENSE_IDS.filter(inScope);

    const questions = [];
    let si = 0, fi = 0;
    /* Rythme : on alterne les formats pour éviter la monotonie. */
    const cycle = ['fill', 'write', 'identify', 'fill', 'fix', 'write', 'identify', 'fill', 'write', 'fix'];

    for (let i = 0; questions.length < count; i++) {
      let want = cycle[i % cycle.length];
      if ((want === 'fill' || want === 'identify') && si >= sentences.length) want = 'write';
      if (want === 'fix' && fi >= fixes.length) want = 'write';

      if (want === 'fill')          questions.push(makeFill(sentences[si++]));
      else if (want === 'identify') questions.push(makeIdentify(sentences[si++]));
      else if (want === 'fix')      questions.push(makeFix(fixes[fi++]));
      else                          questions.push(makeWrite(pick(tenses)));

      if (i > count * 6) break; /* garde-fou */
    }
    return questions.slice(0, count);
  }

  /* ---------- Correction d'une réponse ---------- */
  function grade(q, given) {
    if (q.format === 'fill' || q.format === 'identify' || q.format === 'mcq') {
      return { verdict: given === q.answer ? 'correct' : 'wrong' };
    }
    const v = checkForm(given, q.expect);
    return { verdict: v };
  }

  return { build: build, grade: grade, fillSentence: fillSentence, shuffle: shuffle, RULE_HINT: RULE_HINT };
})();
