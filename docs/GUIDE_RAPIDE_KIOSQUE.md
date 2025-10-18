# 🚀 Guide Rapide - Mode Kiosque

## 📱 Accès rapide

**URL directe :** `https://votre-domaine.com/kiosk`

---

## ⚡ Démarrage en 5 minutes

### 1️⃣ Préparer la tablette

```bash
✅ Connexion Internet active
✅ Navigateur moderne (Chrome/Safari)
✅ Caméra fonctionnelle
✅ Permission caméra accordée
```

### 2️⃣ Ouvrir le mode kiosque

1. Ouvrir le navigateur
2. Aller sur : `https://votre-domaine.com/kiosk`
3. Accepter les permissions caméra si demandé
4. Le mode plein écran s'active automatiquement

### 3️⃣ Tester la connexion

1. Cliquer sur **"Scanner ma carte"**
2. Présenter un QR code de carte bénéficiaire
3. Vérifier que la connexion fonctionne

### 4️⃣ Sécuriser la tablette

**Android :**
- Paramètres → Utilisateurs → Utilisateur restreint
- Autoriser uniquement le navigateur

**iPad :**
- Réglages → Accessibilité → Accès guidé
- Activer + définir un code

---

## 👤 Utilisation pour les bénéficiaires

### Étapes simples

```
1. Clic sur "Scanner ma carte"
   ↓
2. Présenter la carte devant la caméra
   ↓
3. Choisir un panier (max 2/jour)
   ↓
4. Noter le CODE PIN affiché
   ↓
5. Aller chercher le panier chez le commerçant
```

### ⏱️ Déconnexion automatique

La session se ferme automatiquement après **3 minutes d'inactivité** pour protéger la confidentialité.

---

## 🔧 Paramètres principaux

### Timer de déconnexion

**Fichier :** `src/components/kiosk/KioskMode.tsx`

```typescript
const INACTIVITY_TIMEOUT = 3 * 60 * 1000; // 3 minutes
```

**Modifier selon besoin :**
- Forte affluence : 2 minutes
- Normal : 3 minutes (défaut)
- Faible affluence : 5 minutes

### Limite quotidienne

Respecte les paramètres de la plateforme : **2 paniers/jour par défaut**

---

## 🐛 Dépannage express

### La caméra ne fonctionne pas

1. Vérifier les permissions du navigateur
2. Redémarrer le navigateur
3. Redémarrer la tablette

### Le scan ne fonctionne pas

1. Améliorer l'éclairage
2. Rapprocher/éloigner la carte
3. Nettoyer la caméra

### "Compte non vérifié"

→ Le compte doit être validé par un admin dans le dashboard

---

## 📊 Fonctionnalités principales

| Fonctionnalité | Description |
|----------------|-------------|
| 🔐 **Connexion QR** | Scan de carte bénéficiaire |
| 🎁 **Réservation** | Max 2 paniers/jour gratuits |
| 📱 **QR Code retrait** | Génération automatique |
| 🔑 **Code PIN** | Affiché en très gros caractères |
| ⏱️ **Déconnexion auto** | Après 3 min d'inactivité |
| 🔒 **Mode plein écran** | Sécurité renforcée |

---

## 📞 Support

**En cas de problème :**

1. Consulter la [documentation complète](./MODE_KIOSQUE.md)
2. Contacter le support technique
3. Créer un ticket

---

## ✅ Checklist de déploiement

```
Technique
□ Tablette configurée
□ Internet stable
□ Caméra testée
□ URL en favori

Personnel
□ 2 personnes formées minimum
□ Script d'accueil affiché
□ Support visuel installé

Bénéficiaires
□ Cartes QR distribuées
□ Comptes vérifiés dans le système
```

---

## 🎯 Pour aller plus loin

Consultez la [documentation complète](./MODE_KIOSQUE.md) pour :
- Configuration avancée
- Formation du personnel
- Statistiques et rapports
- Maintenance préventive
- Évolutions futures

---

**Besoin d'aide ? Consultez la doc complète ou contactez le support !**

