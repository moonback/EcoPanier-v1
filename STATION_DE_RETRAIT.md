# Station de Retrait - Guide d'utilisation

## Vue d'ensemble

La **Station de Retrait** est une interface publique permettant aux commerçants et aux lockers automatiques de valider le retrait des colis réservés par les clients via un scan de QR code.

## Accès à la Station de Retrait

### URL d'accès
```
/pickup
```

Cette route est **publique** et ne nécessite aucune authentification, permettant son utilisation sur n'importe quel appareil (tablette, smartphone, ordinateur).

### Depuis le Dashboard Commerçant
Les commerçants peuvent accéder rapidement à la station de retrait via le bouton **"Station de retrait"** dans l'en-tête de leur dashboard, qui ouvre l'interface dans un nouvel onglet.

## Fonctionnement

### 1. Scan du QR Code
- Le client présente le QR code de sa réservation (visible depuis son espace personnel)
- Le commerçant/locker clique sur **"Scanner le QR Code"**
- La caméra s'active automatiquement
- Le QR code est scanné et analysé instantanément

### 2. Vérification des informations
Après le scan, les informations suivantes s'affichent :
- Nom du client
- Détails du lot réservé
- Quantité
- Commerçant/point de retrait
- Horaires de retrait
- Statut de la réservation

### 3. Validation avec code PIN
- Le système demande de saisir le code PIN à 6 chiffres
- Le client communique verbalement son code PIN
- Le commerçant saisit le code
- Validation du retrait

### 4. Confirmation
Une fois validé :
- La réservation passe au statut "completed" (récupérée)
- Les quantités des lots sont mises à jour automatiquement
- Un message de confirmation s'affiche
- Le système est prêt pour le retrait suivant

## Structure du QR Code

Le QR code contient les informations suivantes (format JSON) :
```json
{
  "reservationId": "uuid-de-la-reservation",
  "pin": "code-pin-6-chiffres",
  "userId": "uuid-du-client",
  "lotId": "uuid-du-lot",
  "timestamp": "date-de-generation-iso"
}
```

## Sécurité

### Double validation
- **QR Code** : Contient l'identifiant unique de la réservation
- **Code PIN** : Confirmation verbale du client (6 chiffres)

Cette double validation garantit que seul le client légitime peut retirer sa commande.

### Vérifications automatiques
- Vérification que la réservation existe
- Vérification qu'elle n'a pas déjà été récupérée
- Vérification qu'elle n'a pas été annulée
- Validation du code PIN

## Utilisation Mobile

L'interface est responsive et optimisée pour :
- Tablettes (recommandé pour les points de vente)
- Smartphones
- Ordinateurs de bureau

## Permissions Caméra

Pour utiliser le scanner QR :
1. Autoriser l'accès à la caméra lorsque demandé par le navigateur
2. Utiliser de préférence la caméra arrière (meilleure qualité)
3. S'assurer d'un bon éclairage pour un scan optimal

## Cas d'usage

### Commerçant
Le commerçant utilise l'interface sur une tablette au comptoir pour valider les retraits des clients pendant les heures de retrait.

### Locker Automatique
L'interface peut être intégrée à un système de locker automatique avec :
- Écran tactile
- Caméra intégrée
- Déverrouillage automatique après validation

## Messages d'erreur

| Message | Signification | Action |
|---------|---------------|--------|
| "Réservation introuvable" | Le QR code est invalide ou corrompu | Demander au client de régénérer son QR code |
| "Cette réservation a déjà été récupérée" | Le colis a déjà été retiré | Vérifier l'historique avec le client |
| "Cette réservation a été annulée" | Le client a annulé sa réservation | Aucune action possible |
| "Code PIN incorrect" | Le PIN saisi ne correspond pas | Redemander le code PIN au client |
| "Erreur d'accès à la caméra" | Permissions caméra refusées | Autoriser l'accès dans les paramètres du navigateur |

## Support Navigateurs

Navigateurs compatibles avec le scanner QR :
- ✅ Chrome (recommandé)
- ✅ Edge
- ✅ Safari (iOS 11+)
- ✅ Firefox
- ✅ Samsung Internet

## Maintenance

### Mise à jour des QR Codes
Les QR codes sont générés dynamiquement et contiennent un timestamp. Ils restent valides tant que la réservation n'est pas récupérée ou annulée.

### Logs et traçabilité
Chaque retrait met à jour :
- Le statut de la réservation
- Les quantités disponibles du lot
- L'horodatage de récupération (`completed_at`)

## Contact Support

En cas de problème technique, contacter l'administrateur de la plateforme.

