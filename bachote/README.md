# 📓 Bachote

**Colle ton cours, on fabrique tes fiches.**

Un site pour apprendre ses définitions : flashcards, QCM, jeu d'association,
mode « écrire » et révision espacée. Gratuit, sans compte, en français.

## Pourquoi ce site existe

Le vrai obstacle des applis de fiches, ce n'est pas de réviser — c'est de
**créer le paquet**. Taper 40 termes ET 40 définitions à la main, c'est une
demi-heure de corvée avant même de commencer à travailler, et c'est là que la
plupart des gens abandonnent.

Bachote part de là : tu **colles ton cours**, il en fait des cartes.

## Ce que ça fait

- **Import par collage** — colle des lignes `mot : définition`, une par carte.
  Le séparateur est détecté **ligne par ligne** (`:`, `—`, `-`, `=`, tabulation),
  donc un copier-coller de notes qui mélange les styles passe quand même. Les
  puces et numérotations (`-`, `•`, `3.`, `2)`) sont retirées, mais une date en
  début de ligne (`1789 : …`) est préservée.
- **5 façons de travailler** :
  - 🧠 **Révision intelligente** — répétition espacée (SM-2, l'algorithme d'Anki).
    Les cartes reviennent juste avant que tu les oublies.
  - 🗂️ **Flashcards** — retourne, vérifie, passe à la suivante.
  - 🔗 **Associer** — relie chaque mot à sa définition, par manches.
  - 📋 **QCM** — 4 propositions, les mauvaises piochées dans le même paquet.
  - ✍️ **Écrire** — retrouve le mot à partir de la définition. Tolérant aux
    accents, à la casse, aux articles en trop et à une faute de frappe.
- **Partage par lien** — le paquet est encodé dans l'URL. Aucun serveur : tu
  colles le lien dans le groupe de classe, les autres l'ouvrent et l'ont.
- **Thème clair / sombre**, sons discrets, raccourcis clavier.
- **5 paquets d'exemple** calés sur le programme français (SVT, Histoire, Philo,
  SES, figures de style) pour ne pas démarrer sur un écran vide.

## Vie privée

Tout est dans le `localStorage` du navigateur. **Aucune donnée n'est envoyée
nulle part** : pas de serveur, pas de compte, pas de traceur.

## Lancer le site

100 % statique, aucune dépendance, aucun script de build.

```bash
python3 -m http.server 8000   # puis ouvrir http://localhost:8000
```

Ou simplement ouvrir `index.html`. En ligne : déposer le dossier tel quel sur
Netlify, Vercel, GitHub Pages…

## Raccourcis clavier

| Touche | Effet |
|---|---|
| `Espace` | Retourner la carte (flashcards / révision) |
| `1` → `4` | Noter la carte, ou choisir une réponse au QCM |
| `←` `→` | Carte précédente / suivante (flashcards) |
| `Échap` | Quitter la session |

## Structure

```
index.html        Page unique (5 écrans)
css/style.css     Design « cahier d'école » : papier réglé, encre, surligneur
js/store.js       Données, localStorage, SM-2, import/export, partage
js/app.js         Routeur, écrans, les 5 modes d'étude
js/samples.js     Paquets d'exemple + liste des matières
js/sound.js       Sons de synthèse (Web Audio, aucun fichier audio)
```

## Notes techniques

- **SM-2** : `nextInterval()` est la seule source de vérité — les boutons
  annoncent exactement le délai que `grade()` appliquera. Modificateurs à la
  Anki : *Difficile* ralentit (×1,25), *Facile* accélère (×1,3).
- Modifier un paquet **conserve la progression** des cartes dont le terme n'a
  pas changé.
- Le flip 3D garde une hauteur fixe recto/verso pour que la carte ne saute pas.
- Aucune dépendance externe hors polices Google Fonts (avec repli système).
