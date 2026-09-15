# ✍️ Conjugo

**Maîtrise tes conjugaisons.** 5 temps. Des défis. Zéro prise de tête.

Un site d'entraînement à la conjugaison française pensé pour des ados : leçons très courtes,
défi immédiat après chaque explication, retour instantané, séries, XP et trophées.

## 🎯 Les 5 temps — et rien d'autre

| Temps | Ce qu'il exprime | Difficulté |
|---|---|---|
| 🌙 **Imparfait** | Le décor et les habitudes | Accessible |
| 📖 **Passé simple** | Le temps des récits | Exigeant |
| 🔮 **Conditionnel présent** | Les « si » et la politesse | Intermédiaire |
| 💭 **Conditionnel passé** | Les regrets et les reproches | Exigeant |
| ⏮️ **Plus-que-parfait** | Le passé avant le passé | Intermédiaire |

Aucun autre temps n'est enseigné. Le présent, le futur et le passé composé n'apparaissent
que comme **mauvaises réponses** dans les QCM — ce sont précisément les confusions que les
leçons mettent en garde (*je parlerai* / *je parlerais*, *il a venu* / *il est venu*).

## 📚 Comment on apprend

Chaque leçon suit le même rythme, en 8 étapes courtes :

1. **À quoi ça sert** — 3 ou 4 emplois, un exemple chacun.
2. **Mini-défi** — une question, tout de suite.
3. **Comment le former** — radical, terminaisons, auxiliaire, radicaux irréguliers.
4. **Mini-défi** — cette fois il faut écrire la forme.
5. **Exemples** — six personnes, six verbes, plus un tableau complet.
6. **Le piège** — la faute classique, barrée, puis corrigée et expliquée.
7. **Mini-défi** — dernière vérification.
8. **Récap** — quatre points à retenir.

Les mini-défis comptent comme de vraies réponses : ils rapportent de l'XP et font monter
la barre de maîtrise.

## ✏️ Conjugaison écrite

Le mode principal : **tu écris, le site corrige**.

1. Choisis un verbe (recherche insensible aux accents parmi les 68) ou prends-en un au hasard.
2. Choisis **un temps** — ou **les 5 temps** d'affilée.
3. Écris les six personnes. `Entrée` valide la ligne et saute à la suivante, `Vérifier` valide tout.

Chaque ligne est jugée séparément : bordure verte si c'est juste, rouge sinon, avec **la bonne
réponse affichée dessous**, terminaison en couleur. Une case laissée vide compte comme fausse.
À la fin, le **tableau complet du verbe** dans les temps travaillés reste affiché comme fiche
de référence.

## 🎮 Questions mélangées

Quatre formats pour éviter la monotonie :

- **Trouve la forme** — QCM à trous (« Hier, quand j'étais petit, je ___ souvent au parc. »).
- **Conjugue** — saisie libre (« Conjugue *prendre* à la 1ʳᵉ personne du singulier à l'imparfait. »).
- **Identifie le temps** — une phrase, le verbe en évidence, 4 temps au choix.
- **Corrige l'erreur** — une phrase fautive (« Il *aurait venu* hier soir. »), à réparer.

Modes : mélange des 5 temps (10 questions), marathon (20 questions) ou un temps ciblé.

## 📈 Progression

- **XP et niveaux** — bonus croissant selon la série en cours.
- **Série** (🔥) — les bonnes réponses d'affilée, remise à zéro à la première erreur.
- **Maîtrise par temps** — +5 % par bonne réponse, −3 % par erreur.
- **Objectif du jour** — 20 questions, et un compteur de jours d'affilée.
- **15 trophées** — dont un « Maître de… » par temps, à 85 % de maîtrise.

Tout est enregistré dans le navigateur (`localStorage`). Aucun compte, aucun serveur.

### Les accents comptent

Une saisie juste aux accents près (*allames* pour *allâmes*) est acceptée, mais elle rapporte
**moitié moins d'XP** et affiche un rappel avec l'orthographe exacte. On corrige sans casser
la motivation.

## 🚀 Lancer le site

Site **100 % statique**, sans dépendance ni build (seules les polices viennent de Google Fonts).

```bash
# le plus simple
open conjugaison/index.html

# ou avec un petit serveur, depuis la racine du dépôt
python3 -m http.server 8000     # puis http://localhost:8000/conjugaison/
```

## 🗂️ Structure

```
index.html          Page unique (toutes les vues)
css/style.css       Design : thème sombre, une couleur par temps
js/verbs.js         68 verbes, décrits par leurs radicaux
js/conjugate.js     Moteur : terminaisons, temps composés, accords, correction des saisies
js/content.js       Les 5 leçons, 60 phrases d'exercice, 20 erreurs à corriger
js/store.js         XP, niveaux, séries, maîtrise, trophées, sauvegarde
js/quiz.js          Génération et mélange des questions
js/app.js           Interface : accueil, leçons, conjugaison écrite, quiz, progression
```

## 🛠️ Technique

- **Conjugaison par radicaux.** Chaque verbe déclare ses radicaux (imparfait, futur, passé
  simple), son auxiliaire et son participe passé ; le moteur y colle les terminaisons.
  Deux radicaux sont prévus là où l'orthographe bascule (*je mangeais* / *nous mangions*,
  *je commençai* / *ils commencèrent*). **2040 formes** sont générées et vérifiées, y compris
  les pièges : *nous voyions*, *nous riions*, *je naquis*, *nous tînmes*, *j'appellerais*.
- **Correction des saisies** tolérante au pronom (« je prenais » ou « prenais ») et à la
  ponctuation, mais qui distingue l'accent manquant de l'erreur de conjugaison.
- **Sons** générés à la volée via la Web Audio API, **confettis** sur `<canvas>` : aucun fichier
  externe, aucune bibliothèque.
- **Responsive** de 360 px au grand écran, navigation au clavier (A–D ou 1–4 pour les QCM,
  Entrée pour valider et enchaîner), et `prefers-reduced-motion` respecté.

---

Fait pour celles et ceux qui écrivent encore « il aurait venu ».
