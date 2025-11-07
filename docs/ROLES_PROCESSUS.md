## Processus Opérationnels par Rôle

Ce document détaille le parcours standard et les responsabilités quotidiennes associées à chaque rôle EcoPanier. Il constitue une base pour harmoniser l'expérience utilisateur, cadrer les développements fonctionnels et faciliter la formation des équipes support.

---

## Client

- **Objectifs** : Réserver des lots anti-gaspi, financer des paniers suspendus, suivre son impact.
- **Parcours type**
  1. Création de compte et vérification e-mail via Supabase Auth.
  2. Complétion du profil (coordonnées, préférences alimentaires).
  3. Consultation du catalogue (`status = available`) avec filtres dynamiques.
  4. Réservation d'un lot : sélection, confirmation, paiement sécurisé, génération du QR retrait.
  5. Suivi des réservations en cours et historique dans le tableau de bord personnel.
  6. Don de panier suspendu facultatif : choix du commerce, paiement, suivi d'affectation.
  7. Réception des notifications (push/e-mail) pour rappels de retrait et nouvelles offres.
- **Points clés UX**
  - Limiter les frictions à la réservation (CTA clair, infos allergies visibles).
  - Mettre en avant l'impact environnemental et solidaire pour renforcer l'engagement.

---

## Commerçant

- **Objectifs** : Publier les invendus, gérer la logistique de retrait, piloter la performance.
- **Parcours type**
  1. Inscription et validation par l'équipe EcoPanier (KYC, pièces justificatives).
  2. Paramétrage de la station de retrait : horaires, adresse, consignes.
  3. Création d'un lot :
     - Upload photo (analyse IA optionnelle via Gemini pour pré-remplissage).
     - Saisie des informations (quantité, prix, date limite, allergènes).
     - Publication avec contrôle de cohérence (quantité > 0, date > maintenant).
  4. Suivi en temps réel des réservations et paniers suspendus financés.
  5. Validation du retrait : scan du QR client, vérification PIN, changement `status` → `completed`.
  6. Gestion des stocks résiduels (annulation ou prolongation avant expiration).
  7. Consultation des statistiques (ventes, invendus sauvés, revenus solidaires).
- **Points clés UX**
  - Interface rapide sur desktop + tablette caisse.
  - Alertes sur lots proches de l'expiration.

---

## Bénéficiaire

- **Objectifs** : Accéder aux paniers suspendus dans la limite quotidienne et suivre ses droits.
- **Parcours type**
  1. Enregistrement par une association partenaire (création `beneficiary_id`).
  2. Activation du compte avec code d'accès sécurisé.
  3. Consultation des paniers disponibles (limite : 2 retraits/jour).
  4. Réservation ou retrait immédiat au kiosque (mode assisté possible).
  5. Présentation du QR ou du code PIN au commerçant pour validation.
  6. Suivi des retraits effectués et du solde de paniers solidaires.
- **Points clés UX**
  - Parcours simplifié, lisibilité renforcée, accessibilité (taille police, contrastes).
  - Messages empathiques et rassurants (lutte contre la stigmatisation).

---

## Association

- **Objectifs** : Gérer les bénéficiaires, suivre l'impact social, coordonner les distributions.
- **Parcours type**
  1. Création du compte association et validation administrative (SIREN, charte).
  2. Enregistrement des bénéficiaires (lot d'import CSV ou saisie manuelle).
  3. Attribution des statuts et droits (dates de validité, restrictions spécifiques).
  4. Suivi en temps réel des retraits réalisés par leurs bénéficiaires.
  5. Analyse des statistiques : paniers financés, impact CO₂, fréquence de retrait.
  6. Export des données pour reporting interne ou partenaires institutionnels.
  7. Communication avec les commerçants partenaires via messagerie intégrée (roadmap).
- **Points clés UX**
  - Tableaux clairs, filtres avancés, exports en un clic.
  - Rappels automatiques lors de l'expiration de droits bénéficiaires.

---

## Collecteur

- **Objectifs** : Assurer la logistique solidaire en pick-up & drop-off.
- **Parcours type**
  1. Onboarding avec validation des documents (pièce d'identité, RIB).
  2. Accès au tableau des missions disponibles (`status = available`).
  3. Acceptation d'une mission : récupération automatisée du planning et des coordonnées.
  4. Check-in chez le commerçant : scan du QR mission, vérification des lots chargés.
  5. Livraison chez les bénéficiaires ou points relais : mise à jour du statut à chaque étape.
  6. Finalisation de la mission : preuve de livraison, feedback qualitatif.
  7. Suivi des gains cumulés et de l'impact solidaire généré.
- **Points clés UX**
  - Application mobile-first, navigation GPS intégrée (via lien externe).
  - Gestion des incidents (lot manquant, bénéficiaire absent) avec workflow simple.

---

## Admin

- **Objectifs** : Piloter la plateforme, garantir la conformité, soutenir les utilisateurs.
- **Parcours type**
  1. Accès au back-office complet avec permissions élevées (veille renforcer la sécurité).
  2. Monitoring en temps réel des indicateurs clés (lots disponibles, retraits, incidents).
  3. Gestion des utilisateurs : validations, suspensions, réinitialisations de compte.
  4. Configuration des paramètres globaux (frais de service, règles RLS, politiques de quotas).
  5. Audit et modération des contenus (photos, descriptions, témoignages).
  6. Gestion des signalements support et SLA d'intervention.
  7. Export global pour reporting stratégique et obligations réglementaires.
- **Points clés UX**
  - Dashboard synthétique avec deep-dive possible.
  - Journalisation des actions critiques (traçabilité complète).

---

## Synthèse transversale

- **Suppression de friction** : chaque rôle doit trouver ses actions principales en <3 clics.
- **Sécurité & Confiance** : authentification robuste, traçabilité des opérations, messages clairs.
- **Impact mesurable** : indicateurs environnementaux (CO₂, repas sauvés) et sociaux visibles.
- **Support proactif** : notifications contextuelles, aide en ligne, scénarios guidés.

Ce document doit être mis à jour à chaque évolution majeure du parcours utilisateur ou des règles métiers.

