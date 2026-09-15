/* ============================================================
   BACHOTE — paquets d'exemple.
   Un site de révision vide est un site mort : on livre du contenu
   réel, utilisable tel quel, calé sur le programme français.
   ============================================================ */
(function () {
  "use strict";

  window.SUBJECTS = [
    { k: "svt",   label: "SVT" },
    { k: "phys",  label: "Physique-Chimie" },
    { k: "math",  label: "Maths" },
    { k: "hist",  label: "Histoire-Géo" },
    { k: "ses",   label: "SES" },
    { k: "philo", label: "Philo" },
    { k: "lang",  label: "Français" },
    { k: "angl",  label: "Anglais" },
    { k: "autre", label: "Autre" }
  ];

  window.SUBJECT_LABEL = function (k) {
    for (var i = 0; i < window.SUBJECTS.length; i++) {
      if (window.SUBJECTS[i].k === k) return window.SUBJECTS[i].label;
    }
    return "Autre";
  };

  /* Plus de paquets d'exemple : chacun crée les siens. */
})();
