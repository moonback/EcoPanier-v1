export const generatePIN = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

export const formatDate = (date: string): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: string): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Upload une image vers Supabase Storage (bucket lot-images)
 * @param file - Fichier image à uploader
 * @returns URL publique de l'image uploadée
 * @throws Error si l'upload échoue
 */
export const uploadImage = async (file: File): Promise<string> => {
  // Import dynamique pour éviter les imports circulaires
  const { supabase } = await import('../lib/supabase');

  try {
    // Générer un nom de fichier unique avec timestamp et caractères aléatoires
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
    const filePath = `${fileName}`;

    // Upload vers Supabase Storage
    const { data, error } = await supabase.storage
      .from('lot-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false, // Ne pas écraser si le fichier existe déjà
      });

    if (error) {
      console.error('Erreur lors de l\'upload de l\'image:', error);
      throw new Error(`Impossible d'uploader l'image: ${error.message}`);
    }

    // Récupérer l'URL publique de l'image
    const { data: publicUrlData } = supabase.storage
      .from('lot-images')
      .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Erreur lors de l\'upload de l\'image:', error);
    
    // En cas d'erreur, retourner une data URL comme fallback (mode dégradé)
    // Cela permet de continuer à fonctionner même si Supabase Storage n'est pas configuré
    console.warn('⚠️ Fallback: Utilisation de data URL au lieu de Supabase Storage');
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }
};

/**
 * Supprime une ou plusieurs images de Supabase Storage
 * @param imageUrls - URL(s) des images à supprimer
 * @returns Promise<void>
 */
export const deleteImages = async (imageUrls: string[]): Promise<void> => {
  const { supabase } = await import('../lib/supabase');

  try {
    // Extraire les chemins des fichiers depuis les URLs
    const filePaths = imageUrls
      .filter(url => url.includes('/lot-images/')) // Uniquement les images Supabase
      .map(url => {
        // Extraire le nom du fichier depuis l'URL
        // Format: https://xxx.supabase.co/storage/v1/object/public/lot-images/filename.jpg
        const parts = url.split('/lot-images/');
        return parts.length > 1 ? parts[1] : null;
      })
      .filter((path): path is string => path !== null);

    if (filePaths.length === 0) {
      return; // Aucune image Supabase à supprimer
    }

    // Supprimer les fichiers du bucket
    const { error } = await supabase.storage
      .from('lot-images')
      .remove(filePaths);

    if (error) {
      console.error('Erreur lors de la suppression des images:', error);
      // Ne pas throw l'erreur pour ne pas bloquer la suppression du lot
    }
  } catch (error) {
    console.error('Erreur lors de la suppression des images:', error);
    // Mode dégradé : continuer sans supprimer les images
  }
};

export const categories = [
  'fruits_legumes',
  'boulangerie',
  'boucherie',
  'poissonnerie',
  'produits_laitiers',
  'epicerie',
  'plats_prepares',
  'boissons',
  'desserts',
  'traiteur',
  'viennoiseries',
  'charcuterie',
  'fromages',
  'bio',
  'surgeles',
  'conserves',
  'autres',
];

/**
 * Mappe les catégories de la base de données vers des noms affichables
 */
export const categoryLabels: Record<string, string> = {
  'fruits_legumes': '🍎 Fruits & Légumes',
  'boulangerie': '🥖 Boulangerie',
  'boucherie': '🥩 Boucherie',
  'poissonnerie': '🐟 Poissonnerie',
  'produits_laitiers': '🥛 Produits Laitiers',
  'epicerie': '🛒 Épicerie',
  'plats_prepares': '🍽️ Plats Préparés',
  'boissons': '🥤 Boissons',
  'desserts': '🍰 Desserts',
  'traiteur': '👨‍🍳 Traiteur',
  'viennoiseries': '🥐 Viennoiseries',
  'charcuterie': '🍖 Charcuterie',
  'fromages': '🧀 Fromages',
  'bio': '🌱 Bio',
  'surgeles': '❄️ Surgelés',
  'conserves': '🥫 Conserves',
  'autres': '📦 Autres',
};

/**
 * Convertit une catégorie de la base de données en nom affichable
 */
export const getCategoryLabel = (category: string): string => {
  return categoryLabels[category] || category;
};
