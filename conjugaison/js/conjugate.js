/* ============================================================
   MOTEUR DE CONJUGAISON — 5 temps, et rien d'autre.
   ============================================================ */

const PRONOUNS = ['je', 'tu', 'il', 'nous', 'vous', 'ils'];
const PERSON_LABELS = [
  '1re personne du singulier', '2e personne du singulier', '3e personne du singulier',
  '1re personne du pluriel',   '2e personne du pluriel',   '3e personne du pluriel'
];

/* Terminaisons de l'imparfait — servent aussi au conditionnel présent. */
const END_IMPARFAIT = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];

/* Les trois (+1) familles du passé simple. */
const END_PASSE_SIMPLE = {
  a:  ['ai', 'as', 'a',  'âmes', 'âtes', 'èrent'],
  i:  ['is', 'is', 'it', 'îmes', 'îtes', 'irent'],
  u:  ['us', 'us', 'ut', 'ûmes', 'ûtes', 'urent'],
  in: ['ins','ins','int','înmes','întes','inrent']
};

const TENSES = {
  imparfait: {
    id: 'imparfait', name: 'Imparfait', short: 'Imp.', difficulty: 1,
    tagline: 'Le décor et les habitudes',
    blurb: 'Ce qui durait, ce qui revenait, ce qu’on décrit.',
    compound: false
  },
  passeSimple: {
    id: 'passeSimple', name: 'Passé simple', short: 'P. simple', difficulty: 3,
    tagline: 'Le temps des récits',
    blurb: 'L’action nette et terminée, dans les romans.',
    compound: false
  },
  condPresent: {
    id: 'condPresent', name: 'Conditionnel présent', short: 'Cond. prés.', difficulty: 2,
    tagline: 'Les « si » et la politesse',
    blurb: 'Ce qui arriverait, à une condition près.',
    compound: false
  },
  condPasse: {
    id: 'condPasse', name: 'Conditionnel passé', short: 'Cond. passé', difficulty: 3,
    tagline: 'Les regrets et les reproches',
    blurb: 'Ce qui aurait pu arriver… et qui n’est pas arrivé.',
    compound: true
  },
  plusQueParfait: {
    id: 'plusQueParfait', name: 'Plus-que-parfait', short: 'PQP', difficulty: 2,
    tagline: 'Le passé avant le passé',
    blurb: 'Une action déjà finie quand une autre commence.',
    compound: true
  }
};

const TENSE_IDS = ['imparfait', 'passeSimple', 'condPresent', 'condPasse', 'plusQueParfait'];

/* ---------- élision : je + voyelle -> j' ---------- */
function elide(pronoun, form) {
  if (pronoun === 'je' && /^[aeiouyâàéèêëîïôöûü]/i.test(form)) return "j’" + form;
  return pronoun + ' ' + form;
}

/* ---------- accord du participe passé avec l'auxiliaire être ---------- */
function agree(pp, person, aux) {
  if (aux !== 'être') return pp;
  return person >= 3 ? pp + 's' : pp;
}

/* ---------- temps simples ---------- */
function simpleForm(v, tenseId, person) {
  if (tenseId === 'imparfait') {
    var stem = v.imp[person === 3 || person === 4 ? 1 : 0];
    return { stem: stem, ending: END_IMPARFAIT[person] };
  }
  if (tenseId === 'condPresent') {
    return { stem: v.fut, ending: END_IMPARFAIT[person] };
  }
  if (tenseId === 'passeSimple') {
    var stemPs = v.ps[person === 5 ? 1 : 0];
    return { stem: stemPs, ending: END_PASSE_SIMPLE[v.psType][person] };
  }
  throw new Error('Temps simple inconnu : ' + tenseId);
}

/* ---------- conjugaison complète d'une personne ---------- */
function conjugate(verbKey, tenseId, person) {
  var v = VERBS[verbKey];
  if (!v) throw new Error('Verbe inconnu : ' + verbKey);
  var pronoun = PRONOUNS[person];
  var parts, form;

  if (TENSES[tenseId].compound) {
    var auxKey = v.aux;                                   // 'avoir' ou 'être'
    var auxTense = tenseId === 'condPasse' ? 'condPresent' : 'imparfait';
    var a = simpleForm(VERBS[auxKey], auxTense, person);
    var auxForm = a.stem + a.ending;
    var pp = agree(v.pp, person, auxKey);
    form = auxForm + ' ' + pp;
    parts = { kind: 'compound', aux: auxForm, auxVerb: auxKey, pp: pp, stem: a.stem, ending: a.ending };
  } else {
    var s = simpleForm(v, tenseId, person);
    form = s.stem + s.ending;
    parts = { kind: 'simple', stem: s.stem, ending: s.ending };
  }

  return {
    verb: verbKey, tense: tenseId, person: person,
    pronoun: pronoun, form: form, display: elide(pronoun, form), parts: parts
  };
}

/* Formes également acceptées (variantes orthographiques admises). */
function acceptedForms(verbKey, tenseId, person) {
  var v = VERBS[verbKey];
  var list = [conjugate(verbKey, tenseId, person).form];
  if (v.futAlt && (tenseId === 'condPresent')) {
    list.push(v.futAlt + END_IMPARFAIT[person]);
  }
  return list;
}

/* ---------- tableau des 6 personnes ---------- */
function fullTable(verbKey, tenseId) {
  var out = [];
  for (var p = 0; p < 6; p++) out.push(conjugate(verbKey, tenseId, p));
  return out;
}

/* ---------- normalisation & vérification des saisies ---------- */
function stripAccents(s) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ç/g, 'c');
}

function normalize(s) {
  return String(s)
    .toLowerCase()
    .replace(/[’‘`]/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/[.!?;:]+$/, '')
    .trim();
}

/* Retire un pronom écrit par l'utilisateur (« je prenais » -> « prenais »). */
const PRONOUN_RE = /^(je |j'|tu |il |elle |on |nous |vous |ils |elles )/;
function stripPronoun(s) {
  var out = s;
  while (PRONOUN_RE.test(out)) out = out.replace(PRONOUN_RE, '');
  return out.trim();
}

/**
 * Compare une saisie aux formes attendues.
 * @returns {'correct'|'accent'|'wrong'}  'accent' = juste, aux accents près.
 */
function checkForm(input, expectedList) {
  var got = stripPronoun(normalize(input));
  if (!got) return 'wrong';
  var want = expectedList.map(function (e) { return stripPronoun(normalize(e)); });
  var i;
  for (i = 0; i < want.length; i++) if (got === want[i]) return 'correct';
  for (i = 0; i < want.length; i++) if (stripAccents(got) === stripAccents(want[i])) return 'accent';
  return 'wrong';
}
