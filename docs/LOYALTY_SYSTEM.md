# 🎁 Système de Fidélité EcoPanier

## Vue d'ensemble

Le système de fidélité EcoPanier permet aux commerçants de fidéliser leurs clients en récompensant leurs actions anti-gaspi. Les clients gagnent des points pour leurs achats, dons, avis et parrainages, qu'ils peuvent échanger contre des récompenses.

## 🏗️ Architecture

### Tables de base de données

1. **`loyalty_programs`** - Configuration des programmes par commerçant
2. **`customer_loyalty`** - Données de fidélité des clients
3. **`loyalty_rewards`** - Récompenses disponibles
4. **`loyalty_transactions`** - Historique des transactions

### Composants principaux

- **`LoyaltyManagement`** - Interface commerçant complète
- **`CustomerLoyaltyCard`** - Interface client
- **`LoyaltyIntegration`** - Intégration automatique des points
- **`LoyaltyNotification`** - Notifications de points gagnés

## 🎯 Fonctionnalités

### Pour les Commerçants

#### 1. **Gestion du Programme**
- Configuration des points par action
- Création et gestion des récompenses
- Suivi des statistiques de fidélité
- Gestion des clients fidèles

#### 2. **Types de Points**
- **Achat** : 1 point par euro dépensé
- **Don** : 5 points par euro donné (encourage la solidarité)
- **Avis** : 10 points par avis laissé
- **Parrainage** : 25 points par parrainage

#### 3. **Bonus Spéciaux**
- **Bienvenue** : 10 points à l'inscription
- **Anniversaire** : 50 points
- **Montée de niveau** : 25 points bonus

### Pour les Clients

#### 1. **Niveaux de Fidélité**
- **🥉 Bronze** (0-99 points) : Débutant Anti-Gaspi
- **🥈 Argent** (100-299 points) : Engagé Anti-Gaspi
- **🥇 Or** (300-599 points) : Expert Anti-Gaspi
- **💎 Platine** (600+ points) : Ambassadeur Anti-Gaspi

#### 2. **Badges Disponibles**
- **Achat** : Premier Pas, Acheteur Régulier, Gros Acheteur
- **Don** : Premier Don, Donateur Généreux
- **Série** : Série Hebdomadaire, Série Mensuelle
- **Spécial** : Guerrier Écologique, Héros Communautaire

#### 3. **Récompenses**
- Réductions (5%, 10%)
- Articles gratuits
- Accès prioritaire
- Contenu exclusif

## 🚀 Utilisation

### Intégration dans les Achats

```tsx
import { LoyaltyIntegration } from '@/components/shared/LoyaltyIntegration';

// Dans un composant de réservation
<LoyaltyIntegration
  merchantId={merchantId}
  reservationId={reservation.id}
  totalPrice={reservation.total_price}
  isDonation={false}
/>
```

### Affichage côté Client

```tsx
import { CustomerLoyaltyCard } from '@/components/customer/LoyaltyCard';

<CustomerLoyaltyCard
  merchantId={merchant.id}
  merchantName={merchant.business_name}
/>
```

### Gestion côté Commerçant

```tsx
import { LoyaltyManagement } from '@/components/merchant/loyalty';

// Dans le dashboard commerçant
<LoyaltyManagement />
```

## 📊 Statistiques Disponibles

### Pour les Commerçants
- Nombre total de clients inscrits
- Clients actifs (avec points)
- Points distribués
- Récompenses échangées
- Répartition par niveau
- Top récompenses
- Recommandations d'optimisation

### Pour les Clients
- Points actuels
- Niveau de fidélité
- Progression vers le niveau suivant
- Badges gagnés
- Statistiques personnelles
- Récompenses disponibles

## 🔧 Configuration

### Paramètres du Programme

```typescript
const config = {
  is_active: true,
  points_per_euro: 1,
  points_per_donation: 5,
  points_per_review: 10,
  points_per_referral: 25,
  welcome_bonus: 10,
  birthday_bonus: 50,
  level_up_bonus: 25,
  expiration_days: 365,
  auto_enrollment: true,
  email_notifications: true,
  push_notifications: true
};
```

### Création de Récompenses

```typescript
const rewardData = {
  name: "Réduction 10%",
  description: "10% de réduction sur votre prochain achat",
  type: "discount",
  value: 10,
  points_cost: 100,
  usage_limit: 50, // Optionnel
  is_active: true
};
```

## 🎨 Design System

### Couleurs par Niveau
- **Bronze** : `from-amber-500 to-amber-600`
- **Argent** : `from-gray-400 to-gray-500`
- **Or** : `from-yellow-400 to-yellow-500`
- **Platine** : `from-purple-400 to-purple-500`

### Icônes par Type
- **Achat** : 🛒
- **Don** : 🎁
- **Avis** : ⭐
- **Parrainage** : 🤝
- **Réduction** : 🎫
- **Article gratuit** : 🎁
- **Accès prioritaire** : ⚡
- **Contenu exclusif** : 👑

## 🔔 Notifications

### Types de Notifications
- Points gagnés lors d'un achat
- Points gagnés lors d'un don
- Montée de niveau
- Nouvelle récompense disponible
- Expiration de points (si configuré)

### Intégration

```tsx
import { triggerLoyaltyNotification } from '@/components/shared/LoyaltyNotification';

// Après un achat
triggerLoyaltyNotification(50, "Points gagnés pour votre achat !");
```

## 📈 Métriques d'Impact

### Pour les Commerçants
- **Taux d'engagement** : % de clients actifs
- **Rétention** : Durée moyenne de fidélité
- **Valeur client** : Points moyens par client
- **ROI** : Retour sur investissement du programme

### Pour les Clients
- **Impact environnemental** : Repas sauvés du gaspillage
- **Impact social** : Montant des dons effectués
- **Engagement** : Nombre d'actions anti-gaspi

## 🛠️ Fonctions SQL Utilitaires

### Ajouter des Points
```sql
SELECT add_loyalty_points(
  'merchant_id'::UUID,
  'customer_id'::UUID,
  50, -- points
  'earn', -- type
  'Points gagnés pour achat', -- description
  'reservation_id'::UUID, -- référence
  'reservation' -- type de référence
);
```

### Échanger une Récompense
```sql
SELECT redeem_loyalty_reward(
  'merchant_id'::UUID,
  'customer_id'::UUID,
  'reward_id'::UUID
);
```

## 🚀 Roadmap

### Phase 1 - MVP ✅
- [x] Système de points de base
- [x] Niveaux de fidélité
- [x] Récompenses simples
- [x] Interface commerçant
- [x] Interface client

### Phase 2 - Améliorations
- [ ] Gamification avancée
- [ ] Challenges et événements
- [ ] Intégration avec les réseaux sociaux
- [ ] Analytics prédictifs

### Phase 3 - Expansion
- [ ] Programme multi-commerçants
- [ ] Marketplace de récompenses
- [ ] Intégration avec des partenaires externes
- [ ] IA pour recommandations personnalisées

## 🔒 Sécurité

- Validation côté serveur de tous les échanges
- Limites d'utilisation des récompenses
- Audit trail complet des transactions
- Protection contre la fraude

## 📱 Responsive Design

Le système de fidélité est entièrement responsive et optimisé pour :
- **Mobile** : Interface tactile simplifiée
- **Tablette** : Navigation par onglets
- **Desktop** : Dashboard complet avec graphiques

## 🎯 Bonnes Pratiques

### Pour les Commerçants
1. **Équilibrez** les coûts et la valeur perçue
2. **Communiquez** régulièrement sur les avantages
3. **Personnalisez** les récompenses selon votre clientèle
4. **Analysez** les données pour optimiser le programme

### Pour les Clients
1. **Participez** régulièrement pour maintenir votre niveau
2. **Partagez** vos expériences pour gagner des badges
3. **Parrainez** vos amis pour des bonus supplémentaires
4. **Échangez** vos points avant expiration

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2025  
**Auteur** : Équipe EcoPanier
