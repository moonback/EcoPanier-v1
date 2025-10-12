import { useState } from 'react';
import { 
  FileText, 
  Download, 
  Calendar, 
  Filter,
  TrendingUp,
  Users,
  Package,
  DollarSign,
  Heart,
  CheckCircle,
  Clock
} from 'lucide-react';

type ReportType = 'sales' | 'users' | 'impact' | 'financial' | 'donations' | 'complete';
type ReportFormat = 'pdf' | 'csv' | 'excel';
type ReportPeriod = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

export const ReportsGenerator = () => {
  const [reportType, setReportType] = useState<ReportType>('complete');
  const [format, setFormat] = useState<ReportFormat>('pdf');
  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState('');

  const reportTypes = [
    {
      id: 'complete',
      name: 'Rapport Complet',
      description: 'Toutes les métriques et statistiques',
      icon: FileText,
      color: 'primary'
    },
    {
      id: 'sales',
      name: 'Rapport Ventes',
      description: 'Analyse des ventes et lots',
      icon: TrendingUp,
      color: 'success'
    },
    {
      id: 'users',
      name: 'Rapport Utilisateurs',
      description: 'Statistiques des utilisateurs',
      icon: Users,
      color: 'secondary'
    },
    {
      id: 'impact',
      name: 'Rapport Impact',
      description: 'Impact environnemental et social',
      icon: Package,
      color: 'success'
    },
    {
      id: 'financial',
      name: 'Rapport Financier',
      description: 'Revenus, commissions, transactions',
      icon: DollarSign,
      color: 'warning'
    },
    {
      id: 'donations',
      name: 'Rapport Solidarité',
      description: 'Paniers suspendus et dons',
      icon: Heart,
      color: 'accent'
    },
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    setSuccess('');

    try {
      // Simulation de génération
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setSuccess(`Rapport ${reportTypes.find(r => r.id === reportType)?.name} généré avec succès ! 📄`);
      
      // Simulation de téléchargement
      console.log(`Génération du rapport: ${reportType} au format ${format} pour la période ${period}`);
      
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      console.error('Erreur lors de la génération:', err);
    } finally {
      setGenerating(false);
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; text: string; border: string }> = {
      primary: { bg: 'bg-primary-100', text: 'text-primary-600', border: 'border-primary-300' },
      success: { bg: 'bg-success-100', text: 'text-success-600', border: 'border-success-300' },
      secondary: { bg: 'bg-secondary-100', text: 'text-secondary-600', border: 'border-secondary-300' },
      warning: { bg: 'bg-warning-100', text: 'text-warning-600', border: 'border-warning-300' },
      accent: { bg: 'bg-accent-100', text: 'text-accent-600', border: 'border-accent-300' },
    };
    return colorMap[color] || colorMap.primary;
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Success Message */}
      {success && (
        <div className="p-4 bg-success-50 border-2 border-success-200 rounded-xl text-success-700 font-semibold animate-fade-in">
          {success}
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
          <FileText size={32} className="text-primary-600" />
          Générateur de Rapports
        </h2>
        <p className="text-neutral-600 mt-2 font-medium">
          Créez des rapports personnalisés pour analyser vos données
        </p>
      </div>

      {/* Report Type Selection */}
      <div>
        <h3 className="text-lg font-bold text-neutral-900 mb-4">
          Type de rapport
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTypes.map((type) => {
            const Icon = type.icon;
            const colors = getColorClasses(type.color);
            const isSelected = reportType === type.id;
            return (
              <button
                key={type.id}
                onClick={() => setReportType(type.id as ReportType)}
                className={`card p-6 text-left hover-lift transition-all ${
                  isSelected 
                    ? `border-2 ${colors.border} ${colors.bg}` 
                    : 'border-2 border-neutral-200'
                }`}
              >
                <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center mb-4 ${
                  isSelected ? 'scale-110' : ''
                } transition-transform`}>
                  <Icon size={24} className={colors.text} />
                </div>
                <h4 className="font-bold text-neutral-900 mb-1">{type.name}</h4>
                <p className="text-sm text-neutral-600 font-medium">{type.description}</p>
                {isSelected && (
                  <div className="mt-3 flex items-center gap-2">
                    <CheckCircle size={16} className={colors.text} />
                    <span className={`text-sm font-semibold ${colors.text}`}>Sélectionné</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Configuration */}
      <div className="card p-8">
        <h3 className="text-xl font-bold text-neutral-900 mb-6">Configuration du rapport</h3>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Period Selection */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Période
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
                className="input-icon"
              >
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
                <option value="quarter">Ce trimestre</option>
                <option value="year">Cette année</option>
                <option value="custom">Personnalisé</option>
              </select>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Format
            </label>
            <div className="relative">
              <Download className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as ReportFormat)}
                className="input-icon"
              >
                <option value="pdf">📄 PDF</option>
                <option value="csv">📊 CSV</option>
                <option value="excel">📗 Excel</option>
              </select>
            </div>
          </div>

          {/* Custom Date Range */}
          {period === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="input"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="card p-8 bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200">
        <h3 className="text-xl font-bold text-neutral-900 mb-4">Aperçu du rapport</h3>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4">
            <div className="text-sm font-semibold text-neutral-600 mb-1">Type</div>
            <div className="font-bold text-neutral-900">
              {reportTypes.find(r => r.id === reportType)?.name}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4">
            <div className="text-sm font-semibold text-neutral-600 mb-1">Période</div>
            <div className="font-bold text-neutral-900">
              {period === 'today' && 'Aujourd\'hui'}
              {period === 'week' && 'Cette semaine'}
              {period === 'month' && 'Ce mois'}
              {period === 'quarter' && 'Ce trimestre'}
              {period === 'year' && 'Cette année'}
              {period === 'custom' && `${startDate} → ${endDate}`}
            </div>
          </div>
          <div className="bg-white rounded-xl p-4">
            <div className="text-sm font-semibold text-neutral-600 mb-1">Format</div>
            <div className="font-bold text-neutral-900 uppercase">{format}</div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || (period === 'custom' && (!startDate || !endDate))}
          className="btn-primary w-full rounded-xl text-lg"
        >
          {generating ? (
            <>
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
              <span>Génération en cours...</span>
              <Clock size={20} className="animate-pulse" />
            </>
          ) : (
            <>
              <Download size={20} />
              <span>Générer et télécharger le rapport</span>
            </>
          )}
        </button>
      </div>

      {/* Scheduled Reports */}
      <div className="card p-8">
        <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
          <Clock size={24} className="text-secondary-600" />
          Rapports Programmés
        </h3>
        
        <p className="text-neutral-600 mb-6 font-medium">
          Planifiez l'envoi automatique de rapports par email à intervalles réguliers
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
                <TrendingUp size={24} className="text-success-600" />
              </div>
              <div>
                <div className="font-semibold text-neutral-900 mb-1">Rapport mensuel des ventes</div>
                <div className="text-sm text-neutral-600 font-medium">
                  Envoyé le 1er de chaque mois à 9h00
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-neutral-300 peer-focus:ring-4 peer-focus:ring-success-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-success-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Users size={24} className="text-primary-600" />
              </div>
              <div>
                <div className="font-semibold text-neutral-900 mb-1">Rapport hebdomadaire utilisateurs</div>
                <div className="text-sm text-neutral-600 font-medium">
                  Envoyé chaque lundi à 8h00
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-neutral-300 peer-focus:ring-4 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                <Heart size={24} className="text-accent-600" />
              </div>
              <div>
                <div className="font-semibold text-neutral-900 mb-1">Rapport impact social</div>
                <div className="text-sm text-neutral-600 font-medium">
                  Envoyé chaque trimestre
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-neutral-300 peer-focus:ring-4 peer-focus:ring-accent-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-600"></div>
            </label>
          </div>
        </div>

        <div className="mt-6">
          <button className="btn-outline rounded-xl w-full">
            <Calendar size={20} />
            <span>Configurer nouveaux rapports programmés</span>
          </button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="card p-8">
        <h3 className="text-xl font-bold text-neutral-900 mb-6 flex items-center gap-2">
          <FileText size={24} className="text-neutral-600" />
          Rapports Récents
        </h3>

        <div className="space-y-3">
          {[
            { name: 'Rapport_Ventes_Octobre_2025.pdf', date: '2025-10-12 09:30', size: '2.4 MB', type: 'sales' },
            { name: 'Rapport_Utilisateurs_Semaine41.csv', date: '2025-10-09 08:00', size: '156 KB', type: 'users' },
            { name: 'Rapport_Impact_Q3_2025.pdf', date: '2025-10-01 10:00', size: '3.8 MB', type: 'impact' },
            { name: 'Rapport_Financier_Septembre.xlsx', date: '2025-09-30 17:00', size: '892 KB', type: 'financial' },
          ].map((report, index) => {
            const reportTypeData = reportTypes.find(r => r.id === report.type);
            const Icon = reportTypeData?.icon || FileText;
            const colors = getColorClasses(reportTypeData?.color || 'primary');

            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200 hover-lift"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center`}>
                    <Icon size={24} className={colors.text} />
                  </div>
                  <div>
                    <div className="font-semibold text-neutral-900">{report.name}</div>
                    <div className="text-sm text-neutral-600 font-medium flex items-center gap-3">
                      <span>{report.date}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                    </div>
                  </div>
                </div>
                <button className="btn-outline rounded-xl">
                  <Download size={20} />
                  <span>Télécharger</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Box */}
      <div className="card p-6 bg-gradient-to-br from-warning-50 to-warning-100 border-2 border-warning-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-warning-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <FileText size={24} className="text-white" />
          </div>
          <div>
            <h4 className="font-bold text-neutral-900 mb-2">💡 Astuce</h4>
            <p className="text-neutral-700 font-medium">
              Les rapports complets incluent toutes les métriques, graphiques et analyses détaillées. 
              Pour des rapports plus rapides, sélectionnez un type spécifique (ventes, utilisateurs, etc.).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

