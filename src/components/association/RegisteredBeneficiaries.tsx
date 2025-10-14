import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';
import { CheckCircle, Clock, User, Mail, Phone, MapPin, FileText, Edit2, Trash2 } from 'lucide-react';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

type Registration = Database['public']['Tables']['association_beneficiary_registrations']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface BeneficiaryWithRegistration {
  registration: Registration;
  beneficiary: Profile;
}

export function RegisteredBeneficiaries() {
  const { profile } = useAuthStore();
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryWithRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<BeneficiaryWithRegistration | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    loadBeneficiaries();
  }, [profile?.id]);

  const loadBeneficiaries = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('association_beneficiary_registrations')
        .select(`
          *,
          beneficiary:profiles!beneficiary_id(*)
        `)
        .eq('association_id', profile.id)
        .order('registration_date', { ascending: false });

      if (error) throw error;

      // Transformer les données
      const formattedData = data?.map(item => ({
        registration: {
          id: item.id,
          association_id: item.association_id,
          beneficiary_id: item.beneficiary_id,
          registration_date: item.registration_date,
          notes: item.notes,
          verification_document_url: item.verification_document_url,
          is_verified: item.is_verified,
          created_at: item.created_at,
          updated_at: item.updated_at,
        } as Registration,
        beneficiary: (item as any).beneficiary as Profile,
      })) || [];

      setBeneficiaries(formattedData);
    } catch (error) {
      console.error('Erreur lors du chargement des bénéficiaires:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (registration: Registration) => {
    try {
      const { error } = await supabase
        .from('association_beneficiary_registrations')
        .update({ is_verified: !registration.is_verified })
        .eq('id', registration.id);

      if (error) throw error;

      // Recharger les données
      await loadBeneficiaries();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleDelete = async (registrationId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet enregistrement ?')) return;

    try {
      const { error } = await supabase
        .from('association_beneficiary_registrations')
        .delete()
        .eq('id', registrationId);

      if (error) throw error;

      // Recharger les données
      await loadBeneficiaries();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (beneficiaries.length === 0) {
    return (
      <div className="card p-12 text-center animate-fade-in-up">
        <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User size={32} className="text-purple-600" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 mb-2">
          Aucun bénéficiaire enregistré
        </h3>
        <p className="text-neutral-600 mb-6">
          Commencez par enregistrer votre premier bénéficiaire via l'onglet "Enregistrer un bénéficiaire"
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* En-tête */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              Mes bénéficiaires
            </h2>
            <p className="text-neutral-600">
              {beneficiaries.length} bénéficiaire{beneficiaries.length > 1 ? 's' : ''} enregistré{beneficiaries.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-success-600" />
              <span className="text-neutral-600">
                {beneficiaries.filter(b => b.registration.is_verified).length} vérifié{beneficiaries.filter(b => b.registration.is_verified).length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-warning-600" />
              <span className="text-neutral-600">
                {beneficiaries.filter(b => !b.registration.is_verified).length} en attente
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des bénéficiaires */}
      <div className="grid gap-4">
        {beneficiaries.map(({ registration, beneficiary }) => (
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

                {/* Coordonnées */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {beneficiary.phone && (
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Phone size={16} className="text-neutral-400" />
                      <span>{beneficiary.phone}</span>
                    </div>
                  )}
                  {beneficiary.address && (
                    <div className="flex items-center gap-2 text-neutral-600">
                      <MapPin size={16} className="text-neutral-400" />
                      <span>{beneficiary.address}</span>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {registration.notes && (
                  <div className="p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-start gap-2 text-sm">
                      <FileText size={16} className="text-neutral-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900 mb-1">Notes</p>
                        <p className="text-neutral-600">{registration.notes}</p>
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
                  onClick={() => handleToggleVerification(registration)}
                  className={`p-2 rounded-lg transition-colors ${
                    registration.is_verified
                      ? 'bg-warning-100 text-warning-600 hover:bg-warning-200'
                      : 'bg-success-100 text-success-600 hover:bg-success-200'
                  }`}
                  title={registration.is_verified ? 'Marquer comme non vérifié' : 'Marquer comme vérifié'}
                >
                  {registration.is_verified ? <Clock size={18} /> : <CheckCircle size={18} />}
                </button>
                <button
                  onClick={() => handleDelete(registration.id)}
                  className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  title="Supprimer l'enregistrement"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

