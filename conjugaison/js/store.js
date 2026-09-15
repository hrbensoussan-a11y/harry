/* ============================================================
   PROGRESSION — XP, niveaux, séries, maîtrise, trophées.
   Tout est stocké dans le navigateur de l'élève.
   ============================================================ */

const Store = (function () {
  const KEY = 'conjugo.v1';
  const DAILY_GOAL = 20;

  const LEVEL_TITLES = [
    'Débutant·e', 'Débutant·e', 'Apprenti·e', 'Apprenti·e', 'Entraîné·e',
    'Entraîné·e', 'Affûté·e', 'Affûté·e', 'Redoutable', 'Redoutable'
  ];

  const BADGES = [
    { id:'premier',   icon:'🎯', name:'Premier pas',       desc:'Répondre à ta première question.' },
    { id:'serie5',    icon:'✨', name:'Série de 5',         desc:'Enchaîner 5 bonnes réponses.' },
    { id:'serie10',   icon:'🔥', name:'En feu',             desc:'Enchaîner 10 bonnes réponses.' },
    { id:'serie20',   icon:'⚡', name:'Incontrôlable',      desc:'Enchaîner 20 bonnes réponses.' },
    { id:'lecon1',    icon:'📘', name:'Première leçon',     desc:'Terminer une leçon en entier.' },
    { id:'lecon5',    icon:'🎓', name:'Programme bouclé',   desc:'Terminer les 5 leçons.' },
    { id:'sansfaute', icon:'💎', name:'Sans-faute',         desc:'Une session d’entraînement 100 % juste.' },
    { id:'objectif',  icon:'🎽', name:'Objectif du jour',   desc:'Atteindre ton objectif quotidien.' },
    { id:'assidu',    icon:'📅', name:'Trois jours de suite',desc:'Revenir 3 jours d’affilée.' },
    { id:'cent',      icon:'💯', name:'Centurion',          desc:'100 bonnes réponses au total.' },
    { id:'m_imparfait',     icon:'🌙', name:'Maître de l’imparfait',          desc:'85 % de maîtrise à l’imparfait.' },
    { id:'m_passeSimple',   icon:'📖', name:'Maître du passé simple',         desc:'85 % de maîtrise au passé simple.' },
    { id:'m_condPresent',   icon:'🔮', name:'Maître du conditionnel présent', desc:'85 % de maîtrise au conditionnel présent.' },
    { id:'m_condPasse',     icon:'💭', name:'Maître du conditionnel passé',   desc:'85 % de maîtrise au conditionnel passé.' },
    { id:'m_plusQueParfait',icon:'⏮️', name:'Maître du plus-que-parfait',     desc:'85 % de maîtrise au plus-que-parfait.' }
  ];

  function today() {
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function blank() {
    const mastery = {};
    TENSE_IDS.forEach(function (t) { mastery[t] = 0; });
    return {
      xp: 0, answered: 0, correct: 0, streak: 0, bestStreak: 0,
      mastery: mastery, lessons: {}, badges: {},
      dayDate: today(), dayCount: 0, dayStreak: 1, lastDay: today(),
      sound: true
    };
  }

  function load() {
    let s;
    try {
      const raw = localStorage.getItem(KEY);
      s = raw ? Object.assign(blank(), JSON.parse(raw)) : blank();
    } catch (e) { s = blank(); }
    TENSE_IDS.forEach(function (t) { if (typeof s.mastery[t] !== 'number') s.mastery[t] = 0; });
    rollDay(s);
    return s;
  }

  /* Bascule de journée : compteur du jour + série de jours consécutifs. */
  function rollDay(s) {
    const t = today();
    if (s.dayDate === t) return;
    const y = new Date(); y.setDate(y.getDate() - 1);
    const yesterday = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
    s.dayStreak = (s.lastDay === yesterday) ? (s.dayStreak + 1) : 1;
    s.dayDate = t;
    s.dayCount = 0;
  }

  let state = load();
  const listeners = [];

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* mode privé : on continue sans sauvegarde */ }
    listeners.forEach(function (fn) { fn(state); });
  }

  function levelInfo(xp) {
    let lvl = 1, need = 100, acc = 0;
    while (xp >= acc + need) { acc += need; lvl++; need = 100 + (lvl - 1) * 60; }
    return {
      level: lvl, into: xp - acc, need: need,
      pct: Math.round((xp - acc) / need * 100),
      title: LEVEL_TITLES[Math.min(lvl - 1, LEVEL_TITLES.length - 1)] || 'Maître des temps'
    };
  }

  /* Débloque un trophée et le renvoie s'il est nouveau. */
  function unlock(id, out) {
    if (state.badges[id]) return;
    state.badges[id] = Date.now();
    const b = BADGES.filter(function (x) { return x.id === id; })[0];
    if (b && out) out.push(b);
  }

  function checkBadges(out) {
    if (state.answered >= 1) unlock('premier', out);
    if (state.bestStreak >= 5) unlock('serie5', out);
    if (state.bestStreak >= 10) unlock('serie10', out);
    if (state.bestStreak >= 20) unlock('serie20', out);
    if (state.correct >= 100) unlock('cent', out);
    const done = Object.keys(state.lessons).length;
    if (done >= 1) unlock('lecon1', out);
    if (done >= 5) unlock('lecon5', out);
    if (state.dayCount >= DAILY_GOAL) unlock('objectif', out);
    if (state.dayStreak >= 3) unlock('assidu', out);
    TENSE_IDS.forEach(function (t) { if (state.mastery[t] >= 85) unlock('m_' + t, out); });
  }

  return {
    DAILY_GOAL: DAILY_GOAL,
    BADGES: BADGES,
    get: function () { return state; },
    onChange: function (fn) { listeners.push(fn); },
    level: function () { return levelInfo(state.xp); },

    /* Enregistre une réponse. Renvoie l'XP gagnée et les trophées débloqués. */
    record: function (tenseId, isCorrect, factor) {
      rollDay(state);
      const out = [];
      state.answered++;
      state.dayCount++;
      if (isCorrect) {
        state.correct++;
        state.streak++;
        if (state.streak > state.bestStreak) state.bestStreak = state.streak;
        state.mastery[tenseId] = Math.min(100, state.mastery[tenseId] + 5);
      } else {
        state.streak = 0;
        state.mastery[tenseId] = Math.max(0, state.mastery[tenseId] - 3);
      }
      const gained = isCorrect ? Math.round((10 + Math.min(10, Math.floor(state.streak / 2) * 2)) * (factor || 1)) : 0;
      state.xp += gained;
      state.lastDay = today();
      checkBadges(out);
      save();
      return { xp: gained, badges: out, streak: state.streak };
    },

    finishSession: function (score, total) {
      const out = [];
      if (total >= 8 && score === total) unlock('sansfaute', out);
      save();
      return out;
    },

    completeLesson: function (tenseId) {
      const out = [];
      if (!state.lessons[tenseId]) {
        state.lessons[tenseId] = Date.now();
        state.xp += 40;
      }
      checkBadges(out);
      save();
      return out;
    },

    resetStreak: function () { state.streak = 0; save(); },

    toggleSound: function () { state.sound = !state.sound; save(); return state.sound; },

    reset: function () { state = blank(); save(); }
  };
})();
