/* ============================================================
   CONTENU — leçons, phrases d'exercice, erreurs à corriger.
   ============================================================ */

/* ---------- Les 5 leçons ----------
   Types d'étapes :
     usage   à quoi sert le temps
     build   comment le former (recette + terminaisons)
     table   exemples conjugués
     trap    le piège classique
     defi    mini-défi immédiat (mcq | type)
     recap   fin de leçon
------------------------------------------------------------- */

const LESSONS = {

  imparfait: {
    icon: '🌙',
    why: 'On décrit ou on raconte une habitude passée.',
    steps: [
      { type:'usage', title:'À quoi sert l’imparfait ?',
        lead:'C’est le temps de l’arrière-plan : ce qui durait, ce qui se répétait, ce qu’on décrit.',
        items:[
          { tag:'Habitude', text:'Ce qu’on faisait souvent, avant.', ex:'Tous les étés, on {allait} à la mer.' },
          { tag:'Description', text:'Planter le décor, un état, une émotion.', ex:'Il {faisait} nuit, la rue {était} vide.' },
          { tag:'Action en cours', text:'Une action déjà commencée, qu’une autre interrompt.', ex:'Je {dormais} quand le téléphone a sonné.' }
        ] },

      { type:'defi', format:'mcq',
        prompt:'Complète la phrase.',
        sentence:'Quand j’étais petit, je ___ souvent au parc.',
        options:['jouais','jouerais','jouai','avais joué'], answer:0,
        explain:'« souvent » + un souvenir d’enfance = une habitude passée → imparfait.' },

      { type:'build', title:'Comment le former ?',
        lead:'Une seule recette, valable pour tous les verbes.',
        recipe:{
          steps:['Prends le verbe au présent avec nous', 'Enlève -ons', 'Colle la terminaison'],
          demos:[
            { from:'nous parlons',   stem:'parl',   arrow:'je parlais' },
            { from:'nous finissons', stem:'finiss', arrow:'tu finissais' },
            { from:'nous prenons',   stem:'pren',   arrow:'il prenait' }
          ]
        },
        endings:['-ais','-ais','-ait','-ions','-iez','-aient'],
        note:'Une seule exception dans toute la langue française : <b>être</b>, dont le radical est <b>ét-</b> (j’étais).' },

      { type:'defi', format:'type',
        prompt:'Conjugue le verbe <b>prendre</b> à la 1<sup>re</sup> personne du singulier à l’imparfait.',
        verb:'prendre', tense:'imparfait', person:0,
        explain:'nous pren|ons → radical <b>pren-</b>, plus la terminaison <b>-ais</b>.' },

      { type:'table', title:'Six personnes, six verbes',
        lead:'Les terminaisons ne changent jamais, quel que soit le verbe.',
        diagonal:['parler','finir','prendre','faire','avoir','être'],
        full:'parler' },

      { type:'trap', title:'Le piège',
        wrong:'Nous travaillons beaucoup, l’an dernier.',
        right:'Nous travaillions beaucoup, l’an dernier.',
        why:'Aux personnes <b>nous</b> et <b>vous</b>, le <b>-i-</b> de <b>-ions / -iez</b> s’ajoute au radical. Si le radical finit déjà par un i ou un y, on écrit deux lettres : <b>nous riions</b>, <b>vous criiez</b>, <b>nous voyions</b>.' },

      { type:'defi', format:'mcq',
        prompt:'Quel est le temps du verbe souligné ?',
        sentence:'Il portait un grand manteau noir et un chapeau.',
        options:['Imparfait','Passé simple','Conditionnel présent','Plus-que-parfait'], answer:0,
        explain:'« portait » = description d’un personnage → imparfait.' },

      { type:'recap', title:'Imparfait, c’est plié.',
        points:['Radical = le « nous » du présent, sans -ons.','Terminaisons : -ais, -ais, -ait, -ions, -iez, -aient.','Seule exception : être → ét-.','Attention au -i- de nous / vous.'] }
    ]
  },

  passeSimple: {
    icon: '📖',
    why: 'On raconte une action nette et terminée, à l’écrit.',
    steps: [
      { type:'usage', title:'À quoi sert le passé simple ?',
        lead:'C’est le temps des romans et de l’Histoire. On le lit beaucoup, on ne le parle presque jamais : à l’oral, on dit le passé composé.',
        items:[
          { tag:'Action ponctuelle', text:'Une action nette, terminée, qui fait avancer le récit.', ex:'Il {ouvrit} la porte.' },
          { tag:'Suite d’actions', text:'Des actions qui s’enchaînent, coup sur coup.', ex:'Il {entra}, {posa} son sac et {ressortit}.' },
          { tag:'Histoire & dates', text:'Un événement daté, définitivement fini.', ex:'Napoléon {mourut} en 1821.' }
        ],
        note:'Dans la pratique, tu le rencontres surtout à la 3<sup>e</sup> personne : <b>il / elle / ils / elles</b>.' },

      { type:'defi', format:'mcq',
        prompt:'Complète le récit.',
        sentence:'Le chevalier ___ son épée et avança.',
        options:['prenait','prit','prendrait','avait pris'], answer:1,
        explain:'Une action brève qui fait avancer l’histoire, à côté d’« avança » → passé simple.' },

      { type:'build', title:'Comment le former ?',
        lead:'Trois familles de terminaisons. Le radical, lui, est celui de l’infinitif ou du participe passé.',
        families:[
          { label:'Verbes en -ER', ends:['-ai','-as','-a','-âmes','-âtes','-èrent'], ex:'je parlai · ils parlèrent' },
          { label:'Verbes en -IR et beaucoup de -RE', ends:['-is','-is','-it','-îmes','-îtes','-irent'], ex:'je finis · il prit' },
          { label:'La famille du -U', ends:['-us','-us','-ut','-ûmes','-ûtes','-urent'], ex:'je fus · j’eus · il put · nous vécûmes' }
        ],
        note:'Deux intrus à part : <b>venir</b> et <b>tenir</b> → je <b>vins</b>, il <b>vint</b>, ils <b>vinrent</b>.' },

      { type:'defi', format:'type',
        prompt:'Conjugue le verbe <b>avoir</b> à la 3<sup>e</sup> personne du singulier au passé simple.',
        verb:'avoir', tense:'passeSimple', person:2,
        explain:'avoir appartient à la famille du -U : j’<b>eus</b>, tu eus, il <b>eut</b>.' },

      { type:'table', title:'Les quatre à connaître par cœur',
        lead:'Si tu retiens ces quatre-là, tu lis n’importe quel roman.',
        diagonal:['être','avoir','faire','venir','voir','dire'],
        full:'finir' },

      { type:'trap', title:'Le piège',
        wrong:'Il parlera longuement devant la foule.',
        right:'Il parla longuement devant la foule.',
        why:'<b>il parla</b> (passé simple) et <b>il parlera</b> (futur) ne diffèrent que d’une syllabe. Et le circonflexe de <b>nous / vous</b> n’est pas décoratif : <b>nous allâmes</b>, <b>vous finîtes</b>.' },

      { type:'defi', format:'mcq',
        prompt:'Quel est le temps du verbe souligné ?',
        sentence:'Ils quittèrent le château au lever du jour.',
        options:['Imparfait','Passé simple','Conditionnel passé','Plus-que-parfait'], answer:1,
        explain:'« quittèrent » = terminaison -èrent, la 3<sup>e</sup> personne du pluriel des verbes en -er au passé simple.' },

      { type:'recap', title:'Passé simple, décodé.',
        points:['Trois familles : -ai / -is / -us.','Surtout à la 3ᵉ personne, à l’écrit.','Circonflexe obligatoire à nous et vous.','venir et tenir : je vins, il vint, ils vinrent.'] }
    ]
  },

  condPresent: {
    icon: '🔮',
    why: 'On parle de ce qui arriverait, à une condition près.',
    steps: [
      { type:'usage', title:'À quoi sert le conditionnel présent ?',
        lead:'Rien n’est sûr : c’est le temps du possible, du poli et du rêvé.',
        items:[
          { tag:'Hypothèse', text:'si + imparfait → conditionnel présent.', ex:'Si j’avais le temps, je {viendrais}.' },
          { tag:'Politesse', text:'Demander sans imposer.', ex:'{Pourrais}-tu me prêter ton stylo ?' },
          { tag:'Souhait', text:'Ce dont on a envie.', ex:'J’{aimerais} partir en Islande.' },
          { tag:'Info non confirmée', text:'Ce qu’on rapporte sans le garantir.', ex:'Le suspect {serait} toujours en fuite.' }
        ] },

      { type:'defi', format:'mcq',
        prompt:'Complète la phrase.',
        sentence:'Si j’étais riche, je ___ le tour du monde.',
        options:['ferai','ferais','faisais','fis'], answer:1,
        explain:'si + imparfait (« si j’étais ») appelle le conditionnel présent : je <b>ferais</b>.' },

      { type:'build', title:'Comment le former ?',
        lead:'C’est un mélange de deux temps que tu connais déjà.',
        formula:{ left:'radical du FUTUR', right:'terminaisons de l’IMPARFAIT' },
        recipe:{
          steps:['Pars du futur', 'Garde le radical (il finit toujours par -r)', 'Colle -ais, -ais, -ait, -ions, -iez, -aient'],
          demos:[
            { from:'je parlerai',  stem:'parler', arrow:'je parlerais' },
            { from:'je finirai',   stem:'finir',  arrow:'tu finirais' },
            { from:'je prendrai',  stem:'prendr', arrow:'il prendrait' }
          ]
        },
        endings:['-ais','-ais','-ait','-ions','-iez','-aient'],
        irregulars:[
          ['être','ser-'], ['avoir','aur-'], ['aller','ir-'], ['faire','fer-'],
          ['venir','viendr-'], ['voir','verr-'], ['pouvoir','pourr-'], ['vouloir','voudr-'],
          ['devoir','devr-'], ['savoir','saur-'], ['courir','courr-'], ['envoyer','enverr-']
        ],
        note:'Le radical du conditionnel garde <b>toujours</b> son <b>-r-</b>. Pas de -r, pas de conditionnel.' },

      { type:'defi', format:'type',
        prompt:'Conjugue le verbe <b>pouvoir</b> à la 2<sup>e</sup> personne du singulier au conditionnel présent.',
        verb:'pouvoir', tense:'condPresent', person:1,
        explain:'Futur : je <b>pourr</b>ai → radical <b>pourr-</b>, plus <b>-ais</b>.' },

      { type:'table', title:'Six personnes, six verbes',
        lead:'Les terminaisons sont exactement celles de l’imparfait.',
        diagonal:['parler','choisir','venir','voir','vouloir','aller'],
        full:'être' },

      { type:'trap', title:'Le piège',
        wrong:'À ta place, je parlerai au professeur.',
        right:'À ta place, je parlerais au professeur.',
        why:'<b>-ai</b> = futur (c’est sûr). <b>-ais</b> = conditionnel (c’est hypothétique). Le test qui marche à tous les coups : remplace <b>je</b> par <b>nous</b>. Si ça donne <i>nous parlerons</i>, c’est le futur ; si ça donne <i>nous parlerions</i>, c’est le conditionnel.' },

      { type:'defi', format:'mcq',
        prompt:'Quelle phrase est correcte ?',
        options:['Si j’aurais le temps, je viendrais.','Si j’avais le temps, je viendrais.','Si j’aurais le temps, je viendrai.','Si j’avais le temps, je viendrai.'], answer:1,
        explain:'Après <b>si</b>, jamais de conditionnel : on met l’imparfait, et le conditionnel arrive dans l’autre moitié de la phrase.' },

      { type:'recap', title:'Conditionnel présent, maîtrisé.',
        points:['Radical du futur + terminaisons de l’imparfait.','Le radical garde toujours son -r.','si + imparfait → conditionnel présent.','-ai = futur, -ais = conditionnel.'] }
    ]
  },

  condPasse: {
    icon: '💭',
    why: 'On parle de ce qui aurait pu arriver — et qui n’est pas arrivé.',
    steps: [
      { type:'usage', title:'À quoi sert le conditionnel passé ?',
        lead:'C’est le temps de ce qui ne s’est pas produit : le regret, le reproche, l’occasion manquée.',
        items:[
          { tag:'Regret', text:'Ce qu’on aurait voulu vivre.', ex:'J’{aurais aimé} être là.' },
          { tag:'Reproche', text:'Ce que l’autre n’a pas fait.', ex:'Tu {aurais dû} me prévenir !' },
          { tag:'Occasion manquée', text:'si + plus-que-parfait → conditionnel passé.', ex:'Si j’avais su, je {serais venu}.' },
          { tag:'Info non confirmée', text:'Ce qu’on rapporte au passé, sans le garantir.', ex:'Le voleur {aurait quitté} la ville.' }
        ] },

      { type:'defi', format:'mcq',
        prompt:'Complète la phrase.',
        sentence:'Tu ___ me prévenir avant de partir !',
        options:['aurais pu','avais pu','pouvais','pus'], answer:0,
        explain:'Un reproche sur une action qui n’a pas eu lieu → conditionnel passé.' },

      { type:'build', title:'Comment le former ?',
        lead:'Deux morceaux : l’auxiliaire au conditionnel présent, puis le participe passé.',
        formula:{ left:'AUXILIAIRE au conditionnel présent', right:'PARTICIPE PASSÉ' },
        auxTable:[
          { aux:'avoir', forms:['j’aurais','tu aurais','il aurait','nous aurions','vous auriez','ils auraient'] },
          { aux:'être',  forms:['je serais','tu serais','il serait','nous serions','vous seriez','ils seraient'] }
        ],
        auxRule:{
          etre:['aller','venir','partir','arriver','rester','tomber','entrer','sortir','monter','descendre','naître','mourir'],
          note:'Ces verbes-là (plus les verbes pronominaux) prennent <b>être</b>. Tous les autres prennent <b>avoir</b>.'
        },
        note:'Avec <b>être</b>, le participe s’accorde avec le sujet : elle serait venu<b>e</b>, ils seraient venu<b>s</b>.' },

      { type:'defi', format:'type',
        prompt:'Conjugue le verbe <b>venir</b> à la 1<sup>re</sup> personne du singulier au conditionnel passé.',
        verb:'venir', tense:'condPasse', person:0,
        explain:'venir prend l’auxiliaire <b>être</b> : je <b>serais venu</b>, et surtout pas « j’aurais venu ».' },

      { type:'table', title:'Les deux auxiliaires en action',
        lead:'Même temps, deux comportements : repère bien qui prend être.',
        diagonal:['aimer','pouvoir','partir','voir','devoir','aller'],
        full:'aller' },

      { type:'trap', title:'Le piège',
        wrong:'Il aurait venu hier soir.',
        right:'Il serait venu hier soir.',
        why:'<b>venir</b> se conjugue avec <b>être</b>. Le réflexe : avant d’écrire, demande-toi « au passé composé, je dis <i>il est venu</i> ou <i>il a venu</i> ? ». La réponse te donne l’auxiliaire.' },

      { type:'defi', format:'mcq',
        prompt:'Quelle phrase est correcte ?',
        options:['Si j’aurais su, je serais resté.','Si j’avais su, je serais resté.','Si j’avais su, j’aurais resté.','Si j’aurais su, j’aurais resté.'], answer:1,
        explain:'si + plus-que-parfait (« si j’avais su ») → conditionnel passé. Et <b>rester</b> prend l’auxiliaire être.' },

      { type:'recap', title:'Conditionnel passé, verrouillé.',
        points:['Auxiliaire au conditionnel présent + participe passé.','Le bon auxiliaire d’abord : être ou avoir.','Avec être, le participe s’accorde.','si + plus-que-parfait → conditionnel passé.'] }
    ]
  },

  plusQueParfait: {
    icon: '⏮️',
    why: 'On remonte encore plus loin : le passé du passé.',
    steps: [
      { type:'usage', title:'À quoi sert le plus-que-parfait ?',
        lead:'Deux actions passées, mais l’une est arrivée avant l’autre. Le plus-que-parfait, c’est la plus ancienne.',
        items:[
          { tag:'Antériorité', text:'Déjà terminé quand l’autre action commence.', ex:'Quand je suis arrivé, le film {avait} déjà {commencé}.' },
          { tag:'Retour en arrière', text:'Dans un récit au passé, ce qui s’est passé avant.', ex:'Il raconta qu’il {avait vu} un fantôme.' },
          { tag:'Regret avec « si »', text:'si + plus-que-parfait → conditionnel passé.', ex:'Si j’{avais su}, je ne serais pas venu.' }
        ] },

      { type:'defi', format:'mcq',
        prompt:'Complète la phrase.',
        sentence:'Le train ___ quand nous sommes arrivés sur le quai.',
        options:['partait','était parti','serait parti','partit'], answer:1,
        explain:'Le départ a lieu <b>avant</b> l’arrivée sur le quai → plus-que-parfait. Et partir prend l’auxiliaire être.' },

      { type:'build', title:'Comment le former ?',
        lead:'La même mécanique que le conditionnel passé, mais l’auxiliaire passe à l’imparfait.',
        formula:{ left:'AUXILIAIRE à l’imparfait', right:'PARTICIPE PASSÉ' },
        auxTable:[
          { aux:'avoir', forms:['j’avais','tu avais','il avait','nous avions','vous aviez','ils avaient'] },
          { aux:'être',  forms:['j’étais','tu étais','il était','nous étions','vous étiez','ils étaient'] }
        ],
        auxRule:{
          etre:['aller','venir','partir','arriver','rester','tomber','entrer','sortir','monter','descendre','naître','mourir'],
          note:'Même liste qu’au conditionnel passé : l’auxiliaire d’un verbe ne change jamais.'
        },
        note:'Avec <b>être</b>, le participe s’accorde avec le sujet : elle était parti<b>e</b>, ils étaient parti<b>s</b>.' },

      { type:'defi', format:'type',
        prompt:'Conjugue le verbe <b>voir</b> à la 3<sup>e</sup> personne du singulier au plus-que-parfait.',
        verb:'voir', tense:'plusQueParfait', person:2,
        explain:'avoir à l’imparfait (<b>il avait</b>) + le participe passé <b>vu</b>.' },

      { type:'table', title:'Les deux auxiliaires en action',
        lead:'Repère la bascule entre avoir et être.',
        diagonal:['manger','travailler','partir','lire','vivre','arriver'],
        full:'partir' },

      { type:'trap', title:'Le piège',
        wrong:'Nous avions mangés toute la pizza.',
        right:'Nous avions mangé toute la pizza.',
        why:'Avec l’auxiliaire <b>avoir</b>, le participe ne s’accorde <b>pas</b> avec le sujet. L’accord avec le sujet, c’est la signature de l’auxiliaire <b>être</b>.' },

      { type:'defi', format:'mcq',
        prompt:'Quel est le temps du verbe souligné ?',
        sentence:'Ils avaient vécu dans cette ville pendant dix ans.',
        options:['Imparfait','Passé simple','Plus-que-parfait','Conditionnel passé'], answer:2,
        explain:'« avaient » (auxiliaire à l’imparfait) + « vécu » (participe passé) → plus-que-parfait.' },

      { type:'recap', title:'Plus-que-parfait, bouclé.',
        points:['Auxiliaire à l’imparfait + participe passé.','C’est l’action la plus ancienne des deux.','Même auxiliaire qu’au conditionnel passé.','Avec avoir, pas d’accord avec le sujet.'] }
    ]
  }
};

/* ---------- Banque de phrases ----------
   ___ = l'emplacement du verbe. p = personne (0..5).
   Si la phrase contient « je ___ », l'élision est gérée à l'affichage.
------------------------------------------------------------- */

const SENTENCES = [
  /* Imparfait */
  { t:'imparfait', v:'jouer',      p:0, s:'Quand j’étais petit, je ___ souvent au parc.' },
  { t:'imparfait', v:'faire',      p:1, s:'Avant, tu ___ toujours tes devoirs devant la télé.' },
  { t:'imparfait', v:'porter',     p:2, s:'Il ___ un grand manteau noir et un chapeau.' },
  { t:'imparfait', v:'aller',      p:3, s:'Chaque été, nous ___ chez nos grands-parents.' },
  { t:'imparfait', v:'être',       p:4, s:'À cette époque, vous ___ encore au collège.' },
  { t:'imparfait', v:'courir',     p:5, s:'Les enfants ___ dans le jardin pendant que la pluie tombait.' },
  { t:'imparfait', v:'finir',      p:0, s:'Je ___ mes devoirs quand le téléphone a sonné.' },
  { t:'imparfait', v:'briller',    p:2, s:'Le soleil ___ et les oiseaux chantaient.' },
  { t:'imparfait', v:'regarder',   p:3, s:'Nous ___ un film tous les vendredis soir.' },
  { t:'imparfait', v:'chanter',    p:1, s:'Tu ___ toujours la même chanson dans la voiture.' },
  { t:'imparfait', v:'lire',       p:5, s:'Ils ___ beaucoup, avant d’avoir un téléphone.' },
  { t:'imparfait', v:'prendre',    p:0, s:'Chaque matin, je ___ le bus de 7 h 30.' },

  /* Passé simple */
  { t:'passeSimple', v:'ouvrir',   p:2, s:'Il ___ la porte et entra sans un mot.' },
  { t:'passeSimple', v:'pousser',  p:2, s:'Il ___ un cri, et tout le monde se retourna.' },
  { t:'passeSimple', v:'quitter',  p:5, s:'Les chevaliers ___ le château au lever du jour.' },
  { t:'passeSimple', v:'partir',   p:0, s:'Je ___ alors que la nuit tombait sur la ville.' },
  { t:'passeSimple', v:'mourir',   p:2, s:'Le vieux roi ___ trois jours plus tard.' },
  { t:'passeSimple', v:'apprendre',p:3, s:'Nous ___ la nouvelle le lendemain matin.' },
  { t:'passeSimple', v:'perdre',   p:2, s:'L’empereur ___ la bataille en une seule journée.' },
  { t:'passeSimple', v:'écrire',   p:5, s:'Ils ___ une lettre au directeur du journal.' },
  { t:'passeSimple', v:'avoir',    p:2, s:'Quand il vit le dragon, il ___ très peur.' },
  { t:'passeSimple', v:'savoir',   p:0, s:'Je ___ la vérité bien plus tard.' },
  { t:'passeSimple', v:'donner',   p:4, s:'Vous ___ la réponse sans hésiter une seconde.' },
  { t:'passeSimple', v:'prendre',  p:2, s:'Le héros ___ son épée et s’avança vers l’ombre.' },

  /* Conditionnel présent */
  { t:'condPresent', v:'apprendre',p:0, s:'Si j’avais le temps, je ___ à jouer du piano.' },
  { t:'condPresent', v:'pouvoir',  p:1, s:'Tu ___ me prêter ton stylo, s’il te plaît ?' },
  { t:'condPresent', v:'gagner',   p:2, s:'Avec un peu plus d’entraînement, il ___ ce match.' },
  { t:'condPresent', v:'arriver',  p:3, s:'Si nous partions maintenant, nous ___ à l’heure.' },
  { t:'condPresent', v:'vouloir',  p:4, s:'Vous ___ un peu d’eau ?' },
  { t:'condPresent', v:'aimer',    p:5, s:'Ils ___ bien venir, mais ils travaillent demain.' },
  { t:'condPresent', v:'dire',     p:0, s:'À ta place, je ___ la vérité.' },
  { t:'condPresent', v:'courir',   p:1, s:'Si tu t’entraînais un peu, tu ___ beaucoup plus vite.' },
  { t:'condPresent', v:'devoir',   p:2, s:'D’après la radio, il ___ neiger demain matin.' },
  { t:'condPresent', v:'vouloir',  p:3, s:'Nous ___ vous poser une question.' },
  { t:'condPresent', v:'faire',    p:0, s:'Si j’étais riche, je ___ le tour du monde.' },
  { t:'condPresent', v:'venir',    p:5, s:'Ils ___ plus souvent s’ils habitaient moins loin.' },

  /* Conditionnel passé */
  { t:'condPasse', v:'venir',      p:0, s:'Si j’avais su, je ___ beaucoup plus tôt.' },
  { t:'condPasse', v:'pouvoir',    p:1, s:'Tu ___ me prévenir avant de partir !' },
  { t:'condPasse', v:'rater',      p:2, s:'Sans ton aide, il ___ son examen.' },
  { t:'condPasse', v:'arriver',    p:3, s:'Nous ___ à l’heure si le train n’avait pas eu de retard.' },
  { t:'condPasse', v:'aimer',      p:4, s:'Vous ___ ce livre, j’en suis certain.' },
  { t:'condPasse', v:'gagner',     p:5, s:'Ils ___ le tournoi s’ils avaient mieux joué.' },
  { t:'condPasse', v:'vouloir',    p:0, s:'Je ___ te le dire, mais j’ai complètement oublié.' },
  { t:'condPasse', v:'quitter',    p:2, s:'D’après la police, le suspect ___ la ville dans la nuit.' },
  { t:'condPasse', v:'devoir',     p:1, s:'Tu ___ faire un peu plus attention !' },
  { t:'condPasse', v:'voir',       p:3, s:'Nous ___ la fin du film si nous étions partis à l’heure.' },
  { t:'condPasse', v:'savoir',     p:5, s:'S’ils avaient écouté en cours, ils ___ répondre.' },
  { t:'condPasse', v:'partir',     p:2, s:'Il ___ sans rien dire, mais personne ne l’a cru.' },

  /* Plus-que-parfait */
  { t:'plusQueParfait', v:'commencer',  p:2, s:'Quand je suis arrivé, le film ___ depuis dix minutes.' },
  { t:'plusQueParfait', v:'oublier',    p:1, s:'Tu ___ tes clés avant même de sortir de chez toi.' },
  { t:'plusQueParfait', v:'voir',       p:2, s:'Il a raconté qu’il ___ un fantôme dans le grenier.' },
  { t:'plusQueParfait', v:'partir',     p:3, s:'Nous ___ avant que l’orage n’éclate.' },
  { t:'plusQueParfait', v:'lire',       p:4, s:'Vous ___ le livre avant d’aller voir le film ?' },
  { t:'plusQueParfait', v:'manger',     p:5, s:'Ils ___ toute la pizza avant notre arrivée.' },
  { t:'plusQueParfait', v:'savoir',     p:0, s:'Si j’___, je serais venu bien plus tôt.' },
  { t:'plusQueParfait', v:'partir',     p:2, s:'Le train ___ quand nous sommes arrivés sur le quai.' },
  { t:'plusQueParfait', v:'travailler', p:3, s:'Nous étions épuisés : nous ___ toute la journée.' },
  { t:'plusQueParfait', v:'voir',       p:1, s:'Tu m’as dit que tu ___ ce film au moins trois fois.' },
  { t:'plusQueParfait', v:'vivre',      p:5, s:'Ils ___ dans cette ville pendant dix ans avant de déménager.' },
  { t:'plusQueParfait', v:'oublier',    p:0, s:'Je ___ mon sac à la maison : quelle galère.' }
];

/* ---------- Banque d'erreurs à corriger ----------
   before + <erreur> + after. L'élève ne retape que le verbe.
------------------------------------------------------------- */

const CORRECTIONS = [
  { t:'condPasse', before:'Il ', wrong:'aurait venu', after:' hier soir.',
    answer:['serait venu'], why:'<b>venir</b> se conjugue avec l’auxiliaire <b>être</b>, jamais avoir.' },
  { t:'plusQueParfait', before:'Si ', wrong:'j’aurais su', after:', je serais resté.',
    answer:['avais su'], d:'j’avais su', why:'Après <b>si</b>, jamais de conditionnel : on met le plus-que-parfait.' },
  { t:'imparfait', before:'Quand j’étais petit, je ', wrong:'jouerais', after:' dans la rue.',
    answer:['jouais'], why:'Une habitude passée se raconte à l’imparfait, pas au conditionnel.' },
  { t:'imparfait', before:'Nous ', wrong:'travaillons', after:' beaucoup l’année dernière.',
    answer:['travaillions'], why:'« l’année dernière » impose le passé : travaill + <b>ions</b>.' },
  { t:'condPresent', before:'Je ', wrong:'voudrai', after:' un café, s’il vous plaît.',
    answer:['voudrais'], why:'La politesse demande le conditionnel : <b>-ais</b>, pas <b>-ai</b> (qui serait le futur).' },
  { t:'condPresent', before:'Vous ', wrong:'serez', after:' gentils de m’aider.',
    answer:['seriez'], why:'Formule de politesse → conditionnel présent : <b>vous seriez</b>.' },
  { t:'plusQueParfait', before:'Elle ', wrong:'avait allée', after:' à Paris en 2019.',
    answer:['était allée'], why:'<b>aller</b> prend l’auxiliaire être, et le participe s’accorde : elle était allé<b>e</b>.' },
  { t:'plusQueParfait', before:'Ils ', wrong:'avaient partis', after:' très tôt ce matin-là.',
    answer:['étaient partis'], why:'<b>partir</b> prend être. L’accord (partis) était déjà bon, c’est l’auxiliaire qui clochait.' },
  { t:'passeSimple', before:'Il ', wrong:'prena', after:' son sac et sortit.',
    answer:['prit'], why:'<b>prendre</b> suit la famille du -is : je pris, tu pris, il <b>prit</b>.' },
  { t:'passeSimple', before:'Nous ', wrong:'allames', after:' au cinéma ce soir-là.',
    answer:['allâmes'], why:'Au passé simple, le circonflexe de <b>nous</b> et <b>vous</b> est obligatoire.' },
  { t:'condPasse', before:'Tu ', wrong:'aurais dus', after:' me prévenir.',
    answer:['aurais dû'], why:'Avec <b>avoir</b>, pas d’accord avec le sujet. Et le participe de devoir s’écrit <b>dû</b>.' },
  { t:'passeSimple', before:'Le roi ', wrong:'mourait', after:' trois jours plus tard.',
    answer:['mourut'], why:'Un événement daté et définitif dans un récit → passé simple, pas imparfait.' },
  { t:'passeSimple', before:'Ils ', wrong:'finissèrent', after:' leur travail avant la nuit.',
    answer:['finirent'], why:'Le radical du passé simple de finir est <b>fin-</b> : ils <b>finirent</b>. Le -iss- appartient à l’imparfait.' },
  { t:'condPasse', before:'Si tu étais venu, tu ', wrong:'aurais vois', after:' le spectacle.',
    answer:['aurais vu'], why:'Après l’auxiliaire, il faut le <b>participe passé</b> : voir → <b>vu</b>.' },
  { t:'plusQueParfait', before:'Nous ', wrong:'avions mangés', after:' toute la pizza.',
    answer:['avions mangé'], why:'Avec <b>avoir</b>, le participe ne s’accorde pas avec le sujet.' },
  { t:'plusQueParfait', before:'Si vous ', wrong:'seriez', after:' venus, on aurait bien ri.',
    answer:['étiez'], why:'Après <b>si</b>, on ne met jamais de conditionnel : ici, plus-que-parfait (vous étiez venus).' },
  { t:'plusQueParfait', before:'Je serais parti plus tôt si ', wrong:'j’aurais', after:' pu.',
    answer:['avais'], d:'j’avais', why:'Même règle : si + plus-que-parfait, et le conditionnel passé dans l’autre moitié.' },
  { t:'plusQueParfait', before:'Nous ', wrong:'étions travaillé', after:' tout l’été.',
    answer:['avions travaillé'], why:'<b>travailler</b> prend l’auxiliaire avoir. Seule une petite liste de verbes prend être.' },
  { t:'plusQueParfait', before:'Il ', wrong:'avait resté', after:' à la maison toute la journée.',
    answer:['était resté'], why:'<b>rester</b> fait partie des verbes qui prennent <b>être</b>.' },
  { t:'condPresent', before:'Je ', wrong:'parlerai', after:' plus fort si j’étais toi.',
    answer:['parlerais'], why:'« si j’étais » = hypothèse → conditionnel présent. Test : <i>nous parlerions</i>, donc <b>-ais</b>.' }
];
