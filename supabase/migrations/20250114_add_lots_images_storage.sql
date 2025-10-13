-- ============================================
-- Migration: Add Supabase Storage Policies for lot images
-- Date: 2025-01-14
-- Description: Configure les policies RLS pour le bucket 'lot-images'
--              ⚠️ PRÉREQUIS: Le bucket 'lot-images' doit être créé AVANT via le Dashboard Supabase
-- ============================================

-- ⚠️ IMPORTANT: Avant d'exécuter cette migration, créez le bucket manuellement :
-- 
-- 1. Allez dans Dashboard Supabase → Storage → "Create a new bucket"
-- 2. Configurez le bucket avec ces paramètres :
--    - Name: lot-images
--    - Public bucket: ✅ (coché)
--    - File size limit: 5242880 (5 MB)
--    - Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp, image/gif
-- 3. Cliquez sur "Create bucket"
-- 4. Ensuite, exécutez cette migration pour ajouter les policies RLS
--
-- Note: La création du bucket via SQL n'est pas possible (nécessite permissions superuser)

-- 1. Policy : Permettre à TOUT LE MONDE de lire les images (lecture publique)
CREATE POLICY "Public read access for lot images"
ON storage.objects FOR SELECT
USING (bucket_id = 'lot-images');

-- 2. Policy : Seuls les commerçants peuvent uploader des images
CREATE POLICY "Merchants can upload lot images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'lot-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'merchant'
  )
);

-- 3. Policy : Seuls les commerçants peuvent mettre à jour leurs propres images
CREATE POLICY "Merchants can update their own lot images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'lot-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'merchant'
  )
);

-- 4. Policy : Seuls les commerçants peuvent supprimer leurs propres images
CREATE POLICY "Merchants can delete their own lot images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'lot-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'merchant'
  )
);

-- Note: Les images seront accessibles via:
-- https://<SUPABASE_URL>/storage/v1/object/public/lot-images/<filename>

