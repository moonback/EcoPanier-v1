import { CheckCircle, Clock, FileText, Users } from 'lucide-react';

import type { AssociationQuickStats } from '../../../hooks/useAssociationQuickStats';

interface AssociationQuickStatsProps {
  stats: AssociationQuickStats;
  loading: boolean;
  className?: string;
}

export function AssociationQuickStats({ stats, loading, className = '' }: AssociationQuickStatsProps) {
  const formattedValue = (value: number) => (loading ? '...' : value);

  return (
    <div className={`hidden lg:flex items-center gap-3 ${className}`}>
      {stats.totalBeneficiaries > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary-50 rounded-lg border border-secondary-200 hover:shadow-md transition-shadow">
          <Users size={16} className="text-secondary-600" />
          <div className="flex flex-col">
            <span className="text-[10px] text-secondary-600 font-medium">Total</span>
            <span className="text-sm font-bold text-secondary-700">{formattedValue(stats.totalBeneficiaries)}</span>
          </div>
        </div>
      )}

      {stats.verifiedBeneficiaries > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-success-50 rounded-lg border border-success-200 hover:shadow-md transition-shadow">
          <CheckCircle size={16} className="text-success-600" />
          <div className="flex flex-col">
            <span className="text-[10px] text-success-600 font-medium">Vérifiés</span>
            <span className="text-sm font-bold text-success-700">{formattedValue(stats.verifiedBeneficiaries)}</span>
          </div>
        </div>
      )}

      {stats.pendingVerification > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-warning-50 rounded-lg border border-warning-200 hover:shadow-md transition-shadow">
          <Clock size={16} className="text-warning-600" />
          <div className="flex flex-col">
            <span className="text-[10px] text-warning-600 font-medium">En attente</span>
            <span className="text-sm font-bold text-warning-700">{formattedValue(stats.pendingVerification)}</span>
          </div>
        </div>
      )}

      {stats.thisMonthRegistrations > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg border border-primary-200 hover:shadow-md transition-shadow">
          <FileText size={16} className="text-primary-600" />
          <div className="flex flex-col">
            <span className="text-[10px] text-primary-600 font-medium">Ce mois</span>
            <span className="text-sm font-bold text-primary-700">{formattedValue(stats.thisMonthRegistrations)}</span>
          </div>
        </div>
      )}
    </div>
  );
}


