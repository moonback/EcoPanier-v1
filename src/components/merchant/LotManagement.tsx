import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency, categories, uploadImage, deleteImages } from '../../utils/helpers';
import { analyzeFoodImage, isGeminiConfigured } from '../../utils/geminiService';
import { Plus, Edit, Trash2, Package, Sparkles, ImagePlus, FileText, DollarSign, Clock, Settings, Check, ChevronRight, ChevronLeft, Image as ImageIcon, Calendar, Filter } from 'lucide-react';
import type { Database } from '../../lib/database.types';
import { format, addDays, startOfDay, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';

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
  const [displayFilter, setDisplayFilter] = useState<'all' | 'paid' | 'donations'>('all');
  const { profile } = useAuthStore();

  const totalSteps = editingLot ? 4 : 5; // 5 étapes pour création (avec IA), 4 pour édition

  // État pour la sélection du jour et des horaires
  const [selectedDateOption, setSelectedDateOption] = useState<'today' | 'tomorrow' | 'custom'>('today');
  const [customDate, setCustomDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('20:00');

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

  // Effet pour mettre à jour les dates de retrait selon la sélection
  useEffect(() => {
    let selectedDate: Date;

    if (selectedDateOption === 'today') {
      selectedDate = startOfDay(new Date());
    } else if (selectedDateOption === 'tomorrow') {
      selectedDate = startOfDay(addDays(new Date(), 1));
    } else if (selectedDateOption === 'custom' && customDate) {
      selectedDate = startOfDay(new Date(customDate));
    } else {
      return; // Pas de date sélectionnée
    }

    // Parser les heures
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    // Créer les dates complètes
    const pickupStartDate = setMinutes(setHours(selectedDate, startHour), startMinute);
    const pickupEndDate = setMinutes(setHours(selectedDate, endHour), endMinute);

    // Mettre à jour le formData avec les timestamps ISO
    setFormData(prev => ({
      ...prev,
      pickup_start: pickupStartDate.toISOString().slice(0, 16),
      pickup_end: pickupEndDate.toISOString().slice(0, 16),
    }));
  }, [selectedDateOption, customDate, startTime, endTime]);

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
            // Supprimer les images avant de supprimer le lot
            if (lot.image_urls && lot.image_urls.length > 0) {
              await deleteImages(lot.image_urls);
            }

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

      // Passer automatiquement à l'étape suivante
      setTimeout(() => {
        nextStep();
      }, 500); // Petit délai pour que l'utilisateur voie le résultat
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
      // 1. Récupérer le lot pour obtenir les URLs des images
      const { data: lot, error: fetchError } = await supabase
        .from('lots')
        .select('image_urls')
        .eq('id', id)
        .single() as { data: { image_urls: string[] } | null; error: unknown };

      if (fetchError) throw fetchError;

      // 2. Supprimer les images du bucket Storage
      if (lot?.image_urls && lot.image_urls.length > 0) {
        await deleteImages(lot.image_urls);
      }

      // 3. Supprimer le lot de la base de données
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
    setSelectedDateOption('today');
    setCustomDate('');
    setStartTime('18:00');
    setEndTime('20:00');
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

    // Extraire la date et les heures pour pré-remplir les champs
    const pickupDate = new Date(lot.pickup_start);
    const today = startOfDay(new Date());
    const tomorrow = startOfDay(addDays(new Date(), 1));
    const lotDate = startOfDay(pickupDate);

    if (lotDate.getTime() === today.getTime()) {
      setSelectedDateOption('today');
    } else if (lotDate.getTime() === tomorrow.getTime()) {
      setSelectedDateOption('tomorrow');
    } else {
      setSelectedDateOption('custom');
      setCustomDate(format(pickupDate, 'yyyy-MM-dd'));
    }

    setStartTime(format(new Date(lot.pickup_start), 'HH:mm'));
    setEndTime(format(new Date(lot.pickup_end), 'HH:mm'));

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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  // Filtrer les lots selon le filtre sélectionné
  const filteredLots = lots.filter((lot) => {
    if (displayFilter === 'paid') return lot.discounted_price > 0;
    if (displayFilter === 'donations') return lot.discounted_price === 0;
    return true; // 'all'
  });

  return (
    <div>
      {/* Header avec boutons d'action */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h2 className="text-3xl font-bold text-black flex items-center gap-3">
              <span>📦</span>
              <span>Mes Paniers Anti-Gaspi</span>
            </h2>
            <p className="text-sm text-gray-600 mt-1">Créez et gérez vos lots d'invendus en quelques clics</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setEditingLot(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white rounded-xl hover:from-secondary-700 hover:to-secondary-800 transition-all font-semibold shadow-md hover:shadow-lg"
          >
            <Plus size={18} strokeWidth={2} />
            <span>Créer un panier</span>
          </button>
        </div>

        {/* Boutons de filtre */}
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-4 shadow-md">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg shadow-sm">
              <Filter size={18} className="text-white" strokeWidth={2} />
            </div>
            <h3 className="text-sm font-bold text-gray-800">Filtrer par type</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setDisplayFilter('all')}
              className={`group relative overflow-hidden px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                displayFilter === 'all'
                  ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg scale-105'
                  : 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 text-gray-700 hover:border-primary-400 hover:scale-102 hover:shadow-md'
              }`}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <span className="text-base">📦</span>
                <span>Tous</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  displayFilter === 'all' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-primary-100 text-primary-700'
                }`}>
                  {lots.length}
                </span>
              </span>
            </button>
            <button
              onClick={() => setDisplayFilter('paid')}
              className={`group relative overflow-hidden px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                displayFilter === 'paid'
                  ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105'
                  : 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 text-green-700 hover:border-green-400 hover:scale-102 hover:shadow-md'
              }`}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <span className="text-base">💰</span>
                <span>Avec prix</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  displayFilter === 'paid' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-green-200 text-green-800'
                }`}>
                  {lots.filter(l => l.discounted_price > 0).length}
                </span>
              </span>
            </button>
            <button
              onClick={() => setDisplayFilter('donations')}
              className={`group relative overflow-hidden px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                displayFilter === 'donations'
                  ? 'bg-gradient-to-r from-accent-600 to-pink-600 text-white shadow-lg scale-105'
                  : 'bg-gradient-to-br from-accent-50 to-pink-50 border-2 border-accent-200 text-accent-700 hover:border-accent-400 hover:scale-102 hover:shadow-md'
              }`}
            >
              <span className="relative z-10 flex items-center gap-1.5">
                <span className="text-base">❤️</span>
                <span>Dons généreux</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  displayFilter === 'donations' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-accent-200 text-accent-800'
                }`}>
                  {lots.filter(l => l.discounted_price === 0).length}
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Grille de lots */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {filteredLots.map((lot) => {
          const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
          const isOutOfStock = availableQty <= 0;
          const discount = lot.original_price > 0 ? Math.round((1 - lot.discounted_price / lot.original_price) * 100) : 0;

          return (
            <div 
              key={lot.id} 
              className={`group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 ${
                isOutOfStock ? 'opacity-60' : ''
              }`}
            >
              {/* En-tête au-dessus de l'image */}
              <div className="relative">
                {/* Badges en haut */}
                <div className="absolute top-0 left-0 right-0 z-10 p-2 flex items-start justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5">
                    {/* Badge catégorie */}
                    <span className="px-2 py-0.5 bg-white/95 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-md shadow-sm">
                      {lot.category}
                    </span>
                    
                    {/* Badge urgent */}
                    {lot.is_urgent && (
                      <span className="px-2 py-0.5 bg-red-500/95 backdrop-blur-sm text-xs font-medium text-white rounded-md shadow-sm flex items-center gap-1">
                        <span className="animate-pulse">⚡</span>
                        Urgent
                      </span>
                    )}
                    
                    {/* Badge chaîne du froid */}
                    {lot.requires_cold_chain && (
                      <span className="px-2 py-0.5 bg-blue-500/95 backdrop-blur-sm text-xs font-medium text-white rounded-md shadow-sm">
                        🧊 Frais
                      </span>
                    )}
                  </div>

                  {/* Badge statut/réduction */}
                  <div className="flex flex-col items-end gap-1.5">
                    {discount > 0 && !isOutOfStock && (
                      <span className="px-2 py-0.5 bg-green-500/95 backdrop-blur-sm text-xs font-bold text-white rounded-md shadow-sm">
                        -{discount}%
                      </span>
                    )}
                    <span className={`px-2 py-0.5 backdrop-blur-sm text-xs font-medium rounded-md shadow-sm ${
                      isOutOfStock 
                        ? 'bg-gray-800/95 text-white' 
                        : 'bg-green-500/95 text-white'
                    }`}>
                      {isOutOfStock ? '❌ Épuisé' : '✅ Dispo'}
                    </span>
                  </div>
                </div>

                {/* Image */}
                <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200">
                  {lot.image_urls.length > 0 ? (
                    <img
                      src={lot.image_urls[0]}
                      alt={lot.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package size={40} className="text-gray-400" strokeWidth={1.5} />
                    </div>
                  )}
                </div>

                {/* Barre de progression en bas de l'image */}
                {!isOutOfStock && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-300"
                      style={{ width: `${(availableQty / lot.quantity_total) * 100}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Contenu compact */}
              <div className="p-3">
                {/* Titre et prix */}
                <div className="mb-2">
                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1 mb-1">
                    {lot.title}
                  </h3>
                  <div className="flex items-baseline gap-2">
                    {lot.discounted_price === 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-accent-500 to-pink-500 text-white rounded-lg text-sm font-bold shadow-md">
                        <span>❤️</span>
                        <span>Don généreux</span>
                      </span>
                    ) : (
                      <>
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(lot.discounted_price)}
                        </span>
                        {lot.original_price > lot.discounted_price && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatCurrency(lot.original_price)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Stats compactes en grille */}
                <div className="grid grid-cols-4 gap-1 mb-3 text-center">
                  <div className="bg-gray-50 rounded-md py-1.5 px-1">
                    <div className="text-xs font-bold text-gray-900">{lot.quantity_total}</div>
                    <div className="text-[10px] text-gray-500">Total</div>
                  </div>
                  <div className="bg-orange-50 rounded-md py-1.5 px-1">
                    <div className="text-xs font-bold text-orange-700">{lot.quantity_reserved}</div>
                    <div className="text-[10px] text-orange-600">Réservé</div>
                  </div>
                  <div className="bg-green-50 rounded-md py-1.5 px-1">
                    <div className="text-xs font-bold text-green-700">{lot.quantity_sold}</div>
                    <div className="text-[10px] text-green-600">Vendu</div>
                  </div>
                  <div className={`rounded-md py-1.5 px-1 ${
                    availableQty > 0 ? 'bg-blue-50' : 'bg-red-50'
                  }`}>
                    <div className={`text-xs font-bold ${
                      availableQty > 0 ? 'text-blue-700' : 'text-red-700'
                    }`}>
                      {availableQty}
                    </div>
                    <div className={`text-[10px] ${
                      availableQty > 0 ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      Dispo
                    </div>
                  </div>
                </div>

                {/* Message suppression auto */}
                {isOutOfStock && (
                  <div className="mb-2 p-1.5 bg-amber-50 border border-amber-200 rounded-md">
                    <p className="text-[10px] text-amber-700 text-center font-medium">
                      ⏱️ Suppression auto dans 24h
                    </p>
                  </div>
                )}

                {/* Boutons d'action */}
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(lot)}
                    className="flex-1 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-lg hover:from-blue-100 hover:to-indigo-100 border border-blue-200 transition-all flex items-center justify-center gap-1.5 text-sm font-semibold"
                  >
                    <Edit size={14} strokeWidth={2} />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => handleDelete(lot.id)}
                    className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-red-50 hover:text-red-600 border border-gray-200 hover:border-red-300 transition-all"
                    aria-label="Supprimer le lot"
                  >
                    <Trash2 size={14} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Message si aucun résultat après filtrage */}
      {filteredLots.length === 0 && lots.length > 0 && (
        <div className="text-center py-16">
          <div className="inline-flex p-6 bg-gray-50 rounded-full mb-6">
            <Package size={64} className="text-gray-300" strokeWidth={1} />
          </div>
          <h3 className="text-xl font-bold text-black mb-2">
            Aucun panier trouvé 🔍
          </h3>
          <p className="text-gray-600 font-light mb-4">
            Aucun lot ne correspond au filtre "
            {displayFilter === 'paid' ? 'Avec prix' : displayFilter === 'donations' ? 'Dons généreux' : 'Tous'}"
          </p>
          <button
            onClick={() => setDisplayFilter('all')}
            className="px-6 py-3 bg-gradient-to-r from-secondary-600 to-secondary-700 text-white rounded-xl font-semibold hover:from-secondary-700 hover:to-secondary-800 transition-all shadow-lg"
          >
            Afficher tous les paniers
          </button>
        </div>
      )}

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
                      
                      <h4 className="text-xl font-bold text-gray-800 mb-2">
                        🤖 Analyse par IA
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
                        {formData.discounted_price === 0 ? (
                          <div className="mt-2 p-3 bg-gradient-to-r from-accent-50 to-pink-50 rounded-lg border-2 border-accent-200">
                            <p className="text-xs text-accent-800 font-semibold flex items-center gap-2">
                              <span className="text-base">❤️</span>
                              <span>Don généreux exclusif pour les bénéficiaires !</span>
                            </p>
                            <p className="text-xs text-accent-700 mt-1">
                              Ce produit sera gratuit et accessible uniquement par les bénéficiaires du programme solidaire.
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs text-green-600 mt-1">
                            {formData.original_price > 0 && formData.discounted_price > 0
                              ? `Réduction de ${Math.round((1 - formData.discounted_price / formData.original_price) * 100)}%`
                              : 'Prix anti-gaspillage'}
                          </p>
                        )}
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

                    {/* Sélection du jour */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <Calendar className="inline-block mr-2" size={16} />
                        <span className="text-red-500">*</span> Choisissez le jour
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                          type="button"
                          onClick={() => setSelectedDateOption('today')}
                          className={`
                            p-4 rounded-lg border-2 transition-all text-left
                            ${selectedDateOption === 'today'
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'}
                          `}
                        >
                          <div className="font-semibold text-gray-900">Aujourd'hui</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {format(new Date(), 'EEEE d MMMM', { locale: fr })}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedDateOption('tomorrow')}
                          className={`
                            p-4 rounded-lg border-2 transition-all text-left
                            ${selectedDateOption === 'tomorrow'
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'}
                          `}
                        >
                          <div className="font-semibold text-gray-900">Demain</div>
                          <div className="text-sm text-gray-600 mt-1">
                            {format(addDays(new Date(), 1), 'EEEE d MMMM', { locale: fr })}
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedDateOption('custom')}
                          className={`
                            p-4 rounded-lg border-2 transition-all text-left
                            ${selectedDateOption === 'custom'
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                              : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'}
                          `}
                        >
                          <div className="font-semibold text-gray-900">Autre jour</div>
                          <div className="text-sm text-gray-600 mt-1">Date personnalisée</div>
                        </button>
                      </div>

                      {selectedDateOption === 'custom' && (
                        <div className="mt-3">
                          <input
                            type="date"
                            value={customDate}
                            onChange={(e) => setCustomDate(e.target.value)}
                            min={format(new Date(), 'yyyy-MM-dd')}
                            className="w-full px-4 py-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            required
                          />
                        </div>
                      )}
                    </div>

                    {/* Créneaux horaires prédéfinis */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        <Clock className="inline-block mr-2" size={16} />
                        <span className="text-red-500">*</span> Créneaux horaires
                      </label>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                        <button
                          type="button"
                          onClick={() => {
                            setStartTime('12:00');
                            setEndTime('14:00');
                          }}
                          className="p-3 border-2 border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-left"
                        >
                          <div className="font-medium text-gray-900">🌞 Midi</div>
                          <div className="text-sm text-gray-600">12:00 - 14:00</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setStartTime('18:00');
                            setEndTime('20:00');
                          }}
                          className="p-3 border-2 border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-left"
                        >
                          <div className="font-medium text-gray-900">🌙 Soir</div>
                          <div className="text-sm text-gray-600">18:00 - 20:00</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setStartTime('08:00');
                            setEndTime('12:00');
                          }}
                          className="p-3 border-2 border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-left"
                        >
                          <div className="font-medium text-gray-900">🌅 Matin</div>
                          <div className="text-sm text-gray-600">08:00 - 12:00</div>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setStartTime('14:00');
                            setEndTime('18:00');
                          }}
                          className="p-3 border-2 border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-left"
                        >
                          <div className="font-medium text-gray-900">☀️ Après-midi</div>
                          <div className="text-sm text-gray-600">14:00 - 18:00</div>
                        </button>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-700 mb-3">Ou personnalisez :</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Début
                            </label>
                            <input
                              type="time"
                              value={startTime}
                              onChange={(e) => setStartTime(e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              Fin
                            </label>
                            <input
                              type="time"
                              value={endTime}
                              onChange={(e) => setEndTime(e.target.value)}
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                              required
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Aperçu du créneau */}
                    {formData.pickup_start && formData.pickup_end && (
                      <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <Check size={20} className="text-green-600 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-green-800 mb-1">Créneau de retrait défini</p>
                            <p className="text-sm text-green-700">
                              {format(new Date(formData.pickup_start), "EEEE d MMMM 'de' HH:mm", { locale: fr })}
                              {' '}à{' '}
                              {format(new Date(formData.pickup_end), 'HH:mm', { locale: fr })}
                            </p>
                          </div>
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
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 sm:gap-0">
              <div className="order-2 sm:order-1">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 text-black bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                  >
                    <ChevronLeft size={18} strokeWidth={1.5} />
                    <span>Précédent</span>
                  </button>
                )}
              </div>

              <div className="order-1 sm:order-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingLot(null);
                    resetForm();
                  }}
                  className="flex-1 sm:flex-none px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Annuler
                </button>

                {currentStep < totalSteps ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceedToNextStep()}
                    className={`
                      flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition
                      ${canProceedToNextStep()
                        ? 'bg-black text-white hover:bg-gray-900'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                    `}
                  >
                    <span>Suivant</span>
                    <ChevronRight size={18} strokeWidth={1.5} />
                  </button>
                ) : (
                <button
                  type="submit"
                    onClick={handleSubmit}
                    disabled={!canProceedToNextStep()}
                    className={`
                      flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold transition
                      ${canProceedToNextStep()
                        ? 'bg-black text-white hover:bg-gray-900'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                    `}
                  >
                    <Check size={18} strokeWidth={1.5} />
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
