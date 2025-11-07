import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Clock, User, Mail, Phone, MapPin, FileText, Trash2, Package } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';
import { useBeneficiaries, type BeneficiaryListItem } from '../../hooks/useBeneficiaries';
import { LoadingSpinner } from '../shared/LoadingSpinner';

type Registration = Database['public']['Tables']['association_beneficiary_registrations']['Row'];

interface FeedbackMessage {
  type: 'success' | 'error';
  text: string;
}

const PAGE_SIZE = 10;

export function RegisteredBeneficiaries() {
  const { profile } = useAuthStore();
  const associationId = profile?.id ?? null;

  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BeneficiaryListItem | null>(null);

  const {
    beneficiaries,
    totalCount,
    loading,
    error,
    refresh,
  } = useBeneficiaries({
    associationId,
    page,
    pageSize: PAGE_SIZE,
    filters: { status: statusFilter },
  });

  const totalPages = useMemo(() => {
    if (totalCount === 0) {
      return 1;
    }
    return Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  }, [totalCount]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const verifiedCount = useMemo(
    () => beneficiaries.filter((item) => item.registration.is_verified).length,
    [beneficiaries]
  );

  const pendingCount = useMemo(
    () => beneficiaries.filter((item) => !item.registration.is_verified).length,
    [beneficiaries]
  );

  const handleToggleVerification = async (registration: Registration) => {
    setFeedback(null);
    setActionLoadingId(registration.id);

    try {
      const { error: updateError } = await supabase
        .from('association_beneficiary_registrations')
        .update({ is_verified: !registration.is_verified })
        .eq('id', registration.id);

      if (updateError) {
        throw updateError;
      }

      setFeedback({
        type: 'success',
        text: registration.is_verified
          ? 'Le bénéficiaire est désormais marqué comme non vérifié.'
          : 'Le bénéficiaire est désormais vérifié.',
      });

      await refresh();
    } catch (updateError) {
      console.error('Erreur lors de la mise à jour du statut bénéficiaire:', updateError);
      setFeedback({
        type: 'error',
        text: "Impossible de mettre à jour le statut du bénéficiaire. Veuillez réessayer.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = (beneficiaryItem: BeneficiaryListItem) => {
    setFeedback(null);
    setDeleteTarget(beneficiaryItem);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setFeedback(null);
    setActionLoadingId(deleteTarget.registration.id);

    try {
      const { error: deleteError } = await supabase
        .from('association_beneficiary_registrations')
        .delete()
        .eq('id', deleteTarget.registration.id);

      if (deleteError) {
        throw deleteError;
      }

      setFeedback({
        type: 'success',
        text: 'Le bénéficiaire a été supprimé avec succès.',
      });

      setDeleteTarget(null);
      await refresh();
    } catch (deleteError) {
      console.error('Erreur lors de la suppression du bénéficiaire:', deleteError);
      setFeedback({
        type: 'error',
        text: 'Impossible de supprimer ce bénéficiaire pour le moment.',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
  };

  const handleChangePage = (direction: 'previous' | 'next') => {
    setFeedback(null);
    setPage((current) => {
      if (direction === 'previous') {
        return Math.max(1, current - 1);
      }
      return Math.min(totalPages, current + 1);
    });
  };

  const handleFilterChange = (status: 'all' | 'verified' | 'pending') => {
    if (status === statusFilter) {
      return;
    }
    setStatusFilter(status);
    setPage(1);
    setFeedback(null);
  };

  if (loading && beneficiaries.length === 0) {
    return <LoadingSpinner />;
  }

  if (!loading && beneficiaries.length === 0) {
    return (
      <div className="card p-12 text-center animate-fade-in-up">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User size={32} className="text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 mb-2">
          Aucun bénéficiaire enregistré
        </h3>
        <p className="text-neutral-600 mb-6">
          Commencez par enregistrer votre premier bénéficiaire via l'onglet « Enregistrer un bénéficiaire ».
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up pb-8">
      {feedback && (
        <div
          className={`flex items-start justify-between gap-3 rounded-lg border px-4 py-3 text-sm ${
            feedback.type === 'success'
              ? 'border-success-200 bg-success-50 text-success-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
          role="alert"
        >
          <span className="leading-snug">{feedback.text}</span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs font-semibold uppercase tracking-wide"
          >
            Fermer
          </button>
        </div>
      )}

      {error && (
        <div
          className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
          role="alert"
        >
          <div>
            <p className="text-sm font-medium text-red-700">{error}</p>
            <p className="text-xs text-red-600">
              Vous pouvez tenter un nouvel affichage des bénéficiaires.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFeedback(null);
              void refresh();
            }}
            className="btn-secondary px-3 py-1 text-xs"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* En-tête */}
      <div className="card p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-1">
              Mes bénéficiaires
            </h2>
            <p className="text-neutral-600 text-sm">
              {totalCount} bénéficiaire{totalCount > 1 ? 's' : ''} enregistré{totalCount > 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-6">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-success-600" />
                <span className="text-neutral-600">
                  {verifiedCount} vérifié{verifiedCount > 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-warning-600" />
                <span className="text-neutral-600">
                  {pendingCount} en attente
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {([
                { id: 'all', label: 'Tous' },
                { id: 'verified', label: 'Vérifiés' },
                { id: 'pending', label: 'En attente' },
              ] as const).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleFilterChange(option.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    statusFilter === option.id
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Liste des bénéficiaires */}
      <div className="grid gap-4">
        {beneficiaries.map(({ registration, beneficiary, packagesRecovered }) => (
          <div
            key={registration.id}
            className="card p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between gap-4">
              {/* Informations principales */}
              <div className="flex-1 space-y-4">
                {/* En-tête avec statut */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <User size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900">
                        {beneficiary.full_name}
                      </h3>
                      <p className="text-sm text-neutral-600">
                        ID: {beneficiary.beneficiary_id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {registration.is_verified ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-success-100 text-success-700 rounded-full text-sm font-medium">
                        <CheckCircle size={14} />
                        Vérifié
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-warning-100 text-warning-700 rounded-full text-sm font-medium">
                        <Clock size={14} />
                        En attente
                      </span>
                    )}
                  </div>
                </div>

                {/* Statistiques de récupération */}
                <div className="flex items-center gap-2 px-2.5 py-1.5 bg-primary-50 rounded-lg border border-primary-200 w-fit">
                  <Package size={14} className="text-primary-600" />
                  <span className="text-xs text-primary-600 font-medium">Colis récupérés :</span>
                  <span className="text-sm font-bold text-primary-700">{packagesRecovered}</span>
                </div>

                {/* Coordonnées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-neutral-600">
                  {beneficiary.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-neutral-400" />
                      <span className="truncate">{beneficiary.email}</span>
                    </div>
                  )}
                  {beneficiary.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-neutral-400" />
                      <span>{beneficiary.phone}</span>
                    </div>
                  )}
                  {beneficiary.address && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-neutral-400" />
                      <span>{beneficiary.address}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {registration.notes && (
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-start gap-2 text-sm text-neutral-600">
                      <FileText size={16} className="text-neutral-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900 mb-1">Notes</p>
                        <p>{registration.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Date d'enregistrement */}
                <div className="text-xs text-neutral-500">
                  Enregistré le {format(new Date(registration.registration_date), 'dd MMMM yyyy', { locale: fr })}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleVerification(registration)}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    registration.is_verified
                      ? 'bg-warning-100 text-warning-700 hover:bg-warning-200'
                      : 'bg-success-100 text-success-700 hover:bg-success-200'
                  } ${actionLoadingId === registration.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                  disabled={actionLoadingId === registration.id}
                >
                  {actionLoadingId === registration.id ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-b-transparent" />
                  ) : registration.is_verified ? (
                    <Clock size={16} />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  <span className="hidden sm:inline">
                    {registration.is_verified ? 'Marquer non vérifié' : 'Marquer vérifié'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete({ registration, beneficiary, packagesRecovered })}
                  className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors bg-red-100 text-red-600 hover:bg-red-200 ${
                    actionLoadingId === registration.id ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                  disabled={actionLoadingId === registration.id}
                >
                  {actionLoadingId === registration.id ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-b-transparent" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  <span className="hidden sm:inline">Supprimer</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalCount > PAGE_SIZE && (
        <div className="flex flex-col-reverse items-center justify-between gap-3 pt-2 sm:flex-row">
          <p className="text-xs text-neutral-500">
            Page {page} sur {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleChangePage('previous')}
              disabled={page === 1}
              className="btn-secondary px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              Précédent
            </button>
            <button
              type="button"
              onClick={() => handleChangePage('next')}
              disabled={page === totalPages}
              className="btn-primary px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmation de suppression */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="card max-w-sm w-full space-y-4 p-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-neutral-900">Supprimer le bénéficiaire</h3>
              <p className="text-sm text-neutral-600">
                Cette action supprimera définitivement l'enregistrement de {deleteTarget.beneficiary.full_name}. Voulez-vous continuer ?
              </p>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="btn-secondary px-4 py-2"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={actionLoadingId === deleteTarget.registration.id}
                className="btn-primary bg-red-600 hover:bg-red-700 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

