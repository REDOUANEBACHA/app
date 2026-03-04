# Commandes de Build - GolfTracker

## Builds Android

### Dev Client (pour développement local)
```bash
npx eas-cli build --platform android --profile development
```
- Installe un **client Expo** sur le téléphone
- Se connecte à `expo start` sur ton Mac
- Hot reload, logs en temps réel
- **Usage** : développement et debug

### Preview APK (pour tester l'app réelle)
```bash
npx eas-cli build --platform android --profile preview
```
- Génère un **APK standalone** installable directement
- L'app fonctionne sans connexion au Mac
- Partageable via lien de téléchargement
- **Usage** : tester l'app comme un vrai utilisateur

### Production AAB (pour le Play Store)
```bash
npx eas-cli build --platform android --profile production
```
- Génère un **AAB** (Android App Bundle)
- Format requis par le Google Play Store
- Version auto-incrémentée
- **Usage** : publication sur le Play Store

---

## Builds iOS

### Simulateur (dev local)
```bash
npx eas-cli build --platform ios --profile development
```

### Preview (TestFlight / appareil)
```bash
npx eas-cli build --platform ios --profile preview
```

### Production (App Store)
```bash
npx eas-cli build --platform ios --profile production
```

---

## Mise à jour rapide (sans rebuild)

Pour les changements JS uniquement (couleurs, textes, logique) :
```bash
npx eas-cli update --branch preview --message "description du changement"
```
- Instantané, pas de rebuild natif
- L'app se met à jour au prochain lancement

---

## Commandes utiles

| Commande | Description |
|----------|-------------|
| `npx eas-cli build:list` | Voir l'historique des builds |
| `npx eas-cli build:view` | Détails du dernier build |
| `npx eas-cli env:list` | Voir les variables d'environnement EAS |
| `npx eas-cli device:list` | Appareils enregistrés (iOS) |
| `npx eas-cli update:list` | Historique des mises à jour OTA |
