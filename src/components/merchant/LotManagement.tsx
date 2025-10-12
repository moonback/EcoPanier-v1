import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency, categories, uploadImage } from '../../utils/helpers';
import { analyzeFoodImage, isGeminiConfigured } from '../../utils/geminiService';
import { Plus, Edit, Trash2, Package, Sparkles, ImagePlus, FileText, DollarSign, Clock, Settings, Check, ChevronRight, ChevronLeft, Image as ImageIcon } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'];
type LotInsert = Database['public']['Tables']['lots']['Insert'];
type LotUpdate = Database['public']['Tables']['lots']['Update'];

export const LotManagement = () => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [analysisConfidence, setAnalysisConfidence] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const { profile } = useAuthStore();

  const totalSteps = editingLot ? 4 : 5; // 5 étapes pour création (avec IA), 4 pour édition

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: categories[0],
    original_price: 0,
    discounted_price: 0,
    quantity_total: 1,
    pickup_start: '',
    pickup_end: '',
    requires_cold_chain: false,
    is_urgent: false,
    image_urls: [] as string[],
  });

  const cleanupOldSoldOutLots = useCallback(async (lots: Lot[]) => {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    for (const lot of lots) {
      const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
      
      // Si le lot n'a plus de stock disponible
      if (availableQty <= 0) {
        const updatedAt = new Date(lot.updated_at);
        
        // Si cela fait plus de 24 heures qu'il a été mis à jour et qu'il n'a plus de stock
        if (updatedAt < oneDayAgo) {
          try {
            await supabase.from('lots').delete().eq('id', lot.id);
            console.log(`Lot ${lot.id} supprimé automatiquement (épuisé depuis > 24h)`);
          } catch (error) {
            console.error(`Erreur lors de la suppression du lot ${lot.id}:`, error);
          }
        }
      }
    }
  }, []);

  const fetchLots = useCallback(async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('lots')
        .select('*')
        .eq('merchant_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Supprimer automatiquement les lots épuisés depuis plus de 24 heures
      await cleanupOldSoldOutLots(data);
      
      // Récupérer à nouveau les lots après le nettoyage
      const { data: updatedData, error: refreshError } = await supabase
        .from('lots')
        .select('*')
        .eq('merchant_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (refreshError) throw refreshError;
      setLots(updatedData);
    } catch (error) {
      console.error('Error fetching lots:', error);
    } finally {
      setLoading(false);
    }
  }, [profile, cleanupOldSoldOutLots]);

  useEffect(() => {
    fetchLots();
  }, [fetchLots]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imagePromises = Array.from(files).map((file) => uploadImage(file));
    const imageUrls = await Promise.all(imagePromises);
    setFormData({ ...formData, image_urls: [...formData.image_urls, ...imageUrls] });
  };

  const handleAIImageAnalysis = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isGeminiConfigured()) {
      alert('⚠️ L\'analyse IA n\'est pas configurée. Ajoutez votre clé API Gemini dans le fichier .env (VITE_GEMINI_API_KEY)');
      return;
    }

    setAnalyzingImage(true);
    setAnalysisConfidence(null);

    try {
      // Analyser l'image avec Gemini
      const analysis = await analyzeFoodImage(file);

      // Uploader l'image pour l'afficher
      const imageUrl = await uploadImage(file);

      // Remplir le formulaire avec les données analysées
      setFormData({
        ...formData,
        title: analysis.title,
        description: analysis.description,
        category: analysis.category,
        original_price: analysis.original_price,
        discounted_price: analysis.discounted_price,
        quantity_total: analysis.quantity_total,
        requires_cold_chain: analysis.requires_cold_chain,
        is_urgent: analysis.is_urgent,
        image_urls: [imageUrl, ...formData.image_urls],
      });

      setAnalysisConfidence(analysis.confidence);

      // Message de succès
      const confidencePercent = Math.round(analysis.confidence * 100);
      alert(`✅ Image analysée avec succès !\n\nConfiance de l'analyse : ${confidencePercent}%\n\nVérifiez et ajustez les champs si nécessaire.`);
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
      alert(error instanceof Error ? error.message : 'Erreur lors de l\'analyse de l\'image');
    } finally {
      setAnalyzingImage(false);
    }

    // Réinitialiser l'input
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      if (editingLot) {
        const updateData: LotUpdate = {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          original_price: formData.original_price,
          discounted_price: formData.discounted_price,
          quantity_total: formData.quantity_total,
          pickup_start: formData.pickup_start,
          pickup_end: formData.pickup_end,
          requires_cold_chain: formData.requires_cold_chain,
          is_urgent: formData.is_urgent,
          image_urls: formData.image_urls,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('lots')
          // @ts-expect-error - Type mismatch due to Supabase type generation issue
          .update(updateData)
          .eq('id', editingLot.id);

        if (error) throw error;
      } else {
        const insertData: LotInsert = {
          merchant_id: profile.id,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          original_price: formData.original_price,
          discounted_price: formData.discounted_price,
          quantity_total: formData.quantity_total,
          pickup_start: formData.pickup_start,
          pickup_end: formData.pickup_end,
          requires_cold_chain: formData.requires_cold_chain,
          is_urgent: formData.is_urgent,
          image_urls: formData.image_urls,
        };

        // @ts-expect-error - Type mismatch due to Supabase type generation issue
        const { error } = await supabase.from('lots').insert(insertData);

        if (error) throw error;
      }

      setShowModal(false);
      setEditingLot(null);
      resetForm();
      fetchLots();
    } catch (error) {
      console.error('Error saving lot:', error);
      alert('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce lot ?')) return;

    try {
      const { error } = await supabase.from('lots').delete().eq('id', id);

      if (error) throw error;
      fetchLots();
    } catch (error) {
      console.error('Error deleting lot:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: categories[0],
      original_price: 0,
      discounted_price: 0,
      quantity_total: 1,
      pickup_start: '',
      pickup_end: '',
      requires_cold_chain: false,
      is_urgent: false,
      image_urls: [],
    });
    setAnalysisConfidence(null);
    setCurrentStep(1);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedToNextStep = () => {
    if (editingLot) {
      // Mode édition
      switch (currentStep) {
        case 1: // Informations de base
          return formData.title && formData.description && formData.category;
        case 2: // Prix et quantité
          return formData.original_price > 0 && formData.discounted_price >= 0 && formData.quantity_total > 0;
        case 3: // Horaires
          return formData.pickup_start && formData.pickup_end;
        case 4: // Options et images
          return true;
        default:
          return false;
      }
    } else {
      // Mode création
      switch (currentStep) {
        case 1: // Analyse IA
          return true; // Optionnel
        case 2: // Informations de base
          return formData.title && formData.description && formData.category;
        case 3: // Prix et quantité
          return formData.original_price > 0 && formData.discounted_price >= 0 && formData.quantity_total > 0;
        case 4: // Horaires
          return formData.pickup_start && formData.pickup_end;
        case 5: // Options et images
          return true;
        default:
          return false;
      }
    }
  };

  const generateFictionalLots = async () => {
    if (!profile) return;
    if (!confirm('Voulez-vous créer 25 produits fictifs ? Cette action ajoutera des données de test.')) return;

    const fictionalProducts = [
      { title: 'Panier de tomates bio', desc: 'Tomates de saison cultivées localement', cat: 'Fruits & Légumes', original: 12, discount: 5, qty: 8, cold: false, urgent: false },
      { title: 'Pain de campagne du jour', desc: 'Pain frais cuit ce matin, à consommer rapidement', cat: 'Boulangerie', original: 4.5, discount: 2, qty: 15, cold: false, urgent: true },
      { title: 'Assortiment de viennoiseries', desc: 'Croissants et pains au chocolat de la veille', cat: 'Boulangerie', original: 8, discount: 3, qty: 10, cold: false, urgent: false },
      { title: 'Saumon frais', desc: 'Filets de saumon à consommer aujourd\'hui', cat: 'Viandes & Poissons', original: 18, discount: 10, qty: 5, cold: true, urgent: true },
      { title: 'Poulet rôti entier', desc: 'Poulet fermier rôti, prêt à déguster', cat: 'Viandes & Poissons', original: 9, discount: 5, qty: 6, cold: true, urgent: false },
      { title: 'Fromages variés', desc: 'Sélection de fromages français', cat: 'Produits Laitiers', original: 15, discount: 8, qty: 12, cold: true, urgent: false },
      { title: 'Yaourts fruits mixtes', desc: 'Lot de 8 yaourts aux fruits, DLC courte', cat: 'Produits Laitiers', original: 6, discount: 0, qty: 20, cold: true, urgent: false },
      { title: 'Pâtes artisanales', desc: 'Pâtes fraîches faites maison', cat: 'Épicerie', original: 7, discount: 4, qty: 10, cold: false, urgent: false },
      { title: 'Conserves de légumes', desc: 'Assortiment de conserves bio', cat: 'Épicerie', original: 10, discount: 5, qty: 15, cold: false, urgent: false },
      { title: 'Plat du jour - Lasagnes', desc: 'Lasagnes bolognaise maison portion familiale', cat: 'Plats Préparés', original: 12, discount: 6, qty: 8, cold: true, urgent: true },
      { title: 'Salades composées', desc: 'Salades fraîches préparées ce matin', cat: 'Plats Préparés', original: 8, discount: 0, qty: 10, cold: true, urgent: false },
      { title: 'Pizza margherita', desc: 'Pizza fraîche à cuire, pâte faite maison', cat: 'Plats Préparés', original: 9, discount: 4, qty: 12, cold: true, urgent: false },
      { title: 'Légumes surgelés', desc: 'Mix de légumes surgelés, emballage abîmé', cat: 'Surgelés', original: 5, discount: 2, qty: 20, cold: true, urgent: false },
      { title: 'Glaces artisanales', desc: 'Assortiment de glaces maison', cat: 'Surgelés', original: 12, discount: 6, qty: 8, cold: true, urgent: false },
      { title: 'Fruits de mer surgelés', desc: 'Mix fruits de mer pour paella', cat: 'Surgelés', original: 15, discount: 8, qty: 10, cold: true, urgent: false },
      { title: 'Bananes mûres', desc: 'Bananes bien mûres, parfaites pour smoothies', cat: 'Fruits & Légumes', original: 3, discount: 1, qty: 25, cold: false, urgent: true },
      { title: 'Salade verte bio', desc: 'Salade fraîche du jour', cat: 'Fruits & Légumes', original: 2.5, discount: 1, qty: 15, cold: false, urgent: true },
      { title: 'Baguettes tradition', desc: 'Baguettes fraîches de fin de journée', cat: 'Boulangerie', original: 1.2, discount: 0, qty: 30, cold: false, urgent: true },
      { title: 'Gâteaux maison', desc: 'Assortiment de pâtisseries maison', cat: 'Boulangerie', original: 15, discount: 7, qty: 5, cold: false, urgent: false },
      { title: 'Steaks hachés', desc: 'Steaks hachés pur bœuf, DLC proche', cat: 'Viandes & Poissons', original: 8, discount: 4, qty: 12, cold: true, urgent: true },
      { title: 'Lait frais fermier', desc: 'Bouteilles de lait frais local', cat: 'Produits Laitiers', original: 2.8, discount: 1.5, qty: 20, cold: true, urgent: false },
      { title: 'Œufs bio plein air', desc: 'Boîte de 12 œufs bio', cat: 'Produits Laitiers', original: 4.5, discount: 0, qty: 15, cold: false, urgent: false },
      { title: 'Miel local', desc: 'Pot de miel artisanal 500g', cat: 'Épicerie', original: 12, discount: 6, qty: 8, cold: false, urgent: false },
      { title: 'Quiche lorraine', desc: 'Quiche maison, portion individuelle', cat: 'Plats Préparés', original: 5, discount: 2.5, qty: 18, cold: true, urgent: false },
      { title: 'Fruits secs assortis', desc: 'Mix de fruits secs et noix', cat: 'Autres', original: 8, discount: 4, qty: 10, cold: false, urgent: false },
    ];

    try {
      const now = new Date();
      const pickupStart = new Date(now.getTime() + 2 * 60 * 60 * 1000); // Dans 2 heures
      const pickupEnd = new Date(now.getTime() + 8 * 60 * 60 * 1000); // Dans 8 heures

      const lotsToInsert: LotInsert[] = fictionalProducts.map(product => ({
        merchant_id: profile.id,
        title: product.title,
        description: product.desc,
        category: product.cat,
        original_price: product.original,
        discounted_price: product.discount,
        quantity_total: product.qty,
        quantity_reserved: 0,
        quantity_sold: 0,
        pickup_start: pickupStart.toISOString(),
        pickup_end: pickupEnd.toISOString(),
        requires_cold_chain: product.cold,
        is_urgent: product.urgent,
        status: 'available' as const,
        image_urls: [],
      }));

      // @ts-expect-error - Type mismatch due to Supabase type generation issue
      const { error } = await supabase.from('lots').insert(lotsToInsert);

      if (error) throw error;

      alert('✅ 25 produits fictifs créés avec succès !');
      fetchLots();
    } catch (error) {
      console.error('Error creating fictional lots:', error);
      alert('❌ Erreur lors de la création des produits fictifs');
    }
  };

  const openEditModal = (lot: Lot) => {
    setEditingLot(lot);
    setFormData({
      title: lot.title,
      description: lot.description,
      category: lot.category,
      original_price: lot.original_price,
      discounted_price: lot.discounted_price,
      quantity_total: lot.quantity_total,
      pickup_start: lot.pickup_start.slice(0, 16),
      pickup_end: lot.pickup_end.slice(0, 16),
      requires_cold_chain: lot.requires_cold_chain,
      is_urgent: lot.is_urgent,
      image_urls: lot.image_urls,
    });
    setCurrentStep(1);
    setShowModal(true);
  };

  const getStepInfo = () => {
    if (editingLot) {
      // Mode édition (4 étapes)
      const steps = [
        { number: 1, title: 'Informations', icon: FileText },
        { number: 2, title: 'Prix & Quantité', icon: DollarSign },
        { number: 3, title: 'Horaires', icon: Clock },
        { number: 4, title: 'Options & Images', icon: Settings },
      ];
      return steps;
    } else {
      // Mode création (5 étapes)
      const steps = [
        { number: 1, title: 'Analyse IA', icon: Sparkles },
        { number: 2, title: 'Informations', icon: FileText },
        { number: 3, title: 'Prix & Quantité', icon: DollarSign },
        { number: 4, title: 'Horaires', icon: Clock },
        { number: 5, title: 'Options & Images', icon: Settings },
      ];
      return steps;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header avec boutons d'action */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Gestion des Lots</h2>
        <div className="flex gap-2">
          <button
            onClick={generateFictionalLots}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm sm:text-base"
            title="Créer 25 produits de test"
          >
            <Package size={16} className="sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Générer produits test</span>
            <span className="sm:hidden">Test</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setEditingLot(null);
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm sm:text-base font-medium"
          >
            <Plus size={16} className="sm:w-5 sm:h-5" />
            <span>Nouveau Lot</span>
          </button>
        </div>
      </div>

      {/* Grille de lots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {lots.map((lot) => {
          const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
          const isOutOfStock = availableQty <= 0;

          return (
            <div 
              key={lot.id} 
              className={`bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-lg ${
                isOutOfStock ? 'opacity-50 grayscale' : ''
              }`}
            >
              <div className="relative h-40 sm:h-48 bg-gradient-to-br from-green-100 to-blue-100">
                {lot.image_urls.length > 0 ? (
                  <img
                    src={lot.image_urls[0]}
                    alt={lot.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package size={48} className="sm:w-16 sm:h-16 text-gray-400" />
                  </div>
                )}
                <div className={`absolute top-2 right-2 px-2 sm:px-3 py-1 rounded-full text-white font-semibold text-xs sm:text-sm ${
                  isOutOfStock ? 'bg-red-500' :
                  lot.status === 'available' ? 'bg-green-500' :
                  lot.status === 'sold_out' ? 'bg-red-500' :
                  lot.status === 'expired' ? 'bg-gray-500' : 'bg-yellow-500'
                }`}>
                  {isOutOfStock ? 'Épuisé' :
                   lot.status === 'available' ? 'Disponible' :
                   lot.status === 'sold_out' ? 'Épuisé' :
                   lot.status === 'expired' ? 'Expiré' : 'Réservé'}
                </div>
              </div>

              <div className="p-3 sm:p-4">
                {isOutOfStock && (
                  <div className="mb-2 sm:mb-3 p-2 bg-orange-100 border border-orange-300 rounded-lg">
                    <p className="text-xs text-orange-800 font-medium">
                      ⚠️ Ce produit sera automatiquement supprimé 24h après épuisement
                    </p>
                  </div>
                )}
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2 line-clamp-1">{lot.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">{lot.description}</p>

                <div className="space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-semibold">{lot.quantity_total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Réservé:</span>
                    <span className="font-semibold">{lot.quantity_reserved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Vendu:</span>
                    <span className="font-semibold">{lot.quantity_sold}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Disponible:</span>
                    <span className="font-semibold text-green-600">{availableQty}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3 sm:mb-4 pt-3 sm:pt-4 border-t">
                  <div>
                    <span className="text-lg sm:text-xl font-bold text-green-600">
                      {formatCurrency(lot.discounted_price)}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 line-through ml-1.5 sm:ml-2">
                      {formatCurrency(lot.original_price)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(lot)}
                    className="flex-1 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition flex items-center justify-center gap-1.5 sm:gap-2 text-sm sm:text-base font-medium"
                  >
                    <Edit size={14} className="sm:w-4 sm:h-4" />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => handleDelete(lot.id)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                    aria-label="Supprimer le lot"
                  >
                    <Trash2 size={14} className="sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl max-w-4xl w-full my-4 sm:my-8 shadow-2xl">
            {/* Header avec fermeture */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex-1 min-w-0 pr-2">
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
                  {editingLot ? 'Modifier le lot' : 'Créer un nouveau lot'}
            </h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-0.5 sm:mt-1">
                  Étape {currentStep} sur {totalSteps}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingLot(null);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
                aria-label="Fermer"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Barre de progression avec étapes */}
            <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 border-b border-gray-200 overflow-x-auto">
              <div className="flex items-center justify-between">
                {getStepInfo().map((step, index) => {
                  const StepIcon = step.icon;
                  const isActive = currentStep === step.number;
                  const isCompleted = currentStep > step.number;
                  
                  return (
                    <div key={step.number} className="flex items-center flex-1 min-w-0">
                      <div className="flex flex-col items-center flex-1 min-w-0">
                        <div className={`
                          w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 flex-shrink-0
                          ${isCompleted ? 'bg-green-500 text-white' : 
                            isActive ? 'bg-blue-600 text-white ring-2 sm:ring-4 ring-blue-100' : 
                            'bg-gray-200 text-gray-500'}
                        `}>
                          {isCompleted ? <Check size={16} className="sm:w-5 sm:h-5" /> : <StepIcon size={16} className="sm:w-5 sm:h-5" />}
                        </div>
                        <span className={`text-[10px] sm:text-xs mt-1 sm:mt-2 font-medium text-center truncate w-full px-1 ${
                          isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                        }`}>
                          {step.title}
                        </span>
                      </div>
                      {index < getStepInfo().length - 1 && (
                        <div className={`h-0.5 sm:h-1 flex-1 mx-1 sm:mx-2 rounded transition-all duration-300 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contenu du formulaire selon l'étape */}
            <div className="p-4 sm:p-6 min-h-[300px] sm:min-h-[400px]">
              <form onSubmit={handleSubmit}>
                {/* Étape 1 : Analyse IA (uniquement en création) */}
                {!editingLot && currentStep === 1 && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="text-center mb-8">
                      <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mb-4">
                        <Sparkles size={40} className="text-white" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-800 mb-2">
                        🤖 Analyse Intelligente par IA
                      </h4>
                      <p className="text-gray-600 max-w-md mx-auto">
                        Gagnez du temps ! Uploadez une photo de votre produit et l'IA remplira automatiquement tous les champs.
                      </p>
                    </div>

                    <div className="max-w-xl mx-auto">
                      <div className="p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 border-2 border-purple-200 rounded-2xl">
                        <label className="block cursor-pointer">
                          <div className={`
                            relative p-8 border-3 border-dashed rounded-xl text-center transition-all duration-300
                            ${analyzingImage ? 'border-blue-400 bg-blue-50' : 'border-purple-300 bg-white hover:bg-purple-50 hover:border-purple-400'}
                          `}>
                            {analyzingImage ? (
                              <div className="space-y-4">
                                <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
                                <p className="text-purple-600 font-semibold">Analyse en cours...</p>
                                <p className="text-sm text-gray-600">L'IA analyse votre image</p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                <ImagePlus size={48} className="mx-auto text-purple-500" />
              <div>
                                  <p className="text-lg font-semibold text-gray-800">
                                    Cliquez pour sélectionner une image
                                  </p>
                                  <p className="text-sm text-gray-500 mt-1">
                                    ou glissez-déposez ici
                                  </p>
                                </div>
                                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium">
                                  <Sparkles size={20} />
                                  <span>Analyser avec l'IA</span>
                                </div>
                              </div>
                            )}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAIImageAnalysis}
                              disabled={analyzingImage}
                              className="hidden"
                            />
                          </div>
                        </label>

                        {!isGeminiConfigured() && (
                          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <p className="text-sm text-orange-700 flex items-center gap-2">
                              <span className="text-lg">⚠️</span>
                              Configuration requise : ajoutez VITE_GEMINI_API_KEY dans votre fichier .env
                            </p>
                          </div>
                        )}

                        {analysisConfidence !== null && (
                          <div className="mt-4 p-4 bg-white border-2 border-green-200 rounded-lg animate-fade-in">
                            <div className="flex items-center gap-3">
                              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <Check size={24} className="text-green-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-green-800">Analyse terminée !</p>
                                <p className="text-sm text-gray-600">
                                  Confiance : <span className="font-bold text-green-600">{Math.round(analysisConfidence * 100)}%</span>
                                  {analysisConfidence < 0.7 && ' - Vérifiez les informations aux étapes suivantes'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="mt-6 text-center">
                        <button
                          type="button"
                          onClick={nextStep}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 mx-auto"
                        >
                          <span>Passer cette étape</span>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Étape 2 (création) ou Étape 1 (édition) : Informations de base */}
                {((editingLot && currentStep === 1) || (!editingLot && currentStep === 2)) && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="text-center mb-6">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">Informations du produit</h4>
                      <p className="text-gray-600">Décrivez votre produit en quelques mots</p>
                    </div>

              <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <span className="text-red-500">*</span> Titre du produit
                      </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="Ex: Baguettes tradition fraîches"
                  required
                />
              </div>

              <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <span className="text-red-500">*</span> Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition h-32"
                        placeholder="Décrivez le produit, son état, sa composition..."
                  required
                />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.description.length} caractères
                      </p>
              </div>

                <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <span className="text-red-500">*</span> Catégorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                  </div>
                )}

                {/* Étape 3 (création) ou Étape 2 (édition) : Prix et Quantité */}
                {((editingLot && currentStep === 2) || (!editingLot && currentStep === 3)) && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="text-center mb-6">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">Prix et Quantité</h4>
                      <p className="text-gray-600">Définissez vos tarifs anti-gaspi</p>
              </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <span className="text-red-500">*</span> Prix original (€)
                  </label>
                        <div className="relative">
                          <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) =>
                              setFormData({ ...formData, original_price: parseFloat(e.target.value) || 0 })
                    }
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            placeholder="0.00"
                    required
                  />
                </div>
                        <p className="text-xs text-gray-500 mt-1">Prix de vente habituel</p>
              </div>

                <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <span className="text-red-500">*</span> Prix réduit (€)
                  </label>
                        <div className="relative">
                          <DollarSign size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-500" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discounted_price}
                    onChange={(e) =>
                              setFormData({ ...formData, discounted_price: parseFloat(e.target.value) || 0 })
                    }
                            className="w-full pl-10 pr-4 py-3 border-2 border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                            placeholder="0.00"
                    required
                  />
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          {formData.original_price > 0 && formData.discounted_price > 0
                            ? `Réduction de ${Math.round((1 - formData.discounted_price / formData.original_price) * 100)}%`
                            : 'Prix anti-gaspillage'}
                        </p>
                </div>
                </div>

                <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        <span className="text-red-500">*</span> Quantité disponible
                  </label>
                  <input
                    type="number"
                        min="1"
                        value={formData.quantity_total}
                    onChange={(e) =>
                          setFormData({ ...formData, quantity_total: parseInt(e.target.value) || 1 })
                    }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                        placeholder="1"
                    required
                  />
                      <p className="text-xs text-gray-500 mt-1">Nombre d'unités à vendre</p>
                </div>

                    {formData.original_price > 0 && formData.discounted_price > 0 && formData.quantity_total > 0 && (
                      <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                        <h5 className="font-semibold text-blue-900 mb-2">📊 Résumé</h5>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Chiffre d'affaires potentiel</p>
                            <p className="text-lg font-bold text-blue-600">
                              {formatCurrency(formData.discounted_price * formData.quantity_total)}
                            </p>
              </div>
                          <div>
                            <p className="text-gray-600">Économie client</p>
                            <p className="text-lg font-bold text-green-600">
                              {formatCurrency((formData.original_price - formData.discounted_price) * formData.quantity_total)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Étape 4 (création) ou Étape 3 (édition) : Horaires de retrait */}
                {((editingLot && currentStep === 3) || (!editingLot && currentStep === 4)) && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="text-center mb-6">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">Horaires de retrait</h4>
                      <p className="text-gray-600">Quand vos clients pourront-ils récupérer le produit ?</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <span className="text-red-500">*</span> Début du retrait
                  </label>
                        <div className="relative">
                          <Clock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="datetime-local"
                    value={formData.pickup_start}
                    onChange={(e) => setFormData({ ...formData, pickup_start: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">À partir de quand</p>
                </div>

                <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          <span className="text-red-500">*</span> Fin du retrait
                  </label>
                        <div className="relative">
                          <Clock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="datetime-local"
                    value={formData.pickup_end}
                    onChange={(e) => setFormData({ ...formData, pickup_end: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                </div>
                        <p className="text-xs text-gray-500 mt-1">Jusqu'à quand</p>
                </div>
              </div>

                    {formData.pickup_start && formData.pickup_end && (
                      <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700">
                          <Check size={20} />
                          <span className="font-semibold">Créneau de retrait défini</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Étape 5 (création) ou Étape 4 (édition) : Options et Images */}
                {((editingLot && currentStep === 4) || (!editingLot && currentStep === 5)) && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="text-center mb-6">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">Options et Images</h4>
                      <p className="text-gray-600">Derniers détails pour votre annonce</p>
              </div>

                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Settings size={20} />
                        Options du produit
                      </h5>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className={`
                          flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition
                          ${formData.requires_cold_chain ? 'bg-blue-50 border-blue-400' : 'bg-white border-gray-300 hover:border-blue-300'}
                        `}>
                  <input
                    type="checkbox"
                    checked={formData.requires_cold_chain}
                    onChange={(e) =>
                      setFormData({ ...formData, requires_cold_chain: e.target.checked })
                    }
                            className="w-5 h-5 text-blue-600"
                  />
                          <div>
                            <p className="font-medium text-gray-800">🧊 Chaîne du froid requise</p>
                            <p className="text-xs text-gray-600">Produit réfrigéré ou surgelé</p>
                          </div>
                </label>

                        <label className={`
                          flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition
                          ${formData.is_urgent ? 'bg-red-50 border-red-400' : 'bg-white border-gray-300 hover:border-red-300'}
                        `}>
                  <input
                    type="checkbox"
                    checked={formData.is_urgent}
                    onChange={(e) => setFormData({ ...formData, is_urgent: e.target.checked })}
                            className="w-5 h-5 text-red-600"
                  />
                          <div>
                            <p className="font-medium text-gray-800">⚡ Produit urgent</p>
                            <p className="text-xs text-gray-600">DLC proche ou très périssable</p>
                          </div>
                </label>
                      </div>
              </div>

              <div>
                      <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                        <ImageIcon size={20} />
                        Photos du produit (optionnel)
                      </h5>
                      
                      <label className="block cursor-pointer">
                        <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-center">
                          <ImageIcon size={32} className="mx-auto text-gray-400 mb-2" />
                          <p className="text-sm font-medium text-gray-700">Cliquez pour ajouter des photos</p>
                          <p className="text-xs text-gray-500 mt-1">Plusieurs images acceptées</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                            className="hidden"
                />
                        </div>
                      </label>

                {formData.image_urls.length > 0 && (
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {formData.image_urls.map((url, i) => (
                            <div key={i} className="relative group">
                      <img
                        src={url}
                                alt={`Preview ${i + 1}`}
                                className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newUrls = formData.image_urls.filter((_, index) => index !== i);
                                  setFormData({ ...formData, image_urls: newUrls });
                                }}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </div>
                    ))}
                  </div>
                )}
              </div>

                    <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-green-800">
                          <p className="font-semibold mb-1">Votre lot est prêt !</p>
                          <p>Cliquez sur "Créer le lot" pour le publier sur la plateforme.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Footer avec navigation */}
            <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
              <div className="order-2 sm:order-1">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    <ChevronLeft size={16} className="sm:w-5 sm:h-5" />
                    <span>Précédent</span>
                  </button>
                )}
              </div>

              <div className="order-1 sm:order-2 flex gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingLot(null);
                    resetForm();
                  }}
                  className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Annuler
                </button>

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceedToNextStep()}
                    className={`
                      flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-medium transition
                      ${canProceedToNextStep()
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                    `}
                  >
                    <span>Suivant</span>
                    <ChevronRight size={16} className="sm:w-5 sm:h-5" />
                  </button>
                ) : (
                <button
                  type="submit"
                    onClick={handleSubmit}
                    disabled={!canProceedToNextStep()}
                    className={`
                      flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition
                      ${canProceedToNextStep()
                        ? 'bg-gradient-to-r from-green-600 to-blue-600 text-white hover:from-green-700 hover:to-blue-700 shadow-lg'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'}
                    `}
                  >
                    <Check size={16} className="sm:w-5 sm:h-5" />
                    <span className="truncate">{editingLot ? 'Mettre à jour' : 'Créer le lot'}</span>
                </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
