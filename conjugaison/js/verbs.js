/* ============================================================
   VERBES — table de radicaux
   ------------------------------------------------------------
   Pour chaque verbe on stocke uniquement ce dont les 5 temps
   du site ont besoin :
     aux  : auxiliaire des temps composés ('avoir' | 'être')
     pp   : participe passé (masculin singulier)
     fut  : radical du futur  -> sert au conditionnel présent
     futAlt : variante orthographique tolérée (facultatif)
     imp  : [radical je/tu/il/ils , radical nous/vous]
            (deux radicaux à cause de manger/commencer)
     ps   : [radical du passé simple , radical de la 3e pers. pl.]
     psType : famille de terminaisons du passé simple
              'a' (-ai)  'i' (-is)  'u' (-us)  'in' (-ins)
     grp  : 1 = -er, 2 = -ir (-issons), 3 = irrégulier
   ============================================================ */

const VERBS = {
  /* ---------- 1er groupe, réguliers ---------- */
  parler:     { aux:'avoir', pp:'parlé',     fut:'parler',     imp:['parl','parl'],             ps:['parl','parl'],             psType:'a', grp:1, core:true },
  chanter:    { aux:'avoir', pp:'chanté',    fut:'chanter',    imp:['chant','chant'],           ps:['chant','chant'],           psType:'a', grp:1 },
  jouer:      { aux:'avoir', pp:'joué',      fut:'jouer',      imp:['jou','jou'],               ps:['jou','jou'],               psType:'a', grp:1, core:true },
  regarder:   { aux:'avoir', pp:'regardé',   fut:'regarder',   imp:['regard','regard'],         ps:['regard','regard'],         psType:'a', grp:1 },
  aimer:      { aux:'avoir', pp:'aimé',      fut:'aimer',      imp:['aim','aim'],               ps:['aim','aim'],               psType:'a', grp:1, core:true },
  donner:     { aux:'avoir', pp:'donné',     fut:'donner',     imp:['donn','donn'],             ps:['donn','donn'],             psType:'a', grp:1 },
  trouver:    { aux:'avoir', pp:'trouvé',    fut:'trouver',    imp:['trouv','trouv'],           ps:['trouv','trouv'],           psType:'a', grp:1 },
  penser:     { aux:'avoir', pp:'pensé',     fut:'penser',     imp:['pens','pens'],             ps:['pens','pens'],             psType:'a', grp:1 },
  travailler: { aux:'avoir', pp:'travaillé', fut:'travailler', imp:['travaill','travaill'],     ps:['travaill','travaill'],     psType:'a', grp:1, core:true },
  porter:     { aux:'avoir', pp:'porté',     fut:'porter',     imp:['port','port'],             ps:['port','port'],             psType:'a', grp:1 },
  gagner:     { aux:'avoir', pp:'gagné',     fut:'gagner',     imp:['gagn','gagn'],             ps:['gagn','gagn'],             psType:'a', grp:1 },
  oublier:    { aux:'avoir', pp:'oublié',    fut:'oublier',    imp:['oubli','oubli'],           ps:['oubli','oubli'],           psType:'a', grp:1 },
  quitter:    { aux:'avoir', pp:'quitté',    fut:'quitter',    imp:['quitt','quitt'],           ps:['quitt','quitt'],           psType:'a', grp:1 },
  pousser:    { aux:'avoir', pp:'poussé',    fut:'pousser',    imp:['pouss','pouss'],           ps:['pouss','pouss'],           psType:'a', grp:1 },
  rater:      { aux:'avoir', pp:'raté',      fut:'rater',      imp:['rat','rat'],               ps:['rat','rat'],               psType:'a', grp:1 },
  briller:    { aux:'avoir', pp:'brillé',    fut:'briller',    imp:['brill','brill'],           ps:['brill','brill'],           psType:'a', grp:1 },

  /* ---------- 1er groupe, particularités orthographiques ---------- */
  manger:     { aux:'avoir', pp:'mangé',     fut:'manger',     imp:['mange','mang'],            ps:['mange','mang'],            psType:'a', grp:1, core:true },
  commencer:  { aux:'avoir', pp:'commencé',  fut:'commencer',  imp:['commenç','commenc'],       ps:['commenç','commenc'],       psType:'a', grp:1, core:true },
  appeler:    { aux:'avoir', pp:'appelé',    fut:'appeller',   imp:['appel','appel'],           ps:['appel','appel'],           psType:'a', grp:1 },
  acheter:    { aux:'avoir', pp:'acheté',    fut:'achèter',    imp:['achet','achet'],           ps:['achet','achet'],           psType:'a', grp:1 },
  envoyer:    { aux:'avoir', pp:'envoyé',    fut:'enverr',     imp:['envoy','envoy'],           ps:['envoy','envoy'],           psType:'a', grp:1 },
  essayer:    { aux:'avoir', pp:'essayé',    fut:'essaier', futAlt:'essayer', imp:['essay','essay'], ps:['essay','essay'],      psType:'a', grp:1 },

  /* ---------- 1er groupe, auxiliaire être ---------- */
  aller:      { aux:'être',  pp:'allé',      fut:'ir',         imp:['all','all'],               ps:['all','all'],               psType:'a', grp:3, core:true },
  arriver:    { aux:'être',  pp:'arrivé',    fut:'arriver',    imp:['arriv','arriv'],           ps:['arriv','arriv'],           psType:'a', grp:1, core:true },
  rester:     { aux:'être',  pp:'resté',     fut:'rester',     imp:['rest','rest'],             ps:['rest','rest'],             psType:'a', grp:1, core:true },
  tomber:     { aux:'être',  pp:'tombé',     fut:'tomber',     imp:['tomb','tomb'],             ps:['tomb','tomb'],             psType:'a', grp:1 },
  entrer:     { aux:'être',  pp:'entré',     fut:'entrer',     imp:['entr','entr'],             ps:['entr','entr'],             psType:'a', grp:1 },
  monter:     { aux:'être',  pp:'monté',     fut:'monter',     imp:['mont','mont'],             ps:['mont','mont'],             psType:'a', grp:1 },

  /* ---------- 2e groupe ---------- */
  finir:      { aux:'avoir', pp:'fini',      fut:'finir',      imp:['finiss','finiss'],         ps:['fin','fin'],               psType:'i', grp:2, core:true },
  choisir:    { aux:'avoir', pp:'choisi',    fut:'choisir',    imp:['choisiss','choisiss'],     ps:['chois','chois'],           psType:'i', grp:2, core:true },
  réussir:    { aux:'avoir', pp:'réussi',    fut:'réussir',    imp:['réussiss','réussiss'],     ps:['réuss','réuss'],           psType:'i', grp:2 },
  grandir:    { aux:'avoir', pp:'grandi',    fut:'grandir',    imp:['grandiss','grandiss'],     ps:['grand','grand'],           psType:'i', grp:2 },

  /* ---------- 3e groupe ---------- */
  partir:     { aux:'être',  pp:'parti',     fut:'partir',     imp:['part','part'],             ps:['part','part'],             psType:'i', grp:3, core:true },
  sortir:     { aux:'être',  pp:'sorti',     fut:'sortir',     imp:['sort','sort'],             ps:['sort','sort'],             psType:'i', grp:3 },
  dormir:     { aux:'avoir', pp:'dormi',     fut:'dormir',     imp:['dorm','dorm'],             ps:['dorm','dorm'],             psType:'i', grp:3 },
  ouvrir:     { aux:'avoir', pp:'ouvert',    fut:'ouvrir',     imp:['ouvr','ouvr'],             ps:['ouvr','ouvr'],             psType:'i', grp:3 },
  venir:      { aux:'être',  pp:'venu',      fut:'viendr',     imp:['ven','ven'],               ps:['v','v'],                   psType:'in', grp:3, core:true },
  tenir:      { aux:'avoir', pp:'tenu',      fut:'tiendr',     imp:['ten','ten'],               ps:['t','t'],                   psType:'in', grp:3 },
  être:       { aux:'avoir', pp:'été',       fut:'ser',        imp:['ét','ét'],                 ps:['f','f'],                   psType:'u', grp:3, core:true },
  avoir:      { aux:'avoir', pp:'eu',        fut:'aur',        imp:['av','av'],                 ps:['e','e'],                   psType:'u', grp:3, core:true },
  faire:      { aux:'avoir', pp:'fait',      fut:'fer',        imp:['fais','fais'],             ps:['f','f'],                   psType:'i', grp:3, core:true },
  dire:       { aux:'avoir', pp:'dit',       fut:'dir',        imp:['dis','dis'],               ps:['d','d'],                   psType:'i', grp:3, core:true },
  prendre:    { aux:'avoir', pp:'pris',      fut:'prendr',     imp:['pren','pren'],             ps:['pr','pr'],                 psType:'i', grp:3, core:true },
  comprendre: { aux:'avoir', pp:'compris',   fut:'comprendr',  imp:['compren','compren'],       ps:['compr','compr'],           psType:'i', grp:3 },
  apprendre:  { aux:'avoir', pp:'appris',    fut:'apprendr',   imp:['appren','appren'],         ps:['appr','appr'],             psType:'i', grp:3 },
  mettre:     { aux:'avoir', pp:'mis',       fut:'mettr',      imp:['mett','mett'],             ps:['m','m'],                   psType:'i', grp:3, core:true },
  voir:       { aux:'avoir', pp:'vu',        fut:'verr',       imp:['voy','voy'],               ps:['v','v'],                   psType:'i', grp:3, core:true },
  savoir:     { aux:'avoir', pp:'su',        fut:'saur',       imp:['sav','sav'],               ps:['s','s'],                   psType:'u', grp:3, core:true },
  pouvoir:    { aux:'avoir', pp:'pu',        fut:'pourr',      imp:['pouv','pouv'],             ps:['p','p'],                   psType:'u', grp:3, core:true },
  vouloir:    { aux:'avoir', pp:'voulu',     fut:'voudr',      imp:['voul','voul'],             ps:['voul','voul'],             psType:'u', grp:3, core:true },
  devoir:     { aux:'avoir', pp:'dû',        fut:'devr',       imp:['dev','dev'],               ps:['d','d'],                   psType:'u', grp:3, core:true },
  boire:      { aux:'avoir', pp:'bu',        fut:'boir',       imp:['buv','buv'],               ps:['b','b'],                   psType:'u', grp:3 },
  lire:       { aux:'avoir', pp:'lu',        fut:'lir',        imp:['lis','lis'],               ps:['l','l'],                   psType:'u', grp:3, core:true },
  écrire:     { aux:'avoir', pp:'écrit',     fut:'écrir',      imp:['écriv','écriv'],           ps:['écriv','écriv'],           psType:'i', grp:3 },
  connaître:  { aux:'avoir', pp:'connu',     fut:'connaîtr',   imp:['connaiss','connaiss'],     ps:['conn','conn'],             psType:'u', grp:3 },
  vivre:      { aux:'avoir', pp:'vécu',      fut:'vivr',       imp:['viv','viv'],               ps:['véc','véc'],               psType:'u', grp:3 },
  courir:     { aux:'avoir', pp:'couru',     fut:'courr',      imp:['cour','cour'],             ps:['cour','cour'],             psType:'u', grp:3, core:true },
  mourir:     { aux:'être',  pp:'mort',      fut:'mourr',      imp:['mour','mour'],             ps:['mour','mour'],             psType:'u', grp:3 },
  naître:     { aux:'être',  pp:'né',        fut:'naîtr',      imp:['naiss','naiss'],           ps:['naqu','naqu'],             psType:'i', grp:3 },
  recevoir:   { aux:'avoir', pp:'reçu',      fut:'recevr',     imp:['recev','recev'],           ps:['reç','reç'],               psType:'u', grp:3 },
  répondre:   { aux:'avoir', pp:'répondu',   fut:'répondr',    imp:['répond','répond'],         ps:['répond','répond'],         psType:'i', grp:3 },
  perdre:     { aux:'avoir', pp:'perdu',     fut:'perdr',      imp:['perd','perd'],             ps:['perd','perd'],             psType:'i', grp:3 },
  attendre:   { aux:'avoir', pp:'attendu',   fut:'attendr',    imp:['attend','attend'],         ps:['attend','attend'],         psType:'i', grp:3 },
  rendre:     { aux:'avoir', pp:'rendu',     fut:'rendr',      imp:['rend','rend'],             ps:['rend','rend'],             psType:'i', grp:3 },
  descendre:  { aux:'être',  pp:'descendu',  fut:'descendr',   imp:['descend','descend'],       ps:['descend','descend'],       psType:'i', grp:3 },
  croire:     { aux:'avoir', pp:'cru',       fut:'croir',      imp:['croy','croy'],             ps:['cr','cr'],                 psType:'u', grp:3 },
  suivre:     { aux:'avoir', pp:'suivi',     fut:'suivr',      imp:['suiv','suiv'],             ps:['suiv','suiv'],             psType:'i', grp:3 },
  rire:       { aux:'avoir', pp:'ri',        fut:'rir',        imp:['ri','ri'],                 ps:['r','r'],                   psType:'i', grp:3 }
};

/* clé -> infinitif (la clé EST l'infinitif) */
Object.keys(VERBS).forEach(function (k) { VERBS[k].inf = k; });

const VERB_KEYS = Object.keys(VERBS);
const CORE_VERBS = VERB_KEYS.filter(function (k) { return VERBS[k].core; });
