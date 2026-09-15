# 🌍 GéoQuest

**Le jeu de géographie ultra addictif pour situer tous les pays du monde**, continent par continent, région par région.

Conçu pour les jeunes : graphismes soignés (dégradés animés, glassmorphism, confettis), sons, système de niveaux, séries, étoiles et trophées.

## 🎮 Le principe

1. Choisis un **mode de jeu** :
   - 🗺️ **Localiser** — clique le pays sur la carte.
   - 🚩 **Drapeaux** — retrouve le drapeau du pays (4 choix).
   - 🏛️ **Capitales** — retrouve la capitale du pays (4 choix).
2. Choisis un **continent** (Europe, Afrique, Asie, Amériques, Océanie).
3. Choisis une **sous-région** (Europe de l'Ouest, Afrique du Nord, Asie du Sud-Est, Caraïbes…),
   ou lance un **Défi continent** / le **Tour du monde**.
4. Réponds le plus vite et le plus juste possible ! Chaque mode a sa propre progression.

- ❤️ Des **vies** : chaque erreur en coûte une.
- 🔥 Une **série** (combo) qui fait grimper le score.
- ⚡ Un **bonus de rapidité** à chaque bonne réponse.
- ⭐ Des **étoiles** (jusqu'à 3) par région selon ta précision.
- 🏆 Des **niveaux, de l'XP et des trophées** à débloquer.
- 💾 Ta progression est **sauvegardée** automatiquement (dans le navigateur).

**193 pays souverains** répartis sur **24 sous-régions**.

## 🌐 Langues

Le site est traduit en **5 langues** : 🇫🇷 français (par défaut), 🇬🇧 anglais, 🇪🇸 espagnol,
🇮🇹 italien et 🇷🇺 russe. Le sélecteur de langue est dans la barre du haut ; le choix est
mémorisé. L'interface, les continents/régions, les **noms de pays** et les **capitales**
sont traduits (noms de pays issus de `world-countries` ; quelques capitales rares restent
sous leur forme internationale en russe).

## 🚀 Lancer le site

Le site est **100 % statique et autonome** (aucune connexion internet nécessaire, tout est embarqué).

- **Le plus simple** : ouvre `index.html` dans ton navigateur.
- **En local avec un petit serveur** (recommandé) :
  ```bash
  python3 -m http.server 8000
  # puis ouvre http://localhost:8000
  ```
- **En ligne** : héberge le dossier tel quel sur GitHub Pages, Netlify, Vercel, etc.

## 🗂️ Structure

```
index.html            Page unique (toutes les vues)
css/style.css         Design (thèmes par continent, animations, responsive)
js/regions.js         Continents & sous-régions (noms FR, couleurs, emojis)
js/app.js             Moteur de jeu (carte, score, vies, sons, confettis, sauvegarde)
data/geo-data.js      Données générées : frontières + infos des 193 pays
vendor/leaflet.*      Bibliothèque de carte Leaflet (embarquée en local)
```

## 🛠️ Technique

- Carte interactive avec **Leaflet** (rendu vectoriel, sans tuiles) — habillage sombre sur mesure.
- Détection du pays cliqué par **point-dans-polygone** maison, avec repli sur le centroïde le plus proche pour les micro-États.
- **Sons** générés à la volée via la Web Audio API (aucun fichier audio).
- **Confettis** dessinés sur `<canvas>` (aucune dépendance).
- Entièrement **responsive** (mobile / tablette / bureau) et adapté aux préférences de mouvement réduit.

## 📊 Sources des données

- **Frontières** : [Natural Earth](https://www.naturalearthdata.com/) via le paquet `world-atlas` (domaine public).
- **Métadonnées des pays** (noms français, drapeaux, capitales, régions) : paquet `world-countries` (ODbL).

## ✍️ Aussi dans ce dépôt

**[Conjugo](conjugaison/)** — un second site, indépendant : apprendre et maîtriser 5 temps de
la conjugaison française (imparfait, passé simple, conditionnel présent, conditionnel passé,
plus-que-parfait). Ouvre `conjugaison/index.html`.

---

Fait avec ❤️ pour les explorateur·rice·s.
