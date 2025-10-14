import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { Clock, Package, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';
import { formatDate, formatDateTime } from '../../utils/helpers';

interface BeneficiaryWithActivity {
  id: string;
  full_name: string;
  email: string;
  beneficiary_id: string | null;
  phone: string | null;
  created_at: string;
  reservations: Array<{
    id: string;
    created_at: string;
    status: string;
    quantity: number;
    completed_at: string | null;
    lot: {
      title: string;
      category: string;
      merchant: {
        business_name: string;
      };
    };
  }>;
}

export function BeneficiaryActivityHistory() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryWithActivity[]>([]);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchBeneficiariesActivity();
    }
  }, [user]);

  const fetchBeneficiariesActivity = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les bénéficiaires de l'association
      const { data: registrations, error: regError } = await supabase
        .from('association_beneficiary_registrations')
        .select(`
          beneficiary_id,
          profiles!association_beneficiary_registrations_beneficiary_id_fkey (
            id,
            full_name,
            beneficiary_id,
            phone,
            created_at
          )
        `)
        .eq('association_id', user!.id);

      if (regError) throw regError;

      // Pour chaque bénéficiaire, récupérer ses réservations
      const beneficiariesWithActivity: BeneficiaryWithActivity[] = [];

      for (const reg of registrations || []) {
        const beneficiaryProfile = (reg as any).profiles;
        
        const { data: reservations, error: resError } = await supabase
          .from('reservations')
          .select(`
            id,
            created_at,
            status,
            quantity,
            completed_at,
            lot:lots!inner (
              title,
              category,
              merchant:profiles!lots_merchant_id_fkey (
                business_name
              )
            )
          `)
          .eq('user_id', beneficiaryProfile.id)
          .eq('is_donation', true)
          .order('created_at', { ascending: false })
          .limit(50);

        if (resError) {
          console.error('Erreur lors de la récupération des réservations:', resError);
          continue;
        }

        beneficiariesWithActivity.push({
          id: beneficiaryProfile.id,
          full_name: beneficiaryProfile.full_name,
          email: '', // Email non disponible dans profiles
          beneficiary_id: beneficiaryProfile.beneficiary_id,
          phone: beneficiaryProfile.phone,
          created_at: beneficiaryProfile.created_at,
          reservations: (reservations || []).map((r: any) => ({
            id: r.id,
            created_at: r.created_at,
            status: r.status,
            quantity: r.quantity,
            completed_at: r.completed_at,
            lot: {
              title: r.lot.title,
              category: r.lot.category,
              merchant: {
                business_name: r.lot.merchant.business_name,
              },
            },
          })),
        });
      }

      setBeneficiaries(beneficiariesWithActivity);
    } catch (err) {
      console.error('Erreur lors de la récupération de l\'historique:', err);
      setError('Impossible de charger l\'historique d\'activité.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      completed: { label: 'Récupéré', icon: CheckCircle, color: 'success' },
      confirmed: { label: 'Confirmé', icon: Clock, color: 'primary' },
      pending: { label: 'En attente', icon: AlertCircle, color: 'warning' },
      cancelled: { label: 'Annulé', icon: XCircle, color: 'neutral' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-700`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const selectedBeneficiaryData = beneficiaries.find(b => b.id === selectedBeneficiary);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Clock size={28} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Historique d'activité</h2>
            <p className="text-neutral-600 mt-1">
              Suivez l'utilisation de la plateforme par vos bénéficiaires
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-accent-50 border border-accent-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-accent-600" />
          <p className="text-accent-800">{error}</p>
        </div>
      )}

      {/* Liste des bénéficiaires */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de gauche : Liste des bénéficiaires */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Bénéficiaires ({beneficiaries.length})
          </h3>
          
          {beneficiaries.length === 0 ? (
            <div className="bg-neutral-50 rounded-lg p-8 text-center">
              <Package size={48} className="mx-auto text-neutral-400 mb-3" />
              <p className="text-neutral-600">Aucun bénéficiaire enregistré</p>
            </div>
          ) : (
            <div className="space-y-2">
              {beneficiaries.map((beneficiary) => (
                <button
                  key={beneficiary.id}
                  onClick={() => setSelectedBeneficiary(beneficiary.id)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    selectedBeneficiary === beneficiary.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-neutral-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-neutral-900">
                        {beneficiary.full_name}
                      </p>
                      <p className="text-sm text-neutral-600 mt-1">
                        ID: {beneficiary.beneficiary_id}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 rounded-full">
                      <Package size={14} className="text-purple-600" />
                      <span className="text-xs font-medium text-purple-700">
                        {beneficiary.reservations.length}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Colonne de droite : Détails de l'activité */}
        <div className="lg:col-span-2">
          {selectedBeneficiaryData ? (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-1">
                  {selectedBeneficiaryData.full_name}
                </h3>
                <p className="text-sm text-neutral-600">
                  {selectedBeneficiaryData.reservations.length} réservation(s) au total
                </p>
              </div>

              {selectedBeneficiaryData.reservations.length === 0 ? (
                <div className="bg-neutral-50 rounded-lg p-12 text-center">
                  <Calendar size={48} className="mx-auto text-neutral-400 mb-3" />
                  <p className="text-neutral-600 font-medium">Aucune activité enregistrée</p>
                  <p className="text-sm text-neutral-500 mt-1">
                    Ce bénéficiaire n'a pas encore effectué de réservation
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedBeneficiaryData.reservations.map((reservation) => (
                    <div
                      key={reservation.id}
                      className="bg-white rounded-lg border border-neutral-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-neutral-900">
                            {reservation.lot.title}
                          </h4>
                          <p className="text-sm text-neutral-600 mt-1">
                            {reservation.lot.merchant.business_name}
                          </p>
                        </div>
                        {getStatusBadge(reservation.status)}
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-neutral-500">Catégorie</p>
                          <p className="font-medium text-neutral-900">
                            {reservation.lot.category}
                          </p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Quantité</p>
                          <p className="font-medium text-neutral-900">
                            {reservation.quantity}
                          </p>
                        </div>
                        <div>
                          <p className="text-neutral-500">Date de réservation</p>
                          <p className="font-medium text-neutral-900">
                            {formatDate(reservation.created_at)}
                          </p>
                        </div>
                        {reservation.completed_at && (
                          <div>
                            <p className="text-neutral-500">Date de retrait</p>
                            <p className="font-medium text-neutral-900">
                              {formatDate(reservation.completed_at)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-neutral-50 rounded-lg p-12 text-center h-full flex items-center justify-center">
              <div>
                <Clock size={48} className="mx-auto text-neutral-400 mb-3" />
                <p className="text-neutral-600 font-medium">
                  Sélectionnez un bénéficiaire
                </p>
                <p className="text-sm text-neutral-500 mt-1">
                  Cliquez sur un bénéficiaire pour voir son historique d'activité
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

