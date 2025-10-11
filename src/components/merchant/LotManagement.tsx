import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/authStore';
import { formatCurrency, formatDateTime, categories, uploadImage } from '../../utils/helpers';
import { Plus, Edit, Trash2, Package, Image as ImageIcon } from 'lucide-react';
import type { Database } from '../../lib/database.types';

type Lot = Database['public']['Tables']['lots']['Row'];

export const LotManagement = () => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const { profile } = useAuthStore();

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

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
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
  };

  const cleanupOldSoldOutLots = async (lots: Lot[]) => {
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
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const imagePromises = Array.from(files).map((file) => uploadImage(file));
    const imageUrls = await Promise.all(imagePromises);
    setFormData({ ...formData, image_urls: [...formData.image_urls, ...imageUrls] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    try {
      if (editingLot) {
        const { error } = await supabase
          .from('lots')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingLot.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('lots').insert({
          ...formData,
          merchant_id: profile.id,
        });

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

      const lotsToInsert = fictionalProducts.map(product => ({
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
    setShowModal(true);
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
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Gestion des Lots</h2>
        <div className="flex gap-2">
          <button
            onClick={generateFictionalLots}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            title="Créer 25 produits de test"
          >
            <Package size={20} />
            <span>Générer produits test</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setEditingLot(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            <span>Nouveau Lot</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lots.map((lot) => {
          const availableQty = lot.quantity_total - lot.quantity_reserved - lot.quantity_sold;
          const isOutOfStock = availableQty <= 0;

          return (
            <div 
              key={lot.id} 
              className={`bg-white rounded-xl shadow-md overflow-hidden transition-all ${
                isOutOfStock ? 'opacity-50 grayscale' : ''
              }`}
            >
              <div className="relative h-48 bg-gradient-to-br from-green-100 to-blue-100">
                {lot.image_urls.length > 0 ? (
                  <img
                    src={lot.image_urls[0]}
                    alt={lot.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Package size={64} className="text-gray-400" />
                  </div>
                )}
                <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-white font-semibold text-sm ${
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

              <div className="p-4">
                {isOutOfStock && (
                  <div className="mb-3 p-2 bg-orange-100 border border-orange-300 rounded-lg">
                    <p className="text-xs text-orange-800 font-medium">
                      ⚠️ Ce produit sera automatiquement supprimé 24h après épuisement
                    </p>
                  </div>
                )}
                <h3 className="text-lg font-bold text-gray-800 mb-2">{lot.title}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lot.description}</p>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
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

                <div className="flex items-center justify-between mb-4 pt-4 border-t">
                  <div>
                    <span className="text-xl font-bold text-green-600">
                      {formatCurrency(lot.discounted_price)}
                    </span>
                    <span className="text-sm text-gray-500 line-through ml-2">
                      {formatCurrency(lot.original_price)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(lot)}
                    className="flex-1 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition flex items-center justify-center gap-2"
                  >
                    <Edit size={16} />
                    <span>Modifier</span>
                  </button>
                  <button
                    onClick={() => handleDelete(lot.id)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 my-8">
            <h3 className="text-2xl font-bold mb-6">
              {editingLot ? 'Modifier le lot' : 'Nouveau lot'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.quantity_total}
                    onChange={(e) =>
                      setFormData({ ...formData, quantity_total: parseInt(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix original (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.original_price}
                    onChange={(e) =>
                      setFormData({ ...formData, original_price: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix réduit (€)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.discounted_price}
                    onChange={(e) =>
                      setFormData({ ...formData, discounted_price: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Début retrait
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.pickup_start}
                    onChange={(e) => setFormData({ ...formData, pickup_start: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fin retrait
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.pickup_end}
                    onChange={(e) => setFormData({ ...formData, pickup_end: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.requires_cold_chain}
                    onChange={(e) =>
                      setFormData({ ...formData, requires_cold_chain: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Chaîne du froid requise</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_urgent}
                    onChange={(e) => setFormData({ ...formData, is_urgent: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-700">Urgent</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Images
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                {formData.image_urls.length > 0 && (
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {formData.image_urls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Preview ${i}`}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingLot(null);
                    resetForm();
                  }}
                  className="flex-1 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingLot ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
