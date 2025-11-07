import { useEffect, useMemo, useState } from 'react';
import { Clock, Package, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react';

import { useAuthStore } from '../../stores/authStore';
import { useBeneficiaryActivity } from '../../hooks/useBeneficiaryActivity';
import { formatDate } from '../../utils/helpers';

interface StatusBadgeConfig {
  label: string;
  icon: typeof Clock;
  container: string;
  text: string;
}

const STATUS_CONFIG: Record<string, StatusBadgeConfig> = {
  completed: {
    label: 'Récupéré',
    icon: CheckCircle,
    container: 'bg-success-100',
    text: 'text-success-700',
  },
  confirmed: {
    label: 'Confirmé',
    icon: Clock,
    container: 'bg-primary-100',
    text: 'text-primary-700',
  },
  pending: {
    label: 'En attente',
    icon: AlertCircle,
    container: 'bg-warning-100',
    text: 'text-warning-700',
  },
  cancelled: {
    label: 'Annulé',
    icon: XCircle,
    container: 'bg-neutral-100',
    text: 'text-neutral-600',
  },
};

export function BeneficiaryActivityHistory() {
  const { user } = useAuthStore();
  const associationId = user?.id ?? null;
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<string | null>(null);

  const {
    beneficiaries,
    loading,
    error,
    refresh,
  } = useBeneficiaryActivity({ associationId });

  useEffect(() => {
    if (beneficiaries.length > 0 && !selectedBeneficiary) {
      setSelectedBeneficiary(beneficiaries[0].id);
    }
  }, [beneficiaries, selectedBeneficiary]);

  const selectedBeneficiaryData = useMemo(
    () => beneficiaries.find((beneficiary) => beneficiary.id === selectedBeneficiary) ?? null,
    [beneficiaries, selectedBeneficiary]
  );

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.container} ${config.text}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
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
        <div className="flex items-start justify-between gap-3 rounded-lg border border-accent-200 bg-accent-50 p-4" role="alert">
          <div className="flex items-start gap-2 text-accent-700">
            <AlertCircle size={20} className="mt-0.5" />
            <div>
              <p className="font-semibold">{error}</p>
              <p className="text-xs">Vous pouvez tenter de relancer le chargement.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              void refresh();
            }}
            className="btn-secondary px-3 py-1 text-xs"
          >
            Réessayer
          </button>
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
                      {beneficiary.beneficiary_id && (
                        <p className="text-sm text-neutral-600 mt-1">
                          ID: {beneficiary.beneficiary_id}
                        </p>
                      )}
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

