# Cancha – Starter Firebase (Auth + Firestore)

## Étapes
1. Projet Firebase → activer Auth (Google) + Firestore.
2. Auth → Authorized domains : ajouter `devopstg76.github.io`.
3. Copier `js/firebase-config.sample.js` → `js/firebase-config.js` et remplir :
   - apiKey, authDomain, projectId
   - CANCHA_SHEET.pubUrl (lien `pubhtml`) et editUrl
4. Firestore → Rules : coller `firestore.rules`, Publish.
5. Commit & push sur GitHub Pages.

## Modèle de réservation
Doc id = `YYYYMMDD_court_HHMM` → empêche les doublons (un seul doc par créneau).
