import { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { Users, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { LoadingSpinner } from '../shared/LoadingSpinner';

interface Stats {
  totalBeneficiaries: number;
  verifiedBeneficiaries: number;
  pendingVerification: number;
  thisMonthRegistrations: number;
}

export function AssociationStats() {
  const { profile } = useAuthStore();
  const [stats, setStats] = useState<Stats>({
    totalBeneficiaries: 0,
    verifiedBeneficiaries: 0,
    pendingVerification: 0,
    thisMonthRegistrations: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [profile?.id]);

  const loadStats = async () => {
    if (!profile?.id) return;

    try {
      setLoading(true);

      // Charger toutes les inscriptions de l'association
      const { data: registrations, error } = await supabase
        .from('association_beneficiary_registrations')
        .select('*')
        .eq('association_id', profile.id);

      if (error) throw error;

      // Calculer les statistiques
      const total = registrations?.length || 0;
      const verified = registrations?.filter(r => r.is_verified).length || 0;
      const pending = total - verified;

      // Inscriptions de ce mois
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonth = registrations?.filter(r => 
        new Date(r.registration_date) >= firstDayOfMonth
      ).length || 0;

      setStats({
        totalBeneficiaries: total,
        verifiedBeneficiaries: verified,
        pendingVerification: pending,
        thisMonthRegistrations: thisMonth,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const statCards = [
    {
      title: 'Total de bénéficiaires',
      value: stats.totalBeneficiaries,
      icon: Users,
      color: 'purple',
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      textColor: 'text-purple-600',
    },
    {
      title: 'Bénéficiaires vérifiés',
      value: stats.verifiedBeneficiaries,
      icon: CheckCircle,
      color: 'success',
      bgColor: 'bg-success-100',
      iconColor: 'text-success-600',
      textColor: 'text-success-600',
    },
    {
      title: 'En attente de vérification',
      value: stats.pendingVerification,
      icon: Clock,
      color: 'warning',
      bgColor: 'bg-warning-100',
      iconColor: 'text-warning-600',
      textColor: 'text-warning-600',
    },
    {
      title: 'Inscriptions ce mois',
      value: stats.thisMonthRegistrations,
      icon: TrendingUp,
      color: 'primary',
      bgColor: 'bg-primary-100',
      iconColor: 'text-primary-600',
      textColor: 'text-primary-600',
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in-up pb-8">
      {/* En-tête */}
      <div className="card p-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">
          Bienvenue, {profile?.business_name || profile?.full_name} !
        </h1>
        <p className="text-neutral-600">
          Voici un aperçu de vos bénéficiaires enregistrés sur la plateforme EcoPanier.
        </p>
      </div>

      {/* Grille de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="card p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon size={24} className={stat.iconColor} />
                </div>
              </div>
              <div>
                <p className="text-sm text-neutral-600 mb-1">{stat.title}</p>
                <p className={`text-3xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Informations supplémentaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* À propos de l'espace association */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">
            🎯 Votre mission
          </h2>
          <div className="space-y-3 text-sm text-neutral-700">
            <p>
              En tant qu'association partenaire d'EcoPanier, vous jouez un rôle essentiel dans :
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2">
              <li>L'enregistrement et la vérification des bénéficiaires</li>
              <li>L'accompagnement des personnes en situation de précarité</li>
              <li>La lutte contre le gaspillage alimentaire</li>
              <li>Le renforcement de la solidarité locale</li>
            </ul>
          </div>
        </div>

        {/* Guide rapide */}
        <div className="card p-6">
          <h2 className="text-lg font-bold text-neutral-900 mb-4">
            📋 Guide rapide
          </h2>
          <div className="space-y-3 text-sm text-neutral-700">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                1
              </span>
              <p>
                <strong>Enregistrer</strong> : Créez des comptes bénéficiaires pour les personnes que vous accompagnez
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                2
              </span>
              <p>
                <strong>Vérifier</strong> : Validez les informations des bénéficiaires enregistrés
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">
                3
              </span>
              <p>
                <strong>Suivre</strong> : Consultez la liste de vos bénéficiaires et leur statut
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

