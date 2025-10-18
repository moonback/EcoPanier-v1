# 🚀 Roadmap d'Améliorations - Interface Bénéficiaire

**Date** : Janvier 2025  
**Version** : 1.0  
**Basé sur** : BENEFICIAIRE_FONCTIONNEMENT_ANALYSE.md

---

## 📋 Vue d'ensemble

Ce document présente les améliorations recommandées pour l'interface bénéficiaire, organisées par **priorité** et **sprints**.

### Légende des priorités
- 🔴 **P0 - CRITIQUE** : Bloquant, à faire immédiatement
- 🟠 **P1 - HAUTE** : Important, à faire rapidement (1-2 semaines)
- 🟡 **P2 - MOYENNE** : Utile, à planifier (1 mois)
- 🟢 **P3 - BASSE** : Nice to have, futur (3+ mois)

### Estimation de complexité
- 🟢 **Simple** : 1-2 jours
- 🟡 **Moyen** : 3-5 jours
- 🔴 **Complexe** : 1-2 semaines
- ⚫ **Très complexe** : 2+ semaines

---

## 🔴 Sprint 1 : Fonctionnalités Critiques (P0)

### 1.1 Interface Admin pour Vérification des Bénéficiaires
**Priorité** : 🔴 P0 - CRITIQUE  
**Complexité** : 🔴 Complexe (1-2 semaines)  
**Impact** : ⭐⭐⭐⭐⭐ (Bloquant actuellement)

#### Problème actuel
❌ Aucune interface pour vérifier les comptes bénéficiaires  
❌ Modification manuelle en base de données requise  
❌ Pas de workflow de validation défini  
❌ Pas de traçabilité des vérifications

#### User Stories

**US-BEN-001** : En tant qu'admin, je veux voir la liste des bénéficiaires en attente de vérification
```
Critères d'acceptation :
- Liste paginée des profils avec verified = false
- Filtres : date d'inscription, nom, email
- Tri : par date (plus anciens en premier)
- Badge indiquant le délai d'attente
- Quick actions : Valider / Rejeter / Voir détails
```

**US-BEN-002** : En tant qu'admin, je veux consulter le dossier complet d'un bénéficiaire
```
Critères d'acceptation :
- Vue détaillée : nom, email, téléphone, date d'inscription
- Affichage de l'identifiant bénéficiaire (YYYY-BEN-XXXXX)
- Historique des actions (création, modifications)
- Zone de notes internes
- Documents justificatifs (si uploadés)
```

**US-BEN-003** : En tant qu'admin, je veux valider un compte bénéficiaire
```
Critères d'acceptation :
- Bouton "Valider le compte"
- Confirmation avec modal
- Possibilité d'ajouter une note de validation
- Mise à jour de verified = true en base
- Envoi d'un email de confirmation au bénéficiaire
- Log de l'action (qui, quand, pourquoi)
```

**US-BEN-004** : En tant qu'admin, je veux rejeter un compte bénéficiaire
```
Critères d'acceptation :
- Bouton "Rejeter le compte"
- Champ obligatoire : raison du rejet
- Confirmation avec modal
- Email au bénéficiaire avec explication
- Possibilité de bannir définitivement
- Log de l'action
```

**US-BEN-005** : En tant qu'admin, je veux définir des critères d'éligibilité
```
Critères d'acceptation :
- Page de paramètres dédiée
- Liste de critères à checker (à définir avec les parties prenantes)
- Documentation intégrée
- Checklist lors de la validation
```

#### Composants à créer
```
src/components/admin/beneficiaries/
├── BeneficiariesPendingList.tsx       # Liste des comptes en attente
├── BeneficiaryDetailModal.tsx         # Modal détails bénéficiaire
├── BeneficiaryValidationForm.tsx      # Formulaire validation/rejet
├── BeneficiariesVerifiedList.tsx      # Liste des comptes validés
└── BeneficiaryVerificationStats.tsx   # Stats de vérification
```

#### Modifications DB
```sql
-- Ajouter des champs à la table profiles
ALTER TABLE profiles ADD COLUMN verified_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN verified_by UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN rejection_reason TEXT;
ALTER TABLE profiles ADD COLUMN internal_notes TEXT;

-- Table de logs d'actions admin
CREATE TABLE admin_actions_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID REFERENCES profiles(id),
  target_user_id UUID REFERENCES profiles(id),
  action_type TEXT, -- 'verify', 'reject', 'ban', 'edit'
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### Notifications à implémenter
1. **Email de validation** : "Votre compte EcoPanier est validé !"
2. **Email de rejet** : "Votre demande nécessite des informations complémentaires"

---

### 1.2 Système d'Annulation de Réservation
**Priorité** : 🔴 P0 - CRITIQUE  
**Complexité** : 🟡 Moyen (3-5 jours)  
**Impact** : ⭐⭐⭐⭐

#### Problème actuel
❌ Impossible d'annuler une réservation  
❌ Stock bloqué si le bénéficiaire ne peut pas venir  
❌ Pas de gestion des no-show  
❌ Gaspillage potentiel

#### User Stories

**US-BEN-006** : En tant que bénéficiaire, je veux annuler une réservation
```
Critères d'acceptation :
- Bouton "Annuler" visible sur réservations avec status = 'pending'
- Confirmation avec modal : "Êtes-vous sûr ?"
- Champ optionnel : raison de l'annulation
- Mise à jour status = 'cancelled'
- Libération du stock (quantity_reserved -= quantity)
- Décrémenter le compteur quotidien (beneficiary_daily_limits)
- Message de confirmation
- Pas de pénalité pour première annulation
```

**US-BEN-007** : En tant que bénéficiaire, je veux voir mes réservations annulées
```
Critères d'acceptation :
- Badge "❌ Annulé" sur les réservations cancelled
- Filtre "Annulées" dans "Mes Paniers"
- Date et heure d'annulation affichées
- Raison affichée (si renseignée)
```

**US-BEN-008** : En tant que système, je veux gérer les limites d'annulation
```
Critères d'acceptation :
- Pas d'annulation possible dans les X minutes avant le retrait (configurable)
- Tracking du nombre d'annulations par bénéficiaire
- Pénalité après Y annulations dans un délai Z (à définir)
- Message d'avertissement si trop d'annulations
```

#### Modifications composants
```typescript
// Dans BeneficiaryReservations.tsx
const handleCancelReservation = async (reservation: Reservation) => {
  // 1. Vérifier si annulation possible (pas trop proche de l'horaire)
  const pickupTime = new Date(reservation.lots.pickup_start);
  const now = new Date();
  const timeDiff = (pickupTime.getTime() - now.getTime()) / (1000 * 60); // minutes
  
  if (timeDiff < 30) { // 30 minutes avant
    // Afficher erreur : trop tard pour annuler
    return;
  }
  
  // 2. Confirmation
  const confirmed = await showConfirmModal();
  if (!confirmed) return;
  
  // 3. Transaction d'annulation
  // - Update reservation status = 'cancelled'
  // - Update lot quantity_reserved -= reservation.quantity
  // - Update ou delete beneficiary_daily_limits (décrémenter)
  // - Insert dans cancellation_log
  
  // 4. Refresh UI
};
```

#### Modifications DB
```sql
-- Table de log des annulations
CREATE TABLE reservation_cancellations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES reservations(id),
  beneficiary_id UUID REFERENCES profiles(id),
  cancelled_at TIMESTAMP DEFAULT NOW(),
  reason TEXT,
  time_before_pickup INTEGER -- minutes avant le retrait
);

-- Index pour tracking des annulations
CREATE INDEX idx_cancellations_beneficiary ON reservation_cancellations(beneficiary_id);
```

#### Configuration à ajouter
```typescript
// Dans platform_settings
min_cancellation_time: 30, // minutes avant retrait
max_cancellations_per_week: 3,
cancellation_penalty_duration: 7 // jours de suspension après dépassement
```

---

### 1.3 Notifications Essentielles (Email)
**Priorité** : 🔴 P0 - CRITIQUE  
**Complexité** : 🟡 Moyen (3-5 jours)  
**Impact** : ⭐⭐⭐⭐

#### Problème actuel
❌ Aucun email de confirmation de réservation  
❌ Pas d'email de validation de compte  
❌ Le bénéficiaire doit noter le PIN manuellement  
❌ Pas de rappel avant le retrait

#### User Stories

**US-BEN-009** : En tant que bénéficiaire, je veux recevoir un email de confirmation de réservation
```
Critères d'acceptation :
- Email envoyé immédiatement après réservation
- Contenu :
  ✅ Titre du lot
  ✅ Nom et adresse du commerçant
  ✅ Date et heure de retrait
  ✅ Quantité réservée
  ✅ Code PIN (bien visible)
  ✅ QR Code en pièce jointe ou lien
  ✅ Instructions de retrait
  ✅ Lien pour annuler
- Design : responsive, accessible, aux couleurs de la marque
```

**US-BEN-010** : En tant que bénéficiaire, je veux recevoir un email de validation de compte
```
Critères d'acceptation :
- Email envoyé quand verified = true
- Contenu :
  ✅ Message de bienvenue personnalisé
  ✅ Identifiant bénéficiaire
  ✅ Résumé du fonctionnement (quota, retrait)
  ✅ Lien vers le dashboard
  ✅ Lien vers FAQ
  ✅ Contact support
```

**US-BEN-011** : En tant que bénéficiaire, je veux recevoir un rappel avant le retrait
```
Critères d'acceptation :
- Email envoyé 2 heures avant l'horaire de retrait
- Contenu :
  ✅ "N'oubliez pas de récupérer votre panier !"
  ✅ Rappel de l'adresse
  ✅ Rappel du code PIN
  ✅ Itinéraire (lien Google Maps)
  ✅ Lien pour annuler si empêchement
```

**US-BEN-012** : En tant que bénéficiaire, je veux recevoir une confirmation de retrait
```
Critères d'acceptation :
- Email envoyé quand status = 'completed'
- Contenu :
  ✅ Confirmation du retrait
  ✅ Récapitulatif de ce qui a été récupéré
  ✅ Impact environnemental (CO₂ économisé)
  ✅ Remerciement au commerçant
  ✅ Demande d'évaluation (lien vers formulaire)
```

#### Service d'emailing à créer
```typescript
// src/utils/emailService.ts
import { supabase } from '@/lib/supabase';

export const emailService = {
  // Email de confirmation de réservation
  async sendReservationConfirmation(reservation: Reservation) {
    // Template avec PIN, QR code, détails
  },
  
  // Email de validation de compte
  async sendAccountVerified(profile: Profile) {
    // Template de bienvenue
  },
  
  // Email de rappel avant retrait
  async sendPickupReminder(reservation: Reservation) {
    // Template de rappel
  },
  
  // Email de confirmation de retrait
  async sendPickupConfirmation(reservation: Reservation, impactData: ImpactData) {
    // Template post-retrait
  },
  
  // Email d'annulation de réservation
  async sendCancellationConfirmation(reservation: Reservation) {
    // Template annulation
  }
};
```

#### Options d'implémentation
1. **Supabase Edge Functions** (recommandé)
   - Trigger automatique sur insert/update
   - Utiliser Resend ou SendGrid
   
2. **Service externe** (Resend, SendGrid, Mailgun)
   - Template builder
   - Tracking des emails
   
3. **Scheduler pour les rappels**
   - Cron job ou Supabase pg_cron
   - Vérifier les réservations à venir dans 2h
   - Envoyer les emails de rappel

---

### 1.4 Gestion des Réservations Expirées
**Priorité** : 🔴 P0 - CRITIQUE  
**Complexité** : 🟢 Simple (1-2 jours)  
**Impact** : ⭐⭐⭐

#### Problème actuel
❌ Réservations non retirées restent en "pending" indéfiniment  
❌ Stock bloqué pour d'autres bénéficiaires  
❌ Pas de tracking des no-show  
❌ Pas de pénalité pour comportement abusif

#### User Stories

**US-BEN-013** : En tant que système, je veux marquer automatiquement les réservations expirées
```
Critères d'acceptation :
- Cron job qui s'exécute toutes les heures
- Vérifier les réservations avec :
  - status = 'pending'
  - pickup_end < NOW()
- Passer à status = 'expired'
- Libérer le stock (quantity_reserved -= quantity)
- Logger le no-show
- Décrémenter le compteur quotidien (pour libérer le quota)
```

**US-BEN-014** : En tant que bénéficiaire, je veux voir mes réservations expirées
```
Critères d'acceptation :
- Badge "⏱️ Expiré" sur réservations expired
- Message explicatif : "Le créneau de retrait est passé"
- Distinction visuelle (grisé, opacité réduite)
- Filtre "Expirées" dans "Mes Paniers"
```

**US-BEN-015** : En tant que système, je veux tracker les no-show répétés
```
Critères d'acceptation :
- Table no_show_tracking avec compteur
- Si no-show >= 3 en 30 jours :
  - Afficher avertissement au bénéficiaire
  - Réduction temporaire du quota (de 2 à 1 par exemple)
  - Email d'avertissement
- Si no-show >= 5 en 30 jours :
  - Suspension temporaire (7 jours)
  - Email de suspension avec explication
```

#### Implémentation technique

**Option 1 : Supabase pg_cron (recommandé)**
```sql
-- Migration : Ajouter extension pg_cron
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Job qui s'exécute toutes les heures
SELECT cron.schedule(
  'mark-expired-reservations',
  '0 * * * *', -- Chaque heure à minute 0
  $$
  -- Mettre à jour les réservations expirées
  UPDATE reservations
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending'
    AND (
      SELECT pickup_end FROM lots WHERE id = reservations.lot_id
    ) < NOW();
  
  -- Libérer le stock
  UPDATE lots
  SET quantity_reserved = quantity_reserved - (
    SELECT SUM(quantity) FROM reservations
    WHERE lot_id = lots.id AND status = 'expired'
      AND updated_at > NOW() - INTERVAL '5 minutes'
  )
  WHERE id IN (
    SELECT DISTINCT lot_id FROM reservations
    WHERE status = 'expired'
      AND updated_at > NOW() - INTERVAL '5 minutes'
  );
  $$
);
```

**Option 2 : Supabase Edge Function + Scheduler**
```typescript
// supabase/functions/expire-reservations/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  // 1. Trouver les réservations expirées
  const { data: expiredReservations } = await supabase
    .from('reservations')
    .select('*, lots(pickup_end)')
    .eq('status', 'pending')
    .lt('lots.pickup_end', new Date().toISOString());
  
  // 2. Mettre à jour chaque réservation
  for (const reservation of expiredReservations) {
    // Update status
    await supabase
      .from('reservations')
      .update({ status: 'expired' })
      .eq('id', reservation.id);
    
    // Libérer le stock
    await supabase.rpc('decrement_lot_reserved', {
      lot_id: reservation.lot_id,
      qty: reservation.quantity
    });
    
    // Logger le no-show
    await supabase.from('no_show_log').insert({
      beneficiary_id: reservation.user_id,
      reservation_id: reservation.id,
      lot_id: reservation.lot_id,
    });
  }
  
  return new Response(JSON.stringify({ processed: expiredReservations.length }));
});
```

**Appeler via GitHub Actions ou Vercel Cron** :
```yaml
# .github/workflows/expire-reservations.yml
name: Expire Reservations
on:
  schedule:
    - cron: '0 * * * *' # Toutes les heures
jobs:
  expire:
    runs-on: ubuntu-latest
    steps:
      - name: Call Edge Function
        run: |
          curl -X POST https://your-project.supabase.co/functions/v1/expire-reservations \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

#### Modifications DB
```sql
-- Ajouter statut 'expired'
-- (déjà géré si enum ou varchar)

-- Table de tracking des no-show
CREATE TABLE no_show_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  beneficiary_id UUID REFERENCES profiles(id),
  reservation_id UUID REFERENCES reservations(id),
  lot_id UUID REFERENCES lots(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Index pour requêtes rapides
CREATE INDEX idx_noshow_beneficiary ON no_show_log(beneficiary_id, created_at);

-- Vue pour comptage des no-show récents
CREATE VIEW beneficiary_noshow_count AS
SELECT
  beneficiary_id,
  COUNT(*) as noshow_count_30d
FROM no_show_log
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY beneficiary_id;
```

---

### 1.5 Sécurité des Transactions de Réservation
**Priorité** : 🔴 P0 - CRITIQUE  
**Complexité** : 🟡 Moyen (3-5 jours)  
**Impact** : ⭐⭐⭐⭐

#### Problème actuel
❌ Pas de transaction atomique (risque d'incohérence)  
❌ Pas de vérification d'unicité du PIN  
❌ Pas de logs d'audit  
❌ Risque de double réservation

#### User Stories

**US-BEN-016** : En tant que système, je veux garantir la cohérence des réservations
```
Critères d'acceptation :
- Utiliser une transaction Supabase (ou Postgres)
- Rollback automatique en cas d'erreur
- Vérification du stock en temps réel (lock optimiste)
- Message d'erreur clair en cas de problème
```

**US-BEN-017** : En tant que système, je veux garantir l'unicité des codes PIN
```
Critères d'acceptation :
- Vérification d'unicité avant insertion
- Régénération si doublon (très rare)
- Maximum 3 tentatives
- Erreur si échec après 3 tentatives
```

**US-BEN-018** : En tant qu'admin, je veux avoir des logs d'audit complets
```
Critères d'acceptation :
- Table audit_log
- Log de toutes les actions :
  - Réservation créée
  - Réservation annulée
  - Réservation retirée
  - Réservation expirée
- Contient : qui, quoi, quand, contexte (IP, user-agent)
```

#### Implémentation

**Transaction atomique avec Supabase RPC** :
```sql
-- Migration : Fonction RPC pour créer une réservation
CREATE OR REPLACE FUNCTION create_beneficiary_reservation(
  p_lot_id UUID,
  p_user_id UUID,
  p_quantity INTEGER,
  p_pin VARCHAR(6)
)
RETURNS JSON AS $$
DECLARE
  v_available_qty INTEGER;
  v_daily_count INTEGER;
  v_max_daily INTEGER;
  v_reservation_id UUID;
BEGIN
  -- 1. Vérifier le quota quotidien
  SELECT COALESCE(reservation_count, 0) INTO v_daily_count
  FROM beneficiary_daily_limits
  WHERE beneficiary_id = p_user_id AND date = CURRENT_DATE;
  
  SELECT max_daily_beneficiary_reservations INTO v_max_daily
  FROM platform_settings LIMIT 1;
  
  IF v_daily_count >= v_max_daily THEN
    RETURN json_build_object('error', 'daily_limit_reached');
  END IF;
  
  -- 2. Vérifier le stock disponible (avec lock)
  SELECT (quantity_total - quantity_reserved - quantity_sold) INTO v_available_qty
  FROM lots
  WHERE id = p_lot_id
  FOR UPDATE; -- Lock pour éviter double réservation
  
  IF v_available_qty < p_quantity THEN
    RETURN json_build_object('error', 'insufficient_stock');
  END IF;
  
  -- 3. Vérifier l'unicité du PIN
  IF EXISTS (SELECT 1 FROM reservations WHERE pickup_pin = p_pin AND status = 'pending') THEN
    RETURN json_build_object('error', 'pin_duplicate');
  END IF;
  
  -- 4. Créer la réservation
  INSERT INTO reservations (lot_id, user_id, quantity, total_price, pickup_pin, status, is_donation)
  VALUES (p_lot_id, p_user_id, p_quantity, 0, p_pin, 'pending', false)
  RETURNING id INTO v_reservation_id;
  
  -- 5. Mettre à jour le stock
  UPDATE lots
  SET quantity_reserved = quantity_reserved + p_quantity,
      updated_at = NOW()
  WHERE id = p_lot_id;
  
  -- 6. Mettre à jour ou créer le compteur quotidien
  INSERT INTO beneficiary_daily_limits (beneficiary_id, date, reservation_count)
  VALUES (p_user_id, CURRENT_DATE, 1)
  ON CONFLICT (beneficiary_id, date)
  DO UPDATE SET reservation_count = beneficiary_daily_limits.reservation_count + 1;
  
  -- 7. Logger l'action
  INSERT INTO audit_log (action_type, user_id, resource_type, resource_id, metadata)
  VALUES ('reservation_created', p_user_id, 'reservation', v_reservation_id, 
          json_build_object('lot_id', p_lot_id, 'quantity', p_quantity, 'pin', p_pin));
  
  -- 8. Retourner le succès avec l'ID
  RETURN json_build_object('success', true, 'reservation_id', v_reservation_id);
  
EXCEPTION WHEN OTHERS THEN
  -- Rollback automatique
  RETURN json_build_object('error', 'transaction_failed', 'message', SQLERRM);
END;
$$ LANGUAGE plpgsql;
```

**Utilisation côté client** :
```typescript
// FreeLotsList.tsx
const handleReserve = async (lot: Lot) => {
  try {
    let pin = generatePIN();
    let attempts = 0;
    let result;
    
    // Tentative avec retry si PIN dupliqué
    while (attempts < 3) {
      const { data, error } = await supabase.rpc('create_beneficiary_reservation', {
        p_lot_id: lot.id,
        p_user_id: profile.id,
        p_quantity: quantity,
        p_pin: pin
      });
      
      if (error) throw error;
      
      result = data as { success?: boolean; error?: string; reservation_id?: string };
      
      if (result.success) {
        // Succès !
        setConfirmationConfig({
          type: 'success',
          title: '🎉 Réservation confirmée !',
          message: 'Votre panier solidaire a été réservé.',
          pin: pin
        });
        setShowConfirmationModal(true);
        
        // Envoyer email de confirmation
        await emailService.sendReservationConfirmation(result.reservation_id, pin);
        
        // Rafraîchir les listes
        fetchFreeLots();
        onReservationMade();
        return;
      }
      
      if (result.error === 'pin_duplicate') {
        // Régénérer le PIN
        pin = generatePIN();
        attempts++;
        continue;
      }
      
      if (result.error === 'daily_limit_reached') {
        setConfirmationConfig({
          type: 'info',
          title: '⚠️ Limite atteinte',
          message: 'Vous avez atteint votre limite quotidienne.'
        });
        setShowConfirmationModal(true);
        return;
      }
      
      if (result.error === 'insufficient_stock') {
        setConfirmationConfig({
          type: 'error',
          title: '❌ Stock insuffisant',
          message: 'Ce panier n\'est plus disponible en quantité suffisante.'
        });
        setShowConfirmationModal(true);
        return;
      }
      
      // Autre erreur
      throw new Error(result.error);
    }
    
    // Échec après 3 tentatives
    throw new Error('Impossible de générer un code PIN unique après 3 tentatives');
    
  } catch (error) {
    console.error('Erreur réservation:', error);
    setConfirmationConfig({
      type: 'error',
      title: '❌ Erreur',
      message: 'Une erreur est survenue. Veuillez réessayer.'
    });
    setShowConfirmationModal(true);
  }
};
```

#### Modifications DB
```sql
-- Table de logs d'audit
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  action_type VARCHAR(50) NOT NULL, -- 'reservation_created', 'reservation_cancelled', etc.
  user_id UUID REFERENCES profiles(id),
  resource_type VARCHAR(50), -- 'reservation', 'lot', 'profile', etc.
  resource_id UUID,
  metadata JSONB, -- Données contextuelles
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_user ON audit_log(user_id, created_at);
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_action ON audit_log(action_type, created_at);
```

---

## 🟠 Sprint 2 : Fonctionnalités Importantes (P1)

### 2.1 Filtre Géographique et Distance
**Priorité** : 🟠 P1 - HAUTE  
**Complexité** : 🔴 Complexe (1-2 semaines)  
**Impact** : ⭐⭐⭐⭐⭐

#### Problème actuel
❌ Pas de notion de distance ou proximité  
❌ Bénéficiaires peuvent voir des paniers très éloignés  
❌ Pas de tri par distance  
❌ Pas d'itinéraire

#### User Stories

**US-BEN-019** : En tant que bénéficiaire, je veux renseigner mon adresse dans mon profil
```
Critères d'acceptation :
- Champ "Adresse" dans le profil
- Autocomplete avec Google Places API ou équivalent
- Géocodage automatique (latitude, longitude)
- Stockage sécurisé de l'adresse
- Possibilité de modifier
```

**US-BEN-020** : En tant que bénéficiaire, je veux voir la distance de chaque panier
```
Critères d'acceptation :
- Badge de distance sur chaque carte de lot (ex: "1,2 km")
- Calcul en temps réel basé sur adresse bénéficiaire vs adresse commerçant
- Icône de distance visible
- Couleur différente si > X km (configurable)
```

**US-BEN-021** : En tant que bénéficiaire, je veux filtrer les paniers par distance
```
Critères d'acceptation :
- Filtre "Distance maximale" dans les filtres
- Options : 1 km, 2 km, 5 km, 10 km, Tout
- Slider pour choisir la distance
- Nombre de résultats mis à jour en temps réel
```

**US-BEN-022** : En tant que bénéficiaire, je veux trier les paniers par proximité
```
Critères d'acceptation :
- Option de tri "Plus proches" (par défaut)
- Tri "Plus récents"
- Tri "Bientôt disponibles" (par horaire de retrait)
- Sélecteur de tri visible et accessible
```

**US-BEN-023** : En tant que bénéficiaire, je veux voir un itinéraire vers le commerçant
```
Critères d'acceptation :
- Bouton "Itinéraire" sur chaque panier réservé
- Lien vers Google Maps avec directions
- Affichage du temps de trajet estimé
- Options : à pied, en vélo, en voiture, transports en commun
```

**US-BEN-024** : En tant que bénéficiaire, je veux voir une carte des paniers disponibles
```
Critères d'acceptation :
- Vue "Carte" en alternative à la grille
- Toggle "Liste / Carte"
- Marqueurs pour chaque panier
- Clic sur marqueur → popup avec infos du panier
- Centré sur l'adresse du bénéficiaire
- Zoom adaptatif
```

#### Implémentation technique

**1. Stockage des coordonnées GPS**
```sql
-- Migration : Ajouter colonnes GPS dans profiles
ALTER TABLE profiles ADD COLUMN address TEXT;
ALTER TABLE profiles ADD COLUMN latitude DECIMAL(10, 8);
ALTER TABLE profiles ADD COLUMN longitude DECIMAL(11, 8);
ALTER TABLE profiles ADD COLUMN postal_code VARCHAR(10);
ALTER TABLE profiles ADD COLUMN city VARCHAR(100);

-- Index pour requêtes géographiques
CREATE INDEX idx_profiles_location ON profiles USING gist(
  ll_to_earth(latitude, longitude)
);
```

**2. Service de géocodage**
```typescript
// src/utils/geocodingService.ts
import { Client } from '@googlemaps/google-maps-services-js';

const mapsClient = new Client({});

export const geocodingService = {
  async geocodeAddress(address: string) {
    const response = await mapsClient.geocode({
      params: {
        address,
        key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      },
    });
    
    if (response.data.results.length > 0) {
      const result = response.data.results[0];
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formatted_address: result.formatted_address,
      };
    }
    
    throw new Error('Adresse non trouvée');
  },
  
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Formule de Haversine
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Math.round(distance * 10) / 10; // Arrondi à 1 décimale
  }
};
```

**3. Composant d'autocomplete d'adresse**
```typescript
// src/components/shared/AddressAutocomplete.tsx
import { useState } from 'react';
import { geocodingService } from '@/utils/geocodingService';

interface AddressAutocompleteProps {
  onAddressSelected: (addressData: AddressData) => void;
}

export function AddressAutocomplete({ onAddressSelected }: AddressAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const handleSearch = async (value: string) => {
    setQuery(value);
    // Appeler API d'autocomplete (Google Places Autocomplete)
    // Afficher suggestions
  };
  
  const handleSelect = async (address: string) => {
    const data = await geocodingService.geocodeAddress(address);
    onAddressSelected(data);
  };
  
  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Entrez votre adresse..."
        className="w-full px-4 py-2 border rounded-lg"
      />
      {suggestions.length > 0 && (
        <div className="absolute z-10 w-full bg-white border rounded-lg mt-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelect(suggestion)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

**4. Filtre avec distance dans FreeLotsList**
```typescript
const [maxDistance, setMaxDistance] = useState<number | null>(null);
const [beneficiaryLocation, setBeneficiaryLocation] = useState<{lat: number; lon: number} | null>(null);

useEffect(() => {
  if (profile?.latitude && profile?.longitude) {
    setBeneficiaryLocation({
      lat: profile.latitude,
      lon: profile.longitude
    });
  }
}, [profile]);

const lotsWithDistance = useMemo(() => {
  if (!beneficiaryLocation) return lots;
  
  return lots.map(lot => ({
    ...lot,
    distance: geocodingService.calculateDistance(
      beneficiaryLocation.lat,
      beneficiaryLocation.lon,
      lot.profiles.latitude,
      lot.profiles.longitude
    )
  })).sort((a, b) => a.distance - b.distance);
}, [lots, beneficiaryLocation]);

const filteredLots = useMemo(() => {
  if (!maxDistance) return lotsWithDistance;
  return lotsWithDistance.filter(lot => lot.distance <= maxDistance);
}, [lotsWithDistance, maxDistance]);
```

**5. Vue carte avec Mapbox ou Google Maps**
```typescript
// src/components/beneficiary/LotsMapView.tsx
import Map, { Marker, Popup } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export function LotsMapView({ lots, beneficiaryLocation }: LotsMapViewProps) {
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null);
  
  return (
    <div className="h-[600px] w-full rounded-lg overflow-hidden">
      <Map
        initialViewState={{
          latitude: beneficiaryLocation.lat,
          longitude: beneficiaryLocation.lon,
          zoom: 13
        }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
        mapboxAccessToken={import.meta.env.VITE_MAPBOX_TOKEN}
      >
        {/* Marqueur bénéficiaire */}
        <Marker
          latitude={beneficiaryLocation.lat}
          longitude={beneficiaryLocation.lon}
          color="blue"
        />
        
        {/* Marqueurs lots */}
        {lots.map(lot => (
          <Marker
            key={lot.id}
            latitude={lot.profiles.latitude}
            longitude={lot.profiles.longitude}
            color="green"
            onClick={() => setSelectedLot(lot)}
          />
        ))}
        
        {/* Popup détails */}
        {selectedLot && (
          <Popup
            latitude={selectedLot.profiles.latitude}
            longitude={selectedLot.profiles.longitude}
            onClose={() => setSelectedLot(null)}
          >
            <LotPopupCard lot={selectedLot} />
          </Popup>
        )}
      </Map>
    </div>
  );
}
```

#### Coûts et limites
- Google Maps API : ~$7 par 1000 requêtes (gratuit jusqu'à $200/mois)
- Mapbox : Gratuit jusqu'à 50k chargements/mois
- Alternative gratuite : OpenStreetMap + Leaflet

---

### 2.2 Amélioration du Système de Quota
**Priorité** : 🟠 P1 - HAUTE  
**Complexité** : 🟡 Moyen (3-5 jours)  
**Impact** : ⭐⭐⭐⭐

#### Problème actuel
❌ Quota fixe de 2 paniers/jour pour tous  
❌ Pas d'adaptation selon les besoins (personne seule vs famille)  
❌ Pas de distinction selon le type de produit  
❌ Rigidité qui peut frustrer ou être insuffisante

#### User Stories

**US-BEN-025** : En tant que bénéficiaire, je veux renseigner la composition de mon foyer
```
Critères d'acceptation :
- Champ dans le profil : "Nombre de personnes dans le foyer"
- Sélecteur : 1, 2, 3, 4, 5+ personnes
- Option "Enfants en bas âge" (checkbox)
- Prise en compte pour calcul du quota
```

**US-BEN-026** : En tant que système, je veux adapter le quota selon la composition du foyer
```
Critères d'acceptation :
- Quota de base : 2 paniers/jour
- 1 personne = 2 paniers
- 2 personnes = 3 paniers
- 3 personnes = 4 paniers
- 4+ personnes = 5 paniers
- Bonus de +1 si enfants en bas âge
- Configurable dans platform_settings
```

**US-BEN-027** : En tant que système, je veux pondérer les réservations selon le type de produit
```
Critères d'acceptation :
- Système de "points" plutôt que "nombre de paniers"
- Quota quotidien en points (configurable, ex: 10 points/jour)
- Coût en points par type de produit :
  - Pain/Viennoiseries = 1 point
  - Fruits/Légumes = 2 points
  - Produits laitiers = 2 points
  - Repas complets = 3 points
  - Lots mixtes = 4 points
- Affichage du solde de points restant
```

**US-BEN-028** : En tant que bénéficiaire, je veux voir mon quota personnalisé
```
Critères d'acceptation :
- Affichage clair : "Votre quota : X points/jour (ou Y paniers/jour)"
- Explication : "Basé sur votre foyer de Z personnes"
- Barre de progression visuelle
- Solde restant mis à jour en temps réel
```

**US-BEN-029** : En tant que système, je veux permettre une flexibilité en fin de journée
```
Critères d'acceptation :
- Après 19h (configurable), quota augmenté ou illimité
- Message : "En fin de journée, aidez-nous à sauver plus de paniers !"
- Évite le gaspillage si beaucoup de stock
- Tracking séparé (ne compte pas dans les stats d'abus)
```

#### Implémentation

**Migration DB** :
```sql
-- Ajouter colonnes de composition de foyer dans profiles
ALTER TABLE profiles ADD COLUMN household_size INTEGER DEFAULT 1;
ALTER TABLE profiles ADD COLUMN has_young_children BOOLEAN DEFAULT FALSE;
ALTER TABLE profiles ADD COLUMN daily_quota_points INTEGER;

-- Ajouter système de points pour les catégories
ALTER TABLE lots ADD COLUMN points_cost INTEGER DEFAULT 3;

-- Mettre à jour platform_settings
ALTER TABLE platform_settings ADD COLUMN use_points_system BOOLEAN DEFAULT FALSE;
ALTER TABLE platform_settings ADD COLUMN base_daily_points INTEGER DEFAULT 10;
ALTER TABLE platform_settings ADD COLUMN flexible_quota_hour INTEGER DEFAULT 19;

-- Fonction pour calculer le quota personnalisé
CREATE OR REPLACE FUNCTION calculate_beneficiary_quota(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_household_size INTEGER;
  v_has_children BOOLEAN;
  v_quota INTEGER;
  v_settings RECORD;
BEGIN
  SELECT use_points_system, base_daily_points, max_daily_beneficiary_reservations
  INTO v_settings
  FROM platform_settings LIMIT 1;
  
  SELECT household_size, has_young_children
  INTO v_household_size, v_has_children
  FROM profiles WHERE id = p_user_id;
  
  IF v_settings.use_points_system THEN
    -- Système de points
    v_quota := v_settings.base_daily_points;
    v_quota := v_quota + (v_household_size - 1) * 2; -- +2 points par personne supplémentaire
    IF v_has_children THEN
      v_quota := v_quota + 3; -- Bonus enfants
    END IF;
  ELSE
    -- Système classique de paniers
    v_quota := v_settings.max_daily_beneficiary_reservations;
    v_quota := v_quota + LEAST(v_household_size - 1, 3); -- +1 panier par personne, max +3
    IF v_has_children THEN
      v_quota := v_quota + 1;
    END IF;
  END IF;
  
  RETURN v_quota;
END;
$$ LANGUAGE plpgsql;
```

**Composant de configuration du foyer** :
```typescript
// src/components/beneficiary/HouseholdConfiguration.tsx
export function HouseholdConfiguration() {
  const { profile } = useAuthStore();
  const [householdSize, setHouseholdSize] = useState(profile?.household_size || 1);
  const [hasChildren, setHasChildren] = useState(profile?.has_young_children || false);
  const [estimatedQuota, setEstimatedQuota] = useState(0);
  
  useEffect(() => {
    // Calculer le quota estimé
    const calculateQuota = async () => {
      const { data } = await supabase.rpc('calculate_beneficiary_quota', {
        p_user_id: profile.id
      });
      setEstimatedQuota(data);
    };
    calculateQuota();
  }, [householdSize, hasChildren]);
  
  const handleSave = async () => {
    await supabase
      .from('profiles')
      .update({
        household_size: householdSize,
        has_young_children: hasChildren,
        daily_quota_points: estimatedQuota
      })
      .eq('id', profile.id);
  };
  
  return (
    <div className="p-6 bg-white rounded-xl">
      <h3 className="text-xl font-bold mb-4">Composition de votre foyer</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block mb-2">Nombre de personnes</label>
          <select
            value={householdSize}
            onChange={(e) => setHouseholdSize(parseInt(e.target.value))}
            className="w-full px-4 py-2 border rounded-lg"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
              <option key={n} value={n}>{n} personne{n > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={hasChildren}
            onChange={(e) => setHasChildren(e.target.checked)}
            id="has-children"
            className="w-5 h-5"
          />
          <label htmlFor="has-children">Enfants en bas âge (- 3 ans)</label>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="font-semibold text-green-800">
            Votre quota quotidien estimé :
          </p>
          <p className="text-3xl font-bold text-green-600">
            {estimatedQuota} points/jour
          </p>
          <p className="text-sm text-green-700 mt-2">
            Environ {Math.floor(estimatedQuota / 3)} paniers par jour
          </p>
        </div>
        
        <button
          onClick={handleSave}
          className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold"
        >
          Sauvegarder
        </button>
      </div>
    </div>
  );
}
```

**Modification de la logique de réservation** :
```typescript
const handleReserve = async (lot: Lot) => {
  const { data: settings } = await supabase.from('platform_settings').select('*').single();
  const now = new Date();
  const currentHour = now.getHours();
  
  // Vérifier si flexibilité en fin de journée
  const isFlexibleTime = currentHour >= settings.flexible_quota_hour;
  
  if (!isFlexibleTime) {
    // Vérification normale du quota
    if (settings.use_points_system) {
      // Système de points
      const quotaPoints = profile.daily_quota_points || settings.base_daily_points;
      const usedPoints = await getTodayUsedPoints(profile.id);
      const lotCost = lot.points_cost || 3;
      
      if (usedPoints + lotCost > quotaPoints) {
        showError('Quota de points dépassé');
        return;
      }
    } else {
      // Système classique
      const quota = profile.daily_quota_points || settings.max_daily_beneficiary_reservations;
      if (dailyCount >= quota) {
        showError('Quota atteint');
        return;
      }
    }
  } else {
    // Fin de journée : quota flexible
    showInfo('🌙 Fin de journée : aucune limite de quota !');
  }
  
  // Créer la réservation...
};
```

---

### 2.3 Feedback Post-Retrait et Évaluations
**Priorité** : 🟠 P1 - HAUTE  
**Complexité** : 🟡 Moyen (3-5 jours)  
**Impact** : ⭐⭐⭐⭐

#### User Stories

**US-BEN-030** : En tant que bénéficiaire, je veux évaluer un panier récupéré
```
Critères d'acceptation :
- Modal d'évaluation après retrait (ou email avec lien)
- Note sur 5 étoiles ⭐
- Critères à évaluer :
  - Qualité des produits
  - Quantité reçue vs attendue
  - Accueil du commerçant
  - Facilité de retrait
- Champ de commentaire optionnel
- Option "Panier conforme" (cochable rapidement)
```

**US-BEN-031** : En tant que bénéficiaire, je veux signaler un problème
```
Critères d'acceptation :
- Bouton "Signaler un problème" sur réservation completed
- Types de problèmes :
  - Produits de mauvaise qualité
  - Quantité insuffisante
  - Accueil désagréable
  - Produits différents de l'annonce
  - Autre (champ libre)
- Upload de photo possible
- Traitement par l'équipe admin
```

**US-BEN-032** : En tant que commerçant, je veux voir les évaluations de mes paniers
```
Critères d'acceptation :
- Dashboard commerçant affiche moyenne des notes
- Liste des évaluations avec commentaires
- Possibilité de répondre aux commentaires
- Stats : % de satisfaction, NPS, etc.
```

#### Implémentation

```sql
CREATE TABLE beneficiary_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_id UUID REFERENCES reservations(id) UNIQUE,
  beneficiary_id UUID REFERENCES profiles(id),
  merchant_id UUID REFERENCES profiles(id),
  lot_id UUID REFERENCES lots(id),
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  quality_rating INTEGER,
  quantity_rating INTEGER,
  service_rating INTEGER,
  comment TEXT,
  is_issue BOOLEAN DEFAULT FALSE,
  issue_type VARCHAR(100),
  issue_description TEXT,
  issue_resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### 2.4 Dashboard d'Impact Personnel
**Priorité** : 🟠 P1 - HAUTE  
**Complexité** : 🟡 Moyen (3-5 jours)  
**Impact** : ⭐⭐⭐⭐

#### User Stories

**US-BEN-033** : En tant que bénéficiaire, je veux voir mon impact environnemental
```
Critères d'acceptation :
- Onglet "Impact" dans le dashboard
- Statistiques affichées :
  - Nombre total de paniers récupérés
  - Repas sauvés (= nombre de paniers)
  - CO₂ économisé (formule : repas × 0.9 kg)
  - Valeur économisée (somme des prix d'origine)
  - Évolution mois par mois (graphique)
- Design engageant et motivant
- Partage sur réseaux sociaux possible
```

**US-BEN-034** : En tant que bénéficiaire, je veux voir mon historique détaillé
```
Critères d'acceptation :
- Liste complète de toutes les réservations (avec pagination)
- Filtres : mois, commerçant, catégorie
- Export en PDF ou CSV
- Graphiques d'évolution
```

---

## 🟡 Sprint 3 : Fonctionnalités Utiles (P2)

### 3.1 Recherche et Filtres Avancés
**Priorité** : 🟡 P2 - MOYENNE  
**Complexité** : 🟡 Moyen (3-5 jours)

### 3.2 Préférences Alimentaires
**Priorité** : 🟡 P2 - MOYENNE  
**Complexité** : 🟡 Moyen (3-5 jours)

### 3.3 Système de Favoris
**Priorité** : 🟡 P2 - MOYENNE  
**Complexité** : 🟢 Simple (1-2 jours)

### 3.4 Notifications Push
**Priorité** : 🟡 P2 - MOYENNE  
**Complexité** : 🔴 Complexe (1-2 semaines)

### 3.5 Chatbot Support
**Priorité** : 🟡 P2 - MOYENNE  
**Complexité** : ⚫ Très complexe (2+ semaines)

---

## 🟢 Sprint 4+ : Fonctionnalités Futures (P3)

### 4.1 Gamification Avancée
### 4.2 Communauté et Partage de Recettes
### 4.3 Intégration Transports en Commun
### 4.4 Application Mobile Native
### 4.5 Mode Offline / PWA
### 4.6 Support Multi-langue
### 4.7 Programme de Parrainage

---

## 📊 Synthèse des Priorités

| Sprint | Fonctionnalité | Priorité | Complexité | Durée estimée |
|--------|---------------|----------|------------|---------------|
| **1** | Interface admin vérification | 🔴 P0 | 🔴 Complexe | 1-2 sem |
| **1** | Annulation de réservation | 🔴 P0 | 🟡 Moyen | 3-5 jours |
| **1** | Notifications email | 🔴 P0 | 🟡 Moyen | 3-5 jours |
| **1** | Réservations expirées | 🔴 P0 | 🟢 Simple | 1-2 jours |
| **1** | Sécurité transactions | 🔴 P0 | 🟡 Moyen | 3-5 jours |
| **2** | Filtre géographique | 🟠 P1 | 🔴 Complexe | 1-2 sem |
| **2** | Amélioration quota | 🟠 P1 | 🟡 Moyen | 3-5 jours |
| **2** | Feedback post-retrait | 🟠 P1 | 🟡 Moyen | 3-5 jours |
| **2** | Dashboard d'impact | 🟠 P1 | 🟡 Moyen | 3-5 jours |
| **3+** | Recherche avancée | 🟡 P2 | 🟡 Moyen | 3-5 jours |
| **3+** | Préférences alimentaires | 🟡 P2 | 🟡 Moyen | 3-5 jours |
| **4+** | Gamification | 🟢 P3 | 🔴 Complexe | 2+ sem |
| **4+** | App mobile native | 🟢 P3 | ⚫ Très complexe | 4+ sem |

**Total Sprint 1 (Critique)** : ~5-7 semaines  
**Total Sprint 2 (Important)** : ~4-6 semaines  
**Total Sprint 3 (Utile)** : ~3-4 semaines  
**Total Sprint 4+ (Futur)** : À définir

---

## 🎯 Recommandations Stratégiques

### 1. Commencer par le Sprint 1 IMMÉDIATEMENT
Le sprint 1 contient des **fonctionnalités bloquantes** qui impactent le bon fonctionnement actuel :
- Impossibilité de vérifier les bénéficiaires (CRITIQUE)
- Pas d'annulation possible (frustration utilisateurs)
- Pas de notifications (mauvaise UX)

### 2. Prioriser la distance (Sprint 2)
La géolocalisation est un **différenciateur majeur** pour l'UX bénéficiaire. Sans elle, le service est moins utilisable pour les personnes à mobilité réduite.

### 3. Adapter le quota rapidement (Sprint 2)
Le système actuel (2 paniers/jour pour tous) est **trop rigide** et peut exclure des familles qui en ont vraiment besoin.

### 4. Créer une boucle de feedback (Sprint 2)
Sans évaluations, impossible d'améliorer le service et de détecter les commerçants problématiques.

### 5. Reporter la gamification (Sprint 4+)
Bien que fun, la gamification n'est **pas prioritaire** par rapport aux fonctionnalités de base.

---

## 💡 Questions à se poser avant de commencer

1. **Vérification des bénéficiaires** :
   - Quels sont les critères d'éligibilité exactement ?
   - Quels documents sont requis ?
   - Qui dans l'équipe sera responsable de la validation ?

2. **Système de quota** :
   - Veut-on un système de points ou rester sur nombre de paniers ?
   - Quelle pondération pour chaque type de produit ?
   - À quelle fréquence réévaluer le quota d'un bénéficiaire ?

3. **Notifications** :
   - Quel service d'emailing utiliser ? (Resend, SendGrid, autre)
   - Budget disponible ?
   - Fréquence des emails (ne pas spammer)

4. **Géolocalisation** :
   - Budget pour Google Maps API ou utiliser Mapbox/OpenStreetMap ?
   - Tous les bénéficiaires ont-ils une adresse fixe ?
   - Comment gérer les personnes sans domicile fixe ?

5. **RGPD** :
   - Conservation des données d'évaluation : combien de temps ?
   - Consentement explicite pour géolocalisation ?
   - Droit à l'oubli : implémentation technique ?

---

**Document prêt pour discussion et planification !** 🚀


