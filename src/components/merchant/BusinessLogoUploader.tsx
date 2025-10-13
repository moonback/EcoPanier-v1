import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader, CheckCircle, AlertCircle, Store } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BusinessLogoUploaderProps {
  currentLogoUrl?: string | null;
  userId: string;
  onLogoUpdated: (logoUrl: string | null) => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

/**
 * Composant pour uploader et gérer le logo de l'enseigne du commerçant
 * Stocke les logos dans Supabase Storage (bucket: business-logos)
 */
export function BusinessLogoUploader({ currentLogoUrl, userId, onLogoUpdated }: BusinessLogoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentLogoUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handler pour la sélection de fichier
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset états
    setError(null);
    setSuccess(false);

    // Validation du type de fichier
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError('Format non supporté. Utilisez JPG, PNG ou WebP.');
      return;
    }

    // Validation de la taille
    if (file.size > MAX_FILE_SIZE) {
      setError('Fichier trop volumineux. Maximum 2MB.');
      return;
    }

    // Aperçu local
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload vers Supabase
    await uploadLogo(file);
  };

  // Upload du logo vers Supabase Storage
  const uploadLogo = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      // Supprimer l'ancien logo s'il existe
      if (currentLogoUrl) {
        const oldPath = extractPathFromUrl(currentLogoUrl);
        if (oldPath) {
          await supabase.storage.from('business-logos').remove([oldPath]);
        }
      }

      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/logo-${Date.now()}.${fileExt}`;

      // Upload du fichier
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('business-logos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('business-logos')
        .getPublicUrl(uploadData.path);

      // Mettre à jour le profil avec la nouvelle URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ business_logo_url: publicUrl })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Succès
      setSuccess(true);
      onLogoUpdated(publicUrl);

      // Reset le succès après 3 secondes
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Erreur upload logo:', err);
      setError('Impossible d\'uploader le logo. Réessayez.');
      setPreviewUrl(currentLogoUrl || null); // Restaurer l'ancien aperçu
    } finally {
      setUploading(false);
    }
  };

  // Supprimer le logo
  const handleRemoveLogo = async () => {
    if (!currentLogoUrl) return;

    setUploading(true);
    setError(null);

    try {
      // Supprimer du storage
      const path = extractPathFromUrl(currentLogoUrl);
      if (path) {
        await supabase.storage.from('business-logos').remove([path]);
      }

      // Mettre à jour le profil
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ business_logo_url: null })
        .eq('id', userId);

      if (updateError) throw updateError;

      // Reset l'état
      setPreviewUrl(null);
      onLogoUpdated(null);
      setSuccess(true);

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Erreur suppression logo:', err);
      setError('Impossible de supprimer le logo. Réessayez.');
    } finally {
      setUploading(false);
    }
  };

  // Extraire le chemin du fichier depuis l'URL publique
  const extractPathFromUrl = (url: string): string | null => {
    try {
      const parts = url.split('/business-logos/');
      return parts[1] || null;
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-black flex items-center gap-2">
          <Store className="w-5 h-5" strokeWidth={1.5} />
          Logo de l'enseigne
        </h3>
        <p className="text-sm text-gray-600 mt-1 font-light">
          Ajoutez le logo de votre commerce (max 2MB)
        </p>
      </div>

      {/* Zone d'upload */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
        {/* Aperçu du logo */}
        <div className="flex items-center justify-center">
          {previewUrl ? (
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                <img
                  src={previewUrl}
                  alt="Logo de l'enseigne"
                  className="w-full h-full object-cover"
                />
              </div>
              {!uploading && (
                <button
                  onClick={handleRemoveLogo}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-black hover:bg-gray-800 text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                  title="Supprimer le logo"
                  type="button"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              )}
            </div>
          ) : (
            <div className="w-32 h-32 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" strokeWidth={1} />
            </div>
          )}
        </div>

        {/* Bouton d'upload */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
              uploading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-black text-white hover:bg-gray-900'
            }`}
            type="button"
          >
            {uploading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" strokeWidth={1.5} />
                <span>Upload en cours...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" strokeWidth={1.5} />
                <span>{previewUrl ? 'Changer le logo' : 'Uploader un logo'}</span>
              </>
            )}
          </button>
        </div>

        {/* Messages de feedback */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
            <span className="font-light">{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
            <CheckCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.5} />
            <span className="font-light">Logo mis à jour avec succès !</span>
          </div>
        )}

        {/* Informations */}
        <div className="text-xs text-gray-600 font-light space-y-1">
          <p>• Formats : JPG, PNG, WebP</p>
          <p>• Max 2 MB</p>
          <p>• Recommandé : Image carrée</p>
        </div>
      </div>
    </div>
  );
}

