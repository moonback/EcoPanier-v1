-- =====================================================
-- Migration: Insertion de 20 lots fictifs par commerçant
-- Description: Créer des produits variés et pertinents pour chaque catégorie
-- Date: 14 janvier 2025
-- =====================================================

-- Variables pour les merchant_id
-- Merchant 1: 1a064a4f-27a7-43c8-b43a-944d23fa3d34
-- Merchant 2: 35363d38-f196-48a2-b1e8-9b1c76dc7c19

-- =====================================================
-- COMMERÇANT 1: 1a064a4f-27a7-43c8-b43a-944d23fa3d34
-- =====================================================

-- Catégorie: fruits_legumes (3 produits)
INSERT INTO lots (merchant_id, title, description, category, original_price, discounted_price, quantity_total, pickup_start, pickup_end, requires_cold_chain, is_urgent, status)
VALUES
('1a064a4f-27a7-43c8-b43a-944d23fa3d34', 'Panier de fruits de saison', 'Assortiment de pommes, poires, oranges et kiwis - environ 3kg. Légères imperfections visuelles mais qualité gustative excellente.', 'fruits_legumes', 15.00, 6.00, 8, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '5 hours', true, false, 'available'),
('1a064a4f-27a7-43c8-b43a-944d23fa3d34', 'Légumes bio du jour', 'Carottes, courgettes, poivrons et tomates bio. Fin de journée, à consommer rapidement.', 'fruits_legumes', 12.00, 4.50, 10, NOW() + INTERVAL '3 hours', NOW() + INTERVAL '6 hours', true, true, 'available'),
('1a064a4f-27a7-43c8-b43a-944d23fa3d34', 'Salades et herbes aromatiques', 'Laitues, roquette, basilic et persil frais. Idéal pour salades et cuisine.', 'fruits_legumes', 8.00, 3.00, 12, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '4 hours', true, false, 'available');

-- Catégorie: boulangerie (3 produits)
INSERT INTO lots (merchant_id, title, description, category, original_price, discounted_price, quantity_total, pickup_start, pickup_end, requires_cold_chain, is_urgent, status)
VALUES
('1a064a4f-27a7-43c8-b43a-944d23fa3d34', 'Baguettes tradition de la veille', 'Lot de 5 baguettes tradition cuites hier. Parfaites pour toast ou pain perdu.', 'boulangerie', 7.50, 2.50, 15, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '4 hours', false, false, 'available'),
('1a064a4f-27a7-43c8-b43a-944d23fa3d34', 'Viennoiseries du matin', 'Assortiment croissants, pains au chocolat et pains aux raisins. À consommer aujourd''hui.', 'boulangerie', 18.00, 7.00, 6, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '5 hours', false, true, 'available'),
('1a064a4f-27a7-43c8-b43a-944d23fa3d34', 'Pain complet et céréales', 'Pains complets, pain de seigle et pain aux céréales. Excellente conservation.', 'boulangerie', 12.00, 5.00, 10, NOW() + INTERVAL '3 hours', NOW() + INTERVAL '7 hours', false, false, 'available');

-- Catégorie: boucherie (2 produits)
INSERT INTO lots (merchant_id, title, description, category, original_price, discounted_price, quantity_total, pickup_start, pickup_end, requires_cold_chain, is_urgent, status)
VALUES
('1a064a4f-27a7-43c8-b43a-944d23fa3d34', 'Viande hachée fraîche', 'Viande hachée 15% MG - 500g. DLC courte, à congeler ou cuisiner rapidement.', 'boucherie', 8.50, 3.50, 8, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '3 hours', true, true, 'available'),
('1a064a4f-27a7-43c8-b43a-944d23fa3d34', 'Poulet fermier entier', 'Poulet fermier Label Rouge 1,5kg. Fin de stock, excellente qualité.', 'boucherie', 16.00, 7.00, 5, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '5 hours', true, false, 'available');

-- Catégorie: poissonnerie (2 produits)
INSERT INTO lots (merchant_id, title, description, category, original_price, discounted_price, quantity_total, pickup_start, pickup_end, requires_cold_chain, is_urgent, status)
VALUES
('1a064a4f-27a7-43c8-b43a-944d23fa3d34', 'Filets de saumon frais', 'Filets de saumon norvégien - 400g. Ultra frais, à cuisiner ce soir.', 'poissonnerie', 14.00, 6.00, 6, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '3 hours', true, true, 'available'),
('1a064a4f-27a7-43c8-b43a-944d23fa3d34', 'Crevettes décortiquées', 'Crevettes roses décortiquées - 300g. Cuites, prêtes à déguster.', 'poissonnerie', 12.00, 5.00, 8, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '4 hours', true, true, 'available');

-- Catégorie: epicerie (3 produits)
INSERT INTO lots (merchant_id, title, description, category, original_price, discounted_price, quantity_total, pickup_start, pickup_end, requires_cold_chain, is_urgent, status)
VALUES
('1a064a4f-27a7-43c8-b43a-944d23fa3d34', 'Pâtes et riz bio', 'Assortiment pâtes italiennes, riz basmati et quinoa bio. DLUO courte.', 'epicerie', 15.00, 6.00, 12, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '8 hours', false, false, 'available'),
('1a064a4f-27a7-43c8-b43a-944d23fa3d34', 'Conserves et bocaux', 'Tomates pelées, haricots verts et ratatouille en bocaux. Fin de série.', 'epicerie', 18.00, 7.50, 10, NOW() + INTERVAL '3 hours', NOW() + INTERVAL '9 hours', false, false, 'available'),
('1a064a4f-27a7-43c8-b43a-944d23fa3d34', 'Huiles et condiments', 'Huile d''olive, vinaigre balsamique et moutarde de Dijon. Emballages abîmés.', 'epicerie', 22.00, 9.00, 8, NOW() + INTERVAL '4 hours', NOW() + INTERVAL '10 hours', false, false, 'available');

-- Catégorie: produits_laitiers (3 produits)
INSERT INTO lots (merchant_id, title, description, category, original_price, discounted_price, quantity_total, pickup_start, pickup_end, requires_cold_chain, is_urgent, status)
VALUES
('1a064a4f-27a7-43c8-b43a-944d23fa3d34', 'Fromages affinés', 'Sélection camembert, brie et comté. DLC dans 3 jours, parfaits pour plateau.', 'produits_laitiers', 16.00, 6.50, 7, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '5 hours', true, false, 'available'),
('1a064a4f-27a7-43c8-b43a-944d23fa3d34', 'Yaourts nature bio', 'Lot de 12 yaourts nature bio. DLC courte mais produit excellent.', 'produits_laitiers', 6.00, 2.50, 15, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '4 hours', true, true, 'available'),
('1a064a4f-27a7-43c8-b43a-944d23fa3d34', 'Lait et crème fraîche', 'Lait demi-écrémé 1L et crème fraîche 30cl. DLC dans 2 jours.', 'produits_laitiers', 5.00, 2.00, 20, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '6 hours', true, true, 'available');

-- Catégorie: plats_prepares (2 produits)
INSERT INTO lots (merchant_id, title, description, category, original_price, discounted_price, quantity_total, pickup_start, pickup_end, requires_cold_chain, is_urgent, status)
VALUES
('1a064a4f-27a7-43c8-b43a-944d23fa3d34', 'Quiches et tartes salées', 'Quiche lorraine et tarte aux légumes - portions individuelles.', 'plats_prepares', 10.00, 4.00, 10, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '3 hours', true, true, 'available'),
('1a064a4f-27a7-43c8-b43a-944d23fa3d34', 'Plats traiteur du jour', 'Lasagnes, gratin dauphinois et poulet rôti. Préparés ce matin.', 'plats_prepares', 25.00, 10.00, 6, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '5 hours', true, true, 'available');

-- Catégorie: autres (2 produits)
INSERT INTO lots (merchant_id, title, description, category, original_price, discounted_price, quantity_total, pickup_start, pickup_end, requires_cold_chain, is_urgent, status)
VALUES
('1a064a4f-27a7-43c8-b43a-944d23fa3d34', 'Jus de fruits frais', 'Jus d''orange et pomme pressés maison - bouteilles 1L. À consommer sous 48h.', 'autres', 12.00, 5.00, 10, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '4 hours', true, false, 'available'),
('1a064a4f-27a7-43c8-b43a-944d23fa3d34', 'Confiseries artisanales', 'Bonbons, chocolats et pâtes de fruits. Légères imperfections visuelles.', 'autres', 15.00, 6.00, 12, NOW() + INTERVAL '3 hours', NOW() + INTERVAL '8 hours', false, false, 'available');


-- =====================================================
-- COMMERÇANT 2: 35363d38-f196-48a2-b1e8-9b1c76dc7c19
-- =====================================================

-- Catégorie: fruits_legumes (3 produits)
INSERT INTO lots (merchant_id, title, description, category, original_price, discounted_price, quantity_total, pickup_start, pickup_end, requires_cold_chain, is_urgent, status)
VALUES
('35363d38-f196-48a2-b1e8-9b1c76dc7c19', 'Fruits exotiques mûrs', 'Mangues, avocats, ananas et bananes. Mûrs à point, consommation immédiate.', 'fruits_legumes', 18.00, 7.00, 6, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '5 hours', true, true, 'available'),
('35363d38-f196-48a2-b1e8-9b1c76dc7c19', 'Légumes racines bio', 'Pommes de terre, carottes, navets et betteraves bio. Calibres irréguliers.', 'fruits_legumes', 10.00, 4.00, 15, NOW() + INTERVAL '3 hours', NOW() + INTERVAL '7 hours', false, false, 'available'),
('35363d38-f196-48a2-b1e8-9b1c76dc7c19', 'Agrumes de saison', 'Oranges, citrons, pamplemousses et mandarines. Petites taches mais juteux.', 'fruits_legumes', 14.00, 5.50, 12, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '4 hours', false, false, 'available');

-- Catégorie: boulangerie (3 produits)
INSERT INTO lots (merchant_id, title, description, category, original_price, discounted_price, quantity_total, pickup_start, pickup_end, requires_cold_chain, is_urgent, status)
VALUES
('35363d38-f196-48a2-b1e8-9b1c76dc7c19', 'Pains spéciaux artisanaux', 'Pain aux noix, fougasse et pain de campagne. Invendus de la journée.', 'boulangerie', 16.00, 6.50, 8, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '5 hours', false, false, 'available'),
('35363d38-f196-48a2-b1e8-9b1c76dc7c19', 'Pâtisseries de la veille', 'Éclairs, tartelettes et choux à la crème. Encore délicieux, prix cassé.', 'boulangerie', 22.00, 8.00, 5, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '3 hours', true, true, 'available'),
('35363d38-f196-48a2-b1e8-9b1c76dc7c19', 'Brioches et pains au lait', 'Brioches tressées et pains au lait moelleux. Parfaits pour le goûter.', 'boulangerie', 10.00, 4.00, 12, NOW() + INTERVAL '3 hours', NOW() + INTERVAL '6 hours', false, false, 'available');

-- Catégorie: boucherie (2 produits)
INSERT INTO lots (merchant_id, title, description, category, original_price, discounted_price, quantity_total, pickup_start, pickup_end, requires_cold_chain, is_urgent, status)
VALUES
('35363d38-f196-48a2-b1e8-9b1c76dc7c19', 'Steaks et côtelettes', 'Steaks de bœuf et côtelettes d''agneau. Qualité boucherie, fin de stock.', 'boucherie', 22.00, 9.00, 6, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '3 hours', true, true, 'available'),
('35363d38-f196-48a2-b1e8-9b1c76dc7c19', 'Charcuterie artisanale', 'Saucisson sec, jambon cru et pâté de campagne. Fin de série.', 'boucherie', 18.00, 7.50, 10, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '6 hours', true, false, 'available');

-- Catégorie: poissonnerie (2 produits)
INSERT INTO lots (merchant_id, title, description, category, original_price, discounted_price, quantity_total, pickup_start, pickup_end, requires_cold_chain, is_urgent, status)
VALUES
('35363d38-f196-48a2-b1e8-9b1c76dc7c19', 'Pavés de poisson blanc', 'Cabillaud et colin frais - 500g. Pêche du jour, DLC courte.', 'poissonnerie', 16.00, 6.50, 7, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '3 hours', true, true, 'available'),
('35363d38-f196-48a2-b1e8-9b1c76dc7c19', 'Fruits de mer frais', 'Moules, bulots et coquillages. Ultra frais, à cuisiner ce soir.', 'poissonnerie', 20.00, 8.00, 5, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '4 hours', true, true, 'available');

-- Catégorie: epicerie (3 produits)
INSERT INTO lots (merchant_id, title, description, category, original_price, discounted_price, quantity_total, pickup_start, pickup_end, requires_cold_chain, is_urgent, status)
VALUES
('35363d38-f196-48a2-b1e8-9b1c76dc7c19', 'Céréales et petit-déjeuner', 'Céréales bio, muesli et flocons d''avoine. DLUO dans 1 mois.', 'epicerie', 14.00, 5.50, 15, NOW() + INTERVAL '3 hours', NOW() + INTERVAL '8 hours', false, false, 'available'),
('35363d38-f196-48a2-b1e8-9b1c76dc7c19', 'Légumineuses et graines', 'Lentilles, pois chiches, quinoa et graines de chia. Emballages ouverts.', 'epicerie', 16.00, 6.50, 10, NOW() + INTERVAL '4 hours', NOW() + INTERVAL '9 hours', false, false, 'available'),
('35363d38-f196-48a2-b1e8-9b1c76dc7c19', 'Sauces et épices', 'Sauce tomate, pesto, curry et paprika. Fin de gamme, dates courtes.', 'epicerie', 20.00, 8.00, 12, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '7 hours', false, false, 'available');

-- Catégorie: produits_laitiers (3 produits)
INSERT INTO lots (merchant_id, title, description, category, original_price, discounted_price, quantity_total, pickup_start, pickup_end, requires_cold_chain, is_urgent, status)
VALUES
('35363d38-f196-48a2-b1e8-9b1c76dc7c19', 'Beurre et margarine', 'Beurre doux, beurre salé et margarine végétale. DLC courte.', 'produits_laitiers', 8.00, 3.50, 18, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '6 hours', true, false, 'available'),
('35363d38-f196-48a2-b1e8-9b1c76dc7c19', 'Fromages de chèvre', 'Crottins, bûches et tommes de chèvre fermier. DLC proche.', 'produits_laitiers', 14.00, 5.50, 8, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '4 hours', true, true, 'available'),
('35363d38-f196-48a2-b1e8-9b1c76dc7c19', 'Desserts lactés', 'Crèmes dessert, flans et riz au lait. À consommer rapidement.', 'produits_laitiers', 10.00, 4.00, 15, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '5 hours', true, true, 'available');

-- Catégorie: plats_prepares (2 produits)
INSERT INTO lots (merchant_id, title, description, category, original_price, discounted_price, quantity_total, pickup_start, pickup_end, requires_cold_chain, is_urgent, status)
VALUES
('35363d38-f196-48a2-b1e8-9b1c76dc7c19', 'Plats végétariens', 'Curry de légumes, tajine et couscous végétarien. Fait maison.', 'plats_prepares', 20.00, 8.00, 8, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '3 hours', true, true, 'available'),
('35363d38-f196-48a2-b1e8-9b1c76dc7c19', 'Pizzas et focaccias', 'Pizzas margherita, 4 fromages et focaccia. Cuites aujourd''hui.', 'plats_prepares', 18.00, 7.00, 10, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '5 hours', true, false, 'available');

-- Catégorie: autres (2 produits)
INSERT INTO lots (merchant_id, title, description, category, original_price, discounted_price, quantity_total, pickup_start, pickup_end, requires_cold_chain, is_urgent, status)
VALUES
('35363d38-f196-48a2-b1e8-9b1c76dc7c19', 'Smoothies et boissons', 'Smoothies fruits mixés et boissons végétales. Bouteilles 500ml.', 'autres', 15.00, 6.00, 12, NOW() + INTERVAL '1 hour', NOW() + INTERVAL '4 hours', true, true, 'available'),
('35363d38-f196-48a2-b1e8-9b1c76dc7c19', 'Glaces et sorbets', 'Glaces artisanales et sorbets plein fruit. Formats individuels.', 'autres', 12.00, 5.00, 15, NOW() + INTERVAL '2 hours', NOW() + INTERVAL '6 hours', true, false, 'available');

-- =====================================================
-- FIN DE LA MIGRATION
-- =====================================================

-- Commentaire de vérification
COMMENT ON TABLE lots IS 'Table des lots d''invendus - 40 produits fictifs ajoutés (20 par commerçant)';

