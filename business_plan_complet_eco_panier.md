# EcoPanier — Business plan complet

**Slogan :** Combattez le gaspillage alimentaire tout en nourrissant l'espoir.

---

## 1. Résumé exécutif

EcoPanier est une plateforme numérique (React + TypeScript, Supabase, Tailwind CSS) visant à réduire le gaspillage alimentaire en connectant commerçants, clients, bénéficiaires (personnes en situation de précarité), collecteurs et administrateurs. Les commerçants proposent des lots à prix réduits (jusqu'à -70%) et des lots 100% gratuits réservés aux bénéficiaires (maximum 2 lots gratuits/jour par bénéficiaire). La plateforme facilite la logistique (collecteurs, station de retrait), assure la dignité des bénéficiaires (retrait sans distinction visuelle) et mesure l'impact (repas sauvés, CO₂ économisé, valeur économisée).

**Stack technique choisie :** React (TypeScript) + Supabase (auth, base Postgres, storage, fonctions), Tailwind CSS.

**Licence suggérée :** MIT (code client & serveur), avec un fichier LICENSE détaillant les droits d'utilisation et contributions. Pour le contenu sensible (données personnelles), politique de confidentialité RGPD et mentions légales adaptées.

---

## 2. Proposition de valeur

- **Commerçants :** réduction des pertes, visibilité, outil simple pour valoriser invendus (IA pour création rapide de lots).
- **Clients :** accès à produits à bas prix, expérience locale, impact personnel visible (CO₂, repas sauvés).
- **Bénéficiaires :** accès sécurisé et digne à lots gratuits, traçabilité.
- **Collecteurs :** missions rémunérées, plateforme de mise en relation simplifiée.
- **Société :** réduction des déchets, aide alimentaire complémentaire.

---

## 3. Analyse de marché & opportunité

- **Taille du marché (France / urbain) :** marché significatif sur la consommation locale, initiatives anti-gaspillage en croissance.
- **Tendances :** consommateur sensible à durabilité, politiques publiques favorisant le don alimentaire, montée des solutions tech de réemploi alimentaire.
- **Concurrence :** applications anti-gaspi locales et nationales (ex. Too Good To Go) — différenciateur d'EcoPanier : volet solidarité intégré (lots 100% gratuits) + station de retrait publique + IA pour création instantanée de lots.

---

## 4. Modèle économique

**Sources de revenus :**
1. **Commission sur vente anti-gaspi (places payantes)** — ex. 10% sur le prix payé par le client.
2. **Abonnement commerçants (optionnel premium)** — fonctionnalités avancées : analytics approfondis, gestion multi-points, priorisation listing.
3. **Fees de logistique / collecte** — prise en charge partielle des frais par la plateforme / commission sur missions collecteurs.
4. **Subventions / dons / partenariats d'entreprise** — pour financement du volet solidarité et croissance.
5. **Services B2B (API, data anonymisée, rapports)** — pour municipalités/ONG.

**Tarification proposée MVP :**
- Commission : 10% par lot vendu.
- Abonnement Premium commerçants : 20€/mois (optionnel) — visant 20% des commerçants la première année.
- Paiement par mission collecteur : montant variable — la plateforme prélève une commission fixe ou variable sur la mission.

---

## 5. Projections financières (estimation conservatrice)

**Hypothèses clés :**
- Lots moyens par commerçant : 20 lots/mois
- Prix moyen par lot : 6 €
- Taux de vente (sell-through) : 60%
- Commission plateforme : 10%
- Part commerçants abonnés (premium) : 20%
- Abonnement : 20 €/mois
- Part des lots livrés via collecteurs gérés par la plateforme : 50%
- Frais de livraison perçus par la plateforme : 1,5 € par lot livré
- Dons/subventions annuelles estimées (plateforme) : 24 000 € la première année

**Résultat (approximatif) :**
- **Année 1 (200 commerçants) — Chiffre d'affaires estimé : 72 480 €**
  - Commission ventes : 17 280 €
  - Abonnements : 9 600 €
  - Revenus logistique : 21 600 €
  - Dons/Subventions : 24 000 €
  - Lots sauvés annuels estimés : 28 800

- **Année 2 (600 commerçants) — CA estimé : 169 440 €**
  - Lots sauvés annuels estimés : 86 400

- **Année 3 (1 500 commerçants) — CA estimé : 387 600 €**
  - Lots sauvés annuels estimés : 216 000

> Ces chiffres sont des projections conservatrices servant de repères pour lever des fonds ou bâtir un prévisionnel détaillé.

---

## 6. KPIs (indicateurs clés)

- Nombre de commerçants actifs
- Lots créés / vendus / offerts (gratuits)
- Repas sauvés (calculé par lot)
- CO₂ économisé (0,9 kg CO₂ / repas)
- Taux de rétention commerçants et clients
- Valeur moyenne d’un lot
- Revenus par source (commission, abonnement, livraison, dons)
- Coût d’acquisition client (CAC) et Lifetime Value (LTV)

---

## 7. Opérations & logistique

**Création de lots :**
- App commerçant avec IA (Gemini 2.0 Flash) : photo → remplissage automatique → vérification → publication

**Station de retrait :**
- Interface publique (web mobile/tablette) : scan QR code + PIN 6 chiffres, logs automatiques.
- Option offline light pour zones avec faible connectivité (cache + sync)

**Collecteurs :**
- App dédiée (acceptation missions, navigation GPS, preuve photo/signature)
- Paiement par mission via la plateforme (livraison rémunérée)

**Support & qualité :**
- SLA pour gestion litiges, retour commerçants
- Processus vérification bénéficiaire (ID unique YYYY-BEN-XXXXX)

---

## 8. Produit & MVP (priorités)

**MVP minimal (par rôle) :**
- **Client :** recherche lots, réservations (QR+PIN), carte, historique, tableau d’impact
- **Commerçant :** création manuelle de lots, gestion inventaire, horaires de retrait, station de retrait (scan)
- **Bénéficiaire :** accès lots gratuits, vérification ID, retrait QR+PIN
- **Collecteur :** liste missions, acceptation, preuve de livraison
- **Admin :** gestion utilisateurs, logs, analytics basiques

**MVP+ (phase 2) :** IA pour génération instantanée de lots, abonnement premium, gestion avancée des collecteurs, API pour partenaires.

---

## 9. Architecture technique (haut niveau)

- **Front-end :** React + TypeScript, Tailwind CSS, PWA pour station de retrait (fonctionne hors-ligne limitée)
- **Back-end :** Supabase (Postgres, Auth, Storage, Edge Functions). Avantages : rapidité de développement, coût initial bas, intégration auth/roles, realtime.
- **IA :** intégration à Gemini 2.0 Flash (API) pour l’analyse d’images et génération de métadonnées.
- **Cartographie & navigation :** API de carto (ex. Mapbox / OpenStreetMap + services de routing) pour localiser commerçants et navigation collecteurs.
- **Paiements :** Stripe (gestion paiements, commissions, versements collecteurs)
- **Monitoring & logs :** Sentry (erreurs), Supabase logs + outils analytics
- **Sécurité & conformité :** chiffrement des données en transit (TLS), stockage chiffré pour données sensibles, conformité RGPD (consentement, droit d’accès, suppression).

---

## 10. Data model (extrait simplifié)

- **users** (id, role [client, commerçant, bénéficiaire, collecteur, admin], name, email, phone, verified, created_at)
- **merchants** (user_id, store_name, address, geo, hours, verified)
- **lots** (id, merchant_id, title, description, price_original, price_antigaspi, quantity, category, perishability, need_cold_chain, images[], created_at, status)
- **reservations** (id, lot_id, user_id, type [paid,bene], status, qr_code, pin, created_at, picked_at)
- **beneficiaries** (user_id, bene_id_code YYYY-BEN-XXXXX, verified_docs)
- **missions** (id, collecteur_id, origin_lots[], status, proof_photos[], signature, payout_amount)
- **impact_metrics** (date, lots_saved, meals_saved, co2_saved_kg, value_saved_eur)

---

## 11. UX / User flows (essentiel)

1. **Commerçant crée un lot (avec IA)** : photo → auto-remplissage → confirme → publie → slot horaire de retrait.
2. **Client réserve** : découvre lot → réserve → reçoit QR+PIN → récupère au commerçant → commerçant scanne / valide.
3. **Bénéficiaire récupère lot gratuit** : choisit lot gratuit → code PIN envoyé → station de retrait ou commerçant valide QR+PIN → enregistrement sans distinction visuelle.
4. **Collecteur effectue mission** : accepte mission → collecte lots → prend preuve → délivre aux structures sociales / points de distribution.

---

## 12. Stratégie go-to-market (GTM)

**Phase 0 — pré-lancement (3 mois) :**
- Tests terrain avec 20 commerces partenaires (boulangeries, primeurs, épiceries solidaires)
- Partenariats avec associations locales et CCAS
- Landing page + collecte emails (early adopters), campagne réseaux sociaux

**Phase 1 — lancement local (6–12 mois) :**
- Lancement dans une ville pilote (zones urbaines) avec incentives (réductions, gratuités pour premiers commerçants)
- Relations presse locale, événements de sensibilisation anti-gaspillage
- Programme ambassadeur commerçants

**Phase 2 — croissance & scale (année 2+) :**
- Expansion régionale, intégration API avec acteurs locaux
- Campagnes institutionnelles pour subventions
- Développement features B2B (municipalités, centres logistiques)

---

## 13. Marketing & acquisition

- **Acquisition commerçants :** prospection terrain, partenariats associatifs, workshops démonstration IA.
- **Acquisition clients :** SEO local, partenariat avec influenceurs food durable, programmes de parrainage, publicité ciblée locale.
- **Engagement & rétention :** notifications push, dashboard impact, programmes de fidélité (badges, récompenses)

---

## 14. Gouvernance, conformité & éthique

- **RGPD :** minimisation des données, conservation limitée, droit d’accès/suppression.
- **Dignité bénéficiaire :** pas de signalement visuel public des lots gratuits, retrait identique aux clients payants.
- **Vérification & fraude :** contrôle documenté des bénéficiaires, logs des retraits (non-exposés publiquement), limite 2 lots gratuits/jour.

---

## 15. Plan de recrutement & coûts humains (phase initiale)

**Équipe core (6–9 personnes initialement) :**
- CEO / Product (1)
- CTO / Lead dev fullstack (1)
- 2× Développeurs front/back (2)
- Ingénieur IA / ML intégration (contrat) (0.5)
- Ops / Customer Success (1)
- Growth / Marketing (1)
- Community / partenariats (1)

**Coûts salariaux approximatifs annuels (France, brut) :** à détailler dans un prévisionnel RH selon barèmes locaux.

---

## 16. Plan technique & roadmap (quarts)

**T0 (0–3 mois)** — Prototype & tests terrain
- MVP backend Supabase, Front React (création lots manuelle), station de retrait basique
- Onboarding 20 commerçants pilotes

**T1 (3–6 mois)** — Lancement ville pilote
- Intégration paiement Stripe, QR/PIN stable, collecte data impact
- Développement app collecteur minimal

**T2 (6–12 mois)** — IA & automatisation
- Intégration Gemini 2.0 Flash pour auto-filling des lots
- Abonnement premium, tableau analytics pour commerçants

**T3 (12–24 mois)** — Scale & B2B
- API pour municipalités/ONG, optimisation logistique, déploiement multi-villes

---

## 17. Risques & mitigations

- **Adoption commerçants faible :** offres pilotes gratuites, démonstration ROI (réduction déchets valeur économisée).
- **Problèmes réglementaires sur dons alimentaires :** partenariat juridique + conformité sanitaire.
- **Fraude / abuser des lots gratuits :** verification stricte bénéficiaires, limitation par jour, logs et audits.
- **Dépendance IA / mauvaise détection :** UI de correction manuelle, score de confiance, modération humaine.

---

## 18. Besoins de financement (exemple)

**Objectif amorçage : 250k €** — couvre 12–18 mois pour :
- Développement produit (salaires, infra) : ~140k €
- Opérations & pilots terrain (partenariats, marketing) : ~40k €
- Fonds pour couvrir lots gratuits / subventions solidaires (réserves) : ~30k €
- Frais juridiques / conformité / assurances : ~10k €
- Divers / imprévus : ~30k €

**Utilisation :** produit, recrutement, pilots terrain, marketing, réserve solidarité.

---

## 19. Documents livrables & prochains livrables proposés

- Business plan synthétique (this doc)
- Pitch deck 10 slides
- Prévisionnel financier détaillé (3 ans)
- MVP roadmap techniques et backlog produit
- Spécifications API & data model complet

---

## 20. Annexes rapides

- **Calcul d’impact estimé :** 1 lot = 1 repas sauvé (hypothèse), 0,9 kg CO₂ économisé par repas.
- **Ex. de code & intégration :** structure recommandée React TS + Supabase (auth roles : admin, merchant, client, beneficiary, collector), pattern de composant pour station de retrait (PWA).

---

### Licence & distribution

Le code source front & back peut être publié sous **Licence MIT**. Les contenus (logos, marques) et la base de données d’utilisateurs resteront sous contrôle de l’organisation (mentions légales et conditions d’utilisation à préparer). Pour le volet social (données bénéficiaires) mettre en place contrats avec associations et mentionner conditions de traitement des données dans la politique RGPD.


---

*Fin du business plan — EcoPanier*

