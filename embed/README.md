# Bachote — module d'étude à intégrer

Réutilise **tout le système d'étude de Bachote** (création de paquets, 5 types
d'étude, répétition espacée SM-2, progression) dans un projet plus grand,
**quelle que soit sa techno** — sans build, sans dépendance.

## Contenu

| Fichier | Rôle |
|---|---|
| `bachote.html` | **Le module entier en un seul fichier** (HTML + CSS + JS inlinés). Rien d'autre à charger. |
| `bachote-study.js` | Un petit composant web `<bachote-study>` qui affiche `bachote.html` proprement dans n'importe quel framework. |

Le composant charge `bachote.html` dans un **iframe** : les styles, le routage
(`#/…`) et le stockage de Bachote sont **totalement isolés** de ton appli hôte.
Rien ne peut entrer en conflit.

## Installation

Copie `bachote.html` et `bachote-study.js` quelque part dans les fichiers
statiques de ton projet (ex. `public/bachote/`).

### 1. HTML / n'importe quel site
```html
<script src="/bachote/bachote-study.js"></script>
<bachote-study src="/bachote/bachote.html" height="720"></bachote-study>
```
Ou sans le composant, un simple iframe :
```html
<iframe src="/bachote/bachote.html" style="width:100%;height:720px;border:0;border-radius:14px"></iframe>
```

### 2. React
Les composants web marchent tels quels en React.
```jsx
import { useEffect } from "react";

export default function Study() {
  useEffect(() => { import("/bachote/bachote-study.js"); }, []);
  return <bachote-study src="/bachote/bachote.html" height="720" />;
}
```
(En TypeScript, déclare l'élément : `declare global { namespace JSX { interface IntrinsicElements { "bachote-study": any } } }`.)

### 3. Vue 3
Dis à Vue que `bachote-study` est un élément natif :
```js
// main.js
app.config.compilerOptions.isCustomElement = (tag) => tag === "bachote-study";
```
```vue
<script setup>import "/bachote/bachote-study.js";</script>
<template>
  <bachote-study src="/bachote/bachote.html" height="720" />
</template>
```

### 4. Svelte / Angular / autres
Le composant est un standard **Custom Element** : `<bachote-study …>` fonctionne
partout. (Angular : ajoute `CUSTOM_ELEMENTS_SCHEMA` au module.)

## Options utiles

- **Ouvrir sur un écran précis** via le hash dans `src` :
  - `src="bachote.html#/timer"` → le minuteur d'étude
  - `src="bachote.html#/activity"` → la vue Activité
  - `src="bachote.html#/new"` → le choix du type de fiche
- **Hauteur** : attribut `height` (`"720"` ou `"80vh"`).
- **Pré-charger un paquet** : Bachote sait importer un paquet partagé par son
  lien `#/s/<code>` (génère le code avec le bouton « Partager » dans l'appli).
  Tu peux donc lancer l'iframe sur `bachote.html#/s/<code>`.

## Où sont stockées les données ?

Dans le `localStorage` du navigateur, sous la clé **`bachote.v1`** (même origine
que ton site). Rien n'est envoyé sur un serveur. L'élève peut aussi
exporter/importer ses fiches en fichier `.json` depuis l'accueil.
> Si ton projet utilisait déjà une clé `bachote.v1`, c'est le seul point à
> vérifier — sinon aucun risque de collision.

## Aller plus loin : la logique seule (sans interface)

`bachote.html` inclut `store.js`, qui expose une API globale **`window.Store`**
utilisable pour bâtir ta propre interface : `createDeck(name, subject, pairs, kind)`,
`grade(card, q)` (SM-2), `dueCards(deck)`, `award(correct)`, `exportAll()`,
`importAll(obj)`, `activitySummary()`… Si tu veux la **répétition espacée + le
stockage des cartes en module autonome** (sans l'UI Bachote), dis-le-moi : je te
sors `store.js` en petite lib indépendante.

## Régénérer `bachote.html`

C'est un build : il est produit à partir du dossier `bachote/` (concaténation
de `index.html` + `css/style.css` + `js/*.js`). Pour le reconstruire après une
modif de Bachote, relance le générateur `mkembed.js`.
