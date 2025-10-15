// Imports externes
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scan, ArrowLeft, Check, AlertCircle, Package, Calendar, Clock, Sparkles, ImagePlus } from 'lucide-react';
import { addDays, startOfDay, setHours, setMinutes, format } from 'date-fns';

// Imports internes
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { fetchProductByBarcode, mapOpenFoodFactsCategory, estimatePrice } from '../../utils/openFoodFactsService';
import { categories, uploadImage } from '../../utils/helpers';

// Type pour l'insertion d'un lot (contournement du problème de types Supabase)
interface LotInsertData {
  merchant_id: string;
  title: string;
  description: string;
  category: string;
  original_price: number;
  discounted_price: number;
  quantity_total: number;
  quantity_reserved?: number;
  quantity_sold?: number;
  pickup_start: string;
  pickup_end: string;
  requires_cold_chain?: boolean;
  is_urgent?: boolean;
  status?: 'available' | 'reserved' | 'sold_out' | 'expired';
  image_urls?: string[] | null;
  barcode?: string | null;
}

interface ScannedProduct {
  barcode: string;
  name: string;
  brand?: string;
  category: string;
  imageUrl?: string;
  quantity?: string;
  originalPrice: number;
  discountedPrice: number;
}

/**
 * Composant pour ajouter rapidement un produit via scan EAN13
 * Récupère les données depuis OpenFoodFacts et permet au commerçant de valider/ajuster
 */
export function QuickAddProduct() {
  // État local
  const [step, setStep] = useState<'scan' | 'validate'>('scan');
  const [barcode, setBarcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [scannedProduct, setScannedProduct] = useState<ScannedProduct | null>(null);
  const [saving, setSaving] = useState(false);

  // Hooks (stores, contexts, router)
  const { profile } = useAuthStore();
  const navigate = useNavigate();

  // État pour le formulaire de validation
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

  // État pour la sélection de date
  const [selectedDateOption, setSelectedDateOption] = useState<'today' | 'tomorrow' | 'custom'>('today');
  const [customDate, setCustomDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('20:00');

  // Effet pour mettre à jour les dates de retrait
  useEffect(() => {
    let selectedDate: Date;

    if (selectedDateOption === 'today') {
      selectedDate = startOfDay(new Date());
    } else if (selectedDateOption === 'tomorrow') {
      selectedDate = startOfDay(addDays(new Date(), 1));
    } else if (selectedDateOption === 'custom' && customDate) {
      selectedDate = startOfDay(new Date(customDate));
    } else {
      return;
    }

    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const pickupStartDate = setMinutes(setHours(selectedDate, startHour), startMinute);
    const pickupEndDate = setMinutes(setHours(selectedDate, endHour), endMinute);

    setFormData(prev => ({
      ...prev,
      pickup_start: pickupStartDate.toISOString(),
      pickup_end: pickupEndDate.toISOString(),
    }));
  }, [selectedDateOption, customDate, startTime, endTime]);

  // Handler pour le scan manuel
  const handleManualScan = async () => {
    if (!barcode.trim()) {
      setError('Veuillez saisir un code-barres');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await fetchProductByBarcode(barcode.trim());

      if (!result.success || !result.product) {
        setError(result.error || 'Produit non trouvé');
        setLoading(false);
        return;
      }

      const product = result.product;
      const mappedCategory = mapOpenFoodFactsCategory(product.categories);
      const prices = estimatePrice(mappedCategory, product.quantity);

      // Créer le produit scanné
      const scanned: ScannedProduct = {
        barcode: product.code,
        name: product.product_name || 'Produit sans nom',
        brand: product.brands || undefined,
        category: mappedCategory,
        imageUrl: product.image_front_url || product.image_url,
        quantity: product.quantity,
        originalPrice: prices.original,
        discountedPrice: prices.discounted,
      };

      setScannedProduct(scanned);

      // Pré-remplir le formulaire
      setFormData(prev => ({
        ...prev,
        title: scanned.brand ? `${scanned.brand} - ${scanned.name}` : scanned.name,
        description: product.ingredients_text 
          ? `Ingrédients: ${product.ingredients_text.substring(0, 200)}${product.ingredients_text.length > 200 ? '...' : ''}`
          : 'Produit de qualité à prix réduit pour éviter le gaspillage',
        category: scanned.category,
        original_price: scanned.originalPrice,
        discounted_price: scanned.discountedPrice,
        image_urls: scanned.imageUrl ? [scanned.imageUrl] : [],
      }));

      setStep('validate');
    } catch (err) {
      console.error('Erreur lors du scan:', err);
      setError('Erreur lors de la récupération des données');
    } finally {
      setLoading(false);
    }
  };

  // Handler pour uploader une image additionnelle
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const imageUrl = await uploadImage(file);
      setFormData(prev => ({
        ...prev,
        image_urls: [...prev.image_urls, imageUrl],
      }));
    } catch (error) {
      console.error('Erreur upload image:', error);
      alert('Erreur lors de l\'upload de l\'image');
    }
  };

  // Handler pour sauvegarder le lot
  const handleSave = async () => {
    if (!profile) return;

    // Validation
    if (!formData.title.trim()) {
      alert('Le titre est obligatoire');
      return;
    }
    if (formData.original_price <= 0) {
      alert('Le prix original doit être supérieur à 0');
      return;
    }
    if (formData.discounted_price <= 0 || formData.discounted_price >= formData.original_price) {
      alert('Le prix réduit doit être inférieur au prix original');
      return;
    }
    if (formData.quantity_total < 1) {
      alert('La quantité doit être d\'au moins 1');
      return;
    }
    if (!formData.pickup_start || !formData.pickup_end) {
      alert('Veuillez définir les horaires de retrait');
      return;
    }

    setSaving(true);

    try {
      const lotData: LotInsertData = {
        merchant_id: profile.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        original_price: formData.original_price,
        discounted_price: formData.discounted_price,
        quantity_total: formData.quantity_total,
        quantity_reserved: 0,
        quantity_sold: 0,
        pickup_start: formData.pickup_start,
        pickup_end: formData.pickup_end,
        status: 'available',
        requires_cold_chain: formData.requires_cold_chain,
        is_urgent: formData.is_urgent,
        image_urls: formData.image_urls.length > 0 ? formData.image_urls : null,
        barcode: scannedProduct?.barcode || null,
      };

      // Note: Types Supabase générés posent problème, contournement temporaire
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await supabase.from('lots').insert(lotData as any);

      if (error) throw error;

      alert('✅ Produit ajouté avec succès !');
      navigate('/dashboard');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('Erreur lors de la sauvegarde du produit');
    } finally {
      setSaving(false);
    }
  };

  // Early returns
  if (!profile || profile.role !== 'merchant') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="card p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600">Cette fonctionnalité est réservée aux commerçants</p>
        </div>
      </div>
    );
  }

  // Render principal
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => step === 'scan' ? navigate('/dashboard') : setStep('scan')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Retour</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {step === 'scan' ? 'Scanner un produit' : 'Valider le produit'}
            </h1>
            <div className="w-20" /> {/* Spacer pour centrer le titre */}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-8">
        {step === 'scan' ? (
          // Étape 1: Scanner le code-barres
          <div className="card p-8 animate-fade-in-up">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Scan className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Scanner un code-barres EAN13
              </h2>
              <p className="text-gray-600">
                Récupérez automatiquement les informations depuis OpenFoodFacts
              </p>
            </div>

            {/* Scanner manuel */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Code-barres (EAN13)
                </label>
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleManualScan()}
                  placeholder="Ex: 3017620425035"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleManualScan}
                disabled={loading || !barcode.trim()}
                className="w-full btn-primary py-4 text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Sparkles className="inline mr-2 animate-spin" size={20} />
                    Recherche en cours...
                  </>
                ) : (
                  <>
                    <Scan className="inline mr-2" size={20} />
                    Scanner le produit
                  </>
                )}
              </button>
            </div>

            
          </div>
        ) : (
          // Étape 2: Validation et ajustement
          <div className="space-y-6 animate-fade-in-up">
            {/* Aperçu du produit scanné */}
            {scannedProduct && (
              <div className="card p-6">
                <div className="flex items-start gap-4">
                  {scannedProduct.imageUrl && (
                    <img
                      src={scannedProduct.imageUrl}
                      alt={scannedProduct.name}
                      className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{scannedProduct.name}</h3>
                    {scannedProduct.brand && (
                      <p className="text-sm text-gray-600 mt-1">{scannedProduct.brand}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-xs font-semibold">
                        <Package size={14} />
                        {scannedProduct.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        Code: {scannedProduct.barcode}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Formulaire de validation */}
            <div className="card p-6 space-y-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Check className="text-green-600" size={20} />
                Valider et ajuster les informations
              </h3>

              {/* Titre */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Titre du lot <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  placeholder="Ex: Pain frais du jour"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  placeholder="Décrivez le contenu du lot..."
                />
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Prix */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prix original (€) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prix réduit (€) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discounted_price}
                    onChange={(e) => setFormData({ ...formData, discounted_price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                </div>
              </div>

              {/* Quantité */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Quantité disponible <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.quantity_total}
                  onChange={(e) => setFormData({ ...formData, quantity_total: parseInt(e.target.value) || 1 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500"
                />
              </div>

              {/* Date de retrait */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  <Calendar className="inline mr-2" size={18} />
                  Date de retrait <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2 mb-4">
                  {['today', 'tomorrow', 'custom'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedDateOption(option as typeof selectedDateOption)}
                      className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all ${
                        selectedDateOption === option
                          ? 'bg-secondary-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option === 'today' ? "Aujourd'hui" : option === 'tomorrow' ? 'Demain' : 'Personnalisé'}
                    </button>
                  ))}
                </div>
                {selectedDateOption === 'custom' && (
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500 mb-4"
                  />
                )}
              </div>

              {/* Horaires */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="inline mr-2" size={16} />
                    Heure début
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Clock className="inline mr-2" size={16} />
                    Heure fin
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-secondary-500"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requires_cold_chain}
                    onChange={(e) => setFormData({ ...formData, requires_cold_chain: e.target.checked })}
                    className="w-5 h-5 text-secondary-600 rounded focus:ring-secondary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    ❄️ Nécessite une chaîne du froid
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_urgent}
                    onChange={(e) => setFormData({ ...formData, is_urgent: e.target.checked })}
                    className="w-5 h-5 text-secondary-600 rounded focus:ring-secondary-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    ⚡ Lot urgent (retrait rapide)
                  </span>
                </label>
              </div>

              {/* Ajouter image additionnelle */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ajouter une photo supplémentaire
                </label>
                <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-secondary-500 hover:bg-secondary-50 transition-all">
                  <ImagePlus size={20} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Choisir une image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Aperçu des images */}
              {formData.image_urls.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {formData.image_urls.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`Aperçu ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setStep('scan')}
                className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 btn-primary py-4 text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Sparkles className="inline mr-2 animate-spin" size={20} />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Check className="inline mr-2" size={20} />
                    Valider et publier
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

