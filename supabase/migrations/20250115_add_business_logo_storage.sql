-- Migration pour ajouter le stockage des logos d'enseignes
-- Créé le: 2025-01-15

-- 1. Créer le bucket pour les logos d'enseignes
INSERT INTO storage.buckets (id, name, public)
VALUES ('business-logos', 'business-logos', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Politique de stockage : Permettre aux commerçants de uploader leur logo
CREATE POLICY "Merchants can upload their business logo"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'business-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'merchant'
  )
);

-- 3. Politique de stockage : Permettre aux commerçants de mettre à jour leur logo
CREATE POLICY "Merchants can update their business logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'business-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'merchant'
  )
);

-- 4. Politique de stockage : Permettre aux commerçants de supprimer leur logo
CREATE POLICY "Merchants can delete their business logo"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'business-logos' AND
  (storage.foldername(name))[1] = auth.uid()::text AND
  auth.uid() IN (
    SELECT id FROM profiles WHERE role = 'merchant'
  )
);

-- 5. Politique de lecture : Tout le monde peut voir les logos (public)
CREATE POLICY "Anyone can view business logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'business-logos');

-- 6. Ajouter la colonne business_logo_url dans la table profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS business_logo_url TEXT;

-- 7. Commenter la colonne
COMMENT ON COLUMN profiles.business_logo_url IS 'URL du logo de l''enseigne du commerçant (stocké dans storage.business-logos)';

-- 8. Index pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_profiles_business_logo_url
ON profiles(business_logo_url)
WHERE business_logo_url IS NOT NULL;

