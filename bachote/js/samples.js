/* ============================================================
   BACHOTE — paquets d'exemple.
   Un site de révision vide est un site mort : on livre du contenu
   réel, utilisable tel quel, calé sur le programme français.
   ============================================================ */
(function () {
  "use strict";

  window.SUBJECTS = [
    { k: "svt",   label: "SVT" },
    { k: "hist",  label: "Histoire-Géo" },
    { k: "philo", label: "Philo" },
    { k: "ses",   label: "SES" },
    { k: "lang",  label: "Français / Langues" },
    { k: "autre", label: "Autre" }
  ];

  window.SUBJECT_LABEL = function (k) {
    for (var i = 0; i < window.SUBJECTS.length; i++) {
      if (window.SUBJECTS[i].k === k) return window.SUBJECTS[i].label;
    }
    return "Autre";
  };

  window.SAMPLES = [
    {
      name: "SVT — La cellule et la division",
      subject: "svt",
      pairs: [
        ["mitose", "Division cellulaire produisant deux cellules filles génétiquement identiques à la cellule mère."],
        ["méiose", "Succession de deux divisions qui produit quatre cellules haploïdes (les gamètes) à partir d'une cellule diploïde."],
        ["chromosome", "Molécule d'ADN condensée et associée à des protéines, qui porte l'information génétique."],
        ["ADN", "Acide désoxyribonucléique : molécule en double hélice qui porte l'information génétique de la cellule."],
        ["gène", "Séquence d'ADN qui code une information héréditaire, le plus souvent la fabrication d'une protéine."],
        ["allèle", "Version différente d'un même gène."],
        ["cellule diploïde", "Cellule qui possède ses chromosomes par paires, notée 2n."],
        ["cellule haploïde", "Cellule qui ne possède qu'un seul exemplaire de chaque chromosome, notée n."],
        ["ribosome", "Organite qui assemble les acides aminés pour fabriquer les protéines."],
        ["mitochondrie", "Organite qui produit l'ATP, la forme d'énergie utilisable par la cellule."],
        ["membrane plasmique", "Bicouche de lipides qui délimite la cellule et contrôle les échanges avec l'extérieur."],
        ["transcription", "Copie d'un gène de l'ADN en ARN messager, réalisée dans le noyau."],
        ["traduction", "Lecture de l'ARN messager par le ribosome pour fabriquer une protéine."],
        ["génotype", "Ensemble des allèles que possède un individu."],
        ["phénotype", "Ensemble des caractères observables d'un individu."]
      ]
    },
    {
      name: "Histoire — La Révolution française",
      subject: "hist",
      pairs: [
        ["Ancien Régime", "Organisation politique et sociale de la France avant 1789, fondée sur la monarchie absolue et la société d'ordres."],
        ["monarchie absolue", "Régime dans lequel le roi détient tous les pouvoirs, qu'il tient de Dieu."],
        ["société d'ordres", "Division de la société en trois ordres — clergé, noblesse, tiers état — aux droits inégaux."],
        ["tiers état", "Ensemble de la population qui n'appartient ni au clergé ni à la noblesse, soit environ 97 % des Français."],
        ["cahiers de doléances", "Registres dans lesquels les Français consignent leurs plaintes et leurs souhaits avant les États généraux de 1789."],
        ["États généraux", "Assemblée des représentants des trois ordres, convoquée par le roi et réunie en mai 1789."],
        ["serment du Jeu de paume", "Le 20 juin 1789, les députés du tiers état jurent de ne pas se séparer avant d'avoir donné une constitution à la France."],
        ["Déclaration des droits de l'homme et du citoyen", "Texte du 26 août 1789 qui énonce les droits naturels de l'homme et l'égalité devant la loi."],
        ["monarchie constitutionnelle", "Régime dans lequel les pouvoirs du roi sont limités par une constitution ; en France, de 1791 à 1792."],
        ["suffrage censitaire", "Système où seuls les citoyens payant un impôt minimum, le cens, ont le droit de vote."],
        ["sans-culottes", "Militants populaires parisiens, artisans et boutiquiers, moteurs de la radicalisation de la Révolution."],
        ["Convention", "Assemblée qui proclame la République le 22 septembre 1792 et juge Louis XVI."],
        ["Terreur", "Période de 1793-1794 marquée par un gouvernement d'exception et la répression massive des opposants."],
        ["18 Brumaire", "Coup d'État du 9 novembre 1799 par lequel Bonaparte renverse le Directoire et met fin à la Révolution."]
      ]
    },
    {
      name: "Philosophie — Notions clés",
      subject: "philo",
      pairs: [
        ["conscience", "Capacité d'un sujet à se représenter le monde et à se savoir lui-même en train de le faire."],
        ["inconscient", "Ensemble des processus psychiques qui échappent à la conscience tout en agissant sur elle."],
        ["autrui", "L'autre en tant qu'il est un autre moi : à la fois semblable à moi et irréductiblement différent."],
        ["liberté", "Capacité de se déterminer soi-même, sans être contraint par une force extérieure ou intérieure."],
        ["déterminisme", "Thèse selon laquelle tout événement est l'effet nécessaire de causes antérieures."],
        ["libre arbitre", "Pouvoir de choisir entre plusieurs possibles sans y être nécessité."],
        ["devoir", "Obligation morale que l'on s'impose par la raison, indépendamment de son intérêt."],
        ["vérité", "Accord d'un jugement avec ce qui est."],
        ["empirisme", "Doctrine selon laquelle toute connaissance provient de l'expérience."],
        ["rationalisme", "Doctrine selon laquelle la raison est la source principale de la connaissance."],
        ["État", "Institution qui détient le monopole de la violence légitime sur un territoire donné."],
        ["justice", "Ce qui est conforme au droit ; et la vertu qui consiste à rendre à chacun ce qui lui est dû."],
        ["aliénation", "État d'un sujet dépossédé de lui-même, devenu étranger à sa propre nature."],
        ["dialectique", "Mouvement de pensée qui progresse par opposition puis dépassement des contradictions."]
      ]
    },
    {
      name: "SES — Les bases de l'économie",
      subject: "ses",
      pairs: [
        ["PIB", "Valeur totale des richesses produites sur un territoire pendant un an."],
        ["croissance économique", "Augmentation durable de la production de biens et de services, mesurée par la variation du PIB."],
        ["inflation", "Hausse générale et durable du niveau des prix."],
        ["déflation", "Baisse générale et durable du niveau des prix."],
        ["chômage", "Situation d'une personne sans emploi, disponible pour travailler et à la recherche d'un emploi."],
        ["offre", "Quantité d'un bien que les producteurs souhaitent vendre à un prix donné."],
        ["demande", "Quantité d'un bien que les consommateurs souhaitent acheter à un prix donné."],
        ["monopole", "Situation de marché dans laquelle un seul vendeur fait face à de nombreux acheteurs."],
        ["oligopole", "Marché dominé par un petit nombre de vendeurs."],
        ["externalité", "Effet de l'activité d'un agent économique sur autrui, sans compensation par le marché."],
        ["politique monétaire", "Action de la banque centrale sur la quantité de monnaie en circulation et sur les taux d'intérêt."],
        ["politique budgétaire", "Utilisation des dépenses et des recettes de l'État pour agir sur l'activité économique."],
        ["productivité", "Quantité produite rapportée aux facteurs de production utilisés."],
        ["pouvoir d'achat", "Quantité de biens et de services qu'un revenu permet d'acheter."]
      ]
    },
    {
      name: "Français — Les figures de style",
      subject: "lang",
      pairs: [
        ["métaphore", "Rapprochement de deux éléments sans outil de comparaison : « cet homme est un lion »."],
        ["comparaison", "Rapprochement de deux éléments à l'aide d'un outil de comparaison : « comme », « tel », « semblable à »."],
        ["personnification", "Attribution de caractéristiques humaines à un objet, un animal ou une idée."],
        ["hyperbole", "Exagération volontaire destinée à frapper l'esprit."],
        ["litote", "Dire moins pour faire entendre plus : « je ne te hais point »."],
        ["euphémisme", "Atténuation d'une réalité déplaisante : « il nous a quittés »."],
        ["oxymore", "Association de deux termes contradictoires : « une obscure clarté »."],
        ["antithèse", "Opposition de deux idées ou de deux termes dans une même phrase."],
        ["anaphore", "Répétition d'un même mot au début de phrases ou de vers successifs."],
        ["allitération", "Répétition d'un même son consonne dans une suite de mots."],
        ["assonance", "Répétition d'un même son voyelle dans une suite de mots."],
        ["gradation", "Succession de termes d'intensité croissante ou décroissante."],
        ["chiasme", "Construction en miroir, selon le schéma AB — BA."],
        ["métonymie", "Désignation d'une chose par un terme qui lui est lié : « boire un verre »."],
        ["périphrase", "Remplacement d'un mot par une expression qui le décrit : « la Ville Lumière »."]
      ]
    }
  ];
})();
