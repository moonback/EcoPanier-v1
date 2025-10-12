import type { LucideIcon } from 'lucide-react';

interface ImpactCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  color: string;
  description: string;
}

/**
 * Composant carte pour afficher une métrique d'impact
 * Affiche une statistique d'impact environnemental ou social
 */
export function ImpactCard({
  title,
  value,
  icon: Icon,
  color,
  description,
}: ImpactCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 hover:shadow-lg transition-all hover-lift">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className={`${color} p-2.5 sm:p-3 rounded-lg flex-shrink-0`}>
          <Icon size={20} className="sm:w-6 sm:h-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm text-gray-600 truncate">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-800 truncate">
            {value}
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2 sm:mt-3">{description}</p>
    </div>
  );
}

