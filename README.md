# HoshiWish — 25 Vœux

Application web (PWA) personnalisée pour suivre l'avancement de tes 25 vœux, avec ton vrai logo, un planning par fréquence, un journal et des photos-souvenirs pour chaque objectif, des statistiques globales et des badges.

## Structure du projet
```
25-voeux-app/
├── index.html          → page principale (onglets Vœux / Planning / Stats / Musique)
├── css/style.css        → thème lavande/violet pastel inspiré du logo
├── js/data.js            → la liste de tes 25 vœux (modifiable)
├── js/app.js              → toute la logique de l'app
├── manifest.json          → permet d'installer l'app sur l'écran d'accueil
├── sw.js                  → mode hors-ligne basique
├── icons/icon-192.png     → icône générée à partir de TON logo
└── icons/icon-512.png     → icône générée à partir de TON logo
```

## Fonctionnalités
- 📅 **Planning** : tes vœux regroupés par fréquence (jour / semaine / mois / année)
- 📈 **Suivi détaillé** : statut (à faire / en cours / accompli) et notes pour chacun des 25 vœux
- 🏆 **Statistiques globales** : % accompli, répartition par statut, nombre d'entrées de journal et de photos
- 🏅 **Badges** : petites récompenses débloquées selon ta progression (premiers pas, 5/10/20/25 vœux, journal assidu, album souvenirs, mélomane...)
- 📖 **Journal personnel** lié à chaque vœu (une entrée datée à chaque fois que tu écris)
- 📸 **Photos-souvenirs** par objectif, avec visionneuse plein écran et suppression
- 🎵 **Espace musique** : ajoute et écoute des fichiers audio déjà présents sur ton téléphone
- 💜 **Identité lavande/violet pastel**, typographie inspirée de la signature de ton logo
- 🖼️ **Ton vrai logo** intégré comme icône de l'app
- 📱 Interface pensée mobile, installable comme une vraie application (PWA)
- 💾 **Sauvegarde locale** : progrès, notes, journal, photos et statut de musique enregistrés directement sur ton téléphone

## 1. Publier le code sur GitHub
1. Crée un nouveau dépôt sur GitHub, par exemple `25-voeux`.
2. Ajoute tous les fichiers de ce dossier tels quels, en conservant la structure (via "Add file → Upload files" sur GitHub, ou en ligne de commande ci-dessous).
3. Commit + push.

```bash
cd 25-voeux-app
git init
git add .
git commit -m "App HoshiWish — 25 vœux"
git branch -M main
git remote add origin https://github.com/TON-PSEUDO/25-voeux.git
git push -u origin main
```

## 2. Ouvrir l'app sur ton téléphone (comme une vraie app)
1. Dans le dépôt GitHub : **Settings → Pages**.
2. Source : branche `main`, dossier `/ (root)`, puis Save.
3. GitHub te donne une adresse du type `https://ton-pseudo.github.io/25-voeux/`.
4. Ouvre cette adresse dans le navigateur de ton téléphone.
5. Android (Chrome) : menu ⋮ → **"Ajouter à l'écran d'accueil"**.
   iPhone (Safari) : bouton Partager → **"Sur l'écran d'accueil"**.

L'app s'ouvre alors avec ton logo, en plein écran, comme une app installée.

## À savoir

**Musique** — pour des raisons de vie privée, un navigateur ne peut pas parcourir automatiquement toute ta bibliothèque musicale. Le bouton "+ Ajouter des musiques" ouvre le sélecteur de fichiers : choisis tes morceaux et ils s'ajoutent à la playlist. C'est à refaire à chaque nouvelle session (le navigateur ne retient pas les fichiers sélectionnés d'une ouverture à l'autre).

**Photos et stockage** — les photos sont enregistrées directement dans la mémoire du navigateur (`localStorage`), qui a une capacité limitée (quelques Mo selon les téléphones). Si tu ajoutes beaucoup de photos en haute résolution, tu peux atteindre cette limite ; l'app t'avertira si l'enregistrement échoue. Pour un usage intensif des photos, on pourra plus tard brancher un vrai stockage en ligne — dis-le-moi si tu veux qu'on fasse évoluer l'app dans ce sens.

**Sauvegarde** — tout (statuts, notes, journal, photos) reste sur ton téléphone tant que tu ne vides pas les données du navigateur pour ce site. Ce n'est pas synchronisé entre plusieurs appareils pour l'instant.
