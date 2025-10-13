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
    <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg transition-all">
      <div className="flex items-center gap-4 mb-3">
        <div className={`${color} p-3 rounded-xl flex-shrink-0`}>
          <Icon size={20} className="text-white" strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-gray-600 font-light">{title}</p>
          <p className="text-3xl font-bold text-black truncate">
            {value}
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-600 font-light">{description}</p>
    </div>
  );
}

