import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';
import { Download, FileText, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

interface BeneficiaryExportData {
  id: string;
  beneficiary_id: string | null;
  full_name: string;
  phone: string | null;
  address: string | null;
  registration_date: string;
  is_verified: boolean;
  notes: string | null;
  total_reservations: number;
  last_activity: string | null;
}

export function ExportData() {
  const { user, profile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryExportData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchBeneficiaries();
    }
  }, [user]);

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: registrations, error: regError } = await supabase
        .from('association_beneficiary_registrations')
        .select(`
          beneficiary_id,
          registration_date,
          is_verified,
          notes,
          profiles!association_beneficiary_registrations_beneficiary_id_fkey (
            id,
            beneficiary_id,
            full_name,
            phone,
            address
          )
        `)
        .eq('association_id', user!.id)
        .order('registration_date', { ascending: false });

      if (regError) throw regError;

      // Pour chaque bénéficiaire, compter ses réservations
      const beneficiariesData: BeneficiaryExportData[] = [];

      for (const reg of registrations || []) {
        const beneficiaryProfile = (reg as any).profiles;

        // Compter les réservations
        const { count, error: countError } = await supabase
          .from('reservations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', beneficiaryProfile.id)
          .eq('is_donation', true);

        if (countError) {
          console.error('Erreur comptage réservations:', countError);
        }

        // Dernière activité
        const { data: lastReservation } = await supabase
          .from('reservations')
          .select('created_at')
          .eq('user_id', beneficiaryProfile.id)
          .eq('is_donation', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        beneficiariesData.push({
          id: beneficiaryProfile.id,
          beneficiary_id: beneficiaryProfile.beneficiary_id,
          full_name: beneficiaryProfile.full_name,
          phone: beneficiaryProfile.phone,
          address: beneficiaryProfile.address,
          registration_date: (reg as any).registration_date,
          is_verified: (reg as any).is_verified,
          notes: (reg as any).notes,
          total_reservations: count || 0,
          last_activity: lastReservation?.created_at || null,
        });
      }

      setBeneficiaries(beneficiariesData);
    } catch (err) {
      console.error('Erreur lors de la récupération des données:', err);
      setError('Impossible de charger les données à exporter.');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    try {
      setSuccess(false);
      
      // En-têtes du CSV
      const headers = [
        'ID Bénéficiaire',
        'Nom complet',
        'Téléphone',
        'Adresse',
        'Date d\'enregistrement',
        'Statut',
        'Total réservations',
        'Dernière activité',
        'Notes',
      ];

      // Données
      const rows = beneficiaries.map(b => [
        b.beneficiary_id || 'N/A',
        b.full_name,
        b.phone || 'N/A',
        b.address || 'N/A',
        formatDate(b.registration_date),
        b.is_verified ? 'Vérifié' : 'En attente',
        b.total_reservations.toString(),
        b.last_activity ? formatDate(b.last_activity) : 'Jamais',
        b.notes ? `"${b.notes.replace(/"/g, '""')}"` : 'N/A',
      ]);

      // Construire le CSV
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(',')),
      ].join('\n');

      // Ajouter le BOM pour UTF-8
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

      // Télécharger
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().split('T')[0];
      const associationName = profile?.business_name?.replace(/[^a-z0-9]/gi, '_') || 'association';
      
      link.setAttribute('href', url);
      link.setAttribute('download', `beneficiaires_${associationName}_${timestamp}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Erreur lors de l\'export CSV:', err);
      setError('Erreur lors de l\'export. Veuillez réessayer.');
    }
  };

  const exportToJSON = () => {
    try {
      setSuccess(false);
      
      const exportData = {
        association: {
          name: profile?.business_name,
          export_date: new Date().toISOString(),
        },
        beneficiaries: beneficiaries.map(b => ({
          beneficiary_id: b.beneficiary_id,
          full_name: b.full_name,
          phone: b.phone,
          address: b.address,
          registration_date: b.registration_date,
          is_verified: b.is_verified,
          total_reservations: b.total_reservations,
          last_activity: b.last_activity,
          notes: b.notes,
        })),
        total_count: beneficiaries.length,
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      const timestamp = new Date().toISOString().split('T')[0];
      const associationName = profile?.business_name?.replace(/[^a-z0-9]/gi, '_') || 'association';
      
      link.setAttribute('href', url);
      link.setAttribute('download', `beneficiaires_${associationName}_${timestamp}.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Erreur lors de l\'export JSON:', err);
      setError('Erreur lors de l\'export. Veuillez réessayer.');
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-xl">
            <Download size={28} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Export de données</h2>
            <p className="text-neutral-600 mt-1">
              Exportez la liste de vos bénéficiaires pour vos rapports
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-success-50 border border-success-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle size={20} className="text-success-600" />
          <p className="text-success-800 font-medium">
            Export réussi ! Le fichier a été téléchargé.
          </p>
        </div>
      )}

      {error && (
        <div className="bg-accent-50 border border-accent-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle size={20} className="text-accent-600" />
          <p className="text-accent-800">{error}</p>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FileText size={20} className="text-purple-600" />
            </div>
            <p className="text-sm text-neutral-600">Bénéficiaires totaux</p>
          </div>
          <p className="text-3xl font-bold text-neutral-900">{beneficiaries.length}</p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-success-100 rounded-lg">
              <CheckCircle size={20} className="text-success-600" />
            </div>
            <p className="text-sm text-neutral-600">Vérifiés</p>
          </div>
          <p className="text-3xl font-bold text-neutral-900">
            {beneficiaries.filter(b => b.is_verified).length}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-neutral-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Calendar size={20} className="text-primary-600" />
            </div>
            <p className="text-sm text-neutral-600">Actifs ce mois</p>
          </div>
          <p className="text-3xl font-bold text-neutral-900">
            {beneficiaries.filter(b => {
              if (!b.last_activity) return false;
              const lastActivity = new Date(b.last_activity);
              const thisMonth = new Date();
              return lastActivity.getMonth() === thisMonth.getMonth() && 
                     lastActivity.getFullYear() === thisMonth.getFullYear();
            }).length}
          </p>
        </div>
      </div>

      {/* Options d'export */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">
          Choisissez un format d'export
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Export CSV */}
          <button
            onClick={exportToCSV}
            disabled={loading || beneficiaries.length === 0}
            className="flex items-start gap-4 p-6 border-2 border-neutral-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="p-3 bg-success-100 rounded-lg group-hover:bg-success-200 transition-colors">
              <FileText size={24} className="text-success-600" />
            </div>
            <div className="text-left flex-1">
              <h4 className="font-semibold text-neutral-900 mb-1">
                Export CSV
              </h4>
              <p className="text-sm text-neutral-600">
                Format compatible Excel, Google Sheets et LibreOffice
              </p>
              <p className="text-xs text-neutral-500 mt-2">
                Inclut : ID, nom, contact, statut, activité, notes
              </p>
            </div>
          </button>

          {/* Export JSON */}
          <button
            onClick={exportToJSON}
            disabled={loading || beneficiaries.length === 0}
            className="flex items-start gap-4 p-6 border-2 border-neutral-200 rounded-lg hover:border-purple-600 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
              <Download size={24} className="text-primary-600" />
            </div>
            <div className="text-left flex-1">
              <h4 className="font-semibold text-neutral-900 mb-1">
                Export JSON
              </h4>
              <p className="text-sm text-neutral-600">
                Format structuré pour traitement informatique
              </p>
              <p className="text-xs text-neutral-500 mt-2">
                Données complètes avec métadonnées
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Informations */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle size={20} className="text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Informations importantes :</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>Les données exportées sont conformes au RGPD</li>
              <li>Conservez les fichiers exportés de manière sécurisée</li>
              <li>Le nom du fichier inclut la date d'export</li>
              <li>Les exports CSV utilisent l'encodage UTF-8 avec BOM</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

