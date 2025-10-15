# 🚚 Guide d'Implémentation des Collecteurs - EcoPanier

## 📊 État d'Avancement Global : **75% Complété** ✅

---

## ✅ **FONCTIONNALITÉS IMPLÉMENTÉES**

### 1. **Interface Collecteur** (100% ✅)

#### **CollectorDashboard** 
- ✅ Navigation par onglets (4 onglets)
- ✅ En-tête avec nom du collecteur
- ✅ Barre de navigation fixe en bas
- **Localisation** : `src/components/collector/CollectorDashboard.tsx`

#### **MissionsList** 
- ✅ Affichage des missions disponibles
- ✅ Filtrage automatique (missions non assignées)
- ✅ Acceptation de missions
- ✅ Modal de confirmation avant acceptation
- ✅ Badges visuels : Urgent 🔥, Chaîne du froid 🧊
- ✅ Affichage de la rémunération en grand
- **Localisation** : `src/components/collector/MissionsList.tsx`

#### **MyMissions** 
- ✅ Affichage des missions acceptées/en cours/complétées
- ✅ Gestion des statuts (accepted → in_progress → completed)
- ✅ Upload de photos de preuve de livraison
- ✅ Validation avant complétion
- ✅ Affichage des gains par mission
- **Localisation** : `src/components/collector/MyMissions.tsx`

#### **CollectorStats** (NOUVEAU ✨)
- ✅ Bannière des revenus totaux
- ✅ Statistiques périodiques : Aujourd'hui, Semaine, Mois
- ✅ Compteurs de missions (complétées, en cours)
- ✅ Messages de motivation dynamiques
- **Localisation** : `src/components/collector/CollectorStats.tsx`

---

### 2. **Interface Commerçant** (100% ✅)

#### **MissionCreation** (NOUVEAU ✨)
- ✅ Formulaire de création de mission
- ✅ Champs : titre, description, adresses, rémunération
- ✅ Options : chaîne du froid, urgence
- ✅ Validation côté client (minimum 3€)
- ✅ Pré-remplissage de l'adresse de collecte
- ✅ Messages de succès/erreur
- ✅ Intégration dans le MerchantDashboard (onglet "Missions")
- **Localisation** : `src/components/merchant/MissionCreation.tsx`

---

### 3. **Base de Données** (100% ✅)

#### **Table `missions`**
```sql
CREATE TABLE missions (
  id uuid PRIMARY KEY,
  merchant_id uuid REFERENCES profiles(id),
  collector_id uuid REFERENCES profiles(id),
  title text NOT NULL,
  description text NOT NULL,
  pickup_address text NOT NULL,
  delivery_address text NOT NULL,
  pickup_latitude numeric,
  pickup_longitude numeric,
  delivery_latitude numeric,
  delivery_longitude numeric,
  requires_cold_chain boolean DEFAULT false,
  is_urgent boolean DEFAULT false,
  payment_amount numeric NOT NULL,
  status text CHECK (status IN ('available', 'accepted', 'in_progress', 'completed', 'cancelled')),
  proof_urls text[],
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  completed_at timestamptz
);
```

---

## ⚠️ **FONCTIONNALITÉS MANQUANTES**

### 1. **Géolocalisation & Carte** (0% ❌)

**Ce qui manque** :
- 📍 Carte interactive pour voir les missions à proximité
- 📍 Calcul de distance entre collecteur et point de collecte
- 📍 Tri des missions par distance
- 📍 API Google Maps ou Mapbox
- 📍 Géolocalisation automatique du collecteur

**Priorité** : ⭐⭐ MOYENNE

**Implémentation suggérée** :
```typescript
// Utiliser React-Leaflet ou Mapbox GL JS
import { MapContainer, TileLayer, Marker } from 'react-leaflet';

// Calculer la distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  // Formule de Haversine
  const R = 6371; // Rayon de la Terre en km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance en km
}
```

---

### 2. **Système de Paiement** (0% ❌)

**Ce qui manque** :
- 💳 Intégration Stripe Connect ou Mangopay
- 💳 Gestion des virements automatiques
- 💳 Relevé des paiements
- 💳 Facturation automatique
- 💳 Historique des transactions

**Priorité** : ⭐⭐⭐ HAUTE (pour la production)

**Notes** :
- Pour le MVP, on peut gérer les paiements manuellement
- En production, intégrer Stripe Connect pour automatiser

---

### 3. **Notifications** (0% ❌)

**Ce qui manque** :
- 🔔 Notification quand une nouvelle mission est disponible
- 🔔 Notification quand une mission est assignée à un collecteur
- 🔔 Notification quand une mission est complétée
- 🔔 Push notifications mobiles (PWA)
- 🔔 Emails de confirmation

**Priorité** : ⭐⭐ MOYENNE

**Implémentation suggérée** :
```typescript
// Utiliser Supabase Realtime
const channel = supabase
  .channel('missions')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'missions',
      filter: 'status=eq.available',
    },
    (payload) => {
      // Afficher notification
      showNotification('Nouvelle mission disponible!', payload.new);
    }
  )
  .subscribe();
```

---

### 4. **Gestion Avancée des Missions** (30% 🟡)

**Ce qui existe** :
- ✅ Acceptation de missions
- ✅ Changement de statut
- ✅ Upload de preuves

**Ce qui manque** :
- ❌ Annulation de mission (avec motif)
- ❌ Signalement de problème
- ❌ Chat entre commerçant et collecteur
- ❌ Notation/Avis après livraison
- ❌ Historique des missions archivées
- ❌ Filtres avancés (distance, rémunération, urgence)

**Priorité** : ⭐⭐ MOYENNE

---

### 5. **Dashboard Commerçant - Suivi des Missions** (20% 🟡)

**Ce qui existe** :
- ✅ Création de missions

**Ce qui manque** :
- ❌ Liste des missions créées
- ❌ Suivi en temps réel (collecteur en route, livré)
- ❌ Historique des missions complétées
- ❌ Statistiques des missions (délai moyen, taux de complétion)
- ❌ Possibilité d'annuler une mission non assignée

**Priorité** : ⭐⭐ MOYENNE

**Composant à créer** : `src/components/merchant/MissionsList.tsx`

---

### 6. **Vérification & Sécurité** (0% ❌)

**Ce qui manque** :
- 🔐 Vérification d'identité des collecteurs
- 🔐 Système de réputation (notes, badges)
- 🔐 Assurance responsabilité civile
- 🔐 Conditions générales spécifiques collecteurs
- 🔐 Validation KYC pour les paiements

**Priorité** : ⭐⭐⭐ HAUTE (pour la production)

---

### 7. **Analytics & Reporting** (40% 🟡)

**Ce qui existe** :
- ✅ Stats de revenus pour collecteurs (CollectorStats)

**Ce qui manque** :
- ❌ Dashboard admin pour suivre toutes les missions
- ❌ Graphiques d'évolution des revenus
- ❌ Export des données (CSV, PDF)
- ❌ Indicateurs de performance (délai moyen, satisfaction)
- ❌ Rapport mensuel pour les collecteurs

**Priorité** : ⭐ BASSE (nice-to-have)

---

## 🔄 **FLUX COMPLET D'UNE MISSION**

### Étape 1 : Création (Commerçant)
1. Commerçant ouvre l'onglet "Missions"
2. Remplit le formulaire de création
3. Définit la rémunération (min 3€)
4. Valide → Mission créée avec `status: 'available'`

### Étape 2 : Découverte (Collecteur)
1. Collecteur consulte "Missions Dispo"
2. Voit la liste des missions disponibles
3. Consulte les détails (adresses, rémunération, options)

### Étape 3 : Acceptation (Collecteur)
1. Collecteur clique sur "Accepter la mission"
2. Modal de confirmation
3. Validation → Mission passe à `status: 'accepted'`

### Étape 4 : Démarrage (Collecteur)
1. Collecteur va dans "Mes Missions"
2. Clique sur "Démarrer la mission"
3. Mission passe à `status: 'in_progress'`

### Étape 5 : Livraison & Complétion (Collecteur)
1. Collecteur effectue la livraison
2. Prend des photos de preuve
3. Upload dans l'appli
4. Clique sur "Terminer la mission"
5. Mission passe à `status: 'completed'`
6. `completed_at` est enregistré
7. Le montant s'ajoute aux revenus du collecteur

---

## 📋 **CHECKLIST DE PRODUCTION**

Avant de lancer en production, voici ce qui DOIT être fait :

### Obligatoire (⭐⭐⭐)
- [ ] Système de paiement (Stripe Connect)
- [ ] Vérification d'identité des collecteurs
- [ ] Conditions générales pour collecteurs
- [ ] Assurance responsabilité civile
- [ ] Suivi des missions côté commerçant
- [ ] Notifications (au moins emails)

### Recommandé (⭐⭐)
- [ ] Géolocalisation & carte
- [ ] Chat commerçant ↔ collecteur
- [ ] Système de notation
- [ ] Annulation de missions
- [ ] Filtres avancés

### Nice-to-have (⭐)
- [ ] Push notifications (PWA)
- [ ] Export de données
- [ ] Graphiques avancés
- [ ] Application mobile native

---

## 🚀 **PROCHAINES ÉTAPES RECOMMANDÉES**

### Priorité 1 (À faire maintenant)
1. **Créer `MerchantMissionsList.tsx`** pour que les commerçants voient leurs missions
2. **Ajouter annulation de mission** (bouton + motif)
3. **Tester le flux complet** avec des données réelles

### Priorité 2 (Semaine prochaine)
1. **Ajouter notifications par email** (Supabase Functions + Resend)
2. **Implémenter la géolocalisation** (Mapbox)
3. **Créer dashboard admin** pour suivre les missions

### Priorité 3 (Avant production)
1. **Intégrer Stripe Connect** pour les paiements automatiques
2. **Système de vérification** d'identité
3. **Conditions générales** et CGU spécifiques

---

## 🛠️ **TESTS À EFFECTUER**

### Tests Fonctionnels
- [ ] Un commerçant peut créer une mission
- [ ] Un collecteur voit la nouvelle mission
- [ ] Un collecteur peut accepter la mission
- [ ] Un collecteur peut démarrer la mission
- [ ] Un collecteur peut uploader des preuves
- [ ] Un collecteur peut compléter la mission
- [ ] Les statistiques se mettent à jour correctement
- [ ] Le montant apparaît dans les revenus

### Tests Edge Cases
- [ ] Que se passe-t-il si 2 collecteurs acceptent simultanément ?
- [ ] Validation du montant minimum (< 3€)
- [ ] Upload d'images > 5 MB
- [ ] Mission sans adresse de livraison
- [ ] Collecteur sans géolocalisation

### Tests de Performance
- [ ] Charger 100+ missions
- [ ] Upload de 10 photos en même temps
- [ ] Requêtes simultanées

---

## 📚 **RESSOURCES UTILES**

### Documentation
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Stripe Connect](https://stripe.com/docs/connect)
- [React-Leaflet](https://react-leaflet.js.org/)
- [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/guides/)

### Exemples de code
- [Géolocalisation Browser API](https://developer.mozilla.org/fr/docs/Web/API/Geolocation_API)
- [Push Notifications PWA](https://web.dev/push-notifications-overview/)

---

## 💡 **IDÉES D'AMÉLIORATIONS FUTURES**

1. **Gamification** 🎮
   - Badges pour collecteurs (100 missions, 500€ gagnés, etc.)
   - Leaderboard mensuel
   - Défis hebdomadaires

2. **Optimisation des revenus** 💰
   - Algorithme de recommandation de missions (distance + rémunération)
   - Bonus pour missions urgentes
   - Programme de fidélité

3. **Impact social** 🌍
   - Tracker le CO₂ économisé par les collecteurs
   - Afficher l'impact total sur le profil
   - Certificats d'engagement

4. **Collaboration** 🤝
   - Missions en équipe (2 collecteurs)
   - Parrainage de nouveaux collecteurs
   - Groupes de collecteurs par zone

---

## 📞 **SUPPORT & AIDE**

Si vous avez des questions sur l'implémentation :

1. Consulter ce document
2. Vérifier le code existant dans `src/components/collector/`
3. Tester avec des données de test
4. Consulter la doc Supabase si problème DB

---

**Dernière mise à jour** : Janvier 2025  
**Version** : 1.0.0  
**Statut** : 75% Complété ✅

---

🎉 **Félicitations** ! L'infrastructure de base pour les collecteurs est opérationnelle. Il reste principalement des fonctionnalités avancées et l'intégration des paiements pour aller en production.

